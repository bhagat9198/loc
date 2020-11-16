console.log("products1.js");

const db = firebase.firestore();
const storageService = firebase.storage();

const allProductsHTML = document.querySelector("#allProducts");
const topSuggestionHTML = document.querySelector("#top-suggestion");
let CAT, SUB, CHILD, TAG;

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

getParams(window.location.href).then(async (response) => {
  CAT = response.cat;
  SUB = response.sub;
  CHILD = response.child;
  TAG = response.tag;

  await extractRelvantProds();
  // console.log(allProductsArr);
  if (allProductsArr.length > 0) {
    let randAllProdsArr = arrayRandom(allProductsArr);
    let suggestProdArr = [];
    for (let i = 0; i < 6; i++) {
      let randElIndex = Math.floor(Math.random() * allProductsArr.length);
      suggestProdArr.push(randAllProdsArr[randElIndex]);
      randAllProdsArr.splice(randElIndex, 1);
    }
    displayTopSuggest(suggestProdArr);
    displayProds(randAllProdsArr);
  } else {

  }
});

const extractRelvantProds = async () => {
  console.log("extractRelvantProds");
  let dbRef;
  if (CAT) {
    console.log(CAT);
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
      }

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

    allProductsArr = [];
    await dbRef.get().then((cateogiers) => {
      let cateogiersDocs = cateogiers.docs;
      cateogiersDocs.map((el) => {
        allProductsArr.push({ prodId: el.id, prodData: el.data(), catId: CAT });
      });
    });

    if (TAG) {
      console.log(TAG);
      return;
    }

    console.log(allProductsArr);
    return;
  } else {
    console.log("else");
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
  }
  console.log(allProductsArr);
  return;
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
    card += `
			<div class="col-lg-2 col-md-4 col-6 pb-3 pt-2">
				<a href="../Product/product.html?prod=${p.prodId}&&cat=${p.prodData.wholeCategory.split('__')[0]}" class="item">
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
						<img class="responsive-image"  style="width:220px;height:200px;object-fit:cover" src="${p.prodData.mainImgUrl}" alt="Lake of cakes ${p.prodData.name}">
					</div>
					<div class="info" style="height: 100px !important;">
						<h5 class="name responsive-name">${p.prodData.name}</h5>
            <br>
            <br>
						<h4 class="price ">₹ ${p.prodData.totalPrice} <del><small>₹ 2000</small></del></h4>
						<br>
						<h5 class="discount">Discount : 20 % OFF</h5>
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
  for(let p of arrProds) {
    let pcat = p.prodData.wholeCategory.split('__')[0];
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
