console.log("ViewProduct1.js");

const tbody = document.querySelector("tbody");
const storageService = firebase.storage();
const db = firebase.firestore();

async function imgDisplay(imgPath) {
  let imgUrl;
  await storageService
    .ref(imgPath)
    .getDownloadURL()
    .then((url) => {
      imgUrl = url;
    })
    .catch((err) => {
      imgUrl = err;
    });

  return imgUrl;
}

async function displayRows(dd) {
  let tRows = "";
  for (let d of dd) {
    let docData = d.data();
    // console.log(docData);
    let id = d.id;
    let img = `${docData.category}/${id}/${docData.mainImg}`;
    let imgUrl = await imgDisplay(img);

    tRows += `
    <tr role="row" class="odd parent">
        <td tabindex="0" >${docData.name}<br><small>ID: ${docData.sno}</small></td>
        <td><img src="${imgUrl}"></td>
        <td>${docData.subCategory}</td>
        <td>${docData.childCategory}</td>
        <td>${docData.totalPrice}</td>
        <td>
          <div class="action-list"><select class="process  drop-success" style="display: block;">
              <option data-val="1" value="true">Activated</option>
              <option data-val="0" value="false">Deactivated</option>
            </select>
          </div>
        </td>
        <td >
          <div class="godropdown">
            <button class="go-dropdown-toggle">
              Actions<i class="fas fa-chevron-down"></i>
            </button>
            <div class="action-list" style="display: none;">
              <a href="" data-category="${docData.category}" data-id="${d.id}" onclick="editDetails(event)" data-toggle="modal" data-target="#editProductModal">
                <i class="fas fa-edit"></i> Edit
              </a>
              <a href="javascript" class="set-gallery"
                data-toggle="modal" data-target="#setgallery">
                <a href="javascript:;"
                  data-toggle="modal" data-target="#confirm-delete" class="delete">
                  <i class="fas fa-trash-alt"></i>
                  Delete
                </a>
                <a href="javascript:;"
                data-toggle="modal" data-target="#details-modal" data-category="${docData.category}" data-id="${d.id}" onclick="extractDetails(event)" class="option-details">
                <i class="fa fa-info"></i>
                  Details
                </a>
              </a>
            </div>
          </div>
        </td>
      </tr>
    `;
  }
  // console.log(tRows);
  return tRows;
}

const extractData = async () => {
  let allCategoriesNames = [];
  await db
    .collection("categories")
    .get()
    .then((snapshot) => {
      let snapshotDocs = snapshot.docs;
      snapshotDocs.map((doc) => {
        let docData = doc.data();
        allCategoriesNames.push(docData.name);
      });
    });
  console.log(allCategoriesNames);
  let tRows = "";
  for (let cat of allCategoriesNames) {
    console.log(cat);
    await db
      .collection(cat)
      .get()
      .then(async (snapshots) => {
        let snapshotsDocs = snapshots.docs;
        tRows += await displayRows(snapshotsDocs);
      });
  }
  tbody.innerHTML = tRows;
};
extractData();

// display details
const detialsModalHTML = document.querySelector("#details-modal");
const pNameHTML = detialsModalHTML.querySelector(".prod-name-detail");
const pPriceHTML = detialsModalHTML.querySelector(".prod-price-detail");
const pGstHTML = detialsModalHTML.querySelector(".prod-gst-detail");
const pCatHTML = detialsModalHTML.querySelector(".prod-cat-detail");
const pSubCatHTML = detialsModalHTML.querySelector(".prod-sub-cat-detail");
const pChildCatHTML = detialsModalHTML.querySelector(".prod-child-cat-detail");
const pSnoHTML = detialsModalHTML.querySelector(".prod-sno-detail");
const pTagsHTML = detialsModalHTML.querySelector(".prod-tags-detail");
const pDescHTML = detialsModalHTML.querySelector(".prod-des-detail");
const pPrivacyHTML = detialsModalHTML.querySelector(".prod-policy-detail");
const pImgsHTML = detialsModalHTML.querySelector(".prod-img-detail");

const optionDetailsHTML = document.querySelector(".option-details");

async function extractImgUrl(imgPath) {
  let urlPath;
  console.log(imgPath);
  await storageService
    .ref(imgPath)
    .getDownloadURL()
    .then((url) => {
      urlPath = url;
    })
    .catch((error) => {
      console.log(error);
    });
  return urlPath;
}

const extractDetails = async (e) => {
  console.log(e.target.dataset.id);
  console.log(e.target.dataset.category);
  await db
    .collection(e.target.dataset.category)
    .doc(e.target.dataset.id)
    .get()
    .then(async (snapshot) => {
      // console.log(snapshot);
      // console.log(snapshot.data());
      let doc = snapshot.data();
      // console.log(doc);
      pNameHTML.innerHTML = doc.name;
      pPriceHTML.innerHTML = doc.mrp;
      pGstHTML.innerHTML = doc.gst;
      pCatHTML.innerHTML = doc.category;
      pSubCatHTML.innerHTML = doc.subCategory;
      pChildCatHTML.innerHTML = doc.childCategory;
      let allTags = [];
      doc.tags.map((t) => {
        allTags.push(`${t}, `);
      });
      console.log(allTags);
      pTagsHTML.innerHTML = allTags.join("   ");
      pSnoHTML.innerHTML = doc.sno;
      pDescHTML.innerHTML = doc.descriptions;
      pPrivacyHTML.innerHTML = doc.policy;
      let imgsPath = [];
      let url = await extractImgUrl(
        `${doc.category}/${snapshot.id}/${doc.mainImg}`
      );
      imgsPath.push(url);
      console.log(imgsPath);
      for (let i of doc.subImgs) {
        console.log(i);
        url = await extractImgUrl(`${doc.category}/${snapshot.id}/${i}`);
        imgsPath.push(url);
      }
      console.log(imgsPath);
      imgsPath.map((i) => {
        pImgsHTML.innerHTML += `
        <div class="col-lg-2">
          <img src="${i}" alt="">
        </div>
        `;
      });
    })
    .catch((error) => {
      console.log(error);
    });
};

// edit

const editModal = document.querySelector("#editProductModal");
const editProduct = editModal.querySelector("#add-product");
const productCategoryHTML = editProduct.querySelector("#product-category");
const productSubCategoryHTML = editProduct.querySelector(
  "#product-sub-category"
);
const productChildCategoryHTML = editProduct.querySelector('#product-child-category');

const cat = async (data) => {
  // console.log(data);
  await db
    .collection("categories")
    .get()
    .then((snapshot) => {
      let snapshotDocs = snapshot.docs;
      let options = '<option  disabled value="">Select Category*</option>';
      snapshotDocs.map((doc) => {
        let docData = doc.data();
        options += `
      <option ${docData.name == data ? "selected" : null}  value="${doc.id}__${
          docData.name
        }">${docData.name}</option>
      `;
      });
      productCategoryHTML.innerHTML = options;
    });
};

const subCat = async (data) => {
  // console.log(data);
  let docId = data.substring(0, 20);
  // console.log(docId);
  let scId = data.substring(22,41);
  // console.log(scId);
  await db
    .collection("categories")
    .doc(docId)
    .get()
    .then((snapshot) => {
      let doc = snapshot.data();
      console.log(doc);
      let options =
        '<option disabled value="">Select Sub Category*</option>';
      doc.subCategory.map((sc) => {
        if(+sc.id === +scId) {
          options += `
          <option  selected value="${+data.id}__${sc.id}__${sc.name}">${sc.name}</option>
          `;
        } else {
          options += `
      <option value="${+data.id}__${sc.id}__${sc.name}">${sc.name}</option>
      `;
        }
        
      });
      productSubCategoryHTML.innerHTML = options;
    });
};

const childCat = async(data) => {
  // console.log(data);
  let docId = data.substring(0, 20);
  // console.log(docId);
  let scId = data.substring(22, 41);
  // console.log(scId);
  let cId = data.substring(43, 61);
  // console.log(cId);

  await db.collection('categories').doc(docId).get().then(snapshot => {
    let doc = snapshot.data();
    let options = '<option disabled value="">Select Sub Category</option>';
    doc.subCategory.map((sc) => {
      if(+sc.id === +scId) {
        // console.log(sc);
        sc.childCategories.map(cc => {
          // console.log(cc);
          if(+cc.id === +cId) {
            options += `
            <option selected value="${docId}__${scId}__${cc.id}__${cc.name}">${cc.name}</option>
            `;
          } else {
            options += `
            <option value="${docId}__${scId}__${cc.id}__${cc.name}">${cc.name}</option>
            `;
          }
        })
      }
    });
    productChildCategoryHTML.innerHTML = options;
  });
}

const cakeweights = data => {

}

const editDetails = async (e) => {
  console.log(e.target.dataset.id);
  console.log(e.target.dataset.category);
  // let allCategories = [];

  await db
    .collection(e.target.dataset.category)
    .doc(e.target.dataset.id)
    .get()
    .then(async (snapshot) => {
      let doc = snapshot.data();
      // console.log(doc);
      // console.log(editProduct["product-name"]);
      editProduct["product-name"].value = doc.name;
      editProduct["product-sno"].value = doc.sno;
      await cat(doc.category);
      if(doc.category.toUpperCase().substring('CAKE') === true) {
        console.log(doc.category.toUpperCase());
        console.log(doc.category.toUpperCase().substring('CAKE'));
        document.getElementById("cake-attributes").style.display = "block";
      } else {
        document.getElementById("cake-attributes").style.display = "none";
      }
      await subCat(doc.wholeSubCategory);
      await childCat(doc.wholeChildCategory);

    })
    .catch((error) => {
      console.log(error);
    });
};
