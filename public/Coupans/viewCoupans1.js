console.log("viewCoupans.js");

const db = firebase.firestore();
const coupansTBodyHTML = document.querySelector(".coupans-tBody");

const displayOptions = (isSeleted, data) => {
  let options = "";
  if (isSeleted.toString() === "true") {
    options = `
      <option value="true" selected>Activated</option>
      <option value="false">Deactivated</option>
    `;
  } else {
    options = `
      <option value="true" >Activated</option>
      <option value="false" selected>Deactivated</option>
    `;
  }
  return options;
};

function displayRows(data, elHTML = coupansTBodyHTML) {
  // console.log(elHTML);
  let tRows = "";
  data.map((doc) => {
    let docData = doc.data();
    // console.log(docData);
    
    tRows += `
    <tr role="row" class="odd parent">
      <td tabindex="0">${docData.name}</td>
      <td>${displayDisAmt(docData.category, docData.amount)}</td>
      <td>
        <div class="action-list">
          <select class="process  drop-success" data-id="${
            doc.id
          }" onchange="changeStatus(event, this)" style="display: block;">
            ${displayOptions(docData.isActivated)}
          </select>
        </div>
      </td>
      <td>
        <div class="godropdown">
          <button class="go-dropdown-toggle">
            Actions<i class="fas fa-chevron-down"></i>
          </button>
          <div class="action-list" style="display: none;">
            <a href="javascript:;" data-id="${
              doc.id
            }" onclick="loadEditModal(event)" data-toggle="modal" id="edit-modal" data-target="#coupanEditModal">
              <i class="fas fa-edit"></i> Edit
            </a>
            <a href="javascript:;" data-id="${doc.id}" class="delete" onclick="deleteCoupan(event)">
              <i class="fas fa-trash-alt"></i>Delete
            </a>
            <a href="javascript:;" data-toggle="modal" data-id="${
              doc.id
            }" onclick="loadDetailModal(event)" id="detail-modal"  data-target="#coupanSystemModal" class="dele">
              <i class="fa fa-info"></i>Details
            </a>
          </div>
        </div>
      </td>
    </tr>
    `;
  });
  elHTML.innerHTML = tRows;
}

const displayDisAmt = (coupanCat, amt) => {
  let discountAmt = '';
    if(coupanCat === "price") {
      discountAmt = `₹ ${amt}`;
    } else {
      discountAmt = `${amt}%`;
    }
  return discountAmt;
}

const changeStatus = (e, current) => {
  console.log(current.value);
  let docId = e.target.dataset.id;
  let docRef = db.collection("coupans").doc(docId);

  docRef.get().then((doc) => {
    let docData = doc.data();

    docData.isActivated = current.value;
    docRef.update(docData);
  });
};

const deleteCoupan = (e) => {
  let docId = e.target.dataset.id;
  db.collection('coupans')
    .doc(docId)
    .delete()
    .then( response => {
      console.log("Document successfully deleted!");
    })
    .catch(error => {
      console.error("Error removing document: ", error);
    });
};

db.collection("coupans").onSnapshot((snapshot) => {
  let snapshotDocs = snapshot.docs;
  // console.log(coupansTBodyHTML);
  displayRows(snapshotDocs);
});

const loadDetailModal = async (e) => {
  // console.log(e.target.dataset.id);
  const docId = e.target.dataset.id;
  const detailModalHTML = document.querySelector("#coupanSystemModal");
  console.log(detailModalHTML);
  const cNameHTML = detailModalHTML.querySelector(".cName");
  const cCategoryHTML = detailModalHTML.querySelector(".cCategory");
  const cAmtHTML = detailModalHTML.querySelector(".cAmt");
  const pAmtHTML = detailModalHTML.querySelector(".pAmt");
  const cQuantityHTML = detailModalHTML.querySelector(".cQuantity");
  const cFromHTML = detailModalHTML.querySelector(".cFrom");
  const cValidHTML = detailModalHTML.querySelector(".cValid");
  const cDescriptionHTML = detailModalHTML.querySelector(".cDescription");

  await db
    .collection("coupans")
    .doc(docId)
    .get()
    .then((snapshot) => {
      let docData = snapshot.data();
      console.log(docData);
      cNameHTML.innerHTML = docData.name;
      cCategoryHTML.innerHTML = docData.category;
      cAmtHTML.innerHTML = docData.amount;
      pAmtHTML.innerHTML = docData.prevAmout || '';
      cQuantityHTML.innerHTML = docData.quantity;
      cFromHTML.innerHTML = docData.validFrom;
      cValidHTML.innerHTML = docData.validTill;
      cDescriptionHTML.innerHTML = docData.desc;
    });
};

const loadEditModal = async (e) => {
  const docId = e.target.dataset.id;
  // console.log(docId);
  const editModalFormHTML = document.querySelector("#edit-modal-form");

  await db
    .collection("coupans")
    .doc(docId)
    .get()
    .then((snapshot) => {
      let docData = snapshot.data();
      editModalFormHTML["edit-c-name"].value = docData.name;
      editModalFormHTML["edit-c-desc"].value = docData.desc;
      editModalFormHTML["edit-c-category"].value = docData.category;
      editModalFormHTML["edit-c-amt"].value = docData.amount;
      editModalFormHTML["edit-c-pamt"].value = docData.prevAmout;
      editModalFormHTML["edit-c-quantity"].value = docData.quantity;
      editModalFormHTML["edit-c-total"].value = docData.totalCoupans;
      editModalFormHTML["edit-c-validFrom"].value = docData.validFrom;
      editModalFormHTML["edit-c-validTill"].value = docData.validTill;
      editModalFormHTML["edit-c-id"].value = docId;
    });
};

const submitEdit = (e) => {
  e.preventDefault();
  const editModalFormHTML = document.querySelector("#edit-modal-form");
  const name = editModalFormHTML["edit-c-name"].value;
  const desc = editModalFormHTML["edit-c-desc"].value;
  const category = editModalFormHTML["edit-c-category"].value;
  const amount = editModalFormHTML["edit-c-amt"].value;
  const pAmount = editModalFormHTML["edit-c-pamt"].value;
  const quantity = editModalFormHTML["edit-c-quantity"].value;
  let totalCoupans = editModalFormHTML["edit-c-total"].value;
  const validFrom = editModalFormHTML["edit-c-validFrom"].value;
  const validTill = editModalFormHTML["edit-c-validTill"].value;
  const docId = editModalFormHTML["edit-c-id"].value;

  if (quantity === "Unlimited") {
    totalCoupans = "unlimited";
  }

  const wholeCoupan = {
    name: name,
    desc: desc,
    category: category,
    amount: amount,
    prevAmout: pAmount,
    quantity: quantity,
    totalCoupans: totalCoupans,
    validFrom: validFrom,
    validTill: validTill,
  };

  const updateCoupan = async (data) => {
    // console.log(data);
    let dbRef = await db.collection("coupans").doc(docId);
    dbRef
      .get()
      .then(async (snapshot) => {
        let docData = snapshot.data();
        docData = data;
        console.log("done");
        await dbRef.update(docData);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  updateCoupan(wholeCoupan);
};
