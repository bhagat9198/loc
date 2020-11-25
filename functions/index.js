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


