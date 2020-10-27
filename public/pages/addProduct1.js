console.log("AddProduct1.js");

const storageService = firebase.storage();
const storageRef = storageService.ref();

const addProduct = document.querySelector("#add-product");
const productMainImgHandler = addProduct.querySelector("#product-main-image");
const productSubImgsHandler = addProduct.querySelector("#product-sub-imgs");


let mainImg, subImgs;

const addProductForm = (event) => {
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
  let productSubImgs =[];
  let cakeWeights = [];
  let cakeShapes = [];
  let cakeFlavours = [];
  let weightPrice, cakeType;

  productName = addProduct["product-name"].value;
  productSno = addProduct["product-sno"].value;
  productCategory = addProduct["product-category"].value;
  productSubCategory = addProduct["product-sub-category"].value;
  productChildCategory = addProduct["product-child-category"].value;

  productMRP = addProduct["product-mrp"].value;
  productSP = addProduct["product-sp"].value;
  productGST = addProduct["product-gst"].value;
  productTotalPrice = addProduct["product-total-price"].value;

  addProduct
    .querySelectorAll('input[name="product-addon"]')
    .forEach((addon) => {
      productAddons.push(addon.value);
    });

  addProduct.querySelectorAll('input[name="product-tag"]').forEach((tag) => {
    productTags.push(tag.value);
  });

  productDescription = $(".textarea1").summernote("code");
  productPolicy = $(".textarea2").summernote("code");

  if (productCategory === "Cake") {
    addProduct
      .querySelectorAll('input[name="cake-weight"]')
      .forEach((weight) => {
        if (weight.checked) {
          if (weight.value == "half") {
            weightPrice = addProduct["cake-price-half"].value;
            console.log(weightPrice);
          } else if (weight.value === "one") {
            weightPrice = addProduct["cake-price-one"].value;
          } else if (weight.value === "oneHalf") {
            weightPrice = addProduct["cake-price-oneHalf"].value;
          } else if (weight.value === "two") {
            weightPrice = addProduct["cake-price-two"].value;
          } else if (weight.value === "three") {
            weightPrice = addProduct["cake-price-three"].value;
          } else if (weight.value === "four") {
            weightPrice = addProduct["cake-price-four"].value;
          } else if (weight.value === "five") {
            weightPrice = addProduct["cake-price-five"].value;
          } else {
            weightPrice = addProduct["cake-price-six"].value;
          }
          let data = {
            cakeWeight: weight.value,
            weightPrice: weightPrice,
          };

          cakeWeights.push(data);
        }
      });

    addProduct.querySelectorAll('input[name="cake-shape"]').forEach(shape => {
      if(shape.checked) {
        if(shape.value === 'Heart') {
          cakeShapes.push({
            shape: shape.value,
            shapePrice: addProduct['cake-price-heart'].value
          });
        } else {
          cakeShapes.push({
            shape: shape.value,
            shapePrice: null
          });
        }
      }
    });

    addProduct.querySelectorAll('input[name="cake-flavour"]').forEach(flavour => {
      cakeFlavours.push(flavour);
    })

    if( addProduct.querySelector('input[name="cake-type"]:checked')) {
      cakeType = {
        type: 'Eggless',
        price: addProduct['cake-price-eggless'].value
      }
    }; 
  }

  productMainImg = mainImg.name;
  // console.log(productMainImg);
  // productSubImgs = [...subImgs].map(img => img.name);
  productSubImgs = "8";

  // for(const img in subImgs) {
  //   console.log(subImgs[img]);
  //   console.log(img);
  //   // productSubImgs.push(img.name);
  // }
  console.log(productSubImgs);

  let wholeProduct = {
    name: productName,
    sno: productSno,
    category: productCategory,
    subCategory: productSubCategory,
    childCategory: productChildCategory,
    mrp: productMRP,
    sp: productSP,
    gst: productGST,
    totalPrice: productTotalPrice,
    tags: productTags,
    descriptions: productDescription,
    policy: productPolicy,
    mainImg: productMainImg,
    subImgs: productSubImgs,
    addons: productAddons
  }

  if(productCategory === "Cake") {
    wholeProduct.weights = cakeWeights;
    wholeProduct.shapes = cakeShapes;
    wholeProduct.type = cakeType;
    wholeProduct.flavours = cakeFlavours;
  }

  const addProductRequest = firebase.functions().httpsCallable('addProductRequest');
  addProductRequest(wholeProduct) 
  .then((data) => {
    console.log(data);
    console.log(data.id);
    console.log(data[0]);

    addProduct.reset();
    addProduct.querySelector('.alert-success').textContent = 'Product Saved';
    addProduct.querySelector('.alert-success').style.display = "block";
    setTimeout(() => {
      addProduct.querySelector('.alert-success').style.display = "none";
    }, 3000);
  })
  .catch(error => {
    console.log('error ', error.message);
    console.log('error ', error.code);
    console.log('error ', error.details);
    addProduct.querySelector('.alert-danger').innerHTML =  error.message;
    addProduct.querySelector('.alert-danger').style.display = "block";
    setTimeout(() => {
      addProduct.querySelector('.alert-danger').style.display = "none";
    }, 3000);
  });

};

addProduct.addEventListener("submit", addProductForm);

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

// Feature Section

$("#product-tag-btn").on("click", function () {
  $("#feature-section").append(
    "" +
      '<div class="feature-area">' +
      '<span class="remove feature-remove"><i class="fas fa-times"></i></span>' +
      '<div  class="row">' +
      '<div class="col-lg-12">' +
      '<input type="text" name="product-tag" class="input-field" placeholder="Enter Your Keyword">' +
      "</div>" +
      "</div>" +
      "</div>" +
      ""
  );
  // $(".cp").colorpicker();
});

$(document).on("click", ".feature-remove", function () {
  $(this.parentNode).remove();
  // if (isEmpty($("#feature-section"))) {
  //   $("#feature-section").append(
  //     "" +
  //       '<div class="feature-area">' +
  //       '<span class="remove feature-remove"><i class="fas fa-times"></i></span>' +
  //       '<div  class="row">' +
  //       '<div class="col-lg-6">' +
  //       '<input type="text" name="product-tag" class="input-field" placeholder="Enter Your Keyword">' +
  //       "</div>" +
  //       "</div>" +
  //       "</div>" +
  //       ""
  //   );
  //   // $(".cp").colorpicker();
  // }
});
