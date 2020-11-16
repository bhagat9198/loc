console.log("navbar1.js");

const wholeNavigationPcHTML = document.querySelector('#whole-navigation-pc');

// const extractImgURL = async (imgPath) => {
//   let imgUrl;
//   await storageService
//     .ref(imgPath)
//     .getDownloadURL()
//     .then((url) => {
//       imgUrl = url;
//     })
//     .catch((error) => {
//       console.log(error);
//     });
//   return imgUrl;
// };

const extractChildCat = (data, subId, docId) => {
  let childLi = '';
  data.childCategories.map(doc => {
    // let docData = doc.data();
    childLi += `
      <li><a href="/Products/products.html?cat=${docId}&&sub=${subId}&&child=${doc.id}">${doc.name}</a></li>
    `;
  })
  // console.log(childLi);
  return childLi;
}

const extractSubCat = (data, docId) => {
  // console.log(data);
  let subLi = '';
  data.subCategory.map((doc) => {
    // let docData = doc.data();
    let childCat = extractChildCat(doc, doc.id, docId);
    subLi += `
    <li>
      <a href="/Products/products.html?cat=${docId}&&sub=${doc.id}">${doc.name}</a>
      <ul> ${childCat}</ul>
    </li>
    `;
  })
  return subLi;
}

db.collection('categories').onSnapshot(async(snapshots) => {
  let snapshotDocs = snapshots.docs;
  let li = '';
  let liMob = '';
  for(let doc of snapshotDocs) {
    let docData = doc.data();
    // console.log(docData);
    let subCat = extractSubCat(docData, doc.id);
    // let imgPath = await extractImgURL(`categories/${doc.id}/${docData.img}`);
    // let imgPath = '';
    li += `
    <li >
      <a href="/Products/products.html?cat=${doc.id}">${docData.name}</a>
      <ul>
        ${subCat}
        <li>
          <ul>
            <li><img class="navimage" src="${docData.imgUrl}"></li>
          </ul>
        </li>
      </ul>
    </li>
    `;
    liMob += `
    <li >
      <a href="#">${docData.name}<i class="fas fa-chevron-down" style="margin-left: 10%;float: right;"></i></a>
      <ul>
        ${subCat}
        <li>
          <ul>
            <li><img class="navimage" src="${docData.imgUrl}"></li>
          </ul>
        </li>
      </ul>
    </li>
    `;
  }
  const wholeNavigationPcHTML = document.querySelector('#whole-navigation-pc');
  wholeNavigationPcHTML.innerHTML = li;
  const wholeNavigationMobile = document.querySelector('#whole-navigation-mobile');
  wholeNavigationMobile.innerHTML = liMob;
});

let allSearchList;
db.collection('miscellaneous').doc('searchList').get().then(doc => {
  let docData = doc.data();
  allSearchList = docData.searches;
})


const searchProd = (e, current) => {
  // console.log(current.value);
  // console.log(allSearchList);
  let searchResults = [];
  for(let el of allSearchList) {
    // console.log(el);
    if(el.name.toUpperCase().includes(current.value.toUpperCase())) {
      searchResults.push(el.name);
      // console.log(el);
      if(searchResults.length >= 7) {
        break;
      }
    }
  }
  console.log(searchResults);

  if(e.keyCode === 13) {
    console.log(e.keyCode);
    // e.preventDefault();
    // window.location(`/Products/products.html?user=${current.value}`)
    window.location.href = `/Products/products.html?user=${current.value}`;
  }
}





