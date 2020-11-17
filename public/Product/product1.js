console.log("product1.js");

const db = firebase.firestore();
const storageService = firebase.storage();

let PRODUCT_ID;
let CATEGORY_ID;
let PROD_DETAILS;

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
    PROD_DETAILS = await extractProdDetails();
    displayProduct(PROD_DETAILS);
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
const prodPriceHTML = document.querySelector("#sizeprice");
const prodPrevPriceHTML = document.querySelector("#prod-prevPrice");
let PROD_QTY = 1;
let TOTAL_COST = 0, TOTAL_PREV_PRICE = 0, HEART = false, EGGLESS = false, WEIGHT_PRICE = {};

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
      Currently Unavilable
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

  // sizepriceHTML.innerHTML = prodData.totalPrice;
 
  // totalCost = +prodData.totalPrice;
  // prodPrevPriceHTML.innerHTML = `&#8377; ${prodData.mrp}`;
  // totalCost = +prodData.totalPrice;
  // totalPrevPrice = +prodData.mrp;
  // calculatePrice("qty");
  

  document.querySelector("#prod-qty").innerHTML = PROD_QTY;

  if (prodData.wholeCategory.toUpperCase().includes("CAKE")) {
    document.querySelectorAll(".cake-attribute").forEach((el) => {
      el.style.display = "block";
    });
    WEIGHT_PRICE.current = +prodData.weights[0].weightPrice;
    WEIGHT_PRICE.previous = +prodData.weights[0].weightPrevPrice;
    calculatePrice();
    displayWeights(prodData.weights[0].cakeWeight);
  } else {
    document.querySelectorAll(".cake-attribute").forEach((el) => {
      el.style.display = "none";
    });
    WEIGHT_PRICE.current = +prodData.sp;
    WEIGHT_PRICE.previous = +prodData.mrp;
    calculatePrice()
  }

  if (prodData.shapes) {
    const cakeShapeHTML = document.querySelector(".cake-shape");
    cakeShapeHTML.innerHTML = `
    <div class="custom-control custom-radio" style="margin-right: 15px;">
      <input type="checkbox" id="shape-heart" name="shape-heart" onchange="cakeShape(event, this)" class="custom-control-input product-attr">
      <label class="custom-control-label" for="shape-heart" style="font-weight: 700;">Heart Shape </label>
    </div>
    `;
  }

  const prodDescHTML = document.querySelector("#prod-desc");
  prodDescHTML.innerHTML = `${prodData.descriptions}`;
  const prodPolicyHTML = document.querySelector('#prod-policy');
  prodPolicyHTML.innerHTML = `${prodData.policy}`;
};

const calculatePrice = () => {
  console.log(TOTAL_COST, TOTAL_PREV_PRICE);
  console.log(typeof(TOTAL_COST), typeof(TOTAL_PREV_PRICE));

  if(WEIGHT_PRICE) {
    TOTAL_COST = +WEIGHT_PRICE.current;
    TOTAL_PREV_PRICE = +WEIGHT_PRICE.previous;
  }

  if(HEART) {
    TOTAL_COST = TOTAL_COST + +PROD_DETAILS.shapes[0].shapePrice;
    TOTAL_PREV_PRICE = TOTAL_PREV_PRICE + +PROD_DETAILS.shapes[0].shapePrice;
  }
  console.log(TOTAL_COST, TOTAL_PREV_PRICE);
  console.log(typeof(TOTAL_COST), typeof(TOTAL_PREV_PRICE));
  if(EGGLESS) {
    console.log('egg');
    TOTAL_COST = TOTAL_COST + +PROD_DETAILS.type.price;
    TOTAL_PREV_PRICE = TOTAL_PREV_PRICE + +PROD_DETAILS.type.price;
  }
  console.log(TOTAL_COST, TOTAL_PREV_PRICE);
  console.log(typeof(TOTAL_COST), typeof(TOTAL_PREV_PRICE));

  
  console.log(TOTAL_COST, TOTAL_PREV_PRICE);
  console.log(typeof(TOTAL_COST), typeof(TOTAL_PREV_PRICE));

  let cost = TOTAL_COST * PROD_QTY;
  let costWithGST = cost + (cost * (+PROD_DETAILS.gst/100));
  let prevCost = TOTAL_PREV_PRICE * PROD_QTY;
  let prevCostWithGST = prevCost + (prevCost * (+PROD_DETAILS.gst/100));

  TOTAL_COST = costWithGST;
  TOTAL_PREV_PRICE = prevCostWithGST;

  TOTAL_COST=Math.round(TOTAL_COST)
  TOTAL_PREV_PRICE=Math.round(TOTAL_PREV_PRICE)
  prodPriceHTML.innerHTML = (TOTAL_COST);
  prodPrevPriceHTML.innerHTML = TOTAL_PREV_PRICE;
  changePrice(TOTAL_COST)
};

const cakeShape = (e, current) => {
  console.log(current.value);
  if (current.checked) {
    HEART = true;
    calculatePrice();
  } else {
    HEART = false;
    calculatePrice();
  }
};

const cakeWeight = (e, current) => {
  console.log(current.value);
  // let cakeweightIndex = e.target.dataset.weightindex;
  let selectedWeight = e.target.dataset.weight;
  console.log(selectedWeight);
  displayWeights(selectedWeight);
};

const displayWeights = (makedWeight) => {
  console.log(makedWeight);
  const allCakesWeightsHTML = document.querySelector("#allCakesWeights");
  if (PROD_DETAILS.weights) {
    if (PROD_DETAILS.weights.length > 0) {
      let weightCard = "";
      PROD_DETAILS.weights.map((weight, index) => {
        let rand = Math.random();
        let weightName, price, pprice, weightNum;
        if (weight.cakeWeight === "half") {
          weightNum = '0.5';
          weightName = weight.cakeWeight;
          price = weight.weightPrice;
          pprice = weight.weightPrevPrice;
        } else if (weight.cakeWeight === "one") {
          weightNum = '1';
          weightName = weight.cakeWeight;
          price = weight.weightPrice;
          pprice = weight.weightPrevPrice;
        } else if (weight.cakeWeight === "oneHalf") {
          weightNum = '1.5';
          weightName = weight.cakeWeight;
          price = weight.weightPrice;
          pprice = weight.weightPrevPrice;
        } else if (weight.cakeWeight === "two") {
          weightNum = '2';
          weightName = weight.cakeWeight;
          price = weight.weightPrice;
          pprice = weight.weightPrevPrice;
        } else if (weight.cakeWeight === "three") {
          weightNum = '3';
          weightName = weight.cakeWeight;
          price = weight.weightPrice;
          pprice = weight.weightPrevPrice;
        } else if (weight.cakeWeight === "four") {
          weightNum = '4';
          weightName = weight.cakeWeight;
          price = weight.weightPrice;
          pprice = weight.weightPrevPrice;
        } else if (weight.cakeWeight === "five") {
          weightNum = '5';
          weightName = weight.cakeWeight;
          price = weight.weightPrice;
          pprice = weight.weightPrevPrice;
        } else if (weight.cakeWeight === "six") {
          weightNum = '6';
          weightName = weight.cakeWeight;
          price = weight.weightPrice;
          pprice = weight.weightPrevPrice;
        } else {
          weightName = "";
          price = "";
          pprice = "";
        }

        let selected = null;
        if(weightName === makedWeight) {
          console.log(weightName);
          WEIGHT_PRICE.current = price;
          WEIGHT_PRICE.previous = pprice;
          selected = 'checked'
        }
        calculatePrice();
        weightCard += `
        <div class="custom-control custom-radio" style="margin-right: 15px;">
          <input type="radio"  ${ selected } id="${rand}" name="cake-weight-option"  data-weight="${weightName}"   onchange="cakeWeight(event, this)" class="custom-control-input product-attr">
          <img class="productimg"
            src="${PROD_DETAILS.mainImgUrl}"
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
  if (PROD_QTY >= 2) {
    PROD_QTY--;
    document.querySelector("#prod-qty").innerHTML = "";
    document.querySelector("#prod-qty").innerHTML = PROD_QTY;
    calculatePrice();
  }
};

const incQty = (e) => {
  // console.log(e);
  PROD_QTY++;
  document.querySelector("#prod-qty").innerHTML = PROD_QTY;
  calculatePrice();
};

const cakeType = (e, current) => {
  if (current.checked) {
    // console.log(PROD_DETAILS);
    EGGLESS = true;
    calculatePrice();
    // totalCost += +PROD_DETAILS.type.price;
    // sizepriceHTML.innerHTML = `&#8377;${totalCost}`;
  } else {
    // console.log('not checked');
    // totalCost -= +PROD_DETAILS.type.price;
    EGGLESS = false;
    calculatePrice();
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