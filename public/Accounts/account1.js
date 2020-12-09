console.log('account1.js');
const db = firebase.firestore();

let ALL_ORDERS = [];
db.collection('orders').onSnapshot(snaps => {
  let sanpsDocs = snaps.docs;

  for(let doc of sanpsDocs) {
    let data = doc.data();
    console.log(data);
  }
})