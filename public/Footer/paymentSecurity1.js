// console.log("paymentSecurity1.js");

const db = firebase.firestore();
const storageService = firebase.storage();

const heroImgHTML = document.querySelector('#heroImg');
const aboutNoteHTML = document.querySelector('#payment-note');

db.collection('footer').doc('paymentSecurity').onSnapshot(doc => {
  let docData = doc.data();
  heroImgHTML.style.backgroundImage  = `url(${docData.imgUrl})`;
  aboutNoteHTML.innerHTML = `${docData.note}` ;
  
})