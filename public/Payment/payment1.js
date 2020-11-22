console.log("payment1.js");
const db = firebase.firestore();
let CHECKOUT_ID, ORDER_ID;
let INDEX = -1;

const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
var name1 = urlParams.get("checkout");
var randomid = urlParams.get("orderId").toString();
console.log(name1, randomid);

let options;

options = {
  key: "rzp_test_irSg3itoRV9kt3", // Enter the Key ID generated from the Dashboard
  amount: "100", // Amount is in currency subunits. Default currency is INR. Hence, 50000 refers to 50000 paise
  currency: "INR",
  name: "LAKE OF CAKES",
  description: "HAPPY SHOPPING",
  image: "./../assets/images/logo.png",
  order_id: randomid, 
  handler: function (response) {
    RES = response;
    alert(response.razorpay_signature);
    console.log(response);
    orderComplete(response);
    // alert(response.razorpay_payment_id);
    // alert(response.razorpay_order_id);
  },
  prefill: {
    name: "Gaurav Kumar",
    email: "gaurav.kumar@example.com",
    contact: "9999999999",
  },
  notes: {
    address: "Razorpay Corporate Office",
  },
  theme: {
    color: "#f00",
  },
};

let rzp1;
// rzp1 = new Razorpay(options);
// rzp1.open();

// rzp1.on("payment.failed", function (response) {
  // alert(response.error.code);
  // alert(response.error.description);
  // alert(response.error.source);
  // alert(response.error.step);
  // alert(response.error.reason);
  // alert(response.error.metadata.order_id);
  // alert(response.error.metadata.payment_id);
//   console.log(response);
//   console.log(response.error);
// });

// rzp1.open();

document.querySelector("#rzp-button1").addEventListener("click", (e) => {
  e.preventDefault();
  console.log(options);
  rzp1 = new Razorpay(options);
  rzp1.open();
});


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
  fetch("http://localhost:3500/payment", options)
    .then((res) => {
      return res.json();
    })
    .then((resData) => {
      console.log(resData);
      console.log(resData);
    })
    .catch((error) => {
      console.log(error);
    });
}
// var options = { "key": "rzp_test_E92aTxXOy18B5Y",
// "amount": 99800,
//  "name": "Lake of Cakes Order",
// "description": "Lake of Cakes Order", "prefill": { "name": "Reetik Chitragupt", "email": "reetikchitragupt.17is@saividya.ac.in", "contact": "7355670645" }, "notes": { "address": "Behind Scout press Gandhi Nagar basti", "merchant_order_id": "V6tm1602849698" }, "theme": { "color": "{#ff0000}" }, "order_id": randomid };

// options.handler = function (response) {
//   document.getElementById('razorpay_payment_id').value = response.razorpay_payment_id;
//   document.getElementById('razorpay_signature').value = response.razorpay_signature;
//   document.razorpayform.submit();
// };

// // Boolean whether to show image inside a white frame. (default: true)
// options.theme.image_padding = false;

// options.modal = {
//   ondismiss: function () {
//       window.location.assign("./../index.html");
//   },
//   // Boolean indicating whether pressing escape key
//   // should close the checkout form. (default: true)
//   escape: true,

//   // Boolean indicating whether clicking translucent blank
//   // space outside checkout form should close the form. (default: false)
//   backdropclose: false
// };

// var rzp = new Razorpay(options);

// //document.getElementById('rzp-button1').onclick = function(e){
// rzp.open();
// // e.preventDefault();
// //}

// document.querySelector('#aaaa').innerHTML = `<button>hello</button>`
//     document.querySelector('#f').setAttribute('data-lol', 123);
//     console.log(document.querySelector('#f'));
// document.querySelector('#abcd').innerHTML = `
// <script
//         src="https://checkout.razorpay.com/v1/checkout.js"
//         data-key="rzp_test_E92aTxXOy18B5Y"
//         data-amount="500"
//         data-currency="INR"
//         data-order_id="${randomid}"
//         data-buttontext="Pay with Razorpay"
//         data-name="Acme Corp"
//         data-description="Test transaction"
//         data-image=""
//         data-prefill.name="Gaurav Kumar"
//         data-prefill.email="gaurav.kumar@example.com"
//         data-prefill.contact="9999999999"
//         data-theme.color="#F37254"
//     ></script>
//     <input type="hidden" custom="Hidden Element" name="hidden">
// `;
//   console.log(document.querySelector('#abcd'));
// document.querySelector("#aaa").innerHTML = `sdrgfthygjukiytrfdesrtfy
// <form action="http://localhost:3500/payment" method="POST" id="abcd">
// <script
//     src="https://checkout.razorpay.com/v1/checkout.js"
//     data-key="rzp_test_E92aTxXOy18B5Y"
//     data-amount="500"
//     data-currency="INR"
//     data-order_id="${randomid}"
//     data-buttontext="Pay with Razorpay"
//     data-name="Acme Corp"
//     data-description="Test transaction"
//     data-image=""
//     data-prefill.name="Gaurav Kumar"
//     data-prefill.email="gaurav.kumar@example.com"
//     data-prefill.contact="9999999999"
//     data-theme.color="#F37254"
// ></script>
// <input type="hidden" custom="Hidden Element" name="hidden">
// </form>
// <script src="https://checkout.razorpay.com/v1/checkout.js"></script>
// `;
// console.log(document.querySelector("#aaa").innerHTML);

// if (localStorage.getItem("locLoggedInUser") == "null") {
//   window.location.href = "./../Auth/login.html";
// } else {
//   const getParams = async (url) => {
//     var params = {};
//     var parser = document.createElement("a");
//     parser.href = url;
//     var query = parser.search.substring(1);
//     var vars = query.split("&&");
//     for (var i = 0; i < vars.length; i++) {
//       var pair = vars[i].split("=");
//       params[pair[0]] = decodeURIComponent(pair[1]);
//     }
//     return params;
//   };

//   getParams(window.location.href).then(async (response) => {
//     CHECKOUT_ID = response.checkout;
//     ORDER_ID = response.orderId;
//     console.log(ORDER_ID);
//     // checkOptions();
//     // document.querySelector('#abcd').setAttribute('data-order_id', ORDER_ID);
//     // console.log(document.querySelector('#abcd').innerHTML);

//     console.log(document.querySelector('#aaa'));
//     document.querySelector('#aaa').innerHTML = `
//     <form action="http://localhost:3500/payment" method="POST" id="abcd">
//     <script
//         src="https://checkout.razorpay.com/v1/checkout.js"
//         data-key="rzp_test_E92aTxXOy18B5Y"
//         data-amount="500"
//         data-currency="INR"
//         data-order_id="${ORDER_ID}"
//         data-buttontext="Pay with Razorpay"
//         data-name="Acme Corp"
//         data-description="Test transaction"
//         data-image=""
//         data-prefill.name="Gaurav Kumar"
//         data-prefill.email="gaurav.kumar@example.com"
//         data-prefill.contact="9999999999"
//         data-theme.color="#F37254"
//     ></script>
//     <input type="hidden" custom="Hidden Element" name="hidden">
//     </form>
//     `;
//     console.log(document.querySelector('#aaa').innerHTML);
//     if (!CHECKOUT_ID) {
//       window.location.href = "./../Auth/login.html";
//     } else {
//       USER_ID = localStorage.getItem("locLoggedInUser");
//       // window.location.href = "./r.html";
//       checkOrderId();
//     }
//   });
// }

// const checkOrderId = async () => {
//   USER_REF = await db.collection("Customers").doc(USER_ID);
//   await USER_REF.get().then((doc) => {
//     let docData = doc.data();
//     USER_DETAILS = docData;
//     // console.log(USER_DETAILS);
//   });
//   // console.log(USER_DETAILS);
//   let checkFlag = false;
//   for (let o of USER_DETAILS.orders) {
//     INDEX++;
//     if (+o.orderId === +CHECKOUT_ID) {
//       checkFlag = true;
//       // await allProductsDetails();
//       console.log("done");
//       break;
//     }
//   }
//   if (checkFlag === false) {
//     window.location.href = "./../index.html";
//   }
// };

// let options; let rzp1;

// function setRaz() {
// options= {
//   key: "rzp_test_dHcwJXc68x8Abm", // Enter the Key ID generated from the Dashboard
//   amount: "100", // Amount is in currency subunits. Default currency is INR. Hence, 50000 refers to 50000 paise
//   currency: "INR",
//   name: "LAKE OF CAKES",
//   description: "HAPPY SHOPPING",
//   image: "./../assets/images/logo.png",
//   order_id: ORDER_ID, //This is a sample Order ID. Pass the `id` obtained in the response of Step 1
//   handler: function (response) {
//     RES = response;
//     alert(response);
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
// };;
// rzp1 = new Razorpay(options);
// rzp1.open();
// }

// rzp1.on("payment.failed", function (response) {
//   // alert(response.error.code);
//   // alert(response.error.description);
//   // alert(response.error.source);
//   // alert(response.error.step);
//   // alert(response.error.reason);
//   // alert(response.error.metadata.order_id);
//   // alert(response.error.metadata.payment_id);
//   console.log(response);
//   console.log(response.error);
// });

// rzp1.open();

// document.querySelector("#rzp-button1").addEventListener("click", (e) => {
//   e.preventDefault();
//   console.log(ORDER_ID);
//   setRaz();

// });

// const orderComplete = (data) => {
//   console.log(data);
//   console.log(data.razorpay_payment_id);
//   console.log(data.razorpay_signature);

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
//   let d = {
//     payment_id: data.razorpay_payment_id,
//     sig: data.razorpay_signature,
//     razorpay_order_id: data.razorpay_order_id,
//   };

//   let options = {
//     method: "POST",
//     headers: {
//       "Content-Type": "application/json;charset=utf-8",
//     },
//     body: JSON.stringify(d),
//   };
//   console.log(options);

//   fetch("http://localhost:3000/payment", options)
//     .then((response) => {
//       console.log(response);
//       response.json();
//     })
//     .then((data) => console.log(data));
// };

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
