const functions = require('firebase-functions');
const admin = require('firebase-admin');
// const storage = require('firebase-storage');
admin.initializeApp();


exports.addProductRequest = functions.https.onCall((data, context) => {
  // console.log(data);
  // console.log(data.category);
  // if (!context.auth) {
  //   throw new functions.https.HttpsError(
  //     'unauthenticated', 
  //     'only authenticated admin can add requests'
  //   );
  // const category = data.product.category;
  // admin.firestore().collection(category).add(data.product);
  return admin.firestore().collection('cakes').add(data);
});




