console.log("addSlider1.js");

const db = firebase.firestore();
const storageService = firebase.storage();

const addSliderFormHTML = document.querySelector("#add-slider-form");
const sliderFileHTML = document.querySelector("#slider-file");
const sliderTbodyHTML = document.querySelector(".slider-tbody");
let sliderImg;
let allCatArr = [];

const categoriesHTML = document.querySelector('#categories');

db.collection('categories').onSnapshot(catSnaps => {
  let catDocs = catSnaps.docs;
  let options = `<option selected disabled value="">Select Category</option>`;
  catDocs.map(c => {
    let cData = c.data();
    allCatArr.push({docId: c.id, data: cData, });
    options += `<option value="${c.id}"> ${cData.name}</option>`;
  })
  categoriesHTML.innerHTML = options;
})

const extractImgURL = async (imgPath) => {
  // console.log(imgPath);
  let imgUrl;
  await storageService
    .ref(imgPath)
    .getDownloadURL()
    .then((url) => {
      imgUrl = url;
    })
    .catch((error) => {
      console.log(error);
    });
  return imgUrl;
};

const displayRows = async (docs) => {
  let tRows = "";
  for (let doc of docs) {
    let docData = doc.data();
    // console.log(docData);
    let docId = doc.id;
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
    let imgUrl = await extractImgURL(`sliders/${docId}/${docData.img}`);
    let catName = '';
    let subCatName = '';
    let childCatName = '';
    for(let c of allCatArr) {
      if(c.docId == docData.cat) {
        console.log(c);
        catName = c.data.name;
        if(docData.subCat) {
          for(let sc of c.data.subCategory) {
            if(sc.id == docData.subCat) {
              subCatName  = sc.name;

              if(docData.childCat) {
                for(let cc of sc.childCategories) {
                  if(cc.id == docData.childCat) {
                    childCatName = cc.name;
                    break;
                  }
                }
              } else {
                childCatName = 'Not Selected';
                break;
              }
            }
          }
        } else {
          subCatName = 'Not Selected';
          childCatName = 'Not Selected';
          break;
        }
        break;
      }
    }
    tRows += `
    <tr role="row" class="odd parent">
      <td><img src="${imgUrl}"></td>
      <td>${catName}</td>
      <td>${subCatName}</td>
      <td>${childCatName}</td>
      <td>${docData.midnight ? 'Selected' : 'Not Selected'}</td>
      <td>${docData.daylight ? 'Selected' : 'Not Selected'}</td>
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
        </div>
      </td>
    </tr>`;
  }
  // console.log(tRows);
  sliderTbodyHTML.innerHTML = tRows;
};
function deleteSlider(id){
  let ans=confirm("Are you  sure to delete the Slider")
  if(ans){
    db.collection("sliders").doc(id).delete().then(function () {
      // console.log("Slider successfully deleted!");

    }).catch(function (error) {
      console.error("Error removing user: ", error);
    });
  }
    
}
function statusUpdated(dropId,id){
 
  var status=document.querySelector(`#`+dropId).value;
  if(status=="false"){

    let isActivated="false"
    db.collection("sliders").doc(id).update("isActivated", isActivated)
    let ans=confirm("Are you sure to deactivate the product")
    if(ans){
      alert("Product status Updated Sucessufully")
    }
   
  }else{

    let isActivated="true"
    db.collection("sliders").doc(id).update("isActivated", isActivated)
    let ans=confirm("Are you sure to Activate the product")
    if(ans){
      alert("Product status Updated Sucessufully")
    }
   
  }
}

db.collection("sliders").onSnapshot((snapshot) => {
  let snapshotDocs = snapshot.docs;
  displayRows(snapshotDocs);
});

const addSlider = (e) => {
  e.preventDefault();
  const title = addSliderFormHTML["slider-name"].value;
  const catId = addSliderFormHTML['category-name'].value;
  const subCatId = addSliderFormHTML['sub-category-name'].value;
  const childCatId = addSliderFormHTML['child-category-name'].value;
  // const midnight = addSliderFormHTML['midnight'].value;
  // const daylight = addSliderFormHTML['daylight'].value;
  const imgName = `${Math.random()}__${sliderImg.name}`;

  // console.log(catId, typeof(midnight), midnight, daylight);
  let midnightState = false;
  let daylightState = false;
  if(addSliderFormHTML.querySelector('input[name=midnight]:checked')) {
    midnightState = true;
  }
  if(addSliderFormHTML.querySelector('input[name=daylight]:checked')) {
    daylightState = true;
  }

  // console.log(midnightState);

  const wholdeSliderData = {
    title: title,
    img: imgName,
    cat: catId,
    subCat: subCatId,
    childCat: childCatId,
    midnight: midnightState,
    daylight: daylightState
  };

  const addSliderReq = async (data) => {
    let docId;
    await db
      .collection("sliders")
      .add(data)
      .then((snapshot) => {
        docId = snapshot.id;
      });
      // console.log(data, docId);
    return { data: data, docId: docId };
  };
  addSliderReq(wholdeSliderData)
  .then(async (response) => {
    await storageService
      .ref(`sliders/${response.docId}/${response.data.img}`)
      .put(sliderImg);
    let imgUrl;
    imgUrl = await extractImgURL(`sliders/${response.docId}/${response.data.img}`);
    const docRef = db.collection('sliders').doc(response.docId);
    docRef.get().then(snapshot => {
      let docData = snapshot.data();
      docData.imgUrl = imgUrl;
      docRef.update(docData);
    })
    addSliderFormHTML.reset();
    sliderImg = null;
  })
  .catch((error) => {
    console.log(error);
  });
};
addSliderFormHTML.addEventListener("submit", addSlider);

sliderFileHTML.addEventListener("change", (e) => {
  sliderImg = e.target.files[0];
  // console.log(sliderImg);
});

const changeCat = (e, current) => {
  let val = current.value;
  // console.log(val);
  addSliderFormHTML.querySelector('#subCategories').disabled = false;
  for(c of allCatArr) {
    // console.log(c);
    if(c.docId == val) {
      addSliderFormHTML.querySelector('#subCategories').dataset.catId = val;
      let subOptions = `<option selected disabled value="">Select Category</option>`;
      c.data.subCategory.map(sc => {
        console.log(sc);
        subOptions += `
        <option value="${sc.id}"> ${sc.name}</option>
        `;
      })
      addSliderFormHTML.querySelector('#subCategories').innerHTML = subOptions;
      break;
    }
  }
}

const changeSubCat = (e, current) => {
  let val = current.value;
  addSliderFormHTML.querySelector('#childCategories').disabled = false;
  // console.log(current.dataset);
  let catId = current.dataset.catId;
  for(c of allCatArr) {
    // console.log(c);
    let childOptions = '';
    // console.log(c.docId, catId);
    if(c.docId == catId) {
      for(let sc of c.data.subCategory) {
        // console.log(sc.id, val);
        if(sc.id == val) {
          childOptions = `<option selected disabled value="">Select Category</option>`;
          for(let cc of sc.childCategories) {
            childOptions += `
              <option value="${cc.id}"> ${cc.name}</option>
            `;
          }
          break;
        }
      }
      addSliderFormHTML.querySelector('#childCategories').innerHTML = childOptions;
    }
  }
}