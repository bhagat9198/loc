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
  // console.log(data)
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
  console.log(data);
  let tRows = "";
  data.map((doc) => {
    console.log(doc);
    let docData = doc.data();
    console.log(docData);
   
    // console.log(docData);
    docData.subCategory.map(sc => {
      
      sc.childCategories.map(child => {
        let status=child.isActivated;
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
        tRows += `
        <tr role="row" class="odd parent">
          <td><input type="text" class="editField" value="${child.name}">
            <i class="fas fa-check" style="margin: 3%;cursor: pointer;"></i> </td>
          <td tabindex="0">${sc.name} </td>
          <td>${docData.name} </td>
          <td>
          <div class="action-list">
            <select class="process  drop-success" style="display: block; " id="statusSubUpdate` + doc.id + `" onchange=statusChildUpdated("statusUpdate` + doc.id + `","` + doc.id + `","`+sc.id+`","`+child.id+`")>
            <option data-val="1" value="`+ dataval1 + `">` + dispVal1 + `</option>
            <option data-val="0" value="`+ dataval2 + `">` + dispVal2 + `</option>
            </select>
          </div>
          </td>
          <td>
          <div class="godropdown">
          <button class="go-dropdown-toggle" )>
            Delete
          </button>
         
          </div>
          </td>
        </tr>
        `;
      })

    })


  });
  childCategoryHTML.innerHTML = tRows;
};
function deleteChildCategory(id){
  let ans=confirm("Are you  sure to delete the Child Category")
  if(ans){
    db.collection("categories").doc(id).delete().then(function () {
      console.log("Child Category successfully deleted!");

    }).catch(function (error) {
      console.error("Error removing user: ", error);
    });
  }
    
}
function statusMainUpdated(dropId,id){
 
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

function statusSubUpdated(dropId,id){
 
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
function statusChildUpdated(dropId,docid,subId,childId){
  
  var status=document.querySelector(`#`+dropId).value;
  
  if(status=="false"){
    alert("false")
    let docref=db.collection("categories").doc(docid);
    docref.onSnapshot(doc =>{
      let docData=doc.data();

      for(let sc of docData.subCategory){
        
        console.log(sc);
        if(+sc.id === +subId){
          for(let cc of sc.childCategories){
            console.log(cc);
            if(+cc.id === +childId){
              cc.isActivated="true"
              docref.update(docData)
              alert("Status Changed")
              break;
            }
          }
        }
       
      }
    })

    // let isActivated="false"
    // // db.collection("categories").doc(docid).update("isActivated", isActivated)
    // let ans=confirm("Are you sure to deactivate the product")
    // if(ans){
    //   alert("Category status Updated Sucessufully")
    // }
   
  }else{
    alert(8)
    let isActivated="true"
    db.collection("categories").doc(id).update("isActivated", isActivated)
    let ans=confirm("Are you sure to Activate the product")
    if(ans){
      alert("Category status Updated Sucessufully")
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
