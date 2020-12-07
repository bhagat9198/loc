console.log("customersReview1.js");

const db = firebase.firestore();
const storageService = firebase.storage();

let allCategories = [];
let allReviewsArr = [];

db.collection("categories").onSnapshot((catSnaps) => {
  let catSnapsDocs = catSnaps.docs;

  catSnapsDocs.map((catSnapsDoc) => {
    let catData = catSnapsDoc.data();
    allCategories.push({ catId: catSnapsDoc.id, catName: catData.name });
  });
  // extractAllReviews();
  displayReviews();
});

const deleteReview = e => {
  console.log(e.target.dataset);
  let catid = e.target.dataset.catid;
  let prodid = e.target.dataset.prodid;
  let docid = e.target.dataset.docid;
  let counter = e.target.dataset.counter;

  console.log(catid, prodid, docid);
  let delRef = db.collection('reviews').doc(catid).collection(prodid);
  delRef.doc(docid).delete().then(async() => {
    console.log('deleted');
    document.querySelector(`#panel-${counter}`).remove();
    let starsTotal = 0;
    let numStars = 0;
    await delRef.onSnapshot(psnaps => {
      if(psnaps.exists) {
        let psnapsDocs = psnaps.docs;
        for(let pd of psnapsDocs) {
          numStars++;
          starsTotal = +pd.rating.split('__')[0];
        }
      }
    })
    console.log(starsTotal, numStars);
    let avgStar = Math.round(starsTotal/numStars);
    if(numStars === 0) {
      avgStar = 0;
    }
    let pRef = await db.collection(catid).doc(prodid);
    await pRef.get().then(psnap => {
      if(psnap.exists) {
        let pd = psnap.data();
        pd.stars = avgStar;
        pd.totalReviews = numStars;
        pRef.update(pd);
      }
    })
  }).catch(error => {
    console.log(error);
  })
}


let accordionExampleHTML = document.querySelector("#accordionExample");

const displayReviews = async () => {
  let allAccordCards = "";
  for (let c of allCategories) {
    let eachAccordCard = "";
    let eachAccordCardStart = "";
    let eachAccordCardEnd = "";
    let prouctsReviewed = "";
    let singleCatReviwsRef = await db.collection("reviews").doc(c.catId);
    await singleCatReviwsRef.get().then(async (snapshot) => {
      let snapshotData = snapshot.data();
      console.log(snapshotData);
      if (snapshotData) {
        if (snapshotData.collectionIds) {
          // console.log(snapshotData);

          let allCollectionIds = snapshotData.collectionIds;
          for (let collectionId of allCollectionIds) {
            console.log(collectionId);
            let eachProdStart = "";
            let eachProdEnd = "";
            let eachProd = "";
            let prodName = "";
            let card = "";

            await singleCatReviwsRef
              .collection(collectionId)
              .get()
              .then((prodReviewSnaps) => {
                let prodReviewSnapsDocs = prodReviewSnaps.docs;
                let counter = 0;
                for (let rev of prodReviewSnapsDocs) {
                  counter++;
                  let revData = rev.data();
                  // console.log(revData);
                  prodName = revData.prodName;
                  card += `
                  <div class="panel panel-info" id="panel-${counter}">
                    <div class="panel-heading" style="display: flex;">
                      <h5>${revData.userName}</h5>
                      <div class="userrating">
                        <span class="fa fa-star checked"></span>
                        <span class="fa fa-star checked"></span>
                        <span class="fa fa-star checked"></span>
                        <span class="fa fa-star"></span>
                        <span class="fa fa-star"></span>
                      </div>
                    </div>
                    <div class="panel-body" style="display: flex;">
                      <div style="width: 30%;">
                        <img src="${revData.pimg}" width="150px" alt="" srcset="">
                      </div>
                      <div>
                        <small>User Id - ${revData.user}</small>
                        <h5> <strong>Product Sno - ${revData.sno}</strong> </h5>
                        <button class="btn btn-primary reviewBtn" type="button" data-toggle="collapse"
                          data-target="#collapseExample-${revData.user}-${counter}" aria-expanded="false" aria-controls="collapseExample-${revData.user}-${counter}">
                          Read Review
                        </button>
                        <button class="btn btn-primary deleteBtn" type="button" data-counter="${counter}" data-catId="${c.catId}" data-prodId="${collectionId}" data-docId="${rev.id}"  onclick="deleteReview(event)">
                          Delete Review
                        </button>
                        <div class="collapse " id="collapseExample-${revData.user}-${counter}">
                          <div class="card card-body reviewbody">
                            ${revData.msg}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  `;
                }
              });

            eachProdStart = `
            <div class="card">
              <div class="card-header" id="heading-${c.collectionId}">
                <h2 class="mb-0">
                  <button class="btn btn-link" type="button" data-toggle="collapse" data-target="#collapse-${c.collectionId}" aria-expanded="true" aria-controls="collapseOne">
                    ${prodName}
                  </button>
                </h2>
              </div>
              <div id="collapse-${c.collectionId}" class="collapse" aria-labelledby="heading-${c.collectionId}" data-parent="#accordionExample1">
                <div class="card-body">
            `;

            eachProdEnd = `
                  </div>
                </div>
              </div>;
            `;

            eachProd = eachProdStart + card + eachProdEnd;
            // console.log(eachProd);
            prouctsReviewed += eachProd;
          }
        }
      } else {
        // no reviews
        // console.log(snapshotData);
        prouctsReviewed = `
        <div style="color: red;">
          <h4>No Products Reviwed for this category</h4>
        </div>
        `;
      }
    });
    eachAccordCardStart = `
    <div class="card">
      <div class="card-header" id="heading-${c.catId}">
        <h2 class="mb-0">
          <button class="btn btn-link" type="button" data-toggle="collapse" data-target="#collapse-${c.catId}" aria-expanded="true" aria-controls="collapseOne">
            ${c.catName}
          </button>
        </h2>
      </div>
      <div id="collapse-${c.catId}" class="collapse" aria-labelledby="heading-${c.catId}" data-parent="#accordionExample">
        <div class="card-body">
        <div class="accordion" id="accordionExample1">
    `;

    eachAccordCardEnd = `
          </div>
        </div>
      </div>
    </div>;
    `;
    eachAccordCard = eachAccordCardStart + prouctsReviewed + eachAccordCardEnd;
    // console.log(eachAccordCard);
    allAccordCards += eachAccordCard;
  }
  accordionExampleHTML.innerHTML = allAccordCards;
};
