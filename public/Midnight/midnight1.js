console.log("fixedSection1.js");

const db = firebase.firestore();
const storageService = firebase.storage();
const categoryTypeHTML = document.querySelectorAll(".categoryType");
const allCategories = [];

db.collection("categories").onSnapshot((snapshots) => {
  let snapshotsDocs = snapshots.docs;
  snapshotsDocs.map((doc) => {
    let docData = doc.data();
    allCategories.push({ docId: doc.id, data: docData });
    // allCategories.push(`${doc.id}__${docData.name}`);
  });

  categoryTypeHTML.forEach((el) => {
    let options =
      '<option value="" selected disabled>Select From the List</option>';
    allCategories.map((cat) => {
      let c = `${cat.docId}__${cat.data.name}`;
      options += `
      <option  value="${c}">${c.split("__")[1]}</option>
    `;
    });
    el.innerHTML = options;
  });

  displayForm1();
  displayForm2();
  displayForm3();
  displayForm4();
  displayForm5();
  displayForm6();
  displayForm7();
  displayForm8();
  displayForm9();
  displayForm10();
});

const fForm1HTML = document.querySelector("#fForm1");
const form1 = async (e) => {
  e.preventDefault();
  let docRef = await db.collection("midnight").doc("fixed1");

  const f1Title = fForm1HTML["f1-title"].value;
  const f1Id1 = fForm1HTML["f1-id1"].value;
  const f1Id2 = fForm1HTML["f1-id2"].value;
  const f1Id3 = fForm1HTML["f1-id3"].value;
  const f1Id4 = fForm1HTML["f1-id4"].value;
  const f1Id5 = fForm1HTML["f1-id5"].value;
  const f1Id6 = fForm1HTML["f1-id6"].value;

  const f1Cat1 = fForm1HTML["f1-cat1"].value;
  const f1Cat2 = fForm1HTML["f1-cat2"].value;
  const f1Cat3 = fForm1HTML["f1-cat3"].value;
  const f1Cat4 = fForm1HTML["f1-cat4"].value;
  const f1Cat5 = fForm1HTML["f1-cat5"].value;
  const f1Cat6 = fForm1HTML["f1-cat6"].value;

  let userInputs = [
    { sno: f1Id1, cat: f1Cat1 },
    { sno: f1Id2, cat: f1Cat2 },
    { sno: f1Id3, cat: f1Cat3 },
    { sno: f1Id4, cat: f1Cat4 },
    { sno: f1Id5, cat: f1Cat5 },
    { sno: f1Id6, cat: f1Cat6 },
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
            ui.bannerType = docData.bannerType || "";
            ui.bannerTypeColorEnd = docData.bannerTypeColorEnd || "";
            ui.bannerTypeColorStart = docData.bannerTypeColorStart || "";
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
    docData.title = f1Title;
    fForm1HTML.reset();
    await docRef.update(docData);
    // console.log('updated');
  });

  // console.log('done');
};

fForm1HTML.addEventListener("submit", form1);

const displayForm1 = () => {
  db.collection("midnight")
    .doc("fixed1")
    .onSnapshot((doc) => {
      let docData = doc.data();
      // console.log(docData);
      fForm1HTML["f1-title"].value = docData.title || "Section Empty";
      if (docData.title) {
        fForm1HTML["f1-cat1"].value = docData.prodIds[0].cat;
        fForm1HTML["f1-cat2"].value = docData.prodIds[1].cat;
        fForm1HTML["f1-cat3"].value = docData.prodIds[2].cat;
        fForm1HTML["f1-cat4"].value = docData.prodIds[3].cat;
        fForm1HTML["f1-cat5"].value = docData.prodIds[4].cat;
        fForm1HTML["f1-cat6"].value = docData.prodIds[5].cat;
        fForm1HTML["f1-id1"].value = docData.prodIds[0].sno;
        fForm1HTML["f1-id2"].value = docData.prodIds[1].sno;
        fForm1HTML["f1-id3"].value = docData.prodIds[2].sno;
        fForm1HTML["f1-id4"].value = docData.prodIds[3].sno;
        fForm1HTML["f1-id5"].value = docData.prodIds[4].sno;
        fForm1HTML["f1-id6"].value = docData.prodIds[5].sno;
      }
    });
};

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

const fForm2HTML = document.querySelector("#fForm2");
const form2 = async (e) => {
  e.preventDefault();
  let docRef = await db.collection("midnight").doc("fixed2");

  const f2Title = fForm2HTML["f2-title"].value;
  const f2Id1 = fForm2HTML["f2-id1"].value;
  const f2Id2 = fForm2HTML["f2-id2"].value;
  const f2Id3 = fForm2HTML["f2-id3"].value;
  const f2Id4 = fForm2HTML["f2-id4"].value;
  const f2Id5 = fForm2HTML["f2-id5"].value;
  const f2Id6 = fForm2HTML["f2-id6"].value;
  const f2Cat1 = fForm2HTML["f2-cat1"].value;
  const f2Cat2 = fForm2HTML["f2-cat2"].value;
  const f2Cat3 = fForm2HTML["f2-cat3"].value;
  const f2Cat4 = fForm2HTML["f2-cat4"].value;
  const f2Cat5 = fForm2HTML["f2-cat5"].value;
  const f2Cat6 = fForm2HTML["f2-cat6"].value;

  let userInputs = [
    { sno: f2Id1, cat: f2Cat1 },
    { sno: f2Id2, cat: f2Cat2 },
    { sno: f2Id3, cat: f2Cat3 },
    { sno: f2Id4, cat: f2Cat4 },
    { sno: f2Id5, cat: f2Cat5 },
    { sno: f2Id6, cat: f2Cat6 },
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
            ui.bannerType = docData.bannerType || "";
            ui.bannerTypeColorEnd = docData.bannerTypeColorEnd || "";
            ui.bannerTypeColorStart = docData.bannerTypeColorStart || "";
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
    docData.title = f2Title;
    fForm2HTML.reset();
    await docRef.update(docData);
    // console.log('updated');
  });

  // console.log('done');
};

fForm2HTML.addEventListener("submit", form2);

const displayForm2 = () => {
  db.collection("midnight")
    .doc("fixed2")
    .onSnapshot((doc) => {
      let docData = doc.data();
      // console.log(docData);
      fForm2HTML["f2-title"].value = docData.title || "Section Empty";
      if (docData.title) {
        fForm2HTML["f2-cat1"].value = docData.prodIds[0].cat;
        fForm2HTML["f2-cat2"].value = docData.prodIds[1].cat;
        fForm2HTML["f2-cat3"].value = docData.prodIds[2].cat;
        fForm2HTML["f2-cat4"].value = docData.prodIds[3].cat;
        fForm2HTML["f2-cat5"].value = docData.prodIds[4].cat;
        fForm2HTML["f2-cat6"].value = docData.prodIds[5].cat;
        fForm2HTML["f2-id1"].value = docData.prodIds[0].sno;
        fForm2HTML["f2-id2"].value = docData.prodIds[1].sno;
        fForm2HTML["f2-id3"].value = docData.prodIds[2].sno;
        fForm2HTML["f2-id4"].value = docData.prodIds[3].sno;
        fForm2HTML["f2-id5"].value = docData.prodIds[4].sno;
        fForm2HTML["f2-id6"].value = docData.prodIds[5].sno;
      }
    });
};

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

const fForm3HTML = document.querySelector("#fForm3");
const form3 = async (e) => {
  e.preventDefault();
  let docRef = await db.collection("midnight").doc("fixed3");

  const f3Title = fForm3HTML["f3-title"].value;
  const f3Id1 = fForm3HTML["f3-id1"].value;
  const f3Id2 = fForm3HTML["f3-id2"].value;
  const f3Id3 = fForm3HTML["f3-id3"].value;
  const f3Id4 = fForm3HTML["f3-id4"].value;
  const f3Id5 = fForm3HTML["f3-id5"].value;
  const f3Id6 = fForm3HTML["f3-id6"].value;

  const f3Cat1 = fForm3HTML["f3-cat1"].value;
  const f3Cat2 = fForm3HTML["f3-cat2"].value;
  const f3Cat3 = fForm3HTML["f3-cat3"].value;
  const f3Cat4 = fForm3HTML["f3-cat4"].value;
  const f3Cat5 = fForm3HTML["f3-cat5"].value;
  const f3Cat6 = fForm3HTML["f3-cat6"].value;

  let userInputs = [
    { sno: f3Id1, cat: f3Cat1 },
    { sno: f3Id2, cat: f3Cat2 },
    { sno: f3Id3, cat: f3Cat3 },
    { sno: f3Id4, cat: f3Cat4 },
    { sno: f3Id5, cat: f3Cat5 },
    { sno: f3Id6, cat: f3Cat6 },
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
            ui.bannerType = docData.bannerType || "";
            ui.bannerTypeColorEnd = docData.bannerTypeColorEnd || "";
            ui.bannerTypeColorStart = docData.bannerTypeColorStart || "";
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
    docData.title = f3Title;
    fForm3HTML.reset();
    await docRef.update(docData);
    // console.log('updated');
  });

  // console.log('done');
};

fForm3HTML.addEventListener("submit", form3);

const displayForm3 = () => {
  db.collection("midnight")
    .doc("fixed3")
    .onSnapshot((doc) => {
      let docData = doc.data();
      // console.log(docData);
      fForm3HTML["f3-title"].value = docData.title || "Section Empty";
      if (docData.title) {
        fForm3HTML["f3-cat1"].value = docData.prodIds[0].cat;
        fForm3HTML["f3-cat2"].value = docData.prodIds[1].cat;
        fForm3HTML["f3-cat3"].value = docData.prodIds[2].cat;
        fForm3HTML["f3-cat4"].value = docData.prodIds[3].cat;
        fForm3HTML["f3-cat5"].value = docData.prodIds[4].cat;
        fForm3HTML["f3-cat6"].value = docData.prodIds[5].cat;
        fForm3HTML["f3-id1"].value = docData.prodIds[0].sno;
        fForm3HTML["f3-id2"].value = docData.prodIds[1].sno;
        fForm3HTML["f3-id3"].value = docData.prodIds[2].sno;
        fForm3HTML["f3-id4"].value = docData.prodIds[3].sno;
        fForm3HTML["f3-id5"].value = docData.prodIds[4].sno;
        fForm3HTML["f3-id6"].value = docData.prodIds[5].sno;
      }
    });
};

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

const fForm4HTML = document.querySelector("#fForm4");
const form4 = async (e) => {
  e.preventDefault();
  let docRef = await db.collection("midnight").doc("fixed4");

  const f4Title = fForm4HTML["f4-title"].value;
  const f4Id1 = fForm4HTML["f4-id1"].value;
  const f4Id2 = fForm4HTML["f4-id2"].value;
  const f4Id3 = fForm4HTML["f4-id3"].value;
  const f4Id4 = fForm4HTML["f4-id4"].value;
  const f4Id5 = fForm4HTML["f4-id5"].value;
  const f4Id6 = fForm4HTML["f4-id6"].value;

  const f4Cat1 = fForm4HTML["f4-cat1"].value;
  const f4Cat2 = fForm4HTML["f4-cat2"].value;
  const f4Cat3 = fForm4HTML["f4-cat3"].value;
  const f4Cat4 = fForm4HTML["f4-cat4"].value;
  const f4Cat5 = fForm4HTML["f4-cat5"].value;
  const f4Cat6 = fForm4HTML["f4-cat6"].value;

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
            ui.bannerType = docData.bannerType || "";
            ui.bannerTypeColorEnd = docData.bannerTypeColorEnd || "";
            ui.bannerTypeColorStart = docData.bannerTypeColorStart || "";
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
    docData.title = f4Title;
    fForm4HTML.reset();
    await docRef.update(docData);
    // console.log('updated');
  });

  // console.log('done');
};

fForm4HTML.addEventListener("submit", form4);

const displayForm4 = () => {
  db.collection("midnight")
    .doc("fixed4")
    .onSnapshot((doc) => {
      let docData = doc.data();
      // console.log(docData);
      fForm4HTML["f4-title"].value = docData.title || "Section Empty";
      if (docData.title) {
        fForm4HTML["f4-cat1"].value = docData.prodIds[0].cat;
        fForm4HTML["f4-cat2"].value = docData.prodIds[1].cat;
        fForm4HTML["f4-cat3"].value = docData.prodIds[2].cat;
        fForm4HTML["f4-cat4"].value = docData.prodIds[3].cat;
        fForm4HTML["f4-cat5"].value = docData.prodIds[4].cat;
        fForm4HTML["f4-cat6"].value = docData.prodIds[5].cat;
        fForm4HTML["f4-id1"].value = docData.prodIds[0].sno;
        fForm4HTML["f4-id2"].value = docData.prodIds[1].sno;
        fForm4HTML["f4-id3"].value = docData.prodIds[2].sno;
        fForm4HTML["f4-id4"].value = docData.prodIds[3].sno;
        fForm4HTML["f4-id5"].value = docData.prodIds[4].sno;
        fForm4HTML["f4-id6"].value = docData.prodIds[5].sno;
      }
    });
};

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

const fForm5HTML = document.querySelector("#fForm5");
const form5 = async (e) => {
  e.preventDefault();
  let docRef = await db.collection("midnight").doc("fixed5");

  const f5Title = fForm5HTML["f5-title"].value;
  const f5Id1 = fForm5HTML["f5-id1"].value;
  const f5Id2 = fForm5HTML["f5-id2"].value;
  const f5Id3 = fForm5HTML["f5-id3"].value;
  const f5Id4 = fForm5HTML["f5-id4"].value;
  const f5Id5 = fForm5HTML["f5-id5"].value;
  const f5Id6 = fForm5HTML["f5-id6"].value;

  const f5Cat1 = fForm5HTML["f5-cat1"].value;
  const f5Cat2 = fForm5HTML["f5-cat2"].value;
  const f5Cat3 = fForm5HTML["f5-cat3"].value;
  const f5Cat4 = fForm5HTML["f5-cat4"].value;
  const f5Cat5 = fForm5HTML["f5-cat5"].value;
  const f5Cat6 = fForm5HTML["f5-cat6"].value;

  let userInputs = [
    { sno: f5Id1, cat: f5Cat1 },
    { sno: f5Id2, cat: f5Cat2 },
    { sno: f5Id3, cat: f5Cat3 },
    { sno: f5Id4, cat: f5Cat4 },
    { sno: f5Id5, cat: f5Cat5 },
    { sno: f5Id6, cat: f5Cat6 },
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
            ui.bannerType = docData.bannerType || "";
            ui.bannerTypeColorEnd = docData.bannerTypeColorEnd || "";
            ui.bannerTypeColorStart = docData.bannerTypeColorStart || "";
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
    docData.title = f5Title;
    fForm5HTML.reset();
    await docRef.update(docData);
    // console.log('updated');
  });

  // console.log('done');
};

fForm5HTML.addEventListener("submit", form5);

const displayForm5 = () => {
  db.collection("midnight")
    .doc("fixed5")
    .onSnapshot((doc) => {
      let docData = doc.data();
      // console.log(docData);
      fForm5HTML["f5-title"].value = docData.title || "Section Empty";
      if (docData.title) {
        fForm5HTML["f5-cat1"].value = docData.prodIds[0].cat;
        fForm5HTML["f5-cat2"].value = docData.prodIds[1].cat;
        fForm5HTML["f5-cat3"].value = docData.prodIds[2].cat;
        fForm5HTML["f5-cat4"].value = docData.prodIds[3].cat;
        fForm5HTML["f5-cat5"].value = docData.prodIds[4].cat;
        fForm5HTML["f5-cat6"].value = docData.prodIds[5].cat;
        fForm5HTML["f5-id1"].value = docData.prodIds[0].sno;
        fForm5HTML["f5-id2"].value = docData.prodIds[1].sno;
        fForm5HTML["f5-id3"].value = docData.prodIds[2].sno;
        fForm5HTML["f5-id4"].value = docData.prodIds[3].sno;
        fForm5HTML["f5-id5"].value = docData.prodIds[4].sno;
        fForm5HTML["f5-id6"].value = docData.prodIds[5].sno;
      }
    });
};

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

const fForm6HTML = document.querySelector("#fForm6");
const form6 = async (e) => {
  e.preventDefault();
  let docRef = await db.collection("midnight").doc("fixed6");

  const f6Title = fForm6HTML["f6-title"].value + ' ';
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
            ui.bannerType = docData.bannerType || "";
            ui.bannerTypeColorEnd = docData.bannerTypeColorEnd || "";
            ui.bannerTypeColorStart = docData.bannerTypeColorStart || "";
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
    fForm6HTML.reset();
    await docRef.update(docData);
    // console.log('updated');
  });

  // console.log('done');
};

fForm6HTML.addEventListener("submit", form6);

const displayForm6 = () => {
  db.collection("midnight")
    .doc("fixed6")
    .onSnapshot((doc) => {
      let docData = doc.data();
      // console.log(docData);
      fForm6HTML["f6-title"].value = docData.title || "Section Empty";
      if (docData.title) {
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
      }
    });
};

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

const fForm7HTML = document.querySelector("#fForm7");
const form7 = async (e) => {
  e.preventDefault();
  let docRef = await db.collection("midnight").doc("fixed7");

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
            ui.bannerType = docData.bannerType || "";
            ui.bannerTypeColorEnd = docData.bannerTypeColorEnd || "";
            ui.bannerTypeColorStart = docData.bannerTypeColorStart || "";
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
    docData.title = f7Title;
    fForm7HTML.reset();
    await docRef.update(docData);
    // console.log('updated');
  });

  // console.log('done');
};

fForm7HTML.addEventListener("submit", form7);

const displayForm7 = () => {
  db.collection("midnight")
    .doc("fixed7")
    .onSnapshot((doc) => {
      let docData = doc.data();
      // console.log(docData);
      fForm7HTML["f7-title"].value = docData.title || "Section Empty";
      if (docData.title) {
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
      }
    });
};

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

const fForm8HTML = document.querySelector("#fForm8");
const form8 = async (e) => {
  e.preventDefault();
  let docRef = await db.collection("midnight").doc("fixed8");

  const f8Title = fForm8HTML["f8-title"].value;
  const f8Id1 = fForm8HTML["f8-id1"].value;
  const f8Id2 = fForm8HTML["f8-id2"].value;
  const f8Id3 = fForm8HTML["f8-id3"].value;
  const f8Id4 = fForm8HTML["f8-id4"].value;
  const f8Id5 = fForm8HTML["f8-id5"].value;
  const f8Id6 = fForm8HTML["f8-id6"].value;

  const f8Cat1 = fForm8HTML["f8-cat1"].value;
  const f8Cat2 = fForm8HTML["f8-cat2"].value;
  const f8Cat3 = fForm8HTML["f8-cat3"].value;
  const f8Cat4 = fForm8HTML["f8-cat4"].value;
  const f8Cat5 = fForm8HTML["f8-cat5"].value;
  const f8Cat6 = fForm8HTML["f8-cat6"].value;

  let userInputs = [
    { sno: f8Id1, cat: f8Cat1 },
    { sno: f8Id2, cat: f8Cat2 },
    { sno: f8Id3, cat: f8Cat3 },
    { sno: f8Id4, cat: f8Cat4 },
    { sno: f8Id5, cat: f8Cat5 },
    { sno: f8Id6, cat: f8Cat6 },
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
            ui.bannerType = docData.bannerType || "";
            ui.bannerTypeColorEnd = docData.bannerTypeColorEnd || "";
            ui.bannerTypeColorStart = docData.bannerTypeColorStart || "";
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
    docData.title = f8Title;
    fForm8HTML.reset();
    await docRef.update(docData);
    // console.log('updated');
  });

  // console.log('done');
};

fForm8HTML.addEventListener("submit", form8);

const displayForm8 = () => {
  db.collection("midnight")
    .doc("fixed8")
    .onSnapshot((doc) => {
      let docData = doc.data();
      // console.log(docData);
      fForm8HTML["f8-title"].value = docData.title || "Section Empty";
      if (docData.title) {
        fForm8HTML["f8-cat1"].value = docData.prodIds[0].cat;
        fForm8HTML["f8-cat2"].value = docData.prodIds[1].cat;
        fForm8HTML["f8-cat3"].value = docData.prodIds[2].cat;
        fForm8HTML["f8-cat4"].value = docData.prodIds[3].cat;
        fForm8HTML["f8-cat5"].value = docData.prodIds[4].cat;
        fForm8HTML["f8-cat6"].value = docData.prodIds[5].cat;
        fForm8HTML["f8-id1"].value = docData.prodIds[0].sno;
        fForm8HTML["f8-id2"].value = docData.prodIds[1].sno;
        fForm8HTML["f8-id3"].value = docData.prodIds[2].sno;
        fForm8HTML["f8-id4"].value = docData.prodIds[3].sno;
        fForm8HTML["f8-id5"].value = docData.prodIds[4].sno;
        fForm8HTML["f8-id6"].value = docData.prodIds[5].sno;
      }
    });
};

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

const fForm9HTML = document.querySelector("#fForm9");
const form9 = async (e) => {
  e.preventDefault();
  let docRef = await db.collection("midnight").doc("fixed9");

  const f9Title = fForm9HTML["f9-title"].value;
  const f9Id1 = fForm9HTML["f9-id1"].value;
  const f9Id2 = fForm9HTML["f9-id2"].value;
  const f9Id3 = fForm9HTML["f9-id3"].value;
  const f9Id4 = fForm9HTML["f9-id4"].value;
  const f9Id5 = fForm9HTML["f9-id5"].value;
  const f9Id6 = fForm9HTML["f9-id6"].value;

  const f9Cat1 = fForm9HTML["f9-cat1"].value;
  const f9Cat2 = fForm9HTML["f9-cat2"].value;
  const f9Cat3 = fForm9HTML["f9-cat3"].value;
  const f9Cat4 = fForm9HTML["f9-cat4"].value;
  const f9Cat5 = fForm9HTML["f9-cat5"].value;
  const f9Cat6 = fForm9HTML["f9-cat6"].value;

  let userInputs = [
    { sno: f9Id1, cat: f9Cat1 },
    { sno: f9Id2, cat: f9Cat2 },
    { sno: f9Id3, cat: f9Cat3 },
    { sno: f9Id4, cat: f9Cat4 },
    { sno: f9Id5, cat: f9Cat5 },
    { sno: f9Id6, cat: f9Cat6 },
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
            ui.bannerType = docData.bannerType || "";
            ui.bannerTypeColorEnd = docData.bannerTypeColorEnd || "";
            ui.bannerTypeColorStart = docData.bannerTypeColorStart || "";
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
    docData.title = f9Title;
    fForm9HTML.reset();
    await docRef.update(docData);
    // console.log('updated');
  });

  // console.log('done');
};

fForm9HTML.addEventListener("submit", form9);

const displayForm9 = () => {
  db.collection("midnight")
    .doc("fixed9")
    .onSnapshot((doc) => {
      let docData = doc.data();
      // console.log(docData);
      fForm9HTML["f9-title"].value = docData.title || "Section Empty";
      if (docData.title) {
        fForm9HTML["f9-cat1"].value = docData.prodIds[0].cat;
        fForm9HTML["f9-cat2"].value = docData.prodIds[1].cat;
        fForm9HTML["f9-cat3"].value = docData.prodIds[2].cat;
        fForm9HTML["f9-cat4"].value = docData.prodIds[3].cat;
        fForm9HTML["f9-cat5"].value = docData.prodIds[4].cat;
        fForm9HTML["f9-cat6"].value = docData.prodIds[5].cat;
        fForm9HTML["f9-id1"].value = docData.prodIds[0].sno;
        fForm9HTML["f9-id2"].value = docData.prodIds[1].sno;
        fForm9HTML["f9-id3"].value = docData.prodIds[2].sno;
        fForm9HTML["f9-id4"].value = docData.prodIds[3].sno;
        fForm9HTML["f9-id5"].value = docData.prodIds[4].sno;
        fForm9HTML["f9-id6"].value = docData.prodIds[5].sno;
      }
    });
};

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

const fForm10HTML = document.querySelector("#fForm10");
const form10 = async (e) => {
  e.preventDefault();
  let docRef = await db.collection("midnight").doc("fixed10");

  const f10Title = fForm10HTML["f10-title"].value;
  const f10Id1 = fForm10HTML["f10-id1"].value;
  const f10Id2 = fForm10HTML["f10-id2"].value;
  const f10Id3 = fForm10HTML["f10-id3"].value;
  const f10Id4 = fForm10HTML["f10-id4"].value;
  const f10Id5 = fForm10HTML["f10-id5"].value;
  const f10Id6 = fForm10HTML["f10-id6"].value;

  const f10Cat1 = fForm10HTML["f10-cat1"].value;
  const f10Cat2 = fForm10HTML["f10-cat2"].value;
  const f10Cat3 = fForm10HTML["f10-cat3"].value;
  const f10Cat4 = fForm10HTML["f10-cat4"].value;
  const f10Cat5 = fForm10HTML["f10-cat5"].value;
  const f10Cat6 = fForm10HTML["f10-cat6"].value;

  let userInputs = [
    { sno: f10Id1, cat: f10Cat1 },
    { sno: f10Id2, cat: f10Cat2 },
    { sno: f10Id3, cat: f10Cat3 },
    { sno: f10Id4, cat: f10Cat4 },
    { sno: f10Id5, cat: f10Cat5 },
    { sno: f10Id6, cat: f10Cat6 },
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
            ui.bannerType = docData.bannerType || "";
            ui.bannerTypeColorEnd = docData.bannerTypeColorEnd || "";
            ui.bannerTypeColorStart = docData.bannerTypeColorStart || "";
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
    docData.title = f10Title;
    fForm10HTML.reset();
    await docRef.update(docData);
    // console.log('updated');
  });

  // console.log('done');
};

fForm10HTML.addEventListener("submit", form10);

const displayForm10 = () => {
  db.collection("midnight")
    .doc("fixed10")
    .onSnapshot((doc) => {
      let docData = doc.data();
      fForm10HTML["f10-title"].value = docData.title || "Section Empty";
      if (docData.title) {
        // console.log(docData);
        fForm10HTML["f10-cat1"].value = docData.prodIds[0].cat;
        fForm10HTML["f10-cat2"].value = docData.prodIds[1].cat;
        fForm10HTML["f10-cat3"].value = docData.prodIds[2].cat;
        fForm10HTML["f10-cat4"].value = docData.prodIds[3].cat;
        fForm10HTML["f10-cat5"].value = docData.prodIds[4].cat;
        fForm10HTML["f10-cat6"].value = docData.prodIds[5].cat;
        fForm10HTML["f10-id1"].value = docData.prodIds[0].sno;
        fForm10HTML["f10-id2"].value = docData.prodIds[1].sno;
        fForm10HTML["f10-id3"].value = docData.prodIds[2].sno;
        fForm10HTML["f10-id4"].value = docData.prodIds[3].sno;
        fForm10HTML["f10-id5"].value = docData.prodIds[4].sno;
        fForm10HTML["f10-id6"].value = docData.prodIds[5].sno;
      }
    });
};

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
