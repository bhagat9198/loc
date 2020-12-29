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

  let locProds = JSON.parse(localStorage.getItem("locProds"));
  if (!locProds) {
    await settingLocalStorage();
  }

  if (!USER) {
    await extractRelvantProds();
    displayToHeading();
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

  await settingLocalStorage();
  
});

const displayToHeading = () => {
  let totalp = allProductsArr.length;
  console.log(totalp);

  let prodHeading;
  let locCats = JSON.parse(localStorage.getItem("locCats"));
  if (CAT) {
    for (let c of locCats) {
      if (c.id == CAT) {
        if (SUB) {
          for (let sc of c.data.subCategory) {
            if (sc.id == SUB) {
              if (CHILD) {
                for (let cc of sc.childCategories) {
                  if (cc.id == CHILD) {
                    prodHeading = cc.name;
                    productHeadingHTML.innerHTML = prodHeading;
                    return;
                  }
                }
              }
              prodHeading = sc.name;
              productHeadingHTML.innerHTML = prodHeading;
              return;
            }
          }
        }
        prodHeading = c.data.name;
        productHeadingHTML.innerHTML = `${prodHeading} - ${totalp}`;
        return;
      }
    }
  }
};

const extractRelvantProds = async () => {
  if (CAT) {
    if (SUB) {
      if (CHILD) {
        let locProds = JSON.parse(localStorage.getItem("locProds"));
        if (!locProds) {
          await settingLocalStorage();
        }
        locProds.map((p) => {
          if (CAT == p.catId) {
            if (CHILD == p.prodData.childcatId) {
              allProductsArr.push(p);
            }
          }
        });
      } else {
        allProductsArr = [];
        let locProds = JSON.parse(localStorage.getItem("locProds"));
        if (!locProds) {
          await settingLocalStorage();
        }
        locProds.map((p) => {
          if (CAT == p.catId) {
            if (SUB == p.prodData.subcatId) {
              allProductsArr.push(p);
            }
          }
        });
        // console.log(allProductsArr);
        return;
      }
    } else {
      allProductsArr = [];
      // await dbRef.get().then((cateogiers) => {
      //   let cateogiersDocs = cateogiers.docs;
      //   cateogiersDocs.map((el) => {
      //     let elDoc = el.data();
      //     if (TAG) {
      //       // console.log(elDoc);
      //       if (elDoc.tags.includes(TAG)) {
      //         // console.log(elDoc.tags);
      //         allProductsArr.push({
      //           prodId: elDoc.id,
      //           prodData: elDoc,
      //           catId: CAT,
      //         });
      //       }
      //     } else {
      //       allProductsArr.push({
      //         prodId: el.id,
      //         prodData: el.data(),
      //         catId: CAT,
      //       });
      //     }
      //   });
      // });
      let locProds = JSON.parse(localStorage.getItem("locProds"));
      if (!locProds) {
        await settingLocalStorage();
      }
      locProds.map((p) => {
        if (CAT == p.catId) {
          allProductsArr.push(p);
        }
      });
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
  let locProds = JSON.parse(localStorage.getItem("locProds"));
  if (!locProds) {
    await settingLocalStorage();
  }
  locProds.map((p) => {
    allProductsArr.push(p);
  });
};

const allCatProds = async () => {
  let locProds = JSON.parse(localStorage.getItem("locProds"));
  if (!locProds) {
    await settingLocalStorage();
  }
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

    let previousPriceWithGst =
      +p.prodData.mrp * (+p.prodData.gst / 100) + +p.prodData.mrp;
    previousPriceWithGst = Math.round(previousPriceWithGst);
    let dis = Math.round(
      100 - (+p.prodData.totalPrice / previousPriceWithGst) * 100
    );
    if(!p.prodData.mainImgUrl){
      p.prodData.mainImgUrl="https://www.nicomatic.com/themes/custom/jango_sub/img/no-image.png"
    }
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
          <div class="info" style="height: 100px !important;background-color:gay">
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
    let red = Math.round(Math.random() * 244);
    let yellow = Math.round(Math.random() * 244);
    let blue = Math.round(Math.random() * 244);
    document.querySelector(
      "#outer-top-suggestDiv"
    ).style.background = `rgb(${red}, ${yellow}, ${blue})`;
    document.querySelector("#inner-top-suggestDiv").style.background = `rgba(${
      red - 50
    }, ${yellow - 50}, ${blue - 50}, 0.4)`;
    let c = 0;
    for (let cimg of randTopSuggest) {
      if (cimg.id !== CAT) {
        c++;
        if (c > 6) {
          break;
        }
        let cimgData = cimg.data();
        // console.log(cimgData);
        let rand = Math.floor(Math.random() * cimgData.imgs.length);
        // console.log(rand);
        // console.log(cimgData.imgs);
        // await db
        //   .collection("categories")
        //   .doc(cimg.id)
        //   .get()
        //   .then((catDetail) => {
        //     let catDetailData = catDetail.data();
        let locCats = JSON.parse(localStorage.getItem("locCats"));
        // if (!locCats) {
        //   await settingLocalStorage();
        // }
        let cname;
        for (let c of locCats) {
          if (c.id == cimg.id) {
            cname = c.data.name;
            break;
          }
        }

        // console.log(catDetailData);
        card += `
        <div class="col-lg-2 ">
        <a href="./products.html?cat=${cimg.id}" class="item" style="border:none !important;box-shadow:none !important;width:150px;height:200px;object-fit:cover;background:transparent !important;text-decoration:none  ">
          <div class="" >
            <img class="" style="width:150px;height:150px;object-fit:cover" src="${cimgData.imgs[rand].url}" alt="Lake of cakes ">
          </div>
          <div>
            <div class="info" style="height: 20px !important;border-radius:50px;width:100%; margin-left:auto;margin-right:auto;display:block;margin-top:5%"> 
            <h5 class="name responsive-name" >${cname}</h5>
          </div>
        </div>
        </a>
      </div>`;
        // });
        topSuggestionHTML.innerHTML = card;
      }
      // console.log(card);
      // topSuggestionHTML.innerHTML = card;
    }
  });
};

const settingLocalStorage = () => {
  let AllProds = [];
  let AllLocCats = [];
  db.collection("categories").onSnapshot(async (catSnaps) => {
    let catSnapsDocs = catSnaps.docs;
    for (let catDoc of catSnapsDocs) {
      let catData = catDoc.data();
      AllLocCats.push({ id: catDoc.id, data: catData });
      await db
        .collection(catDoc.id)
        .get()
        .then((prodSnaps) => {
          let prodSnapsDocs = prodSnaps.docs;
          prodSnapsDocs.map((pDoc) => {
            let pData = pDoc.data();
            AllProds.push({
              prodId: pDoc.id,
              prodData: {
                cat: catData.name,
                name: pData.name,
                totalPrice: pData.totalPrice,
                mrp: pData.mrp,
                gst: pData.gst,
                mainImgUrl: pData.mainImgUrl,
                stars: pData.stars,
                bannerType: pData.bannerType,
                bannerTypeColorEnd: pData.bannerTypeColorEnd,
                bannerTypeColorStart: pData.bannerTypeColorStart,
                catId: pData.wholeCategory.split("__")[0],
                subcatId: pData.wholeSubCategory.split("__")[1],
                childcatId: pData.wholeChildCategory.split("__")[2],
              },
              catId: catDoc.id,
            });
          });
          // console.log(catDoc.id);
        });
    }
    localStorage.setItem("locProds", JSON.stringify(AllProds));
    localStorage.setItem("locCats", JSON.stringify(AllLocCats));
  });
};

const userSearchProds = async () => {
  let searchVal = USER.toUpperCase();
  allProductsArr = [];
  let locProds = JSON.parse(localStorage.getItem("locProds"));
  // console.log(locProds);
  if (!locProds) {
    await settingLocalStorage();
  }
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
