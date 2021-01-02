// console.log("privacyPolicy1.js");

const db = firebase.firestore();
const storageService = firebase.storage();

const heroImgHTML = document.querySelector('#heroImg');
const aboutNoteHTML = document.querySelector('#privacy-note');

db.collection('footer').doc('privacyPolicy').onSnapshot(doc => {
  let docData = doc.data();
  heroImgHTML.style.backgroundImage  = `url(${docData.imgUrl})`;
  aboutNoteHTML.innerHTML = `${docData.note}`;
  
})
