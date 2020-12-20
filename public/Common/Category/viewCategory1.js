// console.log("viewCategory.js");
const db = firebase.firestore();
const storageService = firebase.storage();

const mainCategoryHTML = document.querySelector(".main-category");
const subCategoryHTML = document.querySelector(".sub-category");
const childCategoryHTML = document.querySelector(".child-category");

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

const displayCategories = async (data) => {
  let tRows = "";
  for (let doc of data) {
    let docData = doc.data();
    // console.log(docData);
    tRows += `
    <tr role="row" class="odd parent">
      <td tabindex="0"> <input type="text" class="editField" value="${
        docData.name
      }">
        <i class="fas fa-check" style="margin: 3%;cursor: pointer;" data-id="${
          doc.id
        }" onclick="saveNameMainCat(event, this, null)"></i> </td>
      <td><img src="${docData.imgUrl}">
        <br>
        <input type="file"  class="mybtn2 cat-file-input" data-id="${
          doc.id
        }"  onchange="uploadCatFile(event)" accept="image/*">
      </td>
      <td>
        <div class="action-list">
          <select class="process  drop-success" style="display: block;" data-id="${
            doc.id
          }" onchange="mainChangeState(event, this)">
            ${displayOptions(docData.isActivated, null)}
        </div>
      </td>
      <td>
        <div class="godropdown"><button class="go-dropdown-toggle" data-id="${
          doc.id
        }" onclick="deleteMainCat(event)">Delete</div>
      </td>
    </tr>`;
  }
  mainCategoryHTML.innerHTML = tRows;
};

const successMainCategory = document.querySelector("#successMainCat");
const successSubCategory = document.querySelector("#successSubCat");
const successChildCategory = document.querySelector("#successChildCat");

const uploadCatFile = async (e) => {
  // console.log(e);
  let file = e.target.files[0];
  // console.log(file);
  let dataId = e.target.dataset.id;
  console.log(dataId);
  await storageService.ref(`categories/${dataId}/${file.name}`).put(file);
  // console.log("run");
  let imgUrl = await storageService
    .ref(`categories/${dataId}/${file.name}`)
    .getDownloadURL()
    .then((url) => {
      // console.log(url);
      return url;
    })
    .catch((error) => {
      alert(error);
    });
  console.log("aaa");
  let docRef = db.collection("categories").doc(dataId);
  docRef
    .get()
    .then((doc) => {
      let docData = doc.data();
      docData.img = file.name;
      docData.imgUrl = imgUrl;

      successMainCategory.style.display = "block";
      setTimeout(() => {
        successMainCategory.style.display = "none";
      }, 3000);

      docRef.update(docData);
    })
    .catch((error) => {
      alert(error);
    });
};

// document.querySelectorAll('.cat-file-input').forEach(el => {
//   // console.log(el);
//   el.addEventListener('change', uploadFile)
// })

const saveNameMainCat = (e, current, data) => {
  // console.log(current.parentElement.children[0].value);
  let newName = current.parentElement.children[0].value;
  let docId = e.target.dataset.id;

  db.collection("categories")
    .doc(docId)
    .update("name", newName)
    .then(() => {
      // console.log("updated");
      successMainCategory.style.display = "block";
      setTimeout(() => {
        successMainCategory.style.display = "none";
      }, 3000);
    })
    .catch((error) => {
      alert(error);
    });
};

const mainChangeState = (e, current) => {
  let docId = e.target.dataset.id;
  let dbRef = db.collection("categories").doc(docId);

  dbRef
    .get()
    .then((doc) => {
      let docData = doc.data();
      // console.log(docData);
      docData.isActivated = current.value;
      docData.subCategory.map((sc) => {
        sc.isActivated = current.value;
        if (sc.childCategories) {
          sc.childCategories.map((cc) => {
            // console.log(cc);
            cc.isActivated = current.value;
          });
        }
      });
      dbRef.update(docData);
      // console.log("updated");
      successMainCategory.style.display = "block";
      setTimeout(() => {
        successMainCategory.style.display = "none";
      }, 3000);
    })
    .catch((error) => {
      alert("Error", error);
    });
  console.log("done");
};

const deleteMainCat = (e) => {
  let ans = confirm("Are you  sure to delete the Category");
  if (ans) {
    let docId = e.target.dataset.id;
    db.collection("categories")
      .doc(docId)
      .delete()
      .then(() => {
        // console.log("Deleted");
        successMainCategory.style.display = "block";
        setTimeout(() => {
          successMainCategory.style.display = "none";
        }, 3000);
      })
      .catch((error) => {
        alert("Error", error);
      });
  }
};

const displaySubCategories = (data) => {
  let tRows = "";
  data.map((doc) => {
    let docData = doc.data();
    // console.log(docData);
    // console.log(docData.subCategory.name);

    docData.subCategory.map((sc) => {
      tRows += `
      <tr role="row" class="odd parent">
        <td><input type="text" class="editField" value="${sc.name}">
          <i class="fas fa-check" style="margin: 3%;cursor: pointer;" data-id="${
            doc.id
          }__${sc.id}"  onclick="saveNameSubCat(event, this, null)"></i><span style="display:none">${sc.name}</span> </td>
        <td tabindex="0">${docData.name}</i> </td>

        <td>
          <div class="action-list">
            <select class="process  drop-success" style="display: block;"  data-id="${
              doc.id
            }__${sc.id}" onchange="subChangeState(event, this)">
              ${displayOptions(sc.isActivated, null)}
            </select>

          </div>
        </td>
        <td>
          <div class="godropdown"><button class="go-dropdown-toggle" data-id="${
            doc.id
          }__${sc.id}" onclick="deleteSubCat(event)">Delete</button>
          </div>

        </td>
      </tr>`;
    });
  });
  subCategoryHTML.innerHTML = tRows;
  $('#example2').DataTable({

    "responsive": true,
    "autoWidth": false,
  });
};

const saveNameSubCat = (e, current, data) => {
  // console.log(current.parentElement.children[0].value);
  let newName = current.parentElement.children[0].value;
  const [docId, subId] = e.target.dataset.id.split("__");
  // console.log(docId, subId);
  const dbRef = db.collection("categories").doc(docId);
  dbRef
    .get()
    .then((doc) => {
      let docData = doc.data();
      // let stateIndex;
      let counter = -1;
      for (let sc of docData.subCategory) {
        console.log(sc);
        counter++;
        if (+sc.id === +subId) {
          // stateIndex = counter;
          console.log(sc.name, newName);
          sc.name = newName;
          break;
        }
      }
      dbRef.update(docData);
      // console.log("deleted");
      successSubCategory.style.display = "block";
      setTimeout(() => {
        successSubCategory.style.display = "none";
      }, 3000);
    })
    .catch((error) => {
      alert("Error", error);
    });
};

const subChangeState = (e, current) => {
  const [docId, subId] = e.target.dataset.id.split("__");
  console.log(docId, subId);
  const dbRef = db.collection("categories").doc(docId);
  dbRef
    .get()
    .then((doc) => {
      let docData = doc.data();
      let stateIndex;
      let counter = -1;
      for (let sc of docData.subCategory) {
        counter++;
        if (+sc.id === +subId) {
          stateIndex = counter;
          if (sc.childCategories) {
            sc.childCategories.map((cc) => {
              cc.isActivated = current.value;
            });
          }
          break;
        }
      }

      docData.subCategory[stateIndex].isActivated = current.value;
      dbRef.update(docData);
      // console.log("deleted");
      successSubCategory.style.display = "block";
      setTimeout(() => {
        successSubCategory.style.display = "none";
      }, 3000);
    })
    .catch((error) => {
      alert("Error", error);
    });
};

const deleteSubCat = (event) => {
  console.log(event);
  let ans = confirm("Are you  sure to delete the Category");
  if (ans) {
    const [docId, subId] = event.target.dataset.id.split("__");
    console.log(docId, subId);
    const dbRef = db.collection("categories").doc(docId);
    dbRef
      .get()
      .then((doc) => {
        let docData = doc.data();
        let deleteIndex;
        let counter = -1;
        for (let sc of docData.subCategory) {
          counter++;
          if (+sc.id === +subId) {
            deleteIndex = counter;
            break;
          }
        }
        docData.subCategory.splice(deleteIndex, 1);
        dbRef.update(docData);
        // console.log("deleted");
        successSubCategory.style.display = "block";
        setTimeout(() => {
          successSubCategory.style.display = "none";
        }, 3000);
      })
      .catch((error) => {
        alert("Error", error);
      });
  }
  console.log("done");
};

const displayChildCategories = (data) => {
  // console.log(data);
  let tRows = "";
  data.map((doc) => {
    // console.log(doc);
    let docData = doc.data();
    // console.log(docData);
    docData.subCategory.map((sc) => {
      sc.childCategories.map((child) => {
        // console.log(child.isActivated);
        tRows += `
        <tr role="row" class="odd parent">
          <td><input type="text" class="editField" value="${child.name}">
            <i class="fas fa-check" style="margin: 3%;cursor: pointer;" data-id="${
              doc.id
            }__${sc.id}__${
          child.id
        }" onclick="saveNameChildCat(event, this, null)"></i><span style="display:none">${child.name}</span> </td>
          <td tabindex="0">${sc.name}</td>
          <td>${docData.name} </td>

          <td>
            <div class="action-list">
              <select class="process  drop-success" style="display: block;" data-id="${
                doc.id
              }__${sc.id}__${
          child.id
        }" onchange="childChangeState(event, this)">
                ${displayOptions(child.isActivated, null)}
              </select>
            </div>
          </td>
          <td>
            <div class="godropdown"><button data-id="${doc.id}__${sc.id}__${
          child.id
        }" onclick="deleteChildCat(event)" class="go-dropdown-toggle">Delete</button>
            </div>
          </td>
        </tr>
        `;
      });
    });
  });
  childCategoryHTML.innerHTML = tRows;
  $('#example3').DataTable({

    "responsive": true,
    "autoWidth": false,
  });
};

const saveNameChildCat = (e, current, data) => {
  // console.log(current.parentElement.children[0].value);
  let newName = current.parentElement.children[0].value;
  const stateInfo = e.target.dataset.id;
  const [docId, subId, childId] = stateInfo.split("__");
  console.log(docId, subId, childId);
  let docRef = db.collection("categories").doc(docId);

  docRef
    .get()
    .then((doc) => {
      let docData = doc.data();
      // console.log(docData);
      let stateIndex;
      for (let sc of docData.subCategory) {
        if (+sc.id === +subId) {
          let counter = -1;
          for (let cc of sc.childCategories) {
            counter++;
            if (+cc.id === +childId) {
              sc.childCategories[counter].name = newName;
              break;
            }
          }
        }
      }
      docRef.update(docData);
      // console.log("updated");
      successChildCategory.style.display = "block";
      setTimeout(() => {
        successChildCategory.style.display = "none";
      }, 3000);
    })
    .catch((error) => {
      alert("Error", error);
    });
};

const childChangeState = (e, current) => {
  // console.log(e, current.value);
  const stateInfo = e.target.dataset.id;
  const [docId, subId, childId] = stateInfo.split("__");
  console.log(docId, subId, childId);
  let docRef = db.collection("categories").doc(docId);

  docRef
    .get()
    .then((doc) => {
      let docData = doc.data();
      // console.log(docData);
      let stateIndex;
      for (let sc of docData.subCategory) {
        if (+sc.id === +subId) {
          let counter = -1;
          for (let cc of sc.childCategories) {
            counter++;
            if (+cc.id === +childId) {
              stateIndex = counter;
              break;
            }
          }
          if (stateIndex) {
            sc.childCategories[stateIndex].isActivated = current.value;
            break;
          }
        }
      }
      docRef.update(docData);
      // console.log("changed");
      successChildCategory.style.display = "block";
      setTimeout(() => {
        successChildCategory.style.display = "none";
      }, 3000);
    })
    .catch((error) => {
      alert("Error", error);
    });
};

const deleteChildCat = (event) => {
  const ans = confirm("Are you  sure to delete the Child-Category");
  if (ans) {
    const deleteInfo = event.target.dataset.id;
    // console.log(deleteInfo);
    const [docId, subId, childId] = deleteInfo.split("__");
    // console.log(docId, subId, childId);
    let docRef = db.collection("categories").doc(docId);

    docRef
      .get()
      .then((doc) => {
        let docData = doc.data();
        // console.log(docData);
        let deleteIndex;
        for (let sc of docData.subCategory) {
          if (+sc.id === +subId) {
            let counter = -1;
            for (let cc of sc.childCategories) {
              counter++;
              if (+cc.id === +childId) {
                deleteIndex = counter;
                break;
              }
            }
            if (deleteIndex) {
              sc.childCategories.splice(deleteIndex, 1);
              break;
            }
          }
        }
        docRef.update(docData);
        // console.log("deleted");
        successChildCategory.style.display = "block";
        setTimeout(() => {
          successChildCategory.style.display = "none";
        }, 3000);
      })
      .catch((error) => {
        alert("Error", error);
      });
    console.log("done");
  }
};

db.collection("categories").onSnapshot((snapshot) => {
  let allCategoreis;
  const snapshotDocs = snapshot.docs;
  allCategoreis = snapshotDocs;
  displayCategories(allCategoreis);
  displaySubCategories(allCategoreis);
  displayChildCategories(allCategoreis);
});
