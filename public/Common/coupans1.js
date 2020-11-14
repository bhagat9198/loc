console.log("coupans1.js");

const db = firebase.firestore();

db.collection('coupans').onSnapshot(snapshots => {
  let snapshotDocs = snapshots.docs;

  snapshotDocs.map(doc => {
    let docData = doc.data();
    displayCard(docData);
  })
})