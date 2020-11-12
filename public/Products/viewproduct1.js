console.log("viewproduct1.js");

const storageService = firebase.storage();
const db = firebase.firestore();

async function extractImgUrl(imgPath) {
  let urlPath;
  await storageService
    .ref(imgPath)
    .getDownloadURL()
    .then((url) => {
      urlPath = url;
    })
    .catch((error) => {
      console.log(error);
    });
  return urlPath;
}

let allCategoriesData = [];

const catDetails = (catId, scatId, ccatId) => {
  let cname, scname, ccname, flag;
  for (let c of allCategoriesData) {
    // console.log(c);
    if (catId === c.id) {
      // console.log('cat matched');
      for (let sc of c.data.subCategory) {
        // console.log(sc);
        if (+sc.id === +scatId) {
          // console.log('scat matched');
          for (let cc of sc.childCategories) {
            if (+cc.id === +ccatId) {
              // console.log(c);
              cname = c.data.name;
              scname = sc.name;
              ccname = cc.name;
              flag = 1;
              break;
            }
          }
        }
        if (flag) {
          break;
        }
      }
    }
    if (flag) {
      break;
    }
  }
  flag = undefined;
  let prodCatData = {
    cname: cname,
    scname: scname,
    ccname: ccname,
    cId: catId,
    scId: scatId,
    ccId: ccatId,
  };
  return prodCatData;
};

async function displayRows(snapshotDocs, allCatData) {
  let tRows = "";
  for (let d of snapshotDocs) {
    let docData = d.data();
    // console.log(docData);
    let id = d.id;

    let catId = docData.wholeCategory.split("__")[0];
    let scatId = docData.wholeSubCategory.split("__")[1];
    let ccatId = docData.wholeChildCategory.split("__")[2];
    // console.log(catId, scatId, ccatId);

    let catData = catDetails(catId, scatId, ccatId);

    let imgUrl = docData.mainImgUrl;
    tRows += `
    <tr role="row" class="odd parent">
        <td tabindex="0" >${docData.name}<br><small>ID: ${docData.sno}</small></td>
        <td><img src="${imgUrl}"></td>
        <td>${catData.scname}</td>
        <td>${catData.ccname}</td>
        <td>${docData.totalPrice}</td>
        <td>
          <div class="action-list"><select class="process  drop-success" style="display: block;" data-id="${id}" data-catid="${catId}" onchange="changeStatus(event, this)">
              ${displayOptions(docData.isActivated)}
            </select>
          </div>
        </td>
        <td >
          <div class="godropdown">
            <button class="go-dropdown-toggle">
              Actions<i class="fas fa-chevron-down"></i>
            </button>
            <div class="action-list" style="display: none;">
              <a href="" data-catid="${catId}" data-id="${d.id}" onclick="editDetails(event)" data-toggle="modal" data-target="#editProductModal">
                <i class="fas fa-edit"></i> Edit
              </a>            
              <a data-catid="${catId}" data-id="${d.id}" onclick="deleteProduct(event)"><i class="fas fa-trash-alt" ></i>
                  Delete
                </a>
                <a href="javascript:;"
                data-toggle="modal" data-target="#details-modal" data-catid="${catId}" data-id="${d.id}" onclick="extractDetails(event, this)" class="option-details">
                <i class="fa fa-info"></i>
                  Details
                </a>
              </a>
            </div>
          </div>
        </td>
      </tr>`;
  }
  // console.log(tRows);
  return tRows;
}



const displayOptions = (isSeleted, data) => {
  let options = "";
  if (isSeleted.toString() === "true") {
    options = `
      <option value="true" selected>Activated</option>
      <option value="false">Deactivated</option>
    `;
  } else {
    options = `
      <option value="true" >Activated</option>
      <option value="false" selected>Deactivated</option>
    `;
  }
  return options;
};

const changeStatus = (e, current) => {
  // console.log(e);
  // console.log(current.value);
  let docId = e.target.dataset.id;
  let catId = e.target.dataset.catid;

  db.collection(catId).doc(docId).update('isActivated', current.value).then(() => {
    console.log('state updated');
  }).catch(error => {
    alert('Error : ', error);
  })
}

const deleteProduct = (e) => {
  console.log(e);
  let answer = confirm('Are you sure you want to delete the product?');
  if (answer) {
    let docId = e.target.dataset.id;
    let catId = e.target.dataset.catid;

    let prodData;
    let docRef = db.collection(catId).doc(docId);
    docRef.get().then(doc => {
      let docData = doc.data();
      prodData = docData;
      console.log(docData.mainImg);
      return storageService.ref(`${catId}/${docId}/${docData.mainImg}`).delete();
    }).then(async (mainImgDelete) => {
      console.log(mainImgDelete);
      console.log(prodData);
      for (let subImg of prodData.subImgs) {
        console.log(subImg);
        await storageService.ref(`${catId}/${docId}/${subImg}`).delete();
      }
      return docRef.delete();
    }).then(() => {
      // console.log('all deleted');
      extractData();
    }).catch(error => {

      alert('error', error);
      console.log(error);
    })
  }
}
const extractData = async () => {
  await db
    .collection("categories")
    .get()
    .then((snapshot) => {
      let snapshotDocs = snapshot.docs;
      snapshotDocs.map((doc) => {
        let docData = doc.data();
        allCategoriesData.push({ data: docData, id: doc.id });
      });
    });
  var tableID;
  const displayAllCat = document.querySelector("#displayAllCat");
  let tRows = "";
  $("#displayAllCat").empty();
  for (let cat of allCategoriesData) {
    productNav.innerHTML += `
    <li style="padding: 10px;list-style:square;margin:auto 2%">
      <a class="scrollTo" href="#${cat.id}">${cat.data.name.toUpperCase()}</a>
    </li>`;

    $("#tbody" + cat.id).empty();
    tRows = "";
    displayAllCat.innerHTML += `
    <div class="product-area" id="${cat.id}" style="padding-top:0px;">
      <div class="row">
        <div class="col-lg-12">
          <div class="mr-table allproduct">
            <div class="table-title">
              <div class="row">
                <div class="col-sm-5"><h2> ${cat.data.name} </h2></div>
                <div class="col-sm-7">
                  <a  class="btn btn-secondary" id="myInput${cat.id}" class="searchBar" onclick=myFunction("myInput${cat.id}","myTable${cat.id}","table-responsive${cat.id}")><i class="material-icons" style="color:black">&#xE147;</i>
                    <span style="color:black">Enable Attribute</span></a>
                <a class="btn btn-secondary" onclick=createPDF("myTable`+ cat.id + `","` + cat.data.name + `")><i class="material-icons" style="color:black">&#xE24D;</i>
                    <span style="color:black">Export to Pdf</span></a>
                </div>
              </div>
            </div>
            <div class="alert alert-success validation" style="display: none;">
              <button type="button" class="close alert-close"><span>×</span></button>
              <p class="text-left"></p>
            </div>
            <div class="table-responsive${cat.id}">
              <table id="myTable${cat.id}" class="table table-hover dt-responsive" cellspacing="0" width="100%">
                <div class="row btn-area"></div>
                <thead>
                  <tr>
                    <th>Product Name</th>
                    <th>Image</th>
                    <th>Sub-Category</th>
                    <th>Child-Category</th>
                    <th>Price</th>
                    <th>Status</th>
                    <th>Options</th>
                  </tr>
                </thead>
                <tbody id="tbody${cat.id}">
                  <tr>
                    <td>Loading Rows......Please Wait</td>
                  </tr>
                </tbody>
              </table>
            </div>
        </div>
    </div>
        
  <br>
        
    `;
    

    const tbodys = document.querySelector("#tbody" + cat.id);
    console.log(tbodys);
    await db
      .collection(cat.id)
      .get()
      .then(async (snapshots) => {
        let snapshotsDocs = snapshots.docs;
        tRows += await displayRows(snapshotsDocs, allCategoriesData);
      
      });
    if (tRows != "") {
      tbodys.innerHTML = tRows;
    } else {

      $('#tbodys').empty();
      tbodys.innerHTML =
        '<h3 class="responsive-text" style="text-align:center;font-weight:700;padding:5px">OoPS!!! No Data Found</h3>';
    }
  }

};


extractData();

////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////

// display details
const detialsModalHTML = document.querySelector("#details-modal");
const pNameHTML = detialsModalHTML.querySelector(".prod-name-detail");
const pPriceHTML = detialsModalHTML.querySelector(".prod-price-detail");
const pGstHTML = detialsModalHTML.querySelector(".prod-gst-detail");
const pCatHTML = detialsModalHTML.querySelector(".prod-cat-detail");
const pSubCatHTML = detialsModalHTML.querySelector(".prod-sub-cat-detail");
const pChildCatHTML = detialsModalHTML.querySelector(".prod-child-cat-detail");
const pSnoHTML = detialsModalHTML.querySelector(".prod-sno-detail");
const pTagsHTML = detialsModalHTML.querySelector(".prod-tags-detail");
const pDescHTML = detialsModalHTML.querySelector(".prod-des-detail");
const pPrivacyHTML = detialsModalHTML.querySelector(".prod-policy-detail");
const pImgsHTML = detialsModalHTML.querySelector(".prod-img-detail");

const optionDetailsHTML = document.querySelector(".option-details");

const extractDetails = async (e, current) => {
  // console.log(e.target.dataset.id);
  const docId = e.target.dataset.id;
  const catId = e.target.dataset.catid;

  await db
    .collection(catId)
    .doc(docId)
    .get()
    .then(async (snapshot) => {
      // console.log(snapshot);
      // console.log(snapshot.data());
      let doc = snapshot.data();
      console.log(doc);
      let catId = doc.wholeCategory.split("__")[0];
      let scatId = doc.wholeSubCategory.split("__")[1];
      let ccatId = doc.wholeChildCategory.split("__")[2];
      let catData = catDetails(catId, scatId, ccatId);

      pNameHTML.innerHTML = doc.name;
      pPriceHTML.innerHTML = doc.mrp;
      pGstHTML.innerHTML = doc.gst;
      pCatHTML.innerHTML = catData.cname;
      pSubCatHTML.innerHTML = catData.scname;
      pChildCatHTML.innerHTML = catData.ccname;

      pTagsHTML.innerHTML = doc.tags;
      pSnoHTML.innerHTML = doc.sno;

      pDescHTML.innerHTML = doc.descriptions;
      pPrivacyHTML.innerHTML = doc.policy;
      let imgsPath = [];
      let url = await extractImgUrl(
        `${catId}/${snapshot.id}/${doc.mainImg}`
      );
      imgsPath.push(url);
      console.log(imgsPath);

      for (let i of doc.subImgs) {
        console.log(i);
        url = await extractImgUrl(`${catId}/${snapshot.id}/${i}`);
        imgsPath.push(url);
      }

      console.log(imgsPath);
      pImgsHTML.innerHTML = '';
      imgsPath.map((i) => {
        pImgsHTML.innerHTML += `
        <div class="col-lg-2">
          <img src="${i}" alt="">
        </div>
        `;
      });
    })
    .catch((error) => {
      console.log(error);
    });
};


/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// edit

const editModal = document.querySelector("#editProductModal");
let editProduct = editModal.querySelector("#add-product");
const productCategoryHTML = editProduct.querySelector("#product-category");
const productSubCategoryHTML = editProduct.querySelector("#product-sub-category");
const productChildCategoryHTML = editProduct.querySelector("#product-child-category");

// const allAddonsHTML = editProduct.querySelector("#all-addons");

const catSelect = async (data) => {
  console.log(data);

  await db
    .collection("categories")
    .get()
    .then((snapshot) => {
      let snapshotDocs = snapshot.docs;
      let options = '<option  disabled value="">Select Category*</option>';
      snapshotDocs.map((doc) => {
        let docData = doc.data();
        // console.log(docData);
        // console.log(docData.name.includes(data));
        if (doc.id == data.split('__')[0]) {
          // console.log(doc.id, data.split('__')[0]);
          options += `
          <option selected  value="${doc.id}__${docData.name}">${docData.name}</option>`;
        } else {
          options += `
          <option  value="${doc.id}__${docData.name}">${docData.name}</option>`;
        }
      });
      productCategoryHTML.innerHTML = options;
    });
};

const subCatSelect = async (data) => {
  // console.log(data);
  let docId = data.split("__")[0];
  // console.log(docId);
  let scId = data.split("__")[1];
  // console.log(scId);
  await db
    .collection("categories")
    .doc(docId)
    .get()
    .then((snapshot) => {
      let doc = snapshot.data();
      console.log(doc);
      let options = "<option >Select Sub Category*</option>";
      doc.subCategory.map((sc) => {
        if (+sc.id === +scId) {
          console.log(docId);
          options += `
          <option  selected value="${docId}__${sc.id}__${sc.name}">${sc.name}</option>
          `;
        } else {
          options += `
      <option value="${docId}__${sc.id}__${sc.name}">${sc.name}</option>
      `;
        }
      });
      productSubCategoryHTML.innerHTML = options;
    });
};

const childCatSelect = async (data) => {
  // console.log(data);
  let docId = data.split("__")[0];
  // console.log(docId);
  let scId = data.split("__")[1];
  // console.log(scId);
  let cId = data.split("__")[2];
  // console.log(cId);

  await db
    .collection("categories")
    .doc(docId)
    .get()
    .then((snapshot) => {
      let doc = snapshot.data();
      let options = '<option disabled value="">Select Sub Category</option>';
      doc.subCategory.map((sc) => {
        if (+sc.id === +scId) {
          // console.log(sc);
          sc.childCategories.map((cc) => {
            // console.log(cc);
            if (+cc.id === +cId) {
              options += `
            <option selected value="${docId}__${scId}__${cc.id}__${cc.name}">${cc.name}</option>
            `;
            } else {
              options += `
            <option value="${docId}__${scId}__${cc.id}__${cc.name}">${cc.name}</option>
            `;
            }
          });
        }
      });
      productChildCategoryHTML.innerHTML = options;
    });
};

let mainImgSpanHTML = editProduct.querySelector("#main-img-span");
let galleryImages = document.querySelector("#galleryImagesDisp");
let editProductDetails;
let editProductId;

const editDetails = async (e) => {
  $("#add-product").trigger("reset");

  let editProduct = document.querySelector("#add-product");
  console.log(e.target.dataset.id);
  console.log(e.target.dataset.category);
  // let allCategories = [];
  const docId = e.target.dataset.id;
  const catId = e.target.dataset.catid;

  await db
    .collection(catId)
    .doc(docId)
    .get()
    .then(async (snapshot) => {
      let doc = snapshot.data();
      editProductDetails = doc;
      editProductId = snapshot.id;

      let catId = doc.wholeCategory.split("__")[0];
      let scatId = doc.wholeSubCategory.split("__")[1];
      let ccatId = doc.wholeChildCategory.split("__")[2];
      let catData = catDetails(catId, scatId, ccatId);

      editProduct["product-name"].value = doc.name;
      editProduct["product-sno"].value = doc.sno;

      let wcat = `${catData.cId}__${catData.cname}`;
      let wscat = `${catData.cId}__${catData.scId}__${catData.scname}`;
      let ccat = `${catData.cId}__${catData.scId}__${catData.ccId}__${catData.ccname}`;

      await catSelect(wcat);
      await subCatSelect(wscat);
      await childCatSelect(ccat);
      if (doc.wholeCategory.toUpperCase().includes("CAKE")) {
        document.getElementById("cake-attributes").style.display = "block";
        if (doc.weights) {
          doc.weights.map((weight) => {
            console.log(weight);
            if (weight.cakeWeight === "half") {
              editProduct["cake-weight-half"].checked = true;
              editProduct["cake-price-half"].value = weight.weightPrice;
              editProduct["cake-prevPrice-half"].value = weight.weightPrevPrice;
            } else if (weight.cakeWeight === "one") {
              editProduct["cake-weight-one"].checked = true;
              editProduct["cake-price-one"].value = weight.weightPrice;
              editProduct["cake-prevPrice-one"].value = weight.weightPrevPrice;
            } else if (weight.cakeWeight === "oneHalf") {
              editProduct["cake-weight-oneHalf"].checked = true;
              editProduct["cake-price-oneHalf"].value = weight.weightPrice;
              editProduct["cake-prevPrice-oneHalf"].value =
                weight.weightPrevPrice;
            } else if (weight.cakeWeight === "two") {
              editProduct["cake-weight-two"].checked = true;
              editProduct["cake-price-two"].value = weight.weightPrice;
              editProduct["cake-prevPrice-two"].value = weight.weightPrevPrice;
            } else if (weight.cakeWeight === "three") {
              editProduct["cake-weight-three"].checked = true;
              editProduct["cake-price-three"].value = weight.weightPrice;
              editProduct["cake-prevPrice-three"].value =
                weight.weightPrevPrice;
            } else if (weight.cakeWeight === "four") {
              editProduct["cake-weight-four"].checked = true;
              editProduct["cake-price-four"].value = weight.weightPrice;
              editProduct["cake-prevPrice-four"].value = weight.weightPrevPrice;
            } else if (weight.cakeWeight === "five") {
              editProduct["cake-weight-five"].checked = true;
              editProduct["cake-price-five"].value = weight.weightPrice;
              editProduct["cake-prevPrice-five"].value = weight.weightPrevPrice;
            } else if (weight.cakeWeight === "six") {
              editProduct["cake-weight-six"].checked = true;
              editProduct["cake-price-six"].value = weight.weightPrice;
              editProduct["cake-prevPrice-six"].value = weight.weightPrevPrice;
            } else {
              console.log("unknown");
            }
          });
        }
        if (doc.shapes) {
          if (doc.shapes.length > 0) {
            editProduct["cake-shape"].checked = true;
            editProduct["cake-price-heart"].value = doc.shapes[0].shapePrice;
          }
        }
        if (doc.type) {
          editProduct["cake-type"].checked = true;
          editProduct["cake-price-eggless"].value = doc.type.price;
        }
        if (doc.flavours) {
          if (doc.flavours.length > 0) {
            doc.flavours.map((flav) => {
              if (flav == "Black forest") {
                editProduct["cake-flavour-blackForest"].checked = true;
              } else if (flav == "Vanila") {
                editProduct["cake-flavour-vanila"].checked = true;
              } else if (flav == "Chocolate") {
                editProduct["cake-flavour-chocolate"].checked = true;
              } else if (flav == "Butter scotch") {
                editProduct["cake-flavour-butterScotch"].checked = true;
              } else if (flav == "Pineapple") {
                editProduct["cake-flavour-pineapple"].checked = true;
              } else {
                console.log("invalid");
              }
            });
          }
        }
      } else {
        document.getElementById("cake-attributes").style.display = "none";
      }
      editProduct["product-mrp"].value = doc.mrp;
      editProduct["product-sp"].value = doc.sp;
      editProduct["product-gst"].value = doc.gst;
      editProduct["product-total-price"].value = doc.totalPrice;
      // await addons(doc.addons);
      // editProduct["product-main-image"].value = doc.mainImg;

      // console.log(putImg);

      // const deleteImage = e => {
      //   console.log(e);
      //   const imgId = e.target.dataset.imgid;
      //   console.log(imgId);
      //   $('#' + imgId).remove();

      // }



      $("#galleryImagesDisp").empty();
      if (doc.subImgs) {
        for (var i = 0; i < doc.subImgs.length; i++) {
          let sImgUrl = doc.subImgsUrl[i];
          galleryImages.innerHTML += `
          <div class="img gallery-img" id="images${i}" style="padding:5px">
              <span class="remove-img2" data-index="${i}" data-imgid="images${i}" onclick="deleteImage(event)">
                <i class="fas fa-times" data-index="${i}" data-imgid="images${i}" data-id="${snapshot.id}__${doc.subImgs[i]}" ></i>
                <input type="hidden" />
              </span>
              <a href="#">
              <img src="${sImgUrl}" class="subImgTag" width="130"  style="object-ft:cover" alt="${doc.subImgs[i]}">;
              </a>
          </div>

          `;
        }
      }
      let mImgUrl = doc.mainImgUrl;


      let mImg = `
      <img id="putImage" src="${mImgUrl}" alt=" image" />
      `;
      mainImgSpanHTML.innerHTML = mImg;
      $(".textarea1").summernote("reset");
      $(".textarea2").summernote("reset");
      // $("#productDesc").summernote(
      //   "pasteHTML", ""

      // );
      // $("#productPolicy").summernote(
      //   "pasteHTML", ""

      // );
      // productDescDetail.innerHTML=""
      // var productDescDetail = document.createElement('div');

      // productDescDetail.innerHTML = doc.descriptions;
      // alert(doc.descriptions)

      while (doc.descriptions.startsWith('<p><br></p>')) {

        doc.descriptions = doc.descriptions.replace('<p><br></p>', '')
      }

      while (doc.descriptions.endsWith('<p><br></p>')) {

        doc.descriptions = doc.descriptions.replace(new RegExp('<p><br></p>$'), '')
      }
      while (doc.policy.startsWith('<p><br></p>')) {

        doc.policy = doc.policy.replace('<p><br></p>', '')
      }

      while (doc.policy.endsWith('<p><br></p>')) {

        doc.policy = doc.policy.replace(new RegExp('<p><br></p>$'), '')
      }
      $("#productDesc").summernote(
        "editor.pasteHTML", doc.descriptions

      );

      // $('#productPolicy').reset();
      $("#productPolicy").summernote(
        "editor.pasteHTML", doc.policy

      );

      document.getElementById("setCat").value = doc.tags;

      tagger(document.querySelector("#setCat"), {
        allow_spaces: true,
        allow_duplicates: false,
        link: function () {
          return false;
        },
      });
    })
    .catch((error) => {
      console.log(error);
    });
};

const deleteSubImgs = [];
function deleteImage(e) {
  // console.log(e.target.dataset);
  const imgId = e.target.dataset.imgid;
  const imgIndex = e.target.dataset.index;
  // console.log(imgIndex);
  $('#' + imgId).remove();
  deleteSubImgs.push(imgIndex);

}



//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// submit edit form

let subImgs, mainImg;

const submitEditForm = (event) => {

  // console.log(editProduct);
  let editProduct = document.querySelector("#add-product");
  // console.log("edit form submit");
  event.preventDefault();
  let productName,
    productSno,
    productCategory,
    productSubCategory,
    productChildCategory,
    productMRP,
    productSP,
    productGST,
    productTotalPrice,
    productDescription,
    productPolicy,
    productMainImg;

  let productTags;
  let productAddons = [];
  let productSubImgs = [];
  let cakeWeights = [];
  let cakeShapes = [];
  let cakeFlavours = [];
  let weightPrice, cakeType;

  productName = editProduct["product-name"].value;
  productSno = editProduct["product-sno"].value;
  productCategory = editProduct["product-category"].value;
  productSubCategory = editProduct["product-sub-category"].value;
  productChildCategory = editProduct["product-child-category"].value;
  console.log(productCategory);
  productMRP = editProduct["product-mrp"].value;
  productSP = editProduct["product-sp"].value;
  productGST = editProduct["product-gst"].value;
  productTotalPrice = editProduct["product-total-price"].value;

  // editProduct
  //   .querySelectorAll('input[name="product-addon"]:checked')
  //   .forEach((addon) => {
  //     productAddons.push(addon.value);
  //   });

  // .forEach((tag) => {
  //   productTags.push(tag.value);
  // });

  productTags = editProduct.querySelector('input[name="product-tag"]').value;

  productDescription = $(".textarea1").summernote("code");
  productPolicy = $(".textarea2").summernote("code");

  if (productCategory.toUpperCase().includes("CAKE")) {
    editProduct
      .querySelectorAll('input[name="cake-weight"]')
      .forEach((weight) => {
        if (weight.checked) {
          if (weight.value == "half") {
            weightPrice = editProduct["cake-price-half"].value;
            // console.log(weightPrice);
          } else if (weight.value === "one") {
            weightPrice = editProduct["cake-price-one"].value;
            weightPrice = editProduct["cake-prevPrice-one"].value;
          } else if (weight.value === "oneHalf") {
            weightPrice = editProduct["cake-price-oneHalf"].value;
            weightPrice = editProduct["cake-prevPrice-oneHalf"].value;
          } else if (weight.value === "two") {
            weightPrice = editProduct["cake-price-two"].value;
            weightPrice = editProduct["cake-prevPrice-two"].value;
          } else if (weight.value === "three") {
            weightPrice = editProduct["cake-price-three"].value;
            weightPrice = editProduct["cake-prevPrice-three"].value;
          } else if (weight.value === "four") {
            weightPrice = editProduct["cake-price-four"].value;
            weightPrice = editProduct["cake-prevPrice-four"].value;
          } else if (weight.value === "five") {
            weightPrice = editProduct["cake-price-five"].value;
            weightPrice = editProduct["cake-prevPrice-five"].value;
          } else {
            weightPrice = editProduct["cake-price-six"].value;
            weightPrice = editProduct["cake-prevPrice-six"].value;
          }
          let data = {
            cakeWeight: weight.value,
            weightPrice: weightPrice,
          };

          cakeWeights.push(data);
        }
      });

    editProduct
      .querySelectorAll('input[name="cake-shape"]')
      .forEach((shape) => {
        if (shape.checked) {
          if (shape.value === "Heart") {
            cakeShapes.push({
              shape: shape.value,
              shapePrice: editProduct["cake-price-heart"].value,
            });
          } else {
            cakeShapes.push({
              shape: shape.value,
              shapePrice: null,
            });
          }
        }
      });

    editProduct
      .querySelectorAll('input[name="cake-flavour"]:checked')
      .forEach((flavour) => {
        cakeFlavours.push(flavour.value);
      });

    if (editProduct.querySelector('input[name="cake-type"]:checked')) {
      cakeType = {
        type: "Eggless",
        price: editProduct["cake-price-eggless"].value,
      };
    }
  }

  if (mainImg) {
    // console.log(mainImg);
    productMainImg = `${Math.random()}_${mainImg.name}`;
  } else {
    // console.log(mainImg);
    productMainImg = editProductDetails.mainImg;
    // productMainImg =
    // console.log(editProductDetails.mainImg);
  }
  console.log(productMainImg);

  let suburlss = [];
  if (subImgs) {
    console.log(subImgs);
    for (let img of subImgs) {
      productSubImgs.push(`${Math.random()}_${img.name}`);
    }
    document.querySelectorAll(".subImgTag").forEach((el) => {
      // console.log(el.alt);
      productSubImgs.push(el.alt);
      suburlss.push(el.src);
    });
  } else {
    // productSubImgs = editProductDetails.subImgs;

    document.querySelectorAll(".subImgTag").forEach((el) => {
      // console.log(el.alt);
      productSubImgs.push(el.alt);
      suburlss.push(el.src);
    });
  }
  // console.log(productSubImgs);
  // alert(productDescription)
  // alert(productPolicy)

  console.log();
  let wholeProduct = {
    name: productName,
    sno: productSno,
    wholeCategory: productCategory,
    wholeSubCategory: productSubCategory,
    wholeChildCategory: productChildCategory,
    mrp: productMRP,
    sp: productSP,
    gst: productGST,
    totalPrice: productTotalPrice,
    tags: productTags,
    descriptions: productDescription,
    policy: productPolicy,
    mainImg: productMainImg,
    subImgs: productSubImgs,
    addons: productAddons,
    isActivated: true,
    subImgsUrl: suburlss,
  };

  if (productCategory.toUpperCase().includes("CAKES")) {
    wholeProduct.weights = cakeWeights || "";
    wholeProduct.shapes = cakeShapes || "";
    wholeProduct.type = cakeType || "";
    wholeProduct.flavours = cakeFlavours || "";
  }

  console.log(wholeProduct);
  // let c = wholeProduct.wholeSubCategory.split("__")[2];
  // console.log(c);
  // let cc = wholeProduct.wholeChildCategory.split("__")[3];
  // console.log(cc);

  async function editProductFun(data) {
    console.log(data);
    // console.log(data.category, typeof data.category);
    let dataId, prodData;
    // await db
    //   .collection(data.category)
    //   .add(data)
    //   .then((dataSaved) => {
    //     // console.log(dataSaved.id);
    //     dataId = dataSaved.id;
    //   })
    //   .catch((error) => {
    //     console.log(error);
    //   });
    dataId = editProductId;
    console.log(data.wholeCategory.split('__')[0], editProductId);

    let docRef = await db.collection(data.wholeCategory.split('__')[0].toString()).doc(editProductId);
    docRef.get().then(async (snapshot) => {
      let docData = snapshot.data();
      docData = data;
      await docRef.update(docData);
    });

    return { dataId: dataId, prodData: data };
  }

  editProductFun(wholeProduct)
    .then(async (response) => {
      let mainImgUrl;
      let subImgsUrl = [];
      console.log(response);

      if (mainImg) {
        console.log(mainImg);
        await storageService
          .ref(
            `${response.prodData.wholeCategory.split('__')[0]}/${response.dataId}/${response.prodData.mainImg}`
          )
          .put(mainImg);
        console.log("uploading done");
        mainImgUrl = await extractImgUrl(
          `${response.prodData.wholeCategory.split('__')[0]}/${response.dataId}/${response.prodData.mainImg}`
        );
        console.log(mainImgUrl);
      }
      // console.log(mainImgUrl);

      let counter = -1;
      if (subImgs) {
        for (let img of subImgs) {
          counter++;
          console.log(img);
          let name = [...response.prodData.subImgs][counter];
          let id = response.dataId;
          // await uploadImg(id, name, img);
          await storageService
            .ref(`${response.prodData.wholeCategory.split('__')[0]}/${id}/${name}`)
            .put(img);
          console.log('stored');
          let subUrl = await extractImgUrl(
            `${response.prodData.wholeCategory.split('__')[0]}/${id}/${name}`
          );
          console.log(subUrl);
          subImgsUrl.push(subUrl);
        }
      }
      // editProduct.reset();
      // showSnack();
      // function showSnack() {
      //   alert("Product Updated Successfully")
      //   var x = document.getElementById("snackbar");
      //   x.className = "show";
      //   setTimeout(function () {
      //     x.className = x.className.replace("show", "");
      //   }, 3000);
      // }
      if (subImgs || mainImg) {
        let docRef = await db
          .collection(response.prodData.wholeCategory.split('__')[0])
          .doc(response.dataId);

        await docRef.get().then(async (doc) => {
          let docData = doc.data();
          if (mainImg) {
            docData.mainImgUrl = mainImgUrl;
          }
          if (subImgs) {
            docData.subImgsUrl.push(...subImgsUrl);
          }
          console.log(deleteSubImgs);
          if (deleteSubImgs) {
            if (deleteSubImgs.length > 0) {
              for (let el of deleteSubImgs) {
                console.log(el);
                console.log(docData.subImgs);
                console.log(`${docData.wholeCategory.split('__')[0]}/${doc.id}/${docData.subImgs[el]}`);
                await storageService.ref(`${docData.wholeCategory.split('__')[0]}/${doc.id}/${docData.subImgs[el]}`).delete().then(d => {
                  console.log(d);
                  console.log('deleted');
                  docData.subImgs.splice(el, 1);
                  docData.subImgsUrl.splice(el, 1);

                }).catch(error => {
                  console.log(error);
                  alert(error)
                })

              }
            }
          }
          console.log(docData);
          await docRef.update(docData);
          
        });
      }

      const searchRef = db.collection('miscellaneous').doc('searchList');
      searchRef.get().then(async(seachDoc) => {
        let searchData = seachDoc.data();
        let searchName = {
          name: response.prodData.name,
          id: Math.random(),
          type: 'prodName'
        }
        
        let searchSno = {
          name: response.prodData.sno,
          id: Math.random(),
          type: 'prodId',
          prodId: response.dataId
        }
        console.log(response.prodData);
        response.prodData.tags.split(',').map(tt => {
          let tagFlag = 0;
          for(let s of searchData.searches) { 
            if(s.name === tt) {
              tagFlag++;
              break;
            }
          }

          if(tagFlag === 0) {
            searchData.searches.push({
              name: tt,
              id: Math.random(),
              type: 'tag'
            })
          }
        })

        let flag = 0;
        for(let s of searchData.searches) {
          if(s.name == searchName.name) {
            flag = 1;
            break;
          }
        }
        if(flag === 0) {
          searchData.searches.push(searchName);
        }

        let snoFlag = 0;
        for(let s of searchData.searches) {
          if(s.name == searchSno.name) {
            snoFlag = 1;
            break;
          }
        }
        if(snoFlag === 0) {
          searchData.searches.push(searchSno);
        }

        console.log(searchData);
        await searchRef.update(searchData);
        location.reload();
      })


      editProduct.querySelector(".alert-success").textContent = "Product Saved";
      editProduct.querySelector(".alert-success").style.display = "block";
      setTimeout(() => {
        editProduct.querySelector(".alert-success").style.display = "none";
      }, 5000);

      // document.querySelector('#product-main-image').value = "";
      // document.querySelector('#product-sub-imgs').value = "";
      editProduct.reset();
      // extractData();
      console.log("edit done");
      // $('#editProductModal').modal('hide');
      // $('#editProductModal').close();
    })
    .catch((error) => {
      console.log(error);
      editProduct.querySelector(".alert-danger").innerHTML = error.message;
      editProduct.querySelector(".alert-danger").style.display = "block";
      setTimeout(() => {
        editProduct.querySelector(".alert-danger").style.display = "none";
      }, 5000);
    });
};

const uploadMainImg = async (e) => {
  mainImg = e.target.files[0];
  // mainImagesUrl= await extractImgUrl(mainImg)
  console.log(mainImg);
  var reader = new FileReader();
  reader.onload = function (e) {
    $("#putImage").attr("src", e.target.result);
  };
  reader.readAsDataURL(e.target.files[0]);
};
// productMainImgHandler.addEventListener("change", uploadMainImg);

const uploadSubImgs = (e) => {
  subImgs = e.target.files;
  console.log(subImgs);
};

// global
$(document).ready(function () {
  $(window).keydown(function (event) {
    if (event.keyCode == 13) {
      event.preventDefault();
      return false;
    }
  });
});

// const displayChildCategory = async (elHTML) => {
//   let docId, scId;
//   // let data = editProduct["product-sub-category"].value;
//   let data = editProductDetails.wholeChildCategory;
//   console.log(data);
//   docId = data.substring(0, 20);
//   // console.log(docId);
//   scId = data.substring(22, 41);
//   // console.log(scId);

//   let dbRef = await db.collection("categories").doc(docId);

//   dbRef
//     .get()
//     .then((snapshot) => {
//       // console.log(snapshot.data());
//       let docData = snapshot.data();
//       let options =
//         '<select id="product-child-category" name="product-child-category">';
//       docData.subCategory.map((sc) => {
//         if (+sc.id === +scId) {
//           // console.log(sc);
//           sc.childCategories.map((cc) => {
//             // console.log(cc);
//             options += `
//             <option value="${docId}__${scId}__${cc.id}__${cc.name}">${cc.name}</option>
//             `;
//           });
//         }
//       });
//       // console.log(options);
//       // console.log(elHTML);
//       elHTML.innerHTML = options;
//     })
//     .catch((error) => {
//       console.log(error);
//     });
// };

// const displaySubCategory = async (elHTML) => {
//   let data = editProductDetails.wholeSubCategory;
//   console.log(data);
//   let docId = data.substring(0, 20);
//   let docCat = data.substring(22);
//   let options = '<option value="">Select Sub Category*</option>';
//   let dbRef = await db.collection("categories").doc(docId);

//   dbRef
//     .get()
//     .then((snapshot) => {
//       // console.log(snapshot.data());
//       let docData = snapshot.data();
//       docData.subCategory.map((sc) => {
//         // console.log(sc);
//         options += `
//         <option value="${docId}__${sc.id}__${sc.name}">${sc.name}</option>
//         `;
//       });
//       // console.log(options);
//       // console.log(elHTML);
//       elHTML.innerHTML = options;
//     })
//     .catch((error) => {
//       console.log(error);
//     });
// };
