console.log("viewSection.js");

const db = firebase.firestore();
const storageService = firebase.storage();

const catInfo = [];
db.collection("categories").onSnapshot((catSnaps) => {
  let catSnapsDocs = catSnaps.docs;

  catSnapsDocs.map((doc) => {
    let docData = doc.data();
    catInfo.push({ id: doc.id, name: docData.name });
  });
  display4cards();
  display6cards();
  displayslider();
  displayimg();
  displayanimation();
});

let sectionState = (state) => {
  let options = "";
  if (state === 'true') {
    options = `
      <option selected value="true" selected>Activated</option>
      <option  value="false" >Deactivated</option>
    `;
  } else {
    options = `
    <option value="true" selected>Activated</option>
    <option selected value="false" >Deactivated</option>
    `;
  }
  return options;
};

const deleteSection = async (e) => {
  let type = e.target.dataset.type;
  let id = e.target.dataset.id;
  console.log(type, id);
  let delRef = db.collection("sections").doc(type).collection(type).doc(id);
  console.log(type);
  if (type !== "6cards" || type !== "slider") {
    await delRef.get().then(async (deldoc) => {
      let delData = deldoc.data();
      console.log(delData);
      // console.log(typeof(delData.card));
      if (type === "img") {
        await storageService
          .ref(`sections/${type}/${type}/${id}/${delData.card.img}`)
          .delete()
          .then(() => {
            console.log("img deleted");
          })
          .catch((error) => {
            console.log(error);
          });
      } else if (type === "animation") {
        await storageService
          .ref(`sections/${type}/${type}/${id}/${delData.card.animation}`)
          .delete()
          .then(() => {
            console.log("img deleted");
          })
          .catch((error) => {
            console.log(error);
          });
      } else if (type === "4cards") {
        for (let c of delData.card) {
          await storageService
            .ref(`sections/${type}/${type}/${id}/${c.img}`)
            .delete()
            .then(() => {
              console.log("img deleted");
            })
            .catch((error) => {
              console.log(error);
            });
        }
      }
    });
  }
  delRef
    .delete()
    .then(() => {
      console.log("docDeleted");
      if (type === "img") {
        displayimg();
      } else if (type === "animation") {
        displayanimation();
      } else if (type == "4cards") {
        display4cards();
      } else if (type === "6cards") {
        display6cards();
      } else if (type === "slider") {
        displayslider();
      } else {
        // invalid
      }
    })
    .catch((error) => {
      console.log(error);
    });
};

const changeStatus = (e, current) => {
  let type = e.target.dataset.type;
  let id = e.target.dataset.id;
  let val = current.value;
  console.log(type, id, val, typeof(val));
  let statusRef = db.collection("sections").doc(type).collection(type).doc(id);
  statusRef.update('activated', val).then(() => {
    if (type === "img") {
      displayimg();
    } else if (type === "animation") {
      displayanimation();
    } else if (type == "4cards") {
      display4cards();
    } else if (type === "6cards") {
      display6cards();
    } else if (type === "slider") {
      displayslider();
    } else {
      // invalid
    }
  }).catch(error => {
    console.log(error);
  })
}

// 4card
const display4cards = () => {
  let card4HTML = document.querySelector("#card4-section");
  db.collection("sections")
    .doc("4cards")
    .collection("4cards")
    .onSnapshot((card4snapshots) => {
      let card4snapshotsDocs = card4snapshots.docs;
      let wholeCard4 = "";
      for (card4Doc of card4snapshotsDocs) {
        let eachCard4 = "";
        let card4Data = card4Doc.data();
        // if(card4Data.exists) {
        //   console.log('aaa');
        //   break;
        // }
        eachCard4 = `
      <div class="product-area">
        <div style="display: flex;margin-left: 40%;padding: 10px;" >
            <input type="text" readonly value="${card4Data.title}" class="MainHeading"> 
            
        </div>
        <div class="row">
          <div class="col-lg-12">
            <div class="mr-table allproduct">
              <div class="table-responsiv">
                <div class="row btn-area" style="float: right;padding: 1  0px;">
                  <div class="action-list">
                    <select class="process  drop-success" style="display: block;" data-id="${card4Doc.id}" data-type="4cards"  onchange="changeStatus(event, this)">
                      ${sectionState(card4Data.activated)}
                    </select>
                  </div>
                  <div class="godropdown">
                    <button class="go-dropdown-toggle" data-id="${
                      card4Doc.id
                    }" data-type="4cards"  onclick="deleteSection(event)">
                        <i class="fas fa-trash-alt" data-id="${
                          card4Doc.id
                        }" data-type="4cards"></i> Delete
                    </button>
                  </div>
                </div>
                <table id="" class="table table-hover dt-responsive" cellspacing="0" width="100%">
                  <thead>
                    <tr>
                      <th>Image</th>
                      <th>Tags</th>
                    </tr>
                  </thead>
                  <tbody>
      `;
        // console.log(eachCard4);
        let row = "";
        for (let card of card4Data.card) {
          // console.log(card);
          row += `
        <tr role="row" class="odd parent">
          <td ><img src="${card.imgUrl}"></td>
          <td>${card.tag}</td>
        </tr>
        `;
        }
        eachCard4 = eachCard4 + row;
        eachCard4 += `
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
      `;
        wholeCard4 += eachCard4;
      }
      // console.log(wholeCard4);
      card4HTML.innerHTML = wholeCard4;
    });
};

// card 6
const display6cards = () => {
  let card6HTML = document.querySelector("#card6-section");
  db.collection("sections")
    .doc("6cards")
    .collection("6cards")
    .onSnapshot(async (card6Snaps) => {
      let card6SnapsDocs = card6Snaps.docs;
      let wholeCard6 = "";
      for (let card6Doc of card6SnapsDocs) {
        let card6Data = card6Doc.data();
        let eachCard6 = `
      <div class="product-area">
        <div style="display: flex;margin-left: 40%;padding: 10px;" >
          <input type="text" readonly value="${card6Data.title}" class="MainHeading"> 

        </div>
        <div class="row">
          <div class="col-lg-12">
            <div class="mr-table allproduct">
  
              <div class="alert alert-success validation" style="display: none;">
                <button type="button" class="close alert-close"><span>×</span></button>
                <p class="text-left"></p>
              </div>
  
              <div class="table-responsiv">
  
                <table id="" class="table table-hover dt-responsive" cellspacing="0" width="100%">
                  <div class="row btn-area" style="float: right;padding: 1  0px;">
                    <div class="action-list">
                      <select class="process  drop-success" style="display: block;" data-id="${card6Doc.id}" data-type="6cards"  onchange="changeStatus(event, this)">
                        ${sectionState(card6Data.activated)}
                      </select>
                    </div>
                    <div class="godropdown">
                      <button class="go-dropdown-toggle" data-id="${
                        card6Doc.id
                      }" data-type="6cards"  onclick="deleteSection(event)">
                          <i class="fas fa-trash-alt" data-id="${
                            card6Doc.id
                          }" data-type="6cards"></i> Delete
                      </button>
                    </div>
                  </div>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Image</th>
                      <th>Category</th>
                      <th>Sub-Category</th>
                      <th>Price</th>
                    </tr>
                  </thead>
                  <tbody>
      `;

        let row = "";
        for (let card of card6Data.card) {
          await db
            .collection(card.category)
            .doc(card.id)
            .get()
            .then((prodDoc) => {
              let prodData = prodDoc.data();
              row += `
          <tr role="row" class="odd parent">
            <td tabindex="0" >${prodData.name}<br><small>LOC ID:${
                prodData.sno
              }</a></small><small class="ml-2"></small></td>
            <td ><img src="${prodData.mainImgUrl}"></td> 
            <td >${prodData.wholeCategory.split("__")[1]}</td>
            <td >${prodData.wholeSubCategory.split("__")[2]}</td>
            <td >₹ ${prodData.sp}</td>
          </tr>
          `;
            });
        }
        eachCard6 = eachCard6 + row;
        eachCard6 += `
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
      `;

        wholeCard6 += eachCard6;
      }

      card6HTML.innerHTML = wholeCard6;
    });
};

// slider
const displayslider = () => {
  let sliderHTML = document.querySelector("#slider-section");

  db.collection("sections")
    .doc("slider")
    .collection("slider")
    .onSnapshot(async (sliderSnaps) => {
      let sliderSnapsDocs = sliderSnaps.docs;

      let wholeslider = "";
      for (let sliderDoc of sliderSnapsDocs) {
        let sliderData = sliderDoc.data();
        let eachSlider = `
      <div class="product-area">
        <div style="display: flex;margin-left: 40%;padding: 10px;" >
          <input type="text" readonly value="${sliderData.title}" class="MainHeading"> 

        </div>
        <div class="row">
          <div class="col-lg-12">
            <div class="mr-table allproduct">
  
              <div class="alert alert-success validation" style="display: none;">
                <button type="button" class="close alert-close"><span>×</span></button>
                <p class="text-left"></p>
              </div>
  
              <div class="table-responsiv">
  
                <table id="" class="table table-hover dt-responsive" cellspacing="0" width="100%">
                  <div class="row btn-area" style="float: right;padding: 1  0px;">
                    <div class="action-list">
                      <select class="process  drop-success" style="display: block;" data-id="${sliderDoc.id}" data-type="slider"  onchange="changeStatus(event, this)">
                        ${sectionState(sliderData.activated)}
                      </select>
                    </div>
                    <div class="godropdown">
                      <button class="go-dropdown-toggle"  data-id="${
                        sliderDoc.id
                      }" data-type="slider"  onclick="deleteSection(event)">
                          <i class="fas fa-trash-alt"  data-id="${
                            sliderDoc.id
                          }"  data-type="slider" ></i> Delete
                      </button>
                    </div>
                  </div>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Image</th>
                      <th>Category</th>
                      <th>Sub-Category</th>
                      <th>Price</th>
                    </tr>
                  </thead>
                  <tbody>
      `;

        let row = "";
        for (let card of sliderData.card) {
          await db
            .collection(card.category)
            .doc(card.id)
            .get()
            .then((prodDoc) => {
              let prodData = prodDoc.data();
              row += `
          <tr role="row" class="odd parent">
            <td tabindex="0" >${prodData.name}<br><small>LOC ID:${
                prodData.sno
              }</a></small><small class="ml-2"></small></td>
            <td ><img src="${prodData.mainImgUrl}"></td> 
            <td >${prodData.wholeCategory.split("__")[1]}</td>
            <td >${prodData.wholeSubCategory.split("__")[2]}</td>
            <td >₹ ${prodData.sp}</td>
          </tr>
          `;
            });
        }
        eachSlider = eachSlider + row;
        eachSlider += `
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
      `;

        wholeslider += eachSlider;
      }

      sliderHTML.innerHTML = wholeslider;
    });
};

// img
const displayimg = () => {
  let imgSectionHTML = document.querySelector("#img-section");

  db.collection("sections")
    .doc("img")
    .collection("img")
    .onSnapshot(async (imgSnaps) => {
      let imgSnapsDocs = imgSnaps.docs;
      let wholeImgs = "";
      let eachImg = "";
      for (let imgDoc of imgSnapsDocs) {
        let imgData = imgDoc.data();
        let catName = "";
        for (let cat of catInfo) {
          if (imgData.category === cat.id) {
            catName = cat.name;
          }
        }
        eachImg = `
        <div class="product-area">
          <div style="display: flex;margin-left: 40%;">
            <h4 class="MainHeading" id="sectionName">Users-Created-Banners</h4>
          </div>
          <div class="row">
            <div class="col-lg-12">
              <div class="mr-table allproduct">
                <h4 id="img-cat">Category :  ${catName}</h4>
                <div class="row btn-area" style="float: right;padding: 1  0px;">
                  <div class="action-list">
                    <select class="process  drop-success" style="display: block;" data-id="${imgDoc.id}" data-type="img"  onchange="changeStatus(event, this)">
                      ${sectionState(imgData.activated)}
                    </select>
                  </div>
                  <div class="godropdown">
                    <button class="go-dropdown-toggle" data-id="${
                      imgDoc.id
                    }" data-type="img"  onclick="deleteSection(event)">
                      <i class="fas fa-trash-alt" data-id="${
                        imgDoc.id
                      }"  data-type="img"></i> Delete
                    </button>
                  </div>
                </div>
    
                <div class="span4  text-center" id=""
                  style="width: 100%; height: 426px; border: 1px dashed #ddd; background: #f1f1f1;">
                  <i class="icofont-upload-alt"></i>
                  <img src="${
                    imgData.card.imgUrl
                  }" style="width:100%;height: 426px;object-fit:contain ;" />
                </div>
              </div>
            </div>
          </div>
        </div>
        `;
        wholeImgs += eachImg;
      }

      imgSectionHTML.innerHTML = wholeImgs;
    });
};

// animation
const displayanimation = () => {
  let animationSectionHTML = document.querySelector("#animation-section");

  db.collection("sections")
    .doc("animation")
    .collection("animation")
    .get()
    .then(async (animationSnaps) => {
      let animationSnapsDocs = animationSnaps.docs;
      let wholeanimation = "";
      for (animationDoc of animationSnapsDocs) {
        let animationData = animationDoc.data();
        let catName = "";
        for (let cat of catInfo) {
          if (animationData.category === cat.id) {
            catName = cat.name;
          }
        }
        let eachanimation = "";
        eachanimation = `
        <div class="product-area">
          <div style="display: flex;margin-left: 40%;">
            <h4 class="MainHeading" id="sectionName">Users Added Animation</h4>
          </div>
          <div class="row">
            <div class="col-lg-12">
              <div class="mr-table allproduct">
                <h4 id="img-cat">Category :  ${catName}</h4>
                <div class="row btn-area" style="float: right;padding: 1  0px;">
                  <div class="action-list">
                    <select class="process  drop-success" style="display: block;" data-id="${animationDoc.id}" data-type="animation"  onchange="changeStatus(event, this)">
                      ${sectionState(animationData.activated)}
                    </select>
                  </div>
                  <div class="godropdown">
                    <button class="go-dropdown-toggle" data-id="${
                      animationDoc.id
                    }" data-type="animation"  onclick="deleteSection(event)">
                      <i class="fas fa-trash-alt" data-id="${animationDoc.id}" data-type="animation" ></i> Delete
                    </button>
                  </div>
                </div>
                <div class="span4  text-center" id=""
                  style="width: 100%; height: 426px; border: 1px dashed #ddd; background: #f1f1f1;">
                  <i class="icofont-upload-alt"></i>
                  <video width="100%" controls>
                    <source src="${
                      animationData.card.animationUrl
                    }" type="video/mp4" loop muted autoplay  />
                  </video>
                </div>
              </div>
            </div>
          </div>
        </div>
        `;
        wholeanimation += eachanimation;
      }

      animationSectionHTML.innerHTML = wholeanimation;
    });
};
