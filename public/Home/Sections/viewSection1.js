console.log("viewSection.js");

const db = firebase.firestore();
const storageService = firebase.storage();

const sectionHTML = document.querySelector(".section");

async function extractImgUrl(imgPath) {
  // console.log(imgPath);
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
  console.log(imgUrl);
  return imgUrl;
}

const column3 = async (sectionData, docId) => {
  let tRows = "";
  for (let row of sectionData.card) {
    let imgUrl = await extractImgUrl(`sections/${docId}/${row.img}`);
    tRows += `
    <tr role="row" class="odd parent">
      <td ><img src="${imgUrl}"></td>
      <td >${sectionData.category}</td>
      <td>${row.tag}</td>
    </tr>
    `;
  }
  return tRows;
};

const column5 = async (sectionData, docId) => {
  // console.log(sectionData);
  let tRows = "";
  for (let row of sectionData.card) {
    // console.log(row);
    await db
      .collection(row.category)
      .doc(row.id)
      .get()
      .then(async(snapshot) => {
        let doc = snapshot.data();
        let imgUrl = await extractImgUrl(`${doc.category}/${snapshot.id}/${doc.mainImg}`);
        tRows += `
        <tr role="row" class="odd parent">
          <td tabindex="0" >testingg<br>
            <small>ID: 
              <a href="#" target="_blank">${doc.name}</a>
            </small>
            <small class="ml-2">${doc.sno}</small>
          </td>
          <td ><img src="${imgUrl}"></td>
          <td >${doc.subCategory}</td>
          <td >${doc.childCategory}</td>
          <td >₹${doc.price}</td>
        </tr>
        `;
      })
      .catch((error) => {
        console.log(error);
      });
  }
  return tRows;
};

const media = (sectionData, docId) => {
  return;
};

const colHeader3 = () => {
  let tHead = `
  <tr>
    <th>Image</th>
    <th>Category</th>
    <th>Tags</th>
  </tr>
  `;
  return tHead;
};

const colHeader5 = () => {
  let tHead = `
  <tr>
    <th>Name</th>
    <th>Image</th>
    <th>Sub-Category</th>
    <th>Child-Category</th>
    <th>Price</th>
  </tr>
  `;
  return tHead;
};

const bannerSection = async(sectionData, docId) => {
  let imgUrl, media ;
  if(sectionData.type === "img") {
    imgUrl = await extractImgUrl(`sections/${docId}/${sectionData.card.img}`);
    media = `
    <img id="blah" src="${imgUrl}" style="width:100%;height: 426px;object-fit:contain ;"/>`;
  } else {
    imgUrl = await extractImgUrl(`sections/${docId}/${sectionData.card.animation}`);
    media = `
    <video src="${imgUrl}"  style="width:100%;height: 426px ;;" autoplay loop muted />
    `;
  }
  let banner = `
  <div class="product-area">
    <div style="display: flex;margin-left: 40%;" >
      <h4 class="MainHeading"  id="sectionName">${sectionData.title}</h4>
    </div>
    <div class="row">
      <div class="col-lg-12">
        <div class="mr-table allproduct">
          <div class="alert alert-success validation" style="display: none;">
            <button type="button" class="close alert-close"><span>×</span></button>
            <p class="text-left"></p>
          </div>
          <div class="table-responsiv">
            <table id="" class="table table-hover dt-responsive" cellspacing="0" width="100%">
              <div class="row btn-area" style="float: right;padding: 1  0px;">
                <div class="action-list">
                  <select class="process  drop-success" style="display: block;">
                    <option data-val="1" value="" selected="">Activated</option>
                    <option data-val="0" value="">Deactivated</option>
                  </select>
                </div>
                <div class="godropdown"><button class="go-dropdown-toggle">
                    Actions<i class="fas fa-chevron-down"></i></button>
                  <div class="action-list" style="display: none;"><a
                      href="https://lakeofcakes.com/admin/products/edit/406">
                      <a href="javascript:;" data-href="https://lakeofcakes.com/admin/products/delete/406"
                        data-toggle="modal" data-target="#confirm-delete" class="delete"><i
                          class="fas fa-trash-alt"></i>
                        Delete</a>
                  </div>
                </div>
              </div>
              <div class="span4  text-center" id=""
              style="width: 100%; height: 426px; border: 1px dashed #ddd; background: #f1f1f1;">
                  <i class="icofont-upload-alt"></i>
                  ${media}
              </div>
            </table>
          </div>
        </div>
      </div>
    </div>
  </div>
  <br>`;
  return banner;
}


const displaySection = async (sectionData, docId) => {
  // console.log("displaySection");
  let coloumns, columnsHeader, banner, sectionBody;
  if (sectionData.type === "4") {
    coloumns = await column3(sectionData, docId);
    columnsHeader = colHeader3();
  } else if (sectionData.type === "6" || sectionData.type === "slider") {
    columnsHeader = colHeader5();
    coloumns = await column5(sectionData, docId);
  } else if (sectionData.type === "img" || sectionData.type === "animation"){
    banner = await bannerSection(sectionData, docId);
  } else {
    console.log('invalid');
  }

  if(banner) {
    sectionBody = banner;
  } else {
    sectionBody = `
    <div class="product-area">
      <div style="display: flex;margin-left: 40%;padding: 10px;" >
          <input type="text" value="${sectionData.title}" class="MainHeading"> 
          <i class="fas fa-check" style="margin: 3%;cursor: pointer;"></i>
      </div>

      <div class="row">
        <div class="col-lg-12">
          <div class="mr-table allproduct">
            <div class="alert alert-success validation" style="display: none;">
              <button type="button" class="close alert-close"><span>×</span></button>
              <p class="text-left"></p>
            </div>
            <div class="table-responsiv">
              <div class="row btn-area" style="float: right;padding: 1  0px;">
                <div class="action-list">
                  <select class="process  drop-success" style="display: block;">
                    <option data-val="1" value="true" selected>Activated</option>
                    <option data-val="0" value="false" >Deactivated</option>
                  </select>
                </div>
                <div class="godropdown">
                  <button class="go-dropdown-toggle">
                    Actions<i class="fas fa-chevron-down"></i>
                  </button>
                  <div class="action-list" style="display: none;"><a
                      href="#">
                      <a href="javascript:;" data-href="#" data-toggle="modal" data-target="#confirm-delete" class="delete">
                        <i class="fas fa-trash-alt"></i>Delete
                      </a>
                  </div>
                </div>
              </div>
              <table id="" class="table table-hover dt-responsive" cellspacing="0" width="100%">
              <thead>
                ${columnsHeader}
              </thead>
              <tbody>
                ${coloumns}
              </tbody>
            </table>
            </div>
          </div>
        </div>
      </div>
    </div>
    <br />
    `;
  }
  // console.log(sectionBody);
  // console.log(sectionHTML);
  sectionHTML.innerHTML += sectionBody;
};

const extractSections = async () => {
  await db
    .collection("sections")
    .get()
    .then((snapshot) => {
      // console.log(snapshot);
      const snapshotDocs = snapshot.docs;
      snapshotDocs.map((doc) => {
        let docData = doc.data();
        displaySection(docData, doc.id);
      });
    });
};
extractSections();
