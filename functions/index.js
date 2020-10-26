const functions = require('firebase-functions');
const admin = require('firebase-admin');
var uniqid = require('uniqid');
var firebase = require("firebase");

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
// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// const storage = require('firebase-storage');
admin.initializeApp();

exports.addProductRequest = functions.https.onCall(async(data, context) => {
  console.log(data);
  // const pid = uniqid();
  // data.pid = pid;
  // const doc = await admin.firestore().collection('cakes').add(data);
  // const docData = await doc.get();
  // return [pid, docData];
  let dbref=firebase.database().ref('AllProducts');
  let newFormMessage=dbref.push();
  newFormMessage.set(data);
  return;
});
