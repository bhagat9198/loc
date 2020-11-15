console.log("coupans1.js");

const db = firebase.firestore();
const allcoupansHTML = document.querySelector('#allcoupans');

db.collection('coupans').onSnapshot(snapshots => {
  let snapshotDocs = snapshots.docs;
  let card = '';
  snapshotDocs.map(doc => {
    let docData = doc.data();
    card += displayCard(docData);
  })
  allcoupansHTML.innerHTML = card;
})

const displayCard = (docData) => {

  let rand1 = Math.random();
  let rand2 = Math.random();
  return `
  <div class="col-12 col-sm-6 col-md-6 col-lg-4">
    <div class="card h-100 mb-4">
      <div class="card-header">
        <h5 class="card-title m-0 p-0 font-weight-bolder" id=`+docData.name+`>#${docData.name}
        </h5>
      </div>
      <div class="card-body text-left">
        <p class="card-text">${docData.desc}</p>
        <span class="font-lead-base font-weight-bold text-muted">${displayDisAmt(docData.category, docData.amount)} Off!</span>
        <div class="promotion-promo">${displayDisAmt(docData.category, docData.prevAmout)}</div>
        <div class="promotion-price">
          <div class="promotion-price-desc">GRAB</div>
          <div class="promotion-price-text">Now</div>
        </div>
      </div>
      <div class="card-footer"><a href="#" class="btn btn-warning" onclick=copyToClipboard("`+docData.name+`","`+rand2+`")
          data-toggle="tooltip" title="Copied to clipboard">Copy Code</a>
      </div>
      <h5 style="font-weight: 800;background-color: green;font-size: 14px;display: none;"
        id="${rand2}">Copied To ClipBoard</h5>
    </div>
  </div>
  `;
}

const displayDisAmt = (coupanCat, amt) => {
  let discountAmt = '';
    if(coupanCat === "price") {
      discountAmt = `₹ ${amt}`;
    } else {
      discountAmt = `${amt}%`;
    }
  return discountAmt;
}