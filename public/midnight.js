// console.log("index1.js");

const db = firebase.firestore();
const storageService = firebase.storage();

const introCarouselHTML = document.querySelector(".intro-carousel");

db.collection("sliders").onSnapshot(async (snapshots) => {
  let snapshotDocs = snapshots.docs;
  let img = "";
  for (let doc of snapshotDocs) {
    let docData = doc.data();
    if (docData.midnight) {
      img += `
      <a href="./Products/products.html?cat=${docData.cat}">
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
  }
  introCarouselHTML.innerHTML = img;
});

let allCatArr = [];

db.collection("categories").onSnapshot((catSnaps) => {
  let catDocs = catSnaps.docs;

  catDocs.map((catDoc) => {
    let catData = catDoc.data();
    allCatArr.push({ catId: catDoc.id, catName: catData.name });
  });
  displayCats();
});

const allSectionsHTML = document.querySelector("#all-sections");

const displayCats = () => {
  let catLength = allCatArr.length;

  if (allCatArr.length > 0) {
    let counter = 0;
    // 0
    if (allCatArr.length >= counter + 1) {
      let index = counter;
      let eachSection = "";
      let startSection = `
      <section class="clothing-and-Apparel-Area">
        <div class="container-fluid">
          <div class="row">
            <div class="col-lg-12 remove-padding">
              <div class="text-center">
                <h3 class="section-title" style="font-weight: 700;font-size: 30px">
                  ${allCatArr[index].catName} 
                </h3>
              </div>
              <div class="text-right mt-3">
                <a href="./Products/products.html?cat=${allCatArr[index].catId}"><button type="button" class="btn btn-danger" style="background:#ff0000;">View More</button></a>
              </div>
            </div>
          </div>
          <div class="row">
            <div class="col-lg-12">
              <div class="row">
      `;

      let endSection = `
              </div>
            </div>
          </div>
        </div>
      </section>
      `;
      db.collection(allCatArr[index].catId).onSnapshot((snaps) => {
        let docs = snaps.docs;
        let i = -1;
        let row = "";
        for (let prodDoc of docs) {
          i++;
          if (i > 5) {
            break;
          }
          let prodData = prodDoc.data();
          console.log(index);
          row += `
          <div class="col-lg-2 col-md-2 col-6 remove-padding">
            <a href="./Product/product.html?cat=${allCatArr[index].catId}&&prod=${prodDoc.id}" class="item" style="background:#fff;">
              <div class="item-img">
                <img class="img-fluid" src="${prodData.mainImgUrl}" alt="Lake of cakes">
              </div>
              <div class="info">
                <div class="stars mt-3" style="height:40px;">
                  <div class="ratings">
                    <div class="empty-stars"></div>
                    <div class="full-stars" style="width:0%"></div>
                  </div>
                </div>
                ${prodData.sp}
                <h5 class="name">${prodData.name}</h5>
              </div>
            </a>
          </div>
          `;
          eachSection = startSection + row + endSection;
        }
        allSectionsHTML.innerHTML = eachSection;
      });
    }

    // 1
    counter++;
    if (counter + 1 < allCatArr.length) {
      let index = counter; 
      let eachSection = "";
      let startSection = `
      <section class="clothing-and-Apparel-Area">
        <div class="container-fluid">
          <div class="row">
            <div class="col-lg-12 remove-padding">
              <div class="text-center">
                <h3 class="section-title" style="font-weight: 700;font-size: 30px">
                  ${allCatArr[index].catName} 
                </h3>
              </div>
              <div class="text-right mt-3">
                <a href="./Products/products.html?cat=${allCatArr[index].catId}"><button type="button" class="btn btn-danger" style="background:#ff0000;">View More</button></a>
              </div>
            </div>
          </div>
          <div class="row">
            <div class="col-lg-12">
              <div class="row">
      `;

      let endSection = `
              </div>
            </div>
          </div>
        </div>
      </section>
      `;
      db.collection(allCatArr[index].catId).onSnapshot((snaps) => {
        let docs = snaps.docs;
        let i = -1;
        let row = "";
        for (let prodDoc of docs) {
          i++;
          if (i > 5) {
            break;
          }
          let prodData = prodDoc.data();
          row += `
          <div class="col-lg-2 col-md-2 col-6 remove-padding">
            <a href="./Product/product.html?cat=${allCatArr[index].catId}&&prod=${prodDoc.id}" class="item" style="background:#fff;">
              <div class="item-img">
                <img class="img-fluid" src="${prodData.mainImgUrl}" alt="Lake of cakes">
              </div>
              <div class="info">
                <div class="stars mt-3" style="height:40px;">
                  <div class="ratings">
                    <div class="empty-stars"></div>
                    <div class="full-stars" style="width:0%"></div>
                  </div>
                </div>
                ${prodData.sp}
                <h5 class="name">${prodData.name}</h5>
              </div>
            </a>
          </div>
          `;
          eachSection = startSection + row + endSection;
        }
        allSectionsHTML.innerHTML = allSectionsHTML.innerHTML + eachSection;
      });
    }

    // 2
    counter++;
    if (counter + 1 < allCatArr.length) {
      let index = counter; 
      let eachSection = "";
      let startSection = `
      <section class="clothing-and-Apparel-Area">
        <div class="container-fluid">
          <div class="row">
            <div class="col-lg-12 remove-padding">
              <div class="text-center">
                <h3 class="section-title" style="font-weight: 700;font-size: 30px">
                  ${allCatArr[index].catName} 
                </h3>
              </div>
              <div class="text-right mt-3">
                <a href="./Products/products.html?cat=${allCatArr[index].catId}"><button type="button" class="btn btn-danger" style="background:#ff0000;">View More</button></a>
              </div>
            </div>
          </div>
          <div class="row">
            <div class="col-lg-12">
              <div class="row">
      `;

      let endSection = `
              </div>
            </div>
          </div>
        </div>
      </section>
      `;
      db.collection(allCatArr[index].catId).onSnapshot((snaps) => {
        let docs = snaps.docs;
        let i = -1;
        let row = "";
        for (let prodDoc of docs) {
          i++;
          if (i > 5) {
            break;
          }
          let prodData = prodDoc.data();
          row += `
          <div class="col-lg-2 col-md-2 col-6 remove-padding">
            <a href="./Product/product.html?cat=${allCatArr[index].catId}&&prod=${prodDoc.id}" class="item" style="background:#fff;">
              <div class="item-img">
                <img class="img-fluid" src="${prodData.mainImgUrl}" alt="Lake of cakes">
              </div>
              <div class="info">
                <div class="stars mt-3" style="height:40px;">
                  <div class="ratings">
                    <div class="empty-stars"></div>
                    <div class="full-stars" style="width:0%"></div>
                  </div>
                </div>
                ${prodData.sp}
                <h5 class="name">${prodData.name}</h5>
              </div>
            </a>
          </div>
          `;
          eachSection = startSection + row + endSection;
        }
        allSectionsHTML.innerHTML = allSectionsHTML.innerHTML + eachSection;
      });
    }

    // 3
    counter++;
    if (counter + 1 < allCatArr.length) {
      let index = counter; 
      let eachSection = "";
      let startSection = `
      <section class="clothing-and-Apparel-Area">
        <div class="container-fluid">
          <div class="row">
            <div class="col-lg-12 remove-padding">
              <div class="text-center">
                <h3 class="section-title" style="font-weight: 700;font-size: 30px">
                  ${allCatArr[index].catName} 
                </h3>
              </div>
              <div class="text-right mt-3">
                <a href="./Products/products.html?cat=${allCatArr[index].catId}"><button type="button" class="btn btn-danger" style="background:#ff0000;">View More</button></a>
              </div>
            </div>
          </div>
          <div class="row">
            <div class="col-lg-12">
              <div class="row">
      `;

      let endSection = `
              </div>
            </div>
          </div>
        </div>
      </section>
      `;
      db.collection(allCatArr[index].catId).onSnapshot((snaps) => {
        let docs = snaps.docs;
        let i = -1;
        let row = "";
        for (let prodDoc of docs) {
          i++;
          if (i > 5) {
            break;
          }
          let prodData = prodDoc.data();
          row += `
          <div class="col-lg-2 col-md-2 col-6 remove-padding">
            <a href="./Product/product.html?cat=${allCatArr[index].catId}&&prod=${prodDoc.id}" class="item" style="background:#fff;">
              <div class="item-img">
                <img class="img-fluid" src="${prodData.mainImgUrl}" alt="Lake of cakes">
              </div>
              <div class="info">
                <div class="stars mt-3" style="height:40px;">
                  <div class="ratings">
                    <div class="empty-stars"></div>
                    <div class="full-stars" style="width:0%"></div>
                  </div>
                </div>
                ${prodData.sp}
                <h5 class="name">${prodData.name}</h5>
              </div>
            </a>
          </div>
          `;
          eachSection = startSection + row + endSection;
        }
        allSectionsHTML.innerHTML = allSectionsHTML.innerHTML + eachSection;
      });
    }

    // 4
    counter++;
    if (counter + 1 < allCatArr.length) {
      let index = counter; 
      let eachSection = "";
      let startSection = `
      <section class="clothing-and-Apparel-Area">
        <div class="container-fluid">
          <div class="row">
            <div class="col-lg-12 remove-padding">
              <div class="text-center">
                <h3 class="section-title" style="font-weight: 700;font-size: 30px">
                  ${allCatArr[index].catName} 
                </h3>
              </div>
              <div class="text-right mt-3">
                <a href="./Products/products.html?cat=${allCatArr[index].catId}"><button type="button" class="btn btn-danger" style="background:#ff0000;">View More</button></a>
              </div>
            </div>
          </div>
          <div class="row">
            <div class="col-lg-12">
              <div class="row">
      `;

      let endSection = `
              </div>
            </div>
          </div>
        </div>
      </section>
      `;
      db.collection(allCatArr[index].catId).onSnapshot((snaps) => {
        let docs = snaps.docs;
        let i = -1;
        let row = "";
        for (let prodDoc of docs) {
          i++;
          if (i > 5) {
            break;
          }
          let prodData = prodDoc.data();
          row += `
          <div class="col-lg-2 col-md-2 col-6 remove-padding">
            <a href="./Product/product.html?cat=${allCatArr[index].catId}&&prod=${prodDoc.id}" class="item" style="background:#fff;">
              <div class="item-img">
                <img class="img-fluid" src="${prodData.mainImgUrl}" alt="Lake of cakes">
              </div>
              <div class="info">
                <div class="stars mt-3" style="height:40px;">
                  <div class="ratings">
                    <div class="empty-stars"></div>
                    <div class="full-stars" style="width:0%"></div>
                  </div>
                </div>
                ${prodData.sp}
                <h5 class="name">${prodData.name}</h5>
              </div>
            </a>
          </div>
          `;
          eachSection = startSection + row + endSection;
        }
        allSectionsHTML.innerHTML = allSectionsHTML.innerHTML + eachSection;
      });
    }

    // 5
    counter++;
    if (counter + 1 < allCatArr.length) {
      let index = counter; 
      let eachSection = "";
      let startSection = `
      <section class="clothing-and-Apparel-Area">
        <div class="container-fluid">
          <div class="row">
            <div class="col-lg-12 remove-padding">
              <div class="text-center">
                <h3 class="section-title" style="font-weight: 700;font-size: 30px">
                  ${allCatArr[index].catName} 
                </h3>
              </div>
              <div class="text-right mt-3">
                <a href="./Products/products.html?cat=${allCatArr[index].catId}"><button type="button" class="btn btn-danger" style="background:#ff0000;">View More</button></a>
              </div>
            </div>
          </div>
          <div class="row">
            <div class="col-lg-12">
              <div class="row">
      `;

      let endSection = `
              </div>
            </div>
          </div>
        </div>
      </section>
      `;
      db.collection(allCatArr[index].catId).onSnapshot((snaps) => {
        let docs = snaps.docs;
        let i = -1;
        let row = "";
        for (let prodDoc of docs) {
          i++;
          if (i > 5) {
            break;
          }
          let prodData = prodDoc.data();
          row += `
          <div class="col-lg-2 col-md-2 col-6 remove-padding">
            <a href="./Product/product.html?cat=${allCatArr[index].catId}&&prod=${prodDoc.id}" class="item" style="background:#fff;">
              <div class="item-img">
                <img class="img-fluid" src="${prodData.mainImgUrl}" alt="Lake of cakes">
              </div>
              <div class="info">
                <div class="stars mt-3" style="height:40px;">
                  <div class="ratings">
                    <div class="empty-stars"></div>
                    <div class="full-stars" style="width:0%"></div>
                  </div>
                </div>
                ${prodData.sp}
                <h5 class="name">${prodData.name}</h5>
              </div>
            </a>
          </div>
          `;
          eachSection = startSection + row + endSection;
        }
        allSectionsHTML.innerHTML = allSectionsHTML.innerHTML + eachSection;
      });
    }

    // 6
    counter++;
    if (counter + 1 < allCatArr.length) {
      let index = counter; 
      let eachSection = "";
      let startSection = `
      <section class="clothing-and-Apparel-Area">
        <div class="container-fluid">
          <div class="row">
            <div class="col-lg-12 remove-padding">
              <div class="text-center">
                <h3 class="section-title" style="font-weight: 700;font-size: 30px">
                  ${allCatArr[index].catName} 
                </h3>
              </div>
              <div class="text-right mt-3">
                <a href="./Products/products.html?cat=${allCatArr[index].catId}"><button type="button" class="btn btn-danger" style="background:#ff0000;">View More</button></a>
              </div>
            </div>
          </div>
          <div class="row">
            <div class="col-lg-12">
              <div class="row">
      `;

      let endSection = `
              </div>
            </div>
          </div>
        </div>
      </section>
      `;
      db.collection(allCatArr[index].catId).onSnapshot((snaps) => {
        let docs = snaps.docs;
        let i = -1;
        let row = "";
        for (let prodDoc of docs) {
          i++;
          if (i > 5) {
            break;
          }
          let prodData = prodDoc.data();
          row += `
          <div class="col-lg-2 col-md-2 col-6 remove-padding">
            <a href="./Product/product.html?cat=${allCatArr[index].catId}&&prod=${prodDoc.id}" class="item" style="background:#fff;">
              <div class="item-img">
                <img class="img-fluid" src="${prodData.mainImgUrl}" alt="Lake of cakes">
              </div>
              <div class="info">
                <div class="stars mt-3" style="height:40px;">
                  <div class="ratings">
                    <div class="empty-stars"></div>
                    <div class="full-stars" style="width:0%"></div>
                  </div>
                </div>
                ${prodData.sp}
                <h5 class="name">${prodData.name}</h5>
              </div>
            </a>
          </div>
          `;
          eachSection = startSection + row + endSection;
        }
        allSectionsHTML.innerHTML = allSectionsHTML.innerHTML + eachSection;
      });
    }

    // 7
    counter++;
    if (counter + 1 < allCatArr.length) {
      let index = counter; 
      let eachSection = "";
      let startSection = `
      <section class="clothing-and-Apparel-Area">
        <div class="container-fluid">
          <div class="row">
            <div class="col-lg-12 remove-padding">
              <div class="text-center">
                <h3 class="section-title" style="font-weight: 700;font-size: 30px">
                  ${allCatArr[index].catName} 
                </h3>
              </div>
              <div class="text-right mt-3">
                <a href="./Products/products.html?cat=${allCatArr[index].catId}"><button type="button" class="btn btn-danger" style="background:#ff0000;">View More</button></a>
              </div>
            </div>
          </div>
          <div class="row">
            <div class="col-lg-12">
              <div class="row">
      `;

      let endSection = `
              </div>
            </div>
          </div>
        </div>
      </section>
      `;
      db.collection(allCatArr[index].catId).onSnapshot((snaps) => {
        let docs = snaps.docs;
        let i = -1;
        let row = "";
        for (let prodDoc of docs) {
          i++;
          if (i > 5) {
            break;
          }
          let prodData = prodDoc.data();
          row += `
          <div class="col-lg-2 col-md-2 col-6 remove-padding">
            <a href="./Product/product.html?cat=${allCatArr[index].catId}&&prod=${prodDoc.id}" class="item" style="background:#fff;">
              <div class="item-img">
                <img class="img-fluid" src="${prodData.mainImgUrl}" alt="Lake of cakes">
              </div>
              <div class="info">
                <div class="stars mt-3" style="height:40px;">
                  <div class="ratings">
                    <div class="empty-stars"></div>
                    <div class="full-stars" style="width:0%"></div>
                  </div>
                </div>
                ${prodData.sp}
                <h5 class="name">${prodData.name}</h5>
              </div>
            </a>
          </div>
          `;
          eachSection = startSection + row + endSection;
        }
        allSectionsHTML.innerHTML = allSectionsHTML.innerHTML + eachSection;
      });
    }

    // 8
    counter++;
    if (counter + 1 < allCatArr.length) {
      let index = counter; 
      let eachSection = "";
      let startSection = `
      <section class="clothing-and-Apparel-Area">
        <div class="container-fluid">
          <div class="row">
            <div class="col-lg-12 remove-padding">
              <div class="text-center">
                <h3 class="section-title" style="font-weight: 700;font-size: 30px">
                  ${allCatArr[index].catName} 
                </h3>
              </div>
              <div class="text-right mt-3">
                <a href="./Products/products.html?cat=${allCatArr[index].catId}"><button type="button" class="btn btn-danger" style="background:#ff0000;">View More</button></a>
              </div>
            </div>
          </div>
          <div class="row">
            <div class="col-lg-12">
              <div class="row">
      `;

      let endSection = `
              </div>
            </div>
          </div>
        </div>
      </section>
      `;
      db.collection(allCatArr[index].catId).onSnapshot((snaps) => {
        let docs = snaps.docs;
        let i = -1;
        let row = "";
        for (let prodDoc of docs) {
          i++;
          if (i > 5) {
            break;
          }
          let prodData = prodDoc.data();
          row += `
          <div class="col-lg-2 col-md-2 col-6 remove-padding">
            <a href="./Product/product.html?cat=${allCatArr[index].catId}&&prod=${prodDoc.id}" class="item" style="background:#fff;">
              <div class="item-img">
                <img class="img-fluid" src="${prodData.mainImgUrl}" alt="Lake of cakes">
              </div>
              <div class="info">
                <div class="stars mt-3" style="height:40px;">
                  <div class="ratings">
                    <div class="empty-stars"></div>
                    <div class="full-stars" style="width:0%"></div>
                  </div>
                </div>
                ${prodData.sp}
                <h5 class="name">${prodData.name}</h5>
              </div>
            </a>
          </div>
          `;
          eachSection = startSection + row + endSection;
        }
        allSectionsHTML.innerHTML = allSectionsHTML.innerHTML + eachSection;
      });
    }

    // 9
    counter++;
    if (counter + 1 < allCatArr.length) {
      let index = counter; 
      let eachSection = "";
      let startSection = `
      <section class="clothing-and-Apparel-Area">
        <div class="container-fluid">
          <div class="row">
            <div class="col-lg-12 remove-padding">
              <div class="text-center">
                <h3 class="section-title" style="font-weight: 700;font-size: 30px">
                  ${allCatArr[index].catName} 
                </h3>
              </div>
              <div class="text-right mt-3">
                <a href="./Products/products.html?cat=${allCatArr[index].catId}"><button type="button" class="btn btn-danger" style="background:#ff0000;">View More</button></a>
              </div>
            </div>
          </div>
          <div class="row">
            <div class="col-lg-12">
              <div class="row">
      `;

      let endSection = `
              </div>
            </div>
          </div>
        </div>
      </section>
      `;
      db.collection(allCatArr[index].catId).onSnapshot((snaps) => {
        let docs = snaps.docs;
        let i = -1;
        let row = "";
        for (let prodDoc of docs) {
          i++;
          if (i > 5) {
            break;
          }
          let prodData = prodDoc.data();
          row += `
          <div class="col-lg-2 col-md-2 col-6 remove-padding">
            <a href="./Product/product.html?cat=${allCatArr[index].catId}&&prod=${prodDoc.id}" class="item" style="background:#fff;">
              <div class="item-img">
                <img class="img-fluid" src="${prodData.mainImgUrl}" alt="Lake of cakes">
              </div>
              <div class="info">
                <div class="stars mt-3" style="height:40px;">
                  <div class="ratings">
                    <div class="empty-stars"></div>
                    <div class="full-stars" style="width:0%"></div>
                  </div>
                </div>
                ${prodData.sp}
                <h5 class="name">${prodData.name}</h5>
              </div>
            </a>
          </div>
          `;
          eachSection = startSection + row + endSection;
        }
        allSectionsHTML.innerHTML = allSectionsHTML.innerHTML + eachSection;
      });
    }

    // 10
    counter++;
    if (counter + 1 < allCatArr.length) {
      let index = counter; 
      let eachSection = "";
      let startSection = `
      <section class="clothing-and-Apparel-Area">
        <div class="container-fluid">
          <div class="row">
            <div class="col-lg-12 remove-padding">
              <div class="text-center">
                <h3 class="section-title" style="font-weight: 700;font-size: 30px">
                  ${allCatArr[index].catName} 
                </h3>
              </div>
              <div class="text-right mt-3">
                <a href="./Products/products.html?cat=${allCatArr[index].catId}"><button type="button" class="btn btn-danger" style="background:#ff0000;">View More</button></a>
              </div>
            </div>
          </div>
          <div class="row">
            <div class="col-lg-12">
              <div class="row">
      `;

      let endSection = `
              </div>
            </div>
          </div>
        </div>
      </section>
      `;
      db.collection(allCatArr[index].catId).onSnapshot((snaps) => {
        let docs = snaps.docs;
        let i = -1;
        let row = "";
        for (let prodDoc of docs) {
          i++;
          if (i > 5) {
            break;
          }
          let prodData = prodDoc.data();
          row += `
          <div class="col-lg-2 col-md-2 col-6 remove-padding">
            <a href="./Product/product.html?cat=${allCatArr[index].catId}&&prod=${prodDoc.id}" class="item" style="background:#fff;">
              <div class="item-img">
                <img class="img-fluid" src="${prodData.mainImgUrl}" alt="Lake of cakes">
              </div>
              <div class="info">
                <div class="stars mt-3" style="height:40px;">
                  <div class="ratings">
                    <div class="empty-stars"></div>
                    <div class="full-stars" style="width:0%"></div>
                  </div>
                </div>
                ${prodData.sp}
                <h5 class="name">${prodData.name}</h5>
              </div>
            </a>
          </div>
          `;
          eachSection = startSection + row + endSection;
        }
        allSectionsHTML.innerHTML = allSectionsHTML.innerHTML + eachSection;
      });
    }

    // 11
    counter++;
    if (counter + 1 < allCatArr.length) {
      let index = counter; 
      let eachSection = "";
      let startSection = `
      <section class="clothing-and-Apparel-Area">
        <div class="container-fluid">
          <div class="row">
            <div class="col-lg-12 remove-padding">
              <div class="text-center">
                <h3 class="section-title" style="font-weight: 700;font-size: 30px">
                  ${allCatArr[index].catName} 
                </h3>
              </div>
              <div class="text-right mt-3">
                <a href="./Products/products.html?cat=${allCatArr[index].catId}"><button type="button" class="btn btn-danger" style="background:#ff0000;">View More</button></a>
              </div>
            </div>
          </div>
          <div class="row">
            <div class="col-lg-12">
              <div class="row">
      `;

      let endSection = `
              </div>
            </div>
          </div>
        </div>
      </section>
      `;
      db.collection(allCatArr[index].catId).onSnapshot((snaps) => {
        let docs = snaps.docs;
        let i = -1;
        let row = "";
        for (let prodDoc of docs) {
          i++;
          if (i > 5) {
            break;
          }
          let prodData = prodDoc.data();
          row += `
          <div class="col-lg-2 col-md-2 col-6 remove-padding">
            <a href="./Product/product.html?cat=${allCatArr[index].catId}&&prod=${prodDoc.id}" class="item" style="background:#fff;">
              <div class="item-img">
                <img class="img-fluid" src="${prodData.mainImgUrl}" alt="Lake of cakes">
              </div>
              <div class="info">
                <div class="stars mt-3" style="height:40px;">
                  <div class="ratings">
                    <div class="empty-stars"></div>
                    <div class="full-stars" style="width:0%"></div>
                  </div>
                </div>
                ${prodData.sp}
                <h5 class="name">${prodData.name}</h5>
              </div>
            </a>
          </div>
          `;
          eachSection = startSection + row + endSection;
        }
        allSectionsHTML.innerHTML = allSectionsHTML.innerHTML + eachSection;
      });
    }
  }
};
