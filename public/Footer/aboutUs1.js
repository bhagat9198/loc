// console.log("aboutUs1.js");

const db = firebase.firestore();
const storageService = firebase.storage();

const heroImgHTML = document.querySelector('#heroImg');
const aboutNoteHTML = document.querySelector('#about-note');

db.collection('footer').doc('about').onSnapshot(doc => {
  let docData = doc.data();
  heroImgHTML.style.backgroundImage  = `url(${docData.imgUrl})`;
  let aboutImg = `
  <div class="img-container"  style="text-align: center;">
    <img src="https://media.giphy.com/media/dxDAKjYybPPkE1pfvp/giphy.gif" alt="apimatic code generation engine"
      class="img-responsive" />
  </div>
  `;
  aboutNoteHTML.innerHTML = `${docData.note}` + aboutImg;
  
})