const functions = require("firebase-functions");
const Razorpay = require("razorpay");
const admin = require("firebase-admin");
const cryptoHmac = require("create-hmac");
admin.initializeApp();
var firebase = require("firebase");

const nodemailer = require('nodemailer');
var smtpTransport = require('nodemailer-smtp-transport');

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
      shipTime: timeDelivery,
      orderAt : new Date()
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
exports.sendEmailAfterOrderConfirmation = functions.firestore.document('Customers/{userId}').onUpdate(async (change) => {
  console.log("Came into Function")
  const newValue = change.after.data();

  // ...or the previous value before this update
  const previousValue = change.before.data();

  // access a particular field as you would any JS property
  const name = newValue.UserName;
  console.log("--------------------------------------------"+name)

  //Create an options object that contains the time to live for the notification and the priority
  const mailOptions = {
    from: '"Lake of Cakes " <lakeofcakess@gmail.com>',
    to: newValue.Email,
  };
  console.log("SSSSSSSS")
  // Building Email message.
  mailOptions.subject = 'Order Confirmation ';
  //for example
  mailOptions.html = `<p style="color:black;" >Hello</p>`

  console.log("SSSSSSSS")
  try {
    console.log("Inside try")
    transporter.sendMail(mailOptions);
    console.log('email sent to:', newValue.Email);
    transporter.close();
    console.log(newValue.Email)
  } catch (error) {
    console.error('There was an error while sending the email:' + newValue.Email, error);
  }

});


exports.createUser = functions.firestore
    .document('Customers/{userId}')
    .onCreate((snap, context) => {
  console.log("Came into Function")
  const newValue = snap.data();

  // ...or the previous value before this update
  // const previousValue = change.before.data();

  // access a particular field as you would any JS property
  const name = newValue.UserName;
  console.log("--------------------------------------------"+name)

  //Create an options object that contains the time to live for the notification and the priority
  const mailOptions = {
    from: '"Lake of Cakes " <lakeofcakess@gmail.com>',
    to: newValue.Email,
  };
  console.log("SSSSSSSS")
  // Building Email message.
  mailOptions.subject = 'Welcome to lakeofcakes';
  //for example
  mailOptions.html =`
<div><span style="font-size: 10.02pt; font-family: &quot;Times New Roman&quot;;"><b>Hi `+newValue.UserName+`,</b></span></div><div><span style="font-size: 10.02pt; font-family: &quot;Times New Roman&quot;;"><b><br></b></span></div><div><span style="font-size: 10.02pt; font-family: &quot;Times New Roman&quot;;"><b> 
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

  console.log("SSSSSSSS")
  try {
    console.log("Inside try")
    transporter.sendMail(mailOptions);
    console.log('email sent to:', newValue.Email);
    transporter.close();
    console.log(newValue.Email)
  } catch (error) {
    console.error('There was an error while sending the email:' + newValue.Email, error);
  }


});

