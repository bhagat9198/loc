console.log("AddProduct1.js");

const db = firebase.firestore();

const addProduct = document.querySelector("#add-product");
const productMainImgHandler = addProduct.querySelector("#product-main-image");
const productSubImgsHandler = addProduct.querySelector("#product-sub-imgs");
const productCategoryHTML = addProduct.querySelector("#product-category");
const productSubCategoryHTML = addProduct.querySelector(
  "#product-sub-category"
);
const productChildCategoryHTML = addProduct.querySelector(
  "#product-child-category"
);
// const allAddonsHTML = addProduct.querySelector("#all-addons");

let mainImg, subImgs;
let allCategories, choosenCategory;

const displayCategories = (data) => {
  let options = '<option selected disabled value="">Select Category*</option>';
  data.map((doc) => {
    let docData = doc.data();
    // console.log(doc.id);
    options += `
    <option value="${doc.id}__${docData.name}">${docData.name}</option>
    `;
  });
  
  productCategoryHTML.innerHTML = options;
};

const extractCategories = async () => {
  let data;
  await db
    .collection("categories")
    .get()
    .then((snapshot) => {
      let snapshotDocs = snapshot.docs;
      data = snapshotDocs;
    })
    .catch((error) => {
      console.log(error);
    });

  return data;
};

extractCategories()
  .then((response) => {
    // console.log(response);
    allCategories = response;
    displayCategories(response);
  })
  .catch((error) => {
    console.log(error);
  });

const displaySubCategory = async (data, elHTML) => {
  // console.log(data);
  let docId = data.substring(0, 20);
  let options =
    '<option selected disabled value="">Select Sub Category*</option>';
  let dbRef = await db.collection("categories").doc(docId);

  dbRef
    .get()
    .then((snapshot) => {
      // console.log(snapshot.data());
      let docData = snapshot.data();
      docData.subCategory.map((sc) => {
        // console.log(sc);
        options += `
        <option value="${docId}__${sc.id}__${sc.name}">${sc.name}</option>
        `;
      });
      // console.log(options);
      // console.log(elHTML);
      elHTML.innerHTML = options;
    })
    .catch((error) => {
      console.log(error);
    });
};

productCategoryHTML.addEventListener("change", (e) => {
  // console.log(e.target.value);
  choosenCategory = e.target.value;
  productSubCategoryHTML.disabled = false;
  displaySubCategory(e.target.value, productSubCategoryHTML);
});

const displayChildCategory = async (data, elHTML) => {
  let docId, scId;
  // console.log(data);
  docId = data.substring(0, 20);
  // console.log(docId);
  // scId = data.substring(22, 38);
  scId = data.split('__')[1];
  console.log(scId);

  let dbRef = await db.collection("categories").doc(docId);

  dbRef
    .get()
    .then((snapshot) => {
      // console.log(snapshot.data());
      let docData = snapshot.data();
      let options =
        '<select id="product-child-category" disabled name="product-child-category">';
      docData.subCategory.map((sc) => {
        if (+sc.id === +scId) {
          // console.log(sc);
          sc.childCategories.map((cc) => {
            // console.log(cc);
            options += `
            <option value="${docId}__${scId}__${cc.id}__${cc.name}">${cc.name}</option>
            `;
          });
        }
      });
      // console.log(options);
      // console.log(elHTML);
      elHTML.innerHTML = options;
    })
    .catch((error) => {
      console.log(error);
    });
};

productSubCategoryHTML.addEventListener("change", (e) => {
  choosenCategory = e.target.value;
  productChildCategoryHTML.disabled = false;
  displayChildCategory(e.target.value, productChildCategoryHTML);
});

// const displayAddons = (data) => {
//   let addon = "";
//   // console.log(data);
//   data.map((doc) => {
//     let docData = doc.data();
//     // console.log(docData);
//     addon += `
//     <h5 class="addon"><input type="checkbox" name="product-addon" value="${doc.id}__${docData.name}" class="addon">&nbsp;${docData.name}</h5><br>
//     `;
//   });
//   allAddonsHTML.innerHTML = addon;
// };

// const extractAddons = async () => {
//   let addonsData;
//   await db
//     .collection("addons")
//     .get()
//     .then((snapshot) => {
//       let snapshotDocs = snapshot.docs;
//       addonsData = snapshotDocs;
//     })
//     .catch((error) => {
//       console.log(error);
//     });

//   return addonsData;
// };

// extractAddons()
//   .then((response) => {
//     // console.log(response);
//     displayAddons(response);
//   })
//   .catch((error) => {
//     console.log(error);
//   });

const addProductForm = (event) => {
  console.log(event);

  document.getElementById("successProduct").style.display = "block";
  document.getElementById("successProduct").innerHTML = "Please wait ...Adding the product  &#128513;";
 
  event.preventDefault();
  let productName,
    productType, productTypeColorStart, productTypeColorEnd,
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
  let weightPrice, cakeType, weightPrevPrice;

  productName = addProduct["product-name"].value;
  productType = addProduct["product-type"].value;
  productTypeColorStart = addProduct["product-type-color-start"].value;
  productTypeColorEnd = addProduct["product-type-color-end"].value;
  productSno = addProduct["product-sno"].value;
  productCategory = addProduct["product-category"].value;
  productSubCategory = addProduct["product-sub-category"].value;
  productChildCategory = addProduct["product-child-category"].value;
  productMRP = addProduct["product-mrp"].value;
  productSP = addProduct["product-sp"].value;
  productGST = addProduct["product-gst"].value;
  productTotalPrice = addProduct["product-total-price"].value;

  let lower;
  lower = productName.toLowerCase();
  productName = productName.charAt(0).toUpperCase() + lower.slice(1);

  // addProduct
  //   .querySelectorAll('input[name="product-addon"]:checked')
  //   .forEach((addon) => {
  //     productAddons.push(addon.value);
  //   });

  // addProduct.querySelectorAll('input[name="product-tag"]').forEach((tag) => {
  //   productTags.push(tag.value);
  // });

  productTags = addProduct["product-tag"].value;
  console.log(productTags);

  productDescription = $(".textarea1").summernote("code");
  productPolicy = $(".textarea2").summernote("code");

  if (productCategory.toUpperCase().includes("CAKE")) {
    addProduct
      .querySelectorAll('input[name="cake-weight"]')
      .forEach((weight) => {
        if (weight.checked) {
          if (weight.value == "half") {
            weightPrice = addProduct["cake-price-half"].value;
            weightPrevPrice = addProduct["cake-prevPrice-half"].value;
            console.log(weightPrice);
          } else if (weight.value === "one") {
            weightPrice = addProduct["cake-price-one"].value;
            weightPrevPrice = addProduct["cake-prevPrice-one"].value;
          } else if (weight.value === "oneHalf") {
            weightPrice = addProduct["cake-price-oneHalf"].value;
            weightPrevPrice = addProduct["cake-prevPrice-oneHalf"].value;
          } else if (weight.value === "two") {
            weightPrice = addProduct["cake-price-two"].value;
            weightPrevPrice = addProduct["cake-prevPrice-two"].value;
          } else if (weight.value === "three") {
            weightPrice = addProduct["cake-price-three"].value;
            weightPrevPrice = addProduct["cake-prevPrice-three"].value;
          } else if (weight.value === "four") {
            weightPrice = addProduct["cake-price-four"].value;
            weightPrevPrice = addProduct["cake-prevPrice-four"].value;
          } else if (weight.value === "five") {
            weightPrice = addProduct["cake-price-five"].value;
            weightPrevPrice = addProduct["cake-prevPrice-five"].value;
          } else {
            weightPrice = addProduct["cake-price-six"].value;
            weightPrevPrice = addProduct["cake-prevPrice-six"].value;
          }
          let data = {
            cakeWeight: weight.value,
            weightPrice: weightPrice,
            weightPrevPrice: weightPrevPrice,
          };

          cakeWeights.push(data);
        }
      });

    addProduct.querySelectorAll('input[name="cake-shape"]').forEach((shape) => {
      if (shape.checked) {
        if (shape.value === "Heart") {
          cakeShapes.push({
            shape: shape.value,
            shapePrice: addProduct["cake-price-heart"].value,
          });
        } else {
          cakeShapes.push({
            shape: shape.value,
            shapePrice: null,
          });
        }
      }
    });

    addProduct
      .querySelectorAll('input[name="cake-flavour"]:checked')
      .forEach((flavour) => {
        cakeFlavours.push(flavour.value);
      });

    if (addProduct.querySelector('input[name="cake-type"]:checked')) {
      cakeType = {
        type: "Eggless",
        price: addProduct["cake-price-eggless"].value,
      };
    }
  }

  if (mainImg) {
    productMainImg = `${Math.random()}_${mainImg.name}`;
  } else {
    productMainImg = "";
  }
  if (subImgs) {
    productSubImgs = [...subImgs].map((img) => `${Math.random()}_${img.name}`);
  }


  let wholeProduct = {
    name: productName,
    bannerType: productType,
    bannerTypeColorStart: productTypeColorStart,
    bannerTypeColorEnd: productTypeColorEnd,
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
    isActivated: true,
  };

  if (productCategory.toUpperCase().includes("CAKES")) {
    wholeProduct.weights = cakeWeights || "";
    wholeProduct.shapes = cakeShapes || "";
    wholeProduct.type = cakeType || "";
    wholeProduct.flavours = cakeFlavours || "";
  }

  console.log(wholeProduct);
  // let c = wholeProduct.wholeSubCategory.substring(43);
  // console.log(c);
  // let cc = wholeProduct.wholeChildCategory.substring(63);
  // console.log(cc);

  async function addProductFun(data) {
    console.log(data);
    // console.log(data.category, typeof data.category);
    let dataId, prodData;
    await db
      .collection(data.wholeCategory.split('__')[0])
      .add(data)
      .then((dataSaved) => {
        // console.log(dataSaved.id);
        dataId = dataSaved.id;
      })
      .catch((error) => {
        console.log(error);
      });
    return { dataId: dataId, prodData: data };
  }

  addProductFun(wholeProduct)
    .then(async (response) => {
      const storageService = firebase.storage();
      if (mainImg) {
        await storageService
          .ref(
            `${response.prodData.wholeCategory.split('__')[0]}/${response.dataId}/${response.prodData.mainImg}`
          )
          .put(mainImg);
      }

      let counter;
      if(subImgs) {
        counter = -1;
        for (let img of subImgs) {
          counter++;
          // console.log(img);
          let name = [...response.prodData.subImgs][counter];
          let id = response.dataId;
          await storageService
            .ref(`${response.prodData.wholeCategory.split('__')[0]}/${id}/${name}`)
            .put(img);
          // console.log(counter);
        }
      };

      async function extractImgUrl(imgPath) {
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

      let mainUrl;
      if (mainImg) {
        mainUrl = await extractImgUrl(
          `${response.prodData.wholeCategory.split('__')[0]}/${response.dataId}/${response.prodData.mainImg}`
        );
      }
      console.log(mainUrl);
      let subUrls = [];
      if (subImgs) {
        counter = -1;
        for (let img of subImgs) {
          counter++;
          // console.log(img);
          let name = [...response.prodData.subImgs][counter];
          let id = response.dataId;
          let url = await extractImgUrl(
            `${response.prodData.wholeCategory.split('__')[0]}/${id}/${name}`
          );
          subUrls.push(url);
        }
      }
      console.log(subUrls);

      let docRef = await db
        .collection(`${response.prodData.wholeCategory.split('__')[0]}`)
        .doc(response.dataId);
      // console.log(docRef);
      docRef.get().then(async (snapshot) => {
        // console.log(snapshot);
        let docData = snapshot.data();
        // console.log(docData);
        docData.mainImgUrl = mainUrl;
        docData.subImgsUrl = subUrls;
        await docRef.update(docData);
      });

      // addProduct.reset();
      addProduct.querySelector(".alert-success").textContent = "Product Saved";
      addProduct.querySelector(".alert-success").style.display = "block";
   
      document.getElementById("successProduct").innerHTML = "Product Added Sucessfully  &#128512;";
      document.getElementById("successProduct").style.backgroundColor ="rgb(89, 151, 89)";
      document.getElementById("successProduct").style.display = "block";
      

      setTimeout(() => {
        addProduct.querySelector(".alert-success").style.display = "none";
        document.getElementById("successProduct").style.display = "none";
      }, 5000);

      const searchRef = db.collection('miscellaneous').doc('searchList');
      searchRef.get().then(seachDoc => {
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

        // console.log(searchData);
        searchRef.update(searchData);
      })
    })
    .catch((error) => {
      console.log(error);
      addProduct.querySelector(".alert-danger").innerHTML = error.message;
      document.getElementById("successProduct").innerHTML = error.message +" &#x1F610;";
      document.getElementById("successProduct").style.backgroundColor ="red";
      addProduct.querySelector(".alert-danger").style.display = "block";
      document.getElementById("successProduct").style.display = "block";
      setTimeout(() => {
        addProduct.querySelector(".alert-danger").style.display = "none";
        document.getElementById("successProduct").style.display = "none";
      }, 5000);
    });
};

addProduct.addEventListener("submit", addProductForm);

const addProductFormNotSubmit = e => {
  if (e.keyCode == 13) {
    e.preventDefault();
    return false;
  }
}
addProduct.addEventListener("keypress", addProductFormNotSubmit);


const uploadMainImg = (e) => {
  mainImg = e.target.files[0];
  console.log(mainImg);
};
productMainImgHandler.addEventListener("change", uploadMainImg);

const uploadSubImgs = (e) => {
  subImgs = e.target.files;
  console.log(subImgs);
};
productSubImgsHandler.addEventListener("change", uploadSubImgs);

const calculate = (e) => {
  // console.log(e.target.value);
  let sp = addProduct.querySelector("#product-sp");
  let gst = addProduct.querySelector("#product-gst");
  let total = addProduct.querySelector("#product-total-price");
  // console.log(sp.value);
  // console.log(gst.value);
  if(sp.value && gst.value) {
    // console.log(sp.value, gst.value);
    // console.log(typeof(+sp.value), typeof(+gst.value));
    total.value = Math.round(+sp.value + (+sp.value * +(gst.value/100)));
    // total.innerHTML = +sp * (+sp + +gst*100);
    console.log(+sp * (+sp + +gst*100));
  }

};


addProduct.querySelector("#product-sp").addEventListener("keyup", calculate);
addProduct.querySelector("#product-gst").addEventListener("keyup", calculate);


