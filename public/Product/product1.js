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

getParams(window.location.href).then(async (response) => {
  console.log(response);
  PRODUCT_ID = response.prod;
  CATEGORY_ID = response.cat;
  console.log(PRODUCT_ID, CATEGORY_ID);
  if (PRODUCT_ID && CATEGORY_ID) {
    prodDetails = await extractProdDetails();
    displayProduct(prodDetails);
  }
});

const extractProdDetails = () => {
  console.log(CATEGORY_ID, PRODUCT_ID);
  return db
    .collection(CATEGORY_ID)
    .doc(PRODUCT_ID)
    .get()
    .then((doc) => {
      let docData = doc.data();
      // console.log(docData);
      return docData;
    });
};

const bigImgHolderHTML = document.querySelector("#bigImgHolder");
const prodSubImgsHTML = document.querySelector("#prodSubImgs");
const productNameHTML = document.querySelector(".product-name");
const productIsstookHTML = document.querySelector(".product-isstook");
const reviewCountHTML = document.querySelector(".review-count");
const sizepriceHTML = document.querySelector("#sizeprice");
const prodPrevPriceHTML = document.querySelector("#prod-prevPrice");
let initialProdValue = 1;
let totalCost, totalPrevPrice;

const displayProduct = (prodData) => {
  console.log(prodData);
  let big = `
    <img class="xzoom5" id="xzoom-magnific"  
      src="${prodData.mainImgUrl}"
      xoriginal = "${prodData.mainImgUrl}"
      alt="Lake of cakes"
    /> 
  `;
  // console.log(big);
  bigImgHolderHTML.innerHTML = big;

  let imgs = `
  <a
    href="${prodData.mainImgUrl}">
    <img onclick="imgChange(event, this)" class="xzoom-gallery5" width="70" style="object-fit: contain;"
      src="${prodData.mainImgUrl}"
      alt="Lake of cakes"
    >
  </a>`;

  if (prodData.subImgsUrl) {
    if (prodData.subImgsUrl.length > 0) {
      prodData.subImgsUrl.map((subUrl) => {
        imgs += `
        <a
          href="${subUrl}">
          <img class="xzoom-gallery5"  onclick="imgChange(event, this)" width="70" style="object-fit: contain;"
            src="${subUrl}"
            alt="Lake of cakes">
        </a>
        `;
      });
    }
  }
  prodSubImgsHTML.innerHTML = imgs;

  productNameHTML.innerHTML = prodData.name;

  if (prodData.isActivated) {
    productIsstookHTML.innerHTML = `
    <p>
      <i class="icofont-check-circled"></i>
      In Stock
    </p>
    `;
  } else {
    productIsstookHTML.innerHTML = `
    <p>
      <i class="icofont-check-circled"></i>
      Currently Unaviable
    </p>
    `;
  }

  if (prodData.reviews) {
    reviewCountHTML.innerHTML = `
    <p>${prodData.reviews.length} Review(s)</p>
    `;
  } else {
    reviewCountHTML.innerHTML = `
    <p>0 Review(s)</p>
    `;
  }

 
  sizepriceHTML.innerHTML = prodData.totalPrice;
 
  totalCost = +prodData.totalPrice;
  prodPrevPriceHTML.innerHTML = `&#8377; ${prodData.mrp}`;
  totalCost = +prodData.totalPrice;
  totalPrevPrice = +prodData.mrp;
  calculatePrice("qty");

  document.querySelector("#prod-qty").innerHTML = initialProdValue;

  if (prodData.wholeCategory.toUpperCase().includes("CAKE")) {
    document.querySelectorAll(".cake-attribute").forEach((el) => {
      el.style.display = "block";
    });
    displayWeights("0.5");
  } else {
    document.querySelectorAll(".cake-attribute").forEach((el) => {
      el.style.display = "none";
    });
  }

  if (prodData.shapes) {
    const cakeShapeHTML = document.querySelector(".cake-shape");
    cakeShapeHTML.innerHTML = `
    <div class="custom-control custom-radio" style="margin-right: 15px;">
    <input type="checkbox" id="shape-heart" name="shape-heart" onchange="cakeShape(event, this)"
    class="custom-control-input product-attr">
    <label class="custom-control-label" for="shape-heart" style="font-weight: 700;">Heart Shape
    </label>
    </div>
    `;
  }

  const prodDescHTML = document.querySelector("#prod-desc");
  prodDescHTML.innerHTML = `${prodData.descriptions}`;
  const prodPolicyHTML = document.querySelector('#prod-policy');
  prodPolicyHTML.innerHTML = `${prodData.policy}`;
};

const calculatePrice = (condition, data) => {
  console.log(totalCost, totalPrevPrice);
  if (condition === "qty") {
    console.log('qty');
    totalCost = +initialProdValue * totalCost;
    // console.log(initialProdValue, totalCost);
    totalPrevPrice = +initialProdValue * +totalPrevPrice;
  } else if (condition === "weightPrice") {
    console.log('weightPrice');
    let weightPrice = +prodDetails.weights[data].weightPrice;
    let gstPrice = (weightPrice * +prodDetails.gst) / 100;
    let prevWeightPrice = +prodDetails.weights[data].weightPrevPrice;
    let prevGstPrice = (prevWeightPrice * +prodDetails.gst) / 100;

    totalCost = +initialProdValue * (weightPrice + gstPrice);
    totalPrevPrice = +initialProdValue * (prevWeightPrice + prevGstPrice);
  } else if (condition === "eggless") {
    if (data === "add") {
      totalCost = totalCost + +prodDetails.type.price;
    } else {
      totalCost = totalCost - +prodDetails.type.price;
    }
  } else if (condition === "shape") {
    if (data === "add") {
      totalCost = totalCost + +prodDetails.shapes[0].shapePrice;
      console.log(totalCost, prodDetails.shapes[0].shapePrice);
    } else {
      totalCost = totalCost - +prodDetails.shapes[0].shapePrice;
      console.log(totalCost, prodDetails.shapes[0].shapePrice);
    }
  }

  
  console.log(totalCost, totalPrevPrice);
  sizepriceHTML.innerHTML = `&#8377;${totalCost}`;
  prodPrevPriceHTML.innerHTML = `&#8377; ${totalPrevPrice}`;
};

const cakeShape = (e, current) => {
  console.log(current.value);
  if (current.checked) {
    calculatePrice("shape", "add");
  } else {
    calculatePrice("shape", "minus");
  }
};

const cakeWeight = (e, current) => {
  console.log(current.value);
  let cakeweightIndex = e.target.dataset.weightindex;
  let selectedWeight = e.target.dataset.weight;
  // console.log(cakeweightIndex);
  displayWeights(selectedWeight);
  // totalPrice = +prodDetails.weights[cakeweightIndex].price;
  calculatePrice("weightPrice", cakeweightIndex);
};

const displayWeights = (makedWeight) => {
  const allCakesWeightsHTML = document.querySelector("#allCakesWeights");
  if (prodDetails.weights) {
    if (prodDetails.weights.length > 0) {
      let weightCard = "";
      prodDetails.weights.map((weight, index) => {
        let rand = Math.random();
        let weightNum, price, pprice;
        if (weight.cakeWeight === "half") {
          weightNum = `0.5`;
          price = weight.weightPrice;
          pprice = weight.weightPrevPrice;
        } else if (weight.cakeWeight === "one") {
          weightNum = `1`;
          price = weight.weightPrice;
          pprice = weight.weightPrevPrice;
        } else if (weight.cakeWeight === "oneHalf") {
          weightNum = `1.5`;
          price = weight.weightPrice;
          pprice = weight.weightPrevPrice;
        } else if (weight.cakeWeight === "two") {
          weightNum = `2`;
          price = weight.weightPrice;
          pprice = weight.weightPrevPrice;
        } else if (weight.cakeWeight === "three") {
          weightNum = `3`;
          price = weight.weightPrice;
          pprice = weight.weightPrevPrice;
        } else if (weight.cakeWeight === "four") {
          weightNum = `4`;
          price = weight.weightPrice;
          pprice = weight.weightPrevPrice;
        } else if (weight.cakeWeight === "five") {
          weightNum = `5`;
          price = weight.weightPrice;
          pprice = weight.weightPrevPrice;
        } else if (weight.cakeWeight === "six") {
          weightNum = `6`;
          price = weight.weightPrice;
          pprice = weight.weightPrevPrice;
        } else {
          weightNum = "";
          price = "";
          pprice = "";
        }
        weightCard += `
        <div class="custom-control custom-radio" style="margin-right: 15px;">
          <input type="radio"  ${
            weightNum === makedWeight ? "checked" : null
          } id="${rand}" name="cake-weight-option" data-weight="${weightNum}" data-weightindex="${index}" onclick=changePrice(4568) onchange="cakeWeight(event, this)"
            class="custom-control-input product-attr">
          <img class="productimg"
            src="${prodDetails.mainImgUrl}"
            alt="Lake of cakes"
            style="border-radius: 50px;border: 1px solid black ;box-shadow:5px 5px 5px gray;width: 60px ;object-fit: cover;">
          <label class="custom-control-label" for="${rand}" style="font-weight: 700;">${weightNum} kg</label>
        </div>
        `;
      });

      allCakesWeightsHTML.innerHTML = weightCard;
    }
  }
};

const decQty = (e) => {
  // console.log(e);
  if (initialProdValue >= 2) {
    initialProdValue--;
    document.querySelector("#prod-qty").innerHTML = "";
    document.querySelector("#prod-qty").innerHTML = initialProdValue;
    calculatePrice("qty");
  }
};

const incQty = (e) => {
  // console.log(e);
  initialProdValue++;
  document.querySelector("#prod-qty").innerHTML = initialProdValue;
  calculatePrice("qty");
};

const cakeType = (e, current) => {
  if (current.checked) {
    // console.log(prodDetails);
    calculatePrice("eggless", "add");
    // totalCost += +prodDetails.type.price;
    // sizepriceHTML.innerHTML = `&#8377;${totalCost}`;
  } else {
    // console.log('not checked');
    // totalCost -= +prodDetails.type.price;
    calculatePrice("eggless", "minus");
    // sizepriceHTML.innerHTML = `&#8377;${totalCost}`;
  }
};

const displaySuggestion = () => {
  let card = "";
  let postsRef = db.collection(CATEGORY_ID);
  // postsRef.get().then()
};

const imgChange = (e, current) => {
  // console.log(current);
  let imgUrl = current.src;
  console.log(imgUrl);
  // bigImgHolderHTML.innerHTML = '';
  let big = `
  <img class="xzoom5" id="xzoom-magnific"  
      src="${imgUrl}"
      xoriginal = "${imgUrl}"
      alt="Lake of cakes"
    /> 
  `;

  bigImgHolderHTML.innerHTML = big;
  console.log(document.querySelector('#whole-img-block'));
};


const reviewFormHTML = document.querySelector('#review-form');

const reviewForm = e => {
  // console.log(e);
  e.preventDefault();
  const expirence = reviewFormHTML["experience"].value;
  const msg = reviewFormHTML["review-message"].value;

  let dbRef = db.collection(CATEGORY_ID).doc(PRODUCT_ID);

  dbRef.get().then(doc => {
    let docData = doc.data();
    let data = {
      rating: expirence,
      msg: msg
    }
    if(docData.reviews) {
      docData.reviews.push(data);
    } else {
      docData.reviews = [data];
    }
    dbRef.update(docData);
    reviewFormHTML.reset();
    console.log('updated');
  })
  console.log('done');
}

reviewFormHTML.addEventListener('submit', reviewForm);

const enterKeyFun = e => {
  // console.log(e.keyCode);
  if(e.keyCode === 13) {
    e.preventDefault();
  }
}

reviewFormHTML.addEventListener('keypress', enterKeyFun);

const productOrder = () => {
  
}

const buyNowBtnHTML = document.querySelector('#buyNowBtn');
const addToCartBtnHTML = document.querySelector('#addToCartBtn');
buyNowBtnHTML.addEventListener('click', productOrder);