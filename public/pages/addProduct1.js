console.log("AddProduct1.js");

// let aa = $('.asd').eq(1).summernote('code'); 
const addProduct = document.querySelector("#add-product");

const addProductForm = (event) => {
  event.preventDefault();
  // console.log(event);
  let productName,
    productSno,
    productCategory,
    productSubCategory,
    productChildCategory,
    productMRP,
    productSP,
    productGST,
    productTotalPrice,
    productMainImg,
    productSubImgs,
    productDescription;

  let productTags = [];
  let productAddons = [];
  let cakeWeight, cakeFlavours;

  let cakePriceHalf,
    cakePriceOne,
    cakePriceOneHalf,
    cakePriceTwo,
    cakePriceThree,
    cakePriceFour,
    cakePriceFive,
    cakePriceSix;
  let cakeWeightHalf,
    cakeWeightOne,
    cakeWeightOneHalf,
    cakeWeightTwo,
    cakeWeightThree,
    cakeWeightFour,
    cakeWeightFive,
    cakeWeightSix;

  productName = addProduct["product-name"].value;
  productSno = addProduct["product-sno"].value;
  productCategory = addProduct["product-category"].value;
  productSubCategory = addProduct["product-sub-category"].value;
  productChildCategory = addProduct["product-child-category"].value;

  productMRP = addProduct["product-mrp"].value;
  productSP = addProduct["product-sp"].value;
  productGST = addProduct["product-gst"].value;
  productTotalPrice = addProduct["product-total-price"].value;

  if (productCategory === "Cake") {
    cakeWeight = addProduct.querySelectorAll('input[name="cake-weight"]');
  }

  addProduct
    .querySelectorAll('input[name="product-addon"]')
    .forEach((addon) => {
      productAddons.push(addon.value);
    });

  addProduct.querySelectorAll('input[name="product-tag"]').forEach((tag) => {
    productTags.push(tag.value);
  });

  // productDescription = aa;

  // productDescription = addProduct['product-desc'].value;

  console.log(productDescription);
};

addProduct.addEventListener("submit", addProductForm);

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
