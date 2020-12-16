// console.log("products1.js");

const db = firebase.firestore();
const storageService = firebase.storage();

const allProductsHTML = document.querySelector("#allProducts");
const productHeadingHTML = document.querySelector("#productHeading");
const topSuggestionHTML = document.querySelector("#top-suggestion");
let CAT, SUB, CHILD, TAG, USER;
let TEMP_ARR = [];


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

let allProductsArr = [];
let prodHeading;

getParams(window.location.href).then(async (response) => {
  CAT = response.cat;
  SUB = response.sub;
  CHILD = response.child;
  TAG = response.tag;
  USER = response.user;

  if (!USER) {
    await extractRelvantProds();
  } else {
    userSearchProds();
  }
  // console.log(allProductsArr);
  if (allProductsArr.length > 0) {
    let randAllProdsArr = arrayRandom(allProductsArr);
    TEMP_ARR = randAllProdsArr.slice();
    displayTopSuggest();

    displayProds(randAllProdsArr);
    // displayProds(allProductsArr);
  } else {
    allProductsHTML.innerHTML = "No products Found";
  }
  displayTopSuggest();
});

const extractRelvantProds = async () => {
  let dbRef;
  if (CAT) {
    // console.log(CAT);
    dbRef = db.collection(CAT);
    if (SUB) {
      // console.log(SUB);
      if (CHILD) {
        // console.log(CHILD);
        await dbRef.get().then((docs) => {
          let docDocs = docs.docs;
          docDocs.map((el) => {
            let elData = el.data();
            if (elData.wholeSubCategory.split("__")[1] === SUB) {
              if (elData.wholeChildCategory.split("__")[2] === CHILD) {
                allProductsArr.push({
                  prodId: el.id,
                  prodData: elData,
                  catId: CAT,
                });
              }
            }
          });
        });
        // console.log(allProductsArr);
        return;
      } else {
        allProductsArr = [];
        await dbRef.get().then((docs) => {
          let docDocs = docs.docs;
          docDocs.map((el) => {
            let elData = el.data();
            if (elData.wholeSubCategory.split("__")[1] === SUB) {
              allProductsArr.push({
                prodId: el.id,
                prodData: elData,
                catId: CAT,
              });
            }
          });
        });
        // console.log(allProductsArr);
        return;
      }
    } else {
      allProductsArr = [];
      await dbRef.get().then((cateogiers) => {
        let cateogiersDocs = cateogiers.docs;
        cateogiersDocs.map((el) => {
          let elDoc = el.data();
          if (TAG) {
            // console.log(elDoc);
            if (elDoc.tags.includes(TAG)) {
              // console.log(elDoc.tags);
              allProductsArr.push({
                prodId: elDoc.id,
                prodData: elDoc,
                catId: CAT,
              });
            }
          } else {
            allProductsArr.push({
              prodId: el.id,
              prodData: el.data(),
              catId: CAT,
            });
          }
        });
      });
      // console.log(CAT);
      await db
        .collection("categories")
        .doc(CAT)
        .get()
        .then((d) => {
          dd = d.data();
          // console.log(dd);
          // console.log(dd.name);
          prodHeading = dd.name;
        });
      productHeadingHTML.innerHTML = prodHeading;
    }
    return;
  } else {
    await allCatProds();
    productHeadingHTML.innerHTML = "All Products";
    // console.log(allProductsArr);
    return;
  }
};

let allCategories = [];

const extractAllCat = async () => {
  await db
    .collection("categories")
    .get()
    .then((snapshots) => {
      let snapDocs = snapshots.docs;
      snapDocs.map((snap) => {
        allCategories.push(snap.id);
      });
    });
};

const allCatProds = async () => {
  let locProds = JSON.parse(sessionStorage.getItem("locProds"));
  allProductsArr = locProds;
};

const arrayRandom = (arr) => {
  let ctr = arr.length;
  let temp;
  let index;

  while (ctr > 0) {
    index = Math.floor(Math.random() * ctr);
    ctr--;

    temp = arr[ctr];
    arr[ctr] = arr[index];
    arr[index] = temp;
  }
  return arr;
};

const starRating = (starsNum) => {
  // console.log(starsNum);
  let startsDiv = "";
  starsAvg = starsNum;
  if (starsAvg == 0) {
    startsDiv = `
    <span class="fa fa-star"></span>
    <span class="fa fa-star"></span>
    <span class="fa fa-star"></span>
    <span class="fa fa-star"></span>
    <span class="fa fa-star"></span>
    `;
  } else if (starsAvg == 1) {
    startsDiv = `
    <span class="fa fa-star checked"></span>
    <span class="fa fa-star"></span>
    <span class="fa fa-star"></span>
    <span class="fa fa-star"></span>
    <span class="fa fa-star"></span>
    `;
  } else if (starsAvg == 2) {
    startsDiv = `
    <span class="fa fa-star checked"></span>
    <span class="fa fa-star checked"></span>
    <span class="fa fa-star"></span>
    <span class="fa fa-star"></span>
    <span class="fa fa-star"></span>
    `;
  } else if (starsAvg == 3) {
    startsDiv = `
    <span class="fa fa-star checked"></span>
    <span class="fa fa-star checked"></span>
    <span class="fa fa-star checked"></span>
    <span class="fa fa-star"></span>
    <span class="fa fa-star"></span>
    `;
  } else if (starsAvg == 4) {
    startsDiv = `
    <span class="fa fa-star checked"></span>
    <span class="fa fa-star checked"></span>
    <span class="fa fa-star checked"></span>
    <span class="fa fa-star checked"></span>
    <span class="fa fa-star"></span>
    `;
  } else if (starsAvg == 5) {
    startsDiv = `
    <span class="fa fa-star checked"></span>
    <span class="fa fa-star checked"></span>
    <span class="fa fa-star checked"></span>
    <span class="fa fa-star checked"></span>
    <span class="fa fa-star checked"></span>
    `;
  } else {
    startsDiv = "";
  }
  return startsDiv;
};

const displayProds = async (arrProds) => {
  // console.log(arrProds);
  let card = "";
  let banner, bcolor;
  for (let p of arrProds) {
    // console.log(p);
    if (p.prodData.bannerType != undefined) {
      banner = p.prodData.bannerType;
      bcolor = p.prodData.bannerTypeColor;
    } else {
      banner = "";
    }
    

    let starsDiv = `
    <span class="fa fa-star"></span>
    <span class="fa fa-star"></span>
    <span class="fa fa-star"></span>
    <span class="fa fa-star"></span>
    <span class="fa fa-star"></span>
    `;
    // if (p.prodData.stars) {
    //   console.log(p.prodData.stars);
    starsDiv = starRating(p.prodData.stars);
    // } else {
    // }

    let previousPriceWithGst = (+p.prodData.mrp * (+p.prodData.gst/100))+ +p.prodData.mrp;
    previousPriceWithGst = Math.round(previousPriceWithGst);
    let dis = Math.round(
      100 - (+p.prodData.totalPrice / previousPriceWithGst) * 100
    );
    card +=
      `
			<div class="col-lg-3 col-md-3 col-6 pb-3 pt-2">
				<a href="../Product/product.html?prod=${p.prodId}&&cat=${p.catId}" class="item">
					<div class="item-img">
            <span class="w3-tag w3-display-topleft" style="border-radius:10px;
            background: linear-gradient(90deg, ${
              p.prodData.bannerTypeColorStart
                ? p.prodData.bannerTypeColorStart.toString()
                : ""
            }, ${
        p.prodData.bannerTypeColorEnd
          ? p.prodData.bannerTypeColorEnd.toString()
          : ""
      }, #ededed);
            animation-name: load;
            animation-duration: 1.5s;
            animation-iteration-count: infinite;
            animation-direction: forwards;
            animation-timing-function: linear;
            background-size: 200% 100%;
            " >` +
      banner +
      `</span>
						<img class="responsive-image" src="${p.prodData.mainImgUrl}" alt="Lake of cakes ${p.prodData.name}">
					</div>
          <div class="info" style="height: 130px !important;background-color:gay">
            <style>
            .checked {
              color: orange;
            }
            </style>
            <div class="stars">
              <div class="ratings">
                ${starsDiv}
              </div>
            </div>       
            <h4 class="price responsive-price ">₹ ${p.prodData.totalPrice} <del><small>₹ ${previousPriceWithGst}</small></del><small style="color:green;font-weight:700;padding:2px">(${dis} % OFF)</small></h4>
            <h5 class="name responsive-name">${p.prodData.name}</h5>
          </div>
        </a>
      </div>
			</div>`;
    // console.log(card);
  }
  // console.log(card);
  allProductsHTML.innerHTML = card;
};

const displayTopSuggest = async () => {
  let dbCatImgRef = db
    .collection("miscellaneous")
    .doc("catImgs")
    .collection("catImgs");
  let card = "";
  dbCatImgRef.get().then(async (catImgSnaps) => {
    let catImgSnapsDocs = await catImgSnaps.docs;
    let randTopSuggest = await arrayRandom(catImgSnapsDocs);
    let red = Math.round(Math.random() * (244));
    let yellow = Math.round(Math.random() * (244));
    let blue = Math.round(Math.random() * (244));
    document.querySelector('#outer-top-suggestDiv').style.background = `rgb(${red}, ${yellow}, ${blue})`;
    document.querySelector('#inner-top-suggestDiv').style.background = `rgba(${red-50}, ${yellow-50}, ${blue-50}, 0.4)`;
    let c = 0;
    for (let cimg of randTopSuggest) {
      if (cimg.id !== CAT) {
        c++;
        if(c > 6) {
          break;
        }
        let cimgData = cimg.data();
        // console.log(cimgData);
        let rand =
          Math.floor(Math.random() * (cimgData.imgs.length - 1 - 0 + 1)) - 0;
        // console.log(rand);
        // console.log(cimgData.imgs);
        await db
          .collection("categories")
          .doc(cimg.id)
          .get()
          .then((catDetail) => {
            let catDetailData = catDetail.data();
            // console.log(catDetailData);
            card += `
        <div class="col-lg-2 ">
        <a href="./products.html?cat=${cimg.id}" class="item" style="border:none !important;box-shadow:none !important;width:150px;height:200px;object-fit:cover ">
          <div class="" >
            <img class="" style="width:150px;height:150px;object-fit:cover" src="${cimgData.imgs[rand].url}" alt="Lake of cakes ">
          </div>
          <div>
            <div class="info" style="height: 20px !important;border-radius:50px;width:100%; margin-left:auto;margin-right:auto;display:block;"> 
            <h5 class="name responsive-name" >${catDetailData.name}</h5>
          </div>
        </div>
        </a>
      </div>`;
          });
        topSuggestionHTML.innerHTML = card;
      }
      // console.log(card);
      // topSuggestionHTML.innerHTML = card;
    }
  });
};

const userSearchProds = async () => {
  let searchVal = USER.toUpperCase();
  allProductsArr = [];
  let locProds = JSON.parse(sessionStorage.getItem("locProds"));
  // console.log(locProds);
  // console.log(typeof locProds);
  locProds = arrayRandom(locProds);
  for (let p of locProds) {
    if (
      p.prodData.name.toUpperCase().includes(searchVal) ||
      p.prodData.cat.toUpperCase().includes(searchVal)
    ) {
      // let prod = {
      //   prodId: p.pid,
      //   prodData: {
      //     mainImgUrl: p.mainImgUrl,
      //     stars: p.stars,
      //     wholeCategory: `${p.catId}__${p.cat}`,
      //     totalPrice: p.totalPrice,
      //   },
      //   catId: p.catId,
      // };
      allProductsArr.push(p);
    }
  }

  if (allProductsArr.length === 0) {
    allCatProds();
  } else {
    productHeadingHTML.innerHTML = `Products for "${USER}"`;
  }
  // console.log(allProductsArr);
  return;
};

const sortProducts = (e, current) => {
  // console.log(e, current.value);
  if (current.value === "popular") {
    let temp = TEMP_ARR.slice();
    function compare(a, b) {
      a = +a.prodData.stars;
      b = +b.prodData.stars;
      return b - a;
    }

    temp.sort(compare);
    displayProds(temp);
  } else if (current.value === "low") {
    let temp = TEMP_ARR.slice();
    function compare(a, b) {
      a = a.prodData.totalPrice;
      b = b.prodData.totalPrice;
      return a - b;
    }

    temp.sort(compare);
    displayProds(temp);
  } else if (current.value === "high") {
    let temp = TEMP_ARR.slice();
    function compare(a, b) {
      a = a.prodData.totalPrice;
      b = b.prodData.totalPrice;
      return b - a;
    }
    temp.sort(compare);
    displayProds(temp);
  } else {
    // console.log('invalid');
  }
};

// ////////////////////////////////////////////////////////////////////////////////////



