console.log("terms.js");

const db = firebase.firestore();
const storageService = firebase.storage();
let IMAGE;
const aboutFormHTML = document.querySelector("#about-form");

const aboutForm = (e) => {
  e.preventDefault();
  let note = $("#about-text").summernote("code");
  console.log(note);
  let data;

  while (note.includes("<p><br></p>") || note.startsWith("<p><br></p>")) {
    note = note.replace("<p><br></p>", "");
  }

  while (note.includes("<p><br></p>") || note.endsWith("<p><br></p>")) {
    note = note.replace("<p><br></p>", "");
  }

  data = {
    note: note,
  };

  const submitData = async (submitData) => {
    let aboutRef = db.collection("footer").doc("terms");
    aboutRef.get().then(async (doc) => {
      if (doc.exists) {
        await aboutRef.update(submitData);
      } else {
        await aboutRef.set(submitData);
      }
    });
    return;
  };
  submitData(data).then(async () => {
    if (IMAGE) {
      await storageService.ref(`footer/terms/${IMAGE.name}`).put(IMAGE);
      let imgUrl;
      await storageService
        .ref(`footer/terms/${IMAGE.name}`)
        .getDownloadURL()
        .then((url) => (imgUrl = url))
        .catch((error) => console.log(error));
      console.log(imgUrl);
      let aboutRef = db.collection("footer").doc("terms");
      aboutRef.get().then((doc) => {
        let docData = doc.data();
        console.log(docData);
        if (docData.imgUrl) {
          console.log(docData.imgUrl);
          storageService
            .ref(`footer/terms/${docData.img}`)
            .delete()
            .then(() => {
              docData.imgUrl = imgUrl;
              docData.img = IMAGE.name;
              console.log(docData);
              return aboutRef.update(docData);
            })
            .then((savedData) => {
              console.log("updated");
            })
            .catch((error) => {
              console.log(error);
            });
        } else {
          docData.imgUrl = imgUrl;
          docData.img = IMAGE.name;
          console.log(docData);
          return aboutRef.update(docData);
        }
      });
    }
    $("#about-text").summernote("reset");
    aboutFormHTML.reset();
    extractData();
  });
};

aboutFormHTML.addEventListener("submit", aboutForm);

const sliderFileHTML = document.querySelector("#slider-file");
const uploadFile = (e) => {
  IMAGE = e.target.files[0];
  console.log(IMAGE);
};
sliderFileHTML.addEventListener("change", uploadFile);

// const reduce

const extractData = () => {
  db.collection("footer")
    .doc("terms")
    .get()
    .then((aboutSnap) => {
      let aboutSnapData = aboutSnap.data();
      $("#about-text").summernote("editor.pasteHTML", aboutSnapData.note);

      document.querySelector("#img-preview").src = aboutSnapData.imgUrl;
    });
};
extractData();
