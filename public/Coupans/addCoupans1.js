console.log("addCoupans.js");

const db = firebase.firestore();

const addCoupanFormHTML = document.querySelector("#add-coupan");

const addCoupan = (e) => {
  e.preventDefault();

  const coupanName = addCoupanFormHTML["coupan-name"].value;
  const coupanDesc = addCoupanFormHTML["coupan-desc"].value;
  const coupanCat = addCoupanFormHTML["coupan-cat"].value;
  const coupanAmt = addCoupanFormHTML["coupan-amt"].value;
  const coupanQuantity = addCoupanFormHTML["coupan-quantity"].value;
  const numOfCoupans = addCoupanFormHTML["num-of-coupans"].value;
  const dateFrom = addCoupanFormHTML["date-from"].value;
  const dateTill = addCoupanFormHTML["date-till"].value;

  const wholeCoupan = {
    name: coupanName,
    desc: coupanDesc,
    category: coupanCat,
    amount: coupanAmt,
    quantity: coupanQuantity,
    totalCoupans: numOfCoupans || 'unlimited',
    validFrom: dateFrom,
    validTill: dateTill,
    isActivated: "true"
  };

  const addCoupanReq = async(data) => {
    console.log(data);
    await db.collection("coupans")
      .add(data)
      .then((savedData) => {
        console.log(savedData);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  addCoupanReq(wholeCoupan).then(response => {
    addCoupanFormHTML.reset();
  }).catch(error => {
    console.log(error);
  })
};

addCoupanFormHTML.addEventListener("submit", addCoupan);
