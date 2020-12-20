console.log("topCatImgs1.js");
const db = firebase.firestore();
const storageService = firebase.storage();

const addCategoryImgFormHTML = document.querySelector("#add-category-img-form");
const categoryNameDropdownHTML = addCategoryImgFormHTML.querySelector(
  "#category-name-dropdown"
);
let FILE;

const displayCatergories = (data) => {
  let options = '<option selected disabled value="">Select Category</option>';
  data.map((doc) => {
    let docData = doc.data();
    options += `
    <option value="${doc.id}">${docData.name}</option>
    `;
  });
  categoryNameDropdownHTML.innerHTML = options;
};

db.collection("categories").onSnapshot((snapshots) => {
  let snapshotDocs = snapshots.docs;
  displayCatergories(snapshotDocs);
});

const addCatImg = (e) => {
  e.preventDefault();
  let cat = addCategoryImgFormHTML["category-name-dropdown"].value;
  let unique = new Date().valueOf();
  let img = `${unique}__${FILE.name}`;

  let dbRef = db.collection("miscellaneous").doc('catImgs').collection('catImgs').doc(cat);
  let lengthArr = 0;
  let wholeArr;
  dbRef.get().then(doc => {
    if(doc.exists) {
      let docData = doc.data();
      docData.imgs.push({name: img});
      lengthArr = docData.imgs.length;
      wholeArr = docData.imgs;
      dbRef.update(docData).then(savedData => {
        addCategoryImgFormHTML.reset();
        return storageService.ref(`miscellaneous/catImgs/catImgs/${cat}/${img}`).put(FILE);
      }).then(async(imgSaved) => {
        // console.log(imgSaved);
        return storageService.ref(`miscellaneous/catImgs/catImgs/${cat}/${img}`).getDownloadURL();
      }).then(url => {
        let imgUrl;
        imgUrl = url;
        // console.log(imgUrl);
        wholeArr[lengthArr -1].url = imgUrl;
        return dbRef.update('imgs', wholeArr);
      }).then(savedData => {
        // console.log(savedData);
      })
      .catch(error => {
        console.log(error);
      });
    } else {
      dbRef.set({imgs: [{name: img}]}).then(savedData => {
        // console.log(savedData);
        addCategoryImgFormHTML.reset();
        return dbRef.get()
      }).then(rawData => {
        let data = rawData.data();
        lengthArr = data.imgs.length;
        wholeArr = data.imgs;
        return storageService.ref(`miscellaneous/catImgs/catImgs/${cat}/${img}`).put(FILE);
      }).then(async(imgSaved) => {
        // console.log(imgSaved);
        return storageService.ref(`miscellaneous/catImgs/catImgs/${cat}/${img}`).getDownloadURL();
      }).then(url => {
        let imgUrl;
        imgUrl = url;
        // console.log(imgUrl);
        wholeArr[lengthArr -1].url = imgUrl;
        return dbRef.update('imgs', wholeArr);
      }).then(savedData => {
        // console.log(savedData);
      })
      .catch(error => {
        console.log(error);
      });
    }
  })
}

addCategoryImgFormHTML.addEventListener("submit", addCatImg);

const ImgInputHTML = addCategoryImgFormHTML.querySelector(
  "input[name=category-img]"
);

const fileInput = (e) => {
  FILE = e.target.files[0];
  // console.log(FILE);
};

ImgInputHTML.addEventListener("change", fileInput);

const allCatImgsHTML = document.querySelector('#all-cat-imgs');

db.collection('miscellaneous').doc('catImgs').collection('catImgs').onSnapshot(async(snapshots) => {
  let snapshotDocs = snapshots.docs;
  let table = '';
  for(let doc of snapshotDocs) {
    let docData = doc.data();
    let catName;
    await db.collection('categories').doc(doc.id).get().then(catDoc => {
      let catData = catDoc.data();
      catName = catData.name;
      // console.log(catName);
      return;
    })
    let rows = '';
    // console.log(catName);
    let index = -1;
    docData.imgs.map(img => {
      index++;
      console.log(img);
      rows += `
      <tr role="row" class="odd parent">
        <td tabindex="0">${catName}</td>
        <td><img
            src="${img.url}"
            style="border-radius: 10px;" alt="">
        </td>
        <td>
          <div class="godropdown"><button class="go-dropdown-toggle" data-index=${index} data-catid="${doc.id}" onclick="deleteCatImg(event)"> Delete  </div>
        </td>
      </tr>
      `;
    });
    table += `
    <div>
    <h4 class="MainHeading">${catName}</h4>
    <div class="row">
      <div class="col-lg-12">
        <div class="product-description">
          <div class="body-area">
            <div class="row">
              <div class="col-lg-12">
                <div class="table-responsiv">
                  <table id="" class="table table-hover dt-responsive" cellspacing="0" width="100%">
                    <thead>
                      <tr>
                        <th>Category</th>
                        <th>Image</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${rows}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    `; 
  }
  // console.log('aaa');
  allCatImgsHTML.innerHTML = table;
})

const deleteCatImg = async(e) => {
  const index = e.target.dataset.index;
  const catId  =e.target.dataset.catid;

  let dbRef = db.collection('miscellaneous').doc('catImgs').collection('catImgs').doc(catId);

  let imgName;
  let allImgsData;
  await dbRef.get().then(doc => {
    console.log('savedData');
    let docData = doc.data();
    allImgsData = docData.imgs;
    imgName = docData.imgs[index].name;
  }).catch(error => {
    console.log(error);
  })

  // console.log(imgName);
  storageService.ref(`miscellaneous/catImgs/catImgs/${catId}/${imgName}`).delete().then(imgDelete => {
    console.log(imgDelete);
    allImgsData.splice(index, 1);
    return dbRef.update('imgs', allImgsData)
  }).then(updatedData => {
    console.log(updatedData);
  }).catch(error => {
    console.log(error);
  })
}