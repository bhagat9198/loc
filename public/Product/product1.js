console.log("product1.js");

const db = firebase.firestore();
const storageService = firebase.storage();

let PRODUCT_ID;
let CATEGORY_ID;
let prodDetails;

var getParams = async (url) => {
  var params = {};
  var parser = document.createElement("a");
  parser.href = url;
  var query = parser.search.substring(1);
  var vars = query.split("&&");
  for (var i = 0; i < vars.length; i++) {
    var pair = vars[i].split("=");
    params[pair[0]] = decodeURIComponent(pair[1]);
  }
  return params;
};

getParams(window.location.href).then((response) => {
  console.log(response);
  PRODUCT_ID = response.prod;
  CATEGORY_ID = response.cat;
  if (PRODUCT_ID && CATEGORY_ID) {
		prodDetails = extractProdDetails();
		displayProduct();
  }
});

const extractProdDetails = () => {
	db.collection(CATEGORY_ID).doc(PRODUCT_ID).onSnapshot(doc => {
		let docData = doc.data();
		return docData;
	})
};

const displayProduct = () => {

}

const displaySuggestion = () => {
	let card = '';
	let postsRef = db.collection(CATEGORY_ID)
	postsRef.get().then()
}