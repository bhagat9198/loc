// console.log("coupans1.js");

const db = firebase.firestore();
const allcoupansHTML = document.querySelector('#allcoupans');

db.collection('coupans').onSnapshot(snapshots => {
  let snapshotDocs = snapshots.docs;
  let card = '';
  for(doc of snapshotDocs) {
    let docData = doc.data();
    let d = new Date();
    let cyear = docData.validTill.substring(0,4);
    let cmonth = docData.validTill.substring(5,7);
    let cday = docData.validTill.substring(8,10);
    let newDate = new Date(`${cyear}-${cmonth}-${cday}`);

    let diff = (+newDate.getTime() - +d.getTime()) / (1000 * 3600 * 24);

    if(diff <= 0) {
      deleteCoupan(doc.id);
      continue;
    }
    card += displayCard(docData);
  }
  allcoupansHTML.innerHTML = card;
})

const deleteCoupan = id => {
  let coupanRef = db.collection('coupans').doc(id);
  coupanRef.delete().then(deleted => {
    // console.log(deleted);
  }).catch(error => {
    console.log(error);
  })
}

const displayCard = (docData) => {
  // console.log(docData);

  let rand1 = Math.random().toString();
  let rand2 = Math.random();
  return `
  <div class="col-12 col-sm-6 col-md-6 col-lg-4">
    <div class="card h-100 mb-4">
      <div class="card-header">
        <h5 class="card-title m-0 p-0 font-weight-bolder" id="${docData.name}">${docData.name}
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
      <div class="card-footer"><a href="#" class="btn btn-warning" onclick=copyToClipboard('${docData.name}','text__${rand2}')
          data-toggle="tooltip" title="Copied to clipboard">Copy Code</a>
      </div>
      <h5 style="font-weight: 800;background-color: green;font-size: 14px;display: none;"
        id="text__${rand2}">Copied To ClipBoard</h5>
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