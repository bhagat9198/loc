const functions = require("firebase-functions");
const Razorpay = require("razorpay");
const admin = require("firebase-admin");
const cryptoHmac = require("create-hmac");
admin.initializeApp();
var firebase = require("firebase");
// let cron = require('node-cron');
const nodemailer = require("nodemailer");
var smtpTransport = require("nodemailer-smtp-transport");

require("firebase/auth");
require("firebase/database");
require("firebase/storage");

var firebaseConfig = {
  apiKey: "AIzaSyATUjzcsSQMIKlEeBQqMGTy_4zugRTPILg",
  authDomain: "lake-of-cakes.firebaseapp.com",
  databaseURL: "https://lake-of-cakes.firebaseio.com",
  projectId: "lake-of-cakes",
  storageBucket: "lake-of-cakes.appspot.com",
  messagingSenderId: "779843608951",
  appId: "1:779843608951:web:48c6afe1773e2b395e8172",
  measurementId: "G-5ER0QF0FDW",
};

firebase.initializeApp(firebaseConfig);

const calBill = async (
  USER_ID,
  CHECKOUT_ID,
  coupan,
  shipeType,
  shipDate,
  shipTime,
  optional = null
) => {
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
  if (!userDetails) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "only authenticated users can add requests"
    );
  }

  // let zipFlag = false;
  // if (!optional.formData.zip.startsWith("226")) {
  //   zipFlag = true;
  // }
  // if (optional.formData.differtAddress) {
  //   if (!optional.formData.alt_zip.startsWith("226")) {
  //     zipFlag = true;
  //   }
  // }
  // if (zipFlag) {
  //   throw new functions.https.HttpsError(
  //     "unauthenticated",
  //     "only authenticated users can add requests"
  //   );
  // }

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
    await prodRef
      .get()
      .then((doc) => {
        let docData = doc.data();
        p.pdata = docData;
      })
      .catch((error) => {
        console.log(error);
      });
  }

  basicPrices = [];
  for (let p of userDetails.orders[index].products) {
    let totalProdPrice = 0;
    let basicPrice = 0;
    let heartPrice = 0;
    let egglessPrice = 0;

    if (p.cake) {
      for (let w of p.pdata.weights) {
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

      totalProdPrice = (+basicPrice + +egglessPrice + +heartPrice) * +p.qty;
      totalProdPrice = Number(totalProdPrice.toFixed(2));
      basicPrices.push(totalProdPrice);
    } else {
      totalProdPrice = +p.pdata.sp * +p.qty;
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
  basicPrices.map((p) => {
    totalSubTotal += +p;
  });

  if (coupan) {
    let totalDis = 0;
    await admin
      .firestore()
      .collection("coupans")
      .doc(coupan)
      .get()
      .then((doc) => {
        let docData = doc.data();
        if (docData.minAmt <= totalSubTotal) {
          basicPrices.map((el, i) => {
            discountPercentArr.push(+docData.amount);
            let d = el * (+docData.amount / 100);
            d = Number(d.toFixed(2));
            disArr.push(d);
            let eachDis = el - d;
            eachDis = Number(eachDis.toFixed(2));
            basicPrices[i] = eachDis;
            totalDis += d;
          });
        }
      });
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
        await admin
          .firestore()
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
  let shipCat = "",
    timeDelivery = "",
    dateDelivery = "";
  await admin
    .firestore()
    .collection("miscellaneous")
    .doc("shipTimePrice")
    .get()
    .then((shipDoc) => {
      let shipData = shipDoc.data();
      // console.log(shipData);
      shipData.shipTypes.map((ship) => {
        if (ship.type === shipeType) {
          shipTimeCost = ship.charge;
          shipCat = ship.type;
          timeDelivery = shipTime;
          dateDelivery = shipDate;
        }
      });
    });

  TOTAL_COST = TOTAL_COST + +shipTimeCost;

  userDetails.orders[index].products.map((pp) => {
    delete pp.pdata;
  });

  if (optional.shipping) {
    admin
      .firestore()
      .collection("orders")
      .add({
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
        orderAt: new Date().toLocaleString("en-IN", {
          timeZone: "Asia/Kolkata",
        }),
        total: TOTAL_COST,
        status: "pending",
        timeStamp: new Date(),
      })
      .then((s) => {
        // console.log('saved', s);
      })
      .catch((error) => {
        // console.log(error);
      });
  } else {
    return TOTAL_COST;
  }
};

exports.checkoutReq = functions.https.onCall(async (data, context) => {
  let siteStaus = false;
  await admin
    .firestore()
    .collection("miscellaneous")
    .doc("siteStatus")
    .get()
    .then((doc) => {
      let docData = doc.data();
      siteStaus = docData.status;
    });

  if (!siteStaus) {
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
  };
  let TOTAL_COST = await calBill(
    USER_ID,
    CHECKOUT_ID,
    coupan,
    shipeType,
    shipDate,
    shipTime,
    optional
  );

  // const instance = new Razorpay({
  //   key_id: "rzp_live_BfdC1FopDqRvQL",
  //   key_secret: "AE2PN4j1ckML1UkpCRYggUxn",
  // });

  const instance = new Razorpay({
    key_id: "rzp_live_dD1gOe69HsJlKW",
    key_secret: "60OhpkbQHUEB2WZpr4gapEgz",
  });

  // const instance = new Razorpay({
  //   key_id: "rzp_test_uuuINNuYrv9Gol",
  //   key_secret: "NeJX5JuHh9Prgox7nZl8PIn4",
  // });

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
  await admin
    .firestore()
    .collection("miscellaneous")
    .doc("siteStatus")
    .get()
    .then((doc) => {
      let docData = doc.data();
      siteStaus = docData.status;
    });

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

  const dataKey = razorpay_order_id + "|" + razorpay_payment_id;
  // live
  const expectSig = cryptoHmac("sha256", "60OhpkbQHUEB2WZpr4gapEgz")
    // test
    // const expectSig = cryptoHmac("sha256", "NeJX5JuHh9Prgox7nZl8PIn4")
    .update(dataKey.toString())
    .digest("hex");
  let status = false;
  if (expectSig === razorpay_signature) {
    // console.log('razorpay_signature', razorpay_signature);
    status = "true";
    let shippingData = {
      paymentId: razorpay_payment_id,
      orderId: razorpay_order_id,
      signature: razorpay_signature,
      formData: formData,
      shipping: true,
    };
    await calBill(
      USER_ID,
      CHECKOUT_ID,
      coupan,
      shipeType,
      shipDate,
      shipTime,
      shippingData
    );
  } else {
    status = "false";
  }
  return status;
});

var transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  service: "gmail",
  auth: {
    user: "reply.lakeofcakess@gmail.com", 
    pass: "official@20loc20" 
  },
  tls: {
    // do not fail on invalid certs
    rejectUnauthorized: false,
  },
});

// Email Service

exports.sendEmailForgetPass = functions.firestore
  .document("Customers/{userId}")
  .onUpdate(async (change) => {
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

    //for example

    if (newValue.forgotCode && newValue.forgotCode != "verified") {
      mailOptions.subject = "Forgot Password ? Lake of cakes   ";
      //for example
      mailOptions.html =
        `
        <p><br></p> <style type="text/css">
    /* Default CSS */
    body,#body_style {margin: 0; padding: 0; background: #f9f9f9; font-size: 14px; color: #5b656e;}
    a {color: #09c;}
    a img {border: none; text-decoration: none;}
    table, table td {border-collapse: collapse;}
    td, h1, h2, h3 {font-family: tahoma, geneva, sans-serif; color: #313a42;}
    h1, h2, h3, h4 {color: #313a42 !important; font-weight: normal; line-height: 1.2;}
    h1 {font-size: 24px;}
    h2 {font-size: 18px;}
    h3 {font-size: 16px;}
    p {margin: 0 0 1.6em 0;}
   
    /* Force Outlook to provide a "view in browser" menu link. */
    #outlook a {padding:0;}
   
    /* Preheader and webversion */
    .preheader {background-color: #5b656e;}
    .preheaderContent,.webversion,.webversion a {color: white; font-size: 10px;}
    .preheaderContent{width: 440px;}
    .preheaderContent,.webversion {padding: 5px 10px;}
    .webversion {width: 200px; text-align: right;}
    .webversion a {text-decoration: underline;}
    .webversion,.webversion a {color: #ffffff; font-size: 10px;}
   
    /* Topheader */
    .topHeader {background: #ffffff;}
   
    /* Logo (branding) */
    .logoContainer {padding: 20px 0 10px 0px; width: 320px;}
    .logoContainer a {color: #ffffff;}
   
    /* Whitespace (imageless spacer) and divider */
    .whitespace, .whitespaceDivider {font-family: 0px; line-height: 0px;}
    .whitespaceDivider {border-bottom: 1px solid #cccccc;}
   
    /* Button */
    .buttonContainer {padding: 10px 0px 10px 0px;}
    .button {padding: 5px 5px 5px 5px; text-align: center; background-color: #51c4d4}
    .button a {color: #ffffff; text-decoration: none; font-size: 13px;}
   
    /* Section */
    .sectionMainTitle{font-family: Tahoma, sans-serif; font-size: 16px; padding: 0px 0px 5px 0;}
    .sectionArticleTitle, .sectionMainTitle {color: #5b656e;}
   
    /* An article */
    .sectionArticleTitle, .sectionArticleContent {text-align: center; padding: 0px 5px 0px 5px;}
    .sectionArticleTitle {font-size: 12px; font-weight: bold;}
    .sectionArticleContent {font-size: 10px; line-height: 12px;}
    .sectionArticleImage {padding: 8px 0px 0px 0px;}
    .sectionArticleImage img {padding: 0px 0px 10px 0px; -ms-interpolation-mode: bicubic; display: block;}
   
    /* Footer and Social media */
    .footer {background-color: #51c4d4;}
    .footNotes {padding: 0px 20px 0px 20px;}
    .footNotes a {color: #ffffff; font-size: 13px;}
    .socialMedia {background: #5b656e;}
   
    /* Article image */
    .sectionArticleImage {padding: 8px 0px 0px 0px;}
    .sectionArticleImage img {padding: 0px 0px 10px 0px; -ms-interpolation-mode: bicubic; display: block;}
   
    /* Product card */
    .card {background-color: #ffffff; border-bottom: 2px solid #5b656e;}
   
    /* Column */
    .column {padding-bottom: 20px;}
   
   
    /* CSS for specific screen width(s) */
    @media only screen and (max-width: 480px) {
        body[yahoofix] table {width: 100% !important;}
        body[yahoofix] .webversion {display: none; font-size: 0; max-height: 0; line-height: 0; mso-hide: all;}
        body[yahoofix] .logoContainer {text-align: center;}
        body[yahoofix] .logo {width: 80%;}
        body[yahoofix] .buttonContainer {padding: 0px 20px 0px 20px;}
        body[yahoofix] .column {float: left; width: 100%; margin: 0px 0px 30px 0px;}
        body[yahoofix] .card {padding: 20px 0px;}
      }
  </style>

  <div style="text-align: center;"><img src="https://firebasestorage.googleapis.com/v0/b/lake-of-cakes.appspot.com/o/logo.png?alt=media&amp;token=2068ec5a-00e3-4828-94cd-60c5c1346fc6" style="width: 263.921px; height: 65.1px;"></div>
  <div style="text-align: center; "><br></div>
  <div style="text-align: center; "><br></div>
  <div "="">
  <div style="text-align: center;"><b>Hi ` +
        newValue.UserName +
        `</b></div>
    <div style="text-align: center;"><b><br></b></div>
    <div style="text-align: center;"><table width="100%" cellpadding="0" cellspacing="0" border="0" style="text-align: center; color: rgb(34, 34, 34); font-family: Roboto, RobotoDraft, Helvetica, Arial, sans-serif; table-layout: fixed; overflow-wrap: break-word;"><tbody><tr><td style="font-family: Roboto, RobotoDraft, Helvetica, Arial, sans-serif; margin: 0px; font-weight: bold;">Your verification code for resetting LOC password is&nbsp;<span style="color: rgb(91, 101, 110); font-family: &quot;Helvetica Neue&quot;, Helvetica, Arial, sans-serif;">` +
        newValue.forgotCode +
        `</span>.<br></td></tr><tr><td style="font-family: Roboto, RobotoDraft, Helvetica, Arial, sans-serif; margin: 0px; padding-bottom: 25px;">Please input this verification code in the input box to reset your LOC password.</td></tr></tbody></table></div>
    <h4 style="text-align: center; "><font face="Times New Roman"><b>The Lakeofcakes Team.</b></font></h4></div><center><small>*</small><span style="color: rgb(34, 34, 34); font-family: Roboto, RobotoDraft, Helvetica, Arial, sans-serif; text-align: start;">Please do not reply to this email. The mailbox that generated this email is not monitored for replies.</span><br>
      <h4 style="font-weight: 800;">Call +91 - 9598891097</h4>
  </center>
  <table border="0" cellspacing="0" summary="" width="640" align="center" style="text-align: center; background-color: rgb(255, 255, 255);">
      <tbody><tr><td colspan="2" class="whitespace" height="20">&nbsp;</td></tr>
      <tr>
        <td class="column" width="20%" align="center">
          <p><img width="60px;height:60px;object-fit:cover" src="https://firebasestorage.googleapis.com/v0/b/lake-of-cakes.appspot.com/o/emailImages%2FWhatsApp%20Image%202020-12-31%20at%2018.32.04%20(2).jpeg?alt=media&token=a263cfa0-38b2-4071-931e-e6bcec0677b5" alt="Lorem ipsum"><p>
          <p>Midnight Delivery</p>
        </td>
         <td class="column" width="20%" align="center">
          <p><img width="60px;height:60px;object-fit:cover" src="https://firebasestorage.googleapis.com/v0/b/lake-of-cakes.appspot.com/o/emailImages%2FWhatsApp%20Image%202020-12-31%20at%2018.32.04%20(1).jpeg?alt=media&token=8f225388-dab5-4d49-a567-cd918f64d7fc"></p><p>Fast Delivery</p>
        </td>
         <td class="column" width="20%" align="center">
          <p><img width="60px;height:60px;object-fit:cover" src="https://firebasestorage.googleapis.com/v0/b/lake-of-cakes.appspot.com/o/emailImages%2FWhatsApp%20Image%202020-12-31%20at%2018.32.05.jpeg?alt=media&token=2bdb4c6e-2d26-422b-8d7c-5f09c5d67ed4"></p><p>Free Delivery</p>
        </td>
      </tr>
    </tbody></table>
    <div style="text-align: center;"><br></div>
  <p style="text-align: center; "><b><font color="#000000" style="">Please contact us if you have any query or need any assistance. Keep visiting lakeofcakes.com for make
        your day memorable. </font></b></p>
    <!-- Social media -->
    <table border="0" cellspacing="0" cellpadding="0" width="100%" summary="" class="socialMedia" style="text-align: center;">
      <tbody><tr><td class="whitespace" height="20">&nbsp;</td></tr>
      <tr>
        <td>
          <table border="0" cellspacing="0" cellpadding="0" width="120" align="center" summary="">
            <tbody><tr>
              <td align="center" width="32">
                <a href="https://www.facebook.com/Lake-Of-Cakes-100900995221365" title="Twitter"><img src="https://www.windowscentral.com/sites/wpcentral.com/files/topic_images/2016/new-instagram-icon-topic.png" width="29" alt="Twitter"></a>
              </td>
              <td align="center" width="32">
                <a href="https://www.instagram.com/lake_of_cakes/" title="Facebook"><img src="https://www.expectmorearizona.org/wp-content/uploads/2016/11/facebook-png-icon-follow-us-facebook-1.png" width="29" alt="Facebook"></a>
              </td>
            </tr>
          </tbody></table>
        </td>
      </tr>
      <tr><td class="whitespace" height="10">&nbsp;</td></tr>
    </tbody></table>
 
   
 
    `;
      try {
        transporter.sendMail(mailOptions);
        transporter.close();
      } catch (error) {
        console.error(
          "There was an error while sending the email:" + newValue.Email,
          error
        );
      }
    }
    // Building Email message.
  });

exports.sendEmailNotifications = functions.firestore
  .document("emailNotifications/{userId}")
  .onCreate(async (snap, context) => {
    let newValue = snap.data();

    var template = newValue.template;
    var status = newValue.status;
    var subject = newValue.subject;

    await admin
      .firestore()
      .collection("Customers")
      .get()
      .then(async function (querySnapshot) {
        querySnapshot.forEach(async function (doc2) {
          // doc2.data() is never undefined for query doc2 snapshots
          if (status == "pending") {
            var email = doc2.data().Email;
          } else {
          }
        });
      });
    //Create an options object that contains the time to live for the notification and the priority
  });

exports.createUser = functions.firestore
  .document("Customers/{userId}")
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
    mailOptions.subject = "Welcome to lakeofcakes";
    //for example
    mailOptions.html =
      `
      <style type="text/css">
  /* Default CSS */
  body,#body_style {margin: 0; padding: 0; background: #f9f9f9; font-size: 14px; color: #5b656e;}
  a {color: #09c;}
  a img {border: none; text-decoration: none;}
  table, table td {border-collapse: collapse;}
  td, h1, h2, h3 {font-family: tahoma, geneva, sans-serif; color: #313a42;}
  h1, h2, h3, h4 {color: #313a42 !important; font-weight: normal; line-height: 1.2;}
  h1 {font-size: 24px;}
  h2 {font-size: 18px;}
  h3 {font-size: 16px;}
  p {margin: 0 0 1.6em 0;}
 
  /* Force Outlook to provide a "view in browser" menu link. */
  #outlook a {padding:0;}
 
  /* Preheader and webversion */
  .preheader {background-color: #5b656e;}
  .preheaderContent,.webversion,.webversion a {color: white; font-size: 10px;}
  .preheaderContent{width: 440px;}
  .preheaderContent,.webversion {padding: 5px 10px;}
  .webversion {width: 200px; text-align: right;}
  .webversion a {text-decoration: underline;}
  .webversion,.webversion a {color: #ffffff; font-size: 10px;}
 
  /* Topheader */
  .topHeader {background: #ffffff;}
 
  /* Logo (branding) */
  .logoContainer {padding: 20px 0 10px 0px; width: 320px;}
  .logoContainer a {color: #ffffff;}
 
  /* Whitespace (imageless spacer) and divider */
  .whitespace, .whitespaceDivider {font-family: 0px; line-height: 0px;}
  .whitespaceDivider {border-bottom: 1px solid #cccccc;}
 
  /* Button */
  .buttonContainer {padding: 10px 0px 10px 0px;}
  .button {padding: 5px 5px 5px 5px; text-align: center; background-color: #51c4d4}
  .button a {color: #ffffff; text-decoration: none; font-size: 13px;}
 
  /* Section */
  .sectionMainTitle{font-family: Tahoma, sans-serif; font-size: 16px; padding: 0px 0px 5px 0;}
  .sectionArticleTitle, .sectionMainTitle {color: #5b656e;}
 
  /* An article */
  .sectionArticleTitle, .sectionArticleContent {text-align: center; padding: 0px 5px 0px 5px;}
  .sectionArticleTitle {font-size: 12px; font-weight: bold;}
  .sectionArticleContent {font-size: 10px; line-height: 12px;}
  .sectionArticleImage {padding: 8px 0px 0px 0px;}
  .sectionArticleImage img {padding: 0px 0px 10px 0px; -ms-interpolation-mode: bicubic; display: block;}
 
  /* Footer and Social media */
  .footer {background-color: #51c4d4;}
  .footNotes {padding: 0px 20px 0px 20px;}
  .footNotes a {color: #ffffff; font-size: 13px;}
  .socialMedia {background: #5b656e;}
 
  /* Article image */
  .sectionArticleImage {padding: 8px 0px 0px 0px;}
  .sectionArticleImage img {padding: 0px 0px 10px 0px; -ms-interpolation-mode: bicubic; display: block;}
 
  /* Product card */
  .card {background-color: #ffffff; border-bottom: 2px solid #5b656e;}
 
  /* Column */
  .column {padding-bottom: 20px;}
 
 
  /* CSS for specific screen width(s) */
  @media only screen and (max-width: 480px) {
      body[yahoofix] table {width: 100% !important;}
      body[yahoofix] .webversion {display: none; font-size: 0; max-height: 0; line-height: 0; mso-hide: all;}
      body[yahoofix] .logoContainer {text-align: center;}
      body[yahoofix] .logo {width: 80%;}
      body[yahoofix] .buttonContainer {padding: 0px 20px 0px 20px;}
      body[yahoofix] .column {float: left; width: 100%; margin: 0px 0px 30px 0px;}
      body[yahoofix] .card {padding: 20px 0px;}
    }
</style>
<div><span style="font-size: 10.02pt; font-family: &quot;Times New Roman&quot;;"><b>Hi ` +
      newValue.UserName +
      `,</b></span></div><div><span style="font-size: 10.02pt; font-family: &quot;Times New Roman&quot;;"><b><br></b></span></div><div><span style="font-size: 10.02pt; font-family: &quot;Times New Roman&quot;;"><b>
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

<a href="https://lakeofcakes.com/Products/products.html?cat=C0ab0eaGzmtjCKQMnvh5&&tag="></a><br><br><table border="0" cellspacing="0" summary="" width="640" align="center" style="background-color: #ffffff;">
    <tbody><tr><td colspan="2" class="whitespace" height="20">&nbsp;</td></tr>
    <tr>
      <td class="column" width="20%" align="center">
      <a href="https://lakeofcakes.com/Products/products.html?cat=C0ab0eaGzmtjCKQMnvh5"><img src="https://www.tastytweets.in/BackEndImage/ProductImages/regular-cakes-black-forest-tasty-tweets.jpg" alt="Snow" width="70" height="70">
      <p style="text-align: center;border:1px solid red">
   Cakes
      </p></a>
      </td>
       <td class="column" width="20%" align="center">
       <a href="https://lakeofcakes.com/Products/products.html?cat=H6gtdNb9j9gMDbtI2dl2"><img src="https://5.imimg.com/data5/JU/RF/MY-8545911/wedding-bouquet-500x500.jpg" alt="Forest" width="70" height="70">&nbsp;
       <p style="text-align: center;border:1px solid red">
         Flowers
       </p></a>
      </td>
       <td class="column" width="20%" align="center">
        <a href="https://lakeofcakes.com/Products/products.html?cat=X6zGkffjLRkw1lL5IzPM"><img src="https://res.cloudinary.com/groceryncart/image/upload/v1563106438/Stores/Store50/Product/Premium-Cake-combo-red-carnation-flowers6231758431555.png" alt="Mountains" width="70" height="70">&nbsp;
       <p style="text-align: center;border:1px solid red">
         Combos
          </p></a>
      </td>
      <td class="column" width="20%" align="center">
        <a href="https://lakeofcakes.com/Products/products.html?cat=H6gtdNb9j9gMDbtI2dl2"><img src="https://cdn.iconscout.com/icon/free/png-512/chocolate-bar-candy-dairymilk-sweet-dessert-food-emoj-symbol-30664.png" alt="Mountains" width="70" height="70">&nbsp;
       <p style="text-align: center;border:1px solid red">
         Chocolates
          </p></a>
      </td>
      </tr>
     
      <tr><td class="column" width="20%" align="center">
      <a href="https://lakeofcakes.com/Products/products.html?cat=kTrnO3gHeFlnt9iyj0fd"><img src="https://img.icons8.com/cotton/2x/birthday.png" alt="Snow" width="70" height="70">&nbsp;
      <p style="text-align: center;border:1px solid red">
        Birthday
      </p></a>
      </td>
     <td class="column" width="20%" align="center">
      <a href="https://lakeofcakes.com/Products/products.html?cat=UrAAKMYXo4I8ZwXruHUJ"><img src="https://cdn0.iconfinder.com/data/icons/party-human-1/66/50-512.png" alt="Snow" width="70" height="70">&nbsp;
      <p style="text-align: center;border:1px solid red">
        Aniversary
      </p></a>
      </td>
      <td class="column" width="20%" align="center">
      <a href="https://lakeofcakes.com/Products/products.html?cat=JpQvf8VgrtJab6MwlqIZ"><img src="https://cdn3.iconfinder.com/data/icons/baby-essentials-black-white/512/Baby_Shower_BW-512.png" alt="Snow" width="70" height="70">&nbsp;
        <p style="text-align: center;border:1px solid red">
        Occassions
        </p></a>
      </td>
      <td class="column" width="20%" align="center">
      <a href="https://lakeofcakes.com/Products/products.html?cat=M4HMSBiyVbvIjPR9EHNg"><img src="https://cdn2.iconfinder.com/data/icons/christmas-filled-outline-1/512/christmas_holiday_merry_xmas_tree_5-512.png" alt="Snow" width="70" height="70">&nbsp;
<p style="text-align: center;border:1px solid red">
Gifts
</p></a>
      </td>
    </tr>
  </tbody></table><a href="https://lakeofcakes.com/Products/products.html?cat=yli4KpHGbARJakJfZdVr">


<table border="0" cellspacing="0" summary="" width="640" align="center" style="background-color: #ffffff;">
    <tbody><tr><td colspan="2" class="whitespace" height="20">&nbsp;</td></tr>
    <tr>
      <td class="column" width="20%" align="center">
      <p><img width="60px;height:60px;object-fit:cover" src="https://firebasestorage.googleapis.com/v0/b/lake-of-cakes.appspot.com/o/emailImages%2FWhatsApp%20Image%202020-12-31%20at%2018.32.04%20(2).jpeg?alt=media&token=a263cfa0-38b2-4071-931e-e6bcec0677b5" alt="Lorem ipsum"></p> 
      <p>Midnight Delivery</p>
      </td>
       <td class="column" width="20%" align="center">
        <p><img width="60px;height:60px;object-fit:cover" src="https://firebasestorage.googleapis.com/v0/b/lake-of-cakes.appspot.com/o/emailImages%2FWhatsApp%20Image%202020-12-31%20at%2018.32.04%20(1).jpeg?alt=media&token=8f225388-dab5-4d49-a567-cd918f64d7fc"></p><p>Fast Delivery</p>
      </td>
       <td class="column" width="20%" align="center">
        <p><img width="60px;height:60px;object-fit:cover" src="https://firebasestorage.googleapis.com/v0/b/lake-of-cakes.appspot.com/o/emailImages%2FWhatsApp%20Image%202020-12-31%20at%2018.32.05.jpeg?alt=media&token=2bdb4c6e-2d26-422b-8d7c-5f09c5d67ed4"></p><p>Free Delivery</p>
      </td>
    </tr>
  </tbody></table>
  <br>
<p style="text-align: center; "><b><font color="#000000" style="">Please contact us if you have any query or need any assistance. Keep visiting lakeofcakes.com for make
      your day memorable. </font></b></p>
  <!-- Social media -->
  <table border="0" cellspacing="0" cellpadding="0" width="100%" summary="" class="socialMedia">
    <tbody><tr><td class="whitespace" height="20">&nbsp;</td></tr>
    <tr>
      <td>
        <table border="0" cellspacing="0" cellpadding="0" width="120" align="center" summary="">
          <tbody><tr>
            <td align="center" width="32">
              <a href="https://www.facebook.com/Lake-Of-Cakes-100900995221365" title="Twitter"><img src="https://www.windowscentral.com/sites/wpcentral.com/files/topic_images/2016/new-instagram-icon-topic.png" width="29" alt="Twitter"></a>
            </td>
            <td align="center" width="32">
              <a href="https://www.instagram.com/lake_of_cakes/" title="Facebook"><img src="https://www.expectmorearizona.org/wp-content/uploads/2016/11/facebook-png-icon-follow-us-facebook-1.png" width="29" alt="Facebook"></a>
            </td>
          </tr>
        </tbody></table>
      </td>
    </tr>
    <tr><td class="whitespace" height="10">&nbsp;</td></tr>
  </tbody></table></a>
  `;

    try {
      transporter.sendMail(mailOptions);
      transporter.close();
    } catch (error) {
      console.error(
        "There was an error while sending the email:" + newValue.Email,
        error
      );
    }
  });

exports.sendEmailAfterConfirmation = functions.firestore
  .document("Customers/{userId}")
  .onUpdate(async (change) => {
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
    mailOptions.subject = "Order Confirmation ";
    //for example
    let duplicate = ``;
    let delivertTypePrice = 0;
    let timeStamp,
      timeDate,
      dTime,
      shippingData,
      totalCost,
      deliverType = 0;
    var showOrders = "false";
    let duplicatAddons = "";
    let i = -1;
    let successOrderId = "";

    for (let o of newValue.orders) {
      i++;
      let pv = previousValue.orders[i];
      if (o.status == "success" && pv.status == "cancelled") {
        successOrderId = o.successOrderId;
        for (let op of o.products) {
          let opRef = admin.firestore().collection(op.cat).doc(op.prodId);
          await opRef.get().then((opDoc) => {
            let cake = "";
            if (op.cake) {
              cake = `
                <p>
                  <ul>
                    <li>
                    Weight : ${op.cake.weight} Kg
                    </li>
                    <li>
                    Shape : ${op.cake.heart ? "Heart" : "Not Opted"}
                    </li>
                    <li>
                    Eggless : ${op.cake.eggless ? "Opted" : "Not Opted"}
                    </li>
                    <li>
                    Flavour : ${op.cake.flavour}
                    </li>
                  </ul>
                </p>
                `;
            }
            let opData = opDoc.data();
            duplicate += `

            <tr style="border-collapse:collapse">
            <td align="left" style="padding:0;Margin:0;padding-left:20px;padding-right:20px">
             <table width="100%" cellspacing="0" cellpadding="0" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
               <tr style="border-collapse:collapse">
                <td valign="top" align="center" style="padding:0;Margin:0;width:640px">
                 <table width="100%" cellspacing="0" cellpadding="0" role="presentation" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
                   <tr style="border-collapse:collapse">
                    <td align="center" style="padding:0;Margin:0;padding-bottom:10px;font-size:0">
                     <table width="100%" height="100%" cellspacing="0" cellpadding="0" border="0" role="presentation" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
                       <tr style="border-collapse:collapse">
                        <td style="padding:0;Margin:0;border-bottom:1px solid #EFEFEF;background:#FFFFFF none repeat scroll 0% 0%;height:1px;width:100%;margin:0px"></td>
                       </tr>
                     </table></td>
                   </tr>
                 </table></td>
               </tr>
             </table></td>
           </tr>
           <tr style="border-collapse:collapse">
            <td align="left" style="Margin:0;padding-top:5px;padding-bottom:10px;padding-left:20px;padding-right:20px">
             <!--[if mso]><table style="width:640px" cellpadding="0" cellspacing="0"><tr><td style="width:218px" valign="top"><![endif]-->
             <table class="es-left" cellspacing="0" cellpadding="0" align="left" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;float:left">
               <tr style="border-collapse:collapse">
                <td class="es-m-p0r es-m-p20b" valign="top" align="center" style="padding:0;Margin:0;width:218px">
                 <table width="100%" cellspacing="0" cellpadding="0" role="presentation" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
                   <tr style="border-collapse:collapse">
                    <td align="center" style="padding:0;Margin:0;font-size:0"><a href="https://lakeofcakes.com/UserDash/customerProfile.html" target="_blank" style="-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-family:arial, 'helvetica neue', helvetica, sans-serif;font-size:14px;text-decoration:underline;color:#D48344">
                      <img src="${opData.mainImgUrl}" alt="Natural Balance L.I.D., sale 30%" class="adapt-img" title="Natural Balance L.I.D., sale 30%" width="125" style="display:block;border:0;outline:none;text-decoration:none;-ms-interpolation-mode:bicubic"></a></td>
                   </tr>
                 </table></td>
               </tr>
             </table>
             <!--[if mso]></td><td style="width:20px"></td><td style="width:402px" valign="top"><![endif]-->
             <table cellspacing="0" cellpadding="0" align="right" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
               <tr style="border-collapse:collapse">
                <td align="left" style="padding:0;Margin:0;width:402px">
                 <table width="100%" cellspacing="0" cellpadding="0" role="presentation" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
                   <tr style="border-collapse:collapse">
                    <td align="left" style="padding:0;Margin:0"><p style="Margin:0;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-size:14px;font-family:arial, 'helvetica neue', helvetica, sans-serif;line-height:21px;color:#333333"><br></p>
                     <table style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;width:100%" class="cke_show_border" cellspacing="1" cellpadding="1" border="0" role="presentation">
                       <tr style="border-collapse:collapse">
                        <td style="padding:0;Margin:0">${opData.name}<br><br></td>
                        <td style="padding:0;Margin:0;width:60px;text-align:center">${op.qty}</td>
               
                       </tr>
                     </table><p style="Margin:0;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-size:14px;font-family:arial, 'helvetica neue', helvetica, sans-serif;line-height:21px;color:#333333"><br></p></td>
                   </tr>
                 </table></td>
               </tr>
             </table>
             <!--[if mso]></td></tr></table><![endif]--></td>
           </tr>

 
              `;
          });
        }

        // addons

        for (let addd of o.addons) {
          // adon detail
          await admin
            .firestore()
            .collection("addons")
            .doc(addd.id)
            .get()
            .then((addDoc) => {
              let adddData = addDoc.data();
              // add name

              duplicatAddons += `
       
              <tr style="border-collapse:collapse">
              <td align="left" style="padding:0;Margin:0;padding-left:20px;padding-right:20px">
               <table width="100%" cellspacing="0" cellpadding="0" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
                 <tr style="border-collapse:collapse">
                  <td valign="top" align="center" style="padding:0;Margin:0;width:640px">
                   <table width="100%" cellspacing="0" cellpadding="0" role="presentation" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
                     <tr style="border-collapse:collapse">
                      <td align="center" style="padding:0;Margin:0;padding-bottom:10px;font-size:0">
                       <table width="100%" height="100%" cellspacing="0" cellpadding="0" border="0" role="presentation" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
                         <tr style="border-collapse:collapse">
                          <td style="padding:0;Margin:0;border-bottom:1px solid #EFEFEF;background:#FFFFFF none repeat scroll 0% 0%;height:1px;width:100%;margin:0px"></td>
                         </tr>
                       </table></td>
                     </tr>
                   </table></td>
                 </tr>
               </table></td>
             </tr>
             <tr style="border-collapse:collapse">
              <td align="left" style="Margin:0;padding-top:5px;padding-bottom:10px;padding-left:20px;padding-right:20px">
               <!--[if mso]><table style="width:640px" cellpadding="0" cellspacing="0"><tr><td style="width:218px" valign="top"><![endif]-->
               <table class="es-left" cellspacing="0" cellpadding="0" align="left" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;float:left">
                 <tr style="border-collapse:collapse">
                  <td class="es-m-p0r es-m-p20b" valign="top" align="center" style="padding:0;Margin:0;width:218px">
                   <table width="100%" cellspacing="0" cellpadding="0" role="presentation" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
                     <tr style="border-collapse:collapse">
                      <td align="center" style="padding:0;Margin:0;font-size:0"><a href="https://viewstripo.email" target="_blank" style="-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-family:arial, 'helvetica neue', helvetica, sans-serif;font-size:14px;text-decoration:underline;color:#D48344">
                        <img src="${adddData.imgUrl}" alt="Natural Balance L.I.D., sale 30%" class="adapt-img" title="Natural Balance L.I.D., sale 30%" width="125" style="display:block;border:0;outline:none;text-decoration:none;-ms-interpolation-mode:bicubic"></a></td>
                     </tr>
                   </table></td>
                 </tr>
               </table>
               <!--[if mso]></td><td style="width:20px"></td><td style="width:402px" valign="top"><![endif]-->
               <table cellspacing="0" cellpadding="0" align="right" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
                 <tr style="border-collapse:collapse">
                  <td align="left" style="padding:0;Margin:0;width:402px">
                   <table width="100%" cellspacing="0" cellpadding="0" role="presentation" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
                     <tr style="border-collapse:collapse">
                      <td align="left" style="padding:0;Margin:0"><p style="Margin:0;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-size:14px;font-family:arial, 'helvetica neue', helvetica, sans-serif;line-height:21px;color:#333333"><br></p>
                       <table style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;width:100%" class="cke_show_border" cellspacing="1" cellpadding="1" border="0" role="presentation">
                         <tr style="border-collapse:collapse">
                          <td style="padding:0;Margin:0">${adddData.name}<br><br></td>
                          <td style="padding:0;Margin:0;width:60px;text-align:center">${addd.qty}</td>
                          <td style="padding:0;Margin:0;width:100px;text-align:center"><strong><span></span></strong><br></td>
                         </tr>
                       </table><p style="Margin:0;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-size:14px;font-family:arial, 'helvetica neue', helvetica, sans-serif;line-height:21px;color:#333333"><br></p></td>
                     </tr>
                   </table></td>
                 </tr>
               </table>
               <!--[if mso]></td></tr></table><![endif]--></td>
             </tr>
                `;
            });
        }

        if (o.success) {
          if (o.success.orderTime) {
            timeStamp = o.success.orderTime;
          }
          if (o.success.totalCost) {
            totalCost = o.success.totalCost;
          }
          if (o.success.type) {
            deliverType = o.success.type;
          }
          timeDate = o.success.date;
        }

        if (deliverType === "free") {
          dTime = "8:00AM to 5:00pM";
        } else if (deliverType === "perfect") {
          dTime = timeStamp;
        } else {
          dTime = `11:30PM to 12:00AM`;
        }

        await admin
          .firestore()
          .collection("miscellaneous")
          .doc("shipTimePrice")
          .get()
          .then((shipPriceDoc) => {
            let shipPriceData = shipPriceDoc.data();
            for (sp of shipPriceData.shipTypes) {
              if (sp.type === deliverType) {
                delivertTypePrice = +sp.charge;
              }
            }
          });

        shippingData = o.success.shippingData;

        mailOptions.html = `
         
        <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
        <html xmlns="http://www.w3.org/1999/xhtml" xmlns:o="urn:schemas-microsoft-com:office:office" style="width:100%;font-family:arial, 'helvetica neue', helvetica, sans-serif;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;padding:0;Margin:0">
         <head>
          <meta charset="UTF-8">
          <meta content="width=device-width, initial-scale=1" name="viewport">
          <meta name="x-apple-disable-message-reformatting">
          <meta http-equiv="X-UA-Compatible" content="IE=edge">
          <meta content="telephone=no" name="format-detection">
          <title>New email template 2020-12-23</title>
          <!--[if (mso 16)]>
            <style type="text/css">
            a {text-decoration: none;}
            </style>
            <![endif]-->
          <!--[if gte mso 9]><style>sup { font-size: 100% !important; }</style><![endif]-->
          <!--[if gte mso 9]>
        <xml>
            <o:OfficeDocumentSettings>
            <o:AllowPNG></o:AllowPNG>
            <o:PixelsPerInch>96</o:PixelsPerInch>
            </o:OfficeDocumentSettings>
        </xml>
        <![endif]-->
          <style type="text/css">
        #outlook a {
          padding:0;
        }
        .ExternalClass {
          width:100%;
        }
        .ExternalClass,
        .ExternalClass p,
        .ExternalClass span,
        .ExternalClass font,
        .ExternalClass td,
        .ExternalClass div {
          line-height:100%;
        }
        .es-button {
          mso-style-priority:100!important;
          text-decoration:none!important;
        }
        a[x-apple-data-detectors] {
          color:inherit!important;
          text-decoration:none!important;
          font-size:inherit!important;
          font-family:inherit!important;
          font-weight:inherit!important;
          line-height:inherit!important;
        }
        .es-desk-hidden {
          display:none;
          float:left;
          overflow:hidden;
          width:0;
          max-height:0;
          line-height:0;
          mso-hide:all;
        }
        @media only screen and (max-width:600px) {p, ul li, ol li, a { font-size:16px!important; line-height:150%!important } h1 { font-size:30px!important; text-align:center; line-height:120%!important } h2 { font-size:26px!important; text-align:center; line-height:120%!important } h3 { font-size:20px!important; text-align:center; line-height:120%!important } h1 a { font-size:30px!important } h2 a { font-size:26px!important } h3 a { font-size:20px!important } .es-header-body p, .es-header-body ul li, .es-header-body ol li, .es-header-body a { font-size:16px!important } .es-footer-body p, .es-footer-body ul li, .es-footer-body ol li, .es-footer-body a { font-size:16px!important } .es-infoblock p, .es-infoblock ul li, .es-infoblock ol li, .es-infoblock a { font-size:12px!important } *[class="gmail-fix"] { display:none!important } .es-m-txt-c, .es-m-txt-c h1, .es-m-txt-c h2, .es-m-txt-c h3 { text-align:center!important } .es-m-txt-r, .es-m-txt-r h1, .es-m-txt-r h2, .es-m-txt-r h3 { text-align:right!important } .es-m-txt-l, .es-m-txt-l h1, .es-m-txt-l h2, .es-m-txt-l h3 { text-align:left!important } .es-m-txt-r img, .es-m-txt-c img, .es-m-txt-l img { display:inline!important } .es-button-border { display:block!important } .es-btn-fw { border-width:10px 0px!important; text-align:center!important } .es-adaptive table, .es-btn-fw, .es-btn-fw-brdr, .es-left, .es-right { width:100%!important } .es-content table, .es-header table, .es-footer table, .es-content, .es-footer, .es-header { width:100%!important; max-width:600px!important } .es-adapt-td { display:block!important; width:100%!important } .adapt-img { width:100%!important; height:auto!important } .es-m-p0 { padding:0!important } .es-m-p0r { padding-right:0!important } .es-m-p0l { padding-left:0!important } .es-m-p0t { padding-top:0!important } .es-m-p0b { padding-bottom:0!important } .es-m-p20b { padding-bottom:20px!important } .es-mobile-hidden, .es-hidden { display:none!important } tr.es-desk-hidden, td.es-desk-hidden, table.es-desk-hidden { width:auto!important; overflow:visible!important; float:none!important; max-height:inherit!important; line-height:inherit!important } tr.es-desk-hidden { display:table-row!important } table.es-desk-hidden { display:table!important } td.es-desk-menu-hidden { display:table-cell!important } .es-menu td { width:1%!important } table.es-table-not-adapt, .esd-block-html table { width:auto!important } table.es-social { display:inline-block!important } table.es-social td { display:inline-block!important } .es-menu td a { font-size:16px!important } a.es-button, button.es-button { font-size:20px!important; display:block!important; border-left-width:0px!important; border-right-width:0px!important } .es-m-p5 { padding:5px!important } .es-m-p5t { padding-top:5px!important } .es-m-p5b { padding-bottom:5px!important } .es-m-p5r { padding-right:5px!important } .es-m-p5l { padding-left:5px!important } .es-m-p10 { padding:10px!important } .es-m-p10t { padding-top:10px!important } .es-m-p10b { padding-bottom:10px!important } .es-m-p10r { padding-right:10px!important } .es-m-p10l { padding-left:10px!important } .es-m-p15 { padding:15px!important } .es-m-p15t { padding-top:15px!important } .es-m-p15b { padding-bottom:15px!important } .es-m-p15r { padding-right:15px!important } .es-m-p15l { padding-left:15px!important } .es-m-p20 { padding:20px!important } .es-m-p20t { padding-top:20px!important } .es-m-p20r { padding-right:20px!important } .es-m-p20l { padding-left:20px!important } .es-m-p25 { padding:25px!important } .es-m-p25t { padding-top:25px!important } .es-m-p25b { padding-bottom:25px!important } .es-m-p25r { padding-right:25px!important } .es-m-p25l { padding-left:25px!important } .es-m-p30 { padding:30px!important } .es-m-p30t { padding-top:30px!important } .es-m-p30b { padding-bottom:30px!important } .es-m-p30r { padding-right:30px!important } .es-m-p30l { padding-left:30px!important } .es-m-p35 { padding:35px!important } .es-m-p35t { padding-top:35px!important } .es-m-p35b { padding-bottom:35px!important } .es-m-p35r { padding-right:35px!important } .es-m-p35l { padding-left:35px!important } .es-m-p40 { padding:40px!important } .es-m-p40t { padding-top:40px!important } .es-m-p40b { padding-bottom:40px!important } .es-m-p40r { padding-right:40px!important } .es-m-p40l { padding-left:40px!important } }
        </style>
         </head>
         <body style="width:100%;font-family:arial, 'helvetica neue', helvetica, sans-serif;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;padding:0;Margin:0">
          <div class="es-wrapper-color" style="background-color:#CB7270">
           <!--[if gte mso 9]>
              <v:background xmlns:v="urn:schemas-microsoft-com:vml" fill="t">
                <v:fill type="tile" color="#cb7270" origin="0.5, 0" position="0.5,0"></v:fill>
              </v:background>
            <![endif]-->
           <table class="es-wrapper" width="100%" cellspacing="0" cellpadding="0" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;padding:0;Margin:0;width:100%;height:100%;background-repeat:repeat;background-position:center top">
             <tr style="border-collapse:collapse">
              <td valign="top" style="padding:0;Margin:0">
               <table cellpadding="0" cellspacing="0" class="es-content" align="center" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;table-layout:fixed !important;width:100%">
                 <tr style="border-collapse:collapse">
                  <td class="es-adaptive" align="center" style="padding:0;Margin:0">
                   <table class="es-content-body" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;background-color:#EFEFEF;width:680px" cellspacing="0" cellpadding="0" bgcolor="#ffffff" align="center">
                     <tr style="border-collapse:collapse">
                      <td align="left" style="Margin:0;padding-top:15px;padding-bottom:15px;padding-left:20px;padding-right:20px">
                       <!--[if mso]><table style="width:640px" cellpadding="0" cellspacing="0"><tr><td style="width:310px" valign="top"><![endif]-->
                       <table class="es-left" cellspacing="0" cellpadding="0" align="left" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;float:left">
                         <tr style="border-collapse:collapse">
                          <td align="left" style="padding:0;Margin:0;width:310px">
                           </td>
                         </tr>
                       </table>
                       <!--[if mso]></td><td style="width:20px"></td><td style="width:310px" valign="top"><![endif]-->
                       <table class="es-right" cellspacing="0" cellpadding="0" align="right" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;float:right">
                         <tr style="border-collapse:collapse">
                          <td align="left" style="padding:0;Margin:0;width:310px">
                           <table width="100%" cellspacing="0" cellpadding="0" role="presentation" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
                             <tr style="border-collapse:collapse">
                              <td align="right" class="es-infoblock es-m-txt-c" style="padding:0;Margin:0;line-height:14px;font-size:12px;color:#CCCCCC"><p style="Margin:0;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-size:12px;font-family:arial, 'helvetica neue', helvetica, sans-serif;line-height:14px;color:#62CD21"><strong><a href="#" target="_blank" class="view" style="-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-family:arial, 'helvetica neue', helvetica, sans-serif;font-size:12px;text-decoration:underline;color:#62C36B">O</a>rder Placed</strong></p></td>
                             </tr>
                           </table></td>
                         </tr>
                       </table>
                       <!--[if mso]></td></tr></table><![endif]--></td>
                     </tr>
                   </table></td>
                 </tr>
               </table>
               <table cellpadding="0" cellspacing="0" class="es-header" align="center" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;table-layout:fixed !important;width:100%;background-color:transparent;background-repeat:repeat;background-position:center top">
                 <tr style="border-collapse:collapse">
                  <td align="center" style="padding:0;Margin:0">
                   <table class="es-header-body" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;background-color:#FEF5E4;width:680px" cellspacing="0" cellpadding="0" bgcolor="#fef5e4" align="center">
                     <tr style="border-collapse:collapse">
                      <td align="left" style="Margin:0;padding-top:5px;padding-bottom:5px;padding-left:15px;padding-right:15px">
                       <!--[if mso]><table style="width:650px" cellpadding="0" cellspacing="0"><tr><td style="width:220px" valign="top"><![endif]-->
                       <table class="es-left" cellspacing="0" cellpadding="0" align="left" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;float:left">
                         <tr style="border-collapse:collapse">
                          <td class="es-m-p0r" valign="top" align="center" style="padding:0;Margin:0;width:220px">
                           <table width="100%" cellspacing="0" cellpadding="0" role="presentation" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
                             <tr style="border-collapse:collapse">
                              <td class="es-m-p0l es-m-txt-c" align="left" style="padding:0;Margin:0;padding-left:15px;font-size:0px"><a href="https://viewstripo.email/" target="_blank" style="-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-family:arial, 'helvetica neue', helvetica, sans-serif;font-size:14px;text-decoration:underline;color:#999999">
                              <a href="www.lakeofcakes.com"><img src="https://firebasestorage.googleapis.com/v0/b/lake-of-cakes.appspot.com/o/logo.png?alt=media&token=2068ec5a-00e3-4828-94cd-60c5c1346fc6" alt="loc_logo" title="Petshop logo" width="118" style="display:block;border:0;outline:none;text-decoration:none;-ms-interpolation-mode:bicubic"></a></td>
                             </tr>
                           </table></td>
                         </tr>
                       </table>
                       <!--[if mso]></td><td style="width:20px"></td><td style="width:410px" valign="top"><![endif]-->
                       <table cellspacing="0" cellpadding="0" align="right" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
                         <tr style="border-collapse:collapse">
                          <td align="left" style="padding:0;Margin:0;width:410px">
                           <table width="100%" cellspacing="0" cellpadding="0" role="presentation" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
                             <tr style="border-collapse:collapse">
                              <td align="right" class="es-m-txt-c" style="padding:0;Margin:0"><p style="Margin:0;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-size:14px;font-family:arial, 'helvetica neue', helvetica, sans-serif;line-height:21px;color:#E71F18"><strong>Order Placed On - ${timeStamp}<br>Order ID - ${successOrderId}</strong></p></td>
                             </tr>
                           </table></td>
                         </tr>
                       </table>
                       <!--[if mso]></td></tr></table><![endif]--></td>
                     </tr>
                   </table></td>
                 </tr>
               </table>
               <table class="es-content" cellspacing="0" cellpadding="0" align="center" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;table-layout:fixed !important;width:100%">
                 <tr style="border-collapse:collapse">
                  <td align="center" style="padding:0;Margin:0">
                   <table class="es-content-body" cellspacing="0" cellpadding="0" bgcolor="#ffffff" align="center" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;background-color:#FFFFFF;width:680px">
                     <tr style="border-collapse:collapse">
                      <td align="left" style="Margin:0;padding-top:10px;padding-bottom:10px;padding-left:20px;padding-right:20px">
                       <table width="100%" cellspacing="0" cellpadding="0" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
                         <tr style="border-collapse:collapse">
                          <td valign="top" align="center" style="padding:0;Margin:0;width:640px">
                           <table style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:separate;border-spacing:0px;border-radius:0px" width="100%" cellspacing="0" cellpadding="0" role="presentation">
                             <tr style="border-collapse:collapse">
                              <td align="center" style="padding:0;Margin:0;padding-top:10px;padding-bottom:15px"><h1 style="Margin:0;line-height:36px;mso-line-height-rule:exactly;font-family:'trebuchet ms', helvetica, sans-serif;font-size:30px;font-style:normal;font-weight:normal;color:#333333">Hi ${
                                newValue.UserName
                              } ! Your Order has been successfully placed</h1></td>
                             </tr>
                             <tr style="border-collapse:collapse">
                              <td class="es-m-p0" align="center" style="Margin:0;padding-top:5px;padding-bottom:5px;padding-left:40px;padding-right:40px"><p style="Margin:0;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-size:14px;font-family:arial, 'helvetica neue', helvetica, sans-serif;line-height:21px;color:#333333">We are committed to serving you with utmost regard for your and your product's safety. Hence, please note, the delivery time of your order may change due to traffic &amp; natural calamities (like rain, storm, fog etc.) AND based on the government's zonal advisory in your area regarding COVID-19</p></td>
                             </tr>
                             <tr style="border-collapse:collapse">
                              <td align="center" style="padding:0;Margin:0;padding-bottom:10px;padding-top:15px"><span class="es-button-border" style="border-style:solid;border-color:#2CB543;background:#E7481F;border-width:0px;display:inline-block;border-radius:5px;width:auto;border-top-width:0px;border-bottom-width:0px"><a href="https://lakeofcakes.com/UserDash/customerProfile.html" class="es-button" target="_blank" style="mso-style-priority:100 !important;text-decoration:underline;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-family:arial, 'helvetica neue', helvetica, sans-serif;font-size:16px;color:#FFFFFF;border-style:solid;border-color:#E7481F;border-width:10px 20px 10px 20px;display:inline-block;background:#E7481F;border-radius:5px;font-weight:normal;font-style:normal;line-height:19px;width:auto;text-align:center;border-top-width:10px;border-bottom-width:10px">View order status</a></span></td>
                             </tr>
                           </table></td>
                         </tr>
                       </table></td>
                     </tr>
                   </table></td>
                 </tr>
               </table>
               <table cellpadding="0" cellspacing="0" class="es-content" align="center" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;table-layout:fixed !important;width:100%">
                 <tr style="border-collapse:collapse">
                  <td align="center" style="padding:0;Margin:0">
                   <table bgcolor="#ffffff" class="es-content-body" align="center" cellpadding="0" cellspacing="0" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;background-color:#FFFFFF;width:680px">
                     <tr style="border-collapse:collapse">
                      <td align="left" style="padding:0;Margin:0;padding-top:20px;padding-left:20px;padding-right:20px">
                       <table cellpadding="0" cellspacing="0" width="100%" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
                         <tr style="border-collapse:collapse">
                          <td align="center" valign="top" style="padding:0;Margin:0;width:640px">
                           <table cellpadding="0" cellspacing="0" width="100%" role="presentation" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
                             <tr style="border-collapse:collapse">
                              <td align="center" style="padding:0;Margin:0;font-size:0px"><img class="adapt-img" src="https://firebasestorage.googleapis.com/v0/b/lake-of-cakes.appspot.com/o/Capture.PNG?alt=media&amp;amp;token=4140cc7f-c7cb-47be-846c-d0e9fadc46a9" alt style="display:block;border:0;outline:none;text-decoration:none;-ms-interpolation-mode:bicubic"></td>
                             </tr>
                           </table></td>
                         </tr>
                       </table></td>
                     </tr>
                   </table></td>
                 </tr>
               </table>
               <table class="es-content" cellspacing="0" cellpadding="0" align="center" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;table-layout:fixed !important;width:100%">
                 <tr style="border-collapse:collapse">
                  <td align="center" style="padding:0;Margin:0">
                   <table class="es-content-body" cellspacing="0" cellpadding="0" bgcolor="#ffffff" align="center" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;background-color:#FFFFFF;width:680px">
                     <tr style="border-collapse:collapse">
                      <td align="left" style="Margin:0;padding-top:20px;padding-left:20px;padding-right:20px;padding-bottom:30px">
                       <!--[if mso]><table style="width:640px" cellpadding="0" cellspacing="0"><tr><td style="width:320px" valign="top"><![endif]-->
                       <table class="es-left" cellspacing="0" cellpadding="0" align="left" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;float:left">
                         <tr style="border-collapse:collapse">
                          <td class="es-m-p20b" align="left" style="padding:0;Margin:0;width:320px">
                           <table style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:separate;border-spacing:0px;background-color:#FEF9EF;border-color:#EFEFEF;border-width:1px 0px 1px 1px;border-style:solid" width="100%" cellspacing="0" cellpadding="0" bgcolor="#fef9ef" role="presentation">
                             <tr style="border-collapse:collapse">
                              <td align="left" style="Margin:0;padding-bottom:10px;padding-top:20px;padding-left:20px;padding-right:20px"><h4 style="Margin:0;line-height:120%;mso-line-height-rule:exactly;font-family:'trebuchet ms', helvetica, sans-serif">SUMMARY:</h4></td>
                             </tr>
                             <tr style="border-collapse:collapse">
                              <td align="left" style="padding:0;Margin:0;padding-bottom:20px;padding-left:20px;padding-right:20px">
                               <table style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;width:100%" class="cke_show_border" cellspacing="1" cellpadding="1" border="0" align="left" role="presentation">
                                 <tr style="border-collapse:collapse">
                                  <td style="padding:0;Margin:0;font-size:12px;line-height:18px">Deliver By :</td>
                                  <td style="padding:0;Margin:0;font-size:13px;line-height:20px">
                                  ${dTime}</td>
                                 </tr>
                                 <tr style="border-collapse:collapse">
                                  <td style="padding:0;Margin:0;font-size:12px;line-height:18px">Amount Paid:</td>
                                  <td style="padding:0;Margin:0;font-size:14px;line-height:21px"><span style="font-size:13px">Rs</span><span style="font-size:13px">&nbsp;&nbsp;${totalCost}</span></td>
                                 </tr>
                               </table><p style="Margin:0;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-size:14px;font-family:arial, 'helvetica neue', helvetica, sans-serif;line-height:21px;color:#333333"><br><br><br></p></td>
                             </tr>
                           </table></td>
                         </tr>
                       </table>
                       <!--[if mso]></td><td style="width:0px"></td><td style="width:320px" valign="top"><![endif]-->
                       <table class="es-right" cellspacing="0" cellpadding="0" align="right" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;float:right">
                         <tr style="border-collapse:collapse">
                          <td align="left" style="padding:0;Margin:0;width:320px">
                           <table style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:separate;border-spacing:0px;background-color:#FEF9EF;border-width:1px;border-style:solid;border-color:#EFEFEF" width="100%" cellspacing="0" cellpadding="0" bgcolor="#fef9ef" role="presentation">
                             <tr style="border-collapse:collapse">
                              <td align="left" style="Margin:0;padding-bottom:10px;padding-top:20px;padding-left:20px;padding-right:20px"><h4 style="Margin:0;line-height:120%;mso-line-height-rule:exactly;font-family:'trebuchet ms', helvetica, sans-serif">DELIVERY&nbsp;ADDRESS:</h4></td>
                             </tr>
                             <tr style="border-collapse:collapse">
                              <td align="left" style="padding:0;Margin:0;padding-bottom:20px;padding-left:20px;padding-right:20px">
                              <p style="Margin:0;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-size:14px;font-family:arial, 'helvetica neue', helvetica, sans-serif;line-height:21px;color:#333333">
                              ${
                                shippingData.differtAddress
                                  ? shippingData.alt_name
                                  : shippingData.name
                              }
                              ${
                                shippingData.differtAddress
                                  ? shippingData.alt_address
                                  : shippingData.address
                              }
                              ${
                                shippingData.differtAddress
                                  ? shippingData.alt_zip
                                  : shippingData.zip
                              }
                              </p>
                              <p style="Margin:0;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-size:14px;font-family:arial, 'helvetica neue', helvetica, sans-serif;line-height:21px;color:#333333">Lucknow - ${
                                shippingData.zip
                              }</p>
                              <p style="Margin:0;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-size:14px;font-family:arial, 'helvetica neue', helvetica, sans-serif;line-height:21px;color:#333333">Lucknow , Uttar Pradesh</p></td>
                             </tr>
                           </table></td>
                         </tr>
                       </table>
                       <!--[if mso]></td></tr></table><![endif]--></td>
                     </tr>
                   </table></td>
                 </tr>
               </table>
               <table class="es-content" cellspacing="0" cellpadding="0" align="center" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;table-layout:fixed !important;width:100%">
                 <tr style="border-collapse:collapse">
                  <td align="center" style="padding:0;Margin:0">
                   <table class="es-content-body" cellspacing="0" cellpadding="0" bgcolor="#ffffff" align="center" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;background-color:#FFFFFF;width:680px">
                     <tr style="border-collapse:collapse">
                      <td align="left" style="Margin:0;padding-top:10px;padding-bottom:10px;padding-left:20px;padding-right:20px">
                       <!--[if mso]><table style="width:640px" cellpadding="0" cellspacing="0"><tr><td style="width:310px" valign="top"><![endif]-->
                       <table class="es-left" cellspacing="0" cellpadding="0" align="left" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;float:left">
                         <tr style="border-collapse:collapse">
                          <td class="es-m-p0r es-m-p20b" valign="top" align="center" style="padding:0;Margin:0;width:310px">
                           <table width="100%" cellspacing="0" cellpadding="0" role="presentation" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
                             <tr style="border-collapse:collapse">
                              <td align="left" style="padding:0;Margin:0;padding-left:20px"><h4 style="Margin:0;line-height:120%;mso-line-height-rule:exactly;font-family:'trebuchet ms', helvetica, sans-serif">ITEMS ORDERED</h4></td>
                             </tr>
                           </table></td>
                         </tr>
                       </table>
                       <!--[if mso]></td><td style="width:20px"></td><td style="width:310px" valign="top"><![endif]-->
                       <table cellspacing="0" cellpadding="0" align="right" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
                         <tr style="border-collapse:collapse">
                          <td align="left" style="padding:0;Margin:0;width:310px">
                           <table width="100%" cellspacing="0" cellpadding="0" role="presentation" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
                             <tr style="border-collapse:collapse">
                              <td align="left" style="padding:0;Margin:0">
                               <table style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;width:100%" class="cke_show_border" cellspacing="1" cellpadding="1" border="0" role="presentation">
                                 <tr style="border-collapse:collapse">
                                  <td style="padding:0;Margin:0;font-size:13px">NAME</td>
                                  <td style="padding:0;Margin:0;width:60px;font-size:13px;line-height:13px;text-align:center">QTY</td>
       
                                 </tr>
                               </table></td>
                             </tr>
                           </table></td>
                         </tr>
                       </table>
                       <!--[if mso]></td></tr></table><![endif]--></td>
                     </tr>
                   
                     ${duplicate} ${duplicatAddons}
       
                     <tr style="border-collapse:collapse">
                      <td align="left" style="padding:0;Margin:0;padding-left:20px;padding-right:20px">
                       <table width="100%" cellspacing="0" cellpadding="0" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
                         <tr style="border-collapse:collapse">
                          <td valign="top" align="center" style="padding:0;Margin:0;width:640px">
                           <table width="100%" cellspacing="0" cellpadding="0" role="presentation" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
                             <tr style="border-collapse:collapse">
                              <td align="center" style="padding:0;Margin:0;padding-bottom:10px;font-size:0">
                               <table width="100%" height="100%" cellspacing="0" cellpadding="0" border="0" role="presentation" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
                                 <tr style="border-collapse:collapse">
                                  <td style="padding:0;Margin:0;border-bottom:1px solid #EFEFEF;background:#FFFFFF none repeat scroll 0% 0%;height:1px;width:100%;margin:0px"></td>
                                 </tr>
                               </table></td>
                             </tr>
                           </table></td>
                         </tr>
                       </table></td>
                     </tr>
       
                     
                     <tr style="border-collapse:collapse">
                      <td align="left" style="Margin:0;padding-top:5px;padding-left:20px;padding-bottom:30px;padding-right:40px">
                       <table width="100%" cellspacing="0" cellpadding="0" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
                         <tr style="border-collapse:collapse">
                          <td valign="top" align="center" style="padding:0;Margin:0;width:620px">
                           <table width="100%" cellspacing="0" cellpadding="0" role="presentation" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
                             <tr style="border-collapse:collapse">
                              <td class="es-m-txt-r" align="right" style="padding:0;Margin:0">
                               <table style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;width:500px" class="cke_show_border" cellspacing="1" cellpadding="1" border="0" align="right" role="presentation">
                                 <tr style="border-collapse:collapse">
                                  <td style="padding:0;Margin:0;text-align:right;font-size:14px;line-height:21px">Item(s) total (Including GST):</td>
                                  <td style="padding:0;Margin:0;text-align:right;font-size:14px;line-height:21px">${
                                    totalCost - delivertTypePrice
                                  }</td>
                                 </tr>
                                 <tr style="border-collapse:collapse">
                                  <td style="padding:0;Margin:0;text-align:right;font-size:14px;line-height:21px">Perfect Hours Charges:</td>
                                  <td style="padding:0;Margin:0;text-align:right;font-size:14px;line-height:21px;color:#D48344"><b>${delivertTypePrice}</b></td>
                                 </tr>
                                 <tr style="border-collapse:collapse">
                                  <td style="padding:0;Margin:0;text-align:right;font-size:14px;line-height:21px"><strong>Amount Paid:</strong></td>
                                  <td style="padding:0;Margin:0;text-align:right;font-size:14px;line-height:21px;color:#D48344"><strong>${
                                    totalCost + delivertTypePrice
                                  }</strong></td>
                                 </tr>
                               </table><p style="Margin:0;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-size:14px;font-family:arial, 'helvetica neue', helvetica, sans-serif;line-height:17px;color:#333333"><br></p></td>
                             </tr>
                           </table></td>
                         </tr>
                       </table></td>
                     </tr>
                   </table></td>
                 </tr>
               </table>
               <table cellpadding="0" cellspacing="0" class="es-footer" align="center" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;table-layout:fixed !important;width:100%;background-color:transparent;background-repeat:repeat;background-position:center top">
                 <tr style="border-collapse:collapse">
                  <td align="center" style="padding:0;Margin:0">
                   <table class="es-footer-body" cellspacing="0" cellpadding="0" align="center" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;background-color:#FEF5E4;width:680px">
                     <tr style="border-collapse:collapse">
                      <td align="left" style="padding:20px;Margin:0">
                       <!--[if mso]><table style="width:640px" cellpadding="0" cellspacing="0"><tr><td style="width:218px" valign="top"><![endif]-->
                       <table class="es-left" cellspacing="0" cellpadding="0" align="left" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;float:left">
                         <tr style="border-collapse:collapse">
                          <td class="es-m-p0r es-m-p20b" valign="top" align="center" style="padding:0;Margin:0;width:218px">
                           <table width="100%" cellspacing="0" cellpadding="0" role="presentation" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
                             <tr style="border-collapse:collapse">
                              <td class="es-m-p0l es-m-txt-c" align="left" style="padding:0;Margin:0;font-size:0px">
                              <a href="www.lakeofcakes.com"><img src="https://firebasestorage.googleapis.com/v0/b/lake-of-cakes.appspot.com/o/logo.png?alt=media&amp;amp;token=2068ec5a-00e3-4828-94cd-60c5c1346fc6" alt="Petshop logo" title="Petshop logo" width="108" style="display:block;border:0;outline:none;text-decoration:none;-ms-interpolation-mode:bicubic"></a></td>
                             </tr>
                             <tr style="border-collapse:collapse">
                              <td class="es-m-txt-c" align="left" style="padding:0;Margin:0;padding-top:5px"><p style="Margin:0;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-size:14px;font-family:arial, 'helvetica neue', helvetica, sans-serif;line-height:21px;color:#333333"><br></p></td>
                             </tr>
                           </table></td>
                         </tr>
                       </table>
                       <!--[if mso]></td><td style="width:20px"></td><td style="width:402px" valign="top"><![endif]-->
                       <table cellspacing="0" cellpadding="0" align="right" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
                         <tr style="border-collapse:collapse">
                          <td align="left" style="padding:0;Margin:0;width:402px">
                           <table width="100%" cellspacing="0" cellpadding="0" role="presentation" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
                             <tr style="border-collapse:collapse">
                              <td class="es-m-p0l es-m-txt-c" align="right" style="padding:0;Margin:0;font-size:0px"><img src="https://play.google.com/intl/en_us/badges/static/images/badges/en_badge_web_generic.png" alt="Petshop logo" title="Petshop logo" width="108" style="display:block;border:0;outline:none;text-decoration:none;-ms-interpolation-mode:bicubic"></td>
                             </tr>
                           </table></td>
                         </tr>
                       </table>
                       <!--[if mso]></td></tr></table><![endif]--></td>
                     </tr>
                   </table></td>
                 </tr>
               </table>
               <table class="es-content" cellspacing="0" cellpadding="0" align="center" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;table-layout:fixed !important;width:100%">
                 <tr style="border-collapse:collapse">
                  <td align="center" style="padding:0;Margin:0">
                   <table class="es-content-body" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;background-color:transparent;width:680px" cellspacing="0" cellpadding="0" align="center">
                     <tr style="border-collapse:collapse">
                      <td align="left" style="Margin:0;padding-left:20px;padding-right:20px;padding-top:30px;padding-bottom:30px">
                       <table width="100%" cellspacing="0" cellpadding="0" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
                         <tr style="border-collapse:collapse">
                          <td valign="top" align="center" style="padding:0;Margin:0;width:640px">
                           <table width="100%" cellspacing="0" cellpadding="0" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
                             <tr style="border-collapse:collapse">
                              <td align="center" style="padding:0;Margin:0;display:none"></td>
                             </tr>
                           </table></td>
                         </tr>
                       </table></td>
                     </tr>
                   </table></td>
                 </tr>
               </table></td>
             </tr>
           </table>
          </div>  
         </body>
        </html>



        `;

        try {
          transporter.sendMail(mailOptions);
          transporter.close();
        } catch (error) {
          console.error(
            "There was an error while sending the email:" + newValue.Email,
            error
          );
        }
      }
    }
  });

exports.mailOnProductReject = functions.firestore
.document("Customers/{userId}")
.onUpdate(async (change) => {

  setTimeout(async() => {

  // db.collection("Customers").get().then(async function(querySnapshot) {
  // querySnapshot.docs.forEach(async function (doc) {
    const newValue = change.after.data();

    // ...or the previous value before this update
    const previousValue = change.before.data();
    // doc.data() is never undefined for query doc snapshots
    const name = newValue.UserName;

    //Create an options object that contains the time to live for the notification and the priority
    const mailOptions = {
      from: '"Lake of Cakes " <lakeofcakess@gmail.com>',
      to: newValue.Email,
    };
    // Building Email message.

    //for example
    let duplicate = `<tr style="padding: 20px;margin: 15%;">
      <th>Product Image</th>
      <th>Name</th>
    </tr>`;
    let orderIndex = -1;
    for (let o of newValue.orders) {
      orderIndex++;
      if (o.status == "cancelled") {
        if (o.isEmailSent == false) {
          for (op of o.products) {
            let opRef = admin.firestore().collection(op.cat).doc(op.prodId);
            await opRef.get().then((opDoc) => {
              let cake = "";

              let opData = opDoc.data();
              duplicate += `
            <tr style="padding: 20px;margin: 15%;">
            <td style="padding: 20px;margin: 15%;border:1px solid black"><img src="${opData.mainImgUrl}" width="90" alt=""></td>
            <td style="padding: 20px;margin: 15%;border:1px solid black">${opData.name} ${cake}</td>
        
            </tr>
  
  
  
  
            `;
            });
          }

          mailOptions.subject =
            "Have you any problem faced while placing your shopping on Lake of Cakes?";
          //for example
          mailOptions.html =
            `
    <style type="text/css">
    /* Default CSS */
    body,#body_style {margin: 0; padding: 0; background: #f9f9f9; font-size: 14px; color: #5b656e;}
    a {color: #09c;}
    a img {border: none; text-decoration: none;}
    table, table td {border-collapse: collapse;}
    td, h1, h2, h3 {font-family: tahoma, geneva, sans-serif; color: #313a42;}
    h1, h2, h3, h4 {color: #313a42 !important; font-weight: normal; line-height: 1.2;}
    h1 {font-size: 24px;}
    h2 {font-size: 18px;}
    h3 {font-size: 16px;}
    p {margin: 0 0 1.6em 0;}
    
    /* Force Outlook to provide a "view in browser" menu link. */
    #outlook a {padding:0;}
    
    /* Preheader and webversion */
    .preheader {background-color: #5b656e;}
    .preheaderContent,.webversion,.webversion a {color: white; font-size: 10px;}
    .preheaderContent{width: 440px;}
    .preheaderContent,.webversion {padding: 5px 10px;}
    .webversion {width: 200px; text-align: right;}
    .webversion a {text-decoration: underline;}
    .webversion,.webversion a {color: #ffffff; font-size: 10px;}
    
    /* Topheader */
    .topHeader {background: #ffffff;}
    
    /* Logo (branding) */
    .logoContainer {padding: 20px 0 10px 0px; width: 320px;}
    .logoContainer a {color: #ffffff;}
    
    /* Whitespace (imageless spacer) and divider */
    .whitespace, .whitespaceDivider {font-family: 0px; line-height: 0px;}
    .whitespaceDivider {border-bottom: 1px solid #cccccc;}
    
    /* Button */
    .buttonContainer {padding: 10px 0px 10px 0px;}
    .button {padding: 5px 5px 5px 5px; text-align: center; background-color: #51c4d4}
    .button a {color: #ffffff; text-decoration: none; font-size: 13px;}
    
    /* Section */
    .sectionMainTitle{font-family: Tahoma, sans-serif; font-size: 16px; padding: 0px 0px 5px 0;}
    .sectionArticleTitle, .sectionMainTitle {color: #5b656e;}
    
    /* An article */
    .sectionArticleTitle, .sectionArticleContent {text-align: center; padding: 0px 5px 0px 5px;}
    .sectionArticleTitle {font-size: 12px; font-weight: bold;}
    .sectionArticleContent {font-size: 10px; line-height: 12px;}
    .sectionArticleImage {padding: 8px 0px 0px 0px;}
    .sectionArticleImage img {padding: 0px 0px 10px 0px; -ms-interpolation-mode: bicubic; display: block;}
    
    /* Footer and Social media */
    .footer {background-color: #51c4d4;}
    .footNotes {padding: 0px 20px 0px 20px;}
    .footNotes a {color: #ffffff; font-size: 13px;}
    .socialMedia {background: #5b656e;}
    
    /* Article image */
    .sectionArticleImage {padding: 8px 0px 0px 0px;}
    .sectionArticleImage img {padding: 0px 0px 10px 0px; -ms-interpolation-mode: bicubic; display: block;}
    
    /* Product card */
    .card {background-color: #ffffff; border-bottom: 2px solid #5b656e;}
    
    /* Column */
    .column {padding-bottom: 20px;}
    
    
    /* CSS for specific screen width(s) */
    @media only screen and (max-width: 480px) {
        body[yahoofix] table {width: 100% !important;}
        body[yahoofix] .webversion {display: none; font-size: 0; max-height: 0; line-height: 0; mso-hide: all;}
        body[yahoofix] .logoContainer {text-align: center;}
        body[yahoofix] .logo {width: 80%;}
        body[yahoofix] .buttonContainer {padding: 0px 20px 0px 20px;}
        body[yahoofix] .column {float: left; width: 100%; margin: 0px 0px 30px 0px;}
        body[yahoofix] .card {padding: 20px 0px;}
      }
  </style>
  <h3><b>Complete your order with 10% discount</b>&nbsp;</h3>
  <p><br></p>
  <div style="text-align: center;"><img src="https://firebasestorage.googleapis.com/v0/b/lake-of-cakes.appspot.com/o/logo.png?alt=media&amp;token=2068ec5a-00e3-4828-94cd-60c5c1346fc6" style="width: 263.921px; height: 65.1px;"></div>
  <div style="text-align: center; "><br></div>
  <div style="text-align: center; "><br></div>
  <div "="">
  <div style="text-align: center;"><b>Hi ` +
            newValue.UserName +
            `</b></div>
    <div style="text-align: center;"><b><br></b></div>
    <div style="text-align: center;">You were trying to shopping with us and to place an order for a gift for your
        loved ones. Have&nbsp;</div>
    <div style="text-align: center;">you faced any issue in doing so? In case you came across any issue or concern,
        just reply back&nbsp;</div>
    <div style="text-align: center; ">to this email. We would be happy to resolve your issue.</div>
    <h4 style="text-align: center; "><b><span style="font-family: &quot;Times New Roman&quot;;">While visiting our
                website for place your order and get 10% off by entering</span><br><span style="font-family: &quot;Times New Roman&quot;;">LOC10 coupon code (order value 499 &amp;
                above)</span></b></h4>
    
  </div>
  <center>
    
      
      <table style="border: 2px solid red;padding: 30px;">
        <tbody>
        
        
        ` +
            duplicate +
            `
        </tbody>
        </table>
      <a href="https://lakeofcakes.com/UserDash/cart.html"><h3 style="background-color: red;color: white;margin-left: auto;margin-right: auto;display: block;width:50%;cursor:pointer">Complete Your Order Now</h3></a>
      <small>*Please ignore this Mail if order already placed.</small>
      <br>
      <h4 style="font-weight: 800;">Call +91 - 9598891097</h4>
  </center>
  <table border="0" cellspacing="0" summary="" width="640" align="center" style="background-color: #ffffff;">
      <tbody><tr><td colspan="2" class="whitespace" height="20">&nbsp;</td></tr>
      <tr>
        <td class="column" width="20%" align="center">
          <p><img width="60px;height:60px;object-fit:cover" src="https://firebasestorage.googleapis.com/v0/b/lake-of-cakes.appspot.com/o/emailImages%2FWhatsApp%20Image%202020-12-31%20at%2018.32.04%20(2).jpeg?alt=media&token=a263cfa0-38b2-4071-931e-e6bcec0677b5" alt="Lorem ipsum"><p>
          <p>Midnight Delivery</p>
        </td>
          <td class="column" width="20%" align="center">
          <p><img width="60px;height:60px;object-fit:cover" src="https://firebasestorage.googleapis.com/v0/b/lake-of-cakes.appspot.com/o/emailImages%2FWhatsApp%20Image%202020-12-31%20at%2018.32.04%20(1).jpeg?alt=media&token=8f225388-dab5-4d49-a567-cd918f64d7fc"></p><p>Fast Delivery</p>
        </td>
          <td class="column" width="20%" align="center">
          <p><img width="60px;height:60px;object-fit:cover" src="https://firebasestorage.googleapis.com/v0/b/lake-of-cakes.appspot.com/o/emailImages%2FWhatsApp%20Image%202020-12-31%20at%2018.32.05.jpeg?alt=media&token=2bdb4c6e-2d26-422b-8d7c-5f09c5d67ed4"></p><p>Free Delivery</p>
        </td>
      </tr>
    </tbody></table>
    <br>
  <p style="text-align: center; "><b><font color="#000000" style="">Please contact us if you have any query or need any assistance. Keep visiting lakeofcakes.com for make
        your day memorable. </font></b></p>
    <!-- Social media -->
    <table border="0" cellspacing="0" cellpadding="0" width="100%" summary="" class="socialMedia">
      <tbody><tr><td class="whitespace" height="20">&nbsp;</td></tr>
      <tr>
        <td>
          <table border="0" cellspacing="0" cellpadding="0" width="120" align="center" summary="">
            <tbody><tr>
              <td align="center" width="32">
                <a href="https://www.facebook.com/Lake-Of-Cakes-100900995221365" title="Twitter"><img src="https://www.windowscentral.com/sites/wpcentral.com/files/topic_images/2016/new-instagram-icon-topic.png" width="29" alt="Twitter"></a>
              </td>
              <td align="center" width="32">
                <a href="https://www.instagram.com/lake_of_cakes/" title="Facebook"><img src="https://www.expectmorearizona.org/wp-content/uploads/2016/11/facebook-png-icon-follow-us-facebook-1.png" width="29" alt="Facebook"></a>
              </td>
            </tr>
          </tbody></table>
        </td>
      </tr>
      <tr><td class="whitespace" height="10">&nbsp;</td></tr>
    </tbody></table>
  
    
  
    `;

          
          
            try {
              // cron.schedule('0 4 * * *', () => {
              console.log(newValue.Email);
              transporter.sendMail(mailOptions);
              transporter.close();
              // await admin.firestore().collection("Customers").doc(newValue.userId).update(o.isEmailSent,true)
              let statusRef = await admin
                .firestore()
                .collection("Customers")
                .doc(newValue.userId);
              await statusRef.get().then(async (osnap) => {
                let osnapData = osnap.data();
                osnapData.orders[orderIndex].isEmailSent = true;
                await statusRef.update(osnapData);
              });
              // });
            } catch (error) {
              console.error(
                "There was an error while sending the email:" +
                  newValue.Email,
                error
              );
            }
          
          
        }
      }
    }

  }, 15000)
  // });
});

// exports.scheduledEmails12AM = functions.pubsub.schedule("every day 00:00").onRun((context) => {
//   console.log('This will be run every day ay 12AM!');
//   // mailOnProductReject();
// });
// exports.scheduledEmailsTry = functions.pubsub.schedule("every day 03:00").onRun((context) => {
//   console.log('This will be run every day ay 1:55AM!');
//   mailOnProductReject();
// });
// exports.scheduledEmails3PM = functions.pubsub.schedule("every day 15:00").onRun((context) => {
//   console.log('This will be run every day ay 15PM!');
//   mailOnProductReject();
// });
// exports.scheduledEmails8PM = functions.pubsub.schedule("every day 20:00").onRun((context) => {
//   console.log('This will be run every day ay 20PM!');
//   mailOnProductReject();
// });
