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

// db.collection("midnight").onSnapshot((catSnaps) => {
//   let catDocs = catSnaps.docs;

//   catDocs.map((catDoc) => {
//     let catData = catDoc.data();
//     allCatArr.push({ catId: catDoc.id, catName: catData.name });
//   });
//   displayCats();
// });

// const allSectionsHTML = document.querySelector("#all-sections");

db.collection('midnight').doc('fixed1').onSnapshot(async(doc) => {
  let data = doc.data();
  if(data.prodIds.length > 0) {
    let eachSection = "";
      let startSection = `
      <section class="clothing-and-Apparel-Area">
        <div class="container-fluid">
          <div class="row">
            <div class="col-lg-12 remove-padding">
              <div class="text-center">
                <h3 class="section-title" style="font-weight: 700;font-size: 30px">
                  ${data.title} 
                </h3>
              </div>
              <div class="text-right mt-3">
                <a href="./Products/products.html?cat=${data.prodIds[0].cat.split('__')[0]}"><button type="button" class="btn btn-danger" style="background:#ff0000;">View More</button></a>
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
    let row = '';
    for(let p of data.prodIds) {
      if(p.id === 'na') {
        continue;
      }
      await db.collection(p.cat.split('__')[0]).doc(p.id).get().then(pdoc => {
        let prodData = pdoc.data();
        // console.log(prodData);
        let dis = 100 - ((+prodData.totalPrice/+prodData.mrp) * 100);
        dis = Math.round(dis);
          row += `
          <div class="col-lg-2 col-md-2 col-6 remove-padding">
            <a href="./Product/product.html?cat=${p.cat.split('__')[0]}&&prod=${p.id}" class="item" style="background:#fff;">
              <div class="item-img">
                <img class="img-fluid" src="${prodData.mainImgUrl}" alt="Lake of cakes">
              </div>
              <div class="info">
                <div class="stars mt-3" style="height:40px;">

                </div>
                <h4 class="price">₹${prodData.totalPrice} <small><del>₹ ${prodData.mrp}</del>(${dis}% OFF)</small></h4>
                <h5 class="name">${prodData.name}</h5>
              </div>
            </a>
          </div>
          `;
          eachSection = startSection + row + endSection;
      }).catch(error => {
        console.log(error);
      });
    }
    document.querySelector('#fixed1').innerHTML = eachSection;
  }
})


// ////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// fixed2

db.collection('midnight').doc('fixed2').onSnapshot(async(doc) => {
  let data = doc.data();
  if(data.prodIds.length > 0) {
    let eachSection = "";
      let startSection = `
      <section class="clothing-and-Apparel-Area">
        <div class="container-fluid">
          <div class="row">
            <div class="col-lg-12 remove-padding">
              <div class="text-center">
                <h3 class="section-title" style="font-weight: 700;font-size: 30px">
                  ${data.title} 
                </h3>
              </div>
              <div class="text-right mt-3">
                <a href="./Products/products.html?cat=${data.prodIds[0].cat.split('__')[0]}"><button type="button" class="btn btn-danger" style="background:#ff0000;">View More</button></a>
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
    let row = '';
    for(let p of data.prodIds) {
      if(p.id === 'na') {
        continue;
      }
      await db.collection(p.cat.split('__')[0]).doc(p.id).get().then(pdoc => {
        let prodData = pdoc.data();
        // console.log(prodData);
        let dis = 100 - ((+prodData.totalPrice/+prodData.mrp) * 100);
        dis = Math.round(dis);
          row += `
          <div class="col-lg-2 col-md-2 col-6 remove-padding">
            <a href="./Product/product.html?cat=${p.cat.split('__')[0]}&&prod=${p.id}" class="item" style="background:#fff;">
              <div class="item-img">
                <img class="img-fluid" src="${prodData.mainImgUrl}" alt="Lake of cakes">
              </div>
              <div class="info">
                <div class="stars mt-3" style="height:40px;">

                </div>
                <h4 class="price">₹${prodData.totalPrice} <small><del>₹ ${prodData.mrp}</del>(${dis}% OFF)</small></h4>
                <h5 class="name">${prodData.name}</h5>
              </div>
            </a>
          </div>
          `;
          eachSection = startSection + row + endSection;
      }).catch(error => {
        console.log(error);
      });
    }
    document.querySelector('#fixed2').innerHTML += eachSection;
  }
})


// ////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// fixed3

db.collection('midnight').doc('fixed3').onSnapshot(async(doc) => {
  let data = doc.data();
  if(data.prodIds.length > 0) {
    let eachSection = "";
      let startSection = `
      <section class="clothing-and-Apparel-Area">
        <div class="container-fluid">
          <div class="row">
            <div class="col-lg-12 remove-padding">
              <div class="text-center">
                <h3 class="section-title" style="font-weight: 700;font-size: 30px">
                  ${data.title} 
                </h3>
              </div>
              <div class="text-right mt-3">
                <a href="./Products/products.html?cat=${data.prodIds[0].cat.split('__')[0]}"><button type="button" class="btn btn-danger" style="background:#ff0000;">View More</button></a>
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
    let row = '';
    for(let p of data.prodIds) {
      if(p.id === 'na') {
        continue;
      }
      await db.collection(p.cat.split('__')[0]).doc(p.id).get().then(pdoc => {
        let prodData = pdoc.data();
        // console.log(prodData);
        let dis = 100 - ((+prodData.totalPrice/+prodData.mrp) * 100);
        dis = Math.round(dis);
          row += `
          <div class="col-lg-2 col-md-2 col-6 remove-padding">
            <a href="./Product/product.html?cat=${p.cat.split('__')[0]}&&prod=${p.id}" class="item" style="background:#fff;">
              <div class="item-img">
                <img class="img-fluid" src="${prodData.mainImgUrl}" alt="Lake of cakes">
              </div>
              <div class="info">
                <div class="stars mt-3" style="height:40px;">

                </div>
                <h4 class="price">₹${prodData.totalPrice} <small><del>₹ ${prodData.mrp}</del>(${dis}% OFF)</small></h4>
                <h5 class="name">${prodData.name}</h5>
              </div>
            </a>
          </div>
          `;
          eachSection = startSection + row + endSection;
      }).catch(error => {
        console.log(error);
      });
    }
    document.querySelector('#fixed3').innerHTML += eachSection;
  }
})

// ////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// fixed4

db.collection('midnight').doc('fixed4').onSnapshot(async(doc) => {
  let data = doc.data();
  if(data.prodIds.length > 0) {
    let eachSection = "";
      let startSection = `
      <section class="clothing-and-Apparel-Area">
        <div class="container-fluid">
          <div class="row">
            <div class="col-lg-12 remove-padding">
              <div class="text-center">
                <h3 class="section-title" style="font-weight: 700;font-size: 30px">
                  ${data.title} 
                </h3>
              </div>
              <div class="text-right mt-3">
                <a href="./Products/products.html?cat=${data.prodIds[0].cat.split('__')[0]}"><button type="button" class="btn btn-danger" style="background:#ff0000;">View More</button></a>
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
    let row = '';
    for(let p of data.prodIds) {
      if(p.id === 'na') {
        continue;
      }
      await db.collection(p.cat.split('__')[0]).doc(p.id).get().then(pdoc => {
        let prodData = pdoc.data();
        // console.log(prodData);
        let dis = 100 - ((+prodData.totalPrice/+prodData.mrp) * 100);
        dis = Math.round(dis);
          row += `
          <div class="col-lg-2 col-md-2 col-6 remove-padding">
            <a href="./Product/product.html?cat=${p.cat.split('__')[0]}&&prod=${p.id}" class="item" style="background:#fff;">
              <div class="item-img">
                <img class="img-fluid" src="${prodData.mainImgUrl}" alt="Lake of cakes">
              </div>
              <div class="info">
                <div class="stars mt-3" style="height:40px;">

                </div>
                <h4 class="price">₹${prodData.totalPrice} <small><del>₹ ${prodData.mrp}</del>(${dis}% OFF)</small></h4>
                <h5 class="name">${prodData.name}</h5>
              </div>
            </a>
          </div>
          `;
          eachSection = startSection + row + endSection;
      }).catch(error => {
        console.log(error);
      });
    }
    document.querySelector('#fixed4').innerHTML += eachSection;
  }
})


// ////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// fixed5

db.collection('midnight').doc('fixed5').onSnapshot(async(doc) => {
  let data = doc.data();
  if(data.prodIds.length > 0) {
    let eachSection = "";
      let startSection = `
      <section class="clothing-and-Apparel-Area">
        <div class="container-fluid">
          <div class="row">
            <div class="col-lg-12 remove-padding">
              <div class="text-center">
                <h3 class="section-title" style="font-weight: 700;font-size: 30px">
                  ${data.title} 
                </h3>
              </div>
              <div class="text-right mt-3">
                <a href="./Products/products.html?cat=${data.prodIds[0].cat.split('__')[0]}"><button type="button" class="btn btn-danger" style="background:#ff0000;">View More</button></a>
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
    let row = '';
    for(let p of data.prodIds) {
      if(p.id === 'na') {
        continue;
      }
      await db.collection(p.cat.split('__')[0]).doc(p.id).get().then(pdoc => {
        let prodData = pdoc.data();
        // console.log(prodData);
        let dis = 100 - ((+prodData.totalPrice/+prodData.mrp) * 100);
        dis = Math.round(dis);
          row += `
          <div class="col-lg-2 col-md-2 col-6 remove-padding">
            <a href="./Product/product.html?cat=${p.cat.split('__')[0]}&&prod=${p.id}" class="item" style="background:#fff;">
              <div class="item-img">
                <img class="img-fluid" src="${prodData.mainImgUrl}" alt="Lake of cakes">
              </div>
              <div class="info">
                <div class="stars mt-3" style="height:40px;">

                </div>
                <h4 class="price">₹${prodData.totalPrice} <small><del>₹ ${prodData.mrp}</del>(${dis}% OFF)</small></h4>
                <h5 class="name">${prodData.name}</h5>
              </div>
            </a>
          </div>
          `;
          eachSection = startSection + row + endSection;
      }).catch(error => {
        console.log(error);
      });
    }
    document.querySelector('#fixed5').innerHTML += eachSection;
  }
})


// ////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// fixed6

db.collection('midnight').doc('fixed6').onSnapshot(async(doc) => {
  let data = doc.data();
  if(data.prodIds.length > 0) {
    let eachSection = "";
      let startSection = `
      <section class="clothing-and-Apparel-Area">
        <div class="container-fluid">
          <div class="row">
            <div class="col-lg-12 remove-padding">
              <div class="text-center">
                <h3 class="section-title" style="font-weight: 700;font-size: 30px">
                  ${data.title} 
                </h3>
              </div>
              <div class="text-right mt-3">
                <a href="./Products/products.html?cat=${data.prodIds[0].cat.split('__')[0]}"><button type="button" class="btn btn-danger" style="background:#ff0000;">View More</button></a>
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
    let row = '';
    for(let p of data.prodIds) {
      if(p.id === 'na') {
        continue;
      }
      await db.collection(p.cat.split('__')[0]).doc(p.id).get().then(pdoc => {
        let prodData = pdoc.data();
        // console.log(prodData);
        let dis = 100 - ((+prodData.totalPrice/+prodData.mrp) * 100);
        dis = Math.round(dis);
          row += `
          <div class="col-lg-2 col-md-2 col-6 remove-padding">
            <a href="./Product/product.html?cat=${p.cat.split('__')[0]}&&prod=${p.id}" class="item" style="background:#fff;">
              <div class="item-img">
                <img class="img-fluid" src="${prodData.mainImgUrl}" alt="Lake of cakes">
              </div>
              <div class="info">
                <div class="stars mt-3" style="height:40px;">

                </div>
                <h4 class="price">₹${prodData.totalPrice} <small><del>₹ ${prodData.mrp}</del>(${dis}% OFF)</small></h4>
                <h5 class="name">${prodData.name}</h5>
              </div>
            </a>
          </div>
          `;
          eachSection = startSection + row + endSection;
      }).catch(error => {
        console.log(error);
      });
    }
    document.querySelector('#fixed6').innerHTML += eachSection;
  }
})


// ////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// fixed7

db.collection('midnight').doc('fixed7').onSnapshot(async(doc) => {
  let data = doc.data();
  if(data.prodIds.length > 0) {
    let eachSection = "";
      let startSection = `
      <section class="clothing-and-Apparel-Area">
        <div class="container-fluid">
          <div class="row">
            <div class="col-lg-12 remove-padding">
              <div class="text-center">
                <h3 class="section-title" style="font-weight: 700;font-size: 30px">
                  ${data.title} 
                </h3>
              </div>
              <div class="text-right mt-3">
                <a href="./Products/products.html?cat=${data.prodIds[0].cat.split('__')[0]}"><button type="button" class="btn btn-danger" style="background:#ff0000;">View More</button></a>
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
    let row = '';
    for(let p of data.prodIds) {
      if(p.id === 'na') {
        continue;
      }
      await db.collection(p.cat.split('__')[0]).doc(p.id).get().then(pdoc => {
        let prodData = pdoc.data();
        // console.log(prodData);
        let dis = 100 - ((+prodData.totalPrice/+prodData.mrp) * 100);
        dis = Math.round(dis);
          row += `
          <div class="col-lg-2 col-md-2 col-6 remove-padding">
            <a href="./Product/product.html?cat=${p.cat.split('__')[0]}&&prod=${p.id}" class="item" style="background:#fff;">
              <div class="item-img">
                <img class="img-fluid" src="${prodData.mainImgUrl}" alt="Lake of cakes">
              </div>
              <div class="info">
                <div class="stars mt-3" style="height:40px;">

                </div>
                <h4 class="price">₹${prodData.totalPrice} <small><del>₹ ${prodData.mrp}</del>(${dis}% OFF)</small></h4>
                <h5 class="name">${prodData.name}</h5>
              </div>
            </a>
          </div>
          `;
          eachSection = startSection + row + endSection;
      }).catch(error => {
        console.log(error);
      });
    }
    document.querySelector('#fixed7').innerHTML += eachSection;
  }
})


// ////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// fixed8

db.collection('midnight').doc('fixed8').onSnapshot(async(doc) => {
  let data = doc.data();
  if(data.prodIds.length > 0) {
    let eachSection = "";
      let startSection = `
      <section class="clothing-and-Apparel-Area">
        <div class="container-fluid">
          <div class="row">
            <div class="col-lg-12 remove-padding">
              <div class="text-center">
                <h3 class="section-title" style="font-weight: 700;font-size: 30px">
                  ${data.title} 
                </h3>
              </div>
              <div class="text-right mt-3">
                <a href="./Products/products.html?cat=${data.prodIds[0].cat.split('__')[0]}"><button type="button" class="btn btn-danger" style="background:#ff0000;">View More</button></a>
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
    let row = '';
    for(let p of data.prodIds) {
      if(p.id === 'na') {
        continue;
      }
      await db.collection(p.cat.split('__')[0]).doc(p.id).get().then(pdoc => {
        let prodData = pdoc.data();
        // console.log(prodData);
        let dis = 100 - ((+prodData.totalPrice/+prodData.mrp) * 100);
        dis = Math.round(dis);
          row += `
          <div class="col-lg-2 col-md-2 col-6 remove-padding">
            <a href="./Product/product.html?cat=${p.cat.split('__')[0]}&&prod=${p.id}" class="item" style="background:#fff;">
              <div class="item-img">
                <img class="img-fluid" src="${prodData.mainImgUrl}" alt="Lake of cakes">
              </div>
              <div class="info">
                <div class="stars mt-3" style="height:40px;">

                </div>
                <h4 class="price">₹${prodData.totalPrice} <small><del>₹ ${prodData.mrp}</del>(${dis}% OFF)</small></h4>
                <h5 class="name">${prodData.name}</h5>
              </div>
            </a>
          </div>
          `;
          eachSection = startSection + row + endSection;
      }).catch(error => {
        console.log(error);
      });
    }
    document.querySelector('#fixed8').innerHTML += eachSection;
  }
})


// ////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// fixed9

db.collection('midnight').doc('fixed9').onSnapshot(async(doc) => {
  let data = doc.data();
  if(data.prodIds.length > 0) {
    let eachSection = "";
      let startSection = `
      <section class="clothing-and-Apparel-Area">
        <div class="container-fluid">
          <div class="row">
            <div class="col-lg-12 remove-padding">
              <div class="text-center">
                <h3 class="section-title" style="font-weight: 700;font-size: 30px">
                  ${data.title} 
                </h3>
              </div>
              <div class="text-right mt-3">
                <a href="./Products/products.html?cat=${data.prodIds[0].cat.split('__')[0]}"><button type="button" class="btn btn-danger" style="background:#ff0000;">View More</button></a>
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
    let row = '';
    for(let p of data.prodIds) {
      if(p.id === 'na') {
        continue;
      }
      await db.collection(p.cat.split('__')[0]).doc(p.id).get().then(pdoc => {
        let prodData = pdoc.data();
        // console.log(prodData);
        let dis = 100 - ((+prodData.totalPrice/+prodData.mrp) * 100);
        dis = Math.round(dis);
          row += `
          <div class="col-lg-2 col-md-2 col-6 remove-padding">
            <a href="./Product/product.html?cat=${p.cat.split('__')[0]}&&prod=${p.id}" class="item" style="background:#fff;">
              <div class="item-img">
                <img class="img-fluid" src="${prodData.mainImgUrl}" alt="Lake of cakes">
              </div>
              <div class="info">
                <div class="stars mt-3" style="height:40px;">

                </div>
                <h4 class="price">₹${prodData.totalPrice} <small><del>₹ ${prodData.mrp}</del>(${dis}% OFF)</small></h4>
                <h5 class="name">${prodData.name}</h5>
              </div>
            </a>
          </div>
          `;
          eachSection = startSection + row + endSection;
      }).catch(error => {
        console.log(error);
      });
    }
    document.querySelector('#fixed9').innerHTML += eachSection;
  }
})


// ////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// fixed10

db.collection('midnight').doc('fixed10').onSnapshot(async(doc) => {
  let data = doc.data();
  if(data.prodIds.length > 0) {
    let eachSection = "";
      let startSection = `
      <section class="clothing-and-Apparel-Area">
        <div class="container-fluid">
          <div class="row">
            <div class="col-lg-12 remove-padding">
              <div class="text-center">
                <h3 class="section-title" style="font-weight: 700;font-size: 30px">
                  ${data.title} 
                </h3>
              </div>
              <div class="text-right mt-3">
                <a href="./Products/products.html?cat=${data.prodIds[0].cat.split('__')[0]}"><button type="button" class="btn btn-danger" style="background:#ff0000;">View More</button></a>
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
    let row = '';
    for(let p of data.prodIds) {
      if(p.id === 'na') {
        continue;
      }
      await db.collection(p.cat.split('__')[0]).doc(p.id).get().then(pdoc => {
        let prodData = pdoc.data();
        // console.log(prodData);
        let dis = 100 - ((+prodData.totalPrice/+prodData.mrp) * 100);
        dis = Math.round(dis);
          row += `
          <div class="col-lg-2 col-md-2 col-6 remove-padding">
            <a href="./Product/product.html?cat=${p.cat.split('__')[0]}&&prod=${p.id}" class="item" style="background:#fff;">
              <div class="item-img">
                <img class="img-fluid" src="${prodData.mainImgUrl}" alt="Lake of cakes">
              </div>
              <div class="info">
                <div class="stars mt-3" style="height:40px;">

                </div>
                <h4 class="price">₹${prodData.totalPrice} <small><del>₹ ${prodData.mrp}</del>(${dis}% OFF)</small></h4>
                <h5 class="name">${prodData.name}</h5>
              </div>
            </a>
          </div>
          `;
          eachSection = startSection + row + endSection;
      }).catch(error => {
        console.log(error);
      });
    }
    document.querySelector('#fixed10').innerHTML += eachSection;
  }
})
