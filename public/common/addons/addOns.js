console.log("addOns.js");
const db = firebase.firestore();
const storageService = firebase.storage();

const addonForm = document.querySelector("addonForm");
let addonImg;

const addAddon = (e) => {
  e.preventDefault();

  const addonName = addAddon["addon-name"].value;
  const addonSP = addAddon["addon-sp"].value;
  const addonGST = addAddon["addon-gst"].value;
  const addonTotalPrice = addAddon["addon-total-price"].value;

  const wholeAddonData = {
    name: addonName,
    sp: addonSP,
    gst: addonGST,
    price: addonTotalPrice,
  };

  async function addAddonReq(data) {
    await db
      .collection("addons")
      .add(data)
      .then((dataSaved) => {
        console.log(dataSaved);
      })
      .catch((error) => {
        console.log(error);
      });
  }

  addAddonReq(wholeAddonData)
    .then((response) => {
      console.log(response);
    })
    .catch((error) => {
      console.log(error);
    });
};

addonForm.addEventListener("submit", addAddon);

addAddon
