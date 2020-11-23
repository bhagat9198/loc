const functions = require("firebase-functions");
const cryptoHmac = require("create-hmac");
const Razorpay = require("razorpay");
const admin = require("firebase-admin");
admin.initializeApp();

// exports.helloWorld = functions.https.onRequest((request, response) => {
//  response.send("Hello from Firebase!");
// });

exports.checkoutReq = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "only authenticated users can add requests"
    );
  }
  console.log(data);
  let USER_ID = data.userId;
  let CHECKOUT_ID = data.order;

  let userRef = admin.firestore().collection("Customers").doc(USER_ID);
  let userDetails;
  await userRef
    .get()
    .then((doc) => {
      let docData = doc.data();
      userDetails = docData;
      return;
    })
    .catch((error) => {
      console.log(error);
    });
  let index = -1;
  for (let o of userDetails.orders) {
    index++;
    if (Number(o.orderId) === Number(CHECKOUT_ID)) {
      console.log(o);
      break;
    }
  }

  let TOTAL_COST = 0;
  console.log('userDetails', userDetails);
  console.log('index', index);
  for (let p of userDetails.orders[index].products) {
    prodRef = db.collection(p.cat).doc(p.prodId);
    prodRef.get().then((doc) => {
      let docData = doc.data();
      p.pdata = docData;
      return;
    }).catch((error) => {
      console.log(error);
    })
  }

  let basicPrices = [];

  for (let p of userDetails.orders[index].products) {
    let totalProdPrice = 0;
    let basicPrice = 0;
    let heartPrice = 0;
    let egglessPrice = 0;

    if (p.cake) {
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
      totalProdPrice = Math.round(Number(basicPrice) + Number(egglessPrice) + Number(heartPrice));
      basicPrices.push(totalProdPrice);
    } else {
      totalProdPrice = Math.round(Number(p.pdata.sp));
      basicPrices.push(totalProdPrice);
    }
    totalProdPrice = totalProdPrice * Number(p.qty);

    TOTAL_COST = TOTAL_COST + totalProdPrice;
  }

  for (p of USER_DETAILS.orders[INDEX].products) {
    counter++;
    let gstPrice = 0;
    let gstPercent = 0;
    gstPercent = Number(p.pdata.gst);
    gstPrice = Math.round((basicPrices[counter] * Number(p.qty) * (Number(gstPercent) / 100)));
    TOTAL_COST = TOTAL_COST + gstPrice;
  }

  let addonCost = 0;
  if (userDetails.orders[index].addons) {
    if (userDetails.orders[index].addons.length > 0) {
      for (addon of userDetails.orders[index].addons) {
        admin.firestore
          .collection("addons")
          .doc(addon.id)
          .get()
          .then((addonDoc) => {
            let addonData = addonDoc.data();
            addonCost += Number(addonData.price()) * Number(addon.qty);
            return;
          })
          .catch((error) => {
            console.log(error);
          });
      }
    }
  }
  TOTAL_COST += addonCost;

  var instance = new Razorpay({
    key_id: "rzp_live_BfdC1FopDqRvQL",
    key_secret: "AE2PN4j1ckML1UkpCRYggUxn",
  });

  console.log(data);

  let options = {
    "entity": "order",
    "amount": TOTAL_COST,
    "amount_paid": 0,
    "amount_due": TOTAL_COST,
    "receipt": USER_DETAILS.name,
    "status": "created",
    "created_at": new Date(),
    "currency": "INR",
  }

  await instance.orders.create(options, (err, order) => {
    if (err) {
      console.log(err);
    }
    console.log(options);
    options.orderId = order.id;
    console.log(options);
  });
  return options;
});

exports.payemnetStatus = functions.https.onCall((data, context) => {
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

  const dataKey = razorpay_order_id + "|" + razorpay_payment_id;
  const expectSig = cryptoHmac("sha256", "AE2PN4j1ckML1UkpCRYggUxn")
    .update(dataKey.toString())
    .digest("hex");
  console.log(expectSig);
  let status;
  if (expectSig === razorpay_signature) {
    status = true;
  } else {
    status = false;
  }
  return res.status(200).json(status);
});
