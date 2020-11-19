console.log('cart1.js');

const db = firebase.firestore();
const storageService = firebase.storage;

if (localStorage.getItem("locLoggedInUser") == "null") {
  window.location.href = "./../Auth/login.html";
}

