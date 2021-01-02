console.log("termsAndConditions.js");

const db = firebase.firestore();
const storageService = firebase.storage();

const heroImgHTML = document.querySelector('#heroImg');
const aboutNoteHTML = document.querySelector('#terms-note');

db.collection('footer').doc('terms').onSnapshot(doc => {
  let docData = doc.data();
  heroImgHTML.style.backgroundImage  = `url(${docData.imgUrl})`;
  aboutNoteHTML.innerHTML = `${docData.note}`;
})
