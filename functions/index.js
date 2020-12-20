const functions = require("firebase-functions");
const Razorpay = require("razorpay");
const admin = require("firebase-admin");
const cryptoHmac = require("create-hmac");
admin.initializeApp();
var firebase = require("firebase");

const nodemailer = require('nodemailer');
var smtpTransport = require('nodemailer-smtp-transport');
const { log } = require("firebase-functions/lib/logger");

require('firebase/auth');
require('firebase/database');
require('firebase/storage');

var firebaseConfig = {
  apiKey: "AIzaSyATUjzcsSQMIKlEeBQqMGTy_4zugRTPILg",
  authDomain: "lake-of-cakes.firebaseapp.com",
  databaseURL: "https://lake-of-cakes.firebaseio.com",
  projectId: "lake-of-cakes",
  storageBucket: "lake-of-cakes.appspot.com",
  messagingSenderId: "779843608951",
  appId: "1:779843608951:web:48c6afe1773e2b395e8172",
  measurementId: "G-5ER0QF0FDW"
};

firebase.initializeApp(firebaseConfig);



const calBill = async (USER_ID, CHECKOUT_ID, coupan, shipeType, shipDate, shipTime, optional = null) => {

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
  if(!userDetails) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "only authenticated users can add requests"
    );
  }

  let zipFlag = false;
  if(!optional.formData.zip.startsWith('226')) {
    zipFlag = true;
  }
  if(optional.formData.differtAddress) {
    if(!optional.formData.alt_zip.startsWith('226')) {
      zipFlag = true;
    }
  }
  if(zipFlag) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "only authenticated users can add requests"
    );
  }

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
        egglessPrice = p.pdata.type.price;
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
  let discountPercentArr = [];
  let totalSubTotal = 0;
  basicPrices.map(p => {
    totalSubTotal += +p;
  })

  if (coupan) {
    let totalDis = 0;
    await admin.firestore().collection('coupans').doc(coupan).get().then(doc => {
      let docData = doc.data();
      if (docData.minAmt <= totalSubTotal) {
        basicPrices.map((el, i) => {
          discountPercentArr.push(+docData.amount);
          let d = el * (+docData.amount / 100);
          d = Number(d.toFixed(2));
          disArr.push(d);
          let eachDis = el - (d);
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
  let gstPercentArr = [];
  let counter = -1;
  // console.log(basicPrices);
  for (let p of userDetails.orders[index].products) {
    counter++;
    let gstPrice = 0;
    let gstPercent = 0;
    p.name = p.pdata.name;
    p.sno = p.pdata.sno;
    p.img = p.pdata.mainImgUrl;
    gstPercent = +p.pdata.gst;
    gstPercentArr.push(+gstPercent);
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
      for (let addon of userDetails.orders[index].addons) {
        await admin.firestore()
          .collection("addons")
          .doc(addon.id)
          .get()
          .then((addonDoc) => {
            let addonData = addonDoc.data();
            addon.name = addonData.name;
            addon.sno = addonData.sno;
            addon.img = addonData.imgUrl;
            addon.gst = addonData.gst;
            addon.basicPrice = addonData.sp;
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
      if (ship.type === shipeType) {
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

  if (optional.shipping) {
    admin.firestore().collection('orders').add({
      orderId: optional.orderId,
      paymentId: optional.paymentId,
      signature: optional.signature,
      user: USER_ID,
      shipping: optional.formData,
      order: userDetails.orders[index],
      basicPrice: bpArr,
      disArr: disArr,
      disPercentArr: discountPercentArr,
      gstPercentArr: gstPercentArr,
      gstArr: gstArr,
      addonCost: addonCost,
      shipeType: shipCat,
      shipeTypePrice: shipTimeCost,
      shipDate: dateDelivery,
      shipTime: timeDelivery,
      orderAt: new Date().toLocaleString("en-IN", {timeZone: 'Asia/Kolkata'}),
      total: TOTAL_COST,
      status: "pending",
      timeStamp: new Date()
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
  let siteStaus = false;
  await admin.firestore().collection("miscellaneous").doc('siteStatus').get().then(doc => {
    let docData = doc.data();
    console.log(docData);
    siteStaus = docData.status;
    console.log('docData.status', docData.status, 'siteStaus', siteStaus);
  })

  if (!siteStaus) {
    console.log(staus);
    throw new functions.https.HttpsError(
      "unauthenticated",
      "only authenticated users can add requests"
    );
  }

  // if (!context.auth) {
  //   console.log(context.auth);
  //   throw new functions.https.HttpsError(
  //     "unauthenticated",
  //     "only authenticated users can add requests"
  //   );
  // }
  // console.log(data);

  const USER_ID = data.userId;
  const CHECKOUT_ID = data.order;
  const coupan = data.coupan;
  const shipeType = data.type;
  const shipDate = data.date;
  const shipTime = data.time;
  const shippingData = data.shippingData;

  let optional = {
    shipping: false,
    formData: shippingData,
  }
  let TOTAL_COST = await calBill(USER_ID, CHECKOUT_ID, coupan, shipeType, shipDate, shipTime, optional)

  // const instance = new Razorpay({
  //   key_id: "rzp_live_BfdC1FopDqRvQL",
  //   key_secret: "AE2PN4j1ckML1UkpCRYggUxn",
  // });

  const instance = new Razorpay({
    key_id: 'rzp_test_nGNzxazP9gvHAE',
    key_secret: 'YWfbldEONyvUQcRZUSvGxGp6'
  });

  // console.log(data);

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
    options.publicKey = instance.key_id;
    // console.log(options);
  });
  return options;
});

exports.payemnetStatus = functions.https.onCall(async (data, context) => {
  let siteStaus = false;
  await admin.firestore().collection("miscellaneous").doc('siteStatus').get().then(doc => {
    let docData = doc.data();
    siteStaus = docData.status;
  })

  if (!siteStaus) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "only authenticated users can add requests"
    );
  }
  
  // if (!context.auth) {
  //   throw new functions.https.HttpsError(
  //     'unauthenticated',
  //     'only authenticated users can add requests'
  //   );
  // }
  // console.log(data);
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
  const expectSig = cryptoHmac('sha256', 'YWfbldEONyvUQcRZUSvGxGp6').update(dataKey.toString()).digest('hex');
  let status = false;
  if (expectSig === razorpay_signature) {
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
    status = "false";
  }
  return status;
});



var transporter = nodemailer.createTransport({

  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  service: 'gmail',
  auth: {
    user: 'reetikchitragupt@gmail.com',
    pass: 'myemail797355670645'
  },
  tls: {
    // do not fail on invalid certs
    rejectUnauthorized: false
  }
});


// Email Service
exports.sendEmailAfterReject = functions.firestore.document('Customers/{userId}').onUpdate(async (change) => {
  const newValue = change.after.data();

  // ...or the previous value before this update
  const previousValue = change.before.data();

  // console.log(previousValue)
  // access a particular field as you would any JS property
  const name = newValue.UserName;
  // console.log(newValue)

  //Create an options object that contains the time to live for the notification and the priority
  const mailOptions = {
    from: '"Lake of Cakes " <lakeofcakess@gmail.com>',
    to: newValue.Email,
  };
  // Building Email message.
  mailOptions.subject = 'Order Confirmation ';
  //for example
  mailOptions.html = `
  <h3><b>Complete your order with 10% discount</b>&nbsp;</h3>
  <p><br></p>
  <div style="text-align: center; "><img
          src="https://firebasestorage.googleapis.com/v0/b/lake-of-cakes.appspot.com/o/logo.png?alt=media&amp;token=2068ec5a-00e3-4828-94cd-60c5c1346fc6"
          style="width: 263.921px; height: 65.1px;"></div>
  <div style="text-align: center; "><br></div>
  <div style="text-align: center; "><br></div>
  <div style="text-align: left;">
      <div style="text-align: center;"><b>Hi `+ newValue.UserName + `,&nbsp;</b></div>
      <div style="text-align: center;"><b><br></b></div>
      <div style="text-align: center;">You were trying to shopping with us and to place an order for a gift for your
          loved ones. Have&nbsp;</div>
      <div style="text-align: center;">you faced any issue in doing so? In case you came across any issue or concern,
          just reply back&nbsp;</div>
      <div style="text-align: center; ">to this email. We would be happy to resolve your issue.</div>
      <h4 style="text-align: center; "><b><span style="font-family: &quot;Times New Roman&quot;;">While visiting our
                  website for place your order and get 10% off by entering</span><br><span
                  style="font-family: &quot;Times New Roman&quot;;">LOC10 coupon code (order value 499 &amp;
                  above)</span></b></h4>
     
  </div>
  <center>
      <table style="border: 2px solid red;padding: 30px;">
          <tr style="padding: 20px;margin: 15%;">
            <th>Product Image</th>
            <th>Name</th>
      
            
          </tr>
          <tr style="padding: 20px;margin: 15%;">
            <td><img src="https://t8x8a5p2.stackpathcdn.com/wp-content/uploads/2018/05/Birthday-Cake-Recipe-Image-720x720.jpg" width="90" alt=""></td>
            <td>cake ssjsjjjsdsd</td>
         
         
          </tr>
          <tr style="padding: 20px;margin: 15%;">
              <td><img src="https://t8x8a5p2.stackpathcdn.com/wp-content/uploads/2018/05/Birthday-Cake-Recipe-Image-720x720.jpg" width="90" alt=""></td>
              <td>cake jasadasd</td>
          
          </tr>
        
        </table>
        <h3 style="background-color: red;color: white;margin-left: 40%;margin-right: 40%;display: block;">Complete Your Order Now</h3>
        <small>*Please ignore this Mail if order already placed.</small>
        <br>
        <h4 style="font-weight: 800;">Call +91 - 9598891097</h4>
  </center>
  `
  try {
    // console.log("Inside try")
    transporter.sendMail(mailOptions);
    console.log('email sent to:', newValue.Email);
    transporter.close();
    // console.log(newValue.Email)
  } catch (error) {
    console.error('There was an error while sending the email:' + newValue.Email, error);
  }
});


exports.createUser = functions.firestore
  .document('Customers/{userId}')
  .onCreate((snap, context) => {
    const newValue = snap.data();
    // ...or the previous value before this update
    // const previousValue = change.before.data();

    // access a particular field as you would any JS property
    const name = newValue.UserName;

    //Create an options object that contains the time to live for the notification and the priority
    const mailOptions = {
      from: '"Lake of Cakes " <lakeofcakess@gmail.com>',
      to: newValue.Email,
    };
    // Building Email message.
    mailOptions.subject = 'Welcome to lakeofcakes';
    //for example
    mailOptions.html = `
<div><span style="font-size: 10.02pt; font-family: &quot;Times New Roman&quot;;"><b>Hi `+ newValue.UserName + `,</b></span></div><div><span style="font-size: 10.02pt; font-family: &quot;Times New Roman&quot;;"><b><br></b></span></div><div><span style="font-size: 10.02pt; font-family: &quot;Times New Roman&quot;;"><b> 
</b></span></div><div><span style="font-size: 10.02pt; font-family: &quot;Times New Roman&quot;;">Thank you for signing up with </span><u><span style="font-size: 10.02pt; font-family: TimesNewRoman, Bold; font-weight: bold;">Lakeofcakes.com</span><span style="font-size: 10.02pt; font-family: &quot;Times New Roman&quot;;">!</span></u></div><div><u><span style="font-size: 10.02pt; font-family: &quot;Times New Roman&quot;;"><br></span></u></div><div><u><span style="font-size: 10.02pt; font-family: &quot;Times New Roman&quot;;"> 
</span></u></div><div><span style="font-size: 10.02pt; font-family: &quot;Times New Roman&quot;;">Visiting our site just click Login or My Account at the top of page and then enter your e-mail &amp; password.</span></div><div><span style="font-size: 10.02pt; font-family: &quot;Times New Roman&quot;;"><br></span></div><div><span style="font-size: 10.02pt; font-family: &quot;Times New Roman&quot;;"> 
</span></div><div><span style="font-size: 10.02pt; font-family: &quot;Times New Roman&quot;;">When you log in to your account, you will be able to do the following : 
</span></div><ul><li><span style="font-size: 10.02pt; font-family: &quot;Times New Roman&quot;;"> – Proceed through checkout faster when making a purchase 
</span></li><li><span style="font-size: 10.02pt; font-family: &quot;Times New Roman&quot;;"> – Check the status of orders 
</span></li><li><span style="font-size: 10.02pt; font-family: &quot;Times New Roman&quot;;"> – View past orders 
</span></li><li><span style="font-size: 10.02pt; font-family: &quot;Times New Roman&quot;;"> – Make changes to your account information 
</span></li><li><span style="font-size: 10.02pt; font-family: &quot;Times New Roman&quot;;"> – Change your password 
</span></li></ul><div><span style="font-size: 10.02pt; font-family: &quot;Times New Roman&quot;;"><b>Further Help : 
</b></span></div><div><span style="font-size: 10.02pt; font-family: &quot;Times New Roman&quot;;">email us – info@lakeofcakes.com or call at +91 9598891097</span></div><div><span style="font-size: 10.02pt; font-family: &quot;Times New Roman&quot;;"><br></span></div><div style="text-align: center; "><span style="font-family: TimesNewRoman, Bold; font-size: 12pt; font-weight: bold;">Explore Our Categories&nbsp;</span></div><div style="text-align: center;"><br></div>
<div class="alignRow" style="width:35%;margin-right: auto;margin-left: auto;display: block;border:1px solid red">
<div style="border:1px solid red"><div style="float: left;
   padding: 10px;"><div style="text-align: center;">&nbsp; &nbsp;<img src="https://www.tastytweets.in/BackEndImage/ProductImages/regular-cakes-black-forest-tasty-tweets.jpg" alt="Snow" width="70" height="70">&nbsp;</div>
<p style="text-align: center;border:1px solid red">
	Cakes
</p>	
</div>
<div style="float: left;
   padding: 10px;"><div style="text-align: center;"><img src="https://5.imimg.com/data5/JU/RF/MY-8545911/wedding-bouquet-500x500.jpg" alt="Forest" width="70" height="70">&nbsp;</div>
<p style="text-align: center;border:1px solid red">
	Flowers
</p>
</div>
<div style="float: left;
   padding: 10px;"><div style="text-align: center;"><img src="https://res.cloudinary.com/groceryncart/image/upload/v1563106438/Stores/Store50/Product/Premium-Cake-combo-red-carnation-flowers6231758431555.png" alt="Mountains" width="70" height="70">&nbsp;</div>
<p style="text-align: center;border:1px solid red">
	Combos
</p>
</div>
<div style="float: left;
   padding: 10px;"><div style="text-align: center;"><img src="https://img.icons8.com/plasticine/2x/chocolate-bar.png" alt="Snow" width="70" height="70">&nbsp;</div>
<p style="text-align: center;border:1px solid red">
	Chocolate
</p>
</div>
<div style="float: left;
   padding: 10px;"><div style="text-align: center;">&nbsp; &nbsp;<img src="https://img.icons8.com/cotton/2x/birthday.png" alt="Snow" width="70" height="70">&nbsp;</div>
<p style="text-align: center;border:1px solid red">
	Birthday
</p>
</div>
<div style="float: left;
   padding: 10px;"><div style="text-align: center;"><img src="https://cdn0.iconfinder.com/data/icons/party-human-1/66/50-512.png" alt="Snow" width="70" height="70">&nbsp;</div>
<p style="text-align: center;border:1px solid red">
	Aniversary
</p>
</div>
<div style="float: left;
   padding: 10px;"><div style="text-align: center;"><img src="https://cdn3.iconfinder.com/data/icons/baby-essentials-black-white/512/Baby_Shower_BW-512.png" alt="Snow" width="70" height="70">&nbsp;</div>
<p style="text-align: center;border:1px solid red">
Occassions
</p>
</div>
<div style="float: left;
   padding: 10px;"><div style="text-align: center;"><img src="https://cdn2.iconfinder.com/data/icons/christmas-filled-outline-1/512/christmas_holiday_merry_xmas_tree_5-512.png" alt="Snow" width="70" height="70">&nbsp;</div>
<p style="text-align: center;border:1px solid red">
	Gifts
</p>
</div>
</div></div>
  `

    try {
      transporter.sendMail(mailOptions);
      console.log('email sent to:', newValue.Email);
      transporter.close();
      // console.log(newValue.Email)
    } catch (error) {
      console.error('There was an error while sending the email:' + newValue.Email, error);
    }


  });


exports.sendEmailAfterConfirmation = functions.firestore.document('Customers/{userId}').onUpdate(async (change) => {
  const newValue = change.after.data();

  // ...or the previous value before this update
  const previousValue = change.before.data();

  // access a particular field as you would any JS property
  const name = newValue.UserName;

  //Create an options object that contains the time to live for the notification and the priority
  const mailOptions = {
    from: '"Lake of Cakes " <lakeofcakess@gmail.com>',
    to: newValue.Email,
  };
  // Building Email message.
  mailOptions.subject = 'Order Confirmation ';
  //for example
  let duplicate = "";
  let delivertTypePrice = 0;
  let timeStamp, timeDate, dTime, shippingData, totalCost, deliverType;

  for (let o of newValue.orders) {
    if (o.status == "success") {
      for(op of o.products) {
        let opRef = admin.firestore().collection(op.cat).doc(op.prodId);
        await opRef.get().then(opDoc => {
          let cake = '';
          if(op.cake) {
            cake = `
            <pre>
            Weight : ${op.cake.weight} Kg 
            Shape : ${op.cake.heart ? 'Heart' : 'Not Opted'}
            Eggless : ${op.cake.eggless ? 'Opted' : 'Not Opted'}
            Flavour : ${op.cake.flavour} 
            `;
          }
          let opData = opDoc.data();
          duplicate += `
          <tr style="padding: 20px;margin: 15%;text-align: center;">
            <td style="border: 2px solid black;"><img
                    src="${opData.mainImgUrl}"
                    width="90" alt=""></td>
            <td style="border: 2px solid black;">${opData.name}
            ${cake}
            Message : ${op.message}
            Qty : ${op.qty}
            </pre>
            </td>
        </tr>
          `
        })
      }
      
    }
    // console.log(duplicate);
    timeStamp = o.success.orderTime;
    totalCost = o.success.totalCost;
    deliverType = o.success.type;
    if(deliverType === 'free') {
      dTime = '8:00AM to 5:00pM'
    } else if(deliverType === 'perfect') {
      dTime = timeStamp
    } else {
      dTime = `11:30PM to 12:00AM`
    }

    timeDate = o.success.date;
    await admin.firestore().collection('miscellaneous').doc('shipTimePrice').get().then(shipPriceDoc => {
      let shipPriceData = shipPriceDoc.data();
      for(sp of shipPriceData.shipTypes) {
        if(sp.type === deliverType) {
          delivertTypePrice = +sp.charge;
        }
      }
    })

    shippingData = o.success.shippingData;


  }


  mailOptions.html = `<div style="width: 100%;display:flex;border: 2px solid red; ">
  <div style="width: 80%"><img
          src="https://firebasestorage.googleapis.com/v0/b/lake-of-cakes.appspot.com/o/logo.png?alt=media&amp;token=2068ec5a-00e3-4828-94cd-60c5c1346fc6"
          style="width: 263.921px; height: 65.1px;"></div>
  <div style="margin: 1%;right:0;"><span style="font-size: 20px;">Order</span> <b
          style="font-size: 20px;">Placed</b></div>
</div>
<div style="width: 100%;display:flex;">
  <div style="width: 80%;margin: 1%;"> Hi ${newValue.UserName},<br>Your order has been successfully placed.</div>
  <div style="margin: 1%;right:0;"><span style="font-size: 20px;"></span> <b style="font-size: 15px;">Order placed
          on ${timeStamp}</b></div>
</div>
<div style="text-align: center; "><br></div>
<div style="text-align: center; "><br></div>
<div style="text-align: left;">
  <div style="text-align: center;"><b><br></b></div>
  <div style="text-align: left;">
      <h5 style="text-align: center; ">
          <font face="Times New Roman"><b>We are committed to serving you with utmost regard for your and your
                  product's safety. Hence, please&nbsp;</b></font>
          <font face="Times New Roman"><b>note, the delivery time of your order may change due to traffic &amp;
                  natural calamities (like rain, storm, fog&nbsp;</b></font>
          <h5 style="text-align: center; ">
              <font face="Times New Roman"><b>etc.) AND based on the government's zonal advisory in your area
                      regarding COVID-19.</b></font>
          </h5>
  </div>
</div>
<center>
  <div style="width: 80%;display:flex;border: 4px solid red;">
      <div style="width: 80%;margin: 1%;"><img
              src="https://firebasestorage.googleapis.com/v0/b/lake-of-cakes.appspot.com/o/Capture.PNG?alt=media&token=4140cc7f-c7cb-47be-846c-d0e9fadc46a9"
              width="330" style=" @media only screen and (min-width:900px) {
          width:900px !important;object-fit:cover;
      }   object-fit:cover;" alt=""></div>
  </div>
  <div style="margin: 1%;right:0;border: 2px solid brown;"><span style="font-size: 20px;"></span>
      <pre>
      Delivery By :${timeDate}
      ${dTime}
      <br><b>Delivery Address</b>
      <Br>
${shippingData.differtAddress ? shippingData.alt_name : shippingData.name}
${shippingData.differtAddress ? shippingData.alt_address : shippingData.address}
Lucknow 
Lucknow, Uttar Pradesh, ${shippingData.differtAddress ? shippingData.alt_zip :  shippingData.zip}
       <br>
Amount Paid :Rs ${totalCost}
          </pre>
  </div>
  <table style="border: 2px solid orange;padding: 30px;width: 100%;">
      <thead style="padding: 20px;margin: 15%;">
          <th>Product Image</th>
          <th>Name</th>
      </thead>
      `+ duplicate + `
  </table>
  <table style="float: right;margin-right: 5%;font-size: 20px;">
      <b><tr>
          <td>Item(s) total (including GST)</td>
          <td>${totalCost - delivertTypePrice}</td>
      </tr>
      <tr>
          <td>Perfect Hours Charges </td>
          <td>${delivertTypePrice}</td>
      </tr></b>
      <tr>
          <td style="font-weight: 800;">Amount Paid</td>
          <td style="font-weight: 800;">${totalCost}</td>
      </tr>
  </table>
  
</center>
<br>
<Br>
<br>
<br>
<div>
  <h4 style="margin-top: 8%;">
      Thank you for shopping with <b>Lake of Cakes!</b>
  </h4>
</div>
<div style="width: 100%;display:flex; ">
  <div style="width: 80%"><img
          src="https://firebasestorage.googleapis.com/v0/b/lake-of-cakes.appspot.com/o/logo.png?alt=media&amp;token=2068ec5a-00e3-4828-94cd-60c5c1346fc6"
          style="width: 263.921px; height: 65.1px;"></div>
  <div style="margin: 1%;right:0;">
      <img
          src="https://firebasestorage.googleapis.com/v0/b/lake-of-cakes.appspot.com/o/logo.png?alt=media&amp;token=2068ec5a-00e3-4828-94cd-60c5c1346fc6"
          style="width: 263.921px; height: 65.1px;">
  </div>
</div>`

  try {
    transporter.sendMail(mailOptions);
    console.log('email sent to:', newValue.Email);
    transporter.close();
    // console.log(newValue.Email)
  } catch (error) {
    console.error('There was an error while sending the email:' + newValue.Email, error);
  }

});