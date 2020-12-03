// console.log("index1.js");

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

db.collection("sliders").onSnapshot(async (snapshots) => {
  let snapshotDocs = snapshots.docs;
  let img = "";
  for (let doc of snapshotDocs) {
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
  }

  introCarouselHTML.innerHTML = img;
});

