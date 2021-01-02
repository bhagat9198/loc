const db = firebase.firestore();
const storageService = firebase.storage;

let USER_ID, USER_DETAILS, USER_REF;

const checkAuth = async () => {
  if (localStorage.getItem("locLoggedInUser") == "null") {
    window.location.href = "./../Auth/login.html";
  }
  // console.log('aaaa');
  USER_ID = localStorage.getItem("locLoggedInUser");
  // console.log(USER_ID);
  USER_REF = await db.collection("Customers").doc(USER_ID);
  // console.log(USER_REF);
  await USER_REF.get().then((doc) => {
    let docData = doc.data();
    USER_DETAILS = docData;
  });
  return;
};

checkAuth().then(() => {
  displayCart();
});

const cartBodyHTML = document.querySelector("#cartBody");
let allProdPrice = [];
const PROD_DATA = [];

const displayCart = async () => {
  let item = "";
  // console.log(USER_DETAILS);
  let index = -1;
  var count=0;

  var type="odd"
  
  if(USER_DETAILS.cart==undefined || USER_DETAILS.cart.length==0){
  
    cartBodyHTML.innerHTML=`<h5 style="text-align: center;font-size: 14px ; font-weight: 700px; padding: 20px;">Your bag is empty ! <a href="../index.html">Click here to add products now</h5>`
  }
  if(USER_DETAILS.cart.length>0){

  
  for (let prod of USER_DETAILS.cart) {
    
    count++;
    // console.log(prod);
    if(count%2!=0){
      type="odd"
    }else{
      type="even"
    }
    let product;
    let prodPrice = 0;
    let cakeWeight = "";

    await db
      .collection(prod.cat)
      .doc(prod.prodId)
      .get()
      .then((prodDoc) => {
        // console.log(prodDoc);
        let prodData = prodDoc.data();
        // console.log(prodData);
        if (prodData) {
          index++;
          // console.log(prodData);
          product = prodData;

        }
      });
    if (product) {
      // console.log(prod);
      if (prod.pricing.weight) {
        for (let cw of product.weights) {

          if (cw.cakeWeight === "half") {
            if (cw.cakeWeight === prod.pricing.weight) {
              cakeWeight = 0.5;
              prodPrice = +cw.weightPrice;
              break;
            }
          } else if (cw.cakeWeight === "one") {
            if (cw.cakeWeight === prod.pricing.weight) {
              cakeWeight = 1;
              prodPrice = +cw.weightPrice;
              break;
            }
          } else if (cw.cakeWeight === "oneHalf") {
            if (cw.cakeWeight === prod.pricing.weight) {
              cakeWeight = 1.5;
              prodPrice = +cw.weightPrice;
              break;
            }
          } else if (cw.cakeWeight === "two") {
            if (cw.cakeWeight === prod.pricing.weight) {
              cakeWeight = 2;
              prodPrice = +cw.weightPrice;
              break;
            }
          } else if (cw.cakeWeight === "three") {
            if (cw.cakeWeight === prod.pricing.weight) {
              cakeWeight = 3;
              prodPrice = +cw.weightPrice;
              break;
            }
          } else if (cw.cakeWeight === "four") {
            if (cw.cakeWeight === prod.pricing.weight) {
              cakeWeight = 4;
              prodPrice = +cw.weightPrice;
              break;
            }
          } else if (cw.cakeWeight === "five") {
            if (cw.cakeWeight === prod.pricing.weight) {
              cakeWeight = 5;
              prodPrice = +cw.weightPrice;
              break;
            }
          } else if (cw.cakeWeight === "six") {
            if (cw.cakeWeight === prod.pricing.weight) {
              cakeWeight = 6;
              prodPrice = +cw.weightPrice;
              break;
            }
          } else {
            // console.log("invalid");
          }
        }
      } else {
        prodPrice = prodPrice + +product.sp;
      }

      let cakeDetails = `
    <b>Weight : </b> ${cakeWeight} Kg<br>
    <b>Shape :</b> ${prod.heart ? "Heart" : "Round"}<br>
    <b>Eggless :</b> ${prod.eggless ? "Yes" : "No"}<br>
    <b>Flavour :</b>${prod.flavour}<br>`;

      const personalizedGiftDetails = `
      <b>Personalized Gift : </b> Yes <br>
    `;

      if (prod.heart) {
        prodPrice += +product.shapes[0].shapePrice;
      }

      if (prod.eggless) {
        prodPrice += +product.type.price;
      }

      let gst = +prodPrice * (+product.gst / 100);
      prodPrice = prodPrice + gst;
      prodPrice = +Math.round(prodPrice);
      let priceWithQty = prodPrice * prod.qty;
      allProdPrice.push({
        price: prodPrice ,
        name: product.name,
        qty: prod.qty,
        cartId: prod.cartId,
        
      });
      console.log(allProdPrice);
      // console.log(prod.cartId);
      let rand = new Date().valueOf();

      item += `
    
      <li class="items `+type+`" id="row__${rand}">

      <div class="infoWrap">
        <div class="cartSection">
          <img src="${product.mainImgUrl}" alt="" class="itemImg" style="height:190px;width:160px;object-fit:cover";border-radius:5px !important />
          <p class="itemNumber">${product.sno}</p>
          <a href="../Product/product.html?prod=${
            prod.prodId
          }&&cat=${prod.cat}"><h5 class="resTxtMob" style="font-size:13px;width:290px">${product.name}</h5></a>
 
          <span id="eachprice__${rand}">₹${prodPrice}</span>
          <br>
          <small>
          ${prod.pricing.weight ? cakeDetails : ""}
${prod.personalizedGift ? personalizedGiftDetails : ''}
          </small>
   
        </div>
        <div style="width:100%;paadding:20px">
        <div class=" cartSection">
      
          <div class="qty">
            <ul style="display:flex">
              <li style="padding:10px">
              <span class="qtminus1 reducing" data-cartid="${
                prod.cartId
              }" data-index="${index}" data-id="minus__${rand}" onclick="decQty(event)">
                <i class="fa fa-minus" data-cartid="${
                  prod.cartId
                }" data-index="${index}" data-id="minus__${rand}"></i>
              </span>
              </li>
              <li style="padding:10px">
              <span class="qttotal1" id="total__${rand}" >${
                allProdPrice[index].qty
                }</span>
              </li>
              <li style="padding:10px">
              <span class="qtplus1 adding" data-cartid="${
                prod.cartId
              }" data-index="${index}" data-id="plus__${rand}" onclick="incQty(event)">
                <i class="fa fa-plus" data-cartid="${
                  prod.cartId
                }" data-index="${index}" data-id="plus__${rand}"></i>
              </span>
              </li>
            </ul>
          </div>
        </div>
        
            
        <div class="cartSection">
        <h5 style="font-size:13px;font-weight:800" class="cartSection " data-index="${index}" id="subprice_${rand}">${priceWithQty}</h5>
        </div>
      
        <div class="cartSection" >
        <span class="qtplus1 adding cartSection" style="cursor:pointer" style="padding:10px" data-id="${rand}" data-index="${index}" data-cartid="${
          prod.cartId
        }" onclick="deleteCartProd(event)">
              <i class="fa fa-trash" data-cartid="${
               prod.cartId
             }" data-index="${index}" data-id="${rand}"></i></span>
            </span>
       </div>
       <div class="cartSection" style="margin-top:3% ">
        <input class="styled-checkbox" type="checkbox" id="select${index}" name="selectProd" onchange="selectProds(event, this)" data-index="${index}"   style=" display:none;width:20px;height:20px;">
        <label for="select${index}" ></label>
        </div>
        </div>
      </div>
      </div>
    </li>
      `;
    }else{
     
    }
  }
 
  cartBodyHTML.innerHTML = item;
}
};

const deleteCartProd = (e) => {
  const cartId = e.target.dataset.cartid;
  let counter = e.target.dataset.index;
  let id = e.target.dataset.id;
  if (+counter === 0 || +counter < USER_DETAILS.cart.length) {
    let tempCart = USER_DETAILS.cart;
    tempCart.splice(counter, 1);
    USER_REF.update("cart", tempCart);
  }
  document.querySelector(`#row__${id}`).remove();
  updateSelectedProds(cartId, 0, "del");
};

const SELECTED_PRODS = [];

const selectProds = (e, current) => {
  let counter = e.target.dataset.index;
  if (e.target.checked) {
    SELECTED_PRODS.push({ ...allProdPrice[counter] });
  } else {
    SELECTED_PRODS.splice(counter, 1);
  }
  // console.log(SELECTED_PRODS.length);
  // console.log(SELECTED_PRODS);
  displayCheckout();
};

const updateSelectedProds = (id, qty, del = "data") => {
  let c = -1;
  for (let sp of SELECTED_PRODS) {
    // console.log(sp.cartId, id)
    c++;
    if (+sp.cartId === +id) {
      if (del == "del") {
        // console.log(sp.cartId, id);
        SELECTED_PRODS.splice(c, 1);
        // console.log(SELECTED_PRODS);
      } else {
        SELECTED_PRODS[c].qty = qty;
      }
      // console.log(sp.cartId, id);
    }
  }
  // console.log(SELECTED_PRODS);
  displayCheckout();
};

const calculateSubPrice = (id) => {
  const subPriceHTML = document.querySelector(`#subprice_${id}`);
  let counter = subPriceHTML.dataset.index;
  // console.log(counter);
  let cost = allProdPrice[counter].price;
  let qty = document.querySelector(`#total__${id}`).innerHTML;
  let totalCost = +cost * +qty;
  subPriceHTML.innerHTML = totalCost;
};

const decQty = (e) => {
  // console.log(e.target.dataset.id);
  let id = e.target.dataset.id.split("__")[1];
  let qty = document.querySelector(`#total__${id}`).innerHTML;
  const cartId = e.target.dataset.cartid;
  let counter = e.target.dataset.index;
  qty = +qty;
  if (qty > 1) {
    qty--;
    allProdPrice[counter].qty = qty;
    document.querySelector(`#total__${id}`).innerHTML = qty;
    calculateSubPrice(id);
    updateSelectedProds(cartId, qty);
  }
};


const incQty = (e) => {
  // console.log(e.target.dataset.id);
  const cartId = e.target.dataset.cartid;
  let id = e.target.dataset.id.split("__")[1];
  let qty = document.querySelector(`#total__${id}`).innerHTML;
  let counter = e.target.dataset.index;
  qty = +qty;
  qty++;
  allProdPrice[counter].qty = qty;
  document.querySelector(`#total__${id}`).innerHTML = qty;
  calculateSubPrice(id);
  updateSelectedProds(cartId, qty);
};

const orderListHTML = document.querySelector(".order-list");
const cartTotalHTML = document.querySelector(".cart-total");
const emptyCheckoutHTML = document.querySelector("#empty-checkout");
const orderBoxHTML = document.querySelector(".order-box");
let TOTAL = 0;

const displayCheckout = () => {
  if (SELECTED_PRODS.length > 0) {
    emptyCheckoutHTML.style.display = "none";
    checkoutBtnHTML.disabled = false;
    // orderBoxHTML.style.display = 'block';
    let li = "";
    TOTAL = 0;
    SELECTED_PRODS.map((p) => {
      let pPrice = +p.qty * +p.price;
      TOTAL = TOTAL + pPrice;
      li += `
      <li>
        <p>
          ${p.name}
        </p>
        <P>
          <b class="cart-total ctt">₹${pPrice}</b>
        </P>
      </li>
      `;
    });
    orderListHTML.innerHTML = `${li}`;
    cartTotalHTML.innerHTML = `₹ ${TOTAL}`;
  } else {
    orderListHTML.innerHTML = ``;
    cartTotalHTML.innerHTML = `₹ 0`;
    emptyCheckoutHTML.style.display = "block";
    // orderBoxHTML.style.display = 'none';
    checkoutBtnHTML.disabled = true;
  }
};

const checkoutBtnHTML = document.querySelector("#checkoutBtn");
const allAddonsHTML = document.querySelector("#allAddons");
const costWithAddonsHTML = document.querySelector("#cost-with-addons");

let ADDONS_REF;
let ADDONS_DETAILS = [];

const addonModal = (e) => {
  ADDONS_REF = db.collection("addons");
  ADDONS_REF.get().then((snapshots) => {
    let snapshotDocs = snapshots.docs;
    let card = "";
    snapshotDocs.map((doc, index) => {
      // card += displayAddon(doc);
      let docData = doc.data();
      ADDONS_DETAILS.push({
        qty: 1,
        price: +docData.price,
        checked: false,
        id: doc.id,
      });
      card += `
    <div class="col-md-3 col-6 mt-3">
      <a class="item"
        style="width: 100%; ; padding: 0px; border-radius:1px; background: #fff;border:1px solid black !important;">
        <input type="checkbox"  id="addons-checkbox${index}" name="add_addons" class="add_addons addons-checkbox" value="${index}" onchange="buyAddon(event, this)"
          style="display:block; position: absolute !important; top: 3px !important; z-index: 4 !important;display:none">
          <label for="addons-checkbox${index}">Select</label>
        <div class="item-img"style="max-height:170px ;">
          <img class="img-fluid"
            src="${docData.imgUrl}"
            alt="lake of cakes" style="width:100%;object-fit: contain;">
        </div>
        <div class="info" style="height: 120px; ">
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
                  <span  class="qtminus" data-id="addon__minus__${doc.id}" data-index="${index}" onclick="decAddon(event)">
                    <i class="fa fa-minus" data-id="addon__minus__${doc.id}" data-index="${index}"></i>
                  </span>
                </li>
                <li>
                  <span class="qttotal" id="addon__qty__${doc.id}" data-index="${index}">${ADDONS_DETAILS[index].qty}</span>
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
  });
  costWithAddonsHTML.innerHTML = TOTAL;
};

checkoutBtnHTML.addEventListener("click", addonModal);

const calAddonPrice = () => {
  let totalAddonPrice = 0;
  ADDONS_DETAILS.map((el) => {
    if (el.checked) {
      totalAddonPrice += el.price * el.qty;
    }
  });
  costWithAddonsHTML.innerHTML = +totalAddonPrice + +TOTAL;
};

const buyAddon = (e, current) => {
  // console.log('buyAddon');
  let index = e.target.value;
  ADDONS_DETAILS[index].checked = current.checked;
  let tAddons = 0;
  document.querySelectorAll(".addons-checkbox").forEach((el) => {
    if (el.checked) {
      // tAddons++;
      tAddons++;
    }
  });
  if (tAddons > 0) {
    // console.log('tAddons');
    document.querySelector(
      "#prod_with_addons"
    ).innerHTML = `Checkout With ${tAddons} Addons`;
  } else {
    // console.log('else');
    document.querySelector(
      "#prod_with_addons"
    ).innerHTML = `Checkout Without Addons`;
  }
  calAddonPrice();
};

const addAddon = (e) => {
  let id = e.target.dataset.id.split("__")[2];
  let index = e.target.dataset.index;
  ADDONS_DETAILS[index].qty++;
  document.querySelector(`#addon__qty__${id}`).innerHTML =
    ADDONS_DETAILS[index].qty;
  calAddonPrice();
};

const decAddon = (e) => {
  let id = e.target.dataset.id.split("__")[2];
  let index = e.target.dataset.index;
  if (ADDONS_DETAILS[index].qty > 1) {
    ADDONS_DETAILS[index].qty--;
  }
  document.querySelector(`#addon__qty__${id}`).innerHTML =
    ADDONS_DETAILS[index].qty;
  calAddonPrice();
};

const prodWithAddonsHTML = document.querySelector("#prod_with_addons");

const checkoutProds = async (e) => {
  console.log(SELECTED_PRODS);
  let addonsSelected = [];
  ADDONS_DETAILS.map((el) => {
    if (el.checked) {
      addonsSelected.push(el);
    }
  });

  let checkoutCart;
  let orderId = `${Math.random()}`;
  if (SELECTED_PRODS.length > 0) {
    checkoutCart = {
      orderId: orderId,
      status: "cancelled",
      type: "cart",
      totalCost: costWithAddonsHTML.innerHTML,
      addons: addonsSelected,
      products: [],
    };
  }

  SELECTED_PRODS.map((sp) => {
    let counter = -1;

    for (let c of USER_DETAILS.cart) {
      counter++;
      if (c.cartId === sp.cartId) {
        console.log(c);
        let cake;
        let pdata = {
          prodId: c.prodId,
          cat: c.cat,
          message: c.message,
          qty: sp.qty,
        };
        if (c.pricing.weight) {
          cake = {};
          cake.heart = c.heart;
          cake.eggless = c.eggless;
          cake.weight = c.pricing.weight;
          cake.flavour = c.flavour;
          pdata.cake = cake;
        }
        if (c.personalizedGift) {
          // personalizedGiftDetails = c.personalizedGiftDetails;
          pdata.personalized = true;
          pdata.personalizedGiftDetails = c.personalizedGiftDetails;
        } else {
          pdata.personalized = false;
        }
        checkoutCart.products.push(pdata);
      }
    }
  });

  if (USER_DETAILS.orders) {
    USER_DETAILS.orders.push(checkoutCart);
  } else {
    USER_DETAILS.orders = [];
    USER_DETAILS.orders.push(checkoutCart);
  }
  await USER_REF.update(USER_DETAILS);
  // console.log(USER_DETAILS);
  window.location.href = `./../Payment/checkout.html?checkout=${orderId}`;
};

prodWithAddonsHTML.addEventListener("click", checkoutProds);