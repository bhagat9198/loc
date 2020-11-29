console.log("navbar1.js");

  const wholeNavigationPcHTML = document.querySelector('#whole-navigation-pc');

  const extractChildCat = (data, subId, docId) => {
    let childLi = '';
    data.childCategories.map(doc => {
      // let docData = doc.data();
      childLi += `
      <li><a href="/Products/products.html?cat=${docId}&&sub=${subId}&&child=${doc.id}">${doc.name}</a></li>
    `;
    })
    // console.log(childLi);
    return childLi;
  }

  const extractSubCat = (data, docId) => {
    let subLi = '';
    data.subCategory.map((doc) => {
      // let docData = doc.data();
      let childCat = extractChildCat(doc, doc.id, docId);
      subLi += `
    <li>
      <a href="/Products/products.html?cat=${docId}&&sub=${doc.id}">${doc.name}</a>
      <ul> ${childCat}</ul>
    </li>
    `;
    })
    return subLi;
  }

  db.collection('categories').onSnapshot(async (snapshots) => {
    let snapshotDocs = snapshots.docs;
    let li = '';
    let liMob = '';
    let tempArr = [];
    for (let doc of snapshotDocs) {
      let docData = doc.data();
      // console.log(docData);
      tempArr.push({ d: docData, dId: doc.id});
    }

    tempArr.sort(function(a,b) {
      return (+b.d.priority) - (+a.d.priority) ;
    })

    for(let data of tempArr) {
      // console.log(data);
      let subCat = extractSubCat(data.d, data.dId);
      li += `
      <li >
        <a href="/Products/products.html?cat=${data.dId}">${data.d.name}</a>
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
        <a href="#">${data.d.name}<i class="fas fa-chevron-down" style="margin-left: 10%;float: right;"></i></a>
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
    const wholeNavigationPcHTML = document.querySelector('#whole-navigation-pc');
    wholeNavigationPcHTML.innerHTML = li;
    const wholeNavigationMobile = document.querySelector('#whole-navigation-mobile');
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
      $(".menu > ul").toggleClass('show-on-mobile');
      e.preventDefault();
    });
  
    $(window).resize(function () {
      $(".menu > ul > li").children("ul").hide();
      $(".menu > ul").removeClass('show-on-mobile');
    });
  });

  let allSearchList;
  let searchResults = [];
  db.collection('miscellaneous').doc('searchList').get().then(doc => {
    let docData = doc.data();
    allSearchList = docData.Detail
    s;

    for (let i of allSearchList) {

      searchResults.push(i.Name);

    }

    autocomplete(document.getElementById("searchBar"), searchResults);

  })


  const searchProd = (e, current) => {
    if (e.keyCode === 13) {

      window.location.href = `/Products/products.html?user=${current}`;
    } else {

      window.location.href = `/Products/products.html?user=${current}`;
    }
  }

  function searchIfvalue(e) {

    if (e.key == "Enter") {
      window.location.href = `/Products/products.html?user=${e.target.value}`;
    }
  }
  function searchByBtn(id) {

    let val = document.querySelector("#" + id).value;

    window.location.href = `/Products/products.html?user=${val}`;
    // if(e.key=="Enter"){
    //   window.location.href = `/Products/products.html?user=${e.target.value}`;
    // }
  }
  function autocomplete(inp, arr) {

    /*the autocomplete function takes two arguments,
    the text field element and an array of possible autocompleted values:*/
    var currentFocus;
    /*execute a function when someone writes in the text field:*/
    inp.addEventListener("input", function (e) {
      var a, b, i, val = this.value;
      /*close any already open lists of autocompleted values*/
      closeAllLists();
      if (!val) { return false; }
      currentFocus = -1;
      /*create a DIV element that will contain the items (values):*/
      a = document.createElement("DIV");
      a.setAttribute("id", this.id + "autocomplete-list");
      a.setAttribute("class", "autocomplete-items");
      /*append the DIV element as a child of the autocomplete container:*/
      this.parentNode.appendChild(a);
      let count = 0;
      /*for each item in the array...*/
      for (i = 0; i < arr.length; i++) {
        /*check if the item starts with the same letters as the text field value:*/
        if (arr[i].toUpperCase().includes(val.toUpperCase()) || arr[i].toUpperCase().startsWith(val.toUpperCase()) || arr[i].endsWith(val.toUpperCase())) {
          count++;
          if (count >= 8) {
            break;
          }
          /*create a DIV element for each matching element:*/
          b = document.createElement("DIV");
          /*make the matching letters bold:*/
          b.innerHTML = "<strong>" + arr[i].substr(0, val.length) + "</strong>";
          b.innerHTML += arr[i].substr(val.length);
          b.innerHTML += "&nbsp;&nbsp;<i class='fa fa-search'></i>"
          /*insert a input field that will hold the current array item's value:*/
          b.innerHTML += "<input type='hidden' value='" + arr[i] + "'>";
          /*execute a function when someone clicks on the item value (DIV element):*/
          b.addEventListener("click", function (e) {
            /*insert the value for the autocomplete text field:*/
            inp.value = this.getElementsByTagName("input")[0].value;
            /*close the list of autocompleted values,
            (or any other open lists of autocompleted values:*/
            searchProd(inp, inp.value)
            closeAllLists();

          });
          a.appendChild(b);


        }
      }
    });
    /*execute a function presses a key on the keyboard:*/
    inp.addEventListener("keydown", function (e) {
      var x = document.getElementById(this.id + "autocomplete-list");
      if (x) x = x.getElementsByTagName("div");
      if (e.keyCode == 40) {
        /*If the arrow DOWN key is pressed,
        increase the currentFocus variable:*/
        currentFocus++;
        /*and and make the current item more visible:*/
        addActive(x);
      } else if (e.keyCode == 38) { //up
        /*If the arrow UP key is pressed,
        decrease the currentFocus variable:*/
        currentFocus--;
        /*and and make the current item more visible:*/
        addActive(x);
      } else if (e.keyCode == 13) {
        /*If the ENTER key is pressed, prevent the form from being submitted,*/
        e.preventDefault();
        if (currentFocus > -1) {
          /*and simulate a click on the "active" item:*/
          if (x) x[currentFocus].click();
        }
      }
    });
    function addActive(x) {
      /*a function to classify an item as "active":*/
      if (!x) return false;
      /*start by removing the "active" class on all items:*/
      removeActive(x);
      if (currentFocus >= x.length) currentFocus = 0;
      if (currentFocus < 0) currentFocus = (x.length - 1);
      /*add class "autocomplete-active":*/
      x[currentFocus].classList.add("autocomplete-active");
    }
    function removeActive(x) {
      /*a function to remove the "active" class from all autocomplete items:*/
      for (var i = 0; i < x.length; i++) {
        x[i].classList.remove("autocomplete-active");
      }
    }
    function closeAllLists(elmnt) {
      /*close all autocomplete lists in the document,
      except the one passed as an argument:*/
      var x = document.getElementsByClassName("autocomplete-items");
      for (var i = 0; i < x.length; i++) {
        if (elmnt != x[i] && elmnt != inp) {
          x[i].parentNode.removeChild(x[i]);
        }
      }
    }
    /*execute a function when someone clicks in the document:*/
    document.addEventListener("click", function (e) {
      closeAllLists(e.target);
    });
  }

  
  // const preventReload = (e) => {
  //   if(e.keyCode === 'Enter') {
  //     e.preventDefault();
  //   }
  //   console.log(e.key);
  // }



{/* <div class="extra-list">
  <ul>
    <li>
      <span rel-toggle="tooltip" title="LAKE OF CAKES" style="cursor: pointer;"  onclick="easyAddToCart(event)">
        <i class="fa fa-shopping-cart"></i>
      </span>
    </li>
  </ul>
</div> */}

const easyAddToCart = () => {
  console.log('addToCart');
}


const starRating = (startArr) => {
  let starsSum = 0;
  startArr.map(starNum => {
    starsSum += +starNum;
  })
  let startsDiv = '';
  starsAvg = Math.round(starsSum/startArr.length);
  if(starsAvg = 0) {
    startsDiv = `
    <span class="fa fa-star"></span>
    <span class="fa fa-star"></span>
    <span class="fa fa-star"></span>
    <span class="fa fa-star"></span>
    <span class="fa fa-star"></span>
    `;
  } else if(starsAvg = 1) {
    startsDiv = `
    <span class="fa fa-star checked"></span>
    <span class="fa fa-star"></span>
    <span class="fa fa-star"></span>
    <span class="fa fa-star"></span>
    <span class="fa fa-star"></span>
    `;
  } else if(starsAvg = 2) {
    startsDiv = `
    <span class="fa fa-star checked"></span>
    <span class="fa fa-star checked"></span>
    <span class="fa fa-star"></span>
    <span class="fa fa-star"></span>
    <span class="fa fa-star"></span>
    `;
  } else if(starsAvg = 3) {
    startsDiv = `
    <span class="fa fa-star checked"></span>
    <span class="fa fa-star checked"></span>
    <span class="fa fa-star checked"></span>
    <span class="fa fa-star"></span>
    <span class="fa fa-star"></span>
    `;
  } else if(starsAvg = 4) {
    startsDiv = `
    <span class="fa fa-star checked"></span>
    <span class="fa fa-star checked"></span>
    <span class="fa fa-star checked"></span>
    <span class="fa fa-star checked"></span>
    <span class="fa fa-star"></span>
    `;
  } else if(starsAvg = 5) {
    startsDiv = `
    <span class="fa fa-star checked"></span>
    <span class="fa fa-star checked"></span>
    <span class="fa fa-star checked"></span>
    <span class="fa fa-star checked"></span>
    <span class="fa fa-star checked"></span>
    `;
  } else {
    startsDiv = '';
  }
  return startsDiv;
} 


let cartModalHTML = document.querySelector('#cart-modal')
let flag = 0;
let cartModalProds = '';
if(localStorage.getItem("locLoggedInUser")) {
  // let a = localStorage.getItem("locLoggedInUser")
  let uId = localStorage.getItem("locLoggedInUser");
  db.collection('Customers').doc(uId).onSnapshot(async(userDoc)  => {
    let userData = userDoc.data();
    if(userData.cart) {
      flag = 1;
      let cartSize = userData.cart.length;
      console.log(cartSize);
      cartModalProds = `
      <a href="#cart" class="cart carticon">
        <div class="icon" onclick="redirectToCart()">
          <i onclick="redirectToCart()" class="fa fa-shopping-cart"></i>
          <span onclick="redirectToCart()" class="cart-quantity" id="cart-count">${cartSize}</span>
        </div>
      </a>
      <div class="my-dropdown-menu" id="cart-items">
      `;
      for(cartProd of userData.cart) {
        console.log(cartProd);
        await db.collection(cartProd.cat).doc(cartProd.prodId).get().then(pDoc => {
          let pData = pDoc.data();
          cartModalProds += `
          <div class="dropdownmenu-wrapper">
          <ul class="dropdown-cart-products">
            <li class="product cremove3461">
              <figure class="product-image-container">
                <a href="/UserDash/cart.html" class="product-image">
                  <img src="${pData.mainImgUrl}"
                    style="width: 70px; object-fit:cover;margin:4%" alt="Lake of Cakes">
                </a>
              </figure>
              <div class="product-details">
                <div class="content">
                  <a href="javascript;">
                    <h4 class="product-title">${pData.name}</h4>
                  </a>
                  <span class="cart-product-info">
                    <span class="cart-product-qty" id="cqt3461">${cartProd.qty}</span>
                </div>
              </div>
            </li>
          </ul>
          </div>
          `;
        })
      }
      cartModalProds += `
      <div onclick="redirectToCart()" class="dropdown-cart-action">
            <a href="" onclick="redirectToCart()" class="mybtn1" style="background-color: rgb(20, 113, 167);margin-left:auto;margin-right:auto">View In Cart</a>
          </div>
        </div>
      </div>
      `;
    }
    cartModalHTML.innerHTML = cartModalProds;
  }) 
}

if(flag === 0) {
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
