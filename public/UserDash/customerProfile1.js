console.log('customerProfile1.js');

const db = firebase.firestore();
const storageService = firebase.storage();

let data = localStorage.getItem('locLoggedInUser');
console.log(data);