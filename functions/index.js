const functions = require('firebase-functions');
const admin = require('firebase-admin');
var uniqid = require('uniqid');

// const storage = require('firebase-storage');
admin.initializeApp();

exports.addProductRequest = functions.https.onCall(async(data, context) => {
  console.log(data);
  // console.log(data.category);
  // if (!context.auth) {
  //   throw new functions.https.HttpsError(
  //     'unauthenticated', 
  //     'only authenticated admin can add requests'
  //   );
  // const category = data.product.category;
  // admin.firestore().collection(category).add(data.product);

  const pid = uniqid();
  data.pid = pid;
  const doc = await admin.firestore().collection('cakes').add(data);
  const docData = await doc.get();
  // const docId = await doc.getId();

  return [id, docData];
});
// show me place where had u fetch



