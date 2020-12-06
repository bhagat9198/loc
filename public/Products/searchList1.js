const db = firebase.firestore();

const addSearchListFormHTML = document.querySelector("#add-searchList-form");
const dbRef =  db.collection('miscellaneous').doc('searchList');
let searchListArr = [];
let allCatArr = [];

dbRef.onSnapshot(searchDoc => {
  let searchData = searchDoc.data();
  searchListArr = searchData.Details;
})

const addSearchList = (e) => {
  e.preventDefault();
  let name = addSearchListFormHTML['searchlist-name'].value;
  let cat, subCat;
  cat = addSearchListFormHTML['category-name-dropdown'].value;
  subCat = addSearchListFormHTML['sub-category-name-dropdown'].value || '';

  let data = {
    Name : name,
    Category : cat,
    SubCategory: subCat,
    id: new Date().valueOf()
  }
  searchListArr.push(data);
  // dbRef.get().then()
  // console.log(searchListArr);
  dbRef.update('Details', searchListArr);
  displaySearchLists();
};

addSearchListFormHTML.addEventListener("submit", addSearchList);

// const addCategoryNoSubmit = (e) => {
//   if (e.keyCode === 13) {
//     e.preventDefault();
//   }
// };

// addSearchListFormHTML.addEventListener("keypress", addCategoryNoSubmit);

const allSearchlistsHTML = document.querySelector('#all-searchlists');

const displaySearchLists = () => {
  let card = '';
  searchListArr.map((sl, index) => {
    let catName, subCatName;
    // console.log(allCatArr);
    // let cat = allCatArr.filter( c => sl.Category === c.docId);
    // console.log(res[0].data.name);
    for(let cat of allCatArr) {
      if(cat.docId === sl.Category) {
        catName = cat.data.name;
        for(let subCat of cat.data.subCategory) {
          // console.log(subCat.id, sl.SubCategory.split('__')[1]);
          if(+subCat.id === +sl.SubCategory.split('__')[1]) {
            subCatName = subCat.name;
          }
        }
      }
    }

    card += `
    <div class="col-lg-2" style="margin-bottom:2%">
      <div class="card">
        <i class="fa fa-thumb-tack"></i> 
        <h5><span>${sl.Name}</span>&nbsp;<i onclick="deleteSearchItem(event)" data-index="${index}" style="cursor: pointer; float: right; font-size: 1.5rem; color: red" class="fa fa-trash"></i></h5>
        <small><span>Cat:</span>${catName}</small>
        <small><span>SubCat:</span>${subCatName}</small>
      </div>
    </div>
    `;
  });
  allSearchlistsHTML.innerHTML = card;
}

const deleteSearchItem = e => {
  let index = e.target.dataset.index;
  // console.log(index);

  searchListArr.splice(+index, 1);
  displaySearchLists();
  dbRef.update('Details', searchListArr);
}


const categoryNameDropdownHTML = addSearchListFormHTML.querySelector(
  "#category-name-dropdown"
);
const subCategoryNameDropdownHTML = addSearchListFormHTML.querySelector(
  "#sub-category-name-dropdown"
);

categoryNameDropdownHTML.addEventListener("change", (e) => {
  subCategoryNameDropdownHTML.disabled = false;
  displaySubCatergories(e.target.value);
});

const displayCatergories = (data) => {
  let options = '<option disabled selected value="">Select Category</option>';
  data.map((doc) => {
    let docData = doc.data();
    allCatArr.push({data: docData, docId: doc.id});
    // console.log(docData);
    options += `
    <option value="${doc.id}">${docData.name}</option>
    `;
  });
  categoryNameDropdownHTML.innerHTML = options;
  displaySearchLists();
};

const displaySubCatergories = async (data) => {
  let options = "<option disabled selected >Select Sub Category</option>";
  await db
    .collection("categories")
    .doc(data)
    .get()
    .then((doc) => {
      // console.log(doc);
      let docData = doc.data();
      docData.subCategory.map((subCat) => {
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


db.collection("categories").onSnapshot((snapshot) => {
  let snapshotDocs = snapshot.docs;
  displayCatergories(snapshotDocs);
});
