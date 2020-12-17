console.log("fixedSection1.js");

const db = firebase.firestore();
const storageService = firebase.storage();

const allCategories = [];
const fFrorm1HTML = document.querySelector("#fForm1");
const f1File1HTML = document.querySelector("#f1-file1");
const f1File2HTML = document.querySelector("#f1-file2");
const f1File3HTML = document.querySelector("#f1-file3");
const f1File4HTML = document.querySelector("#f1-file4");
const categoryTypeHTML = document.querySelectorAll(".categoryType");
const subCategoryTypeHTML = document.querySelectorAll(".subCategoryType");
const childCategoryTypeHTML = document.querySelectorAll(".childCategoryType");

let f1File1, f1File2, f1File3, f1File4;

db.collection("categories").onSnapshot((snapshots) => {
  let snapshotsDocs = snapshots.docs;
  snapshotsDocs.map((doc) => {
    let docData = doc.data();
    allCategories.push({ docId: doc.id, data: docData });
    // allCategories.push(`${doc.id}__${docData.name}`);
  });

  let subOptions =
    '<option value="" selected disabled>Select From the List</option>';
  let childOptions =
    '<option value="" selected disabled>Select From the List</option>';
  categoryTypeHTML.forEach((el) => {
    let options =
      '<option value="" selected disabled>Select From the List</option>';
    allCategories.map((cat) => {
      let c = `${cat.docId}__${cat.data.name}`;
      options += `
      <option  value="${c}">${c.split("__")[1]}</option>
    `;
      for (let sc of cat.data.subCategory) {
        let scName = `${sc.id}__${sc.name}`;
        subOptions += `
        '<option value="${scName}" >${sc.name}</option>';
        `;

        for (let cc of sc.childCategories) {
          let ccName = `${cc.id}__${cc.name}`;
          childOptions += `
          '<option value="${ccName}" >${cc.name}</option>';
          `;
        }
      }
    });
    el.innerHTML = options;
  });
  subCategoryTypeHTML.forEach((el) => {
    el.innerHTML = subOptions;
  });
  childCategoryTypeHTML.forEach((el) => {
    el.innerHTML = childOptions;
  });
  displayForm1();
  displayForm3();
  displayForm5();
  displayForm8();
  displayForm9();
});

const changeCat = (e, current) => {
  // console.log(current.value, current.name);
  let val = current.value;
  let catTarget = e.target.dataset.subcat;
  let options;
  for (let c of allCategories) {
    let cId = val.split("__")[0];
    if (c.docId === cId) {
      // console.log(c);
      options =
        '<option value="" selected disabled>Select From the List</option>';
      for (let sc of c.data.subCategory) {
        options += `
          <option  value="${sc.id}__${sc.name}">${sc.name}</option>
        `;
      }
      break;
    }
  }
  // console.log(options);
  document.querySelector(`#${catTarget}`).innerHTML = options;
  document.querySelector(`#${catTarget}`).disabled = false;
};

const changeSubCat = (e, current) => {
  let val = current.value;
  let catValue = e.target.dataset.cat;
  let childCatTarget = e.target.dataset.childcat;
  let options;
  for (let c of allCategories) {
    // console.log(document.querySelector(`#${catValue}`).value);
    let cval = document.querySelector(`#${catValue}`).value;
    let cId = cval.split("__")[0];
    if (c.docId === cId) {
      options =
        '<option value="" selected disabled>Select From the List</option>';
      for (let sc of c.data.subCategory) {
        let scId = val.split("__")[0];
        if (+scId === +sc.id) {
          for (let cc of sc.childCategories) {
            // console.log(cc);
            options += `<option value="${cc.id}__${cc.name}">${cc.name}</option>`;
          }
        }
      }
    }
  }
  // console.log(options);
  document.querySelector(`#${childCatTarget}`).innerHTML = options;
  // console.log(document.querySelector(`#${childCatTarget}`));
  document.querySelector(`#${childCatTarget}`).disabled = false;
};

const extractImgUrl = async (imgPath) => {
  let imgUrl;
  await storageService
    .ref(imgPath)
    .getDownloadURL()
    .then((url) => {
      // console.log(url);
      imgUrl = url;
    })
    .catch((error) => {
      console.log(error);
    });
  return imgUrl;
};

const form1 = async (e) => {
  e.preventDefault();

  let f1name, f2name, f3name, f4name;
  let img1Url, img2Url, img3Url, img4Url;

  let docRef = await db.collection("sections").doc("fixed1");
  await docRef.get().then((snapshot) => {
    let docData = snapshot.data();
    if (docData.card1) {
      if (docData.card1.img) {
        f1name = docData.card1.img;
        img1Url = docData.card1.imgUrl;
      } else {
        f1name = "";
      }
    } else {
      f1name = "";
    }
    if (docData.card2) {
      if (docData.card2.img) {
        f2name = docData.card2.img;
        img2Url = docData.card2.imgUrl;
      } else {
        f2name = "";
      }
    } else {
      f2name = "";
    }
    if (docData.card3) {
      if (docData.card3.img) {
        f3name = docData.card3.img;
        img3Url = docData.card3.imgUrl;
      } else {
        f3name = "";
      }
    } else {
      f3name = "";
    }
    if (docData.card4) {
      if (docData.card4.img) {
        f4name = docData.card4.img;
        img4Url = docData.card4.imgUrl;
      } else {
        f4name = "";
      }
    } else {
      f4name = "";
    }
  });

  const title = fFrorm1HTML["f1-title"].value;
  const cat1 = fFrorm1HTML["f1-cat1"].value;
  const subCat1 = fFrorm1HTML["f1-subcat1"].value;
  const childCat1 = fFrorm1HTML["f1-childcat1"].value;
  const cat2 = fFrorm1HTML["f1-cat2"].value;
  const subCat2 = fFrorm1HTML["f1-subcat2"].value;
  const childCat2 = fFrorm1HTML["f1-childcat2"].value;
  const cat3 = fFrorm1HTML["f1-cat3"].value;
  const subCat3 = fFrorm1HTML["f1-subcat3"].value;
  const childCat3 = fFrorm1HTML["f1-childcat3"].value;
  const cat4 = fFrorm1HTML["f1-cat4"].value;
  const subCat4 = fFrorm1HTML["f1-subcat4"].value;
  const childCat4 = fFrorm1HTML["f1-childcat4"].value;
  const t1 = fFrorm1HTML["f1-t1"].value;
  const t2 = fFrorm1HTML["f1-t2"].value;
  const t3 = fFrorm1HTML["f1-t3"].value;
  const t4 = fFrorm1HTML["f1-t4"].value;

  if (f1File1) {
    f1name = `${Math.random()}__${f1File1.name}`;
    await storageService.ref(`sections/fixed1/${f1name}`).put(f1File1);
    // console.log(f1name);
    img1Url = await extractImgUrl(`sections/fixed1/${f1name}`);
  }
  if (f1File2) {
    f2name = `${Math.random()}__${f1File2.name}`;
    await storageService.ref(`sections/fixed1/${f2name}`).put(f1File2);
    img2Url = await extractImgUrl(`sections/fixed1/${f2name}`);
  }
  if (f1File3) {
    f3name = `${Math.random()}__${f1File3.name}`;
    await storageService.ref(`sections/fixed1/${f3name}`).put(f1File3);
    img3Url = await extractImgUrl(`sections/fixed1/${f3name}`);
  }
  if (f1File4) {
    f4name = `${Math.random()}__${f1File4.name}`;
    await storageService.ref(`sections/fixed1/${f4name}`).put(f1File4);
    img4Url = await extractImgUrl(`sections/fixed1/${f4name}`);
  }

  docRef.get().then(async (snapshot) => {
    let docData = snapshot.data();
    docData.title = title;
    docData.card1 = {
      cat: cat1,
      subCat: subCat1,
      childCat: childCat1,
      tag: t1,
      img: f1name,
      imgUrl: img1Url,
    };
    docData.card2 = {
      cat: cat2,
      subCat: subCat2,
      childCat: childCat2,
      tag: t2,
      img: f2name,
      imgUrl: img2Url,
    };
    docData.card3 = {
      cat: cat3,
      subCat: subCat3,
      childCat: childCat3,
      tag: t3,
      img: f3name,
      imgUrl: img3Url,
    };
    docData.card4 = {
      cat: cat4,
      subCat: subCat4,
      childCat: childCat4,
      tag: t4,
      img: f4name,
      imgUrl: img4Url,
    };
    // console.log(docData);
    await docRef.update(docData);
    displayForm1();
    // console.log("updated");
  });
  // console.log("done");
};

fFrorm1HTML.addEventListener("submit", form1);

const fileChange1 = (e) => {
  f1File1 = e.target.files[0];
};
const fileChange2 = (e) => {
  f1File2 = e.target.files[0];
};
const fileChange3 = (e) => {
  f1File3 = e.target.files[0];
};
const fileChange4 = (e) => {
  f1File4 = e.target.files[0];
};

f1File1HTML.addEventListener("change", fileChange1);
f1File2HTML.addEventListener("change", fileChange2);
f1File3HTML.addEventListener("change", fileChange3);
f1File4HTML.addEventListener("change", fileChange4);

// const displaySubCats = (catId, subCatId) => {
//   console.log(catId, subCatId);
//   for(let c of allCategories) {
//     let cId = catId.split('__')[0];
//     if(c.docId == cId) {
//       console.log(c);
//       let subOptions = '';
//       for(let sc of c.data.subCategory) {
//         let scId = subCatId.split('__')[0];
//         if(sc.id == scId) {
//           subOptions = ``;
//         }
//       }
//     }
//   }
// }

const displayForm1 = () => {
  db.collection("sections")
    .doc("fixed1")
    .onSnapshot((doc) => {
      let docData = doc.data();
      // console.log(docData);
      fFrorm1HTML["f1-title"].value = docData.title;
      if (docData.card1) {
        console.log(docData.card1);
        fFrorm1HTML.querySelector("#f1-img1").src = docData.card1.imgUrl;
        fFrorm1HTML["f1-cat1"].value = docData.card1.cat;
        document.querySelector("#f1-subcat1").value = docData.card1.subCat;
        // console.log(fFrorm1HTML["f1-subcat1"]);
        // console.log(fFrorm1HTML["f1-subcat1"].value);
        fFrorm1HTML["f1-subcat1"].value = docData.card1.subCat;
        fFrorm1HTML["f1-childcat1"].value = docData.card1.childCat;
        fFrorm1HTML["f1-t1"].value = docData.card1.tag;
        // displaySubCats(docData.card1.cat, docData.card1.subCat);
      }

      if (docData.card2) {
        fFrorm1HTML.querySelector("#f1-img2").src = docData.card2.imgUrl;
        fFrorm1HTML["f1-cat2"].value = docData.card2.cat;
        fFrorm1HTML["f1-subcat2"].value = docData.card2.subCat;
        fFrorm1HTML["f1-childcat2"].value = docData.card2.childCat;
        fFrorm1HTML["f1-t2"].value = docData.card2.tag;
      }

      if (docData.card3) {
        fFrorm1HTML.querySelector("#f1-img3").src = docData.card3.imgUrl;
        fFrorm1HTML["f1-cat3"].value = docData.card3.cat;
        fFrorm1HTML["f1-subcat3"].value = docData.card3.subCat;
        fFrorm1HTML["f1-childcat3"].value = docData.card3.childCat;
        fFrorm1HTML["f1-t3"].value = docData.card3.tag;
      }

      if (docData.card4) {
        fFrorm1HTML.querySelector("#f1-img4").src = docData.card4.imgUrl;
        fFrorm1HTML["f1-cat4"].value = docData.card4.cat;
        fFrorm1HTML["f1-subcat4"].value = docData.card4.subCat;
        fFrorm1HTML["f1-childcat4"].value = docData.card4.childCat;
        fFrorm1HTML["f1-t4"].value = docData.card4.tag;
      }
    });
};
//////////////////////////////////////////////////////////////////////////////////////////////////////////////

const fForm2HTML = document.querySelector("#fForm2");

let iconImg1,
  iconImg2,
  iconImg3,
  iconImg4,
  iconImg5,
  iconImg6,
  iconImg7,
  iconImg8;

const form2 = async (e) => {
  e.preventDefault();

  let iconUrl1,
    iconUrl2,
    iconUrl3,
    iconUrl4,
    iconUrl5,
    iconUrl6,
    iconUrl7,
    iconUrl8;
  let imgName1,
    imgName2,
    imgName3,
    imgName4,
    imgName5,
    imgName6,
    imgName7,
    imgName8;

  let docRef = await db.collection("sections").doc("fixed2");

  await docRef.get().then((doc) => {
    // console.log(doc);
    let docData = doc.data();
    // console.log(docData);
    if (docData.card1) {
      if (docData.card1.img) {
        imgName1 = docData.card1.img;
        iconUrl1 = docData.card1.imgUrl;
      } else {
        imgName1 = "";
      }
    } else {
      imgName1 = "";
    }

    if (docData.card2) {
      if (docData.card2.img) {
        imgName2 = docData.card2.img;
        iconUrl2 = docData.card2.imgUrl;
      } else {
        imgName2 = "";
      }
    } else {
      imgName2 = "";
    }

    if (docData.card3) {
      if (docData.card3.img) {
        imgName3 = docData.card1.img;
        iconUrl3 = docData.card3.imgUrl;
      } else {
        imgName3 = "";
      }
    } else {
      imgName3 = "";
    }

    if (docData.card4) {
      if (docData.card4.img) {
        imgName4 = docData.card1.img;
        iconUrl4 = docData.card4.imgUrl;
      } else {
        imgName4 = "";
      }
    } else {
      imgName4 = "";
    }

    if (docData.card5) {
      if (docData.card5.img) {
        imgName5 = docData.card1.img;
        iconUrl5 = docData.card5.imgUrl;
      } else {
        imgName5 = "";
      }
    } else {
      imgName5 = "";
    }

    if (docData.card6) {
      if (docData.card6.img) {
        imgName6 = docData.card1.img;
        iconUrl6 = docData.card6.imgUrl;
      } else {
        imgName6 = "";
      }
    } else {
      imgName6 = "";
    }

    if (docData.card7) {
      if (docData.card7.img) {
        imgName7 = docData.card1.img;
        iconUrl7 = docData.card7.imgUrl;
      } else {
        imgName7 = "";
      }
    } else {
      imgName7 = "";
    }

    if (docData.card8) {
      if (docData.card8.img) {
        imgName8 = docData.card1.img;
        iconUrl8 = docData.card8.imgUrl;
      } else {
        imgName8 = "";
      }
    } else {
      imgName8 = "";
    }
  });

  const title = fForm2HTML["f2-title"].value;
  const t1 = fForm2HTML["f2-tag1"].value;
  const t2 = fForm2HTML["f2-tag2"].value;
  const t3 = fForm2HTML["f2-tag3"].value;
  const t4 = fForm2HTML["f2-tag4"].value;
  const t5 = fForm2HTML["f2-tag5"].value;
  const t6 = fForm2HTML["f2-tag6"].value;
  const t7 = fForm2HTML["f2-tag7"].value;
  const t8 = fForm2HTML["f2-tag8"].value;
  const p1 = fForm2HTML["f2-priority-1"].value;
  const p2 = fForm2HTML["f2-priority-2"].value;
  const p3 = fForm2HTML["f2-priority-3"].value;
  const p4 = fForm2HTML["f2-priority-4"].value;
  const p5 = fForm2HTML["f2-priority-5"].value;
  const p6 = fForm2HTML["f2-priority-6"].value;
  const p7 = fForm2HTML["f2-priority-7"].value;
  const p8 = fForm2HTML["f2-priority-8"].value;
  const c1 = fForm2HTML["f2-cat1"].value;
  const c2 = fForm2HTML["f2-cat2"].value;
  const c3 = fForm2HTML["f2-cat3"].value;
  const c4 = fForm2HTML["f2-cat4"].value;
  const c5 = fForm2HTML["f2-cat5"].value;
  const c6 = fForm2HTML["f2-cat6"].value;
  const c7 = fForm2HTML["f2-cat7"].value;
  const c8 = fForm2HTML["f2-cat8"].value;

  if (iconImg1) {
    imgName1 = `${Math.random()}__${iconImg1.name}`;
    await storageService.ref(`sections/fixed2/${imgName1}`).put(iconImg1);
    iconUrl1 = await extractImgUrl(`sections/fixed2/${imgName1}`);
  }

  if (iconImg2) {
    imgName2 = `${Math.random()}__${iconImg2.name}`;
    // console.log(imgName2);
    await storageService.ref(`sections/fixed2/${imgName2}`).put(iconImg2);
    // console.log(imgName2);
    iconUrl2 = await extractImgUrl(`sections/fixed2/${imgName2}`);
    // console.log(iconUrl2);
  }

  if (iconImg3) {
    imgName3 = `${Math.random()}__${iconImg3.name}`;
    await storageService.ref(`sections/fixed2/${imgName3}`).put(iconImg3);
    iconUrl3 = await extractImgUrl(`sections/fixed2/${imgName3}`);
  }

  if (iconImg4) {
    imgName4 = `${Math.random()}__${iconImg4.name}`;
    await storageService.ref(`sections/fixed2/${imgName4}`).put(iconImg4);
    iconUrl4 = await extractImgUrl(`sections/fixed2/${imgName4}`);
  }

  if (iconImg5) {
    imgName5 = `${Math.random()}__${iconImg5.name}`;
    await storageService.ref(`sections/fixed2/${imgName5}`).put(iconImg5);
    iconUrl5 = await extractImgUrl(`sections/fixed2/${imgName5}`);
  }

  if (iconImg6) {
    imgName6 = `${Math.random()}__${iconImg6.name}`;
    await storageService.ref(`sections/fixed2/${imgName6}`).put(iconImg6);
    iconUrl6 = await extractImgUrl(`sections/fixed2/${imgName6}`);
  }

  if (iconImg7) {
    imgName7 = `${Math.random()}__${iconImg7.name}`;
    await storageService.ref(`sections/fixed2/${imgName7}`).put(iconImg7);
    iconUrl7 = await extractImgUrl(`sections/fixed2/${imgName7}`);
  }

  if (iconImg8) {
    imgName8 = `${Math.random()}__${iconImg8.name}`;
    await storageService.ref(`sections/fixed2/${imgName8}`).put(iconImg8);
    iconUrl8 = await extractImgUrl(`sections/fixed2/${imgName8}`);
  }

  docRef.get().then(async (doc) => {
    let docData = doc.data();
    docData.title = title;
    docData.card1 = {
      img: imgName1,
      imgUrl: iconUrl1,
      tag: t1,
      cat: c1,
      priority: p1,
    };
    docData.card2 = {
      img: imgName2,
      imgUrl: iconUrl2,
      tag: t2,
      cat: c2,
      priority: p2,
    };
    docData.card3 = {
      img: imgName3,
      imgUrl: iconUrl3,
      tag: t3,
      cat: c3,
      priority: p3,
    };
    docData.card4 = {
      img: imgName4,
      imgUrl: iconUrl4,
      tag: t4,
      cat: c4,
      priority: p4,
    };
    docData.card5 = {
      img: imgName5,
      imgUrl: iconUrl5,
      tag: t5,
      cat: c5,
      priority: p5,
    };
    docData.card6 = {
      img: imgName6,
      imgUrl: iconUrl6,
      tag: t6,
      cat: c6,
      priority: p6,
    };
    docData.card7 = {
      img: imgName7,
      imgUrl: iconUrl7,
      tag: t7,
      cat: c7,
      priority: p7,
    };
    docData.card8 = {
      img: imgName8,
      imgUrl: iconUrl8,
      tag: t8,
      cat: c8,
      priority: p8,
    };
    // console.log(docData);
    await docRef.update(docData);
    // console.log("updated");
  });

  // console.log("done");
};

fForm2HTML.addEventListener("submit", form2);

const iconChange1 = (e) => {
  iconImg1 = e.target.files[0];
  // console.log(iconImg1);
};

const iconChange2 = (e) => {
  iconImg2 = e.target.files[0];
};

const iconChange3 = (e) => {
  iconImg3 = e.target.files[0];
};

const iconChange4 = (e) => {
  iconImg4 = e.target.files[0];
};

const iconChange5 = (e) => {
  iconImg5 = e.target.files[0];
};

const iconChange6 = (e) => {
  iconImg6 = e.target.files[0];
};

const iconChange7 = (e) => {
  iconImg7 = e.target.files[0];
};

const iconChange8 = (e) => {
  iconImg8 = e.target.files[0];
};

fForm2HTML.querySelector("#f2-file1").addEventListener("change", iconChange1);
fForm2HTML.querySelector("#f2-file2").addEventListener("change", iconChange2);
fForm2HTML.querySelector("#f2-file3").addEventListener("change", iconChange3);
fForm2HTML.querySelector("#f2-file4").addEventListener("change", iconChange4);
fForm2HTML.querySelector("#f2-file5").addEventListener("change", iconChange5);
fForm2HTML.querySelector("#f2-file6").addEventListener("change", iconChange6);
fForm2HTML.querySelector("#f2-file7").addEventListener("change", iconChange7);
fForm2HTML.querySelector("#f2-file8").addEventListener("change", iconChange8);

db.collection("sections")
  .doc("fixed2")
  .onSnapshot((doc) => {
    let docData = doc.data();

    fForm2HTML["f2-title"].value = docData.title;
    if (docData.card1) {
      fForm2HTML["f2-cat1"].value = docData.card1.cat;
      fForm2HTML["f2-tag1"].value = docData.card1.tag;
      fForm2HTML["f2-priority-1"].value = docData.card1.priority;
      fForm2HTML.querySelector("#f2-img1").src = docData.card1.imgUrl;
    }

    if (docData.card2) {
      fForm2HTML["f2-cat2"].value = docData.card2.cat;
      fForm2HTML["f2-tag2"].value = docData.card2.tag;
      fForm2HTML["f2-priority-2"].value = docData.card2.priority;
      fForm2HTML.querySelector("#f2-img2").src = docData.card2.imgUrl;
    }

    if (docData.card3) {
      fForm2HTML["f2-cat3"].value = docData.card3.cat;
      fForm2HTML["f2-tag3"].value = docData.card3.tag;
      fForm2HTML["f2-priority-3"].value = docData.card3.priority;
      fForm2HTML.querySelector("#f2-img3").src = docData.card3.imgUrl;
    }

    if (docData.card4) {
      fForm2HTML["f2-cat4"].value = docData.card4.cat;
      fForm2HTML["f2-tag4"].value = docData.card4.tag;
      fForm2HTML["f2-priority-4"].value = docData.card4.priority;
      fForm2HTML.querySelector("#f2-img4").src = docData.card4.imgUrl;
    }

    if (docData.card5) {
      fForm2HTML["f2-cat5"].value = docData.card5.cat;
      fForm2HTML["f2-tag5"].value = docData.card5.tag;
      fForm2HTML["f2-priority-5"].value = docData.card5.priority;
      fForm2HTML.querySelector("#f2-img5").src = docData.card5.imgUrl;
    }

    if (docData.card6) {
      fForm2HTML["f2-cat6"].value = docData.card6.cat;
      fForm2HTML["f2-tag6"].value = docData.card6.tag;
      fForm2HTML["f2-priority-6"].value = docData.card6.priority;
      fForm2HTML.querySelector("#f2-img6").src = docData.card6.imgUrl;
    }

    if (docData.card7) {
      fForm2HTML["f2-cat7"].value = docData.card7.cat;
      fForm2HTML["f2-tag7"].value = docData.card7.tag;
      fForm2HTML["f2-priority-7"].value = docData.card7.priority;
      fForm2HTML.querySelector("#f2-img7").src = docData.card7.imgUrl;
    }

    if (docData.card8) {
      fForm2HTML["f2-cat8"].value = docData.card8.cat;
      fForm2HTML["f2-tag8"].value = docData.card8.tag;
      fForm2HTML["f2-priority-8"].value = docData.card8.priority;
      fForm2HTML.querySelector("#f2-img8").src = docData.card8.imgUrl;
    }
  });

///////////////////////////////////////////////////////////////////////////////////////////////

const fForm3HTML = document.querySelector("#fForm3");
const f3File1HTML = document.querySelector("#f3-file1");
const f3File2HTML = document.querySelector("#f3-file2");
const f3File3HTML = document.querySelector("#f3-file3");
const f3File4HTML = document.querySelector("#f3-file4");

let f3File1, f3File2, f3File3, f3File4;

const form3 = async (e) => {
  e.preventDefault();

  let f1name, f2name, f3name, f4name;
  let img1Url, img2Url, img3Url, img4Url;

  let docRef = await db.collection("sections").doc("fixed3");
  await docRef.get().then((snapshot) => {
    let docData = snapshot.data();
    if (docData.card1) {
      if (docData.card1.img) {
        f1name = docData.card1.img;
        img1Url = docData.card1.imgUrl;
      } else {
        f1name = "";
      }
    } else {
      f1name = "";
    }
    if (docData.card2) {
      if (docData.card2.img) {
        f2name = docData.card2.img;
        img2Url = docData.card2.imgUrl;
      } else {
        f2name = "";
      }
    } else {
      f2name = "";
    }
    if (docData.card3) {
      if (docData.card3.img) {
        f3name = docData.card3.img;
        img3Url = docData.card3.imgUrl;
      } else {
        f3name = "";
      }
    } else {
      f3name = "";
    }
    if (docData.card4) {
      if (docData.card4.img) {
        f4name = docData.card4.img;
        img4Url = docData.card4.imgUrl;
      } else {
        f4name = "";
      }
    } else {
      f4name = "";
    }
  });

  const title = fForm3HTML["f3-title"].value;
  const cat1 = fForm3HTML["f3-cat1"].value;
  const subCat1 = fForm3HTML["f3-subcat1"].value;
  const childCat1 = fForm3HTML["f3-childcat1"].value;
  const cat2 = fForm3HTML["f3-cat2"].value;
  const subCat2 = fForm3HTML["f3-subcat2"].value;
  const childCat2 = fForm3HTML["f3-childcat2"].value;
  const cat3 = fForm3HTML["f3-cat3"].value;
  const subCat3 = fForm3HTML["f3-subcat3"].value;
  const childCat3 = fForm3HTML["f3-childcat3"].value;
  const cat4 = fForm3HTML["f3-cat4"].value;
  const subCat4 = fForm3HTML["f3-subcat4"].value;
  const childCat4 = fForm3HTML["f3-childcat4"].value;
  const t1 = fForm3HTML["f3-t1"].value;
  const t2 = fForm3HTML["f3-t2"].value;
  const t3 = fForm3HTML["f3-t3"].value;
  const t4 = fForm3HTML["f3-t4"].value;

  if (f3File1) {
    f3name = `${Math.random()}__${f3File1.name}`;
    await storageService.ref(`sections/fixed3/${f3name}`).put(f3File1);
    img1Url = await extractImgUrl(`sections/fixed3/${f3name}`);
  }
  if (f3File2) {
    f2name = `${Math.random()}__${f3File2.name}`;
    await storageService.ref(`sections/fixed3/${f2name}`).put(f3File2);
    img2Url = await extractImgUrl(`sections/fixed3/${f2name}`);
  }
  if (f3File3) {
    f3name = `${Math.random()}__${f3File3.name}`;
    await storageService.ref(`sections/fixed3/${f3name}`).put(f3File3);
    img3Url = await extractImgUrl(`sections/fixed3/${f3name}`);
  }
  if (f3File4) {
    f4name = `${Math.random()}__${f3File4.name}`;
    await storageService.ref(`sections/fixed3/${f4name}`).put(f3File4);
    img4Url = await extractImgUrl(`sections/fixed3/${f4name}`);
  }

  docRef.get().then(async (snapshot) => {
    let docData = snapshot.data();
    docData.title = title;
    docData.card1 = {
      cat: cat1,
      subCat: subCat1,
      childCat: childCat1,
      tag: t1,
      img: f1name,
      imgUrl: img1Url,
    };
    docData.card2 = {
      cat: cat2,
      subCat: subCat2,
      childCat: childCat2,
      tag: t2,
      img: f2name,
      imgUrl: img2Url,
    };
    docData.card3 = {
      cat: cat3,
      subCat: subCat3,
      childCat: childCat3,
      tag: t3,
      img: f3name,
      imgUrl: img3Url,
    };
    docData.card4 = {
      cat: cat4,
      subCat: subCat4,
      childCat: childCat4,
      tag: t4,
      img: f4name,
      imgUrl: img4Url,
    };
    // console.log(docData);
    await docRef.update(docData);
    displayForm3();
    // console.log("updated");
  });
  // console.log("done");
};

fForm3HTML.addEventListener("submit", form3);

const f3FileChange1 = (e) => {
  f3File1 = e.target.files[0];
};
const f3FileChange2 = (e) => {
  f3File2 = e.target.files[0];
};
const f3FileChange3 = (e) => {
  f3File3 = e.target.files[0];
};
const f3FileChange4 = (e) => {
  f3File4 = e.target.files[0];
};

f3File1HTML.addEventListener("change", f3FileChange1);
f3File2HTML.addEventListener("change", f3FileChange2);
f3File3HTML.addEventListener("change", f3FileChange3);
f3File4HTML.addEventListener("change", f3FileChange4);

const displayForm3 = () => {
db.collection("sections")
  .doc("fixed3")
  .onSnapshot((doc) => {
    let docData = doc.data();
    // console.log(docData);
    fForm3HTML["f3-title"].value = docData.title;
    if (docData.card1) {
      fForm3HTML.querySelector("#f3-img1").src = docData.card1.imgUrl;
      fForm3HTML["f3-cat1"].value = docData.card1.cat;
      fForm3HTML["f3-subcat1"].value = docData.card1.subCat;
      fForm3HTML["f3-childcat1"].value = docData.card1.childCat;
      fForm3HTML["f3-t1"].value = docData.card1.tag;
    }

    if (docData.card2) {
      fForm3HTML.querySelector("#f3-img2").src = docData.card2.imgUrl;
      fForm3HTML["f3-cat2"].value = docData.card2.cat;
      fForm3HTML["f3-subcat2"].value = docData.card2.subCat;
      fForm3HTML["f3-childcat2"].value = docData.card2.childCat;
      fForm3HTML["f3-t2"].value = docData.card2.tag;
    }

    if (docData.card3) {
      fForm3HTML.querySelector("#f3-img3").src = docData.card3.imgUrl;
      fForm3HTML["f3-cat3"].value = docData.card3.cat;
      fForm3HTML["f3-subcat3"].value = docData.card3.subCat;
      fForm3HTML["f3-childcat3"].value = docData.card3.childCat;
      fForm3HTML["f3-t3"].value = docData.card3.tag;
    }

    if (docData.card4) {
      fForm3HTML.querySelector("#f3-img4").src = docData.card4.imgUrl;
      fForm3HTML["f3-cat4"].value = docData.card4.cat;
      fForm3HTML["f3-subcat4"].value = docData.card4.subCat;
      fForm3HTML["f3-childcat4"].value = docData.card4.childCat;
      fForm3HTML["f3-t4"].value = docData.card4.tag;
    }
  });
}
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

const fForm4HTML = document.querySelector("#fForm4");

const form4 = async (e) => {
  e.preventDefault();

  let docRef = await db.collection("sections").doc("fixed4");

  const f4Title = fForm4HTML["f4-title"].value;
  const f4Id1 = fForm4HTML["f4-id1"].value;
  const f4Id2 = fForm4HTML["f4-id2"].value;
  const f4Id3 = fForm4HTML["f4-id3"].value;
  const f4Id4 = fForm4HTML["f4-id4"].value;
  const f4Id5 = fForm4HTML["f4-id5"].value;
  const f4Id6 = fForm4HTML["f4-id6"].value;
  const f4Id7 = fForm4HTML["f4-id7"].value;
  const f4Id8 = fForm4HTML["f4-id8"].value;

  const f4Cat1 = fForm4HTML["f4-cat1"].value;
  const f4Cat2 = fForm4HTML["f4-cat2"].value;
  const f4Cat3 = fForm4HTML["f4-cat3"].value;
  const f4Cat4 = fForm4HTML["f4-cat4"].value;
  const f4Cat5 = fForm4HTML["f4-cat5"].value;
  const f4Cat6 = fForm4HTML["f4-cat6"].value;
  const f4Cat7 = fForm4HTML["f4-cat7"].value;
  const f4Cat8 = fForm4HTML["f4-cat8"].value;

  let userInputs = [
    { sno: f4Id1, cat: f4Cat1 },
    { sno: f4Id2, cat: f4Cat2 },
    { sno: f4Id3, cat: f4Cat3 },
    { sno: f4Id4, cat: f4Cat4 },
    { sno: f4Id5, cat: f4Cat5 },
    { sno: f4Id6, cat: f4Cat6 },
    { sno: f4Id7, cat: f4Cat7 },
    { sno: f4Id8, cat: f4Cat8 },
  ];

  // console.log(userInputs);
  // userInputs.map(async(ui) => {
  for (let ui of userInputs) {
    let c = ui.cat.split("__")[0];
    // console.log(ui);
    await db
      .collection(c)
      .get()
      .then((snapshots) => {
        let snapshotDocs = snapshots.docs;
        for (let doc of snapshotDocs) {
          let docData = doc.data();
          // console.log(docData.category, docData.sno);
          if (docData.sno === ui.sno) {
            ui.id = `${doc.id}`;
            ui.name = docData.name;
            ui.sno = docData.sno;
            ui.bannerType = docData.bannerType;
            ui.bannerTypeColorEnd = docData.bannerTypeColorEnd;
            ui.bannerTypeColorStart = docData.bannerTypeColorStart;
            ui.gst = docData.gst;
            ui.mainImgUrl = docData.mainImgUrl;
            ui.mrp = docData.mrp;
            ui.stars = docData.stars;
            ui.totalPrice = docData.totalPrice;

            break;
          } else {
            ui.id = "na";
          }
        }
      })
      .catch((error) => {
        console.log(error);
      });
  }

  // console.log(userInputs);

  await docRef.get().then(async (snapshot) => {
    let docData = snapshot.data();
    // console.log(docData);
    docData.prodIds = userInputs;
    docData.title = f4Title;
    // console.log(docData);
    await docRef.update(docData);
    // console.log("updated");
  });

  // console.log("done");
};

fForm4HTML.addEventListener("submit", form4);

db.collection("sections")
  .doc("fixed4")
  .onSnapshot((doc) => {
    let docData = doc.data();
    // console.log(docData);
    fForm4HTML["f4-title"].value = docData.title;
    fForm4HTML["f4-cat1"].value = docData.prodIds[0].cat;
    fForm4HTML["f4-cat2"].value = docData.prodIds[1].cat;
    fForm4HTML["f4-cat3"].value = docData.prodIds[2].cat;
    fForm4HTML["f4-cat4"].value = docData.prodIds[3].cat;
    fForm4HTML["f4-cat5"].value = docData.prodIds[4].cat;
    fForm4HTML["f4-cat6"].value = docData.prodIds[5].cat;
    fForm4HTML["f4-cat7"].value = docData.prodIds[6].cat;
    fForm4HTML["f4-cat8"].value = docData.prodIds[7].cat;
    fForm4HTML["f4-id1"].value = docData.prodIds[0].sno;
    fForm4HTML["f4-id2"].value = docData.prodIds[1].sno;
    fForm4HTML["f4-id3"].value = docData.prodIds[2].sno;
    fForm4HTML["f4-id4"].value = docData.prodIds[3].sno;
    fForm4HTML["f4-id5"].value = docData.prodIds[4].sno;
    fForm4HTML["f4-id6"].value = docData.prodIds[5].sno;
    fForm4HTML["f4-id7"].value = docData.prodIds[6].sno;
    fForm4HTML["f4-id8"].value = docData.prodIds[7].sno;
  });

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

const fForm5HTML = document.querySelector("#fForm5");
const f5File1HTML = document.querySelector("#f5-file1");
const f5File2HTML = document.querySelector("#f5-file2");
const f5File3HTML = document.querySelector("#f5-file3");
const f5File4HTML = document.querySelector("#f5-file4");
const f5File5HTML = document.querySelector("#f5-file5");
const f5File6HTML = document.querySelector("#f5-file6");

let f5File1, f5File2, f5File3, f5File4, f5File5, f5File6;

const form5 = async (e) => {
  e.preventDefault();

  let f1name, f2name, f3name, f4name, f5name, f6name;
  let img1Url, img2Url, img3Url, img4Url, img5Url, img6Url;

  let docRef = await db.collection("sections").doc("fixed5");
  await docRef.get().then((snapshot) => {
    let docData = snapshot.data();
    if (docData.card1) {
      if (docData.card1.img) {
        f1name = docData.card1.img;
        img1Url = docData.card1.imgUrl;
      } else {
        f1name = "";
      }
    } else {
      f1name = "";
    }
    if (docData.card2) {
      if (docData.card2.img) {
        f2name = docData.card2.img;
        img2Url = docData.card2.imgUrl;
      } else {
        f2name = "";
      }
    } else {
      f2name = "";
    }
    if (docData.card3) {
      if (docData.card3.img) {
        f3name = docData.card3.img;
        img3Url = docData.card3.imgUrl;
      } else {
        f3name = "";
      }
    } else {
      f3name = "";
    }
    if (docData.card4) {
      if (docData.card4.img) {
        f4name = docData.card4.img;
        img4Url = docData.card4.imgUrl;
      } else {
        f4name = "";
      }
    } else {
      f4name = "";
    }
    if (docData.card5) {
      if (docData.card5.img) {
        f5name = docData.card5.img;
        img5Url = docData.card5.imgUrl;
      } else {
        f5name = "";
      }
    } else {
      f5name = "";
    }
    if (docData.card6) {
      if (docData.card6.img) {
        f6name = docData.card6.img;
        img6Url = docData.card6.imgUrl;
      } else {
        f6name = "";
      }
    } else {
      f6name = "";
    }
  });

  const title = fForm5HTML["f5-title"].value;
  const cat1 = fForm5HTML["f5-cat1"].value;
  const subCat1 = fForm5HTML["f5-subcat1"].value;
  const childCat1 = fForm5HTML["f5-childcat1"].value;
  const cat2 = fForm5HTML["f5-cat2"].value;
  const subCat2 = fForm5HTML["f5-subcat2"].value;
  const childCat2 = fForm5HTML["f5-childcat2"].value;
  const cat3 = fForm5HTML["f5-cat3"].value;
  const subCat3 = fForm5HTML["f5-subcat3"].value;
  const childCat3 = fForm5HTML["f5-childcat3"].value;
  const cat4 = fForm5HTML["f5-cat4"].value;
  const subCat4 = fForm5HTML["f5-subcat4"].value;
  const childCat4 = fForm5HTML["f5-childcat4"].value;
  const cat5 = fForm5HTML["f5-cat5"].value;
  const subCat5 = fForm5HTML["f5-subcat5"].value;
  const childCat5 = fForm5HTML["f5-childcat5"].value;
  const cat6 = fForm5HTML["f5-cat6"].value;
  const subCat6 = fForm5HTML["f5-subcat6"].value;
  const childCat6 = fForm5HTML["f5-childcat6"].value;
  const t1 = fForm5HTML["f5-t1"].value;
  const t2 = fForm5HTML["f5-t2"].value;
  const t3 = fForm5HTML["f5-t3"].value;
  const t4 = fForm5HTML["f5-t4"].value;
  const t5 = fForm5HTML["f5-t5"].value;
  const t6 = fForm5HTML["f5-t6"].value;

  if (f5File1) {
    // console.log(f5File1);
    f1name = `${Math.random()}__${f5File1.name}`;
    // console.log(f1name);
    await storageService.ref(`sections/fixed5/${f1name}`).put(f5File1);
    img1Url = await extractImgUrl(`sections/fixed5/${f1name}`);
  }
  if (f5File2) {
    f2name = `${Math.random()}__${f5File2.name}`;
    await storageService.ref(`sections/fixed5/${f2name}`).put(f5File2);
    img2Url = await extractImgUrl(`sections/fixed5/${f2name}`);
  }
  if (f5File3) {
    f3name = `${Math.random()}__${f5File3.name}`;
    await storageService.ref(`sections/fixed5/${f3name}`).put(f5File3);
    img3Url = await extractImgUrl(`sections/fixed5/${f3name}`);
  }
  if (f5File4) {
    f4name = `${Math.random()}__${f5File4.name}`;
    await storageService.ref(`sections/fixed5/${f4name}`).put(f5File4);
    img4Url = await extractImgUrl(`sections/fixed5/${f4name}`);
  }
  if (f5File5) {
    f5name = `${Math.random()}__${f5File5.name}`;
    await storageService.ref(`sections/fixed5/${f5name}`).put(f5File5);
    img5Url = await extractImgUrl(`sections/fixed5/${f5name}`);
  }
  if (f5File6) {
    f6name = `${Math.random()}__${f5File6.name}`;
    await storageService.ref(`sections/fixed5/${f6name}`).put(f5File6);
    img6Url = await extractImgUrl(`sections/fixed5/${f6name}`);
  }

  await docRef.get().then(async (snapshot) => {
    let docData = snapshot.data();
    docData.title = title;
    docData.card1 = {
      cat: cat1,
      subCat: subCat1,
      childCat: childCat1,
      tag: t1,
      img: f1name,
      imgUrl: img1Url,
    };
    docData.card2 = {
      cat: cat2,
      subCat: subCat2,
      childCat: childCat2,
      tag: t2,
      img: f2name,
      imgUrl: img2Url,
    };
    docData.card3 = {
      cat: cat3,
      subCat: subCat3,
      childCat: childCat3,
      tag: t3,
      img: f3name,
      imgUrl: img3Url,
    };
    docData.card4 = {
      cat: cat4,
      subCat: subCat4,
      childCat: childCat4,
      tag: t4,
      img: f4name,
      imgUrl: img4Url,
    };
    docData.card5 = {
      cat: cat5,
      subCat: subCat5,
      childCat: childCat5,
      tag: t5,
      img: f5name,
      imgUrl: img5Url,
    };
    docData.card6 = {
      cat: cat6,
      subCat: subCat6,
      childCat: childCat6,
      tag: t6,
      img: f6name,
      imgUrl: img6Url,
    };
    // console.log(docData);
    await docRef.update(docData);
    displayForm5();
    // console.log("updated");
  });
  // console.log("done");
};

fForm5HTML.addEventListener("submit", form5);

const f5FileChange1 = (e) => {
  f5File1 = e.target.files[0];
};
const f5FileChange2 = (e) => {
  f5File2 = e.target.files[0];
};
const f5FileChange3 = (e) => {
  f5File3 = e.target.files[0];
};
const f5FileChange4 = (e) => {
  f5File4 = e.target.files[0];
};
const f5FileChange5 = (e) => {
  f5File5 = e.target.files[0];
};
const f5FileChange6 = (e) => {
  f5File6 = e.target.files[0];
};

f5File1HTML.addEventListener("change", f5FileChange1);
f5File2HTML.addEventListener("change", f5FileChange2);
f5File3HTML.addEventListener("change", f5FileChange3);
f5File4HTML.addEventListener("change", f5FileChange4);
f5File5HTML.addEventListener("change", f5FileChange5);
f5File6HTML.addEventListener("change", f5FileChange6);

const displayForm5 = () => {
db.collection("sections")
  .doc("fixed5")
  .onSnapshot((doc) => {
    let docData = doc.data();
    // console.log(docData);
    fForm5HTML["f5-title"].value = docData.title;
    if (docData.card1) {
      fForm5HTML.querySelector("#f5-img1").src = docData.card1.imgUrl;
      fForm5HTML["f5-cat1"].value = docData.card1.cat;
      fForm5HTML["f5-subcat1"].value = docData.card1.subCat;
      fForm5HTML["f5-childcat1"].value = docData.card1.childCat;
      fForm5HTML["f5-t1"].value = docData.card1.tag;
    }

    if (docData.card2) {
      fForm5HTML.querySelector("#f5-img2").src = docData.card2.imgUrl;
      fForm5HTML["f5-cat2"].value = docData.card2.cat;
      fForm5HTML["f5-subcat2"].value = docData.card2.subCat;
      fForm5HTML["f5-childcat2"].value = docData.card2.childCat;
      fForm5HTML["f5-t2"].value = docData.card2.tag;
    }

    if (docData.card3) {
      fForm5HTML.querySelector("#f5-img3").src = docData.card3.imgUrl;
      fForm5HTML["f5-cat3"].value = docData.card3.cat;
      fForm5HTML["f5-subcat3"].value = docData.card3.subCat;
      fForm5HTML["f5-childcat3"].value = docData.card3.childCat;
      fForm5HTML["f5-t3"].value = docData.card3.tag;
    }

    if (docData.card4) {
      fForm5HTML.querySelector("#f5-img4").src = docData.card4.imgUrl;
      fForm5HTML["f5-cat4"].value = docData.card4.cat;
      fForm5HTML["f5-subcat4"].value = docData.card4.subCat;
      fForm5HTML["f5-childcat4"].value = docData.card4.childCat;
      fForm5HTML["f5-t4"].value = docData.card4.tag;
    }

    if (docData.card5) {
      fForm5HTML.querySelector("#f5-img5").src = docData.card4.imgUrl;
      fForm5HTML["f5-cat5"].value = docData.card5.cat;
      fForm5HTML["f5-subcat5"].value = docData.card5.subCat;
      fForm5HTML["f5-childcat5"].value = docData.card5.childCat;
      fForm5HTML["f5-t5"].value = docData.card5.tag;
    }

    if (docData.card6) {
      fForm5HTML.querySelector("#f5-img6").src = docData.card4.imgUrl;
      fForm5HTML["f5-cat6"].value = docData.card6.cat;
      fForm5HTML["f5-subcat6"].value = docData.card6.subCat;
      fForm5HTML["f5-childcat6"].value = docData.card6.childCat;
      fForm5HTML["f5-t6"].value = docData.card6.tag;
    }
  });
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////

const fForm6HTML = document.querySelector("#fForm6");

const form6 = async (e) => {
  e.preventDefault();

  let docRef = await db.collection("sections").doc("fixed6");

  const f6Title = fForm6HTML["f6-title"].value;
  const f6Id1 = fForm6HTML["f6-id1"].value;
  const f6Id2 = fForm6HTML["f6-id2"].value;
  const f6Id3 = fForm6HTML["f6-id3"].value;
  const f6Id4 = fForm6HTML["f6-id4"].value;
  const f6Id5 = fForm6HTML["f6-id5"].value;
  const f6Id6 = fForm6HTML["f6-id6"].value;

  const f6Cat1 = fForm6HTML["f6-cat1"].value;
  const f6Cat2 = fForm6HTML["f6-cat2"].value;
  const f6Cat3 = fForm6HTML["f6-cat3"].value;
  const f6Cat4 = fForm6HTML["f6-cat4"].value;
  const f6Cat5 = fForm6HTML["f6-cat5"].value;
  const f6Cat6 = fForm6HTML["f6-cat6"].value;

  let userInputs = [
    { sno: f6Id1, cat: f6Cat1 },
    { sno: f6Id2, cat: f6Cat2 },
    { sno: f6Id3, cat: f6Cat3 },
    { sno: f6Id4, cat: f6Cat4 },
    { sno: f6Id5, cat: f6Cat5 },
    { sno: f6Id6, cat: f6Cat6 },
  ];

  // console.log(userInputs);
  // userInputs.map(async(ui) => {
  for (let ui of userInputs) {
    let c = ui.cat.split("__")[0];

    await db
      .collection(c)
      .get()
      .then((snapshots) => {
        let snapshotDocs = snapshots.docs;
        for (let doc of snapshotDocs) {
          let docData = doc.data();
          // console.log(docData.category, docData.sno);
          if (docData.sno === ui.sno) {
            ui.id = doc.id;
            ui.name = docData.name;
            ui.sno = docData.sno;
            ui.bannerType = docData.bannerType;
            ui.bannerTypeColorEnd = docData.bannerTypeColorEnd;
            ui.bannerTypeColorStart = docData.bannerTypeColorStart;
            ui.gst = docData.gst;
            ui.mainImgUrl = docData.mainImgUrl;
            ui.mrp = docData.mrp;
            ui.stars = docData.stars;
            ui.totalPrice = docData.totalPrice;
            break;
          } else {
            ui.id = "na";
          }
        }
      })
      .catch((error) => {
        console.log(error);
      });
  }

  // console.log(userInputs);

  await docRef.get().then(async (snapshot) => {
    let docData = snapshot.data();
    docData.prodIds = userInputs;
    docData.title = f6Title;
    await docRef.update(docData);
    // console.log('updated');
  });

  // console.log('done');
};

fForm6HTML.addEventListener("submit", form6);

db.collection("sections")
  .doc("fixed6")
  .onSnapshot((doc) => {
    let docData = doc.data();
    // console.log(docData);
    fForm6HTML["f6-title"].value = docData.title || "No Title";
    fForm6HTML["f6-cat1"].value = docData.prodIds[0].cat;
    fForm6HTML["f6-cat2"].value = docData.prodIds[1].cat;
    fForm6HTML["f6-cat3"].value = docData.prodIds[2].cat;
    fForm6HTML["f6-cat4"].value = docData.prodIds[3].cat;
    fForm6HTML["f6-cat5"].value = docData.prodIds[4].cat;
    fForm6HTML["f6-cat6"].value = docData.prodIds[5].cat;
    fForm6HTML["f6-id1"].value = docData.prodIds[0].sno;
    fForm6HTML["f6-id2"].value = docData.prodIds[1].sno;
    fForm6HTML["f6-id3"].value = docData.prodIds[2].sno;
    fForm6HTML["f6-id4"].value = docData.prodIds[3].sno;
    fForm6HTML["f6-id5"].value = docData.prodIds[4].sno;
    fForm6HTML["f6-id6"].value = docData.prodIds[5].sno;
  });

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

const fForm7HTML = document.querySelector("#fForm7");

const form7 = async (e) => {
  e.preventDefault();

  let docRef = await db.collection("sections").doc("fixed7");

  const f7Title = fForm7HTML["f7-title"].value;
  const f7Id1 = fForm7HTML["f7-id1"].value;
  const f7Id2 = fForm7HTML["f7-id2"].value;
  const f7Id3 = fForm7HTML["f7-id3"].value;
  const f7Id4 = fForm7HTML["f7-id4"].value;
  const f7Id5 = fForm7HTML["f7-id5"].value;
  const f7Id6 = fForm7HTML["f7-id6"].value;

  const f7Cat1 = fForm7HTML["f7-cat1"].value;
  const f7Cat2 = fForm7HTML["f7-cat2"].value;
  const f7Cat3 = fForm7HTML["f7-cat3"].value;
  const f7Cat4 = fForm7HTML["f7-cat4"].value;
  const f7Cat5 = fForm7HTML["f7-cat5"].value;
  const f7Cat6 = fForm7HTML["f7-cat6"].value;

  let userInputs = [
    { sno: f7Id1, cat: f7Cat1 },
    { sno: f7Id2, cat: f7Cat2 },
    { sno: f7Id3, cat: f7Cat3 },
    { sno: f7Id4, cat: f7Cat4 },
    { sno: f7Id5, cat: f7Cat5 },
    { sno: f7Id6, cat: f7Cat6 },
  ];

  for (let ui of userInputs) {
    let c = ui.cat.split("__")[0];
    await db
      .collection(c)
      .get()
      .then((snapshots) => {
        let snapshotDocs = snapshots.docs;
        for (let doc of snapshotDocs) {
          let docData = doc.data();
          if (docData.sno === ui.sno) {
            ui.id = doc.id;
            ui.name = docData.name;
            ui.sno = docData.sno;
            ui.bannerType = docData.bannerType;
            ui.bannerTypeColorEnd = docData.bannerTypeColorEnd;
            ui.bannerTypeColorStart = docData.bannerTypeColorStart;
            ui.gst = docData.gst;
            ui.mainImgUrl = docData.mainImgUrl;
            ui.mrp = docData.mrp;
            ui.stars = docData.stars;
            ui.totalPrice = docData.totalPrice;
            break;
          } else {
            ui.id = "na";
          }
        }
      })
      .catch((error) => {
        console.log(error);
      });
  }

  await docRef.get().then(async (snapshot) => {
    let docData = snapshot.data();
    docData.prodIds = userInputs;
    docData.title = f7Title;
    await docRef.update(docData);
    // console.log("updated");
  });

  // console.log("done");
};

fForm7HTML.addEventListener("submit", form7);

db.collection("sections")
  .doc("fixed7")
  .onSnapshot((doc) => {
    let docData = doc.data();
    // console.log(docData);
    fForm7HTML["f7-title"].value = docData.title || "No Title";
    fForm7HTML["f7-cat1"].value = docData.prodIds[0].cat;
    fForm7HTML["f7-cat2"].value = docData.prodIds[1].cat;
    fForm7HTML["f7-cat3"].value = docData.prodIds[2].cat;
    fForm7HTML["f7-cat4"].value = docData.prodIds[3].cat;
    fForm7HTML["f7-cat5"].value = docData.prodIds[4].cat;
    fForm7HTML["f7-cat6"].value = docData.prodIds[5].cat;
    fForm7HTML["f7-id1"].value = docData.prodIds[0].sno;
    fForm7HTML["f7-id2"].value = docData.prodIds[1].sno;
    fForm7HTML["f7-id3"].value = docData.prodIds[2].sno;
    fForm7HTML["f7-id4"].value = docData.prodIds[3].sno;
    fForm7HTML["f7-id5"].value = docData.prodIds[4].sno;
    fForm7HTML["f7-id6"].value = docData.prodIds[5].sno;
  });

//////////////////////////////////////////////////////////////////////////////////////////////////////////

const fForm8HTML = document.querySelector("#fForm8");
const f8File1HTML = document.querySelector("#f8-file1");
const f8File2HTML = document.querySelector("#f8-file2");
const f8File3HTML = document.querySelector("#f8-file3");
const f8File4HTML = document.querySelector("#f8-file4");

let f8File1, f8File2, f8File3, f8File4;

const form8 = async (e) => {
  e.preventDefault();

  let f1name, f2name, f3name, f4name;
  let img1Url, img2Url, img3Url, img4Url;

  let docRef = await db.collection("sections").doc("fixed8");
  await docRef.get().then((snapshot) => {
    let docData = snapshot.data();
    if (docData.card1) {
      if (docData.card1.img) {
        f1name = docData.card1.img;
        img1Url = docData.card1.imgUrl;
      } else {
        f1name = "";
      }
    } else {
      f1name = "";
    }
    if (docData.card2) {
      if (docData.card2.img) {
        f2name = docData.card2.img;
        img2Url = docData.card2.imgUrl;
      } else {
        f2name = "";
      }
    } else {
      f2name = "";
    }
    if (docData.card3) {
      if (docData.card3.img) {
        f3name = docData.card3.img;
        img3Url = docData.card3.imgUrl;
      } else {
        f3name = "";
      }
    } else {
      f3name = "";
    }
    if (docData.card4) {
      if (docData.card4.img) {
        f4name = docData.card4.img;
        img4Url = docData.card4.imgUrl;
      } else {
        f4name = "";
      }
    } else {
      f4name = "";
    }
  });

  const title = fForm8HTML["f8-title"].value;
  const cat1 = fForm8HTML["f3-cat1"].value;
  const subCat1 = fForm8HTML["f3-subcat1"].value;
  const childCat1 = fForm8HTML["f3-childcat1"].value;
  const cat2 = fForm8HTML["f3-cat2"].value;
  const subCat2 = fForm8HTML["f3-subcat2"].value;
  const childCat2 = fForm8HTML["f3-childcat2"].value;
  const cat3 = fForm8HTML["f3-cat3"].value;
  const subCat3 = fForm8HTML["f3-subcat3"].value;
  const childCat3 = fForm8HTML["f3-childcat3"].value;
  const cat4 = fForm8HTML["f3-cat4"].value;
  const subCat4 = fForm8HTML["f3-subcat4"].value;
  const childCat4 = fForm8HTML["f3-childcat4"].value;
  const t1 = fForm8HTML["f8-t1"].value;
  const t2 = fForm8HTML["f8-t2"].value;
  const t3 = fForm8HTML["f8-t3"].value;
  const t4 = fForm8HTML["f8-t4"].value;

  if (f8File1) {
    f1name = `${Math.random()}__${f8File1.name}`;
    await storageService.ref(`sections/fixed8/${f1name}`).put(f8File1);
    img1Url = await extractImgUrl(`sections/fixed8/${f1name}`);
  }
  if (f8File2) {
    f2name = `${Math.random()}__${f8File2.name}`;
    await storageService.ref(`sections/fixed8/${f2name}`).put(f8File2);
    img2Url = await extractImgUrl(`sections/fixed8/${f2name}`);
  }
  if (f8File3) {
    f3name = `${Math.random()}__${f8File3.name}`;
    await storageService.ref(`sections/fixed8/${f3name}`).put(f8File3);
    img3Url = await extractImgUrl(`sections/fixed8/${f3name}`);
  }
  if (f8File4) {
    f4name = `${Math.random()}__${f8File4.name}`;
    await storageService.ref(`sections/fixed8/${f4name}`).put(f8File4);
    img4Url = await extractImgUrl(`sections/fixed8/${f4name}`);
  }

  docRef.get().then(async (snapshot) => {
    let docData = snapshot.data();
    docData.title = title;
    docData.card1 = {
      cat: cat1,
      subCat: subCat1,
      childCat: childCat1,
      tag: t1,
      img: f1name,
      imgUrl: img1Url,
    };
    docData.card2 = {
      cat: cat2,
      subCat: subCat2,
      childCat: childCat2,
      tag: t2,
      img: f2name,
      imgUrl: img2Url,
    };
    docData.card3 = {
      cat: cat3,
      subCat: subCat3,
      childCat: childCat3,
      tag: t3,
      img: f3name,
      imgUrl: img3Url,
    };
    docData.card4 = {
      cat: cat4,
      subCat: subCat4,
      childCat: childCat4,
      tag: t4,
      img: f4name,
      imgUrl: img4Url,
    };
    // console.log(docData);
    await docRef.update(docData);
    displayForm8();
    // console.log("updated");
  });
  // console.log("done");
};

fForm8HTML.addEventListener("submit", form8);

const f8FileChange1 = (e) => {
  f8File1 = e.target.files[0];
};
const f8FileChange2 = (e) => {
  f8File2 = e.target.files[0];
};
const f8FileChange3 = (e) => {
  f8File3 = e.target.files[0];
};
const f8FileChange4 = (e) => {
  f8File4 = e.target.files[0];
};

f8File1HTML.addEventListener("change", f8FileChange1);
f8File2HTML.addEventListener("change", f8FileChange2);
f8File3HTML.addEventListener("change", f8FileChange3);
f8File4HTML.addEventListener("change", f8FileChange4);

const displayForm8 = () => {
db.collection("sections")
  .doc("fixed8")
  .onSnapshot((doc) => {
    let docData = doc.data();
    // console.log(docData);
    fForm8HTML["f8-title"].value = docData.title;
    if (docData.card1) {
      fForm8HTML.querySelector("#f8-img1").src = docData.card1.imgUrl;
      fForm8HTML["f8-cat1"].value = docData.card1.cat;
      fForm8HTML["f8-subcat1"].value = docData.card1.subCat;
      fForm8HTML["f8-childcat1"].value = docData.card1.childCat;
      fForm8HTML["f8-t1"].value = docData.card1.tag;
    }

    if (docData.card2) {
      fForm8HTML.querySelector("#f8-img2").src = docData.card2.imgUrl;
      fForm8HTML["f8-cat2"].value = docData.card2.cat;
      fForm8HTML["f8-subcat2"].value = docData.card2.subCat;
      fForm8HTML["f8-childcat2"].value = docData.card2.childCat;
      fForm8HTML["f8-t2"].value = docData.card2.tag;
    }

    if (docData.card3) {
      fForm8HTML.querySelector("#f8-img3").src = docData.card3.imgUrl;
      fForm8HTML["f8-cat3"].value = docData.card3.cat;
      fForm8HTML["f8-subcat3"].value = docData.card3.subCat;
      fForm8HTML["f8-childcat3"].value = docData.card3.childCat;
      fForm8HTML["f8-t3"].value = docData.card3.tag;
    }

    if (docData.card4) {
      fForm8HTML.querySelector("#f8-img4").src = docData.card4.imgUrl;
      fForm8HTML["f8-cat4"].value = docData.card4.cat;
      fForm8HTML["f8-subcat4"].value = docData.card4.subCat;
      fForm8HTML["f8-childcat4"].value = docData.card4.childCat;
      fForm8HTML["f8-t4"].value = docData.card4.tag;
    }
  });
}
// ///////////////////////////////////////////////////////////////////////////////////////////////////
// best seller

const fForm10HTML = document.querySelector("#fForm10");

const form10 = async (e) => {
  e.preventDefault();

  let docRef = await db.collection("sections").doc("fixed10");

  const f4Title = fForm10HTML["f10-title"].value;
  const f4Id1 = fForm10HTML["f10-id1"].value;
  const f4Id2 = fForm10HTML["f10-id2"].value;
  const f4Id3 = fForm10HTML["f10-id3"].value;
  const f4Id4 = fForm10HTML["f10-id4"].value;
  const f4Id5 = fForm10HTML["f10-id5"].value;
  const f4Id6 = fForm10HTML["f10-id6"].value;

  const f4Cat1 = fForm10HTML["f10-cat1"].value;
  const f4Cat2 = fForm10HTML["f10-cat2"].value;
  const f4Cat3 = fForm10HTML["f10-cat3"].value;
  const f4Cat4 = fForm10HTML["f10-cat4"].value;
  const f4Cat5 = fForm10HTML["f10-cat5"].value;
  const f4Cat6 = fForm10HTML["f10-cat6"].value;


  let userInputs = [
    { sno: f4Id1, cat: f4Cat1 },
    { sno: f4Id2, cat: f4Cat2 },
    { sno: f4Id3, cat: f4Cat3 },
    { sno: f4Id4, cat: f4Cat4 },
    { sno: f4Id5, cat: f4Cat5 },
    { sno: f4Id6, cat: f4Cat6 },

  ];

  // console.log(userInputs);
  // userInputs.map(async(ui) => {
  for (let ui of userInputs) {
    let c = ui.cat.split("__")[0];
    // console.log(ui);
    await db
      .collection(c)
      .get()
      .then((snapshots) => {
        let snapshotDocs = snapshots.docs;
        for (let doc of snapshotDocs) {
          let docData = doc.data();
          // console.log(docData.category, docData.sno);
          if (docData.sno === ui.sno) {
            ui.id = `${doc.id}`;
            ui.name = docData.name;
            ui.sno = docData.sno;
            ui.bannerType = docData.bannerType;
            ui.bannerTypeColorEnd = docData.bannerTypeColorEnd;
            ui.bannerTypeColorStart = docData.bannerTypeColorStart;
            ui.gst = docData.gst;
            ui.mainImgUrl = docData.mainImgUrl;
            ui.mrp = docData.mrp;
            ui.stars = docData.stars;
            ui.totalPrice = docData.totalPrice;
            break;
          } else {
            ui.id = "na";
          }
        }
      })
      .catch((error) => {
        console.log(error);
      });
  }

  // console.log(userInputs);

  await docRef.get().then(async (snapshot) => {
    let docData = snapshot.data();
    // console.log(docData);
    docData.prodIds = userInputs;
    docData.title = f4Title;
    // console.log(docData);
    await docRef.update(docData);
    // console.log("updated");
  });

  // console.log("done");
};

fForm10HTML.addEventListener("submit", form10);

db.collection("sections")
  .doc("fixed10")
  .onSnapshot((doc) => {
    let docData = doc.data();
    // console.log(docData);
    fForm10HTML["f10-title"].value = docData.title;
    fForm10HTML["f10-cat1"].value = docData.prodIds[0].cat;
    fForm10HTML["f10-cat2"].value = docData.prodIds[1].cat;
    fForm10HTML["f10-cat3"].value = docData.prodIds[2].cat;
    fForm10HTML["f10-cat4"].value = docData.prodIds[3].cat;
    fForm10HTML["f10-cat5"].value = docData.prodIds[4].cat;
    fForm10HTML["f10-cat6"].value = docData.prodIds[5].cat;
    // fForm10HTML["f10-cat7"].value = docData.prodIds[6].cat;
    // fForm10HTML["f10-cat8"].value = docData.prodIds[7].cat;
    fForm10HTML["f10-id1"].value = docData.prodIds[0].sno;
    fForm10HTML["f10-id2"].value = docData.prodIds[1].sno;
    fForm10HTML["f10-id3"].value = docData.prodIds[2].sno;
    fForm10HTML["f10-id4"].value = docData.prodIds[3].sno;
    fForm10HTML["f10-id5"].value = docData.prodIds[4].sno;
    fForm10HTML["f10-id6"].value = docData.prodIds[5].sno;
    // fForm10HTML["f10-id7"].value = docData.prodIds[6].sno;
    // fForm10HTML["f10-id8"].value = docData.prodIds[7].sno;
  });

/////////////////////////////////////////////////////////////////////////////////////////////////////

const fForm9HTML = document.querySelector("#fForm9");
const f9File1HTML = document.querySelector("#f9-file1");
const f9File2HTML = document.querySelector("#f9-file2");
const f9File3HTML = document.querySelector("#f9-file3");
const f9File4HTML = document.querySelector("#f9-file4");

let f9File1, f9File2, f9File3, f9File4;

const form9 = async (e) => {
  e.preventDefault();

  let f1name, f2name, f3name, f4name;
  let img1Url, img2Url, img3Url, img4Url;

  let docRef = await db.collection("sections").doc("fixed9");
  await docRef.get().then((snapshot) => {
    let docData = snapshot.data();
    if (docData.card1) {
      if (docData.card1.img) {
        f1name = docData.card1.img;
        img1Url = docData.card1.imgUrl;
      } else {
        f1name = "";
      }
    } else {
      f1name = "";
    }
    if (docData.card2) {
      if (docData.card2.img) {
        f2name = docData.card2.img;
        img2Url = docData.card2.imgUrl;
      } else {
        f2name = "";
      }
    } else {
      f2name = "";
    }
    if (docData.card3) {
      if (docData.card3.img) {
        f3name = docData.card3.img;
        img3Url = docData.card3.imgUrl;
      } else {
        f3name = "";
      }
    } else {
      f3name = "";
    }
    if (docData.card4) {
      if (docData.card4.img) {
        f4name = docData.card4.img;
        img4Url = docData.card4.imgUrl;
      } else {
        f4name = "";
      }
    } else {
      f4name = "";
    }
  });

  const title = fForm9HTML["f9-title"].value;
  const cat1 = fFrorm9HTML["f3-cat1"].value;
  const subCat1 = fFrorm9HTML["f3-subcat1"].value;
  const childCat1 = fFrorm9HTML["f3-childcat1"].value;
  const cat2 = fFrorm9HTML["f3-cat2"].value;
  const subCat2 = fFrorm9HTML["f3-subcat2"].value;
  const childCat2 = fFrorm9HTML["f3-childcat2"].value;
  const cat3 = fFrorm9HTML["f3-cat3"].value;
  const subCat3 = fFrorm9HTML["f3-subcat3"].value;
  const childCat3 = fFrorm9HTML["f3-childcat3"].value;
  const cat4 = fFrorm9HTML["f3-cat4"].value;
  const subCat4 = fFrorm9HTML["f3-subcat4"].value;
  const childCat4 = fFrorm9HTML["f3-childcat4"].value;
  const t1 = fForm9HTML["f9-t1"].value;
  const t2 = fForm9HTML["f9-t2"].value;
  const t3 = fForm9HTML["f9-t3"].value;
  const t4 = fForm9HTML["f9-t4"].value;

  if (f9File1) {
    f1name = `${Math.random()}__${f9File1.name}`;
    await storageService.ref(`sections/fixed9/${f1name}`).put(f9File1);
    img1Url = await extractImgUrl(`sections/fixed9/${f1name}`);
  }
  if (f9File2) {
    f2name = `${Math.random()}__${f9File2.name}`;
    await storageService.ref(`sections/fixed9/${f2name}`).put(f9File2);
    img2Url = await extractImgUrl(`sections/fixed9/${f2name}`);
  }
  if (f9File3) {
    f3name = `${Math.random()}__${f9File3.name}`;
    await storageService.ref(`sections/fixed9/${f3name}`).put(f9File3);
    img3Url = await extractImgUrl(`sections/fixed9/${f3name}`);
  }
  if (f9File4) {
    f4name = `${Math.random()}__${f9File4.name}`;
    await storageService.ref(`sections/fixed9/${f4name}`).put(f9File4);
    img4Url = await extractImgUrl(`sections/fixed9/${f4name}`);
  }

  docRef.get().then(async (snapshot) => {
    let docData = snapshot.data();
    docData.title = title;
    docData.card1 = {
      cat: cat1,
      subCat: subCat1,
      childCat: childCat1,
      tag: t1,
      img: f1name,
      imgUrl: img1Url,
    };
    docData.card2 = {
      cat: cat2,
      subCat: subCat2,
      childCat: childCat2,
      tag: t2,
      img: f2name,
      imgUrl: img2Url,
    };
    docData.card3 = {
      cat: cat3,
      subCat: subCat3,
      childCat: childCat3,
      tag: t3,
      img: f3name,
      imgUrl: img3Url,
    };
    docData.card4 = {
      cat: cat4,
      subCat: subCat4,
      childCat: childCat4,
      tag: t4,
      img: f4name,
      imgUrl: img4Url,
    };
    // console.log(docData);
    await docRef.update(docData);
    displayForm9();
    // console.log("updated");
  });
  // console.log("done");
};

fForm9HTML.addEventListener("submit", form9);

const f9FileChange1 = (e) => {
  f9File1 = e.target.files[0];
};
const f9FileChange2 = (e) => {
  f9File2 = e.target.files[0];
};
const f9FileChange3 = (e) => {
  f9File3 = e.target.files[0];
};
const f9FileChange4 = (e) => {
  f9File4 = e.target.files[0];
};

f9File1HTML.addEventListener("change", f9FileChange1);
f9File2HTML.addEventListener("change", f9FileChange2);
f9File3HTML.addEventListener("change", f9FileChange3);
f9File4HTML.addEventListener("change", f9FileChange4);

const displayForm9 = () => {
db.collection("sections")
  .doc("fixed9")
  .onSnapshot((doc) => {
    let docData = doc.data();
    // console.log(docData);
    fForm9HTML["f9-title"].value = docData.title;
    if (docData.card1) {
      fForm9HTML.querySelector("#f9-img1").src = docData.card1.imgUrl;
      fForm9HTML["f9-cat1"].value = docData.card1.cat;
      fForm9HTML["f9-subcat1"].value = docData.card1.subCat;
      fForm9HTML["f9-childcat1"].value = docData.card1.childCat;
      fForm9HTML["f9-t1"].value = docData.card1.tag;
    }

    if (docData.card2) {
      fForm9HTML.querySelector("#f9-img2").src = docData.card2.imgUrl;
      fForm9HTML["f9-cat2"].value = docData.card2.cat;
      fForm9HTML["f9-subcat2"].value = docData.card2.subCat;
      fForm9HTML["f9-childcat2"].value = docData.card2.childCat;
      fForm9HTML["f9-t2"].value = docData.card2.tag;
    }

    if (docData.card3) {
      fForm9HTML.querySelector("#f9-img3").src = docData.card3.imgUrl;
      fForm9HTML["f9-cat3"].value = docData.card3.cat;
      fForm9HTML["f9-subcat3"].value = docData.card3.subCat;
      fForm9HTML["f9-childcat3"].value = docData.card3.childCat;
      fForm9HTML["f9-t3"].value = docData.card3.tag;
    }

    if (docData.card4) {
      fForm9HTML.querySelector("#f9-img4").src = docData.card4.imgUrl;
      fForm9HTML["f9-cat4"].value = docData.card4.cat;
      fForm9HTML["f9-subcat4"].value = docData.card4.subCat;
      fForm9HTML["f9-childcat4"].value = docData.card4.childCat;
      fForm9HTML["f9-t4"].value = docData.card4.tag;
    }
  });
}
//////////////////////////////////////////////////////////////////////////////////////////////////////////////

const fForm4Imgs1HTML = document.querySelector("#fForm4Imgs1");

const f4img1File0HTML = document.querySelector("#f4img1-file0");
const f4img1File1HTML = document.querySelector("#f4img1-file1");
const f4img1File2HTML = document.querySelector("#f4img1-file2");
const f4img1File3HTML = document.querySelector("#f4img1-file3");
const f4img1File4HTML = document.querySelector("#f4img1-file4");

let f4Imgs1file0, f4Imgs1file1, f4Imgs1file2, f4Imgs1file3, f4Imgs1file4;
const fForm4Img1 = async (e) => {
  e.preventDefault();

  let dbImg4Ref = db.collection("sections").doc("img41");

  const title = fForm4Imgs1HTML["f4img1-title"].value;
  const img4cat0 = fForm4Imgs1HTML["f4img1-cat0"].value;
  const img4cat1 = fForm4Imgs1HTML["f4img1-cat1"].value;
  const img4cat2 = fForm4Imgs1HTML["f4img1-cat2"].value;
  const img4cat3 = fForm4Imgs1HTML["f4img1-cat3"].value;
  const img4cat4 = fForm4Imgs1HTML["f4img1-cat4"].value;
  const img4tag0 = fForm4Imgs1HTML["f4img1-t0"].value;
  const img4tag1 = fForm4Imgs1HTML["f4img1-t1"].value;
  const img4tag2 = fForm4Imgs1HTML["f4img1-t2"].value;
  const img4tag3 = fForm4Imgs1HTML["f4img1-t3"].value;
  const img4tag4 = fForm4Imgs1HTML["f4img1-t4"].value;
  let img0, img1, img2, img3, img4, imgUrl0, imgUrl1, imgUrl2, imgUrl3, imgUrl4;

  if (f4Imgs1file0) {
    img0 = `${Math.random()}__${f4Imgs1file0.name}`;
    await storageService.ref(`sections/img41/${img0}`).put(f4Imgs1file0);
    await storageService
      .ref(`sections/img41/${img0}`)
      .getDownloadURL()
      .then((url) => {
        imgUrl0 = url;
      })
      .catch((error) => {
        console.log(error);
      });
  }
  if (f4Imgs1file1) {
    img1 = `${Math.random()}__${f4Imgs1file1.name}`;
    await storageService.ref(`sections/img41/${img1}`).put(f4Imgs1file1);
    await storageService
      .ref(`sections/img41/${img1}`)
      .getDownloadURL()
      .then((url) => {
        imgUrl1 = url;
      })
      .catch((error) => {
        console.log(error);
      });
  }
  if (f4Imgs1file2) {
    img2 = `${Math.random()}__${f4Imgs1file2.name}`;
    await storageService.ref(`sections/img41/${img2}`).put(f4Imgs1file2);
    await storageService
      .ref(`sections/img41/${img2}`)
      .getDownloadURL()
      .then((url) => {
        imgUrl2 = url;
      })
      .catch((error) => {
        console.log(error);
      });
  }
  if (f4Imgs1file3) {
    img3 = `${Math.random()}__${f4Imgs1file3.name}`;
    // console.log(f4Imgs1file3);
    await storageService.ref(`sections/img41/${img3}`).put(f4Imgs1file3);
    await storageService
      .ref(`sections/img41/${img3}`)
      .getDownloadURL()
      .then((url) => {
        imgUrl3 = url;
      })
      .catch((error) => {
        console.log(error);
      });
  }
  if (f4Imgs1file4) {
    img4 = `${Math.random()}__${f4Imgs1file4.name}`;
    await storageService.ref(`sections/img41/${img4}`).put(f4Imgs1file4);
    await storageService
      .ref(`sections/img41/${img4}`)
      .getDownloadURL()
      .then((url) => {
        imgUrl4 = url;
      })
      .catch((error) => {
        console.log(error);
      });
  }

  dbImg4Ref.get().then((img4Doc) => {
    let img4Data = img4Doc.data();

    img4Data.title = title;
    if (img0) {
      img4Data.mainImg = {
        img: img0,
        imgUrl: imgUrl0,
        cat: img4cat0,
        tag: img4tag0,
        active: true,
      };
    }
    if (img1) {
      img4Data.subImgs[0] = {
        img: img1,
        imgUrl: imgUrl1,
        cat: img4cat1,
        tag: img4tag1,
        active: true,
      };
    }
    if (img2) {
      img4Data.subImgs[1] = {
        img: img2,
        imgUrl: imgUrl2,
        cat: img4cat2,
        tag: img4tag2,
        active: true,
      };
    }
    if (img3) {
      img4Data.subImgs[2] = {
        img: img3,
        imgUrl: imgUrl3,
        cat: img4cat3,
        tag: img4tag3,
        active: true,
      };
    }
    if (img4) {
      img4Data.subImgs[3] = {
        img: img4,
        imgUrl: imgUrl4,
        cat: img4cat4,
        tag: img4tag4,
        active: true,
      };
    }
    // console.log(img4Data);
    dbImg4Ref.update(img4Data);
    fForm4Imgs1HTML.reset();
  });
};

fForm4Imgs1HTML.addEventListener("submit", fForm4Img1);

const f4Img1uploadFile0 = (e) => {
  f4Imgs1file0 = e.target.files[0];
};

const f4Img1uploadFile1 = (e) => {
  f4Imgs1file1 = e.target.files[0];
};

const f4Img1uploadFile2 = (e) => {
  f4Imgs1file2 = e.target.files[0];
};

const f4Img1uploadFile3 = (e) => {
  f4Imgs1file3 = e.target.files[0];
};

const f4Img1uploadFile4 = (e) => {
  f4Imgs1file4 = e.target.files[0];
};

f4img1File0HTML.addEventListener("change", f4Img1uploadFile0);
f4img1File1HTML.addEventListener("change", f4Img1uploadFile1);
f4img1File2HTML.addEventListener("change", f4Img1uploadFile2);
f4img1File3HTML.addEventListener("change", f4Img1uploadFile3);
f4img1File4HTML.addEventListener("change", f4Img1uploadFile4);

db.collection("sections")
  .doc("img41")
  .onSnapshot((img41Doc) => {
    let img41Data = img41Doc.data();
    // console.log(img41Data);
    fForm4Imgs1HTML["f4img1-title"].value = img41Data.title;
    if (img41Data.mainImg) {
      fForm4Imgs1HTML.querySelector("#f4img1-img0").src =
        img41Data.mainImg.imgUrl;
      fForm4Imgs1HTML["f4img1-cat0"].value = img41Data.mainImg.cat;
      fForm4Imgs1HTML["f4img1-t0"].value = img41Data.mainImg.tag;
    }
    if (img41Data.subImgs.length > 0) {
      if (img41Data.subImgs[0]) {
        fForm4Imgs1HTML.querySelector(`#f4img1-img1`).src =
          img41Data.subImgs[0].imgUrl;
        fForm4Imgs1HTML[`f4img1-cat1`].value = img41Data.subImgs[0].cat;
        fForm4Imgs1HTML[`f4img1-t1`].value = img41Data.subImgs[0].tag;
      }
      if (img41Data.subImgs[1]) {
        fForm4Imgs1HTML.querySelector(`#f4img1-img2`).src =
          img41Data.subImgs[1].imgUrl;
        fForm4Imgs1HTML[`f4img1-cat2`].value = img41Data.subImgs[1].cat;
        fForm4Imgs1HTML[`f4img1-t2`].value = img41Data.subImgs[1].tag;
      }
      if (img41Data.subImgs[2]) {
        fForm4Imgs1HTML.querySelector(`#f4img1-img3`).src =
          img41Data.subImgs[2].imgUrl;
        fForm4Imgs1HTML[`f4img1-cat3`].value = img41Data.subImgs[2].cat;
        fForm4Imgs1HTML[`f4img1-t3`].value = img41Data.subImgs[2].tag;
      }
      if (img41Data.subImgs[3]) {
        fForm4Imgs1HTML.querySelector(`#f4img1-img4`).src =
          img41Data.subImgs[3].imgUrl;
        fForm4Imgs1HTML[`f4img1-cat4`].value = img41Data.subImgs[3].cat;
        fForm4Imgs1HTML[`f4img1-t4`].value = img41Data.subImgs[3].tag;
      }
    }
  });

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

const fForm4Imgs2HTML = document.querySelector("#fForm4Imgs2");

const f4img2File0HTML = document.querySelector("#f4img2-file0");
const f4img2File1HTML = document.querySelector("#f4img2-file1");
const f4img2File2HTML = document.querySelector("#f4img2-file2");
const f4img2File3HTML = document.querySelector("#f4img2-file3");
const f4img2File4HTML = document.querySelector("#f4img2-file4");

let f4Imgs2file0, f4Imgs2file1, f4Imgs2file2, f4Imgs2file3, f4Imgs2file4;
const fForm4Img2 = async (e) => {
  e.preventDefault();

  let dbImg4Ref = db.collection("sections").doc("img42");

  const title = fForm4Imgs2HTML["f4img2-title"].value;
  const img4cat0 = fForm4Imgs2HTML["f4img2-cat0"].value;
  const img4cat1 = fForm4Imgs2HTML["f4img2-cat1"].value;
  const img4cat2 = fForm4Imgs2HTML["f4img2-cat2"].value;
  const img4cat3 = fForm4Imgs2HTML["f4img2-cat3"].value;
  const img4cat4 = fForm4Imgs2HTML["f4img2-cat4"].value;
  const img4tag0 = fForm4Imgs2HTML["f4img2-t0"].value;
  const img4tag1 = fForm4Imgs2HTML["f4img2-t1"].value;
  const img4tag2 = fForm4Imgs2HTML["f4img2-t2"].value;
  const img4tag3 = fForm4Imgs2HTML["f4img2-t3"].value;
  const img4tag4 = fForm4Imgs2HTML["f4img2-t4"].value;
  let img0, img1, img2, img3, img4, imgUrl0, imgUrl1, imgUrl2, imgUrl3, imgUrl4;

  if (f4Imgs2file0) {
    img0 = `${Math.random()}__${f4Imgs2file0.name}`;
    await storageService.ref(`sections/img42/${img0}`).put(f4Imgs2file0);
    await storageService
      .ref(`sections/img42/${img0}`)
      .getDownloadURL()
      .then((url) => {
        imgUrl0 = url;
      })
      .catch((error) => {
        console.log(error);
      });
  }
  if (f4Imgs2file1) {
    img1 = `${Math.random()}__${f4Imgs2file1.name}`;
    await storageService.ref(`sections/img42/${img1}`).put(f4Imgs2file1);
    await storageService
      .ref(`sections/img42/${img1}`)
      .getDownloadURL()
      .then((url) => {
        imgUrl1 = url;
      })
      .catch((error) => {
        console.log(error);
      });
  }
  if (f4Imgs2file2) {
    img2 = `${Math.random()}__${f4Imgs2file2.name}`;
    await storageService.ref(`sections/img42/${img2}`).put(f4Imgs2file2);
    await storageService
      .ref(`sections/img42/${img2}`)
      .getDownloadURL()
      .then((url) => {
        imgUrl2 = url;
      })
      .catch((error) => {
        console.log(error);
      });
  }
  if (f4Imgs2file3) {
    img3 = `${Math.random()}__${f4Imgs2file3.name}`;
    // console.log(f4Imgs1file3);
    await storageService.ref(`sections/img42/${img3}`).put(f4Imgs2file3);
    await storageService
      .ref(`sections/img42/${img3}`)
      .getDownloadURL()
      .then((url) => {
        imgUrl3 = url;
      })
      .catch((error) => {
        console.log(error);
      });
  }
  if (f4Imgs2file4) {
    img4 = `${Math.random()}__${f4Imgs2file4.name}`;
    await storageService.ref(`sections/img42/${img4}`).put(f4Imgs2file4);
    await storageService
      .ref(`sections/img42/${img4}`)
      .getDownloadURL()
      .then((url) => {
        imgUrl4 = url;
      })
      .catch((error) => {
        console.log(error);
      });
  }

  dbImg4Ref.get().then((img4Doc) => {
    let img4Data = img4Doc.data();

    img4Data.title = title;
    if (img0) {
      img4Data.mainImg = {
        img: img0,
        imgUrl: imgUrl0,
        cat: img4cat0,
        tag: img4tag0,
        active: true,
      };
    }
    if (img1) {
      img4Data.subImgs[0] = {
        img: img1,
        imgUrl: imgUrl1,
        cat: img4cat1,
        tag: img4tag1,
        active: true,
      };
    }
    if (img2) {
      img4Data.subImgs[1] = {
        img: img2,
        imgUrl: imgUrl2,
        cat: img4cat2,
        tag: img4tag2,
        active: true,
      };
    }
    if (img3) {
      img4Data.subImgs[2] = {
        img: img3,
        imgUrl: imgUrl3,
        cat: img4cat3,
        tag: img4tag3,
        active: true,
      };
    }
    if (img4) {
      img4Data.subImgs[3] = {
        img: img4,
        imgUrl: imgUrl4,
        cat: img4cat4,
        tag: img4tag4,
        active: true,
      };
    }
    // console.log(img4Data);
    dbImg4Ref.update(img4Data);
    fForm4Imgs2HTML.reset();
  });
};

fForm4Imgs2HTML.addEventListener("submit", fForm4Img2);

const f4Img2uploadFile0 = (e) => {
  f4Imgs2file0 = e.target.files[0];
};

const f4Img2uploadFile1 = (e) => {
  f4Imgs2file1 = e.target.files[0];
};

const f4Img2uploadFile2 = (e) => {
  f4Imgs2file2 = e.target.files[0];
};

const f4Img2uploadFile3 = (e) => {
  f4Imgs2file3 = e.target.files[0];
};

const f4Img2uploadFile4 = (e) => {
  f4Imgs2file4 = e.target.files[0];
};

f4img2File0HTML.addEventListener("change", f4Img2uploadFile0);
f4img2File1HTML.addEventListener("change", f4Img2uploadFile1);
f4img2File2HTML.addEventListener("change", f4Img2uploadFile2);
f4img2File3HTML.addEventListener("change", f4Img2uploadFile3);
f4img2File4HTML.addEventListener("change", f4Img2uploadFile4);

db.collection("sections")
  .doc("img42")
  .onSnapshot((img42Doc) => {
    let img42Data = img42Doc.data();
    // console.log(img42Data);
    fForm4Imgs2HTML["f4img2-title"].value = img42Data.title;
    if (img42Data.mainImg) {
      fForm4Imgs2HTML.querySelector("#f4img2-img0").src =
        img42Data.mainImg.imgUrl;
      fForm4Imgs2HTML["f4img2-cat0"].value = img42Data.mainImg.cat;
      fForm4Imgs2HTML["f4img2-t0"].value = img42Data.mainImg.tag;
    }
    if (img42Data.subImgs.length > 0) {
      if (img42Data.subImgs[0]) {
        fForm4Imgs2HTML.querySelector(`#f4img2-img1`).src =
          img42Data.subImgs[0].imgUrl;
        fForm4Imgs2HTML[`f4img2-cat1`].value = img42Data.subImgs[0].cat;
        fForm4Imgs2HTML[`f4img2-t1`].value = img42Data.subImgs[0].tag;
      }
      if (img42Data.subImgs[1]) {
        fForm4Imgs2HTML.querySelector(`#f4img2-img2`).src =
          img42Data.subImgs[1].imgUrl;
        fForm4Imgs2HTML[`f4img2-cat2`].value = img42Data.subImgs[1].cat;
        fForm4Imgs2HTML[`f4img2-t2`].value = img42Data.subImgs[1].tag;
      }
      if (img42Data.subImgs[2]) {
        fForm4Imgs2HTML.querySelector(`#f4img2-img3`).src =
          img42Data.subImgs[2].imgUrl;
        fForm4Imgs2HTML[`f4img2-cat3`].value = img42Data.subImgs[2].cat;
        fForm4Imgs2HTML[`f4img2-t3`].value = img42Data.subImgs[2].tag;
      }
      if (img42Data.subImgs[3]) {
        fForm4Imgs2HTML.querySelector(`#f4img2-img4`).src =
          img42Data.subImgs[3].imgUrl;
        fForm4Imgs2HTML[`f4img2-cat4`].value = img42Data.subImgs[3].cat;
        fForm4Imgs2HTML[`f4img2-t4`].value = img42Data.subImgs[3].tag;
      }
    }
  });

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////

const fForm3Imgs1HTML = document.querySelector("#fForm3Imgs1");

const f3img1File1HTML = document.querySelector("#f3img1-file1");
const f3img1File2HTML = document.querySelector("#f3img1-file2");
const f3img1File3HTML = document.querySelector("#f3img1-file3");

let f3Imgs1file1, f3Imgs1file2, f3Imgs1file3;
const fForm3Img1 = async (e) => {
  e.preventDefault();

  let dbImg4Ref = db.collection("sections").doc("img31");

  const title = fForm3Imgs1HTML["f3img1-title"].value;

  const img4cat1 = fForm3Imgs1HTML["f3img1-cat1"].value;
  const img4cat2 = fForm3Imgs1HTML["f3img1-cat2"].value;
  const img4cat3 = fForm3Imgs1HTML["f3img1-cat3"].value;
  const img4tag1 = fForm3Imgs1HTML["f3img1-t1"].value;
  const img4tag2 = fForm3Imgs1HTML["f3img1-t2"].value;
  const img4tag3 = fForm3Imgs1HTML["f3img1-t3"].value;
  let img1, img2, img3, imgUrl1, imgUrl2, imgUrl3;

  if (f3Imgs1file1) {
    img1 = `${Math.random()}__${f3Imgs1file1.name}`;
    await storageService.ref(`sections/img31/${img1}`).put(f3Imgs1file1);
    await storageService
      .ref(`sections/img31/${img1}`)
      .getDownloadURL()
      .then((url) => {
        imgUrl1 = url;
      })
      .catch((error) => {
        console.log(error);
      });
  }
  if (f3Imgs1file2) {
    img2 = `${Math.random()}__${f3Imgs1file2.name}`;
    await storageService.ref(`sections/img31/${img2}`).put(f3Imgs1file2);
    await storageService
      .ref(`sections/img31/${img2}`)
      .getDownloadURL()
      .then((url) => {
        imgUrl2 = url;
      })
      .catch((error) => {
        console.log(error);
      });
  }
  if (f3Imgs1file3) {
    img3 = `${Math.random()}__${f3Imgs1file3.name}`;
    // console.log(f4Imgs1file3);
    await storageService.ref(`sections/img31/${img3}`).put(f3Imgs1file3);
    await storageService
      .ref(`sections/img31/${img3}`)
      .getDownloadURL()
      .then((url) => {
        imgUrl3 = url;
      })
      .catch((error) => {
        console.log(error);
      });
  }

  dbImg4Ref.get().then((img3Doc) => {
    let img3Data = img3Doc.data();
    img3Data.title = title;
    if (img1) {
      img3Data.subImgs[0] = {
        img: img1,
        imgUrl: imgUrl1,
        cat: img4cat1,
        tag: img4tag1,
        active: true,
      };
    }
    if (img2) {
      img3Data.subImgs[1] = {
        img: img2,
        imgUrl: imgUrl2,
        cat: img4cat2,
        tag: img4tag2,
        active: true,
      };
    }
    if (img3) {
      img3Data.subImgs[2] = {
        img: img3,
        imgUrl: imgUrl3,
        cat: img4cat3,
        tag: img4tag3,
        active: true,
      };
    }
    // console.log(img3Data);
    dbImg4Ref.update(img3Data);
    fForm3Imgs1HTML.reset();
  });
};

fForm3Imgs1HTML.addEventListener("submit", fForm3Img1);

const f3Img1uploadFile1 = (e) => {
  f3Imgs1file1 = e.target.files[0];
};

const f3Img1uploadFile2 = (e) => {
  f3Imgs1file2 = e.target.files[0];
};

const f3Img1uploadFile3 = (e) => {
  f3Imgs1file3 = e.target.files[0];
};

f3img1File1HTML.addEventListener("change", f3Img1uploadFile1);
f3img1File2HTML.addEventListener("change", f3Img1uploadFile2);
f3img1File3HTML.addEventListener("change", f3Img1uploadFile3);

db.collection("sections")
  .doc("img31")
  .onSnapshot((img31Doc) => {
    let img31Data = img31Doc.data();
    // console.log(img31Data);
    fForm3Imgs1HTML["f3img1-title"].value = img31Data.title;
    if (img31Data.subImgs.length > 0) {
      if (img31Data.subImgs[0]) {
        fForm3Imgs1HTML.querySelector(`#f3img1-img1`).src =
          img31Data.subImgs[0].imgUrl;
        fForm3Imgs1HTML[`f3img1-cat1`].value = img31Data.subImgs[0].cat;
        fForm3Imgs1HTML[`f3img1-t1`].value = img31Data.subImgs[0].tag;
      }
      if (img31Data.subImgs[1]) {
        fForm3Imgs1HTML.querySelector(`#f3img1-img2`).src =
          img31Data.subImgs[1].imgUrl;
        fForm3Imgs1HTML[`f3img1-cat2`].value = img31Data.subImgs[1].cat;
        fForm3Imgs1HTML[`f3img1-t2`].value = img31Data.subImgs[1].tag;
      }
      if (img31Data.subImgs[2]) {
        fForm3Imgs1HTML.querySelector(`#f3img1-img3`).src =
          img31Data.subImgs[2].imgUrl;
        fForm3Imgs1HTML[`f3img1-cat3`].value = img31Data.subImgs[2].cat;
        fForm3Imgs1HTML[`f3img1-t3`].value = img31Data.subImgs[2].tag;
      }
    }
  });

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
