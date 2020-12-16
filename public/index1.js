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
    // console.log(docData);
    if (docData.isActivated == 'true') {
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
  let w = document.getElementById("img-slider").clientWidth;
  console.log(w);
  // let h = document.getElementById('img-slider').offsetHeight;
  // console.log(h);
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
      let docRef = db
        .collection(card.cat.toString().split("__")[0])
        .doc(card.id.toString());
      await docRef.get().then((prod) => {
        let prodData = prod.data();
        if (!prodData) {
          return;
        }
        let dis = 100 - (+prodData.totalPrice / +prodData.mrp) * 100;
        dis = Math.round(dis);

        row += `
          <a href="./Product/product.html?prod=${prod.id}&&cat=${
          prodData.wholeCategory.split("__")[0]
        }" class="item">
            <div class="item-img">
              <img class="img-fluid" src="${prodData.mainImgUrl}" >
            </div>
            
              <div class="info">
                <div class="stars">
                  <h5 class="contactless"> </h5>
                </div>
                <h4 class="price">₹${prodData.totalPrice} <del><small>₹${
          prodData.mrp
        }</small></del><small style="color:green">&nbsp;(${dis}% OFF)</small></h4>
                <h5 class="name">${prodData.name}</h5>
              </div>
          
          </div>
          </a>
      
          `;
      });
      // }
    }
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
const fixedSection6ViewAllMob = document.querySelector("#fixed-section6-viewAllMob");


db.collection("sections")
  .doc("fixed6")
  .onSnapshot(async (doc) => {
    let docData = doc.data();
    let row = "";
    fixedSection6Heading.innerHTML = docData.title;
    let t;
    for (let card of docData.prodIds) {
      await db
        .collection(card.cat.split("__")[0])
        .doc(card.id)
        .get()
        .then((prod) => {
          let prodData = prod.data();
          if (!prodData) {
            return;
          }
          // console.log(prodData);
          // console.log(prodData.wholeCategory.split("__")[0]);
          t = prodData.wholeCategory.split("__")[0];
          let dis = 100 - (+prodData.totalPrice / +prodData.mrp) * 100;
          dis = Math.round(dis);
          row += `
          <div class="col-lg-2 col-md-3 col-6 remove-padding">
          <a href="./Product/product.html?prod=${prod.id}&&cat=${t}">
            <div class="item">
              <div class="item-img">
                <img class="img-fluid" src="${prodData.mainImgUrl}">
              </div>
                <div class="info">
                  <div class="stars">
                  </div>
                  <h4 class="price">₹${prodData.totalPrice} <small><del>₹${prodData.mrp}</del><span style="color: green"> (${dis}%OFF)</span></small></h4>
                  <h5 class="name">${prodData.name}</h5>
                </div>
            </div>
            </a>
          </div>
          
          `;
        });
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
const fixedSection7ViewAllMob = document.querySelector("#fixed-section7-viewAllMob");

db.collection("sections")
  .doc("fixed7")
  .onSnapshot(async (doc) => {
    let docData = doc.data();
    let row = "";
    fixedSection7Heading.innerHTML = docData.title;
    let t;
    for (let card of docData.prodIds) {
      // console.log(card.cat.split('__')[1], card.id);
      await db
        .collection(card.cat.split("__")[0])
        .doc(card.id)
        .get()
        .then((prod) => {
          let prodData = prod.data();
          if (!prodData) {
            return;
          }
          t = prodData.wholeCategory.split("__")[0];
          let dis = 100 - (+prodData.totalPrice / +prodData.mrp) * 100;
          dis = Math.round(dis);
          row += `
          <div class="col-lg-2 col-md-3 col-6 remove-padding">
          <a href="./Product/product.html?prod=${prod.id}&&cat=${t}">
          <div class="item" >
            <div class="item-img">
              <img class="img-fluid" src="${prodData.mainImgUrl}">
            </div>
              <div class="info">
                <div class="stars"></div>
                <h4 class="price">₹${prodData.totalPrice} <small><del>₹${prodData.mrp}</del><span style="color: green"> (${dis}%OFF)</span></small></h4>
                <h5 class="name">${prodData.name}</h5>
              </div>
          </div>
          </a>
        </div>
        `;
        });
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
          <a href="./Products/products.html?cat=` +
      docData.mainImg.cat.split("__")[0] +
      `">
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
            <a href="./Products/products.html?cat=` +
      docData.mainImg.cat.split("__")[0] +
      `">
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
          
          <a href="./Products/products.html?cat=` +
        i.cat.split("__")[0] +
        `" style="position: relative;display: block;">
            <picture>
              <img class="responsive-img lazyloaded"
                src="` +
        i.imgUrl +
        `"
                >
            </picture>
  
            <div class="grow" style="position: absolute;bottom:2%;left: 0; right:0; text-align: center;">
              <div class="bannerTxt"
                style="background-color: white;color: #003961;padding: 5px 40px;font-size: 17px; display: inline-block;">
                ` +
        i.tag +
        `
              </div> 
            </div>
          </a>
        </div>
          `;
      document.getElementById("img42mob").innerHTML +=
        `
          <div class=" col s2 "
          style=" background-color:white;width: 18%;margin-right:-13px;margin-left:2%;;padding: 1% 1%  0.5%  1%;">
          
          <a href="./Products/products.html?cat=` +
        i.cat.split("__")[0] +
        `" style="position: relative;display: block;">
            <picture>
              <img class="responsive-img lazyloaded"
                src="` +
        i.imgUrl +
        `"
                >
            </picture>
  
            <div class="grow" style="position: absolute;bottom:2%;left: 0; right:0; text-align: center;">
              <div class="bannerTxt"
                style="background-color: white;color: #003961;padding: 5px 40px;font-size: 17px; display: inline-block;">
                ` +
        i.tag +
        `
              </div>
            </div>
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
        <a href="./Products/products.html?cat=` +
      docData.mainImg.cat.split("__")[0] +
      `">
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
          
          <a href="./Products/products.html?cat=` +
        i.cat.split("__")[0] +
        `" style="position: relative;display: block;">
            <picture>
            
              <img class="responsive-img lazyloaded"
                src="` +
        i.imgUrl +
        `"
                >
            </picture>
  
            <div class="grow" style="position: absolute;bottom:2%;left: 0; right:0; text-align: center;">
              <div class="bannerTxt"
                style="background-color: white;color: #003961;padding: 5px 40px;font-size: 17px; display: inline-block;">
                ` +
        i.tag +
        `
              </div>
            </div>
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
      
      <a href="./Products/products.html?cat=` +
        i.cat.split("__")[0] +
        `" style="position: relative;display: block;">
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
      await db
        .collection(card.cat.split("__")[0])
        .doc(card.id)
        .get()
        .then((prod) => {
          let prodData = prod.data();
          if (!prodData) {
            return;
          }
          // console.log(prodData);
          // console.log(prodData.wholeCategory.split("__")[0]);
          t = prodData.wholeCategory.split("__")[0];
          let dis = 100 - (+prodData.totalPrice / +prodData.mrp) * 100;
          dis = Math.random(dis);
          row += `
          <div class="col-lg-2 col-md-3 col-6 remove-padding">
          <a href="./Product/product.html?prod=${prod.id}&&cat=${t}">
            <div class="item">
              <div class="item-img">
                <img class="img-fluid" src="${prodData.mainImgUrl}">
              </div>
              
                <div class="info">
                  <div class="stars">
                  </div>
                  <h4 class="price">₹${prodData.totalPrice} <del><small>₹${prodData.mrp}</small></del>&nbsp;<small style="color:green">(30% off)</small></h4>
                  <h5 class="name">${prodData.name}</h5>
                </div>
             
            </div>
            </a>
          </div>
          `;
        });
    }
    fixedSection10ViewAll.href = `./Products/products.html?cat=${t}`;
    fixedSection10ViewAllMob.href = `./Products/products.html?cat=${t}`;
    fixedSection10Row.innerHTML = row;
  });

// ////////////////////////////////////////////////////////////////////////////////////////////////////////////

// storing products in local storage

let LOC = {};
let AllProds = [];
db.collection("categories").onSnapshot(async (catSnaps) => {
  let catSnapsDocs = catSnaps.docs;

  for (let catDoc of catSnapsDocs) {
    let catData = catDoc.data();
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
              mainImgUrl: pData.mainImgUrl,
              stars: pData.stars,
              bannerType: pData.bannerType,
              bannerTypeColorEnd: pData.bannerTypeColorEnd,
              bannerTypeColorStart: pData.bannerTypeColorStart,
            },
            catId: catDoc.id,
          });
        });
        // console.log(catDoc.id);
      });
  }
  sessionStorage.setItem("locProds", JSON.stringify(AllProds));
});

