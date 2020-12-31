// console.log("checkout1.js");

const db = firebase.firestore();
const storageService = firebase.storage();
const APPLY_STATUS = true;
let CHECKOUT_ID, USER_ID, USER_DETAILS, USER_REF, ADDON_REF, ADDONS_DETAILS;
let TOTAL_COST = 0;
let INDEX = -1;
const prodDetails = [];
const prodRefs = [];
let MAX_DAYS = 0;
let MAX_HOURS = 0;

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
    CHECKOUT_ID = response.checkout;
    if (!CHECKOUT_ID) {
      window.location.href = "./../Auth/login.html";
    } else {
      USER_ID = localStorage.getItem("locLoggedInUser");
      // window.location.href = "./r.html";
      checkOrderId();
    }
  });
}

const checkOrderId = async () => {
  USER_REF = await db.collection("Customers").doc(USER_ID);
  await USER_REF.get().then((doc) => {
    let docData = doc.data();
    USER_DETAILS = docData;
    // console.log(USER_DETAILS);
  });
  // console.log(USER_DETAILS);
  let checkFlag = false;
  for (let o of USER_DETAILS.orders) {
    INDEX++;
    if (+o.orderId === +CHECKOUT_ID) {
      checkFlag = true;
      await allProductsDetails();
      break;
    }
  }
  if (checkFlag === false) {
    window.location.href = "./../index.html";
  }
};

let FOUDANT = false;

const allProductsDetails = async () => {
  for (let p of USER_DETAILS.orders[INDEX].products) {
    prodRef = await db.collection(p.cat).doc(p.prodId);
    prodRefs.push(prodRef);
    await prodRef.get().then((doc) => {
      let docData = doc.data();
      p.pdata = docData;
      if (MAX_DAYS < +docData.extraTime.days) {
        MAX_DAYS = +docData.extraTime.days;
      }
      if (MAX_HOURS < +docData.extraTime.hours) {
        MAX_HOURS = +docData.extraTime.hours;
      }

      // console.log(docData);
      if (docData.fondant) {
        // console.log(docData);
        if (docData.fondant === "true") {
          // console.log(docData.fondant);
          FOUDANT = true;
        } else {
          // console.log(docData.fondant);
        }
      }
    });
  }

  calculateBill();
  document.querySelector("#proceed1Btn").disabled = false;
};

// const bpHTML = document.querySelector("#bp");
// const gstHTML = document.querySelector("#gst");
// const checkoutTotalHTML = document.querySelector("#checkout-total");

// const cakePrice = (selectedWeight, price, allweights) => {

// }

const bpSpanHTML = document.querySelector("#bp-span");
const discountHTML = document.querySelector("#discount");
const subTotalCostHTML = document.querySelector("#sub-total-cost");
const gstHTML = document.querySelector("#gst");
const addonCostHTML = document.querySelector("#addon-cost");
const costHTML = document.querySelector("#cost");
let basicPrices = [];

const calculateBill = async (discount = 0) => {
  TOTAL_COST = 0;
  // console.log(USER_DETAILS.orders[INDEX]);
  let bp = "";
  basicPrices = [];
  for (let p of USER_DETAILS.orders[INDEX].products) {
    let totalProdPrice = 0;
    let basicPrice = 0;
    let heartPrice = 0;
    let egglessPrice = 0;

    if (p.cake) {
      for (let w of p.pdata.weights) {
        // console.log(w);
        if (w.cakeWeight === p.cake.weight) {
          basicPrice = w.weightPrice;
          break;
        }
        // console.log(basicPrice);
      }

      if (p.cake.eggless) {
        egglessPrice = p.pdata.type.price;
      }

      if (p.cake.heart) {
        heartPrice = p.pdata.shapes[0].shapePrice;
      }
      // console.log(basicPrice, egglessPrice, heartPrice);
      totalProdPrice = (+basicPrice + +egglessPrice + +heartPrice) * +p.qty;
      // console.log(basicPrice, egglessPrice, heartPrice, totalProdPrice);
      totalProdPrice = Number(totalProdPrice.toFixed(2));
      basicPrices.push(totalProdPrice);
    } else {
      totalProdPrice = +p.pdata.sp * +p.qty;
      totalProdPrice = Number(totalProdPrice.toFixed(2));
      basicPrices.push(totalProdPrice);
    }

    let pName = p.pdata.name;
    bp += `
    <li>
      <p>
      ${pName}
      </p>
      <P>
        <b>₹ ${totalProdPrice}</b>
      </P>
    </li>`;
    TOTAL_COST = TOTAL_COST + totalProdPrice;
    TOTAL_COST = Number(TOTAL_COST.toFixed(2));
  }
  bpSpanHTML.innerHTML = bp;
  subTotalCostHTML.innerHTML = `₹ ${TOTAL_COST}`;

  // console.log(discount);
  // console.log(basicPrices);
  let dis;
  if (discount === 0) {
    dis = `
    <ul class="order-list">
      <li>
        <p>
          Discount
        </p>
        <P>
          <b id="discount">₹ 0</b>
        </P>
      </li>
    </ul>
    <div class="total-price">
      <p>
        After Discount
      </p>
      <p>
        <span id="discount-cost">${TOTAL_COST}</span>
      </p>
    </div>
    `;
  } else {
    let subDis = 0;
    basicPrices.map((el, i) => {
      // console.log(el);
      let d = el * (+discount / 100);
      // console.log(d);
      d = Number(d.toFixed(2));
      let eachDis = el - d;
      eachDis = Number(eachDis.toFixed(2));
      subDis += d;
      // console.log(eachDis);
      basicPrices[i] = eachDis;
    });
    // console.log(subDis);
    TOTAL_COST = TOTAL_COST - subDis;
    TOTAL_COST = Number(TOTAL_COST.toFixed(2));
    dis = `
    <ul class="order-list">
      <li>
        <p>
          Discount
        </p>
        <P>
          <b id="discount">₹ ${subDis}</b>
        </P>
      </li>
    </ul>
    <div class="total-price">
      <p>
        After Discount
      </p>
      <p>
        <span id="discount-cost">${TOTAL_COST}</span>
      </p>
    </div>
    `;
  }
  discountHTML.innerHTML = dis;

  // console.log(basicPrices);
  let gst = "";
  let counter = -1;
  for (p of USER_DETAILS.orders[INDEX].products) {
    counter++;
    let gstPrice = 0;
    let gstPercent = 0;
    gstPercent = +p.pdata.gst;
    gstPrice = +basicPrices[counter] * (+gstPercent / 100);
    gstPrice = Number(gstPrice.toFixed(2));

    let pName = p.pdata.name;
    gst += `
    <li>
      <p>
        ${pName}
      </p>
      <P>
        <b>₹${Math.round(gstPrice)}(${gstPercent}%)</b>
      </P>
    </li>
    `;
    TOTAL_COST = TOTAL_COST + gstPrice;
  }
  gstHTML.innerHTML = gst;

  if (USER_DETAILS.orders[INDEX].addons) {
    let addonsPrice = 0;
    if (USER_DETAILS.orders[INDEX].addons.length > 0) {
      for (add of USER_DETAILS.orders[INDEX].addons) {
        await db
          .collection("addons")
          .doc(add.id)
          .get()
          .then((addDoc) => {
            let addData = addDoc.data();
            addonsPrice = addonsPrice + addData.price * add.qty;
          });
      }
    }
    addonsPrice = Number(addonsPrice.toFixed(2));
    addonCostHTML.innerHTML = `₹ ${addonsPrice}`;
    TOTAL_COST = TOTAL_COST + addonsPrice;
    TOTAL_COST = Math.round(TOTAL_COST);
  }

  costHTML.innerHTML = `₹ ${TOTAL_COST}`;
  finalCostHTML.innerHTML = `₹ ${TOTAL_COST}`;
};

const coupanApplyHTML = document.querySelector("#coupanApply");
let appliedCoupan;
let cType,
  cAmt,
  discount,
  COUPAN_ID = null;
const checkCoupon = async (e) => {
  let coupanDetails;
  let flag = false;
  // const code = checkCouponFormHTML['code'].value;
  let code = document.querySelector("#code").value;
  // console.log(code);
  code = code.trim();
  let totalSubTotal = document.querySelector("#sub-total-cost").innerHTML;
  totalSubTotal = Number(totalSubTotal.substring(2));

  let coupanRef = await db.collection("coupans");
  await coupanRef.get().then((snapshots) => {
    let snapshotDocs = snapshots.docs;
    for (let doc of snapshotDocs) {
      let docData = doc.data();
      if (docData.name === code) {
        // console.log(docData.minAmt, totalSubTotal);
        if (+docData.minAmt <= +totalSubTotal) {
          // console.log(docData.minAmt, totalSubTotal);
          coupanDetails = docData;
          COUPAN_ID = doc.id;
          flag = true;
          appliedCoupan = code;
          break;
        }
      }
    }
  });

  if (flag) {
    // console.log("coupanDetails", coupanDetails);
    cAmt = +coupanDetails.amount;
    document.getElementById("success").style.display = "block";
    setTimeout(function () {
      document.getElementById("success").style.display = "none";
      document.getElementById("applied").innerHTML =
        "Applied &nbsp;" +
        appliedCoupan +
        ' &nbsp;<i style="color: red; cursor:pointer" onclick="removeCoupan()" class="fa fa-times"></i>';
      document.getElementById("applied").style.display = "block";
      $("#coupon-form,#check-coupon-form").toggle();
      document.getElementById("coupon-link").style.display = "none";
    }, 2000);
    calculateBill(cAmt);
    coupanApplyHTML.disable = true;
    document.querySelector("#code").value = "";
  } else {
    // invalid
    document.getElementById("fail").style.display = "block";
    setTimeout(function () {
      document.getElementById("fail").style.display = "none";
    }, 2000);
  }
};

function removeCoupan() {
  if (document.querySelector("#coupanApply").disabled) {
    // console.log(document.querySelector('#coupanApply').disabled);
    return;
  }
  document.getElementById("applied").style.display = "none";
  calculateBill(0);
  document.getElementById("coupon-link").style.display = "block";
}

coupanApplyHTML.addEventListener("click", checkCoupon);

const form1ShippingHTML = document.querySelector("#form1-shipping");
const finalCostHTML = document.querySelector("#final-cost");
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
  const zip = document.querySelector("#postal_code").value;

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
  // $("#myModal1").modal("show");
  document
    .querySelectorAll("input[name=shipping_time]")
    .forEach((e) => (e.checked = false));

  document.querySelector("#registerTime").disabled = true;
  SHIPPING_DATA.name = name;
  SHIPPING_DATA.phone = phone;
  SHIPPING_DATA.email = email;
  SHIPPING_DATA.address = address;
  SHIPPING_DATA.landmark = landmark;
  SHIPPING_DATA.country = customer_country;
  SHIPPING_DATA.city = city;
  SHIPPING_DATA.zip = zip;
  // SHIPPING_DATA.message = order_notes || "No Message Added";

  if (shipDiffAddress.checked) {
    SHIPPING_DATA.differtAddress = true;
    // form1ShippingHTML['alt_name'].required = true;
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
  // console.log("submitted");
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
let year;
let month;
let day;
let hours;

const validateDateAndTime = () => {
  // console.log("validateDateAndTime");
  hours = Number(hours);
  day = Number(day);
  month = Number(month);
  year = Number(year);
  while (hours > 24) {
    let diffHours = hours - 24;
    hours = diffHours;
    console.log(hours);
    // alert(hours);
    day = day + 1;
  }

  let maxMonthDays = 0;
  // console.log(month, typeof(month));
  if (month === 1) {
    maxMonthDays = 31;
  } else if (month === 2) {
    let leapYear = (year % 4 == 0 && year % 100 != 0) || year % 400 == 0;
    if (leapYear) {
      maxMonthDays = 29;
    } else {
      maxMonthDays = 28;
    }
  } else if (month === 3) {
    maxMonthDays = 31;
  } else if (month === 4) {
    maxMonthDays = 30;
  } else if (month === 5) {
    maxMonthDays = 31;
  } else if (month === 6) {
    maxMonthDays = 30;
  } else if (month === 7) {
    maxMonthDays = 31;
  } else if (month === 8) {
    maxMonthDays = 31;
  } else if (month === 9) {
    maxMonthDays = 30;
  } else if (month === 10) {
    maxMonthDays = 31;
  } else if (month === 11) {
    maxMonthDays = 30;
  } else if (month === 12) {
    maxMonthDays = 31;
  } else {
    // nothing
  }

  while (day > maxMonthDays) {
    // console.log("while", day, maxMonthDays);
    let diffDays = day - maxMonthDays;
    day = diffDays;

    month += 1;
  }

  while (month > 12) {
    let diffMonth = month - 12;
    month = diffMonth;
    year += 1;
  }

  if (year.toString().length !== 4) {
    window.location.href = `../index.html`;
  }
  if (month.toString().length < 2) {
    month = `0${month}`;
    // month = Number(month);
  }
  if (day.toString().length < 2) {
    day = `0${day}`;
  }

  hours = hours.toString();
  day = day.toString();
  month = month.toString();
  year = year.toString();
  // console.log(day);
  shippingDateHTML.value = `${year}-${month}-${day}`;
  // shippingDateHTML.min = `${year}-${month}-${day}`;
  shippingDateHTML.setAttribute("min", `${year}-${month}-${day}`);
};

const setDateAndTime = () => {
  year = date.getFullYear();
  month = date.getMonth() + 1;
  day = date.getDate() + MAX_DAYS;

  hours = date.getHours();
  // console.log(hours);

  validateDateAndTime();

  let shipVal = packingAreaHTML.querySelector('input[name="shipping"]:checked')
    .value;
  shippingType = shipVal;

  let foudantHoursPerfect = 0;
  hours = Number(hours);
  // console.log(MAX_DAYS, MAX_HOURS);
  if (MAX_HOURS || MAX_DAYS) {
    // console.log(hours);

    if (hours < 9) {
      hours = 10 + MAX_HOURS;
      // console.log(hours);

      // console.log(hours);
    } else {
      // console.log(hours);
      hours = hours + MAX_HOURS;
      // console.log(hours);
    }
    foudantHoursPerfect = -2;
  }
  // console.log(hours);
  validateDateAndTime();

  function updateDay() {
    day = Number(day);
    day = day + 1;
    hours = 0;
    validateDateAndTime();
    // console.log(day);
    return day;
  }

  function shipValFree() {
    shippingDateHTML.value = `${year}-${month}-${day}`;
    // shippingDateHTML.min = `${year}-${month}-${day}`;
    shippingDateHTML.setAttribute("min", `${year}-${month}-${day}`);
    perfectHoursHTML.style.display = "none";
    midnightHoursHTML.style.display = "none";
    freeHoursHTML.style.display = "none";
    timeErrorHTML.style.display = "none";
    // console.log(hours, MAX_HOURS, MAX_DAYS);
    if (hours < 17) {
      freeHoursHTML.style.display = "block";
    } else {
      let updatedDay = updateDay();
      shipValFree();
      shippingDateHTML.setAttribute("min", `${year}-${month}-${updatedDay}`);
      // timeErrorHTML.style.display = "block";
    }
  }

  function shipValPerfect() {
    freeHoursHTML.style.display = "none";
    midnightHoursHTML.style.display = "none";
    perfectHoursHTML.style.display = "none";
    timeErrorHTML.style.display = "none";
    console.log(hours, foudantHoursPerfect);
    if (hours + foudantHoursPerfect < 19) {
      perfectHoursHTML.style.display = "block";
      if (hours + foudantHoursPerfect < 8) {
      } else if (hours + foudantHoursPerfect < 9) {
        // document.querySelector("#perfect_10").disabled = true;
      } else if (hours + foudantHoursPerfect < 10) {
        // document.querySelector("#perfect_10").disabled = true;
        document.querySelector("#perfect_11").disabled = true;
        document.querySelector("#perfect_11").parentElement.remove();
      } else if (hours + foudantHoursPerfect < 11) {
        // document.querySelector("#perfect_10").disabled = true;
        document.querySelector("#perfect_11").disabled = true;
        document.querySelector("#perfect_11").parentElement.remove();
        document.querySelector("#perfect_12").disabled = true;
        document.querySelector("#perfect_12").parentElement.remove();
      } else if (hours + foudantHoursPerfect < 12) {
        // document.querySelector("#perfect_10").disabled = true;
        document.querySelector("#perfect_11").disabled = true;
        document.querySelector("#perfect_11").parentElement.remove();
        document.querySelector("#perfect_12").disabled = true;
        document.querySelector("#perfect_12").parentElement.remove();
        document.querySelector("#perfect_1").disabled = true;
        document.querySelector("#perfect_1").parentElement.remove();
      } else if (hours + foudantHoursPerfect < 13) {
        // document.querySelector("#perfect_10").disabled = true;
        document.querySelector("#perfect_11").disabled = true;
        document.querySelector("#perfect_11").parentElement.remove();
        document.querySelector("#perfect_12").disabled = true;
        document.querySelector("#perfect_12").parentElement.remove();
        document.querySelector("#perfect_1").disabled = true;
        document.querySelector("#perfect_1").parentElement.remove();
        document.querySelector("#perfect_2").disabled = true;
        document.querySelector("#perfect_2").parentElement.remove();
      } else if (hours + foudantHoursPerfect < 14) {
        // document.querySelector("#perfect_10").disabled = true;

        document.querySelector("#perfect_11").disabled = true;
        document.querySelector("#perfect_11").parentElement.remove();
        document.querySelector("#perfect_12").disabled = true;
        document.querySelector("#perfect_12").parentElement.remove();
        document.querySelector("#perfect_1").disabled = true;
        document.querySelector("#perfect_1").parentElement.remove();
        document.querySelector("#perfect_2").disabled = true;
        document.querySelector("#perfect_2").parentElement.remove();
        document.querySelector("#perfect_3").disabled = true;
        document.querySelector("#perfect_3").parentElement.remove();
      } else if (hours + foudantHoursPerfect < 15) {
        // document.querySelector("#perfect_10").disabled = true;
        document.querySelector("#perfect_11").disabled = true;
        document.querySelector("#perfect_11").parentElement.remove();
        document.querySelector("#perfect_12").disabled = true;
        document.querySelector("#perfect_12").parentElement.remove();
        document.querySelector("#perfect_1").disabled = true;
        document.querySelector("#perfect_1").parentElement.remove();
        document.querySelector("#perfect_2").disabled = true;
        document.querySelector("#perfect_2").parentElement.remove();
        document.querySelector("#perfect_3").disabled = true;
        document.querySelector("#perfect_3").parentElement.remove();
        document.querySelector("#perfect_4").disabled = true;
        document.querySelector("#perfect_4").parentElement.remove();
      } else if (hours + foudantHoursPerfect < 16) {
        // document.querySelector("#perfect_10").disabled = true;
        document.querySelector("#perfect_11").disabled = true;
        document.querySelector("#perfect_11").parentElement.remove();
        document.querySelector("#perfect_12").disabled = true;
        document.querySelector("#perfect_12").parentElement.remove();
        document.querySelector("#perfect_1").disabled = true;
        document.querySelector("#perfect_1").parentElement.remove();
        document.querySelector("#perfect_2").disabled = true;
        document.querySelector("#perfect_2").parentElement.remove();
        document.querySelector("#perfect_3").disabled = true;
        document.querySelector("#perfect_3").parentElement.remove();
        document.querySelector("#perfect_4").disabled = true;
        document.querySelector("#perfect_4").parentElement.remove();
        document.querySelector("#perfect_5").disabled = true;
        document.querySelector("#perfect_5").parentElement.remove();
      } else if (hours + foudantHoursPerfect < 17) {
        // document.querySelector("#perfect_10").disabled = true;
        document.querySelector("#perfect_11").disabled = true;
        document.querySelector("#perfect_11").parentElement.remove();
        document.querySelector("#perfect_12").disabled = true;
        document.querySelector("#perfect_12").parentElement.remove();
        document.querySelector("#perfect_1").disabled = true;
        document.querySelector("#perfect_1").parentElement.remove();
        document.querySelector("#perfect_2").disabled = true;
        document.querySelector("#perfect_2").parentElement.remove();
        document.querySelector("#perfect_3").disabled = true;
        document.querySelector("#perfect_3").parentElement.remove();
        document.querySelector("#perfect_4").disabled = true;
        document.querySelector("#perfect_4").parentElement.remove();
        document.querySelector("#perfect_5").disabled = true;
        document.querySelector("#perfect_5").parentElement.remove();
        document.querySelector("#perfect_6").disabled = true;
        document.querySelector("#perfect_6").parentElement.remove();
      } else if (hours + foudantHoursPerfect < 18) {
        // document.querySelector("#perfect_10").disabled = true;
        document.querySelector("#perfect_11").disabled = true;
        document.querySelector("#perfect_11").parentElement.remove();
        document.querySelector("#perfect_12").disabled = true;
        document.querySelector("#perfect_12").parentElement.remove();
        document.querySelector("#perfect_1").disabled = true;
        document.querySelector("#perfect_1").parentElement.remove();
        document.querySelector("#perfect_2").disabled = true;
        document.querySelector("#perfect_2").parentElement.remove();
        document.querySelector("#perfect_3").disabled = true;
        document.querySelector("#perfect_3").parentElement.remove();
        document.querySelector("#perfect_4").disabled = true;
        document.querySelector("#perfect_4").parentElement.remove();
        document.querySelector("#perfect_5").disabled = true;
        document.querySelector("#perfect_5").parentElement.remove();
        document.querySelector("#perfect_6").disabled = true;
        document.querySelector("#perfect_6").parentElement.remove();
        document.querySelector("#perfect_7").disabled = true;
        document.querySelector("#perfect_7").parentElement.remove();
      } else if (hours + foudantHoursPerfect < 19) {
        // document.querySelector("#perfect_10").disabled = true;
        document.querySelector("#perfect_11").disabled = true;
        document.querySelector("#perfect_11").parentElement.remove();
        document.querySelector("#perfect_12").disabled = true;
        document.querySelector("#perfect_12").parentElement.remove();
        document.querySelector("#perfect_1").disabled = true;
        document.querySelector("#perfect_1").parentElement.remove();
        document.querySelector("#perfect_2").disabled = true;
        document.querySelector("#perfect_2").parentElement.remove();
        document.querySelector("#perfect_3").disabled = true;
        document.querySelector("#perfect_3").parentElement.remove();
        document.querySelector("#perfect_4").disabled = true;
        document.querySelector("#perfect_4").parentElement.remove();
        document.querySelector("#perfect_5").disabled = true;
        document.querySelector("#perfect_5").parentElement.remove();
        document.querySelector("#perfect_6").disabled = true;
        document.querySelector("#perfect_6").parentElement.remove();
        document.querySelector("#perfect_7").disabled = true;
        document.querySelector("#perfect_7").parentElement.remove();
        document.querySelector("#perfect_8").disabled = true;
        document.querySelector("#perfect_8").parentElement.remove();
      } else if (hours + foudantHoursPerfect < 20) {
        // document.querySelector("#perfect_10").disabled = true;
        document.querySelector("#perfect_11").disabled = true;
        document.querySelector("#perfect_11").parentElement.remove();
        document.querySelector("#perfect_12").disabled = true;
        document.querySelector("#perfect_12").parentElement.remove();
        document.querySelector("#perfect_1").disabled = true;
        document.querySelector("#perfect_1").parentElement.remove();
        document.querySelector("#perfect_2").disabled = true;
        document.querySelector("#perfect_2").parentElement.remove();
        document.querySelector("#perfect_3").disabled = true;
        document.querySelector("#perfect_3").parentElement.remove();
        document.querySelector("#perfect_4").disabled = true;
        document.querySelector("#perfect_4").parentElement.remove();
        document.querySelector("#perfect_5").disabled = true;
        document.querySelector("#perfect_5").parentElement.remove();
        document.querySelector("#perfect_6").disabled = true;
        document.querySelector("#perfect_6").parentElement.remove();
        document.querySelector("#perfect_7").disabled = true;
        document.querySelector("#perfect_7").parentElement.remove();
        document.querySelector("#perfect_8").disabled = true;
        document.querySelector("#perfect_8").parentElement.remove();
        document.querySelector("#perfect_9").disabled = true;
        document.querySelector("#perfect_9").parentElement.remove();
      } else {
        console.log("invalid");
      }
    } else {
      let updatedDay = updateDay();
      shipValPerfect();
      shippingDateHTML.setAttribute("min", `${year}-${month}-${updatedDay}`);
      // shippingDateHTML.value = `${year}-${month}-${updatedDay}`;
      // shippingDateHTML.min = `${year}-${month}-${updatedDay}`;
      // timeErrorHTML.style.display = "block";
    }
  }

  function shipValMidNight() {
    finalCostHTML.innerHTML = ``;
    freeHoursHTML.style.display = "none";
    midnightHoursHTML.style.display = "none";
    perfectHoursHTML.style.display = "none";
    timeErrorHTML.style.display = "none";

    if (hours < 20) {
      midnightHoursHTML.style.display = "block";
    } else {
      let updatedDay = updateDay();
      shipValMidNight();
      shippingDateHTML.setAttribute("min", `${year}-${month}-${updatedDay}`);
      // timeErrorHTML.style.display = "block";
    }
  }

  hours = Number(hours);
  if (shipVal === "free") {
    shipValFree();
  } else if (shipVal === "perfect") {
    console.log(hours);
    shipValPerfect();
  } else if (shipVal === "midnight") {
    shipValMidNight();
  } else {
    console.log("invalid");
  }
};

const changeDate = (e) => {
  let orderDate = e.target.value;
  let [y, m, d] = orderDate.split("-");
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
      // document.querySelector("#perfect_10").disabled = false;
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

document.querySelectorAll("input[name=shipping_time]").forEach((el) => {
  el.addEventListener("change", (e) => {
    document.querySelector("#registerTime").disabled = false;
  });
});

document.querySelectorAll("input[name=shipping]").forEach((el) => {
  el.addEventListener("change", (e) => {
    if (e.target.value === "free") {
      finalCostHTML.innerHTML = `₹ ${TOTAL_COST}`;
    } else if (e.target.value === "perfect") {
      let temp = TOTAL_COST + 150;
      finalCostHTML.innerHTML = `₹ ${temp}`;
    } else if (e.target.value === "midnight") {
      let temp = TOTAL_COST + 200;
      finalCostHTML.innerHTML = `₹ ${temp}`;
    } else {
      console.log("invalid");
    }
  });
});

const undisableCoupan = (e) => {
  document.querySelector("#coupanApply").disabled = false;
};

///////////////////////////////////////////////////////////////////////////////////////////////////////

const registerTimeHTML = document.querySelector("#registerTime");
const orderAreaHTML = document.querySelector(".order-area");

const prodSummary = async (e) => {
  document.querySelector("#coupanApply").disabled = true;
  let card = "";
  let counter = -1;
  USER_DETAILS.orders[INDEX].products.map((p) => {
    counter++;
    let cakeLabels = "";
    if (p.cake) {
      let weightNum;
      if (p.cake.weight === "half") {
        weightNum = `1/2`;
      } else if (p.cake.weight === "one") {
        weightNum = 1;
      } else if (p.cake.weight === "oneHalf") {
        weightNum = 1.5;
      } else if (p.cake.weight === "two") {
        weightNum = 2;
      } else if (p.cake.weight === "three") {
        weightNum = 3;
      } else if (p.cake.weight === "four") {
        weightNum = 4;
      } else if (p.cake.weight === "five") {
        weightNum = 5;
      } else if (p.cake.weight === "six") {
        weightNum = 6;
      } else {
        weightNum = 0;
      }

      cakeLabels = `
      <div class="total-price">
        <h5 class="label">Weight : </h5>
        <p>${weightNum}</p>
      </div>
      <div class="total-price">
        <h5 class="label">Shape : </h5>
        <p>${p.cake.heart ? "Opted" : "Not Opted"}</p>
      </div>
      <div class="total-price">
        <h5 class="label">Eggless : </h5>
        <p>${p.cake.eggless ? "Opted" : "Not Opted"}</p>
      </div>
      <div class="total-price">
        <h5 class="label">Flavour : </h5>
        <p>${p.cake.flavour ? p.cake.flavour : "Not Opted"}</p>
      </div>
      `;
    }

    card += `
    <div class="order-item">
      <div class="product-img">
        <div class="d-flex">
          <img src="${p.pdata.mainImgUrl}" height="80"  width="80" class="p-1">
        </div> 
      </div>
      <div class="product-content">
        <p class="name"><a href="../Product/product.html?cat=${p.cat}&&prod=${
      p.prodId
    }"
            target="_blank">${p.pdata.name}</a></p>
        <div class="unit-price">
          <h5 class="label">Price : </h5><p>₹${basicPrices[counter]}</p>
        </div>
        <div class="quantity">
          <h5 class="label">Quantity : </h5>
          <span class="qttotal">${p.qty} </span>
        </div>
        ${cakeLabels}
        ${
          p.message
            ? `<div class="quantity">
            <h5 class="label">Message : </h5>
            <span class="qttotal">${p.message} </span>
          </div> `
            : ""
        }
      </div>
    </div>
    `;
  });

  for (let addonProd of USER_DETAILS.orders[INDEX].addons) {
    await db
      .collection("addons")
      .doc(addonProd.id)
      .get()
      .then((addonDoc) => {
        let addonData = addonDoc.data();
        card += `
      <div class="order-item">
        <div class="product-img">
          <div class="d-flex">
            <img src="${addonData.imgUrl}" height="80"  width="80" class="p-1">
          </div> 
        </div>
        <div class="product-content">
          <p class="name"><a href="../Product/product.html?cat=${p.cat}&&prod=${p.prodId}"
              target="_blank">${addonData.name}</a></p>
          <div class="unit-price">
            <h5 class="label">Price : </h5><p>₹${addonData.price}</p>
          </div>
          <div class="quantity">
            <h5 class="label">Quantity : </h5>
            <span class="qttotal">${addonProd.qty} </span>
          </div>
        </div>
      </div>
      `;
      });
  }

  orderAreaHTML.innerHTML = card;
};
registerTimeHTML.addEventListener("click", prodSummary);

//////////////////////////////////////////////////////////////////////////////////////////////////

// const prodFinalHTML = document.querySelector('#prodFinal');

const shipping_userHTML = document.querySelector("#shipping_user");
const shipping_locationHTML = document.querySelector("#shipping_location");
const shipping_landmarkHTML = document.querySelector("#shipping_landmark");
const shipping_phoneHTML = document.querySelector("#shipping_phone");
const shipping_emailHTML = document.querySelector("#shipping_email");
// const shipping_msgHTML = document.querySelector("#shipping_msg");

const alt_shipping_userHTML = document.querySelector("#alt_shipping_user");
const alt_shipping_locationHTML = document.querySelector(
  "#alt_shipping_location"
);
const alt_shipping_landmarkHTML = document.querySelector(
  "#alt_shipping_landmark"
);
const alt_shipping_phoneHTML = document.querySelector("#alt_shipping_phone");
let alt_shipping_emailHTML = document.querySelector("#alt_shipping_email");
const altAddressHTML = document.querySelector("#alt-address");

let RAZ_ORDER_ID;
let PUB_KEY;
const displayShippingInfo = (e) => {
  shipping_userHTML.innerHTML = SHIPPING_DATA.name;
  shipping_locationHTML.innerHTML = SHIPPING_DATA.address;
  shipping_landmarkHTML.innerHTML = SHIPPING_DATA.landmark;
  shipping_phoneHTML.innerHTML = SHIPPING_DATA.phone;
  shipping_emailHTML.innerHTML = SHIPPING_DATA.email;
  // shipping_msgHTML.innerHTML = SHIPPING_DATA.message;

  if (SHIPPING_DATA.differtAddress) {
    altAddressHTML.style.display = "block";
    console.log(SHIPPING_DATA);
    alt_shipping_userHTML.innerHTML = SHIPPING_DATA.alt_name;
    alt_shipping_locationHTML.innerHTML = SHIPPING_DATA.alt_address;
    alt_shipping_landmarkHTML.innerHTML = SHIPPING_DATA.alt_landmark;
    alt_shipping_phoneHTML.innerHTML = SHIPPING_DATA.alt_phone;
    alt_shipping_emailHTML = SHIPPING_DATA.alt_email;
  }

  if (!COUPAN_ID) {
    COUPAN_ID = false;
  }

  let razName, razEmail, razAddress, razPhone;
  if (SHIPPING_DATA.shipDiffAddress) {
    razName = SHIPPING_DATA.alt_name;
    razEmail = SHIPPING_DATA.email;
    razPhone = SHIPPING_DATA.alt_phone;
    razAddress = SHIPPING_DATA.alt_address;
  } else {
    razName = SHIPPING_DATA.name;
    razEmail = SHIPPING_DATA.email;
    razPhone = SHIPPING_DATA.phone;
    razAddress = SHIPPING_DATA.address;
  }

  // console.log(shippingType)
  // console.log(document.querySelector('input[name=shipping_date]').value)
  // console.log(document.querySelector('input[name=shipping_time]:checked').value)

  let shipData = {
    type: shippingType,
    date: document.querySelector("input[name=shipping_date]").value,
    time: document.querySelector("input[name=shipping_time]:checked").value,
  };

  const checkoutReqData = {
    ...shipData,
    userId: USER_ID,
    order: CHECKOUT_ID,
    coupan: COUPAN_ID,
    name: razName,
    shippingData: SHIPPING_DATA,
  };
  // let options = {
  //   method: 'POST',
  //   headers: {
  //     'Content-Type': 'application/json;charset=utf-8'
  //   },
  //   body: JSON.stringify(checkoutReqData)
  // }

  // fetch('https://raz-pay.herokuapp.com/checkout', options).then(r => {
  // fetch('http://localhost:3500/checkout', options).then(r => {
  //   // console.log(r);
  //   console.log(r);
  //   return r.json();
  // }).then(mainData => {
  //   console.log(mainData);
  //   RAZ_ORDER_ID = mainData.orderId;
  //   document.querySelector('#rzp-button1').disabled = false;
  //   alert(RAZ_ORDER_ID);
  // }).catch(error => {
  //   console.log(error);
  // })

  const checkoutReq = firebase.functions().httpsCallable("checkoutReq");
  checkoutReq(checkoutReqData)
    .then((res) => {
      document.querySelector("#rzp-button1").disabled = false;
      RAZ_ORDER_ID = res.data.orderId;
      PUB_KEY = res.data.publicKey;
    })
    .catch((error) => {
      console.log(error);
    });
  // console.log(RAZ_ORDER_ID);
};

// prodFinalHTML.addEventListener('click', displayShippingInfo);

//////////////////////////////////////////////////////////////////////////////////////////////////////////////

let options = "";
let rzp1;
const exeRazPay = (e) => {
  document.getElementById("gettingReady").style.display = "none";
  let razName, razEmail, razAddress, razPhone;
  if (SHIPPING_DATA.shipDiffAddress) {
    (razName = SHIPPING_DATA.alt_name),
      (razEmail = SHIPPING_DATA.email),
      (razPhone = SHIPPING_DATA.alt_phone),
      (razAddress = SHIPPING_DATA.alt_address);
  } else {
    (razName = SHIPPING_DATA.name),
      (razEmail = SHIPPING_DATA.email),
      (razPhone = SHIPPING_DATA.phone),
      (razAddress = SHIPPING_DATA.address);
  }

  e.preventDefault();

  options = {
    key: PUB_KEY,
    amount: "1000",
    currency: "INR",
    name: "LAKE OF CAKES",
    description: "HAPPY SHOPPING",
    image: "./../assets/images/logo.png",
    order_id: RAZ_ORDER_ID,
    handler: function (response) {
      RES = response;
      // alert('razorpay_signature', response.razorpay_signature);
      orderComplete(response);
      // alert(response.razorpay_payment_id);
      // alert(response.razorpay_order_id);
    },
    prefill: {
      name: razName,
      email: razEmail,
      contact: `91${razPhone}`,
    },
    notes: {
      address: razAddress,
    },
    theme: {
      color: "#f00",
    },
  };
  console.log(options);
  rzp1 = new Razorpay(options);
  rzp1.open();
  rzp1.on("payment.failed", function (response) {
    // alert(response.error.code);
    // console.log(response);
    // console.log(response.error);
  });
};

const orderComplete = (data) => {
  $("#exampleModal").modal("show");
  $("#exampleModal").modal({
    backdrop: "static",
    keyboard: false,
  });
  //   let userValid=localStorage.getItem("locLoggedInUser")
  //   var dbupdate = db.collection("Customers").doc(userValid);

  // return dbupdate.update({
  //       : true
  // })
  // console.log(shippingType)
  // console.log(document.querySelector('input[name=shipping_date]').value)
  // console.log(document.querySelector('input[name=shipping_time]:checked').value)

  let shipData = {
    type: shippingType,
    date: document.querySelector("input[name=shipping_date]").value,
    time: document.querySelector("input[name=shipping_time]:checked").value,
  };

  // console.log(data);
  let addtionalData = {
    ...shipData,
    ...data,
    userId: USER_ID,
    order: CHECKOUT_ID,
    coupan: COUPAN_ID,
    formData: SHIPPING_DATA,
  };
  // let options = {
  //   method: 'POST',
  //   headers: {
  //     'Content-Type': 'application/json;charset=utf-8'
  //   },
  //   body: JSON.stringify(addtionalData)
  // }

  // fetch('http://localhost:3500/payment', options).then(r => {
  // // fetch('https://raz-pay.herokuapp.com/payment', options).then(r => {
  //   console.log(r);
  //   return r.json();
  // }).then(mainData => {
  //   console.log(mainData);
  //   if(mainData === 'true') {
  //     console.log(true);
  //   } else {
  //     console.log(false);
  //   }
  // }).catch(error => {
  //   console.log(error);
  // })

  const payemnetStatus = firebase.functions().httpsCallable("payemnetStatus");
  payemnetStatus(addtionalData)
    .then(async (res) => {
      // console.log(res.data);
      if (res.data === "true") {
        let userRef = await db.collection("Customers").doc(USER_ID);
        await userRef.get().then(async (userDoc) => {
          let userData = userDoc.data();
          for (let uo of userData.orders) {
            if (+uo.orderId === +CHECKOUT_ID) {
              let shipData = {
                type: shippingType,
                date: document.querySelector("input[name=shipping_date]").value,
                time: document.querySelector(
                  "input[name=shipping_time]:checked"
                ).value,
              };
              uo.successOrderId = RAZ_ORDER_ID;
              uo.status = "success";
              uo.success = {
                orderTime: new Date().toString(),
                shippingData: SHIPPING_DATA,
                ...shipData,
                totalCost: TOTAL_COST,
              };
              await userRef.update(userData);
              break;
            }
          }
        });
        setTimeout(function () {
          location.replace("../index.html");
        }, 3000);
      } else {
        // console.log('same page reload');
        window.reload();
      }
    })
    .catch((error) => {
      console.log(error);
    });
};

// //////////////////////////////////////////////////////////////////////////////

// document.querySelectorAll('.pin-lucknow').forEach(el => {
//   el.addEventListener('input', (e) => {
//     // console.log(e.target.value);
//     let val = e.target.value;
//     valArr = val.split('');
//     // console.log(valArr);

//   })
// })

const checkPin = (e, current) => {
  // console.log(current.value);
  let val = current.value;
  valArr = val.split("");
  if (valArr[0] == 2 || valArr[0] == "" || valArr[0] == undefined) {
  } else {
    current.value = "";
  }
  if (valArr[1] == 2 || valArr[1] == "" || valArr[1] == undefined) {
  } else {
    current.value = "2";
  }
  if (valArr[2] == 6 || valArr[2] == "" || valArr[2] == undefined) {
  } else {
    current.value = "22";
  }
  // console.log(e.key);
};
