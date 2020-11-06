console.log("viewCategory.js");
const db = firebase.firestore();
const storageService = firebase.storage();

const mainCategoryHTML = document.querySelector(".main-category");
const subCategoryHTML = document.querySelector(".sub-category");
const childCategoryHTML = document.querySelector(".child-category");

async function imgUrlFun(imgPath) {
  let imgUrl;
  await storageService
    .ref(imgPath)
    .getDownloadURL()
    .then((url) => (imgUrl = url))
    .catch((error) => console.log(error));
  return imgUrl;
}

const displayCategories = async (data) => {
  let tRows = "";
  for (let doc of data) {
    let docData = doc.data();
    // console.log(docData);
    let imgUrl = await imgUrlFun(`categories/${doc.id}/${docData.img}`);
    tRows += `
    <tr role="row" class="odd parent">
      <td tabindex="0"> <input type="text" value="${docData.name}" class="editField">
        <i class="fas fa-check"  style="margin: 3%;cursor: pointer;"></i> </td>
      <td><img src="${imgUrl}">
        <br>
        <input type="file" name="category-img" class="mybtn2" accept="image/*">
      </td>
      <td>
        <div class="action-list">
          <select class="process  drop-success" style="display: block;">
            <option data-val="1" value="true" selected="">Activated</option>
            <option data-val="0" value="false"> Deactivated</option>
          </select>
        </div>
      </td>
      <td>
        <div class="godropdown"><button class="go-dropdown-toggle">
            Delete
        </div>
      </td>
    </tr>
    `;
  }
  mainCategoryHTML.innerHTML = tRows;
};

const displaySubCategories = (data) => {
  // console.log(data)
  let tRows = "";
  data.map((doc) => {
    let docData = doc.data();
    // console.log(docData);
    // console.log(docData.subCategory.name)
    docData.subCategory.map(sc => {
      tRows += `
      <tr role="row" class="odd parent">
        <td><input type="text" class="editField" value="${sc.name}">
          <i class="fas fa-check" style="margin: 3%;cursor: pointer;"></i> </td>
        <td tabindex="0">${docData.name}</i> </td>
        <td>
          <div class="action-list">
            <select class="process  drop-success" style="display: block;">
              <option data-val="1" value="true" selected="">Activated</option>
              <option data-val="0" value="false"> Deactivated</option>
            </select>
          </div>
        </td>
        <td>
          <div class="godropdown"><button class="go-dropdown-toggle">
              Delete
          </div>
        </td>
      </tr>
      `;
    }) 
   
  });
  subCategoryHTML.innerHTML = tRows;
};

const displayChildCategories = (data) => {
  console.log(data);
  let tRows = "";
  data.map((doc) => {
    let docData = doc.data();
    console.log(docData);
    docData.subCategory.forEach(sc => {
      console.log(sc);
      sc.childCategories.map(cc => {
        tRows += `
        <tr role="row" class="odd parent">
          <td><input type="text" class="editField" value="${cc.name}">
            <i class="fas fa-check" style="margin: 3%;cursor: pointer;"></i> </td>
          <td tabindex="0">${sc.name} </td>
          <td>${docData.name} </td>
          <td>
            <div class="action-list">
              <select class="process  drop-success" style="display: block;">
                <option data-val="1" value="true" selected>Activated</option>
                <option data-val="0" value="false"> Deactivated</option>
              </select>
  
            </div>
          </td>
          <td>
            <div class="godropdown"><button class="go-dropdown-toggle">
                Delete
            </div>
          </td>
        </tr>
        `;
      })
    })
    // docData.subCategory.childCategories.map(child => {
      
    // })
  });
  childCategoryHTML.innerHTML = tRows;
};

const extractData = async () => {
  let allCategoreis;

  await db
    .collection("categories")
    .get()
    .then((snapshot) => {
      const snapshotDocs = snapshot.docs;
      allCategoreis = snapshotDocs;
    });
  // console.log(allCategoreis);
  return allCategoreis;
};

extractData()
  .then((response) => {
    // console.log(response);
    displayCategories(response);
    displaySubCategories(response);
    displayChildCategories(response);
  })
  .catch((error) => {
    console.log(error);
  });
