console.log("about.js");

const db = firebase.firestore();
const storageService = firebase.storage();
let IMAGE;
const aboutFormHTML = document.querySelector('#about-form');

const aboutForm = e => {
  e.preventDefault();
  let note = aboutForm['about-text'].value;
  let imgName = IMAGE.name;
  console.log(note, imgName);
  
}

aboutFormHTML.addEventListener('submit', aboutForm);

const uploadFile = e => {
  IMAGE = r.target.files[0];
  console.log(IMAGE);
}

const sliderFileHTML = document.querySelector('click', uploadFile);