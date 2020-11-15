// console.log("addOns.js");
const db = firebase.firestore();
const storageService = firebase.storage();

const addonForm = document.querySelector("#addonForm");
const addonsTbodyHTML = document.querySelector('.addons-tbody');

let addonImg;
let allAddonsData;

const addAddon = (event) => {
  // console.log(event);
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
        // console.log(dataSaved);
        docId = dataSaved.id;
      })
      .catch((error) => {
        alert(error);
      });
    return {docId:docId, docData: data};
  }

  addAddonReq(wholeAddonData)
    .then(async (response) => {
      let imgUrl;
      await storageService.ref(`addons/${response.docId}/${response.docData.img}`).put(addonImg);
      await storageService.ref(`addons/${response.docId}/${response.docData.img}`).getDownloadURL().then(url => {
        imgUrl = url;
      }).catch(error => {
        alert(error);
      })
      // console.log(response);

      const docRef = db.collection('addons').doc(response.docId);
      docRef.get().then(async(snapshot) => {
        let docData = snapshot.data();
        docData.imgUrl = imgUrl;
        // console.log(docData);
        await docRef.update(docData);
        addonForm.reset();
      }).catch(error => {
        alert(error);
      });

    })
    .catch((error) => {
      alert(error);
    });
};
addonForm.addEventListener("submit", addAddon);

addonForm.querySelector('#addon-img').addEventListener('change', (e) => {
  addonImg = e.target.files[0];
  // console.log(addonImg);
})

async function extractImgUrl(imgPath) {
  let imgUrl;
  await storageService.ref(imgPath).getDownloadURL().then(url => {
    imgUrl = url;
  })
  .catch(error => {
    alert(error);
  });

  return imgUrl;
}


// const extractData = async () => {
//   let allData;
//   await db
//     .collection("addons")
//     .get()
//     .then((snapshots) => {
//       // console.log(snapshots.docs);
//       let snapshotsDocs = snapshots.docs;
//       // allAddonsData = snapshotsDocs;

//       allData = snapshotsDocs;
//     });
  
//     return allData;
// }

// extractData().then( async(response) => {

  // console.log(response);

db.collection('addons').onSnapshot(async(snapshots) => {
  let response = snapshots.docs;
  allAddonsData = response;
  let tRows = '';
  for(let doc of response) {
    let docData = doc.data();
    let status=docData.isActivated;
    var dispVal1,dispVal2,dataval1,dataval2;
    if(status=="false"){

      dispVal1="Deactivated";
      dispVal2="Activated";
      dataval1="false"
      dataval2="true"

    }else{
      dispVal1="Activated";
      dispVal2="Deactivated";
      dataval1="true"
      dataval2="false"
     
    }
    // console.log(docData);
    let imgPath = await extractImgUrl(`addons/${doc.id}/${docData.img}`);
    tRows += `
    <tr role="row" class="odd parent">
      <td tabindex="0">${docData.name}</td>
      <td><img src="${imgPath}"></td>
      <td>${docData.price}</td>
      <td>
      <div class="action-list">
        <select class="process  drop-success" style="display: block; " id="statusUpdate` + doc.id + `" onchange=statusUpdated("statusUpdate` + doc.id + `","` + doc.id + `")>
        <option data-val="1" value="`+ dataval1 + `">` + dispVal1 + `</option>
        <option data-val="0" value="`+ dataval2 + `">` + dispVal2 + `</option>
        </select>
      </div>
      </td>
      <td>
      <div class="godropdown">
      <button class="go-dropdown-toggle" onclick=deleteSlider("`+doc.id+`")>
        Delete
      </button>
     
      </div>
      </td>
    </tr>
    `;
  }

  addonsTbodyHTML.innerHTML = tRows;
})
function deleteSlider(id){
  let ans=confirm("Are you  sure to delete the Addon")
  if(ans){
    db.collection("addons").doc(id).delete().then(function () {
      alert("Addon successfully deleted!!");

    }).catch(function (error) {
      alert("Error removing user: ", error);
    });
  }
    
}
function statusUpdated(dropId,id){
 
  var status=document.querySelector(`#`+dropId).value;
  if(status=="false"){

    let isActivated="false"
    db.collection("addons").doc(id).update("isActivated", isActivated)
    let ans=confirm("Are you sure to deactivate the Addon")
    if(ans){
      alert("Addon status Updated Sucessufully")
    }
   
  }else{

    let isActivated="true"
    db.collection("addons").doc(id).update("isActivated", isActivated)
    let ans=confirm("Are you sure to Activate the Addon")
    if(ans){
      alert("Addon status Updated Sucessufully")
    }
   
  }
}

const calculateTotal = e => {
  let gst = addonForm["addon-gst"];
  let sp = addonForm["addon-sp"];
  // console.log(gst, sp);
  if(gst.value && sp.value) {
    addonForm["addon-total-price"].value = +sp.value + (+sp.value * (+gst.value/100));
  }
}

addonForm["addon-sp"].addEventListener('keyup', calculateTotal);
addonForm["addon-gst"].addEventListener('keyup', calculateTotal);