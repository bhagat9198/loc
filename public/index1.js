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
            <a class="banner-effect imgca" href="./Products/products.html?cat=${docData[card].cat.split('__')[1]}&&tag=${docData[card].tag}" target="_blank">
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
const fixedSection2Row = document.querySelector('#fixed-section2-row');
db.collection('sections').doc('fixed2').onSnapshot(doc => {
  let docData = doc.data();
  let sortArr = [];
  // console.log(docData);
  for(let card in docData) {
    // console.log(card);
    if(card === 'title') continue;
    sortArr.push(card);
  }   
  sortArr.map((el, index) => {
    for(let i = 0; i < (sortArr.length - index -1); i++ ) {
      if(sortArr[i] === 'title') {
        continue;
      }
      if(docData[sortArr[i]].priority > docData[sortArr[i+1]].priority) {
        let temp = sortArr[i];
        sortArr[i] = sortArr[i+1];
        sortArr[i+1] = temp;
      }
    }
  })

  let row = '';
  for(let card of sortArr) {
    row += `
    <div class="sc-common-padding colxl2">
      <div class="card cardc align-items-center">
        <a href="./Products/products.html?cat=${docData[card].cat.split('__')[1]}&&tag=${card.tag}" class="">
          <div class="iconimg">
            <img class="comimg" src="${docData[card].imgUrl}"
              class="card-img-top img-fluid" alt="...">
          </div>
          <div class="card-body cbc text-center">
            <h5 class="card-title" style="font-family: cursive; font-size: 15px;">${docData[card].cat.split('__')[1]}</h5>
          </div>
        </a>
      </div>
    </div>
    `;
  }
  fixedSection2Row.innerHTML = row;
});


// fixed section 3
const fixedSection3Row = document.querySelector('#fixed-section3-row');

db.collection('sections').doc('fixed3').onSnapshot(doc => {
  let docData = doc.data();
  let row = '';
  let title;
  for(let card in docData) {
    if(card === 'title') {
      title = `
      <div class="col-md-12 text-center">
        <h3 class="mb-3 bannerheading" id="fixed-section3-heading" style="font-weight: 700;font-size: 30px">${docData[card]}</h3>
      </div>
      `;
    } else {
      row += `
      <div class="col-lg-3 col-md-3 col-6 remove-padding mt-3">
        <div class="aside">
          <a href="./Products/products.html?cat=${docData[card].cat.split('__')[1]}&&tag=${docData[card].tag}" class="banner-effect imgca" href="bbb" target="_blank">
            <img class="imgc" src="${docData[card].imgUrl}" alt="">
          </a>
        </div>
      </div>
      `;
    }
  }
  fixedSection3Row.innerHTML = title + row;

})


// fixed section 4

const fixedSection4Row = document.querySelector('#fixed-section4-row');
const fixedSection4Heading = document.querySelector('#fixed-section4-heading');

db.collection('sections').doc('fixed4').onSnapshot(async(doc) => {
  let docData = doc.data();
  let row = '';
  for(let card of docData.prodIds) {
    if(card === 'title') {
      fixedSection4Heading.innerHTML = docData[card];
    } else {
      console.log(card);
      console.log(card.cat.slice('__')[1]);
      await db.collection(card.cat.slice('__')[1]).doc(card.id).onSnapshot(prod => {
        let prodData = prod.data();
        row += `
        <a href="./Product/product/${prod.id}" class="item">
          <div class="item-img">
            <div class="extra-list">
              <ul>
                <li>
                  <span rel-toggle="tooltip" title="Add To Wishlist" data-toggle="modal" id="wish-btn"
                    data-target="#comment-log-reg" data-placement="right">
                    <i class="icofont-heart-alt"></i>
                  </span>
                </li>
              </ul>
            </div>
            <img class="img-fluid" src="https://encrypted-tbn0.gstatic.com/images?q=tbn%3AANd9GcQqkxcVr3IEnPFtPwhhOKPXzdasPNsA_7K-6bkX5OnskTe3fsnQadQapn0Auw&usqp=CAc" >
          </div>
          <div class="info">
            <div class="stars">
              <h5 class="contactless"> Contactless delivery</h5>
            </div>
            <h4 class="price">₹${prodData.totalPrice} <del><small>₹${prodData.mrp}</small></del></h4>
            <h5 class="name">${prodData.name}</h5>
            <div class="item-cart-area">
              <span class="add-to-cart-quick add-to-cart-btn" onclick="addToCart(event)">
                <i class="icofont-cart"></i> Order Now
              </span>
            </div>
          </div>
        </a>
        `;
      })
    }
  }
  fixedSection4Row.innerHTML = row;
})

const addToCart = e => {
  console.log('Added To Cart');
}
