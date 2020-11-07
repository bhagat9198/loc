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
    console.log(docData);
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
      <select class="process  drop-success" style="display: block; " id="statusUpdate` + doc.id + `" onchange=statusUpdated("statusUpdate` + doc.id + `","` + doc.id + `")>
      <option data-val="1" value="`+ dataval1 + `">` + dispVal1 + `</option>
      <option data-val="0" value="`+ dataval2 + `">` + dispVal2 + `</option>
      </select>
      </div>
      </td>
      <td>
      <div class="godropdown">
      <button class="go-dropdown-toggle" onclick=deleteMainCategory("`+doc.id+`")>
        Delete
      </button>
     
      </div>
      </td>
    </tr>
    `;
  }
  mainCategoryHTML.innerHTML = tRows;
};

const displaySubCategories = (data) => {
  console.log(data)
  let tRows = "";
  data.map((doc) => {
    let docData = doc.data();
    console.log(docData);
    console.log(docData.subCategory.name)
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
    docData.subCategory.map(sc => {
      tRows += `
      <tr role="row" class="odd parent">
        <td><input type="text" class="editField" value="${sc.name}">
          <i class="fas fa-check" style="margin: 3%;cursor: pointer;"></i> </td>
        <td tabindex="0">${docData.name}</i> </td>
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
        <button class="go-dropdown-toggle" onclick=deleteSubCategory("`+doc.id+`","`+sc.id+`")>
          Delete
        </button>
       
        </div>
        </td>
      </tr>
      `;
    }) 
   
  });
  subCategoryHTML.innerHTML = tRows;
};
function deleteMainCategory(id){
  let ans=confirm("Are you  sure to delete the Category")
  if(ans){
    db.collection("categories").doc(id).delete().then(function () {
      alert("Category successfully deleted!");

    }).catch(function (error) {
      console.error("Error removing user: ", error);
    });
  }
    
}
 function deleteSubCategory(id,subID){
  alert(subID)
  let ans=confirm("Are you  sure to delete the Sub-Category")
  if(ans){
    let subIndex;
    db.collection("categories").doc(id).onSnapshot(doc =>{
      let docData=doc.data();
      docData.subCategory.map((el,index) =>{
        console.log(el);
        if(+el.id === +subID){
          subIndex=index;
        }
      })
      console.log(subIndex);

       docData.subCategory.splice(subIndex,1);
      //  alert(docData.subCategory)
       if(docData.subCategory.length==0){
         
        docData.subCategory=[]
       }
       db.collection("categories").doc(id).update("subCategory", docData.subCategory)
       alert("Done")

    })
    // db.collection("categories").doc(id).delete().then(function () {
    //   alert("Sub-Category successfully deleted!");

    // }).catch(function (error) {
    //   console.error("Error removing user: ", error);
    // });
  }
    
}
function statusUpdated(dropId,id){
 
  var status=document.querySelector(`#`+dropId).value;
  if(status=="false"){

    let isActivated="false"
    db.collection("categories").doc(id).update("isActivated", isActivated)
    let ans=confirm("Are you sure to deactivate the product")
    if(ans){
      alert("Category status Updated Sucessufully")
    }
   
  }else{

    let isActivated="true"
    db.collection("categories").doc(id).update("isActivated", isActivated)
    let ans=confirm("Are you sure to Activate the product")
    if(ans){
      alert("Category status Updated Sucessufully")
    }
   
  }
}
const displayChildCategories = (data) => {
  let tRows = "";
  data.map((doc) => {
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
    docData.subCategory.childCategories.map(child => {
      tRows += `
      <tr role="row" class="odd parent">
        <td><input type="text" class="editField" value="${child.name}">
          <i class="fas fa-check" style="margin: 3%;cursor: pointer;"></i> </td>
        <td tabindex="0">${docData.subCategory.name} </td>
        <td>${docData.name} </td>
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
        <button class="go-dropdown-toggle" onclick=deleteCategory("`+doc.id+`")>
          Delete
        </button>
       
        </div>
        </td>
      </tr>
      `;
    })
  });
  childCategoryHTML.innerHTML = tRows;
};
function deleteCategory(id){
  let ans=confirm("Are you  sure to delete the Slider")
  if(ans){
    db.collection("categories").doc(id).delete().then(function () {
      console.log("Slider successfully deleted!");

    }).catch(function (error) {
      console.error("Error removing user: ", error);
    });
  }
    
}
function statusUpdated(dropId,id){
 
  var status=document.querySelector(`#`+dropId).value;
  if(status=="false"){

    let isActivated="false"
    db.collection("categories").doc(id).update("isActivated", isActivated)
    let ans=confirm("Are you sure to deactivate the product")
    if(ans){
      alert("Product status Updated Sucessufully")
    }
   
  }else{

    let isActivated="true"
    db.collection("categories").doc(id).update("isActivated", isActivated)
    let ans=confirm("Are you sure to Activate the product")
    if(ans){
      alert("Product status Updated Sucessufully")
    }
   
  }
}
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
