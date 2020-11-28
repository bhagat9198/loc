
const db = firebase.firestore();

const addCategoryForm = document.querySelector("#add-category-form");
const categoryNameDropdownHTML = addCategoryForm.querySelector(
    "#category-name-dropdown"
);
const subCategoryNameDropdownHTML = addCategoryForm.querySelector(
    "#sub-category-name-dropdown"
);

let categoryImg;

const displayCatergories = (data) => {
    let options = '<option selected value="">Select Category</option>';
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
    let options = "<option selected >Select Sub Category</option>";
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

    displaySubCatergories(e.target.value);
});



const addCategory = (event) => {
    // event.preventDefault();
    event.preventDefault();
    let lower;

    let categoryName = addCategoryForm["category-name"].value;
    // console.log(categoryName);
    lower = categoryName.toLowerCase();
    categoryName = categoryName.charAt(0).toUpperCase() + lower.slice(1);

    //   let subCategoryName = addCategoryForm["sub-category-name"].value;
    // console.log(subCategoryName);
    //   lower = subCategoryName.toLowerCase();
    //   subCategoryName = subCategoryName.charAt(0).toUpperCase() + lower.slice(1);


    const categoryNameOption = document.getElementById('category-name-dropdown').value;
    
    const subCategoryNameOption = document.querySelector('#sub-category-name-dropdown').value;

    let wholeCategoryData = {
        Keyword: categoryName,
        Details: [
            {
                Name:categoryName,
                Category: categoryNameOption,
                SubCategory: subCategoryNameOption,
                id: Math.floor(1000000000000000 + Math.random() * 9000000000000000),               
            },
        ],
       

    };

    // console.log(wholeCategoryData);
    addCategoryReq(wholeCategoryData)
}
async function addCategoryReq(data) {
    console.log(data)
    alert(8)
    console.log(data);
    let docId;
    await db
        .collection("miscellaneous").doc("searchList")
        .set(data)
        .then((dataSaved) => {
            alert("DONE")
        })
        .catch((error) => {
            console.log(error);
        });
   
    return { data: data, docId: docId };
}








addCategoryForm.addEventListener("submit", addCategory);

const addCategoryNoSubmit = e => {
    console.log(e);
    if (e.keyCode === 13) {

        e.preventDefault();
    }
}

// addCategoryForm.addEventListener("keypress", addCategoryNoSubmit);

// addCategoryForm
//   .querySelector('input[name="category-img"]')
//   .addEventListener("change", (e) => {
//     categoryImg = e.target.files[0];
//   });
