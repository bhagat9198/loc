console.log("addCategory.js");
const db = firebase.firestore();
const storageService = firebase.storage();

const addCategoryForm = document.querySelector("#add-category-form");
let categoryImg;

const addCategory = (event) => {
  // event.preventDefault();
  event.preventDefault();
  const categoryName = addCategoryForm["category-name"].value;
  console.log(categoryName);
  const subCategoryName = addCategoryForm["sub-category-name"].value;
  console.log(subCategoryName);
  let childCategories = [];
  addCategoryForm
    .querySelectorAll('input[name="child-category"]')
    .forEach((childCategory) => {
      console.log(childCategory);
      childCategories.push({
        name: childCategory.value,
        id: Math.random(),
        isActivated: true,
      });
    });
  console.log(childCategories);
  let categoryImgName = "";
  if (categoryImg) {
    categoryImgName = categoryImg.name;
  }

  let wholeCategoryData = {
    name: categoryName,
    img: categoryImgName,
    subCategory: {
      name: subCategoryName,
      id: Math.random(),
      childCategories: childCategories,
      isActivated: true,
    },
    isActivated: true,
  };

  console.log(wholeCategoryData);

  async function addCategoryReq(data) {
    console.log(data);
    let docId;
    await db
      .collection("categories")
      .add(data)
      .then((dataSaved) => {
        docId = dataSaved.id;
      })
      .catch((error) => {
        console.log(error);
      });

    return { data: data, docId: docId };
  }

  addCategoryReq(wholeCategoryData)
    .then(async (response) => {
      if (categoryImg) {
        await storageService
          .ref(`categories/${response.docId}/${response.data.img}`)
          .put(categoryImg);
      }
      
      console.log(response);
    })
    .catch((error) => {
      console.log(error);
    });
};
addCategoryForm.addEventListener("submit", addCategory);

addCategoryForm
  .querySelector('input[name="category-img"]')
  .addEventListener("change", (e) => {
    categoryImg = e.target.files[0];
  });
