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


let accordionExampleHTML = document.querySelector("#accordionExample");

const displayReviews = async() => {
  let allAccordCards = '';
  for (let c of allCategories) {
    let eachAccordCard = "";
    let eachAccordCardStart = "";
    let eachAccordCardEnd = "";
    let prouctsReviewed = '';
    let singleCatReviwsRef = await db.collection("reviews").doc(c.catId);
    await singleCatReviwsRef.get().then(async(snapshot) => {
      let snapshotData = snapshot.data();
      if (snapshotData) {
        if (snapshotData.collectionIds) {
          console.log(snapshotData);
          let allCollectionIds = snapshotData.collectionIds;
          for (let collectionId of allCollectionIds) {
            let eachProdStart = '';
            let eachProdEnd = '';
            let eachProd = '';
            let prodName = '';
            await singleCatReviwsRef
              .collection(collectionId)
              .get()
              .then((prodReviewSnaps) => {
                let prodReviewSnapsDocs = prodReviewSnaps.docs;
                for (let rev of prodReviewSnapsDocs) {
                  let revData = rev.data();
                  console.log(revData);
                }
              });

            eachProdStart = `
            <div class="card">
              <div class="card-header" id="heading-${c.collectionId}">
                <h2 class="mb-0">
                  <button class="btn btn-link" type="button" data-toggle="collapse" data-target="#collapse-${c.collectionId}" aria-expanded="true" aria-controls="collapseOne">
                    ${c.catName}
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

          eachProd = eachProdStart + eachProdEnd;
          }
        }
      } else {
        // no reviews
        console.log(snapshotData);
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
    console.log(eachAccordCard);
    allAccordCards += eachAccordCard;
  }
  accordionExampleHTML.innerHTML = allAccordCards;
};
