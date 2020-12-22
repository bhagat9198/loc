const functions = require("firebase-functions");
const Razorpay = require("razorpay");
const admin = require("firebase-admin");
const cryptoHmac = require("create-hmac");
admin.initializeApp();
var firebase = require("firebase");
// let cron = require('node-cron');
const nodemailer = require("nodemailer");
var smtpTransport = require("nodemailer-smtp-transport");
const { log } = require("firebase-functions/lib/logger");

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

  let zipFlag = false;
  console.log(optional.formData);
  if (!optional.formData.zip.startsWith("226")) {
    zipFlag = true;
  }
  if (optional.formData.differtAddress) {
    if (!optional.formData.alt_zip.startsWith("226")) {
      zipFlag = true;
    }
  }
  if (zipFlag) {
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
      console.log(docData);
      siteStaus = docData.status;
      console.log("docData.status", docData.status, "siteStaus", siteStaus);
    });

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
    key_id: "rzp_test_nGNzxazP9gvHAE",
    key_secret: "YWfbldEONyvUQcRZUSvGxGp6",
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
  const expectSig = cryptoHmac("sha256", "YWfbldEONyvUQcRZUSvGxGp6")
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
    user: "reetikchitragupt@gmail.com",
    pass: "myemail797355670645",
  },
  tls: {
    // do not fail on invalid certs
    rejectUnauthorized: false,
  },
});

// Email Service
exports.sendEmailAfterReject = functions.firestore
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
    let duplicate = `<tr style="padding: 20px;margin: 15%;">
    <th>Product Image</th>
    <th>Name</th>
  </tr>`;

    for (let o of newValue.orders) {
      if (o.status == "cancelled") {
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
      }
    }
    // Building Email message.
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
        <img width="60px;object-fit:cover" src="https://cdn4.iconfinder.com/data/icons/time-line/512/night_time-256.png" alt="Lorem ipsum">
      </td>
       <td class="column" width="20%" align="center">
        <img width="60px;object-fit:cover" src="https://cdn.iconscout.com/icon/premium/png-256-thumb/24-hour-delivery-1563082-1323854.png">
      </td>
       <td class="column" width="20%" align="center">
        <img width="60px;object-fit:cover" src="https://th.bing.com/th/id/OIP.fngT3b4XqWvCecpkH6LOJwHaHa?pid=Api&amp;rs=1">
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
      // console.log("Inside try")
      // cron.schedule('0 4 * * *', () => {
      transporter.sendMail(mailOptions);
      console.log("email sent to:", newValue.Email);
      transporter.close();
      // });
      // console.log(newValue.Email)
    } catch (error) {
      console.error(
        "There was an error while sending the email:" + newValue.Email,
        error
      );
    }
  });

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
          <img width="60px;object-fit:cover" src="https://cdn4.iconfinder.com/data/icons/time-line/512/night_time-256.png" alt="Lorem ipsum">
        </td>
         <td class="column" width="20%" align="center">
          <img width="60px;object-fit:cover" src="https://cdn.iconscout.com/icon/premium/png-256-thumb/24-hour-delivery-1563082-1323854.png">
        </td>
         <td class="column" width="20%" align="center">
          <img width="60px;object-fit:cover" src="https://th.bing.com/th/id/OIP.fngT3b4XqWvCecpkH6LOJwHaHa?pid=Api&amp;rs=1">
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
        // console.log("Inside try")
        transporter.sendMail(mailOptions);
        console.log("email sent to:", newValue.Email);
        transporter.close();
        // console.log(newValue.Email)
      } catch (error) {
        console.error(
          "There was an error while sending the email:" + newValue.Email,
          error
        );
      }
    }
    // Building Email message.
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

<a href="https://lakeofcakes.com/Products/products.html?cat=yli4KpHGbARJakJfZdVr"></a><br><br><table border="0" cellspacing="0" summary="" width="640" align="center" style="background-color: #ffffff;">
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
        <a href="https://lakeofcakes.com/Products/products.html?cat=H6gtdNb9j9gMDbtI2dl2"><img src="https://res.cloudinary.com/groceryncart/image/upload/v1563106438/Stores/Store50/Product/Premium-Cake-combo-red-carnation-flowers6231758431555.png" alt="Mountains" width="70" height="70">&nbsp;
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
      <a href="https://lakeofcakes.com/Products/products.html?cat=kTrnO3gHeFlnt9iyj0fd"><img src="https://cdn0.iconfinder.com/data/icons/party-human-1/66/50-512.png" alt="Snow" width="70" height="70">&nbsp;
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
        <img width="60px;object-fit:cover" src="https://cdn4.iconfinder.com/data/icons/time-line/512/night_time-256.png" alt="Lorem ipsum">
      </td>
       <td class="column" width="20%" align="center">
        <img width="60px;object-fit:cover" src="https://cdn.iconscout.com/icon/premium/png-256-thumb/24-hour-delivery-1563082-1323854.png">
      </td>
       <td class="column" width="20%" align="center">
        <img width="60px;object-fit:cover" src="https://th.bing.com/th/id/OIP.fngT3b4XqWvCecpkH6LOJwHaHa?pid=Api&amp;rs=1">
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
      console.log("email sent to:", newValue.Email);
      transporter.close();
      // console.log(newValue.Email)
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
    let duplicate = "";
    let delivertTypePrice = 0;
    let timeStamp,
      timeDate,
      dTime,
      shippingData,
      totalCost,
      deliverType = 0;

    for (let o of newValue.orders) {
      if (o.status == "success" && ) {
        for (let op of o.products) {
          let opRef = admin.firestore().collection(op.cat).doc(op.prodId);
          await opRef.get().then((opDoc) => {
            let cake = "";
            if (op.cake) {
              cake = `
            <pre>
            Weight : ${op.cake.weight} Kg 
            Shape : ${op.cake.heart ? "Heart" : "Not Opted"}
            Eggless : ${op.cake.eggless ? "Opted" : "Not Opted"}
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
          `;
          });
        }

        // addons
        let duplicatAddons = '';
        for(let addd of o.addons) {
          // adon detail

          admin.firestore().collection('addons').doc(addd.id).get(addDoc => {
            let adddData = addDoc.data();
            // add name
            // let adddName = adddData.name;
            console.log(adddName);

            // // add price
            // let addPrice = +adddData.price;
            console.log(addPrice);

            // // add qty
            // let addQty = addd.qty;
            console.log(addQty);

            duplicatAddons += `
            <tr style="padding: 20px;margin: 15%;text-align: center;">
              <td style="border: 2px solid black;"><img src="${adddData.imgUrl}" width="90" alt=""></td>
              <td style="border: 2px solid black;">${adddData.name}
              Qty : ${addd.qty}
              </pre>
              </td>
            </tr>
            `;
          })
        }

        // console.log(duplicate);
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
      <div style="width: 100%;display:flex;; ">
  <div style="width: 80%"><img src="https://firebasestorage.googleapis.com/v0/b/lake-of-cakes.appspot.com/o/logo.png?alt=media&amp;token=2068ec5a-00e3-4828-94cd-60c5c1346fc6" style="width: 263.921px; height: 65.1px;"></div>
  <div style="margin: 1%;right:0;"><span style="font-size: 20px;">Order</span> <b style="font-size: 20px;">Placed</b></div>
</div>
<div style="width: 100%;display:flex;">
  <div style="width: 80%;margin: 1%;"> Hi ${
    newValue.UserName
  },<br>Your order has been successfully placed.</div>
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
          </h5><h5 style="text-align: center; ">
              <font face="Times New Roman"><b>etc.) AND based on the government's zonal advisory in your area
                      regarding COVID-19.</b></font>
          </h5>
  </div>
</div>
<center>
  <div style="width: 80%;display:flex;;">
      <div style="width: 60%;margin-left:auto;margin-right:auto;display:block"><img src="https://firebasestorage.googleapis.com/v0/b/lake-of-cakes.appspot.com/o/Capture.PNG?alt=media&amp;token=4140cc7f-c7cb-47be-846c-d0e9fadc46a9" width="330" style=" @media only screen and (min-width:900px) {
          width:900px !important;object-fit:cover;
      }   object-fit:cover;" alt=""></div>
  </div>
  <div style="margin: 1%;right:0;border: 2px solid brown;"><span style="font-size: 20px;"></span>
      <pre>     <span style="font-family: &quot;Times New Roman&quot;;"> Delivery By :${timeDate}
      ${dTime}
      </span><br><b>Delivery Address</b><span style="font-family: &quot;Times New Roman&quot;;">
      </span><br><span style="font-family: &quot;Times New Roman&quot;;">
${shippingData.differtAddress ? shippingData.alt_name : shippingData.name}
${shippingData.differtAddress ? shippingData.alt_address : shippingData.address}
Lucknow 
Lucknow, Uttar Pradesh, ${
            shippingData.differtAddress
              ? shippingData.alt_zip
              : shippingData.zip
          }
       </span><br><span style="font-family: &quot;Times New Roman&quot;;">
Amount Paid :Rs ${totalCost}</span>
          </pre>
  </div>${duplicate}${duplicatAddons}<table style="border: 2px solid orange;padding: 30px;width: 100%;">
      <thead style="padding: 20px;margin: 15%;">
          <tr><th>Product Image</th>
          <th>Name</th>
      </tr></thead></table>
  <b></b><table style="float: right;margin-right: 5%;font-size: 20px;">
      <tbody><tr>
          <td>Item(s) total (including GST)</td>
          <td>${totalCost - delivertTypePrice}</td>
      </tr>
      <tr>
          <td>Perfect Hours Charges </td>
          <td>${delivertTypePrice}</td>
      </tr>
      <tr>
          <td style="font-weight: 800;">Amount Paid</td>
          <td style="font-weight: 800;">${totalCost}</td>
      </tr>
  </tbody></table>
  
</center>
<br>
<br>
<br>
<br>
<div>
  <h4 style="margin-top: 8%;">
      Thank you for shopping with <b>Lake of Cakes!</b>
  </h4>
</div>
<div style="width: 100%;display:flex; ">
  <div style="width: 80%"><img src="https://firebasestorage.googleapis.com/v0/b/lake-of-cakes.appspot.com/o/logo.png?alt=media&amp;token=2068ec5a-00e3-4828-94cd-60c5c1346fc6" style="width: 263.921px; height: 65.1px;"></div>
  <div style="margin: 1%;right:0;">
      <img src="https://jetline.co.za/wp-content/uploads/2017/11/triangle-300x225.png" style="width: 263.921px; height: 65.1px;object-fit:contain">
  </div>
</div>
    `;

        try {
          transporter.sendMail(mailOptions);
          console.log("email sent to:", newValue.Email);
          transporter.close();
          // console.log(newValue.Email)
        } catch (error) {
          console.error(
            "There was an error while sending the email:" + newValue.Email,
            error
          );
        }
      }
    }
  });
