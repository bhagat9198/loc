console.log("index1.js");

const db = firebase.firestore();
const storageService = firebase.storage();

const introCarouselHTML = document.querySelector(".intro-carousel");

// const extractImgUrl = async (imgPath) => {
//   let imgUrl;
//   await storageService
//     .ref(imgPath)
//     .getDownloadURL()
//     .then((url) => {
//       imgUrl = url;
//     })
//     .catch((error) => {
//       console.log(error);
//     });
//   return imgUrl;
// };

db.collection("sliders").onSnapshot(async(snapshots) => {
  let snapshotDocs = snapshots.docs;
  let img = '';
  for(let doc of snapshotDocs) {
    let docData = doc.data();
    img += `
    <a href="#">
      <div class="intro-content slide-one">
        <img class=""
          src="${docData.imgUrl}">
          <div class="container">
          <div class="row">
              <div class="col-lg-12">
                  <div class="slider-content">
                  </div>
              </div>
          </div>
      </div>
      </div>
    </a>`;
  };
  // console.log(img);
  introCarouselHTML.innerHTML = img;
});


// fixed section 1
const fixedSection1RowHTML = document.querySelector('#fixed-section1-row');
const fixedSection1HeadingHTML = document.querySelector('#fixed-section1-heading');

db.collection('sections').doc('fixed1').onSnapshot(doc => { 
  let docData = doc.data();
  // console.log(typeof(docData));
  let row = '';
  for(let card in docData) {
    // console.log(docData[card]);
    if(card === 'title') {
      fixedSection1HeadingHTML.innerHTML = docData[card];
    } else {
      row += `
      <div class="col-lg-3 col-md-3 col-6 remove-padding">
          <div class="left">
            <a class="banner-effect imgca" href="./Products/products.html?tag=${docData[card].tag}&&cat=${docData[card].cat.split('__')[1]}" target="_blank">
              <img class="imgc"
                src="${docData[card].imgUrl}">
            </a>
          </div>
        </div>
      `;
    } 
  }
  fixedSection1RowHTML.innerHTML = row;
})


// fixed section 2
