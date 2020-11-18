console.log("checkout1.js");

const db = firebase.firestore();
const storageService = firebase.storage();

let CHECKOUT_ID, USER_ID, USER_DETAILS, PROD_DETAILS, ADDONS_DETAILS;
const bpHTML = document.querySelector('#bp');
const gstHTML = document.querySelector('#gst');
const checkoutTotalHTML = document.querySelector('#checkout-total');
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
    console.log(response);
    CHECKOUT_ID = response.checkout;
    console.log(CHECKOUT_ID);
    if (!CHECKOUT_ID) {
      window.location.href = "./../Auth/login.html";
    } else {
      USER_ID = localStorage.getItem('locLoggedInUser');
      displayDetails1();
    }
  });
}


let INDEX = -1;
const displayDetails1 = async() => {
  console.log(USER_ID);
  USER_REF = await db.collection('Customers').doc(USER_ID);
  await USER_REF.get().then(doc => {
    let docData = doc.data();
    USER_DETAILS = docData;
    console.log(USER_DETAILS);
  })
  console.log(USER_DETAILS);
  for(let o of USER_DETAILS.orders) {
    INDEX ++;
    if(o.id === CHECKOUT_ID) {
      break;
    }
  }
  console.log(USER_DETAILS.orders[INDEX].cat);

  PROD_REF = await db.collection(USER_DETAILS.orders[INDEX].cat).doc(USER_DETAILS.orders[INDEX].prodId);
  await PROD_REF.get().then(doc => {
    let docData = doc.data();
    PROD_DETAILS = docData;
    console.log(PROD_DETAILS);
  })

  if(USER_DETAILS.orders[INDEX].addAddons.length > 0) {
    ADDON_REF = db.collection('addons');
    await ADDON_REF.get().then(snapshots => {
      let snapshotDocs = snapshots.docs;
      ADDONS_DETAILS = snapshotDocs;
    })
  } 
  calculatePricing();
  
}

const extraPriceHTML = document.querySelector('#extra-price');
const totalCostHTML = document.querySelector('#total-cost');
const addonSpanHTML = document.querySelector('#addon-span');
const discountSpanHTML = document.querySelector('#discount-span');

const calculatePricing = () => {
  let li = '';

  if(USER_DETAILS.orders[INDEX].heart) {
    console.log(USER_DETAILS.orders[INDEX].heart);
    TOTAL_COST = TOTAL_COST + +PROD_DETAILS.shapes[0].shapePrice;
    li += `
    <li>
      <p>
        Heart Shape
      </p>
      <P>
        <b class="bp" id="bp">₹${PROD_DETAILS.shapes[0].shapePrice}</b>
      </P>
    </li>
    `;
  }

  if(USER_DETAILS.orders[INDEX].eggless) {
    console.log(USER_DETAILS.orders[INDEX].eggless);
    TOTAL_COST = TOTAL_COST + +PROD_DETAILS.type.price;
    li += `
    <li>
      <p>
        Eggless
      </p>
      <P>
        <b class="bp" id="bp">₹${PROD_DETAILS.type.price}</b>
      </P>
    </li>
    `;
  }
  extraPriceHTML.innerHTML = li;

  if(USER_DETAILS.orders[INDEX].pricing.weight) {
    for(let weight of PROD_DETAILS.weights) {
      if(weight.cakeWeight === USER_DETAILS.orders[INDEX].pricing.weight) {
        TOTAL_COST = TOTAL_COST + +weight.weightPrice;
        bpHTML.innerHTML = `₹${weight.weightPrice}`;
        break;
      }
    } 
  } else {
    TOTAL_COST = TOTAL_COST + +PROD_DETAILS.sp;
  }

  TOTAL_COST = TOTAL_COST * +USER_DETAILS.orders[INDEX].qty;
  let gst = TOTAL_COST * (+PROD_DETAILS.gst/100);
  gstHTML.innerHTML =`₹${gst}`;
  TOTAL_COST = TOTAL_COST + gst;
  totalCostHTML.innerHTML = `₹${TOTAL_COST}`;

  let addonCost = 0;
  if(USER_DETAILS.orders[INDEX].addAddons.length > 0) {
    USER_DETAILS.orders[INDEX].addAddons.map(addon => {
      for(let add of ADDONS_DETAILS) {
        if(add.id === addon.id) {
          addonCost = addonCost + (+add.data().price * +addon.qty);
        }
      }
    })
    TOTAL_COST = TOTAL_COST + addonCost;
    addonSpanHTML.innerHTML = `
    <ul class="order-list">
      <li>
        <p>
          Addons
        </p>
        <P>
          <b>₹${addonCost}</b>
        </P>
      </li>
    </ul>
    <div class="total-price">
      <p>
        Total
      </p>
      <p>
        <span id="total-cost">₹${TOTAL_COST}</span>
      </p>
    </div>
    `;

  } else {
    console.log('else');
    addonSpanHTML.innerHTML = `
    <ul class="order-list">
      <li>
        <p>
          Addons
        </p>
        <P>
          <b >₹0</b>
        </P>
      </li>
    </ul>
    <div class="total-price">
      <p>
        Total
      </p>
      <p>
        <span id="total-cost">₹${TOTAL_COST}</span>
      </p>
    </div>
    `;
  }

  discountSpanHTML.innerHTML = `
  <ul class="order-list">
    <li>
      <p>
        Discount
      </p>
      <P>
        <b >₹0</b>
      </P>
    </li>
  </ul>
  <div class="total-price">
    <p>
      Final Price
    </p>
    <p>
      <span id="total-cost">₹${TOTAL_COST}</span>
    </p>
  </div>
  `;

}


const coupanApplyHTML = document.querySelector('#coupanApply');

const checkCoupon = async(e) => {
  alert('checkCoupon');
  let coupanDetails, coupanId;
  let flag = false;
  // const code = checkCouponFormHTML['code'].value;
  const code = document.querySelector('#code').value;
  alert(code)
  let coupanRef = await db.collection('coupans');
  alert(coupanRef)
  
  await coupanRef.get().then(snapshots => {
    alert(snapshots)
    let snapshotDocs = snapshots.docs;
    for(let doc of snapshotDocs) {
      let docData = doc.data();
      if(docData.name === code) {
        alert(docData)
        coupanDetails = docData;
        coupanId = coupanId;
        flag = true;
        break;
      }
    }
  })

  if(flag) {
    console.log('flag', coupanDetails);
    // add snackbar
    alert(coupanDetails)
    let cType, cAmt, discount;
    if(coupanDetails.category === 'percentage') {
      cType = 'percentage';
      cAmt = coupanDetails.amount;
      discount = TOTAL_COST * (+cAmt/100);
      TOTAL_COST = TOTAL_COST - discount;
    } else {
      cType = 'price';
      cAmt = coupanDetails.amount;
      discount = +cAmt;
      TOTAL_COST = TOTAL_COST - discount;
    }

    discountSpanHTML.innerHTML = '';
    discountSpanHTML.innerHTML = `
    <ul class="order-list">
      <li>
        <p>
          Discount
        </p>
        <P>
          <b >₹${discount}</b>
        </P>
      </li>
    </ul>
    <div class="total-price">
      <p>
        Final Price
      </p>
      <p>
        <span id="total-cost">₹${TOTAL_COST}</span>
      </p>
    </div>`;
  } else {
    // invalid
  }

}

coupanApplyHTML.addEventListener('click', checkCoupon);

const form1ShippingHTML = document.querySelector('#form1-shipping');

const form1 = e => {
  e.preventDefault();

  const name = form1ShippingHTML['name'].value;
  const phone = form1ShippingHTML['phone'].value;
  const email = form1ShippingHTML['email'].value;
  const address = form1ShippingHTML['address'].value;
  const landmark = form1ShippingHTML['landmark'].value;
  const customer_country = form1ShippingHTML['customer_country'].value;
  const city = form1ShippingHTML['city'].value;
  const zip = form1ShippingHTML['zip'].value;

  const shipDiffAddress = form1ShippingHTML.querySelector('#ship-diff-address');
  if(shipDiffAddress.checked) {
    shipping_name = form1ShippingHTML['shipping_name'].value;
    shipping_phone = form1ShippingHTML['shipping_phone'].value;
    shipping_address = form1ShippingHTML['shipping_address'].value;
    shipping_landmark = form1ShippingHTML['shipping_landmark'].value;
    shipping_country = form1ShippingHTML['shipping_country'].value;
    shipping_city = form1ShippingHTML['shipping_city'].value;
    shipping_zip = form1ShippingHTML['shipping_zip'].value;
  }
  const order_notes = form1ShippingHTML['order_notes'].value;
}


form1ShippingHTML.addEventListener('submit', form1);
