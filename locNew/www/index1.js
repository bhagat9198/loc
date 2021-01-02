// console.log("index1.js");

const db = firebase.firestore();
const storageService = firebase.storage();

db.collection("miscellaneous")
  .doc("siteStatus")
  .onSnapshot((siteDoc) => {
    let siteData = siteDoc.data();
    // console.log(siteData);
    if (!siteData.status) {
      document.querySelector("#error-text").innerHTML = siteData.note;
      $(".bd-example-modal-lg").modal("show");
    }
  });

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
    // console.log(docData);
    if (docData.isActivated == "true") {
      // console.log('aaa');
      // console.log(docData);
      if (docData.daylight) {
        // console.log('bbb');
        // console.log(docData);
        img += `
      <a href="./Products/products.html?cat=${docData.cat}&&sub=${
          docData.subCat ? docData.subCat : ""
        }&&child=${docData.childCat ? docData.childCat : ""}">
        <div class="intro-content slide-one" >
          <img  class="sliderPc"
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
  }

  introCarouselHTML.innerHTML = img;
});

// fixed section 1
const fixedSection1RowHTML = document.querySelector("#fixed-section1-row");
const fixedSection1HeadingHTML = document.querySelector(
  "#fixed-section1-heading"
);

db.collection("sections")
  .doc("fixed1")
  .onSnapshot((doc) => {
    let docData = doc.data();
    // console.log(typeof(docData));
    let row = "";
    for (let card in docData) {
      // console.log(docData[card]);
      if (card === "title") {
        fixedSection1HeadingHTML.innerHTML = docData[card];
      } else {
        // console.log(docData[card]);
        let sub = "",
          child = "";
        if (docData[card].subCat) {
          sub = docData[card].subCat.split("__")[0];
        }
        if (docData[card].child) {
          child = docData[card].child.split("__")[0];
        }

        row += `
   
      <div class="col-lg-3 col-md-3 col-6 remove-padding revealOnScroll"  data-animation="slideInRight">
          <div class="left">
            <a class="banner-effect imgca" href="./Products/products.html?cat=${
              docData[card].cat.split("__")[0]
            }&&sub=${sub}&&child=${child}&&tag=${docData[card].tag}">
              <img class="imgc"
                src="${docData[card].imgUrl}">
            </a>
          </div>
        </div>
      `;
      }
    }
    fixedSection1RowHTML.innerHTML = row;
  });

// user defined sliders
const userDefinedSliderHTML = document.querySelector("#user-defined-slider");

let userSilderRef = db
  .collection("sections")
  .doc("slider")
  .collection("slider");
var datass = "NO";
userSilderRef.get().then(async (sliderSnaps) => {
  let wholeUserSlider = "";
  let sliderSnapsDocs = sliderSnaps.docs;
  for (let sliderDocs of sliderSnapsDocs) {
    let docData = sliderDocs.data();
    if (docData.activated.toString() === "true") {
      datass = "YES";
      let tl = docData.colorTL;
      let br = docData.colorBR;
      //
      let eachUserSlider = `
    <section class="trending"  style="background-image: linear-gradient(to right, ${tl}, ${br})!important;"> 
    <div class="container-fluid">
      <div class="row">
        <div class="col-lg-12">
          <div class="text-center">
            <h3 class="section-title bannerheading" style="color: #ffffff !important;" id="fixed-section4-heading"
              style=" font-weight: 700;font-size: 30px"> ${docData.title}
            </h3>
          </div>
        </div>
        <div class="col-lg-12">
          <div class="row">
            <div class="trending-item-slider" id="fixed-section4-row">
    `;

      let row = "";
      for (let card of docData.card) {
        await db
          .collection(card.category)
          .doc(card.id)
          .get()
          .then((pd) => {
            let pdata = pd.data();
            let dis = 100 - (+pdata.totalPrice / +pdata.mrp) * 100;
            dis = Math.round(dis);

            row += `
            <a href="./Product/product.html?cat=${card.category}&&prod=${card.id}" class="item">
              <div class="item-img">
                <img class="img-fluid" src="${pdata.mainImgUrl}" alt="Lake of cakes">
              </div>
              <div class="info">
                <div class="stars">
                  <h5 class="contactless"> Contactless delivery</h5>
                </div>
                <h4 class="price">₹${pdata.totalPrice} <small><del>₹ ${pdata.mrp}</del><span style="color: green"> (${dis}%OFF)</span></small></h4>
                <h5 class="name">${pdata.name}</h5>  
              </div>
            </a>
            `;
          });
      }
      eachUserSlider =
        eachUserSlider + row + ` </div></div></div></div></section>`;
      wholeUserSlider += eachUserSlider;
    }
  }
  userDefinedSliderHTML.innerHTML = wholeUserSlider;
  if (datass == "YES") {
    var $trending_slider = $(".trending-item-slider");
    $trending_slider.owlCarousel({
      items: 4,
      autoplay: true,
      margin: 10,
      loop: true,
      dots: true,
      nav: true,
      center: false,
      autoplayHoverPause: true,
      navText: [
        "<i class='fa fa-angle-left'></i>",
        "<i class='fa fa-angle-right'></i>",
      ],
      smartSpeed: 800,
      responsive: {
        0: {
          items: 2,
        },
        414: {
          items: 2,
        },
        768: {
          items: 3,
        },
        992: {
          items: 5,
        },
        1200: {
          items: 6,
        },
      },
    });
  }
});

// fixed section 2
const fixedSection2Row = document.querySelector("#fixed-section2-row");
const fixedSection21Row = document.querySelector("#fixed-section21-row");
db.collection("sections")
  .doc("fixed2")
  .onSnapshot((doc) => {
    let docData = doc.data();
    let sortArr = [];
    // console.log(docData);
    for (let card in docData) {
      // console.log(card);
      if (card === "title") continue;
      sortArr.push(docData[card]);
    }
    // console.log(sortArr);

    sortArr.sort(function (a, b) {
      return +b.priority - +a.priority;
    });

    // console.log(sortArr);

    // let sub ='', child = '';
    // console.log(card);
    // if(card.subCat) {
    //   sub = card.subCat.split("__")[0];
    // }
    // if(card.child) {
    //   child = card.child.split("__")[0];
    // }

    let row = "";
    for (let card of sortArr) {
      row += `
      <div class="sc-common-padding colxl2 revealOnScroll"  data-animation="rollIn">
        <div class="card cardc align-items-center" >
          <a href="./Products/products.html?cat=${
            card.cat.split("__")[0]
          }&&tag=${card.tag}" class="">
            <div class="iconimg">
              <img class="comimg" style="width:300px !important;height:100px;object-fit:cover" src="${
                card.imgUrl
              }"
                class="card-img-top img-fluid" alt="...">
            </div>
            <div class="card-body cbc text-center">
              <h5 class="card-title" style="font-family: cursive; font-size: 15px;">${
                card.cat.split("__")[1]
              }</h5>
            </div>
          </a>
        </div>
      </div>
      `;
    }
    // fixedSection2Row.innerHTML = row;
    fixedSection21Row.innerHTML = row;
  });

// fixed section 3
const fixedSection3Row = document.querySelector("#fixed-section3-row");

db.collection("sections")
  .doc("fixed3")
  .onSnapshot((doc) => {
    let docData = doc.data();
    let row = "";
    let title;
    for (let card in docData) {
      if (card === "title") {
        title = `
      <div class="col-md-12 text-center">
        <h3 class="bannerheading" id="fixed-section3-heading">${docData[card]}</h3>
      </div>
      `;
      } else {
        let sub = "",
          child = "";
        if (docData[card].subCat) {
          sub = docData[card].subCat.split("__")[0];
        }
        if (docData[card].child) {
          child = docData[card].child.split("__")[0];
        }
        row += `
      <div class="col-lg-3 col-md-3 col-6 remove-padding mt-3 revealOnScroll" data-animation="fadeInUp >
      <div class="top-grid-head">
        <div class="aside">
          <a href="./Products/products.html?cat=${
            docData[card].cat.split("__")[0]
          }&&sub=${sub}&&child=${child}&&tag=${
          docData[card].tag
        }" class="banner-effect imgca" href="bbb">
            <img class="imgc" src="${docData[card].imgUrl}" alt="">
          </a>
        </div>
        
      </div>
      `;
      }
    }
    fixedSection3Row.innerHTML = title + row;
  });

// user defined 4cards
const userDefined4cardsHTML = document.querySelector("#user-defined-4cards");
let cards4Ref = db.collection("sections").doc("4cards").collection("4cards");
cards4Ref.get().then((cards4Snaps) => {
  let cards4SnapsDocs = cards4Snaps.docs;
  let wholecard4 = "";

  for (let card4Doc of cards4SnapsDocs) {
    let card4Data = card4Doc.data();
    if (card4Data.activated.toString() === "true") {
      let tl = card4Data.colorTL;
      let br = card4Data.colorBR;
      let eachCard4 = `
    <section class="banner-section"  style="background-image: linear-gradient(to right, ${tl}, ${br})!important;">
      <h3 class="bannerheading fadeIn" id="fixed-section1-heading">${card4Data.title}</h3>
      <div class="container-fluid">
        <div class="row" id="fixed-section1-row">
    `;

      let row = "";
      for (let c of card4Data.card) {
        row += `
      <div class="col-lg-3 col-md-3 col-6 remove-padding">
        <div class="left">
          <a class="banner-effect imgca" href="./Products/products.html?cat=${card4Data.category}&&tag=${c.tag}" target="_blank">
            <img class="imgc" src="${c.imgUrl}" alt="Lake of cakes">
          </a>
        </div>
      </div>
      `;
      }
      eachCard4 = eachCard4 + row + `</div></div></section>`;
      wholecard4 += eachCard4;
    }
  }

  userDefined4cardsHTML.innerHTML = wholecard4;
});

// fixed section 4

const fixedSection4Row = document.querySelector("#fixed-section4-row");
const fixedSection4Heading = document.querySelector("#fixed-section4-heading");

db.collection("sections")
  .doc("fixed4")
  .get()
  .then(async (doc) => {
    let docData = doc.data();
    let row = "";
    fixedSection4Heading.innerHTML = docData["title"];
    for (let card of docData.prodIds) {
      // let docRef = db
      //   .collection(card.cat.toString().split("__")[0])
      //   .doc(card.id.toString());
      // await docRef.get().then((prod) => {
      //   let prodData = prod.data();
      if (card.id === "na") {
        continue;
      } else {
        let mrp = Math.round(+card.mrp + +card.mrp * (+card.gst / 100));
        let dis = 100 - (+card.totalPrice / mrp) * 100;
        dis = Math.round(dis);

        row += `
          <a href="./Product/product.html?prod=${card.id}&&cat=${
          card.cat.split("__")[0]
        }" class="item">
            <div class="item-img">
              <img class="img-fluid" src="${card.mainImgUrl}" >
            </div>
            
              <div class="info">
                <div class="stars">
                  <h5 class="contactless"> </h5>
                </div>
                <h4 class="price">₹${
                  card.totalPrice
                } <del><small>₹${mrp}</small></del><small style="color:green">&nbsp;(${dis}% OFF)</small></h4>
                <h5 class="name">${card.name}</h5>
              </div>
          
          </div>
          </a>
      
          `;
      }
      // });
    }
    // }
    fixedSection4Row.innerHTML = row;
    var $trending_slider = $(".trending-item-slider");
    $trending_slider.owlCarousel({
      items: 4,
      autoplay: true,
      margin: 10,
      loop: true,
      dots: true,
      nav: true,
      center: false,
      autoplayHoverPause: true,
      navText: [
        "<i class='fa fa-angle-left'></i>",
        "<i class='fa fa-angle-right'></i>",
      ],
      smartSpeed: 800,
      responsive: {
        0: {
          items: 2,
        },
        414: {
          items: 2,
        },
        768: {
          items: 3,
        },
        992: {
          items: 5,
        },
        1200: {
          items: 6,
        },
      },
    });
  });

// fixed section 5
const fixedSection5Row = document.querySelector("#fixed-section5-row");
db.collection("sections")
  .doc("fixed5")
  .onSnapshot((doc) => {
    let docData = doc.data();
    let row = "";
    let title = "";
    for (let card in docData) {
      // console.log(card);
      if (card === "title") {
        // console.log(docData[card]);
        title = `
      <div class="col-md-12 text-center">
        <h3 class="mb-3   revealOnScroll"  style="font-weight: 700;font-size: 30px;color: #1c7780 !important;" data-animation="fadeInUp">${docData[card]}</h3>
      </div>
      `;
      } else {
        row += `
        <div class="col-lg-4 col-md-4 col-6 remove-padding mt-3  revealOnScroll" data-animation="fadeInUp>
          <div class="aside">
            <a href="./Products/products.html?cat=${
              docData[card].cat.split("__")[0]
            }&&tag=${docData[card].tag}" class="banner-effect imgca">
              <img class="imgc" src="${docData[card].imgUrl}" alt="">
            </a>
          </div>
        </div>
        `;
      }
    }
    // console.log(title, row);
    fixedSection5Row.innerHTML = title + row;
  });

// fixed section 6
const fixedSection6Heading = document.querySelector("#fixed-section6-heading");
const fixedSection6Row = document.querySelector("#fixed-section6-row");
const fixedSection6ViewAll = document.querySelector("#fixed-section6-viewAll");
const fixedSection6ViewAllMob = document.querySelector(
  "#fixed-section6-viewAllMob"
);

db.collection("sections")
  .doc("fixed6")
  .onSnapshot(async (doc) => {
    let docData = doc.data();
    let row = "";
    fixedSection6Heading.innerHTML = docData.title;
    let t;
    for (let card of docData.prodIds) {
      // console.log(card);
      // await db
      //   .collection(card.cat.split("__")[0])
      //   .doc(card.id)
      //   .get()
      //   .then((prod) => {
      // let prodData = prod.data();
      if (card.id === "na") {
        continue;
      } else {
        // console.log(prodData);
        // console.log(prodData.wholeCategory.split("__")[0]);
        t = card.cat.split("__")[0];
        let mrp = Math.round(+card.mrp + +card.mrp * (+card.gst / 100));
        let dis = 100 - (+card.totalPrice / mrp) * 100;
        dis = Math.round(dis);
        row += `
          <div class="col-lg-2 col-md-3 col-6 remove-padding">
          <a href="./Product/product.html?prod=${card.id}&&cat=${t}">
            <div class="item">
              <div class="item-img">
                <img class="img-fluid" src="${card.mainImgUrl}">
              </div>
                <div class="info">
                  <div class="stars">
                  </div>
                  <h4 class="price">₹${card.totalPrice} <small><del>₹${mrp}</del><span style="color: green"> (${dis}%OFF)</span></small></h4>
                  <h5 class="name">${card.name}</h5>
                </div>
            </div>
            </a>
          </div>
          
          `;
      }
      // });
    }
    fixedSection6ViewAll.href = `./Products/products.html?cat=${t}`;
    fixedSection6ViewAllMob.href = `./Products/products.html?cat=${t}`;
    fixedSection6Row.innerHTML = row;
  });

// user defined animation
const userDefinedAnimationHTML = document.querySelector(
  "#user-defined-animation"
);
let userAnimationRef = db
  .collection("sections")
  .doc("animation")
  .collection("animation");
userAnimationRef.get().then((imgSnaps) => {
  let imgSnapsDocs = imgSnaps.docs;
  let wholeImg = "";
  for (let imgDoc of imgSnapsDocs) {
    let imgData = imgDoc.data();
    if (imgData.activated.toString() === "true") {
      let eachImg = `
    <section>
      <div class="container-fluid p-0  ">
        <div class="remove-padding">
          <div class="img">
            <a class="banner-effect2" href="./Products/products.html?cat=${imgData.category}">
              <video width="100%" height="300px" class="img-fluid" alt="Lake of Cakes" controls autoplay loop muted>
                <source src="${imgData.card.animationUrl}" type="video/mp4">
              </video>
            </a>
          </div>
        </div>
      </div>
    </section>
    `;
      wholeImg += eachImg;
    }
  }
  // console.log(wholeImg);
  userDefinedAnimationHTML.innerHTML = wholeImg;
});

// user defined img
const userDefinedImgHTML = document.querySelector("#user-defined-img");
let userImgRef = db.collection("sections").doc("img").collection("img");
userImgRef.get().then((imgSnaps) => {
  let imgSnapsDocs = imgSnaps.docs;
  let wholeImg = "";
  for (let imgDoc of imgSnapsDocs) {
    let imgData = imgDoc.data();
    if (imgData.activated.toString() === "true") {
      let eachImg = `
    <section>
      <div class="container-fluid p-0  ">
        <div class="remove-padding">
          <div class="img">
            <a class="banner-effect2" href="./Products/products.html?cat=${imgData.category}">
              <img class="img-fluid" src="${imgData.card.imgUrl}" alt="Lake of Cakes">
            </a>
          </div>
        </div>
      </div>
    </section>
    `;
      wholeImg += eachImg;
    }
  }
  userDefinedImgHTML.innerHTML = wholeImg;
});

// fixed section 7
const fixedSection7Heading = document.querySelector("#fixed-section7-heading");
const fixedSection7Row = document.querySelector("#fixed-section7-row");
const fixedSection7ViewAll = document.querySelector("#fixed-section7-viewAll");
const fixedSection7ViewAllMob = document.querySelector(
  "#fixed-section7-viewAllMob"
);

db.collection("sections")
  .doc("fixed7")
  .onSnapshot(async (doc) => {
    let docData = doc.data();
    let row = "";
    fixedSection7Heading.innerHTML = docData.title;
    let t;
    for (let card of docData.prodIds) {
      // console.log(card.cat.split('__')[1], card.id);
      // await db
      //   .collection(card.cat.split("__")[0])
      //   .doc(card.id)
      //   .get()
      //   .then((prod) => {
      //     let prodData = prod.data();
      if (card.id === "na") {
        continue;
      } else {
        t = card.cat.split("__")[0];
        let mrp = Math.round(+card.mrp + +card.mrp * (+card.gst / 100));
        let dis = 100 - (+card.totalPrice / mrp) * 100;
        dis = Math.round(dis);
        row += `
          <div class="col-lg-2 col-md-3 col-6 remove-padding">
          <a href="./Product/product.html?prod=${card.id}&&cat=${t}">
          <div class="item" >
            <div class="item-img">
              <img class="img-fluid" src="${card.mainImgUrl}">
            </div>
              <div class="info">
                <div class="stars"></div>
                <h4 class="price">₹${card.totalPrice} <small><del>₹${mrp}</del><span style="color: green"> (${dis}%OFF)</span></small></h4>
                <h5 class="name">${card.name}</h5>
              </div>
          </div>
          </a>
        </div>
        `;
      }
      // });
    }
    fixedSection7ViewAll.href = `./Products/products.html?cat=${t}`;

    fixedSection7ViewAllMob.href = `./Products/products.html?cat=${t}`;
    fixedSection7Row.innerHTML = row;
  });

// fixed section 8
const fixedSection8Heading = document.querySelector("#fixed-section8-heading");
const fixedSection8Row = document.querySelector("#fixed-section8-row");
db.collection("sections")
  .doc("fixed8")
  .onSnapshot((doc) => {
    let docData = doc.data();
    let row = "";
    fixedSection8Heading.innerHTML = docData["title"];
    for (let card in docData) {
      // console.log(docData[card]);
      // console.log(docData[card]);
      if (card != "title") {
        let sub = "",
          child = "";
        if (docData[card].subCat) {
          sub = docData[card].subCat.split("__")[0];
        }
        if (docData[card].child) {
          child = docData[card].child.split("__")[0];
        }

        row += `
      <div class="col-lg-3 col-md-3 col-6 remove-padding">
        <div class="left">
          <a href="./Products/products.html?cat=${
            docData[card].cat.split("__")[0]
          }&&sub=${sub}&&child=${child}&&tag=${
          docData[card].tag
        }" class="banner-effect imgca">
            <img class="imgc" src="${docData[card].imgUrl}" alt="">
          </a>
        </div>
      </div>
      `;
      }
    }
    fixedSection8Row.innerHTML = row;
  });

// user defined section card 6
const userDefined6cardsHTML = document.querySelector("#user-defined-6cards");
let cards6Ref = db.collection("sections").doc("6cards").collection("6cards");
cards6Ref.get().then(async (card6Snaps) => {
  let card6SnapsDocs = card6Snaps.docs;
  let wholecard6 = "";
  for (card6Doc of card6SnapsDocs) {
    let card6Data = card6Doc.data();
    if (card6Data.activated.toString() === "true") {
      let tl = card6Data.colorTL;
      let br = card6Data.colorBR;

      let eachcard6 = `
      <section class="categori-item clothing-and-Apparel-Area"  style="background-image: linear-gradient(to right, ${tl}, ${br})!important;">
        <div class="container-fluid">
          <div class="row">
            <div class="col-lg-12 remove-padding">
              <div class="row">
                <div class="col-md-4 text-center"></div>
                <div class="col-md-4 text-center">
                  <h3 class="section-title" id="fixed-section7-heading" style="font-weight: 700;font-size: 30px">${card6Data.title}
                  </h3>
                </div>
              </div>
            </div>
          </div>
          <div class="row">
            <div class="col-lg-12">
              <div class="row" id="fixed-section7-row">
      `;

      let row = "";
      for (let c of card6Data.card) {
        await db
          .collection(c.category)
          .doc(c.id)
          .get()
          .then((pd) => {
            let pdata = pd.data();
            let dis = 100 - (+pdata.totalPrice / +pdata.mrp) * 100;
            dis = Math.round(dis);
            row += `
          <div class="col-lg-2 col-md-3 col-6 remove-padding">
            <a href="./Product/product.html?cat=${c.category}&&prod=${c.id}" class="item">
              <div class="item-img">
                <img class="img-fluid" src="${pdata.mainImgUrl}" alt="Lake of Cakes">
              </div>
              <div class="info">
                <div class="stars">
                </div>
                <h4 class="price">₹${pdata.totalPrice} <small><del>₹${pdata.mrp}</del>(${dis}% OFF)</small></h4>
                <h5 class="name">${pdata.name}</h5>
              </div>
            </a>
          </div>
          `;
          });
      }

      eachcard6 = eachcard6 + row + `</div></div></div></div></section>`;
      wholecard6 += eachcard6;
    }
  }

  userDefined6cardsHTML.innerHTML = wholecard6;
});

// fixed section 9
const fixedSection9Heading = document.querySelector("#fixed-section9-heading");
const fixedSection9Row = document.querySelector("#fixed-section9-row");
db.collection("sections")
  .doc("fixed9")
  .onSnapshot((doc) => {
    let docData = doc.data();
    // console.log(docData);
    let row = "";
    fixedSection9Heading.innerHTML = docData["title"];
    for (let card in docData) {
      // console.log(docData[card]);
      // console.log(docData[card]);
      if (card != "title") {
        let sub = "",
          child = "";
        if (card.subCat) {
          sub = card.subCat.split("__")[0];
        }
        if (card.child) {
          child = card.child.split("__")[0];
        }
        row += `
      <div class="col-lg-3 col-md-3 col-6 remove-padding">
        <div class="left">
          <a href="./Products/products.html?cat=${
            docData[card].cat.split("__")[0]
          }&&sub=${sub}&&child=${child}&&tag=${
          docData[card].tag
        }" class="banner-effect imgca">
            <img class="imgc" src="${docData[card].imgUrl}" alt="">
          </a>
        </div>
      </div>
      `;
      }
    }
    fixedSection9Row.innerHTML = row;
  });

// fixed img 41
db.collection("sections")
  .doc("img41")
  .onSnapshot(async (imgDoc) => {
    // var dbref = db.collection('Customers');
    $("#img4Main").empty();
    docData = imgDoc.data();
    document.getElementById("img4Main").innerHTML =
      `
        <div class="col-md-7 col-7">
        <div class="aside" style="margin-left: 13%; margin-top: 7%;">
          <h3 style="color:#fff; font-weight: 700; font-size: 28px; line-height: 1.5rem;">` +
      docData.title +
      `</h3>
         
          <p style="color:#fff; font-size: 17px; margin-top: 9%;">Magnificent Gift For Loved Ones </p>
          <a href="./Products/products.html">
            <button type="button" class="btn btn-light wewre" style="font-size: 15px;
              font-weight: 700; margin-top: 5px;">Shop Now &nbsp; &nbsp; <i class="fa fa-angle-right"
                aria-hidden="true"></i></button>
          </a>
        </div>
      </div>
      <div class="col-md-5 col-5" style="background: #fff; padding-top: 13px; padding-bottom: 13px;height:200px">
        <img  src="` +
      docData.mainImg.imgUrl +
      `">
      </div>
        `;

    document.getElementById("img42Mainmob").innerHTML =
      `
 
        <div class="bannerMainImage col-md-5 col-5"
          style="background: #fff; padding-top: 2px; padding-bottom: 15px; height: 215px;">
          <img style="width: 100px; height:100px ; object-fit: contain;margin-left:auto;margin-right:auto;display:block" class="mt-3 mb-2" src="` +
      docData.mainImg.imgUrl +
      `">
        </div>
        <div class="col-md-7 col-7">
          <div class="aside " style="margin-left: 10%; margin-top: 7%;">
            <h3 style="color:#fff; font-weight: 700; font-size: 28px; line-height: 1.5rem;">` +
      docData.title +
      `</h3>
           
            <p style="color:#fff; font-size: 17px; margin-top: 9%;">Magnificent Gift For Loved Ones </p>
            <a href="./Products/products.html">
              <button type="button" class="btn btn-light" style="font-size: 15px;
                    font-weight: 700; margin-top: 5px;margin-bottom:2%">Shop Now &nbsp; &nbsp; <i class="fa fa-angle-right"
                  aria-hidden="true"></i></button>
            </a>
          </div>
        </div>
    
     `;
    $("#img41").empty();
    for (let i of docData.subImgs) {
      document.getElementById("img41").innerHTML +=
        `
          <div class=" col s2 "
          style=" background-color:white;width: 18%;margin-right:-13px;margin-left:2%;;padding: 1% 1%  0.5%  1%;">
          
          <a href="./Products/products.html?cat=${i.cat.split("__")[0]}&&sub=${i.subCat.split("__")[0]}&&child=${i.childCat.split("__")[0]}" style="position: relative;display: block;">
            <picture>
              <img class="responsive-img lazyloaded"
                src="` +
        i.imgUrl +
        `"
                >
            </picture>
          </a>
        </div>
          `;
      document.getElementById("img42mob").innerHTML +=
        `
          <div class=" col s2 "
          style=" background-color:white;width: 18%;margin-right:-13px;margin-left:2%;;padding: 1% 1%  0.5%  1%;">
          
          <a href="./Products/products.html?cat=${i.cat.split("__")[0]}&&sub=${i.subCat.split("__")[0]}&&child=${i.childCat.split("__")[0]}" style="position: relative;display: block;">
            <picture>
              <img class="responsive-img lazyloaded"
                src="` +
        i.imgUrl +
        `"
                >
            </picture>
  
            
          </a>
        </div>
          `;
    }
  });

// fixed img 42
db.collection("sections")
  .doc("img42")
  .onSnapshot(async (imgDoc) => {
    // var dbref = db.collection('Customers');
    $("#img42Main").empty();
    docData = imgDoc.data();
    document.getElementById("img42Main").innerHTML =
      `
 
    <div class="bannerMainImage col-md-5 col-5"
      style="background: #fff; padding-top: 2px; padding-bottom: 15px; height: 215px;">
      <img  class="mt-3 mb-2 resImg" src="` +
      docData.mainImg.imgUrl +
      `">
    </div>
    <div class="col-md-7 col-7">
      <div class="aside " style="margin-left: 10%; margin-top: 7%;">
        <h3 style="color:#000; font-weight: 700; font-size: 28px; line-height: 1.5rem;">` +
      docData.title +
      `</h3>
       
        <p style="color:#000; font-size: 17px; margin-top: 9%;">Magnificent Gift For Family </p>
        <a href="./Products/products.html">
          <button type="button" class="btn btn-light" style="font-size: 15px;
                font-weight: 700; margin-top: 5px; margin-bottom:2%">Shop Now &nbsp; &nbsp; <i class="fa fa-angle-right"
              aria-hidden="true"></i></button>
        </a>
      </div>
    </div>
 `;

    $("#img42").empty();

    for (let i of docData.subImgs) {
      document.getElementById("img42").innerHTML +=
        `
          <div class=" col s2 "
          style=" background-color:white;width: 18%;margin-right:-13px;margin-left:2%;;padding: 1% 1%  0.5%  1%;">
          
          <a href="./Products/products.html?cat=${i.cat.split("__")[0]}&&sub=${i.subCat.split("__")[0]}&&child=${i.childCat.split("__")[0]}" style="position: relative;display: block;">
            <picture>
            
              <img class="responsive-img lazyloaded"
                src="` +
        i.imgUrl +
        `"
                >
            </picture>
  

          </a>
        </div>
          `;
    }
  });

// fixed img 31
db.collection("sections")
  .doc("img31")
  .onSnapshot(async (imgDoc) => {
    docData = imgDoc.data();

    document.getElementById("speed").innerHTML = docData.title;
    for (let i of docData.subImgs) {
      document.getElementById("img31").innerHTML +=
        `
      <div class=" col s2 "
      style=" background-color:white;width: 18%;margin-right:-13px;margin-left:2%;;padding: 1% 1%  0.5%  1%;">
      
      <a href="./Products/products.html?cat=${i.cat.split("__")[0]}&&sub=${i.subCat.split('__')[0]}&&child=${i.childCat.split('__')[0]}       
        " style="position: relative;display: block;">
        <picture>
          <img class="responsive-imgSpeed lazyloaded" style="width:300px;  ;object-fit:cover"
            src="` +
        i.imgUrl +
        `"
            >
        </picture>

      
      </a>
    </div>
      `;
    }
  });

// //////////////////////////////////////////////////////////////////////////////////////////////////////
// section 10

const fixedSection10Heading = document.querySelector(
  "#fixed-section10-heading"
);
const fixedSection10Row = document.querySelector("#fixed-section10-row");
const fixedSection10ViewAll = document.querySelector(
  "#fixed-section10-viewAll"
);
const fixedSection10ViewAllMob = document.querySelector(
  "#fixed-section10-viewAllMob"
);

db.collection("sections")
  .doc("fixed10")
  .onSnapshot(async (doc) => {
    let docData = doc.data();
    let row = "";
    fixedSection10Heading.innerHTML = docData.title;
    let t;
    for (let card of docData.prodIds) {
      // console.log(card);
      // await db
      //   .collection(card.cat.split("__")[0])
      //   .doc(card.id)
      //   .get()
      //   .then((prod) => {
      //     let prodData = prod.data();
      if (card.id === "na") {
        continue;
      } else {
        // console.log(prodData);
        // console.log(prodData.wholeCategory.split("__")[0]);
        t = card.cat.split("__")[0];
        let mrp = Math.round(+card.mrp + +card.mrp * (+card.gst / 100));
        // console.log(card.totalPrice);
        let dis = 100 - (+card.totalPrice / mrp) * 100;
        dis = Math.round(dis);
        row += `
          <div class="col-lg-2 col-md-3 col-6 remove-padding">
          <a href="./Product/product.html?prod=${card.id}&&cat=${t}">
            <div class="item">
              <div class="item-img">
                <img class="img-fluid" src="${card.mainImgUrl}">
              </div>
                <div class="info">
                  <div class="stars">
                  </div>
                  <h4 class="price">₹${card.totalPrice} <del><small>₹${mrp}</small></del>&nbsp;<small style="color:green">(${dis}% off)</small></h4>
                  <h5 class="name">${card.name}</h5>
                </div>
            </div>
            </a>
          </div>
          `;
      }
      // });
    }
    fixedSection10ViewAll.href = `./Products/products.html?cat=${t}`;
    fixedSection10ViewAllMob.href = `./Products/products.html?cat=${t}`;
    fixedSection10Row.innerHTML = row;
  });

// ////////////////////////////////////////////////////////////////////////////////////////////////////////////

// storing products in local storage

let LOC = {};
let AllProds = [];
let AllLocCats = [];
db.collection("categories").onSnapshot(async (catSnaps) => {
  let catSnapsDocs = catSnaps.docs;
  for (let catDoc of catSnapsDocs) {
    let catData = catDoc.data();
    AllLocCats.push({id: catDoc.id, data: catData});
    await db
      .collection(catDoc.id)
      .get()
      .then((prodSnaps) => {
        let prodSnapsDocs = prodSnaps.docs;
        prodSnapsDocs.map((pDoc) => {
          let pData = pDoc.data();
          AllProds.push({
            prodId: pDoc.id,
            prodData: {
              cat: catData.name,
              name: pData.name,
              totalPrice: pData.totalPrice,
              mrp: pData.mrp,
              gst: pData.gst,
              mainImgUrl: pData.mainImgUrl,
              stars: pData.stars,
              bannerType: pData.bannerType,
              bannerTypeColorEnd: pData.bannerTypeColorEnd,
              bannerTypeColorStart: pData.bannerTypeColorStart,
              catId: pData.wholeCategory.split('__')[0],
              subcatId: pData.wholeSubCategory.split('__')[1],
              childcatId: pData.wholeChildCategory.split('__')[2],
            },
            catId: catDoc.id,
          });
        });
        // console.log(catDoc.id);
      });
  }
  localStorage.setItem("locProds", JSON.stringify(AllProds));
  localStorage.setItem("locCats", JSON.stringify(AllLocCats));
});


// /////////////////////////////////////////////////////////////////////////////////////////////////

let visiteRef = db.collection('miscellaneous').doc('visitors');
visiteRef.get().then(visitorsDoc => {
  let visitorsDocData = visitorsDoc.data();
  // console.log(visitorsDocData);
  let locVisit = JSON.parse(window.localStorage.getItem('locVisit'));
  // console.log(locVisit);
  if(locVisit) {
    let initialDate = new Date(locVisit.time);
    // console.log(initialDate);
    let currectDate = new Date();
    // console.log(currectDate);
    // let diffTime = (currectDate - new Date(initialDate))
    // console.log(diffTime);
    let expectTime = (initialDate.getTime() + (60*60*1000))
    // console.log(expectTime);
    if(currectDate >= expectTime) {
      visitorsDocData.count++;
      let data = {
        time: new Date()
      }
      window.localStorage.setItem('locVisit', JSON.stringify(data));
      visiteRef.update('count', visitorsDocData.count);
    }
  } else {
    let data = {
      time: new Date()
    }
    visitorsDocData.count++;
    window.localStorage.setItem('locVisit', JSON.stringify(data));
    visiteRef.update('count', visitorsDocData.count);
  }
})


//////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////





// console.log("navbar1.js");

const wholeNavigationPcHTML = document.querySelector("#whole-navigation-pc");

const extractChildCat = (data, subId, docId) => {
  let childLi = "";
  data.childCategories.map((doc) => {
    // let docData = doc.data();
    childLi += `
      <li><a href="./Products/products.html?cat=${docId}&&sub=${subId}&&child=${doc.id}">${doc.name}</a></li>
    `;
  });
  // console.log(childLi);
  return childLi;
};

const extractSubCat = (data, docId) => {
  let subLi = "";
  data.subCategory.map((doc) => {
    // let docData = doc.data();
    let childCat = extractChildCat(doc, doc.id, docId);

    subLi += `
    <li >
      <a style="top:0;padding:5px !important;position:sticky;z-index:999 !important;background:white !important" href="./Products/products.html?cat=${docId}&&sub=${doc.id}">${doc.name}</a>
      <ul style="z-index:0 !important" > ${childCat}</ul>
    </li>
    `;
  });
  return subLi;
};

db.collection("categories").onSnapshot(async (snapshots) => {
  let snapshotDocs = snapshots.docs;
  let li = "";
  let liMob = "";
  let tempArr = [];
  for (let doc of snapshotDocs) {
    let docData = doc.data();
    // console.log(docData);
    tempArr.push({ d: docData, dId: doc.id });
  }

  tempArr.sort(function (a, b) {
    return +b.d.priority - +a.d.priority;
  });

  for (let data of tempArr) {
    // console.log(data);
    let subCat = extractSubCat(data.d, data.dId);
    li += `
      <li >
        <a href="./Products/products.html?cat=${data.dId}">${data.d.name}</a>
        <ul>
          ${subCat}
          <li>
            <ul>
              <li><img class="navimage" src="${data.d.imgUrl}"></li>
            </ul>
          </li>
        </ul>
      </li>
      `;
    liMob += `
      <li >
        <a href="#!" ><span onclick="navigateTo('./Products/products.html?cat=${data.dId}')">${data.d.name}</span><i class="fa fa-chevron-down" style="margin-left: 10%;float: right;"></i></a>
        <ul>
          ${subCat}
          <li>
            <ul>
              <li><img class="navimage" src="${data.d.imgUrl}"></li>
            </ul>
          </li>
        </ul>
      </li>`;
  }
  const wholeNavigationPcHTML = document.querySelector("#whole-navigation-pc");
  wholeNavigationPcHTML.innerHTML = li;
  const wholeNavigationMobile = document.querySelector(
    "#whole-navigation-mobile"
  );
  wholeNavigationMobile.innerHTML = liMob;
  $(".menu > ul > li").hover(function (e) {
    if ($(window).width() > 943) {
      $(this).children("ul").stop(true, false).fadeToggle(150);
      e.preventDefault();
    }
  });
  $(".menu > ul > li").click(function () {
    if ($(window).width() <= 943) {
      $(this).children("ul").fadeToggle(150);
    }
  });
  $(".menu-mobile").click(function (e) {
    $(".menu > ul").toggleClass("show-on-mobile");
    e.preventDefault();
  });

  $(window).resize(function () {
    $(".menu > ul > li").children("ul").hide();
    $(".menu > ul").removeClass("show-on-mobile");
  });
});
function navigateTo(location) {
  window.location = location;
}



// When the button is clicked, run our ScrolltoTop function above!
// scrollToTopButton.onclick = function(e) {
//   e.preventDefault();
//   scrollToTop();
// }
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// WITH DROP DOWN

// let allSearchList;
// let searchResults = [];
// db.collection('miscellaneous').doc('searchList').get().then(doc => {
//   let docData = doc.data();
//   allSearchList = docData.Details;

//   for (let i of allSearchList) {

//     searchResults.push(i.Name);

//   }

//   autocomplete(document.getElementById("searchBar"), searchResults);

// })

// const searchProd = (e, current) => {
//   if (e.keyCode === 13) {

//     window.location.href = `/Products/products.html?user=${current}`;
//   } else {

//     window.location.href = `/Products/products.html?user=${current}`;
//   }
// }

// function searchIfvalue(e) {

//   if (e.key == "Enter") {
//     window.location.href = `/Products/products.html?user=${e.target.value}`;
//   }
// }
// function searchByBtn(id) {

//   let val = document.querySelector("#" + id).value;

//   window.location.href = `/Products/products.html?user=${val}`;
//   // if(e.key=="Enter"){
//   //   window.location.href = `/Products/products.html?user=${e.target.value}`;
//   // }
// }
// function autocomplete(inp, arr) {

//   /*the autocomplete function takes two arguments,
//   the text field element and an array of possible autocompleted values:*/
//   var currentFocus;
//   /*execute a function when someone writes in the text field:*/
//   inp.addEventListener("input", function (e) {
//     var a, b, i, val = this.value;
//     /*close any already open lists of autocompleted values*/
//     closeAllLists();
//     if (!val) { return false; }
//     currentFocus = -1;
//     /*create a DIV element that will contain the items (values):*/
//     a = document.createElement("DIV");
//     a.setAttribute("id", this.id + "autocomplete-list");
//     a.setAttribute("class", "autocomplete-items");
//     /*append the DIV element as a child of the autocomplete container:*/
//     this.parentNode.appendChild(a);
//     let count = 0;
//     /*for each item in the array...*/
//     for (i = 0; i < arr.length; i++) {
//       /*check if the item starts with the same letters as the text field value:*/
//       if (arr[i].toUpperCase().includes(val.toUpperCase()) || arr[i].toUpperCase().startsWith(val.toUpperCase()) || arr[i].endsWith(val.toUpperCase())) {
//         count++;
//         if (count >= 8) {
//           break;
//         }
//         /*create a DIV element for each matching element:*/
//         b = document.createElement("DIV");
//         /*make the matching letters bold:*/
//         b.innerHTML = "<strong>" + arr[i].substr(0, val.length) + "</strong>";
//         b.innerHTML += arr[i].substr(val.length);
//         b.innerHTML += "&nbsp;&nbsp;<i class='fa fa-search'></i>"
//         /*insert a input field that will hold the current array item's value:*/
//         b.innerHTML += "<input type='hidden' value='" + arr[i] + "'>";
//         /*execute a function when someone clicks on the item value (DIV element):*/
//         b.addEventListener("click", function (e) {
//           /*insert the value for the autocomplete text field:*/
//           inp.value = this.getElementsByTagName("input")[0].value;
//           /*close the list of autocompleted values,
//           (or any other open lists of autocompleted values:*/
//           searchProd(inp, inp.value)
//           closeAllLists();

//         });
//         a.appendChild(b);

//       }
//     }
//   });

//   /*execute a function presses a key on the keyboard:*/
//   inp.addEventListener("keydown", function (e) {
//     var x = document.getElementById(this.id + "autocomplete-list");
//     if (x) x = x.getElementsByTagName("div");
//     if (e.keyCode == 40) {
//       /*If the arrow DOWN key is pressed,
//       increase the currentFocus variable:*/
//       currentFocus++;
//       /*and and make the current item more visible:*/
//       addActive(x);
//     } else if (e.keyCode == 38) { //up
//       /*If the arrow UP key is pressed,
//       decrease the currentFocus variable:*/
//       currentFocus--;
//       /*and and make the current item more visible:*/
//       addActive(x);
//     } else if (e.keyCode == 13) {
//       /*If the ENTER key is pressed, prevent the form from being submitted,*/
//       e.preventDefault();
//       if (currentFocus > -1) {
//         /*and simulate a click on the "active" item:*/
//         if (x) x[currentFocus].click();
//       }
//     }
//   });
//   function addActive(x) {
//     /*a function to classify an item as "active":*/
//     if (!x) return false;
//     /*start by removing the "active" class on all items:*/
//     removeActive(x);
//     if (currentFocus >= x.length) currentFocus = 0;
//     if (currentFocus < 0) currentFocus = (x.length - 1);
//     /*add class "autocomplete-active":*/
//     x[currentFocus].classList.add("autocomplete-active");
//   }
//   function removeActive(x) {
//     /*a function to remove the "active" class from all autocomplete items:*/
//     for (var i = 0; i < x.length; i++) {
//       x[i].classList.remove("autocomplete-active");
//     }
//   }
//   function closeAllLists(elmnt) {
//     /*close all autocomplete lists in the document,
//     except the one passed as an argument:*/
//     var x = document.getElementsByClassName("autocomplete-items");
//     for (var i = 0; i < x.length; i++) {
//       if (elmnt != x[i] && elmnt != inp) {
//         x[i].parentNode.removeChild(x[i]);
//       }
//     }
//   }
//   /*execute a function when someone clicks in the document:*/
//   document.addEventListener("click", function (e) {
//     closeAllLists(e.target);
//   });
// }

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// const preventReload = (e) => {
//   if(e.keyCode === 'Enter') {
//     e.preventDefault();
//   }
//   console.log(e.key);
// }

{
  /* <div class="extra-list">
  <ul>
    <li>
      <span rel-toggle="tooltip" title="LAKE OF CAKES" style="cursor: pointer;"  onclick="easyAddToCart(event)">
        <i class="fa fa-shopping-cart"></i>
      </span>
    </li>
  </ul>
</div> */
}

//////////////////////////////////////////////////////////////////////////////////////////////////

const easyAddToCart = () => {
  // console.log('addToCart');
};

let cartModalHTML = document.querySelector("#cart-modal");
let flag = 0;
let cartModalProds = "";
if (localStorage.getItem("locLoggedInUser")) {
  // let a = localStorage.getItem("locLoggedInUser")
  let uId = localStorage.getItem("locLoggedInUser");
  db.collection("Customers")
    .doc(uId)
    .onSnapshot(async (userDoc) => {
      if (userDoc.exists) {
        let userData = userDoc.data();
        // console.log(userData);
        if (userData.cart) {
          flag = 1;
          var cartSize = userData.cart.length;
          // console.log(cartSize);
          cartModalProds = `
          <a href="#cart" class="cart carticon">
            <div class="icon" onclick="redirectToCart()">
              <i onclick="redirectToCart()" class="fa fa-shopping-cart"></i>
              <span onclick="redirectToCart()" class="cart-quantity" id="cart-count">${cartSize}</span>
            </div>
          </a>
          <div class="my-dropdown-menu" id="cart-items" style="max-height:500px;overflow-y:scroll;width:350px">
          <h5 style="padding:10px;font-weight:700;font-size:13px;">${cartSize} Items In Your Bag</h5>
          `;
          for (cartProd of userData.cart) {
            // console.log(cartProd);
            await db
              .collection(cartProd.cat)
              .doc(cartProd.prodId)
              .get()
              .then((pDoc) => {
                let pData = pDoc.data();
                if (pData) {
                  cartModalProds += `
                <div class="dropdownmenu-wrapper">
                <ul class="dropdown-cart-products">
                  <li class="product cremove3461">
                    <figure class="product-image-container">
                      <a href="./UserDash/cart.html" class="product-image">
                        <img src="${pData.mainImgUrl}"
                          style="width: 70px; object-fit:cover;" alt="Lake of Cakes">
                      </a>
                    </figure>
                    <div class="product-details">
                      <div class="co">
                        <a href="#!">
                          <h4 class="product-title" style="text-align:left;padding:5px;font-size:14px !important;margin-left:10% !important;width:200px">${pData.name}</h4>
                        </a>
                        <span class="cart-product-info">
                          <span class="cart-product-qty" id="cqt3461"><span style="margin-left:11%;font-size:12px">Qty - </span>${cartProd.qty}</span>
                      </div>
                    </div>
                  </li>
                </ul>
                </div>


              
               
              
                `
                
                ;
                }
              });
          }
          cartModalProds += `
      <div onclick="redirectToCart()" class="dropdown-cart-action" style="padding:15px !important">
            <a  onclick="redirectToCart()" class="mybtn1" style=";margin-left:auto;margin-right:auto;cursor:pointer">View In Cart</a>
          </div>
        </div>
      </div>
      `;
        }
        cartModalHTML.innerHTML = cartModalProds;
      }
    });
}

if (flag === 0) {
  cartModalProds = `
  <a href="#cart" class="cart carticon">
    <div class="icon" onclick="redirectToCart()">
      <i onclick="redirectToCart()" class="fa fa-shopping-cart"></i>
      <span onclick="redirectToCart()" class="cart-quantity" id="cart-count">0</span>
    </div>
  </a>
  <div class="my-dropdown-menu" id="cart-items">
  `;

  cartModalHTML.innerHTML = cartModalProds;
}

// serachbar

const searchByUserInput = (e) => {
  e.preventDefault();

  let val = document.querySelector("#searchBar").value;
  // console.log(val);
  if (e.keyCode === 13) {
    // console.log('enter');
    window.location.href = `/Products/products.html?user=${val}`;
  }
};

const disableEnterKey = (e) => {
  console.log(e.keyCode);
  if (e.keyCode === 13) {
    e.preventDefault();
  }
};

const searchByUserInputBtn = (event) => {
  event.preventDefault();
  let val = document.querySelector("#searchBar").value;
  console.log(val);
  window.location.href = `/Products/products.html?user=${val}`;
};
var checkUser2 = window.localStorage.getItem("locLoggedInUser");

if (checkUser2 && checkUser2 != "null") {
  document.getElementById("logoutMobile").style.display = "block";
  document.getElementById("loginMobile").style.display = "none";
} else {
  document.getElementById("logoutMobile").style.display = "none";
  document.getElementById("loginMobile").style.display = "block";
}



// ////////////////////////////////////////////////////////////////////////////////////////////////////
// top alert bar

db.collection('miscellaneous').doc('siteStatus').onSnapshot(siteDoc => {
  let siteData = siteDoc.data();
  // console.log(siteData);
  if(!siteData.status) {
    document.querySelector('#top-alert').innerHTML = `
    <section class="top-header top-nav" style="background: red; display: flex; justify-content: center; text-align: center;">
    <b style="color: white"> ${siteData.note} <b>    
    </section>
    `;
  } else {
    document.querySelector('#top-alert').innerHTML = `
    <section class="top-header top-nav" style="background: #f1f1f1;">
        <div class="container-fluid remove-padding topnaves"
          style="background: #f1f1f1;;
      background-size: 617px; background-image: url();height: 28px !important;padding: 0px !important;margin-bottom: 0.3%;">
          <div class="container topcnt">
            <div class="row" style="justify-content: flex-end;">
              <div class="">
                <div class="content">
                  <div class="left-content">
                  </div>
                  <div class="right-content">
                    <div class="list" style="padding: 6px 10px 100px;">
                      <ul style="padding-right: 10px;">
                        <li>
                          <a type="button" data-toggle="modal" data-target="#topoffer" style=" position: relative;">
                            <span class="sign-in" data-toggle="modal" data-target="#modalYT"
                              style="font-size: 14px; color: rgb(10, 10, 10);">
                              <i style="color: red !important;" class="fa fa-gift" aria-hidden="true"></i> OFFER</span>
                          </a>
                        </li> &nbsp; |

                        <li><a href="./Common/coupans.html" class="track-btn"><span class="sign-in" style="font-size: 14px; color: #000;"><i
                                class="fa fa-gift" aria-hidden="true" style="color: red;"></i>
                              COUPONS</span> </a>
                        </li> &nbsp; |
                        <li><a href="tel:9598891097" class="track-btn"><span class="sign-in"
                              style="font-size: 14px; color: #000;"><i class="fa fa-phone" aria-hidden="true"
                                style="color: red;"></i>
                              9598891097</span> </a>
                        </li> &nbsp; |
                        <li><a href="mailto:lakeofcakess@gmail.com" class="track-btn"><span class="sign-in"
                              style="font-size: 14px; color: #000;"><i class="fa fa-envelope" aria-hidden="true"
                                style="color: red;"></i>
                              Email</span> </a>
                        </li> &nbsp;
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    `;
  }
})