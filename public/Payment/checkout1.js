console.log("checkout1.js");

const db = firebase.firestore();
const storageService = firebase.storage();

let CHECKOUT_ID, USER_ID, USER_DETAILS, USER_REF, ADDON_REF, ADDONS_DETAILS;
let TOTAL_COST = 0;
let INDEX = -1;
const prodDetails = [];
const prodRefs = [];

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
      console.log("done");
      break;
    }
  }
  if (checkFlag === false) {
    window.location.href = "./../index.html";
  }
};

const allProductsDetails = async () => {
  for (let p of USER_DETAILS.orders[INDEX].products) {
    prodRef = await db.collection(p.cat).doc(p.prodId);
    prodRefs.push(prodRef);
    await prodRef.get().then((doc) => {
      let docData = doc.data();
      p.pdata = docData;
    });
  }
  calculateBill();
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
  console.log(USER_DETAILS.orders[INDEX]);
  let bp = "";

  for (let p of USER_DETAILS.orders[INDEX].products) {
    let totalProdPrice = 0;
    let basicPrice = 0;
    let heartPrice = 0;
    let egglessPrice = 0;

    if (p.cake) {
      cake = true;

      for (let w of p.pdata.weights) {
        if (w.cakeWeight === "half") {
          basicPrice = w.weightPrice;
          break;
        } else if (w.cakeWeight === "one") {
          basicPrice = w.weightPrice;
          break;
        } else if (w.cakeWeight === "oneHlaf") {
          basicPrice = w.weightPrice;
          break;
        } else if (w.cakeWeight === "two") {
          basicPrice = w.weightPrice;
          break;
        } else if (w.cakeWeight === "three") {
          basicPrice = w.weightPrice;
          break;
        } else if (w.cakeWeight === "four") {
          basicPrice = w.weightPrice;
          break;
        } else if (w.cakeWeight === "five") {
          basicPrice = w.weightPrice;
          break;
        } else if (w.cakeWeight === "six") {
          basicPrice = w.weightPrice;
          break;
        } else {
          console.log("invalid");
        }
      }

      if (p.cake.eggless) {
        egglessPrice = p.pdata.type.price;
      }

      if (p.cake.heart) {
        heartPrice = p.pdata.shapes[0].shapePrice;
      }
      // console.log(basicPrice, egglessPrice, heartPrice);
      totalProdPrice = Math.round(+basicPrice + +egglessPrice + +heartPrice);
      basicPrices.push(totalProdPrice);
    } else {
      totalProdPrice = Math.round(+p.pdata.sp);
      basicPrices.push(totalProdPrice);
    }
    totalProdPrice = totalProdPrice * +p.qty;

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
  }
  bpSpanHTML.innerHTML = bp;
  subTotalCostHTML.innerHTML = `₹ ${TOTAL_COST}`;
  console.log(discount);
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
    console.log(discount);
    TOTAL_COST = TOTAL_COST - +discount;
    dis = `
    <ul class="order-list">
      <li>
        <p>
          Discount
        </p>
        <P>
          <b id="discount">₹ ${discount}</b>
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

  let gst = "";
  let counter = -1;
  for (p of USER_DETAILS.orders[INDEX].products) {
    counter++;
    let gstPrice = 0;
    let gstPercent = 0;

    gstPercent = +p.pdata.gst;
    gstPrice = Math.round(+basicPrices[counter] * +p.qty * (+gstPercent / 100));

    let pName = p.pdata.name;
    gst += `
    <li>
      <p>
        ${pName}
      </p>
      <P>
        <b>₹ ${gstPrice} (${gstPercent}%)</b>
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
    addonCostHTML.innerHTML = `₹ ${addonsPrice}`;
    TOTAL_COST = TOTAL_COST + addonsPrice;
  }

  costHTML.innerHTML = `₹ ${TOTAL_COST}`;
  finalCostHTML.innerHTML = `₹ ${TOTAL_COST}`;
};

const coupanApplyHTML = document.querySelector("#coupanApply");
var appliedCoupan;
let cType, cAmt, discount;
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
        appliedCoupan = code;
        break;
      }
    }
  });

  if (flag) {
    let totalSubTotal = document.querySelector("#sub-total-cost").innerHTML;
    console.log(totalSubTotal);
    totalSubTotal = totalSubTotal.substring(2);
    console.log(totalSubTotal);
    console.log("flag", coupanDetails);
    // add snackbar
    if (coupanDetails.category === "percentage") {
      cType = "percentage";
      cAmt = coupanDetails.amount;
      discount = +totalSubTotal * (+cAmt / 100);
    } else {
      cType = "price";
      cAmt = coupanDetails.amount;
      discount = +cAmt;
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
    }
    console.log(discount, typeof discount);
    calculateBill(+discount);
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
  discount -= cAmt;
  document.getElementById("applied").style.display = "none";
  calculateBill(discount);
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
  document.querySelector("#registerTime").disabled = true;
  SHIPPING_DATA.name = name;
  SHIPPING_DATA.phone = phone;
  SHIPPING_DATA.email = email;
  SHIPPING_DATA.address = address;
  SHIPPING_DATA.landmark = landmark;
  SHIPPING_DATA.country = customer_country;
  SHIPPING_DATA.city = city;
  SHIPPING_DATA.zip = zip;
  SHIPPING_DATA.message = order_notes || "No Message Added";

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
  console.log(SHIPPING_DATA);
  $("input[type=date]").val("");
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
        console.log("invalid");
      }
    } else {
      shippingDateHTML.setAttribute("min", `${year}-${month}-${day + 1}`);
      timeErrorHTML.style.display = "block";
    }
  } else if (shipVal === "midnight") {
    finalCostHTML.innerHTML = ``;
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

document.querySelectorAll("input[name=shipping_time]").forEach((el) => {
  el.addEventListener("change", (e) => {
    document.querySelector("#registerTime").disabled = false;
  });
});

document.querySelectorAll("input[name=shipping]").forEach((el) => {
  el.addEventListener("change", (e) => {
    console.log(e.target.value);
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

///////////////////////////////////////////////////////////////////////////////////////////////////////

const registerTimeHTML = document.querySelector("#registerTime");
const orderAreaHTML = document.querySelector(".order-area");

const prodSummary = (e) => {
  let card = "";
  let counter = -1;
  USER_DETAILS.orders[INDEX].products.map((p) => {
    counter++;
    let cakeLabels = "";
    if (p.cake) {
      let weightNum;
      if (p.cake.weight === "half") {
        weightNum = 0.5;
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
        <p class="name"><a href="../Product/product.html?cat=${p.cat}&&prod=${p.prodId}"
            target="_blank">${p.pdata.name}</a></p>
        <div class="unit-price">
          <h5 class="label">Price : </h5><p>₹${basicPrices[counter]}</p>
        </div>
        <div class="quantity">
          <h5 class="label">Quantity : </h5>
          <span class="qttotal">${p.qty} </span>
        </div>
        ${cakeLabels}
      </div>
    </div>
    `;
  });

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
const shipping_msgHTML = document.querySelector("#shipping_msg");

const alt_shipping_userHTML = document.querySelector("#alt_shipping_user");
const alt_shipping_locationHTML = document.querySelector(
  "#alt_shipping_location"
);
const alt_shipping_landmarkHTML = document.querySelector(
  "#alt_shipping_landmark"
);
const alt_shipping_phoneHTML = document.querySelector("#alt_shipping_phone");
const alt_shipping_emailHTML = document.querySelector("#alt_shipping_email");

const altAddressHTML = document.querySelector("#alt-address");

let RAZ_ORDER_ID;
const displayShippingInfo = (e) => {
  console.log(SHIPPING_DATA);
  shipping_userHTML.innerHTML = SHIPPING_DATA.name;
  shipping_locationHTML.innerHTML = SHIPPING_DATA.address;
  shipping_landmarkHTML.innerHTML = SHIPPING_DATA.landmark;
  shipping_phoneHTML.innerHTML = SHIPPING_DATA.phone;
  shipping_emailHTML.innerHTML = SHIPPING_DATA.email;
  shipping_msgHTML.innerHTML = SHIPPING_DATA.message;

  if (SHIPPING_DATA.differtAddress) {
    altAddressHTML.style.display = "block";
    alt_shipping_userHTML.innerHTML = SHIPPING_DATA.alt_name;
    alt_shipping_locationHTML.innerHTML = SHIPPING_DATA.alt_address;
    alt_shipping_landmarkHTML.innerHTML = SHIPPING_DATA.alt_landmark;
    alt_shipping_phoneHTML.innerHTML = SHIPPING_DATA.alt_phone;
    alt_shipping_emailHTML = SHIPPING_DATA.alt_email;
  }

  // let mainData = {
  //   amount: TOTAL_COST,
  //   name: USER_DETAILS.UserName,
  // };
  // let options = {
  //   method: "POST",
  //   headers: {
  //     "Content-Type": "application/json;charset=utf-8",
  //   },
  //   body: JSON.stringify({}),
  // };
  // console.log(options);
  const checkoutReq = firebase.functions().httpsCallable('checkoutReq');
  checkoutReq().then((res) => {
    console.log(res);
    console.log(res.data.orderId);
    RAZ_ORDER_ID = res.data.orderId;
    console.log(RAZ_ORDER_ID);
  }).catch(error => {
    console.log(error);
  })
  console.log(RAZ_ORDER_ID);

  const finalBtnSpanHTML = document.querySelector("#finalBtnSpan");
      finalBtnSpanHTML.innerHTML = `
      <a href="javascript;;"> 
        <button type="submit" id="final-btn" class="mybtn1 1">Proceed to Pay </button>
      </a>`;

  // fetch("https://raz-pay.herokuapp.com/checkout", options)
  // // fetch("http://localhost:3500/checkout", options)
  //   .then((res) => {
  //     return res.json();
  //   })
  //   .then((resData) => {
  //     console.log('resData', resData);
  //     RAZ_ORDER_ID = resData.orderId;
  //     alert('RAZ_ORDER_ID', RAZ_ORDER_ID)
  //     console.log('RAZ_ORDER_ID', RAZ_ORDER_ID);
  //   })
  //   .catch((error) => {
  //     console.log(error);
  //   });
};

// prodFinalHTML.addEventListener('click', displayShippingInfo);


//////////////////////////////////////////////////////////////////////////////////////////////////////////////




let options;

// options = {
//   key: "rzp_test_irSg3itoRV9kt3", // Enter the Key ID generated from the Dashboard
//   currency: "INR",
//   name: "LAKE OF CAKES",
//   description: "HAPPY SHOPPING",
//   image: "./../assets/images/logo.png",
//   order_id: RAZ_ORDER_ID, 
//   handler: function (response) {
//     RES = response;
//     alert(response.razorpay_signature);
//     console.log(response);
//     orderComplete(response);
//     // alert(response.razorpay_payment_id);
//     // alert(response.razorpay_order_id);
//   },
//   prefill: {
//     name: "Gaurav Kumar",
//     email: "gaurav.kumar@example.com",
//     contact: "9999999999",
//   },
//   notes: {
//     address: "Razorpay Corporate Office",
//   },
//   theme: {
//     color: "#f00",
//   },
// };
let rzp1;
// document.querySelector("#rzp-button1").addEventListener("click", (e) => {
//   e.preventDefault();
//   console.log(options);
//   rzp1 = new Razorpay(options);
//   rzp1.open();
// });


const exeRazPay = e => {
  e.preventDefault();
  console.log('up');
  console.log(RAZ_ORDER_ID);
  console.log(options);


  options = {
    key: "rzp_live_BfdC1FopDqRvQL", // Enter the Key ID generated from the Dashboard
    amount: "1000", 
    currency: "INR",
    name: "LAKE OF CAKES",
    description: "HAPPY SHOPPING",
    image: "./../assets/images/logo.png",
    order_id: RAZ_ORDER_ID, 
    handler: function (response) {
      RES = response;
      alert('razorpay_signature', response.razorpay_signature);
      console.log(response);
      orderComplete(response);
      // alert(response.razorpay_payment_id);
      // alert(response.razorpay_order_id);
    },
    prefill: {
      name: `a`,
      email: `a@a.com`,
      contact: "9999999999",
    },
    notes: {
      address: "Razorpay Corporate Office",
    },
    theme: {
      color: "#f00",
    },
  };
  console.log(options);
  rzp1 = new Razorpay(options);
  rzp1.open();
  rzp1.on("payment.failed", function (response) {
    alert(response.error.code);
    alert(response.error.description);
    alert(response.error.source);
    alert(response.error.step);
    alert(response.error.reason);
    alert(response.error.metadata.order_id);
    alert(response.error.metadata.payment_id);
    console.log(response);
    console.log(response.error);
  });
}


const orderComplete = (data) => {
  console.log(data);

  let options = {
    method: "POST",
    headers: {
      "Content-Type": "application/json;charset=utf-8",
    },
    body: JSON.stringify(data),
  };

  let RAZ_ORDER;
  // fetch("https://raz-pay.herokuapp.com/payment", options)
  // // fetch("http://localhost:3500/payment", options)
  // .then((res) => {
  //     return res.json();
  //   })
  //   .then((resData) => {
  //     console.log(resData);
  //   })
  //   .catch((error) => {
  //     console.log(error);
  //   });

  const payemnetStatus = firebase.functions().httpsCallable('payemnetStatus');
  payemnetStatus(mainData).then((res) => {
    console.log(res);
  }).catch(error => {
    console.log(error);
  })
}