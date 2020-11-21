console.log("payment1.js");
// import axios from './node_modules/axios/dist/axios';
const db = firebase.firestore();
let CHECKOUT_ID;
let INDEX = -1;

if (localStorage.getItem("locLoggedInUser") == "null") {
  window.location.href = "./../Auth/login.html";
} else {
  const getParams = async (url) => {
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
      checkFlag = true
      // await allProductsDetails();
      console.log('done');
      break;
    }
  }
  if(checkFlag === false) {
    window.location.href = "./../index.html";
  }
}




let RES;
const options = {
  "key": "rzp_test_dHcwJXc68x8Abm", // Enter the Key ID generated from the Dashboard
  "amount": "100", // Amount is in currency subunits. Default currency is INR. Hence, 50000 refers to 50000 paise
  "currency": "INR",
  "name": "LAKE OF CAKES",
  "description": "HAPPY SHOPPING",
  "image": "./../assets/images/logo.png",
  "order_id": CHECKOUT_ID, //This is a sample Order ID. Pass the `id` obtained in the response of Step 1
  "handler": function (response){
    RES = response;
    alert(response)
    alert(response.razorpay_signature)
    console.log(response);
    orderComplete(response);
      // alert(response.razorpay_payment_id);
      // alert(response.razorpay_order_id);
  },
  "prefill": {
      "name": "Gaurav Kumar",
      "email": "gaurav.kumar@example.com",
      "contact": "9999999999"
  },
  "notes": {
      "address": "Razorpay Corporate Office"
  },
  "theme": {
      "color": "#f00"
  }
};
const rzp1 = new Razorpay(options);
rzp1.on('payment.failed', function (response){
  // alert(response.error.code);
  // alert(response.error.description);
  // alert(response.error.source);
  // alert(response.error.step);
  // alert(response.error.reason);
  // alert(response.error.metadata.order_id);
  // alert(response.error.metadata.payment_id);
  console.log(response);
  console.log(response.error);
});

// rzp1.open();

document.querySelector('#rzp-button1').addEventListener('click', e => {
  e.preventDefault();
  rzp1.open();
})

const orderComplete = data => {
  console.log(data);
  console.log(data.razorpay_payment_id);
  console.log(data.razorpay_signature);

  // const checkPayment = firebase.functions().httpsCallable('checkPayment');
  // checkPayment({
  //   razorpay_payment_id : data.razorpay_payment_id,
  //   razorpay_order_id : data.razorpay_order_id,
  //   razorpay_signature : data.razorpay_order_id
  // }).then(res => {
  //   console.log(response);
  // })

  // let res = checkPayment(data);
  // console.log(res);
  let d = {
    payment_id: data.razorpay_payment_id,
    sig: data.razorpay_signature,
    razorpay_order_id: data.razorpay_order_id,
  }

  let options = { 
    method: 'POST', 
    headers: { 
        'Content-Type':  
            'application/json;charset=utf-8' 
    }, 
    body: JSON.stringify(d)
} 
console.log(options);

  fetch('http://localhost:3000/payment', options ).then(response => {
    console.log(response);
    response.json();
  }).then(data => console.log(data))
}




////////////////////////////////////////////////////////////////////////////////////////////

// const crypto = require('crypto');
// const functions = require('firebase-functions');
// const admin = require('firebase-admin');
// admin.initializeApp();

// exports.checkPayment = functions.https.onCall((data, context) => {
//   if (!context.auth) {
//     throw new functions.https.HttpsError(
//       'unauthenticated', 
//       'only authenticated users can add requests'
//     );
//   }
//   const razorpay_payment_id = data.razorpay_payment_id;
// 	const razorpay_order_id = data.razorpay_order_id;
// 	const razorpay_signature = data.razorpay_signature;
//   const dataKey = razorpay_order_id + '|' + razorpay_payment_id; 
  
//   const expectSig = crypto.createHmac('sha256', 'ztN0ZdwWY0nFoUnhgFAHuTaF').update(dataKey.toString()).digest('hex');
//   console.log(expectSig);
//   return expectSig;
// })



// const checkPayment = (data) => {
//   console.log(data);
//   // if (!context.auth) {
//   //   throw new functions.https.HttpsError(
//   //     'unauthenticated', 
//   //     'only authenticated users can add requests'
//   //   );
//   // }

//   const razorpay_payment_id = data.razorpay_payment_id;
// 	const razorpay_order_id = data.razorpay_order_id;
// 	const razorpay_signature = data.razorpay_signature;
//   const dataKey = razorpay_order_id + '|' + razorpay_payment_id; 
  

//   const expectSig = cryptoJS.createHmac('sha256', 'ztN0ZdwWY0nFoUnhgFAHuTaF').update(dataKey.toString()).digest('hex');
//   console.log(expectSig);
//   return expectSig;
// }

