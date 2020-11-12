console.log("products1.js");

const db = firebase.firestore();
const storageService = firebase.storage();

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

getParams(window.location.href).then(async (response) => {
  CAT = response.cat;
  SUB = response.sub;
  CHILD = response.child;
  TAG = response.tag;

  let dbRef;
  let allProductsArr = [];

  if (CAT) {
    console.log(CAT);
		dbRef = db.collection(CAT);
		allProductsArr = [];
		await dbRef.get().then(cateogiers => {
			let cateogiersDocs = cateogiers.docs;
			cateogiersDocs.map(el => {
				allProductsArr.push({ prodId: el.id, prodData: el.data(), catId: CAT });
			})
		})

    if (SUB) {
      console.log(SUB);

      if (CHILD) {
        console.log(CHILD);
      }
    }

    if (TAG) {
      console.log(TAG);
    }
  } else {
    console.log("else");
    await db
      .collection("categories")
      .get()
      .then(async (snapshots) => {
        let snapshotsDocs = snapshots.docs;
        for (let doc of snapshotsDocs) {
          let docId = doc.id;
          console.log(docId);
          await db
            .collection(docId)
            .get()
            .then((prods) => {
							let pdocs = prods.docs;
							for(let pdoc of pdocs) {
								console.log(pdoc.id);
								allProductsArr.push({ prodId: pdoc.id, prodData: pdoc.data(), catId: docId });
							}
            });
        }
      });
  }

  let randAllProdsArr = arrayRandom(allProductsArr);
  displayProds(randAllProdsArr);
});

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

const allProductsHTML = document.querySelector('#allProducts');
const displayProds = async(arrProds) => {
	// console.log(arrProds);
	let card = '';
	for(let p of arrProds) {
		console.log(p);
			card += `
			<div class="col-lg-2 col-md-3 col-6 pb-3 pt-2">
				<a href="../Product/product.html?prod=${p.prodId}" class="item">
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
						<img class="img-fluid" src="${p.prodData.mainImgUrl}" alt="Lake of cakes ${p.prodData.name}">
					</div>
					<div class="info" style="height: 100px !important;">
						<h5 class="name">${p.prodData.name}</h5>
						<br>
						<h4 class="price ">₹ 1197 <del><small>₹ 2000</small></del></h4>
						<br>
						<h5 class="discount">Discount : 20 % OFF</h5>
					</div>
				</a>
			</div>
			`;
			console.log(card);
	}
	console.log(card);
	allProductsHTML.innerHTML = card;
};
