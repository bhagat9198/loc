console.log("ViewProduct1.js");

const tbody = document.querySelector("tbody");
const storageService = firebase.storage();
const db = firebase.firestore();

async function imgDisplay(imgPath) {
  let imgUrl;
  // console.log(imgPath);
  await storageService
    .ref(imgPath)
    .getDownloadURL()
    .then((url) => {
      imgUrl = url;
    })
    .catch((err) => {
      imgUrl = err;
      // console.log(err);
    });

  console.log(imgUrl);
  return imgUrl;
}

async function displayRows(dd) {
  let tRows = "";
  for (let d of dd) {
    // console.log(d);
    let docData = d.data();
    let id = d.id;
    let img = `Cake/${id}/${docData.mainImg}`;
    let imgUrl = await imgDisplay(img);
    console.log(docData);
    console.log(tRows);
    tRows += `
    <tr role="row" class="odd parent">
        <td tabindex="0" >Prod Name<br><small>ID: ${docData.sno}</small></td>
        <td><img src="${imgUrl}"></td>
        <td>${docData.subCategory}</td>
        <td>${docData.childCategory}</td>
        <td>${docData.totalPrice}</td>
        <td>
          <div class="action-list"><select class="process  drop-success" style="display: block;">
              <option data-val="1" value="true">Activated</option>
              <option data-val="0" value="false">Deactivated</option>
            </select>
          </div>
        </td>
        <td >
          <div class="godropdown">
            <button class="go-dropdown-toggle">
              Actions<i class="fas fa-chevron-down"></i>
            </button>
            <div class="action-list" style="display: none;">
              <a href="./AddProduct.html"  data-toggle="modal" data-target="#editProductModal">
                <i class="fas fa-edit"></i> Edit
              </a>
              <a href="javascript" class="set-gallery"
                data-toggle="modal" data-target="#setgallery">
                <a href="javascript:;"
                  data-toggle="modal" data-target="#confirm-delete" class="delete">
                  <i class="fas fa-trash-alt"></i>
                  Delete
                </a>
                <a href="javascript:;"
                data-toggle="modal" data-target="#gridSystemModal" class="dele">
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
  console.log(tRows);
  tbody.innerHTML = tRows;
}

const extractData = async () => {
  let cakesWholeData;
  await db
    .collection("Cake")
    .get()
    .then((snapshots) => {
      console.log(snapshots.docs);
      let snapshotsDocs = snapshots.docs;
      cakesWholeData = snapshotsDocs;
    });

  displayRows(cakesWholeData);
};
extractData();
