console.log("checkout1.js");

const db = firebase.firestore();
const storageService = firebase.storage();

let CHECKOUT_ID, USER_ID, USER_DETAILS, PROD_DETAILS, ADDONS_DETAILS;
const bpHTML = document.querySelector("#bp");
const gstHTML = document.querySelector("#gst");
const checkoutTotalHTML = document.querySelector("#checkout-total");
let USER_REF, PROD_REF, ADDON_REF;
let TOTAL_COST = 0;

if (localStorage.getItem("locLoggedInUser") == "null") {
  window.location.href = "./../Auth/login.html";
} else {
  var getParams = async (url) => {
    var params = {};
    var parser = document.createElement("a");
    parser.href = url;
    var query = parser.search.substring(1);
    var vars = query.split("&&");
    for (var i = 0; i < vars.length; i++) {
      var pair = vars[i].split("=");
      params[pair[0]] = decodeURIComponent(pair[1]);
    }
    return params;
  };

  getParams(window.location.href).then(async (response) => {
    // console.log(response);
    CHECKOUT_ID = response.checkout;
    // console.log(CHECKOUT_ID);
    if (!CHECKOUT_ID) {
      window.location.href = "./../Auth/login.html";
    } else {
      USER_ID = localStorage.getItem("locLoggedInUser");
      displayDetails1();
    }
  });
}

let INDEX = -1;
const displayDetails1 = async () => {
  // console.log(USER_ID);
  USER_REF = await db.collection("Customers").doc(USER_ID);
  await USER_REF.get().then((doc) => {
    let docData = doc.data();
    USER_DETAILS = docData;
    // console.log(USER_DETAILS);
  });
  // console.log(USER_DETAILS);
  for (let o of USER_DETAILS.orders) {
    INDEX++;
    if (o.id === CHECKOUT_ID) {
      break;
    }
  }
  // console.log(USER_DETAILS.orders[INDEX].cat);

  PROD_REF = await db
    .collection(USER_DETAILS.orders[INDEX].cat)
    .doc(USER_DETAILS.orders[INDEX].prodId);
  await PROD_REF.get().then((doc) => {
    let docData = doc.data();
    PROD_DETAILS = docData;
    // console.log(PROD_DETAILS);
  });

  if (USER_DETAILS.orders[INDEX].addAddons.length > 0) {
    ADDON_REF = db.collection("addons");
    await ADDON_REF.get().then((snapshots) => {
      let snapshotDocs = snapshots.docs;
      ADDONS_DETAILS = snapshotDocs;
    });
  }
  calculatePricing();
};

const extraPriceHTML = document.querySelector("#extra-price");
const discountCostHTML = document.querySelector("#discount-cost");
const addonCostHTML = document.querySelector("#addon-cost");
const discountHTML = document.querySelector("#discount");
const costHTML = document.querySelector("#cost");
const finalCostHTML = document.querySelector('#final-cost');
let basicPriceCost = 0;

const calculatePricing = (discount = 0) => {
  TOTAL_COST = 0;
  let li = "";
  TOTAL_COST = +parseFloat(TOTAL_COST).toFixed(2);

  if (USER_DETAILS.orders[INDEX].heart) {
    // console.log(USER_DETAILS.orders[INDEX].heart);
    TOTAL_COST =
      TOTAL_COST +
      +PROD_DETAILS.shapes[0].shapePrice * +USER_DETAILS.orders[INDEX].qty;
    TOTAL_COST = +parseFloat(TOTAL_COST).toFixed(2);
    li += `
    <li>
      <p>
        Heart Shape
      </p>
      <P>
        <b class="bp" id="bp">+ ₹ ${PROD_DETAILS.shapes[0].shapePrice} * ${USER_DETAILS.orders[INDEX].qty}</b>
      </P>
    </li>
    `;
  }

  if (USER_DETAILS.orders[INDEX].eggless) {
    // console.log(USER_DETAILS.orders[INDEX].eggless);
    TOTAL_COST =
      TOTAL_COST + +PROD_DETAILS.type.price * +USER_DETAILS.orders[INDEX].qty;
    TOTAL_COST = +parseFloat(TOTAL_COST).toFixed(2);
    li += `
    <li>
      <p>
        Eggless
      </p>
      <P>
        <b class="bp" id="bp">+ ₹ ${PROD_DETAILS.type.price} * ${USER_DETAILS.orders[INDEX].qty}</b>
      </P>
    </li>
    `;
  }
  extraPriceHTML.innerHTML = li;

  if (USER_DETAILS.orders[INDEX].pricing.weight) {
    for (let weight of PROD_DETAILS.weights) {
      if (weight.cakeWeight === USER_DETAILS.orders[INDEX].pricing.weight) {
        TOTAL_COST =
          TOTAL_COST + +weight.weightPrice * +USER_DETAILS.orders[INDEX].qty;
        TOTAL_COST = +parseFloat(TOTAL_COST).toFixed(2);
        bpHTML.innerHTML = ` ₹ ${weight.weightPrice} * ${USER_DETAILS.orders[INDEX].qty}`;
        break;
      }
    }
  } else {
    TOTAL_COST = TOTAL_COST + +PROD_DETAILS.sp;
    TOTAL_COST = +parseFloat(TOTAL_COST).toFixed(2);
  }

  basicPriceCost = TOTAL_COST;

  discountHTML.innerHTML = "";
  discountHTML.innerHTML = `- ₹ ${discount}`;
  TOTAL_COST = TOTAL_COST - +discount;
  TOTAL_COST = +parseFloat(TOTAL_COST).toFixed(2);
  discountCostHTML.innerHTML = `₹ ${TOTAL_COST}`;

  let gst = +parseFloat(TOTAL_COST * (+PROD_DETAILS.gst / 100)).toFixed(2);
  gstHTML.innerHTML = `+ ₹ ${gst} (${PROD_DETAILS.gst}%)`;
  TOTAL_COST = TOTAL_COST + gst;
  TOTAL_COST = +parseFloat(TOTAL_COST).toFixed(2);

  let addonCost = 0;
  if (USER_DETAILS.orders[INDEX].addAddons.length > 0) {
    USER_DETAILS.orders[INDEX].addAddons.map((addon) => {
      for (let add of ADDONS_DETAILS) {
        if (add.id === addon.id) {
          addonCost = addonCost + +add.data().price * +addon.qty;
        }
      }
    });
    addonCostHTML.innerHTML = `+ ₹ ${addonCost}`;
  } else {
    addonCostHTML.innerHTML = `+ ₹ ${addonCost}`;
  }

  TOTAL_COST = Math.round(TOTAL_COST + addonCost);
  TOTAL_COST = +parseFloat(TOTAL_COST).toFixed(2);
  costHTML.innerHTML = `₹ ${TOTAL_COST}`;

  finalCostHTML.innerHTML = `₹ ${TOTAL_COST}`;

};

const coupanApplyHTML = document.querySelector("#coupanApply");

const checkCoupon = async (e) => {
  let coupanDetails, coupanId;
  let flag = false;
  // const code = checkCouponFormHTML['code'].value;
  const code = document.querySelector("#code").value;
  let coupanRef = await db.collection("coupans");
  await coupanRef.get().then((snapshots) => {
    let snapshotDocs = snapshots.docs;
    for (let doc of snapshotDocs) {
      let docData = doc.data();
      if (docData.name === code) {
        coupanDetails = docData;
        coupanId = coupanId;
        flag = true;
        break;
      }
    }
  });

  if (flag) {
    console.log("flag", coupanDetails);
    // add snackbar
    let cType, cAmt, discount;
    if (coupanDetails.category === "percentage") {
      cType = "percentage";
      cAmt = coupanDetails.amount;

      discount = +basicPriceCost * (+cAmt / 100);
    } else {
      cType = "price";
      cAmt = coupanDetails.amount;
      discount = +cAmt;
    }
    console.log(discount, typeof discount);
    calculatePricing(discount);
    coupanApplyHTML.disable = true;
    document.querySelector("#code").disabled = true;
  } else {
    // invalid
  }
};

coupanApplyHTML.addEventListener("click", checkCoupon);

const form1ShippingHTML = document.querySelector("#form1-shipping");
const SHIPPING_DATA = {};
const form1 = (e) => {
  e.preventDefault();

  const name = form1ShippingHTML["name"].value;
  const phone = form1ShippingHTML["phone"].value;
  const email = form1ShippingHTML["email"].value;
  const address = form1ShippingHTML["address"].value;
  const landmark = form1ShippingHTML["landmark"].value;
  const customer_country = form1ShippingHTML["customer_country"].value;
  const city = form1ShippingHTML["city"].value;
  const zip = form1ShippingHTML["zip"].value;

  const shipDiffAddress = form1ShippingHTML.querySelector("#ship-diff-address");
  if (shipDiffAddress.checked) {
    shipping_name = form1ShippingHTML["shipping_name"].value;
    shipping_phone = form1ShippingHTML["shipping_phone"].value;
    shipping_address = form1ShippingHTML["shipping_address"].value;
    shipping_landmark = form1ShippingHTML["shipping_landmark"].value;
    shipping_country = form1ShippingHTML["shipping_country"].value;
    shipping_city = form1ShippingHTML["shipping_city"].value;
    shipping_zip = form1ShippingHTML["shipping_zip"].value;
  }
  const order_notes = form1ShippingHTML["order_notes"].value;
  setDateAndTime();
  $("#myModal1").modal("show");

  SHIPPING_DATA.name = name;
  SHIPPING_DATA.phone = phone;
  SHIPPING_DATA.email = email;
  SHIPPING_DATA.address = address;
  SHIPPING_DATA.landmark = landmark;
  SHIPPING_DATA.country = customer_country;
  SHIPPING_DATA.city = city;
  SHIPPING_DATA.zip = zip;

  if (shipDiffAddress.checked) {
    SHIPPING_DATA.differtAddress = true;
    SHIPPING_DATA.alt_name = shipping_name;
    SHIPPING_DATA.alt_phone = shipping_phone; 
    SHIPPING_DATA.alt_address = shipping_address;
    SHIPPING_DATA.alt_landmark = shipping_landmark;
    SHIPPING_DATA.alt_country = shipping_country;
    SHIPPING_DATA.alt_city = shipping_city;
    SHIPPING_DATA.alt_zip = shipping_zip; 
  } else {
    SHIPPING_DATA.differtAddress = false;
  }
};

form1ShippingHTML.addEventListener("submit", form1);

let packingAreaHTML = document.querySelector(".packeging-area");
const shippingDateHTML = document.querySelector("#shipping_date");
const freeHoursHTML = document.querySelector("#free-hours");
const perfectHoursHTML = document.querySelector("#perfect-hours");
const midnightHoursHTML = document.querySelector("#midnight-hours");
const timeErrorHTML = document.querySelector("#time-error");

let shippingType;
const date = new Date();
let year = date.getFullYear();
let month = date.getMonth() + 1;
let day = date.getDate();
let hours = date.getHours();

const setDateAndTime = () => {
  // console.log(SHIPPING_DATA);
  $("input[type=date]").val("")
  // hours = 19;
  shippingDateHTML.setAttribute("min", `${year}-${month}-${day}`);

  let shipVal = packingAreaHTML.querySelector('input[name="shipping"]:checked')
    .value;
  shippingType = shipVal;

  console.log(shipVal);
  if (shipVal === "free") {
    
    shippingDateHTML.setAttribute("value", `${year}-${month}-${day}`);
    // console.log(hours);
    perfectHoursHTML.style.display = "none";
    midnightHoursHTML.style.display = "none";
    freeHoursHTML.style.display = "none";
    timeErrorHTML.style.display = "none";

    if (hours < 17) {
      // shippingDateHTML.setAttribute("value", `${year}-${month}-${day}`);
      shippingDateHTML.value = `${year}-${month}-${day}`;
      freeHoursHTML.style.display = "block";
    } else {
      // console.log('book for next day');
      shippingDateHTML.setAttribute("min", `${year}-${month}-${day + 1}`);
      timeErrorHTML.style.display = "block";
    }
  } else if (shipVal === "perfect") {
    shippingDateHTML.value = `${year}-${month}-${day}`;
    // console.log("perfect");
    freeHoursHTML.style.display = "none";
    midnightHoursHTML.style.display = "none";
    perfectHoursHTML.style.display = "none";
    timeErrorHTML.style.display = "none";
    if (hours < 20) {
      perfectHoursHTML.style.display = "block";
      shippingDateHTML.value = `${year}-${month}-${day}`;
      if (hours < 8) {
      } else if (hours < 9) {
        document.querySelector("#perfect_10").disabled = true;
      } else if (hours < 10) {
        document.querySelector("#perfect_10").disabled = true;
        document.querySelector("#perfect_11").disabled = true;
      } else if (hours < 11) {
        document.querySelector("#perfect_10").disabled = true;
        document.querySelector("#perfect_11").disabled = true;
        document.querySelector("#perfect_12").disabled = true;
      } else if (hours < 12) {
        document.querySelector("#perfect_10").disabled = true;
        document.querySelector("#perfect_11").disabled = true;
        document.querySelector("#perfect_12").disabled = true;
        document.querySelector("#perfect_1").disabled = true;
      } else if (hours < 13) {
        document.querySelector("#perfect_10").disabled = true;
        document.querySelector("#perfect_11").disabled = true;
        document.querySelector("#perfect_12").disabled = true;
        document.querySelector("#perfect_1").disabled = true;
        document.querySelector("#perfect_2").disabled = true;
      } else if (hours < 14) {
        document.querySelector("#perfect_10").disabled = true;
        document.querySelector("#perfect_11").disabled = true;
        document.querySelector("#perfect_12").disabled = true;
        document.querySelector("#perfect_1").disabled = true;
        document.querySelector("#perfect_2").disabled = true;
        document.querySelector("#perfect_3").disabled = true;
      } else if (hours < 15) {
        document.querySelector("#perfect_10").disabled = true;
        document.querySelector("#perfect_11").disabled = true;
        document.querySelector("#perfect_12").disabled = true;
        document.querySelector("#perfect_1").disabled = true;
        document.querySelector("#perfect_2").disabled = true;
        document.querySelector("#perfect_3").disabled = true;
        document.querySelector("#perfect_4").disabled = true;
      } else if (hours < 16) {
        document.querySelector("#perfect_10").disabled = true;
        document.querySelector("#perfect_11").disabled = true;
        document.querySelector("#perfect_12").disabled = true;
        document.querySelector("#perfect_1").disabled = true;
        document.querySelector("#perfect_2").disabled = true;
        document.querySelector("#perfect_3").disabled = true;
        document.querySelector("#perfect_4").disabled = true;
        document.querySelector("#perfect_5").disabled = true;
      } else if (hours < 18) {
        document.querySelector("#perfect_10").disabled = true;
        document.querySelector("#perfect_11").disabled = true;
        document.querySelector("#perfect_12").disabled = true;
        document.querySelector("#perfect_1").disabled = true;
        document.querySelector("#perfect_2").disabled = true;
        document.querySelector("#perfect_3").disabled = true;
        document.querySelector("#perfect_4").disabled = true;
        document.querySelector("#perfect_5").disabled = true;
        document.querySelector("#perfect_7").disabled = true;
      } else if (hours < 19) {
        document.querySelector("#perfect_10").disabled = true;
        document.querySelector("#perfect_11").disabled = true;
        document.querySelector("#perfect_12").disabled = true;
        document.querySelector("#perfect_1").disabled = true;
        document.querySelector("#perfect_2").disabled = true;
        document.querySelector("#perfect_3").disabled = true;
        document.querySelector("#perfect_4").disabled = true;
        document.querySelector("#perfect_5").disabled = true;
        document.querySelector("#perfect_7").disabled = true;
        document.querySelector("#perfect_8").disabled = true;
      } else if (hours < 20) {
        document.querySelector("#perfect_10").disabled = true;
        document.querySelector("#perfect_11").disabled = true;
        document.querySelector("#perfect_12").disabled = true;
        document.querySelector("#perfect_1").disabled = true;
        document.querySelector("#perfect_2").disabled = true;
        document.querySelector("#perfect_3").disabled = true;
        document.querySelector("#perfect_4").disabled = true;
        document.querySelector("#perfect_5").disabled = true;
        document.querySelector("#perfect_7").disabled = true;
        document.querySelector("#perfect_8").disabled = true;
      } else {
        console.log('invalid');
      }
    } else {
      shippingDateHTML.setAttribute("min", `${year}-${month}-${day + 1}`);
      timeErrorHTML.style.display = "block";
    }
  } else if (shipVal === "midnight") {
    finalCostHTML.innerHTML = ``
    shippingDateHTML.value = `${year}-${month}-${day}`;
    freeHoursHTML.style.display = "none";
    midnightHoursHTML.style.display = "none";
    perfectHoursHTML.style.display = "none";
    timeErrorHTML.style.display = "none";

    if (hours < 20) {
      midnightHoursHTML.style.display = "block";
      shippingDateHTML.value = `${year}-${month}-${day}`;
    } else {
      shippingDateHTML.setAttribute("min", `${year}-${month}-${day + 1}`);
      timeErrorHTML.style.display = "block";
    }
  } else {
    console.log("invalid");
  }
};

const changeDate = (e) => {
  // console.log(e.target.value);
  let orderDate = e.target.value;
  // console.log(orderDate);
  let [y, m, d] = orderDate.split("-");
  console.log(y, m, d);
  if (+y === +year && +m === +month && +d === +day) {
    setDateAndTime();
  } else {
    if (shippingType === "free") {
      freeHoursHTML.style.display = "block";
      midnightHoursHTML.style.display = "none";
      perfectHoursHTML.style.display = "none";
      timeErrorHTML.style.display = "none";
    } else if (shippingType === "perfect") {
      freeHoursHTML.style.display = "none";
      midnightHoursHTML.style.display = "none";
      perfectHoursHTML.style.display = "block";
      timeErrorHTML.style.display = "none";
      document.querySelector("#perfect_10").disabled = false;
      document.querySelector("#perfect_11").disabled = false;
      document.querySelector("#perfect_12").disabled = false;
      document.querySelector("#perfect_1").disabled = false;
      document.querySelector("#perfect_2").disabled = false;
      document.querySelector("#perfect_3").disabled = false;
      document.querySelector("#perfect_4").disabled = false;
      document.querySelector("#perfect_5").disabled = false;
      document.querySelector("#perfect_7").disabled = false;
      document.querySelector("#perfect_8").disabled = false;
      document.querySelector("#perfect_9").disabled = false;
    } else if (shippingType === "midnight") {
      freeHoursHTML.style.display = "none";
      midnightHoursHTML.style.display = "block";
      perfectHoursHTML.style.display = "none";
      timeErrorHTML.style.display = "none";
    } else {
      console.log("invalid");
    }
  }
};

shippingDateHTML.addEventListener("change", changeDate);


document.querySelectorAll('input[name=shipping]').forEach(el => {
  el.addEventListener('change', e => {
    console.log(e.target.value);
    if(e.target.value === 'free') {
      finalCostHTML.innerHTML = `₹ ${TOTAL_COST}`;
    } else if(e.target.value === 'perfect') {
      let temp = TOTAL_COST + 150; 
      finalCostHTML.innerHTML = `₹ ${temp}`;
    } else if(e.target.value === 'midnight') {
      let temp = TOTAL_COST + 200;
      finalCostHTML.innerHTML = `₹ ${temp}`;
    } else {
      console.log('invalid');
    }
  })
})