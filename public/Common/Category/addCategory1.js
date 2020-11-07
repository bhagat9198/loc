console.log("addCategory.js");
const db = firebase.firestore();
const storageService = firebase.storage();

const addCategoryForm = document.querySelector("#add-category-form");
const categoryNameDropdownHTML = addCategoryForm.querySelector(
  "#category-name-dropdown"
);
const subCategoryNameDropdownHTML = addCategoryForm.querySelector(
  "#sub-category-name-dropdown"
);

let categoryImg;

const displayCatergories = (data) => {
  let options = '<option selected disabled value="">Select Category</option>';
  data.map((doc) => {
    let docData = doc.data();
    // console.log(docData);
    options += `
    <option value="${doc.id}">${docData.name}</option>
    `;
  });
  categoryNameDropdownHTML.innerHTML = options;
};

const displaySubCatergories = async (data) => {
  let options = "<option selected disabled >Select Sub Category</option>";
  await db
    .collection("categories")
    .doc(data)
    .get()
    .then((doc) => {
      // console.log(doc);
      let docData = doc.data();
      docData.subCategory.map(subCat => {
        // console.log(subCat);
        options += `
        <option value="${doc.id}__${subCat.id}">${subCat.name}</option>
        `;
      });
      subCategoryNameDropdownHTML.innerHTML = options;
    })
    .catch((error) => {
      console.log(error);
    });
};

const extractCategories = async () => {
  let data;
  await db
    .collection("categories")
    .get()
    .then((snapshot) => {
      let snapshotDocs = snapshot.docs;
      data = snapshotDocs;
    });
  return data;
};

extractCategories()
  .then((response) => {
    // console.log(response);
    displayCatergories(response);
  })
  .catch((error) => {
    console.log(error);
  });

categoryNameDropdownHTML.addEventListener("change", (e) => {
  // console.log(e.target.value);
  subCategoryNameDropdownHTML.disabled = false;
  addCategoryForm['category-name'].disabled = true;
  displaySubCatergories(e.target.value);
});

subCategoryNameDropdownHTML.addEventListener('change', e => {
  addCategoryForm['sub-category-name'].disabled = true;
})

const addCategory = (event) => {
  // event.preventDefault();
  event.preventDefault();
  let lower;
  let categoryName = addCategoryForm["category-name"].value;
  // console.log(categoryName);
  lower = categoryName.toLowerCase();
  categoryName = categoryName.charAt(0).toUpperCase() + lower.slice(1);

  let subCategoryName = addCategoryForm["sub-category-name"].value;
  // console.log(subCategoryName);
  lower = subCategoryName.toLowerCase();
  subCategoryName = subCategoryName.charAt(0).toUpperCase() + lower.slice(1);

  const categoryNameOption = addCategoryForm['category-name-dropdown'].value;
  // console.log(categoryNameOption);
  const subCategoryNameOption = addCategoryForm['sub-category-name-dropdown'].value;
  // console.log(subCategoryNameOption);

  let childCategories = [];
  addCategoryForm
    .querySelectorAll('input[name="child-category"]')
    .forEach((childCategory) => {
      // console.log(childCategory);
      let childName = childCategory.value;
      lower = childName.toLowerCase();
      childName = childName.charAt(0).toUpperCase() + lower.slice(1);

      childCategories.push({
        name: childName,
        id: Math.floor(1000000000000000 + Math.random() * 9000000000),
        isActivated: true,
      });
    });
  // console.log(childCategories);
  let categoryImgName = "";
  if (categoryImg) {
    categoryImgName = categoryImg.name;
  }

  let wholeCategoryData = {
    name: categoryName,
    img: categoryImgName,
    subCategory: [
      {
        name: subCategoryName,
        id: Math.floor(1000000000000000 + Math.random() * 9000000000000000),
        childCategories: childCategories,
        isActivated: true,
      },
    ],
    isActivated: true,
  };

  // console.log(wholeCategoryData);

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

  async function  updateSubCategoryReq(data) {
    console.log(typeof(data));

    let docRef = await db.collection('categories').doc(data);
    // console.log(docRef);
    docRef.get().then(async (snapshot) => {
      // console.log(snapshot);
      let docData = snapshot.data();
      console.log(docData);
      docData.subCategory.push({
        name: subCategoryName,
        id: Math.floor(1000000000000000 + Math.random() * 9000000000),
        childCategories: childCategories,
        isActivated: true,
      });

      addCategoryForm.reset();
      await docRef.update(docData);
    });
  }

  async function  updateChildCategoryReq(data) {
    // console.log(data);
    let docId, subCatId;
    docId = data.substring(0, 20);
    subCatId = data.substring(22);
    let docRef = await db.collection('categories').doc(docId);

    docRef.get().then(async (snapshot) => {
      // console.log(snapshot);
      let docData = snapshot.data();
      docData.subCategory.map(sc => {
        if(+sc.id === +subCatId) {
          sc.childCategories.push(...childCategories);
        }
      })
      addCategoryForm.reset();
      await docRef.update(docData);
    });
  }

  if(!addCategoryForm['category-name'].disabled && !addCategoryForm['sub-category-name'].disabled) {
    addCategoryReq(wholeCategoryData)
    .then(async (response) => {
      let imgUrl;
      if (categoryImg) {
        await storageService
          .ref(`categories/${response.docId}/${response.data.img}`)
          .put(categoryImg);
        
        await storageService.ref(`categories/${response.docId}/${response.data.img}`).getDownloadURL().then(url => {
          imgUrl = url;
        }).catch(error => {
          console.log(error);
        });
      }
      console.log(imgUrl);

      let docRef = await db.collection('categories').doc(response.docId);
      docRef.get().then(async(snapshot) => {
        console.log(snapshot);
        let docData = snapshot.data();
        docData.imgUrl = imgUrl;
        console.log(docData);
        await docRef.update(docData);
      })
      console.log('done');

      // console.log(response);
      addCategoryForm.reset();
    })
    .catch((error) => {
      console.log(error);
    });
  } else if(addCategoryForm['category-name'].disabled && !addCategoryForm['sub-category-name'].disabled){
    updateSubCategoryReq(categoryNameOption);
  } else if(addCategoryForm['category-name'].disabled && addCategoryForm['sub-category-name'].disabled) {
    updateChildCategoryReq(subCategoryNameOption);
  } else {
    console.log('invalid');
  }
  
};
addCategoryForm.addEventListener("submit", addCategory);

addCategoryForm
  .querySelector('input[name="category-img"]')
  .addEventListener("change", (e) => {
    categoryImg = e.target.files[0];
  });
