console.log("products1.js");

const db = firebase.firestore();
const storageService = firebase.storage();

const allProductsHTML = document.querySelector("#allProducts");
const productHeadingHTML = document.querySelector('#productHeading');
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
    await userSearchProds();
  }
  // console.log(allProductsArr);
  if (allProductsArr.length > 0) {
    // let randAllProdsArr = arrayRandom(allProductsArr);
    // TEMP_ARR = randAllProdsArr.slice();
    // displayTopSuggest(randAllProdsArr);

    // displayProds(randAllProdsArr);
    displayProds(allProductsArr);
  } else {
    allProductsHTML.innerHTML = 'No products Found';
  }
});

const extractRelvantProds = async () => {
  let dbRef;
  if (CAT) {
    // console.log(CAT);
    dbRef = db.collection(CAT);
    if (SUB) {
      console.log(SUB);
      if (CHILD) {
        console.log(CHILD);
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
        console.log(allProductsArr);
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
      await db.collection('categories').doc(CAT).get().then(d => {
        dd = d.data();
        // console.log(dd);
        // console.log(dd.name);
        prodHeading = dd.name;
      })
      productHeadingHTML.innerHTML = prodHeading;
    }
    return;
  } else {
    console.log("else");
    await allCatProds();
    productHeadingHTML.innerHTML = 'All Products';
    // console.log(allProductsArr);
    return;
  }
};

let allCategories = [];

const extractAllCat = async () => {
  await db.collection("categories").get().then(snapshots => {
    let snapDocs = snapshots.docs;
    snapDocs.map(snap => {
      allCategories.push(snap.id);
    })
  })
}

const allCatProds = async () => {
  await db
    .collection("categories")
    .get()
    .then(async (snapshots) => {
      let snapshotsDocs = snapshots.docs;
      for (let doc of snapshotsDocs) {
        let docId = doc.id;
        // console.log(docId);
        await db
        .collection(docId)
        .get()
        .then((prods) => {
          let pdocs = prods.docs;
          for (let pdoc of pdocs) {
            // console.log(pdoc.id);
            allProductsArr.push({
              prodId: pdoc.id,
              prodData: pdoc.data(),
              catId: docId,
            });
          }
        });
      }
    });
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

const displayProds = async (arrProds) => {
  // console.log(arrProds);
  let card = "";
  let banner,bcolor;
  for (let p of arrProds) {
    if(p.prodData.bannerType !=undefined){
      banner=p.prodData.bannerType;
      bcolor=p.prodData.bannerTypeColor;
    }else{
      banner="";
    }
    let dis = Math.round(100 - ((+p.prodData.totalPrice/+p.prodData.mrp)*100));

    let starsDiv = `
    <span class="fa fa-star"></span>
    <span class="fa fa-star"></span>
    <span class="fa fa-star"></span>
    <span class="fa fa-star"></span>
    <span class="fa fa-star"></span>
    `;
    if(p.prodData.reviews) {
      let stars = [];
      p.prodData.reviews.map(star => {
        stars.push(star.rating.split('__')[0]);
      })
      starsDiv = starRating(stars);
    }

    card += `
			<div class="col-lg-3 col-md-3 col-6 pb-3 pt-2">
				<a href="../Product/product.html?prod=${p.prodId}&&cat=${p.prodData.wholeCategory.split("__")[0]
      }" class="item">
					<div class="item-img">
						<div class="extra-list">
							<ul>
								<li>
									<span rel-toggle="tooltip" title="Add To Wishlist" data-toggle="modal" id="wish-btn"
										data-target="#comment-log-reg" data-placement="right">
										<i class="fa fa-heart"></i>
									</span>
								</li>
							</ul>
            </div>
            <span class="w3-tag w3-display-topleft" style="border-radius:10px;
            background: linear-gradient(90deg, ${p.prodData.bannerTypeColorStart ? p.prodData.bannerTypeColorStart.toString() : ''}, ${p.prodData.bannerTypeColorEnd ? p.prodData.bannerTypeColorEnd.toString() : ''}, #ededed);
            
            animation-name: load;
            animation-duration: 1.5s;
            animation-iteration-count: infinite;
            animation-direction: forwards;
            animation-timing-function: linear;
            background-size: 200% 100%;
            
            " >`+banner+`</span>
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
            <h4 class="price responsive-price ">₹ ${p.prodData.totalPrice} <del><small>₹ ${p.prodData.mrp}</small></del><small style="color:green;font-weight:700;padding:2px">(${dis} % OFF)</small></h4>
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

const displayTopSuggest = async (arrProds) => {
  // console.log(arrProds);
  let dbCatImgRef = db.collection('miscellaneous').doc('catImgs').collection('catImgs');
  let card = "";
   dbCatImgRef.get().then(async(catImgSnaps) => {
    let catImgSnapsDocs = catImgSnaps.docs;
    for(let cimg of catImgSnapsDocs) {
      let cimgData = cimg.data();
      // console.log(cimgData);
      let rand = Math.floor(Math.random() * ((cimgData.imgs.length -1) - 0 +1)) - 0;
      // console.log(rand);
      // console.log(cimgData.imgs);
      await db.collection('categories').doc(cimg.id).get().then(catDetail => {
        let catDetailData = catDetail.data();
        // console.log(catDetailData);
        card += `
        <div class="col-lg-2 ">
        <a href="./products.html?cat=${cimg.id}" class="item" style="border:none !important;box-shadow:none !important ">
          <div class="" >
            <img class="" style="width:220px;height:210px;object-fit:cover" src="${cimgData.imgs[rand].url}" alt="Lake of cakes ">
          </div>
          <div>
            <div class="info" style="height: 20px !important;border-radius:50px;width:70%; margin-left:auto;margin-right:auto;display:block;"> 
            <h5 class="name responsive-name" >${catDetailData.name}</h5>
          </div>
        </div>
        </a>
      </div>`
      })
    }
  
    topSuggestionHTML.innerHTML = card;
  })
};

const userSearchProds = async () => {
  let searchVal = USER.toUpperCase();
  allProductsArr = [];
  await extractAllCat();
  if (searchVal.length >= 3) {
    for (let cat of allCategories) {
      await db.collection(cat).get().then(async (snapshots) => {
        let snapshotDocs = snapshots.docs;
        await snapshotDocs.map(doc => {
          let docData = doc.data();
          // console.log(docData);
          if (docData.name.toUpperCase().includes(searchVal) ||
            docData.sno.toUpperCase().includes(searchVal) ||
            docData.tags.toString().toUpperCase().includes(searchVal) ||
            docData.wholeCategory.split('__')[1].toString().toUpperCase().includes(searchVal) ||
            docData.wholeChildCategory.split('__')[3].toString().toUpperCase().includes(searchVal) ||
            docData.wholeSubCategory.split('__')[2].toString().toUpperCase().includes(searchVal)
          )
            allProductsArr.push({
              prodId: doc.id,
              prodData: docData,
              catId: cat,
            });

        })
      })
    }
  }

  if (allProductsArr.length === 0) {
    allCatProds()
  } else {
    productHeadingHTML.innerHTML = `Products for "${USER}"`;
  }
}

const sortProducts = (e, current) => {
  // console.log(e, current.value);
  if(current.value === 'popular') {
    let temp = TEMP_ARR.slice();
    console.log('aa');
    displayProds(temp)
  } else if(current.value === 'low') {
    let temp = TEMP_ARR.slice();
    function compare( a, b ) {
      a = a.prodData.mrp;
      b = b.prodData.mrp;
      return a - b;
    }
    
    temp.sort( compare );
    displayProds(temp);

  } else if(current.value === 'high') {
    let temp = TEMP_ARR.slice();
    function compare( a, b ) {
      a = a.prodData.mrp;
      b = b.prodData.mrp;
      return b - a;
    }
    temp.sort( compare );
    displayProds(temp);
  } else {
    console.log('invalid');
  }
}