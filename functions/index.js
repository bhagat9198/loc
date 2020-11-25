const functions = require("firebase-functions");
const Razorpay = require("razorpay");
const admin = require("firebase-admin");
const cryptoHmac = require("create-hmac");
admin.initializeApp();

// exports.helloWorld = functions.https.onRequest((request, response) => {
//  response.send("Hello from Firebase!");
// });

const calBill = async(USER_ID, CHECKOUT_ID, coupan, shipeType, shipDate, shipTime, optional = null) => {

  let userRef = await admin.firestore().collection("Customers").doc(USER_ID);
  let userDetails;
  await userRef
    .get()
    .then((doc) => {
      let docData = doc.data();
      userDetails = docData;
    })
    .catch((error) => {
      console.log(error);
    });
  let index = -1;
  for (let o of userDetails.orders) {
    index++;
    if (Number(o.orderId) === Number(CHECKOUT_ID)) {
      break;
    }
  }

  let TOTAL_COST = 0;
  // console.log('userDetails', userDetails);
  // console.log('index', index);
  for (let p of userDetails.orders[index].products) {
    prodRef = admin.firestore().collection(p.cat).doc(p.prodId);
    await prodRef.get().then((doc) => {
      let docData = doc.data();
      p.pdata = docData;
    }).catch((error) => {
      console.log(error);
    })
  }

  basicPrices = [];
  for (let p of userDetails.orders[index].products) {
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
      }

      if (p.cake.eggless) {
        egglessPrice = p.pdata.type.price ;
      }

      if (p.cake.heart) {
        heartPrice = p.pdata.shapes[0].shapePrice;
      }

      totalProdPrice = (+basicPrice + +egglessPrice + +heartPrice) * (+p.qty);
      totalProdPrice = Number(totalProdPrice.toFixed(2));
      basicPrices.push(totalProdPrice);
    } else {
      totalProdPrice = (+p.pdata.sp) * (+p.qty);
      totalProdPrice = Number(totalProdPrice.toFixed(2));
      basicPrices.push(totalProdPrice);
    }
    TOTAL_COST = TOTAL_COST + totalProdPrice;
    TOTAL_COST = Number(TOTAL_COST.toFixed(2));
  }  
  // console.log(TOTAL_COST);    
  // console.log('basicPrices', basicPrices);
  let bpArr = basicPrices.slice();
  let disArr = [];
  let totalSubTotal = 0;
  basicPrices.map(p => {
    totalSubTotal += +p;
  })
  if(coupan) {
    let totalDis = 0;
    await admin.firestore().collection('coupans').doc(coupan).get().then(doc => {
      let docData = doc.data();
        if(docData.minAmt <= totalSubTotal) {
          basicPrices.map((el, i) => {
            let d = el * (+docData.amount/100);
            d = Number(d.toFixed(2));
            disArr.push(d);
            let eachDis =  el - (d);
            eachDis = Number(eachDis.toFixed(2));
            basicPrices[i] = eachDis;
            totalDis += d;
          });
        }
    })
    TOTAL_COST = TOTAL_COST - totalDis;
    TOTAL_COST = Number(TOTAL_COST.toFixed(2));
    // console.log(TOTAL_COST);
  }
  // console.log('disArr', disArr);

  let gstArr = [];
  let counter = -1;
  // console.log(basicPrices);
  for (p of userDetails.orders[index].products) {
    counter++;
    let gstPrice = 0;
    let gstPercent = 0;
    gstPercent = +p.pdata.gst;
    gstPrice = +basicPrices[counter] * (+gstPercent / 100);
    gstArr.push(gstPrice);
    gstPrice = Number(gstPrice.toFixed(2));
    // console.log(TOTAL_COST);
    TOTAL_COST = TOTAL_COST + gstPrice;
  }
  // console.log('gstArr', gstArr);

  let addonCost = 0;
  if (userDetails.orders[index].addons) {
    if (userDetails.orders[index].addons.length > 0) {
      for (addon of userDetails.orders[index].addons) {
        await admin.firestore()
          .collection("addons")
          .doc(addon.id)
          .get()
          .then((addonDoc) => {
            let addonData = addonDoc.data();
            addonCost += Number(addonData.price) * Number(addon.qty);
          })
          .catch((error) => {
            console.log(error);
          });
      }
    }
  }
  // console.log(addonCost);
  // console.log(TOTAL_COST);
  TOTAL_COST += addonCost;
  // console.log(TOTAL_COST);
  TOTAL_COST = Math.round(TOTAL_COST);

  let shipTimeCost = 0;
  let shipCat = '', timeDelivery = '', dateDelivery = '';
  await admin.firestore().collection('miscellaneous').doc('shipTimePrice').get().then(shipDoc => {
    let shipData = shipDoc.data();
    // console.log(shipData);
    shipData.shipTypes.map(ship => {
      if(ship.type === shipeType) {
        shipTimeCost = ship.charge;
        shipCat = ship.type;
        timeDelivery = shipTime;
        dateDelivery = shipDate;
      }
    })
  })

  TOTAL_COST = TOTAL_COST + +shipTimeCost;

  userDetails.orders[index].products.map(pp => {
    delete pp.pdata;
  })

  if(optional.shipping) {
    admin.firestore().collection('orders').add({
      orderId: optional.orderId,
      paymentId: optional.paymentId,
      signature: optional.signature,
      user: USER_ID,
      shipping: optional.formData,
      order: userDetails.orders[index],
      basicPrice: bpArr,
      disArr: disArr,
      gstArr: gstArr,
      addonCost: addonCost,
      shipeType: shipCat,
      shipDate: dateDelivery,
      shipTime: timeDelivery
    }).then(s => {
      // console.log('saved', s);
    }).catch(error => {
      // console.log(error);
    })
  } else {
    return TOTAL_COST;
  }
}

exports.checkoutReq = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "only authenticated users can add requests"
    );
  }
  console.log(data);
  
  const USER_ID = data.userId;
  const CHECKOUT_ID = data.order;
  const coupan = data.coupan;
  const shipeType = data.type;
  const shipDate = data.date;
  const shipTime = data.time;

  let optional = {
    shipping: false
  }
  let TOTAL_COST = await calBill(USER_ID, CHECKOUT_ID, coupan, shipeType, shipDate, shipTime, optional)

  // const instance = new Razorpay({
  //   key_id: "rzp_live_BfdC1FopDqRvQL",
  //   key_secret: "AE2PN4j1ckML1UkpCRYggUxn",
  // });

  const instance = new Razorpay({
    key_id: 'rzp_test_VkBZNRiEBUKNu5',
    key_secret: 'T4Lx7KUbbfPaIHvRWQsxx4WL'
  });

  console.log(data);

  const options = {
		amount: TOTAL_COST * 100,
		currency: "INR",
		receipt: data.name,
	}; 

  await instance.orders.create(options, (err, order) => {
    if (err) {
      console.log(err);
    }
    // console.log(options);
    options.orderId = order.id;
    // console.log(options);
  });
  return options;
});

exports.payemnetStatus = functions.https.onCall(async(data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'only authenticated users can add requests'
    );
  }
  console.log(data);
  const razorpay_payment_id = data.razorpay_payment_id;
	const razorpay_order_id = data.razorpay_order_id;
  const razorpay_signature = data.razorpay_signature;
  const USER_ID = data.userId;
  const CHECKOUT_ID = data.order;
  const coupan = data.coupan;
  const formData = data.formData;
  const shipeType = data.type;
  const shipDate = data.date;
  const shipTime = data.time;
   
	const dataKey = razorpay_order_id + '|' + razorpay_payment_id; 
  const expectSig = cryptoHmac('sha256', 'T4Lx7KUbbfPaIHvRWQsxx4WL').update(dataKey.toString()).digest('hex');
  let status = false;
	if(expectSig === razorpay_signature) {
    // console.log('razorpay_signature', razorpay_signature);
    status = "true";  
    let shippingData = {
      paymentId: razorpay_payment_id,
      orderId: razorpay_order_id,
      signature: razorpay_signature,
      formData: formData,
      shipping: true
    }
    await calBill(USER_ID, CHECKOUT_ID, coupan, shipeType, shipDate, shipTime, shippingData);
  } else {  
    console.log('razorpay_signature', razorpay_signature);  
    status = "false";
  }
  return status;
});
