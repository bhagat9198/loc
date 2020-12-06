console.log("AddSection1.js");

const db = firebase.firestore();
const firebaseStorage = firebase.storage();

const addSectionFormHTML = document.querySelector("#add-section");
const sectionTypeHTML = addSectionFormHTML.querySelector("#sectiontype");
const catHTML = addSectionFormHTML.querySelector("#cat");
const tbodyHTML = addSectionFormHTML.querySelector("tbody");

let allCategories = [];

const extractCategories = async () => {
  await db
    .collection("categories")
    .get()
    .then((snapshot) => {
      let options =
        '<option value="" selected disabled>Select Category</option>';
      let snapshotDocs = snapshot.docs;
      snapshotDocs.map((doc) => {
        let docData = doc.data();
        allCategories.push(doc.id);
        options += `
      <option value="${doc.id}" >${docData.name}</option>
      `;
      });
      catHTML.innerHTML = options;
    })
    .catch((error) => {
      console.log(error);
    });
  return allCategories;
};
extractCategories();

const extractImgURL = async (imgPath) => {
  let imgUrl;
  await firebaseStorage
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

const extractProducts = async (data) => {
  // console.log(data);
  if (allCategories.includes(data)) {
    let tRows = "";

    await db
      .collection(data)
      .get()
      .then(async (snapshot) => {
        let snapshotDocs = snapshot.docs;
        for (let doc of snapshotDocs) {
          let docData = doc.data();
          // console.log(docData);
          let imgPath = "";
          // if (docData.mainImg) {
          //   imgPath = `${data}/${doc.id}/${docData.mainImg}`;
          //   imgPath = await extractImgURL(imgPath);
          // }
          // console.log(imgPath);
          tRows += `
          <tr>
            <td>
              <img
                src="${docData.mainImgUrl}" />
            </td>
            <td>${docData.name}</td>
            <td>${docData.sno}</td>
            <td> <input type="checkbox" name="products-list" id="${doc.id}" value="${doc.id}__${docData.wholeCategory.split('__')[0]}" /></td>
          </tr>
          `;
        }
      });
    tbodyHTML.innerHTML = tRows;
  }
};

addSectionFormHTML["section-category"].addEventListener("change", (e) => {
  let selectedCat;
  selectedCat = e.target.value;
  // console.log(selectedCat);
  extractProducts(selectedCat);
});

let img1, img2, img3, img4, imgBanner, animationBanner;
addSectionFormHTML
  .querySelector("#product-img-1")
  .addEventListener("change", (e) => {
    // console.log(e.target.files);
    // console.log(e.target.files[0]);
    img1 = e.target.files[0];
  });
addSectionFormHTML
  .querySelector("#product-img-2")
  .addEventListener("change", (e) => {
    // console.log(e.target.files[0]);
    img2 = e.target.files[0];
  });
addSectionFormHTML
  .querySelector("#product-img-3")
  .addEventListener("change", (e) => {
    img3 = e.target.files[0];
  });
addSectionFormHTML
  .querySelector("#product-img-4")
  .addEventListener("change", (e) => {
    img4 = e.target.files[0];
  });
addSectionFormHTML
  .querySelector("#img-banner")
  .addEventListener("change", (e) => {
    imgBanner = e.target.files[0];
    // console.log(imgBanner);
  });
addSectionFormHTML
  .querySelector("#animation-banner")
  .addEventListener("change", (e) => {
    animationBanner = e.target.files[0];
    // console.log(animationBanner);
  });

const addSection = (e) => {
  e.preventDefault();
  const sectionType = addSectionFormHTML["section-type"].value;
  const sectionName = addSectionFormHTML["section-name"].value;
  const sectioncategory = addSectionFormHTML["section-category"].value;
  const colorTopLeft = addSectionFormHTML["color-top-left"].value;
  const colorBottomRight = addSectionFormHTML["color-bottom-right"].value;

  let productsSelected = [];

  if (sectionType === "4") {
    // console.log(4);
    productsSelected = [];
    let t1 = addSectionFormHTML["product-tag-1"].value;
    let t2 = addSectionFormHTML["product-tag-2"].value;
    let t3 = addSectionFormHTML["product-tag-3"].value;
    let t4 = addSectionFormHTML["product-tag-4"].value;

    if (img1 && t1) {
      productsSelected.push({
        tag: t1,
        img: `${Math.random()}__${img1.name}`,
        imgNo: 1,
      });
    }
    if (img2 && t2) {
      productsSelected.push({
        tag: t2,
        img: `${Math.random()}__${img2.name}`,
        imgNo: 2,
      });
    }
    if (img3 && t3) {
      productsSelected.push({
        tag: t3,
        img: `${Math.random()}__${img3.name}`,
        imgNo: 3,
      });
    }
    if (img4 && t4) {
      productsSelected.push({
        tag: t4,
        img: `${Math.random()}__${img1.name}`,
        imgNo: 4,
      });
    }
    // console.log(productsSelected);
  } else if (sectionType === "6") {
    // console.log(6);
    productsSelected = [];
    addSectionFormHTML
      .querySelectorAll("input[name='products-list']:checked")
      .forEach((prod) => {
        // console.log(prod);
        // console.log(prod.value);
        productsSelected.push({
          id: prod.value.substring(0, 20),
          category: prod.value.substring(22),
        });
      });
    if (productsSelected.length > 6) {
      productsSelected.length = 6;
    }
  } else if (sectionType === "slider") {
    // console.log("slider");
    productsSelected = [];
    addSectionFormHTML
      .querySelectorAll("input[name='products-list']:checked")
      .forEach((prod) => {
        // console.log(prod.value);
        productsSelected.push({
          id: prod.value.substring(0, 20),
          category: prod.value.substring(22),
        });
      });
  } else if (sectionType === "img") {
    // console.log("img");
    productsSelected = "";
    productsSelected = {
      img: imgBanner.name,
    };
  } else if (sectionType === "animation") {
    // console.log("animation");
    productsSelected = "";
    productsSelected = {
      animation: animationBanner.name,
    };
  } else {
    // console.log("invalid");
  }

  let wholeSectionData = {
    title: sectionName || "",
    type: sectionType || "",
    category: sectioncategory || "",
    colorTL: colorTopLeft || "",
    colorBR: colorBottomRight || "",
    card: productsSelected || [],
    activated: true
  };
  // console.log(wholeSectionData);

  async function addSectionFun(data) {
    // console.log(data);
    let dataId;

    if (wholeSectionData.type === "4") {
      await db
        .collection("sections")
        .doc("4cards")
        .collection("4cards")
        .add(data)
        .then((dataSaved) => {
          dataId = dataSaved.id;
        })
        .catch((error) => {
          console.log(error);
        });
      return { data: data, dataId: dataId };
    } else if (wholeSectionData.type === "6") {
      await db
        .collection("sections")
        .doc("6cards")
        .collection("6cards")
        .add(data)
        .then((dataSaved) => {
          dataId = dataSaved.id;
        })
        .catch((error) => {
          console.log(error);
        });
      return { data: data, dataId: dataId };
    } else if (wholeSectionData.type === "img") {
      await db
        .collection("sections")
        .doc("img")
        .collection("img")
        .add(data)
        .then((dataSaved) => {
          dataId = dataSaved.id;
        })
        .catch((error) => {
          console.log(error);
        });
      return { data: data, dataId: dataId };
    } else if (wholeSectionData.type === "slider") {
      await db
        .collection("sections")
        .doc("slider")
        .collection("slider")
        .add(data)
        .then((dataSaved) => {
          dataId = dataSaved.id;
        })
        .catch((error) => {
          console.log(error);
        });
      return { data: data, dataId: dataId };
    } else if (wholeSectionData.type === "animation") {
      await db
        .collection("sections")
        .doc("animation")
        .collection("animation")
        .add(data)
        .then((dataSaved) => {
          dataId = dataSaved.id;
        })
        .catch((error) => {
          console.log(error);
        });
      return { data: data, dataId: dataId };
    } else {
      // console.log("invalid");
    }
  }

  addSectionFun(wholeSectionData)
    .then(async (response) => {
      // console.log("done");

      if (response.data.type === "4") {
        let imgUrl;
        let counter = 0;
        for (let img of response.data.card) {
          if (img.imgNo === 1) {
            await firebaseStorage
              .ref(`sections/4cards/4cards/${response.dataId}/${img.img}`)
              .put(img1);
          } else if (img.imgNo === 2) {
            await firebaseStorage
              .ref(`sections/4cards/4cards/${response.dataId}/${img.img}`)
              .put(img2);
          } else if (img.imgNo === 3) {
            await firebaseStorage
              .ref(`sections/4cards/4cards/${response.dataId}/${img.img}`)
              .put(img3);
          } else if (img.imgNo === 4) {
            await firebaseStorage
              .ref(`sections/4cards/4cards/${response.dataId}/${img.img}`)
              .put(img4);
          } else {
            console.log("invalid");
          }

          imgUrl = await extractImgURL(
            `sections/4cards/4cards/${response.dataId}/${img.img}`
          );

          let docRef = await db.collection("sections").doc('4cards').collection('4cards').doc(response.dataId);
          await docRef.get().then(async (snapshot) => {
            let docData = snapshot.data();
            docData.card[counter].imgUrl = imgUrl;
            // console.log(docData);

            await docRef.update(docData);
          });
          counter++;
        }
      } else if (response.data.type === "img") {
        await firebaseStorage
          .ref(`sections/img/img/${response.dataId}/${response.data.card.img}`)
          .put(imgBanner);
        let imgUrl = await extractImgURL(
          `sections/img/img/${response.dataId}/${response.data.card.img}`
        );
        
        let docRef = await db.collection("sections").doc('img').collection('img').doc(response.dataId);
        await docRef.get().then(async (snapshot) => {
          let docData = snapshot.data();
          docData.card.imgUrl = imgUrl;
          // console.log(docData);

          await docRef.update(docData);
        });
      } else if (response.data.type === "animation") {
        // console.log(response.data.card.animation);
        await firebaseStorage
          .ref(`sections/animation/animation/${response.dataId}/${response.data.card.animation}`)
          .put(animationBanner);
        // console.log(animationBanner);
        let animationUrl = await extractImgURL(
          `sections/animation/animation/${response.dataId}/${response.data.card.animation}`
        );
        // console.log(animationUrl);
        let docRef = await db.collection("sections").doc('animation').collection('animation').doc(response.dataId);
        await docRef.get().then(async (snapshot) => {
          let docData = snapshot.data();
          docData.card.animationUrl = animationUrl;
          // console.log(docData);

          await docRef.update(docData);
        });
      }
      // console.log("done");
      addSectionFormHTML.reset();
    })
    .catch((error) => {
      console.log(error);
    });
};

addSectionFormHTML.addEventListener("submit", addSection);

// const sectionType = e => {
//   console.log(e.target.value);
// }

// sectionTypeHTML.addEventListener('change', sectionType);
