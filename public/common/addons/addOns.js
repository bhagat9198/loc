console.log("addOns.js");
const db = firebase.firestore();
const storageService = firebase.storage();

const addonForm = document.querySelector("#addonForm");
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



const allAddonsDataFun = async () => {
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

allAddonsDataFun().then(response => {
  console.log(response);
  response.forEach(doc => {
    console.log(doc.data());
  })
})