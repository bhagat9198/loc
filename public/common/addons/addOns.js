console.log("addOns.js");
const db = firebase.firestore();
const storageService = firebase.storage();

const addonForm = document.querySelector("#addonForm");
const addonsTbodyHTML = document.querySelector('.addons-tbody');

let addonImg;
let allAddonsData;

const addAddon = (event) => {
  console.log(event);
  // event.preventDefault();
  event.preventDefault();

  const addonName = addonForm["addon-name"].value;
  const addonSP = addonForm["addon-sp"].value;
  const addonGST = addonForm["addon-gst"].value;
  const addonTotalPrice = addonForm["addon-total-price"].value;
  const addonImgName = addonImg.name;
  const wholeAddonData = {
    name: addonName,
    sp: addonSP,
    gst: addonGST,
    price: addonTotalPrice,
    img: addonImgName
  };

  async function addAddonReq(data) {
    // console.log(data);
    let docId;
    await db
      .collection("addons")
      .add(data)
      .then((dataSaved) => {
        console.log(dataSaved);
        docId = dataSaved.id;
      })
      .catch((error) => {
        console.log(error);
      });
    return {docId:docId, docData: data};
  }

  addAddonReq(wholeAddonData)
    .then(async (response) => {
      await storageService.ref(`addons/${response.docId}/${response.docData.img}`).put(addonImg);
      console.log(response);
    })
    .catch((error) => {
      console.log(error);
    });
};

addonForm.addEventListener("submit", addAddon);

addonForm.querySelector('#addon-img').addEventListener('change', (e) => {
  addonImg = e.target.files[0];
  console.log(addonImg);
})


async function extractImgUrl(imgPath) {
  let imgUrl;
  await storageService.ref(imgPath).getDownloadURL().then(url => {
    imgUrl = url;
  })
  .catch(error => {
    console.log(error);
  });

  return imgUrl;
}


const extractData = async () => {
  let allData;
  await db
    .collection("addons")
    .get()
    .then((snapshots) => {
      // console.log(snapshots.docs);
      let snapshotsDocs = snapshots.docs;
      // allAddonsData = snapshotsDocs;
      allData = snapshotsDocs;
    });
  
    return allData;
}

extractData().then( async(response) => {
  // console.log(response);
  let tRows = '';
  for(let doc of response) {
    let docData = doc.data();
    // console.log(docData);
    let imgPath = await extractImgUrl(`addons/${doc.id}/${docData.img}`);
    tRows += `
    <tr role="row" class="odd parent">
      <td tabindex="0">Cake</td>
      <td><img src="${imgPath}"></td>
      <td>${docData.price}</td>
      <td>
        <div class="action-list">
          <select class="process  drop-success" style="display: block;">
            <option data-val="1" value="true" selected>Activated</option>
            <option data-val="0" value="false">Deactivated</option>
          </select>
        </div>
      </td>
      <td>
        <div class="godropdown">
          <button class="go-dropdown-toggle"> Actions
            <i class="fas fa-chevron-down"></i>
          </button>
          <div class="action-list" style="display: none;">
            <a href="#">
              <i class="fas fa-edit"></i>
              Edit
            </a>
            <a href="javascript:;" data-href="#" data-toggle="modal"
              data-target="#confirm-delete" class="delete">
              <i class="fas fa-trash-alt"></i>
              Delete
            </a>
          </div>
        </div>
      </td>
    </tr>
    `;
  }
  addonsTbodyHTML.innerHTML = tRows;
})