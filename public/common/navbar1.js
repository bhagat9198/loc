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

const extractChildCat = data => {
  let childLi = '';
  data.childCategories.map(doc => {
    // let docData = doc.data();
    childLi += `
    <li><a href="#">${doc.name}</a></li>
    `;
  })
  console.log(childLi);
  return childLi;
}

const extractSubCat = data => {
  console.log(data);
  let subLi = '';
  data.subCategory.map((doc) => {
    // let docData = doc.data();
    let childCat = extractChildCat(doc);
    subLi += `
    <li>
      <a href="#">${doc.name}</a>
      <ul> ${childCat}</ul>
    </li>
    `;
  })
  return subLi;
}

db.collection('categories').onSnapshot(async(snapshots) => {
  let snapshotDocs = snapshots.docs;
  let li = '';
  for(let doc of snapshotDocs) {
    let docData = doc.data();
    console.log(docData);
    let subCat = extractSubCat(docData);
    // let imgPath = await extractImgURL(`categories/${doc.id}/${docData.img}`);
    // let imgPath = '';
    li += `
    <li >
      <a href="#">${docData.name}</a>
      <ul>
        ${subCat}

        <li>
          <ul>
            <li><img src="${docData.imgUrl}"></li>
          </ul>
        </li>
      </ul>
    </li>
    `;
  }
  const wholeNavigationPcHTML = document.querySelector('#whole-navigation-pc');
  wholeNavigationPcHTML.innerHTML = li;
});

