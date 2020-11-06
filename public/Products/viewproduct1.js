

const storageService = firebase.storage();
const db = firebase.firestore();

async function imgDisplay(imgPath) {
  let imgUrl;
  await storageService
    .ref(imgPath)
    .getDownloadURL()
    .then((url) => {
      imgUrl = url;
    })
    .catch((err) => {
      imgUrl = err;
    });

  return imgUrl;
}

async function displayRows(dd) {
  let tRows = "";
  for (let d of dd) {
    let docData = d.data();
    // console.log(docData);
    let id = d.id;
    let cat = docData.category;
    let status=docData.isActivated;
    var dispVal1,dispVal2,dataval1,dataval2;
    if(status=="false"){

      dispVal1="Deactivated";
      dispVal2="Activated";
      dataval1="false"
      dataval2="true"

    }else{
      dispVal1="Activated";
      dispVal2="Deactivated";
      dataval1="true"
      dataval2="false"
     
    }
    let imgUrl =docData.mainImgUrl;

    tRows +=
      `
    <tr role="row" class="odd parent">
        <td tabindex="0" >${docData.name}<br><small>ID: ${docData.sno}</small></td>
        <td><img src="${imgUrl}"></td>
        <td>${docData.subCategory}</td>
        <td>${docData.childCategory}</td>
        <td>${docData.totalPrice}</td>
        <td>
          <div class="action-list"><select class="process  drop-success" style="display: block; " id="statusUpdate` +id +`" onchange=statusUpdated("statusUpdate` +id+ `","`+id+`","`+cat+`")>
              <option data-val="1" value="`+dataval1+`">`+dispVal1+`</option>
              <option data-val="0" value="`+dataval2+`">`+dispVal2+`</option>
            </select>
          </div>
        </td>
        <td >
          <div class="godropdown">
            <button class="go-dropdown-toggle">
              Actions<i class="fas fa-chevron-down"></i>
            </button>
            <div class="action-list" style="display: none;">
              <a href="" data-category="${docData.category}" data-id="${d.id}" onclick="editDetails(event)" data-toggle="modal" data-target="#editProductModal">
                <i class="fas fa-edit"></i> Edit
              </a>
            
                <a 
                 >
                  <i class="fas fa-trash-alt" onclick=deleteProduct("` +
      cat +
      `","` +
      id +
      `")></i>
                  Delete
                </a>
                <a href="javascript:;"
                data-toggle="modal" data-target="#details-modal" data-category="${docData.category}" data-id="${d.id}" onclick="extractDetails(event)" class="option-details">
                <i class="fa fa-info"></i>
                  Details
                </a>
              </a>
            </div>
          </div>
        </td>
      </tr>
    `;
  }
  // console.log(tRows);
  return tRows;
}
function statusUpdated(dropId,id,cat){
 
  var status=document.querySelector(`#`+dropId).value;
  if(status=="false"){

    let isActivated="false"
    db.collection(cat).doc(id).update("isActivated", isActivated)
    let ans=confirm("Are you sure to deactivate the product")
    if(ans){
      alert("Product status Updated Sucessufully")
    }
   
  }else{

    let isActivated="true"
    db.collection(cat).doc(id).update("isActivated", isActivated)
    let ans=confirm("Are you sure to Activate the product")
    if(ans){
      alert("Product status Updated Sucessufully")
    }
   
  }
}
async function deleteProduct(cat, prid) {
  var answer = confirm("Are you sure to delete the product");
  if (answer) {
    var docData;
    let imgsPath = [];
    var url, docID;
    await db
      .collection(cat)
      .get()
      .then(async (snapshot) => {
        let snapshotsDocs = snapshot.docs;
        snapshotsDocs.map(async (doc) => {
          docData = doc.data();
          docID = doc.id;
          url = await extractImgUrl(
            `${docData.category}/${prid}/${docData.mainImg}`
          );
          var counter = 0;
          if (url != null) {
            imgsPath.push(url);
            for (let i of docData.subImgs) {
              url = await extractImgUrl(`${docData.category}/${prid}/${i}`);
              imgsPath.push(url);
            }

            for (let i of imgsPath) {
              
              var desertRef = await firebase.storage().refFromURL(i);

              desertRef
                .delete()
                .then(function () {
                  db.collection(cat)
                    .doc(prid)
                    .delete()
                    .then(function () {
                      counter++;
                      if (counter == imgsPath.length) {
                        alert("Product Deleted Successfully");
                        extractData();
                      }
                    })
                    .catch(function (error) {
                      console.error("Error removing document: ", error);
                    });

                  // File deleted successfully
                })
                .catch(function (error) {
                  // Uh-oh, an error occurred!
                });
            }
          } else {
            db.collection(cat)
              .doc(prid)
              .delete()
              .then(function () {
                alert("Product Deleted Successfully");
                location.reload();
              })
              .catch(function (error) {
                console.error("Error removing document: ", error);
              });
          }

          // Delete the file
        });
      });
  }
}
const extractData = async () => {
  let allCategoriesNames = [];
  await db
    .collection("categories")
    .get()
    .then((snapshot) => {
      let snapshotDocs = snapshot.docs;
      snapshotDocs.map((doc) => {
        let docData = doc.data();
        allCategoriesNames.push(docData.name);
      });
    });

  const displayAllCat = document.querySelector("#displayAllCat");
  let tRows = "";
  $("#displayAllCat").empty();
  for (let cat of allCategoriesNames.reverse()) {
    productNav.innerHTML +=
      `
        <li style="padding: 10px;list-style:square;margin:auto 2%">
         <a class="scrollTo" href="#` +
      cat +
      `">` +
      cat.toUpperCase() +
      `</a>
        </li>
         `;
    $("#tbody" + cat).empty();
    let mainHeading = cat.toUpperCase();
    tRows = "";
    displayAllCat.innerHTML +=
      `
    
    <div class="product-area" id=` +
      cat +
      ` style="padding-top:0px;">

    <div class="row">
      <div class="col-lg-12">
      
        <div class="mr-table allproduct">
        <div class="table-title">
        <div class="row">
            <div class="col-sm-5">
                <h2>` +
      cat +
      `</h2>
            </div>
            <div class="col-sm-7">
                <a  class="btn btn-secondary" id="myInput` +
      cat +
      `" class="searchBar" onclick=myFunction("myInput` +
      cat +
      `","myTable` +
      cat +
      `","table-responsive` +
      cat +
      `")><i class="material-icons" style="color:black">&#xE147;</i>
                    <span style="color:black">Enable Attribute</span></a>
                <a class="btn btn-secondary"><i class="material-icons" style="color:black">&#xE24D;</i>
                    <span style="color:black">Export to Pdf</span></a>
            </div>
        </div>
    </div>
          <div class="alert alert-success validation" style="display: none;">
            <button type="button" class="close alert-close"><span>×</span></button>
            <p class="text-left"></p>
          </div>
          <div class="table-responsive` +
      cat +
      `">
          
            <table id="myTable` +
      cat +
      `" class="table table-hover dt-responsive" cellspacing="0" width="100%">
              <div class="row btn-area">
              </div>
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
              <tbody id="tbody` +
      cat +
      `">
               <tr>
                <td>Loading Rows......Please Wait</td>
               </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </div>
  <br>
        
    `;

    const tbodys = document.querySelector("#tbody" + cat);

    await db
      .collection(cat)
      .get()
      .then(async (snapshots) => {
        let snapshotsDocs = snapshots.docs;
        tRows += await displayRows(snapshotsDocs);
      });
    if (tRows != "") {
      tbodys.innerHTML = tRows;
    } else {
      tbodys.innerHTML =
        '<h3 class="responsive-text" style="text-align:center;font-weight:700;padding:5px">OoPS!!! No Data Found</h3>';
    }

    // console.log(cat);
  }
};
extractData();

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

const extractDetails = async (e) => {
  console.log(e.target.dataset.id);
  console.log(e.target.dataset.category);
  await db
    .collection(e.target.dataset.category)
    .doc(e.target.dataset.id)
    .get()
    .then(async (snapshot) => {
      // console.log(snapshot);
      // console.log(snapshot.data());
      let doc = snapshot.data();
      // console.log(doc);
      pNameHTML.innerHTML = doc.name;
      pPriceHTML.innerHTML = doc.mrp;
      pGstHTML.innerHTML = doc.gst;
      pCatHTML.innerHTML = doc.category;
      pSubCatHTML.innerHTML = doc.subCategory;
      pChildCatHTML.innerHTML = doc.childCategory;
      let allTags = [];
      doc.tags.map((t) => {
        allTags.push(`${t}, `);
      });
      console.log(allTags);
      pTagsHTML.innerHTML = allTags.join("   ");
      pSnoHTML.innerHTML = doc.sno;

      pDescHTML.innerHTML = doc.descriptions;
      pPrivacyHTML.innerHTML = doc.policy;
      let imgsPath = [];
      let url = await extractImgUrl(
        `${doc.category}/${snapshot.id}/${doc.mainImg}`
      );
      imgsPath.push(url);
      console.log(imgsPath);

      for (let i of doc.subImgs) {
        console.log(i);
        url = await extractImgUrl(`${doc.category}/${snapshot.id}/${i}`);
        imgsPath.push(url);
      }
      console.log(imgsPath);
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

// edit

const editModal = document.querySelector("#editProductModal");
let editProduct = editModal.querySelector("#add-product");
const productCategoryHTML = editProduct.querySelector("#product-category");
const productSubCategoryHTML = editProduct.querySelector(
  "#product-sub-category"
);
const productChildCategoryHTML = editProduct.querySelector(
  "#product-child-category"
);

// const allAddonsHTML = editProduct.querySelector("#all-addons");

const cat = async (data) => {
  // console.log(data);
  await db
    .collection("categories")
    .get()
    .then((snapshot) => {
      let snapshotDocs = snapshot.docs;
      let options = '<option  disabled value="">Select Category*</option>';
      snapshotDocs.map((doc) => {
        let docData = doc.data();
        options += `
      <option ${docData.name == data ? "selected" : null}  value="${doc.id}__${
          docData.name
        }">${docData.name}</option>
      `;
      });
      productCategoryHTML.innerHTML = options;
    });
};

const subCat = async (data) => {
  console.log(data);
  let docId = data.split('__')[0];
  console.log(docId);
  let scId = data.split('__')[1];
  console.log(scId);
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

const childCat = async (data) => {
  console.log(data);
  let docId = data.split('__')[0];
  console.log(docId);
  let scId = data.split('__')[1];
  console.log(scId);
  let cId = data.split('__')[2];
  console.log(cId);

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

// const addons = async (data) => {
//   console.log(data);
//   let options = "";
//   await db
//     .collection("addons")
//     .get()
//     .then((snapshot) => {
//       let snapshotDocs = snapshot.docs;
//       let checkboxSelect;
//       snapshotDocs.map((doc) => {
//         let docData = doc.data();
//         console.log(docData);
//         data.map((add) => {
//           let docId = add.substring(0, 20);
//           // console.log(docId);
//           console.log(doc.id, docId);
//           console.log(typeof doc.id, typeof docId);
//           if (doc.id === docId) {
//             // console.log(doc.id, docId);
//             // console.log(docData.name);
//             checkboxSelect = true;
//           }
//         });
//         options += `
//           <h5 class="addon"><input ${
//             checkboxSelect ? "checked" : null
//           } type="checkbox" name="product-addon" value="${doc.id}__${
//           docData.name
//         }" class="addon">&nbsp;${docData.name}</h5><br>`;
//         checkboxSelect = false;
//       });
//       allAddonsHTML.innerHTML = options;
//     });
// };

// const extractImgUrl = async (imgPath) => {
//   let imgURL;
//   await storageService
//     .ref(imgPath)
//     .getDownloadURL()
//     .then((url) => {
//       imgURL = url;
//     })
//     .catch((error) => {
//       console.log(error);
//     });
//   return imgURL;
// };

let editProductDetails;
let editProductId;

const editDetails = async (e) => {
  $('#add-product').trigger("reset");
  let editProduct = document.querySelector("#add-product");
  console.log(e.target.dataset.id);
  console.log(e.target.dataset.category);
  // let allCategories = [];

  await db
    .collection(e.target.dataset.category)
    .doc(e.target.dataset.id)
    .get()
    .then(async (snapshot) => {
      let doc = snapshot.data();
      editProductDetails = doc;
      editProductId = snapshot.id;
      // console.log(doc);
      // console.log(editProduct["product-name"]);
      editProduct["product-name"].value = doc.name;
      editProduct["product-sno"].value = doc.sno;
      await cat(doc.category);
      await subCat(doc.wholeSubCategory);
      await childCat(doc.wholeChildCategory);
      // editProduct["product-sub-category"].value = doc.subCategory;
      // editProduct["product-child-category"].value = doc.childCategory;



      if (doc.category.toUpperCase().includes("CAKE")) {
        document.getElementById("cake-attributes").style.display = "block";
        if (doc.weights) {
          doc.weights.map((weight) => {
            if (weight.cakeWeight === "half") {
              editProduct["cake-weight-half"].checked = true;
              editProduct["cake-price-half"].value = weight.weightPrice;
            } else if (weight.cakeWeight === "one") {
              editProduct["cake-weight-one"].checked = true;
              editProduct["cake-price-one"].value = weight.weightPrice;
            } else if (weight.cakeWeight === "oneHalf") {
              editProduct["cake-weight-oneHalf"].checked = true;
              editProduct["cake-price-oneHalf"].value = weight.weightPrice;
            } else if (weight.cakeWeight === "two") {
              editProduct["cake-weight-two"].checked = true;
              editProduct["cake-price-two"].value = weight.weightPrice;
            } else if (weight.cakeWeight === "three") {
              editProduct["cake-weight-three"].checked = true;
              editProduct["cake-price-three"].value = weight.weightPrice;
            } else if (weight.cakeWeight === "four") {
              editProduct["cake-weight-four"].checked = true;
              editProduct["cake-price-four"].value = weight.weightPrice;
            } else if (weight.cakeWeight === "five") {
              editProduct["cake-weight-five"].checked = true;
              editProduct["cake-price-five"].value = weight.weightPrice;
            } else if (weight.cakeWeight === "six") {
              editProduct["cake-weight-six"].checked = true;
              editProduct["cake-price-six"].value = weight.weightPrice;
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
      let mainImgSpanHTML = editProduct.querySelector("#main-img-span");
      let galleryImages = document.querySelector("#galleryImagesDisp");
      // console.log(putImg);
      $("#galleryImagesDisp").empty();
      for (var i = 0; i < doc.subImgs.length; i++) {
        let sImgUrl =doc.subImgsUrl[i]
      

        galleryImages.innerHTML +=
          `
        <div class="img gallery-img" id="images` +
          i +
          `" style="padding:5px">
            <span class="remove-img2"><i class="fas fa-times" onclick=deleteImage("images` +
          i +
          `")></i>
            <input type="hidden">
            </span>
            <a href="#" target="_blank">
            <img src="${sImgUrl}" width="130"  style="object-ft:cover" alt="gallery image">;
            </a>
         </div>
         
        `;
      }
      let mImgUrl = doc.mainImgUrl
    
      let mImg = `
      <img id="putImage" src="${mImgUrl}" alt=" image" />
      `;
      mainImgSpanHTML.innerHTML = mImg;
      $("#productDesc").summernote("reset");
      $("#productPolicy").summernote("reset");
      $("#productDesc").summernote(
        "editor.insertText",
        doc.descriptions.replace(/(<([^>]+)>)/g, "")
      );
      $("#productPolicy").summernote(
        "editor.insertText",
        doc.policy.replace(/(<([^>]+)>)/g, "")
      );
      //   $('#productPolicy').val(doc.policy)
      let featureSectionHTML = editProduct.querySelector("#feature-section");
      let t = "";
      doc.tags.map((tag) => {
        t += `
        <div class="feature-area">
          <div class="row">
            <div class="col-lg-12">
              <input type="text" name="product-tag" class="input-field" value="${tag}"
                placeholder="Enter Your Keyword">
            </div>
          </div>
        </div>
        `;
      });
      featureSectionHTML.innerHTML = t;
    })
    .catch((error) => {
      console.log(error);
    }
  );
};

let subImgs, mainImg;

const submitEditForm = (event) => {
  console.log(editProduct);
  // let editProduct = document.querySelector("#add-product");
  console.log("edit form submit");
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

  let productTags = [];
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

  editProduct.querySelectorAll('input[name="product-tag"]').forEach((tag) => {
    productTags.push(tag.value);
  });

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
          } else if (weight.value === "oneHalf") {
            weightPrice = editProduct["cake-price-oneHalf"].value;
          } else if (weight.value === "two") {
            weightPrice = editProduct["cake-price-two"].value;
          } else if (weight.value === "three") {
            weightPrice = editProduct["cake-price-three"].value;
          } else if (weight.value === "four") {
            weightPrice = editProduct["cake-price-four"].value;
          } else if (weight.value === "five") {
            weightPrice = editProduct["cake-price-five"].value;
          } else {
            weightPrice = editProduct["cake-price-six"].value;
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
    productMainImg = `cake_${Math.random()}_${mainImg.name}`;
  } else {
    productMainImg = editProductDetails.mainImg;
  }
  if (subImgs) {
    productSubImgs = [...subImgs].map(
      (img) => `cake_${Math.random()}_${img.name}`
    );
  } else {
    productSubImgs = editProductDetails.subImgs;
  }

  let wholeProduct = {
    name: productName,
    sno: productSno,
    wholeCategory: productCategory,
    wholeSubCategory: productSubCategory,
    wholeChildCategory: productChildCategory,
    category: productCategory.split('__')[1],
    subCategory: productSubCategory.split('__')[2],
    childCategory: productChildCategory.split('__')[3],
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
  };

  if (productCategory.toUpperCase().includes("CAKES")) {
    wholeProduct.weights = cakeWeights || "";
    wholeProduct.shapes = cakeShapes || "";
    wholeProduct.type = cakeType || "";
    wholeProduct.flavours = cakeFlavours || "";
  }

  console.log(wholeProduct);
  let c = wholeProduct.wholeSubCategory.split(__)[2];
  console.log(c);
  let cc = wholeProduct.wholeChildCategory.split(__)[3];
  console.log(cc);

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
    console.log(data.category, editProductId);
    let docRef = await db.collection(data.category).doc(editProductId);
    docRef.get().then(async (snapshot) => {
      let docData = snapshot.data();
      docData = data;

      await docRef.update(docData);
    });

    return { dataId: dataId, prodData: data };
  }

  editProductFun(wholeProduct)
    .then(async (response) => {
      // console.log(response);
      // console.log(response.prodData.category);
      // console.log(response.prodData.subImgs);
      // console.log(typeof response.prodData.subImgs);
      // console.log(typeof response.prodData.mainImg, response.prodData.mainImg);
      // console.log(response.dataId);
      // console.log(mainImg);

      const storageService = firebase.storage();
      if (mainImg) {
        await storageService
          .ref(
            `${response.prodData.category}/${response.dataId}/${response.prodData.mainImg}`
          )
          .put(mainImg);
      }
      // console.log(subImgs);

      async function uploadImg(id, name, img) {
        await storageService
          .ref(`${response.prodData.category}/${id}/${name}`)
          .put(img);
      }
      let counter = -1;

      async function upload() {
        for (let img of subImgs) {
          counter++;
          // console.log(img);
          let name = [...response.prodData.subImgs][counter];
          let id = response.dataId;
          await uploadImg(id, name, img);
        }
      }

      if (subImgs) {
        upload();
      }

      // async function addingImgUrl(imgPath) {
      //   let imgUrl;
      //   // console.log(imgPath);
      //   await storageService
      //     .ref(imgPath)
      //     .getDownloadURL()
      //     .then((url) => {
      //       imgUrl = url;
      //     })
      //     .catch((err) => {
      //       imgUrl = err;
      //       // console.log(err);
      //     });

      //   console.log(imgUrl);
      //   return imgUrl;
      // }

      editProduct.reset();
      showSnack();
      function showSnack() {
        // Get the snackbar DIV
        alert("Product Updated Successfully")
        var x = document.getElementById("snackbar");

        // Add the "show" class to DIV
        x.className = "show";
     
        // After 3 seconds, remove the show class from DIV
        setTimeout(function () {

          x.className = x.className.replace("show", "");
        }, 3000);
      }
      editProduct.querySelector(".alert-success").textContent = "Product Saved";
      editProduct.querySelector(".alert-success").style.display = "block";
      setTimeout(() => {
        editProduct.querySelector(".alert-success").style.display = "none";
      }, 5000);
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

const uploadMainImg = (e) => {
  mainImg = e.target.files[0];
  mainImagesUrl= extractImgUrl(mainImg)
  
  console.log(mainImagesUrl)

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
