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
  PRODUCT_ID = response.prod;
  CATEGORY_ID = response.cat;
  // console.log(PRODUCT_ID, CATEGORY_ID);
  if (PRODUCT_ID && CATEGORY_ID) {
    PROD_DETAILS = await extractProdDetails();
    displayProduct(PROD_DETAILS);
    displaySuggestions()
  }
});

const extractProdDetails = () => {
  // console.log(CATEGORY_ID, PRODUCT_ID);
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
const disPercentHTML = document.querySelector('#disPercent');

let PROD_QTY = 1;
let TOTAL_COST = 0,
  TOTAL_PREV_PRICE = 0,
  HEART = false,
  EGGLESS = false,
  WEIGHT_PRICE = {};

const displayProduct = (prodData) => {
  // console.log(prodData);

  document.querySelector('.idno').innerHTML = PRODUCT_ID;

  let big = `
  <span class="zoom" id="ex1">
    <img   
      src="${prodData.mainImgUrl}"
      xoriginal = "${prodData.mainImgUrl}"
      alt="Lake of cakes"
      </span> 
  `;
  // console.log(big);
  bigImgHolderHTML.innerHTML = big;
		
  $('#ex1').zoom();

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
          href="#!">
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
    document.querySelector('#buyNowBtn').disabled = false;
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

  document.querySelector("#prod-qty").innerHTML = PROD_QTY;
  if (prodData.wholeCategory.toUpperCase().includes("CAKE")) {
    document.querySelectorAll(".cake-attribute").forEach((el) => {
      el.style.display = "block";
    });
    WEIGHT_PRICE.current = +prodData.weights[0].weightPrice;
    WEIGHT_PRICE.previous = +prodData.weights[0].weightPrevPrice;
    WEIGHT_PRICE.weight = +prodData.weights[0].cakeWeight;
    calculatePrice();
    displayWeights(prodData.weights[0].cakeWeight);
  } else {
    document.querySelectorAll(".cake-attribute").forEach((el) => {
      el.style.display = "none";
    });
    WEIGHT_PRICE.current = +prodData.sp;
    WEIGHT_PRICE.previous = +prodData.mrp;
    calculatePrice();
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

  if(prodData.flavours) {
    if(prodData.flavours.length > 0) {
      const cakeFlavourHTML = document.querySelector('#cake-flavour');
      let card = '';
      prodData.flavours.map(flav => {
        card += `
        <div class="custom-control custom-radio" style="margin-right: 25px;">
          <input type="radio" checked id="flavour-${flav}" name="cake-flavour" class="custom-control-input product-attr" value="${flav}">
          <label class="custom-control-label" for="flavour-${flav}" style="font-weight: 700;">${flav}</label>
        </div>
        `;
      })

      cakeFlavourHTML.innerHTML = card;
    }
  }
  while (
    prodData.descriptions.includes("<p><br></p>") ||
    prodData.descriptions.startsWith("<p><br></p>")
  ) {
    prodData.descriptions = prodData.descriptions.replace("<p><br></p>", "");
  }

  while (
    prodData.descriptions.includes("<p><br></p>") ||
    prodData.descriptions.endsWith("<p><br></p>")
  ) {
    prodData.descriptions = prodData.descriptions.replace(
      new RegExp("<p><br></p>$"),
      ""
    );
  }
  while (
    prodData.policy.startsWith("<p><br></p>") ||
    prodData.policy.includes("<p><br></p>")
  ) {
  
    prodData.policy = prodData.policy.replace("<p><br></p>", "");
  }

  while (
    prodData.policy.endsWith("<p><br></p>") ||
    prodData.policy.includes("<p><br></p>")
  ) {
    prodData.policy = prodData.policy.replace(new RegExp("<p><br></p>$"), "");
  }

  const prodDescHTML = document.querySelector("#prod-desc");
  prodDescHTML.innerHTML = `${prodData.descriptions}`;
  const prodPolicyHTML = document.querySelector("#prod-policy");
  prodPolicyHTML.innerHTML = `${prodData.policy}`;
};

const calculatePrice = () => {
  // console.log(TOTAL_COST, TOTAL_PREV_PRICE);
  // console.log(typeof(TOTAL_COST), typeof(TOTAL_PREV_PRICE));

  if (WEIGHT_PRICE) {
    TOTAL_COST = +WEIGHT_PRICE.current;
    TOTAL_PREV_PRICE = +WEIGHT_PRICE.previous;
  }
  // console.log(TOTAL_COST, TOTAL_PREV_PRICE);
  // console.log(typeof(TOTAL_COST), typeof(TOTAL_PREV_PRICE));

  if (HEART) {
    TOTAL_COST = TOTAL_COST + +PROD_DETAILS.shapes[0].shapePrice;
    TOTAL_PREV_PRICE = TOTAL_PREV_PRICE + +PROD_DETAILS.shapes[0].shapePrice;
  }
  // console.log(TOTAL_COST, TOTAL_PREV_PRICE);
  // console.log(typeof(TOTAL_COST), typeof(TOTAL_PREV_PRICE));
  if (EGGLESS) {
    console.log("egg");
    TOTAL_COST = TOTAL_COST + +PROD_DETAILS.type.price;
    TOTAL_PREV_PRICE = TOTAL_PREV_PRICE + +PROD_DETAILS.type.price;
  }
  // console.log(TOTAL_COST, TOTAL_PREV_PRICE);
  // console.log(typeof(TOTAL_COST), typeof(TOTAL_PREV_PRICE));

  let cost = TOTAL_COST * PROD_QTY;
  let costWithGST = cost + cost * (+PROD_DETAILS.gst / 100);
  let prevCost = TOTAL_PREV_PRICE * PROD_QTY;
  let prevCostWithGST = prevCost + prevCost * (+PROD_DETAILS.gst / 100);

  TOTAL_COST = costWithGST;
  TOTAL_PREV_PRICE = prevCostWithGST;

  TOTAL_COST = Math.round(TOTAL_COST);
  TOTAL_PREV_PRICE = Math.round(TOTAL_PREV_PRICE);
  prodPriceHTML.innerHTML = TOTAL_COST;
  prodPrevPriceHTML.innerHTML = TOTAL_PREV_PRICE;
  changePrice(TOTAL_COST);
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
  const allCakesWeightsHTML = document.querySelector("#allCakesWeights");
  if (PROD_DETAILS.weights) {
    if (PROD_DETAILS.weights.length > 0) {
      let weightCard = "";
      PROD_DETAILS.weights.map((weight, index) => {
        let rand = Math.random();
        let weightName, price, pprice, weightNum;
        if (weight.cakeWeight === "half") {
          weightNum = "0.5";
          weightName = weight.cakeWeight;
          price = weight.weightPrice;
          pprice = weight.weightPrevPrice;
        } else if (weight.cakeWeight === "one") {
          // console.log(weight.cakeWeight);
          weightNum = "1";
          weightName = weight.cakeWeight;
          price = weight.weightPrice;
          pprice = weight.weightPrevPrice;
        } else if (weight.cakeWeight === "oneHalf") {
          weightNum = "1.5";
          weightName = weight.cakeWeight;
          price = weight.weightPrice;
          pprice = weight.weightPrevPrice;
        } else if (weight.cakeWeight === "two") {
          weightNum = "2";
          weightName = weight.cakeWeight;
          price = weight.weightPrice;
          pprice = weight.weightPrevPrice;
        } else if (weight.cakeWeight === "three") {
          weightNum = "3";
          weightName = weight.cakeWeight;
          price = weight.weightPrice;
          pprice = weight.weightPrevPrice;
        } else if (weight.cakeWeight === "four") {
          weightNum = "4";
          weightName = weight.cakeWeight;
          price = weight.weightPrice;
          pprice = weight.weightPrevPrice;
        } else if (weight.cakeWeight === "five") {
          weightNum = "5";
          weightName = weight.cakeWeight;
          price = weight.weightPrice;
          pprice = weight.weightPrevPrice;
        } else if (weight.cakeWeight === "six") {
          weightNum = "6";
          weightName = weight.cakeWeight;
          price = weight.weightPrice;
          pprice = weight.weightPrevPrice;
        } else {
          weightName = "";
          price = "";
          pprice = "";
        }

        let selected = null;
        if (weightName === makedWeight) {
          // console.log(weightName);
          WEIGHT_PRICE.current = price;
          WEIGHT_PRICE.previous = pprice;
          WEIGHT_PRICE.weight = weightName;
          selected = "checked";
          // console.log(Math.round((+price/+pprice)*100));
          let dis = 100 - (Math.round((+price/+pprice)*100));
          console.log(dis);
          disPercentHTML.innerHTML = `(${dis}% OFF)`;
        }
        // console.log(WEIGHT_PRICE);
        weightCard += `
        <div class="custom-control custom-radio" style="margin-right: 15px;">
          <input type="radio"  ${selected} id="${rand}" name="cake-weight-option"  data-weight="${weightName}"   onchange="cakeWeight(event, this)" class="custom-control-input product-attr">
          <img class="productimg"
            src="${PROD_DETAILS.mainImgUrl}"
            alt="Lake of cakes"
            style="border-radius: 50px;border: 1px solid black ;box-shadow:5px 5px 5px gray;width: 60px ;object-fit: cover;">
          <label class="custom-control-label" for="${rand}" style="font-weight: 400;">${weightNum} kg</label>
        </div>
        `;
      });
      calculatePrice();
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
  <span class="zoom" id="ex11">
  <img   
      src="${imgUrl}"
      alt="Lake of cakes"
    /> 
    </span>
  `;
 

  bigImgHolderHTML.innerHTML = big;
  $('#ex11').zoom();
  console.log(document.querySelector("#whole-img-block"));
};

const reviewFormHTML = document.querySelector("#review-form");
const reviewForm = (e) => {
  // console.log(e);
  e.preventDefault();
  const expirence = reviewFormHTML["experience"].value;
  const msg = reviewFormHTML["review-message"].value;

  let dbRef = db.collection(CATEGORY_ID).doc(PRODUCT_ID);

  dbRef.get().then((doc) => {
    let docData = doc.data();
    let data = {
      rating: expirence,
      msg: msg,
    };
    if (docData.reviews) {
      docData.reviews.push(data);
    } else {
      docData.reviews = [data];
    }
    dbRef.update(docData);
    reviewFormHTML.reset();
    // console.log("updated");
  });
  // console.log("done");
};

reviewFormHTML.addEventListener("submit", reviewForm);

const enterKeyFun = (e) => {
  // console.log(e.keyCode);
  if (e.keyCode === 13) {
    e.preventDefault();
  }
};

reviewFormHTML.addEventListener("keypress", enterKeyFun);

const buyNowBtnHTML = document.querySelector("#buyNowBtn");

buyNowBtnHTML.addEventListener("click", () => {
  costWithAddonsHTML.innerHTML = TOTAL_COST;
});

const allAddonsHTML = document.querySelector("#allAddons");
const costWithAddonsHTML = document.querySelector("#cost-with-addons");

const addons_details = [];
 db.collection("addons")
  .get()
  .then((snapshots) => {
    let snapshotDocs = snapshots.docs;
    let card = "";
    snapshotDocs.map(async(doc, index) => {
      // card += displayAddon(doc);
      let docData = doc.data();
      // console.log(docData);
      addons_details.push({
        qty: 1,
        price: +docData.price,
        checked: false,
        id: doc.id,
      });
      card += `
      <div class="col-md-3 col-6 mt-3">
      <a class="item"
        style="width: 100%; ; padding: 0px; border-radius:1px; background: #fff;border:1px solid black !important;">
        <input type="checkbox" name="add_addons" class="add_addons" value="${index}" onchange="buyAddon(event, this)"
          style="display:block; position: absolute !important; top: 3px !important; z-index: 4 !important;">
        <div class="item-img" style="max-height:150px ;" style="max-height:150px ;">
          <img class="img-fluid"
            src="${docData.imgUrl}"
            alt="Lake of cakes" style="width:100%;object-fit: cover;">
        </div>
        <div class="info" style="height: 88px; ">
          <h5 class="name responsiveName" style="text-align: center !important;float: inherit;font-size: 12px;">
            ${docData.name}
          </h5>
          <h4 class="price"
            style="text-align: center !important;float: inherit;font-size: 13px;">₹ ${docData.price}
          </h4>
          <li class="d-block count ">
            <div class="qty">
              <ul>
                <li>
                  <span class="qtminus" data-id="addon__minus__${doc.id}" data-index="${index}" onclick="decAddon(event)">
                    <i class="fa fa-minus" data-id="addon__minus__${doc.id}" data-index="${index}"></i>
                  </span>
                </li>
                <li>
                  <span class="qttotal" id="addon__qty__${doc.id}" data-index="${index}">${addons_details[index].qty}</span>
                </li>
                <li>
                  <span class="qtplus" data-id="addon__add__${doc.id}" data-index="${index}" onclick="addAddon(event)">
                    <i class="fa fa-plus" data-id="addon__add__${doc.id}" data-index="${index}"></i>
                  </span>
                </li>
              </ul>
            </div>
          </li>
        </div>
      </a>
    </div>
    `;
    });

    allAddonsHTML.innerHTML = card;
    // console.log(TOTAL_COST);
  });

const calAddonPrice = () => {
  let totalAddonPrice = 0;
  addons_details.map((el) => {
    if (el.checked) {
      totalAddonPrice += el.price * el.qty;
    }
  });
  costWithAddonsHTML.innerHTML = totalAddonPrice + TOTAL_COST;
};

const buyAddon = (e, current) => {
  let index = e.target.value;
  console.log(addons_details);
  console.log(addons_details[index]);
  addons_details[index].checked = current.checked;
  calAddonPrice();
};

const addAddon = (e) => {
  let id = e.target.dataset.id.split("__")[2];
  let index = e.target.dataset.index;
  addons_details[index].qty++;
  document.querySelector(`#addon__qty__${id}`).innerHTML =
    addons_details[index].qty;
  calAddonPrice();
};

const decAddon = (e) => {
  let id = e.target.dataset.id.split("__")[2];
  let index = e.target.dataset.index;
  if (addons_details[index].qty > 1) {
    addons_details[index].qty--;
  }
  document.querySelector(`#addon__qty__${id}`).innerHTML =
    addons_details[index].qty;
  calAddonPrice();
};

const prodWithAddonsHTML = document.querySelector("#prod_with_addons");
let userId;
let userRef;
const checkAuth = async () => {
  if (!localStorage.getItem("locLoggedInUser")) {
    window.location.href = "./../Auth/login.html";
  } else {
    userId = localStorage.getItem("locLoggedInUser");
    userRef = await db.collection("Customers").doc(userId);
  }
};

const buyProd = async (e) => {
  let addonsSelected = [];
  addons_details.map((el) => {
    if (el.checked) {
      addonsSelected.push(el);
    }
  });

  await checkAuth();
  const orderId = Math.random();
  await userRef.get().then(async (doc) => {
    let docData = doc.data();
    if (docData.orders) {
      let cake = null;
      let f;
      if(WEIGHT_PRICE.weight) {
        f = document.querySelector('input[name=cake-flavour]:checked').value;
      } else {
        f = false;
      }
      if (WEIGHT_PRICE.weight) {
        cake = {};
        cake.heart = HEART;
        cake.eggless = EGGLESS;
        cake.weight = WEIGHT_PRICE.weight;
        // cake.flavour = document.querySelector('input[name=cake-flavour]:checked').value;
        cake.flavour = f;
      }
      let orderData = {
        orderId: orderId,
        status: "cancelled",
        type: "single",
        addons: addonsSelected,
        products: [
          {
            prodId: PRODUCT_ID,
            cat: CATEGORY_ID,
            message: document.querySelector("#prodMsg").value,
            qty: PROD_QTY,
          },
        ]
      }
      if(cake) {
        orderData.products[0].cake = cake;
        console.log(orderData);
      }
      docData.orders.push(orderData);
    } else {
      docData.orders = [];
      let cake = null;
      if (WEIGHT_PRICE.weight) {
        console.log(WEIGHT_PRICE.weight);
        let f;
        if(WEIGHT_PRICE.weight) {
          f = document.querySelector('input[name=cake-flavour]:checked').value;
        } else {
          f = false;
        }
        cake = {};
        cake.heart = HEART;
        cake.eggless = EGGLESS;
        cake.weight = WEIGHT_PRICE.weight;
        // cake.flavour = document.querySelector('input[name=cake-flavour]:checked').value;
        cake.flavour = f;
      }

      let orderData = {
        orderId: orderId,
        status: "cancelled",
        type: "single",
        addons: addonsSelected,
        products: [
          {
            prodId: PRODUCT_ID,
            cat: CATEGORY_ID,
            message: document.querySelector("#prodMsg").value,
            qty: PROD_QTY,
          },
        ]
      }
      if(cake) {
        orderData.products[0].cake = cake;
      }
      console.log(orderData);
      docData.orders.push(orderData);
    }
    await userRef.update(docData);
  });
  window.location.href = `./../Payment/checkout.html?checkout=${orderId}`;
};

prodWithAddonsHTML.addEventListener("click", buyProd);

const addToCartBtnHTML = document.querySelector("#addToCartBtn");

const addToCart = async (e) => {
  await checkAuth();
  const cartId = Math.random();
  await userRef.get().then(async (doc) => {
    let docData = doc.data();
    let f;
    if(WEIGHT_PRICE.weight) {
      f = document.querySelector('input[name=cake-flavour]:checked').value;
    } else {
      f = false;
    }

    if (docData.cart) {
      docData.cart.push({
        prodId: PRODUCT_ID,
        cat: CATEGORY_ID,
        message: document.querySelector("#prodMsg").value,
        heart: HEART,
        eggless: EGGLESS,
        pricing: WEIGHT_PRICE,
        qty: PROD_QTY,
        cartId: cartId,
        flavour:  f,
      });
    } else {
      docData.cart = [];
      docData.cart.push({
        prodId: PRODUCT_ID,
        cat: CATEGORY_ID,
        message: document.querySelector("#prodMsg").value,
        heart: HEART,
        eggless: EGGLESS,
        pricing: WEIGHT_PRICE,
        qty: PROD_QTY,
        cartId: cartId,
        flavour: f,
      });
    }
    await userRef.update(docData);
    document.getElementById("success").style.display = "block";
    setTimeout(function () {
      document.getElementById("success").style.display = "none";
    }, 2000);
    console.log("updated");
  });
  console.log("done");
};

addToCartBtnHTML.addEventListener("click", addToCart);

const displaySuggestions = async() => {
  const trendingItemsHTML = document.querySelector('.trending-item-slider');
  // console.log(CATEGORY_ID);
  let allProds = [];
  let r =  db.collection(CATEGORY_ID);
  r.get().then(async(prodSnaps) => {
    let prodSnapsDocs = prodSnaps.docs;
    let snapSize = prodSnapsDocs.length;
    // console.log(prodSnapsDocs.length);
    let rand = Math.floor(Math.random() * (snapSize - 8 + 0 + 1));
    // console.log(rand);
    prodSnapsDocs.map(p => {
      allProds.push(p.id);
    })

    let card = '';
    for(let counter = 0; counter < 8; counter++) {
      await db.collection(CATEGORY_ID).doc(allProds[counter + rand]).get().then(pdataRaw => {
        let pdata = pdataRaw.data();
        // console.log(pdata.mainImgUrl);
        card += `
        <a href="./product.html?prod=${allProds[counter + rand]}&&cat=${CATEGORY_ID}" class="item">
          <div class="item-img">
            <div class="extra-list">
              <ul>
                <li>
                  <span rel-toggle="tooltip" title="Add To Wishlist" data-toggle="modal" id="wish-btn"
                    data-target="#comment-log-reg" data-placement="right">
                    <i class="icofont-heart-alt"></i>
                  </span>
                </li>
              </ul>
            </div>
            <img class="img-fluid" style="width: 500px !important; height:200px " src="${pdata.mainImgUrl}" alt="LAKE OF CAKES">
          </div>
          <div class="info">
            <div class="stars">
              <div class="ratings">
                <div class="empty-stars"></div>
                <div class="full-stars" style="width:0%"></div>
              </div>
            </div>
            <h5 style="font-size: 1em;color: black;">${pdata.name}</h5>
            <h4 style="text-align: center;font-size: 1em;font-weight: 600;">₹ ${pdata.sp} <del><small>₹ ${pdata.mrp}</small></del></h4>
          </div>
        </a>
        `; 
      })
    }
    trendingItemsHTML.innerHTML = card;
    var $trending_slider = $('.trending-item-slider');
    $trending_slider.owlCarousel({
      items: 4,
      autoplay: true,
      margin: 10,
      loop: true,
      dots: true,
      nav: true,
      center: false,
      autoplayHoverPause: true,
      navText: ["<i class='fa fa-angle-left'></i>", "<i class='fa fa-angle-right'></i>"],
      smartSpeed: 600,
      responsive: {
        0: {
          items: 2,
        },
        414: {
          items: 2,
        },
        768: {
          items: 3,
        },
        992: {
          items: 5
        },
        1200: {
          items: 6
        }
      }
    });

  })
}