console.log("topCatImgs1.js");
const db = firebase.firestore();
const storageService = firebase.storage();

const addCategoryImgFormHTML = document.querySelector("#add-category-img-form");

let FILE;

// db.collection("categories").onSnapshot((snapshots) => {
//   let snapshotDocs = snapshots.docs;
//   displayCatergories(snapshotDocs);
// });
var uploader = document.getElementById("uploader");
const addNotification = (e) => {
  e.preventDefault();
  let message = document.getElementById("subject").value;

  aftersubmit(message);
};

function aftersubmit(message) {
  const storageService = firebase.storage();
  var uploadTask = storageService
    .ref("pushNotification/" + selectedFile.name + "")
    .put(selectedFile);

  uploadTask.on(
    "state_changed",
    function (snapshot) {
      var percentage = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
      uploader.value = percentage;

      // Observe state change events such as progress, pause, and resume
      // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
      progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;

      document.getElementById("demo").innerHTML = progress;
      switch (snapshot.state) {
        case firebase.storage.TaskState.PAUSED: // or 'paused'
          document.getElementById("demo").innerHTML = "Upload Paused";
          console.log("Upload is paused");
          break;
        case firebase.storage.TaskState.RUNNING: // or 'running'
          document.getElementById("demo").innerHTML =
            "File is uploading" + " " + progress + "%";

          break;
      }
    },
    function (error) {
      console.log(error);
      // Handle unsuccessful uploads
    },
    function () {
      document.getElementById("demo").innerHTML =
        "Uploaded" + " " + progress + "%";
      // Handle successful uploads on complete
      // For instance, get the download URL: https://firebasestorage.googleapis.com/...
      uploadTask.snapshot.ref.getDownloadURL().then(async function (downloadURL) {
        console.log("File available at", downloadURL);
        urls = downloadURL;
        await db.collection("pushNotification").add({
            subject: message,
            image: urls
        })
        .then(function(docRef) {
            alert("Notification Sent Successfully")
            window.location.reload();
        })
        .catch(function(error) {
            alert(error)
            console.error("Error adding document: ", error);
        });
      });
    }
  );
}

var selectedFile;
const ImgInputHTML = addCategoryImgFormHTML.querySelector(
  "input[name=category-img]"
);

ImgInputHTML.addEventListener("change", uploadFile);
function uploadFile(e) {
  selectedFile = e.target.files[0];
  // console.log(selectedFile);
  addCategoryImgFormHTML.addEventListener("submit", addNotification);
}
