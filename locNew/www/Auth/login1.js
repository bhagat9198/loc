// console.log("login.js");

const db = firebase.firestore();
const storageService = firebase.storage();



//////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////





// console.log("navbar1.js");

const wholeNavigationPcHTML = document.querySelector("#whole-navigation-pc");

const extractChildCat = (data, subId, docId) => {
  let childLi = "";
  data.childCategories.map((doc) => {
    // let docData = doc.data();
    childLi += `
      <li><a href="../Products/products.html?cat=${docId}&&sub=${subId}&&child=${doc.id}">${doc.name}</a></li>
    `;
  });
  // console.log(childLi);
  return childLi;
};

const extractSubCat = (data, docId) => {
  let subLi = "";
  data.subCategory.map((doc) => {
    // let docData = doc.data();
    let childCat = extractChildCat(doc, doc.id, docId);

    subLi += `
    <li >
      <a style="top:0;padding:5px !important;position:sticky;z-index:999 !important;background:white !important" href="../Products/products.html?cat=${docId}&&sub=${doc.id}">${doc.name}</a>
      <ul style="z-index:0 !important" > ${childCat}</ul>
    </li>
    `;
  });
  return subLi;
};

db.collection("categories").onSnapshot(async (snapshots) => {
  let snapshotDocs = snapshots.docs;
  let li = "";
  let liMob = "";
  let tempArr = [];
  for (let doc of snapshotDocs) {
    let docData = doc.data();
    // console.log(docData);
    tempArr.push({ d: docData, dId: doc.id });
  }

  tempArr.sort(function (a, b) {
    return +b.d.priority - +a.d.priority;
  });

  for (let data of tempArr) {
    // console.log(data);
    let subCat = extractSubCat(data.d, data.dId);
    li += `
      <li >
        <a href="../Products/products.html?cat=${data.dId}">${data.d.name}</a>
        <ul>
          ${subCat}
          <li>
            <ul>
              <li><img class="navimage" src="${data.d.imgUrl}"></li>
            </ul>
          </li>
        </ul>
      </li>
      `;
    liMob += `
      <li >
        <a href="#!" ><span onclick="navigateTo('./Products/products.html?cat=${data.dId}')">${data.d.name}</span><i class="fa fa-chevron-down" style="margin-left: 10%;float: right;"></i></a>
        <ul>
          ${subCat}
          <li>
            <ul>
              <li><img class="navimage" src="${data.d.imgUrl}"></li>
            </ul>
          </li>
        </ul>
      </li>`;
  }
  const wholeNavigationPcHTML = document.querySelector("#whole-navigation-pc");
  wholeNavigationPcHTML.innerHTML = li;
  const wholeNavigationMobile = document.querySelector(
    "#whole-navigation-mobile"
  );
  wholeNavigationMobile.innerHTML = liMob;
  $(".menu > ul > li").hover(function (e) {
    if ($(window).width() > 943) {
      $(this).children("ul").stop(true, false).fadeToggle(150);
      e.preventDefault();
    }
  });
  $(".menu > ul > li").click(function () {
    if ($(window).width() <= 943) {
      $(this).children("ul").fadeToggle(150);
    }
  });
  $(".menu-mobile").click(function (e) {
    $(".menu > ul").toggleClass("show-on-mobile");
    e.preventDefault();
  });

  $(window).resize(function () {
    $(".menu > ul > li").children("ul").hide();
    $(".menu > ul").removeClass("show-on-mobile");
  });
});
function navigateTo(location) {
  window.location = location;
}



// When the button is clicked, run our ScrolltoTop function above!
// scrollToTopButton.onclick = function(e) {
//   e.preventDefault();
//   scrollToTop();
// }
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// WITH DROP DOWN

// let allSearchList;
// let searchResults = [];
// db.collection('miscellaneous').doc('searchList').get().then(doc => {
//   let docData = doc.data();
//   allSearchList = docData.Details;

//   for (let i of allSearchList) {

//     searchResults.push(i.Name);

//   }

//   autocomplete(document.getElementById("searchBar"), searchResults);

// })

// const searchProd = (e, current) => {
//   if (e.keyCode === 13) {

//     window.location.href = `/Products/products.html?user=${current}`;
//   } else {

//     window.location.href = `/Products/products.html?user=${current}`;
//   }
// }

// function searchIfvalue(e) {

//   if (e.key == "Enter") {
//     window.location.href = `/Products/products.html?user=${e.target.value}`;
//   }
// }
// function searchByBtn(id) {

//   let val = document.querySelector("#" + id).value;

//   window.location.href = `/Products/products.html?user=${val}`;
//   // if(e.key=="Enter"){
//   //   window.location.href = `/Products/products.html?user=${e.target.value}`;
//   // }
// }
// function autocomplete(inp, arr) {

//   /*the autocomplete function takes two arguments,
//   the text field element and an array of possible autocompleted values:*/
//   var currentFocus;
//   /*execute a function when someone writes in the text field:*/
//   inp.addEventListener("input", function (e) {
//     var a, b, i, val = this.value;
//     /*close any already open lists of autocompleted values*/
//     closeAllLists();
//     if (!val) { return false; }
//     currentFocus = -1;
//     /*create a DIV element that will contain the items (values):*/
//     a = document.createElement("DIV");
//     a.setAttribute("id", this.id + "autocomplete-list");
//     a.setAttribute("class", "autocomplete-items");
//     /*append the DIV element as a child of the autocomplete container:*/
//     this.parentNode.appendChild(a);
//     let count = 0;
//     /*for each item in the array...*/
//     for (i = 0; i < arr.length; i++) {
//       /*check if the item starts with the same letters as the text field value:*/
//       if (arr[i].toUpperCase().includes(val.toUpperCase()) || arr[i].toUpperCase().startsWith(val.toUpperCase()) || arr[i].endsWith(val.toUpperCase())) {
//         count++;
//         if (count >= 8) {
//           break;
//         }
//         /*create a DIV element for each matching element:*/
//         b = document.createElement("DIV");
//         /*make the matching letters bold:*/
//         b.innerHTML = "<strong>" + arr[i].substr(0, val.length) + "</strong>";
//         b.innerHTML += arr[i].substr(val.length);
//         b.innerHTML += "&nbsp;&nbsp;<i class='fa fa-search'></i>"
//         /*insert a input field that will hold the current array item's value:*/
//         b.innerHTML += "<input type='hidden' value='" + arr[i] + "'>";
//         /*execute a function when someone clicks on the item value (DIV element):*/
//         b.addEventListener("click", function (e) {
//           /*insert the value for the autocomplete text field:*/
//           inp.value = this.getElementsByTagName("input")[0].value;
//           /*close the list of autocompleted values,
//           (or any other open lists of autocompleted values:*/
//           searchProd(inp, inp.value)
//           closeAllLists();

//         });
//         a.appendChild(b);

//       }
//     }
//   });

//   /*execute a function presses a key on the keyboard:*/
//   inp.addEventListener("keydown", function (e) {
//     var x = document.getElementById(this.id + "autocomplete-list");
//     if (x) x = x.getElementsByTagName("div");
//     if (e.keyCode == 40) {
//       /*If the arrow DOWN key is pressed,
//       increase the currentFocus variable:*/
//       currentFocus++;
//       /*and and make the current item more visible:*/
//       addActive(x);
//     } else if (e.keyCode == 38) { //up
//       /*If the arrow UP key is pressed,
//       decrease the currentFocus variable:*/
//       currentFocus--;
//       /*and and make the current item more visible:*/
//       addActive(x);
//     } else if (e.keyCode == 13) {
//       /*If the ENTER key is pressed, prevent the form from being submitted,*/
//       e.preventDefault();
//       if (currentFocus > -1) {
//         /*and simulate a click on the "active" item:*/
//         if (x) x[currentFocus].click();
//       }
//     }
//   });
//   function addActive(x) {
//     /*a function to classify an item as "active":*/
//     if (!x) return false;
//     /*start by removing the "active" class on all items:*/
//     removeActive(x);
//     if (currentFocus >= x.length) currentFocus = 0;
//     if (currentFocus < 0) currentFocus = (x.length - 1);
//     /*add class "autocomplete-active":*/
//     x[currentFocus].classList.add("autocomplete-active");
//   }
//   function removeActive(x) {
//     /*a function to remove the "active" class from all autocomplete items:*/
//     for (var i = 0; i < x.length; i++) {
//       x[i].classList.remove("autocomplete-active");
//     }
//   }
//   function closeAllLists(elmnt) {
//     /*close all autocomplete lists in the document,
//     except the one passed as an argument:*/
//     var x = document.getElementsByClassName("autocomplete-items");
//     for (var i = 0; i < x.length; i++) {
//       if (elmnt != x[i] && elmnt != inp) {
//         x[i].parentNode.removeChild(x[i]);
//       }
//     }
//   }
//   /*execute a function when someone clicks in the document:*/
//   document.addEventListener("click", function (e) {
//     closeAllLists(e.target);
//   });
// }

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// const preventReload = (e) => {
//   if(e.keyCode === 'Enter') {
//     e.preventDefault();
//   }
//   console.log(e.key);
// }

{
  /* <div class="extra-list">
  <ul>
    <li>
      <span rel-toggle="tooltip" title="LAKE OF CAKES" style="cursor: pointer;"  onclick="easyAddToCart(event)">
        <i class="fa fa-shopping-cart"></i>
      </span>
    </li>
  </ul>
</div> */
}

//////////////////////////////////////////////////////////////////////////////////////////////////

const easyAddToCart = () => {
  // console.log('addToCart');
};

let cartModalHTML = document.querySelector("#cart-modal");
let flag = 0;
let cartModalProds = "";
if (localStorage.getItem("locLoggedInUser")) {
  // let a = localStorage.getItem("locLoggedInUser")
  let uId = localStorage.getItem("locLoggedInUser");
  db.collection("Customers")
    .doc(uId)
    .onSnapshot(async (userDoc) => {
      if (userDoc.exists) {
        let userData = userDoc.data();
        // console.log(userData);
        if (userData.cart) {
          flag = 1;
          var cartSize = userData.cart.length;
          // console.log(cartSize);
          cartModalProds = `
          <a href="#cart" class="cart carticon">
            <div class="icon" onclick="redirectToCart()">
              <i onclick="redirectToCart()" class="fa fa-shopping-cart"></i>
              <span onclick="redirectToCart()" class="cart-quantity" id="cart-count">${cartSize}</span>
            </div>
          </a>
          <div class="my-dropdown-menu" id="cart-items" style="max-height:500px;overflow-y:scroll;width:350px">
          <h5 style="padding:10px;font-weight:700;font-size:13px;">${cartSize} Items In Your Bag</h5>
          `;
          for (cartProd of userData.cart) {
            // console.log(cartProd);
            await db
              .collection(cartProd.cat)
              .doc(cartProd.prodId)
              .get()
              .then((pDoc) => {
                let pData = pDoc.data();
                if (pData) {
                  cartModalProds += `
                <div class="dropdownmenu-wrapper">
                <ul class="dropdown-cart-products">
                  <li class="product cremove3461">
                    <figure class="product-image-container">
                      <a href="../UserDash/cart.html" class="product-image">
                        <img src="${pData.mainImgUrl}"
                          style="width: 70px; object-fit:cover;" alt="Lake of Cakes">
                      </a>
                    </figure>
                    <div class="product-details">
                      <div class="co">
                        <a href="#!">
                          <h4 class="product-title" style="text-align:left;padding:5px;font-size:14px !important;margin-left:10% !important;width:200px">${pData.name}</h4>
                        </a>
                        <span class="cart-product-info">
                          <span class="cart-product-qty" id="cqt3461"><span style="margin-left:11%;font-size:12px">Qty - </span>${cartProd.qty}</span>
                      </div>
                    </div>
                  </li>
                </ul>
                </div>


              
               
              
                `
                
                ;
                }
              });
          }
          cartModalProds += `
      <div onclick="redirectToCart()" class="dropdown-cart-action" style="padding:15px !important">
            <a  onclick="redirectToCart()" class="mybtn1" style=";margin-left:auto;margin-right:auto;cursor:pointer">View In Cart</a>
          </div>
        </div>
      </div>
      `;
        }
        cartModalHTML.innerHTML = cartModalProds;
      }
    });
}

if (flag === 0) {
  cartModalProds = `
  <a href="#cart" class="cart carticon">
    <div class="icon" onclick="redirectToCart()">
      <i onclick="redirectToCart()" class="fa fa-shopping-cart"></i>
      <span onclick="redirectToCart()" class="cart-quantity" id="cart-count">0</span>
    </div>
  </a>
  <div class="my-dropdown-menu" id="cart-items">
  `;

  cartModalHTML.innerHTML = cartModalProds;
}

// serachbar

const searchByUserInput = (e) => {
  e.preventDefault();

  let val = document.querySelector("#searchBar").value;
  // console.log(val);
  if (e.keyCode === 13) {
    // console.log('enter');
    window.location.href = `/Products/products.html?user=${val}`;
  }
};

const disableEnterKey = (e) => {
  console.log(e.keyCode);
  if (e.keyCode === 13) {
    e.preventDefault();
  }
};

const searchByUserInputBtn = (event) => {
  event.preventDefault();
  let val = document.querySelector("#searchBar").value;
  console.log(val);
  window.location.href = `/Products/products.html?user=${val}`;
};
var checkUser2 = window.localStorage.getItem("locLoggedInUser");

if (checkUser2 && checkUser2 != "null") {
  document.getElementById("logoutMobile").style.display = "block";
  document.getElementById("loginMobile").style.display = "none";
} else {
  document.getElementById("logoutMobile").style.display = "none";
  document.getElementById("loginMobile").style.display = "block";
}



// ////////////////////////////////////////////////////////////////////////////////////////////////////
// top alert bar

db.collection('miscellaneous').doc('siteStatus').onSnapshot(siteDoc => {
  let siteData = siteDoc.data();
  // console.log(siteData);
  if(!siteData.status) {
    document.querySelector('#top-alert').innerHTML = `
    <section class="top-header top-nav" style="background: red; display: flex; justify-content: center; text-align: center;">
    <b style="color: white"> ${siteData.note} <b>    
    </section>
    `;
  } else {
    document.querySelector('#top-alert').innerHTML = `
    <section class="top-header top-nav" style="background: #f1f1f1;">
        <div class="container-fluid remove-padding topnaves"
          style="background: #f1f1f1;;
      background-size: 617px; background-image: url();height: 28px !important;padding: 0px !important;margin-bottom: 0.3%;">
          <div class="container topcnt">
            <div class="row" style="justify-content: flex-end;">
              <div class="">
                <div class="content">
                  <div class="left-content">
                  </div>
                  <div class="right-content">
                    <div class="list" style="padding: 6px 10px 100px;">
                      <ul style="padding-right: 10px;">
                        <li>
                          <a type="button" data-toggle="modal" data-target="#topoffer" style=" position: relative;">
                            <span class="sign-in" data-toggle="modal" data-target="#modalYT"
                              style="font-size: 14px; color: rgb(10, 10, 10);">
                              <i style="color: red !important;" class="fa fa-gift" aria-hidden="true"></i> OFFER</span>
                          </a>
                        </li> &nbsp; |

                        <li><a href="../Common/coupans.html" class="track-btn"><span class="sign-in" style="font-size: 14px; color: #000;"><i
                                class="fa fa-gift" aria-hidden="true" style="color: red;"></i>
                              COUPONS</span> </a>
                        </li> &nbsp; |
                        <li><a href="tel:9598891097" class="track-btn"><span class="sign-in"
                              style="font-size: 14px; color: #000;"><i class="fa fa-phone" aria-hidden="true"
                                style="color: red;"></i>
                              9598891097</span> </a>
                        </li> &nbsp; |
                        <li><a href="mailto:lakeofcakess@gmail.com" class="track-btn"><span class="sign-in"
                              style="font-size: 14px; color: #000;"><i class="fa fa-envelope" aria-hidden="true"
                                style="color: red;"></i>
                              Email</span> </a>
                        </li> &nbsp;
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    `;
  }
})