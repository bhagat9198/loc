const functions = require('firebase-functions');
const cryptoHmac = require('create-hmac');
const Razorpay = require('razorpay');
 
// exports.helloWorld = functions.https.onRequest((request, response) => {
//  response.send("Hello from Firebase!");
// });

exports.checkoutReq = functions.https.onCall(async(data, context) => {
  // if (!context.auth) {
  //   throw new functions.https.HttpsError(
  //     'unauthenticated', 
  //     'only authenticated users can add requests'
  //   );
  // }

  var instance = new Razorpay({
    key_id: 'rzp_live_BfdC1FopDqRvQL',
    key_secret: 'AE2PN4j1ckML1UkpCRYggUxn',
  });

  console.log(data);
  // let t = parseInt(data.amount) * 100;
  // t = 1;
  var options = {
		amount: 100,  // amount in the smallest currency unit
		currency: "INR",
		receipt: "order_rcptid_11",
		payment_capture: '0'
	};
  
	await instance.orders.create(options, (err, order) => {
    if(err) {
      console.log(err);
    }
    console.log(options);
    options.orderId = order.id;
    console.log(options);
    
  });
  return options;
})

exports.payemnetStatus = functions.https.onCall((data, context) => {
  // if (!context.auth) {
  //   throw new functions.https.HttpsError(
  //     'unauthenticated', 
  //     'only authenticated users can add requests'
  //   );
  // }

  console.log(data);
  const razorpay_payment_id = data.razorpay_payment_id;
	const razorpay_order_id = data.razorpay_order_id;
	const razorpay_signature = data.razorpay_signature;

	const dataKey = razorpay_order_id + '|' + razorpay_payment_id; 
  const expectSig = cryptoHmac('sha256', 'AE2PN4j1ckML1UkpCRYggUxn').update(dataKey.toString()).digest('hex');
  console.log(expectSig);
  let status;
	if(expectSig === razorpay_signature) {
    status = true;
  } else {     
    status = false;
  }
  return res.status(200).json(status);
})

