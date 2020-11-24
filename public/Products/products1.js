console.log("products1.js");

const db = firebase.firestore();
const storageService = firebase.storage();

const allProductsHTML = document.querySelector("#allProducts");
const productHeadingHTML = document.querySelector('#productHeading');
const topSuggestionHTML = document.querySelector("#top-suggestion");
let CAT, SUB, CHILD, TAG, USER;

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
    let randAllProdsArr = arrayRandom(allProductsArr);
    let suggestProdArr = [];
    if (allProductsArr.length > 6) {
      for (let i = 0; i < 6; i++) {
        let randElIndex = Math.floor(Math.random() * allProductsArr.length);
        suggestProdArr.push(randAllProdsArr[randElIndex]);
        randAllProdsArr.splice(randElIndex, 1);
      }
      displayTopSuggest(suggestProdArr);
    }
    displayProds(randAllProdsArr);
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
        console.log(allProductsArr);
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
      await db.collection('categories').doc(CAT).get().then(d => {
        dd = d.data();
        console.log(dd.name);
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
  for (let p of arrProds) {
    // console.log(p);
    let dis = (+p.prodData.totalPrice/+p.prodData.mrp)*100;
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
						<img class="responsive-image" src="${p.prodData.mainImgUrl}" alt="Lake of cakes ${p.prodData.name}">
					</div>
          <div class="info" style="height: 130px !important;background-color:gay">
          <div class="stars">
            <div class="ratings">
                <div class="empty-stars"></div>
                <div class="full-stars" style="width:0%"></div>
            </div>
          </div>       
						<h4 class="price responsive-price ">₹ ${p.prodData.totalPrice} <del><small>₹ ${p.prodData.mrp}</small></del><small style="color:green;font-weight:700;padding:2px">(${dis} % OFF)</small></h4>
            <h5 class="name responsive-name">${p.prodData.name}</h5>
					</div>
				</a>
			</div>
			`;
    // console.log(card);
  }
  // console.log(card);
  allProductsHTML.innerHTML = card;
};

const displayTopSuggest = async (arrProds) => {
  let card = "";
  for (let p of arrProds) {
    let pcat = p.prodData.wholeCategory.split("__")[0];
    card += `
    <div class="col-lg-2 ">
      <a href="../Product/product.html?prod=${p.prodId}&&cat=${pcat}" class="item">
      
        <div class="" >
          <img class="" style="width:220px;height:200px;object-fit:cover" src="${p.prodData.mainImgUrl}" alt="Lake of cakes ${p.prodData.mainImgUrl}">
        </div>
        <div class="info" style="height: 60px !important;">
          <h5 class="nameTop">${p.prodData.name}</h5>
        </div>
      </a>
    </div>
    `;
  }
  topSuggestionHTML.innerHTML = card;
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