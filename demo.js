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
        allCategories.push(docData.name);
        options += `
      <option value="${docData.name}" >${docData.name}</option>
      `;
      });
      options += `
    <option value="all">All (Common Section)</option>`;
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
          if (docData.mainImg) {
            imgPath = `${data}/${doc.id}/${docData.mainImg}`;
            imgPath = await extractImgURL(imgPath);
          }
          // console.log(imgPath);
          tRows += `
          <tr>
            <td>
              <img
                src="${imgPath}" />
            </td>
            <td>${docData.name}</td>
            <td>${docData.sno}</td>
            <td> <input type="checkbox" name="products-list" id="${doc.id}" value="${doc.id}" /></td>
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

console.log(addSectionFormHTML["product-img-1"]);

let i1, i2, i3, i3, imgBanner, animationBanner;
// addSectionFormHTML["product-img-1"]
//   .addEventListener("change", (e) => {
//     console.log(e.target.files);
//     console.log(e.target.files[0]);
    // i1 = e.target.files[0];
  // });
// addSectionFormHTML["product-img-2"].addEventListener("change", e => {
//   i2 = e.target.files[0];
// });
// addSectionFormHTML["product-img-3"].addEventListener("change", e => {
//   i3 = e.target.files[0];
// });
// addSectionFormHTML["product-img-4"].addEventListener("change", e => {
//   i4 = e.target.files[0];
// });
// addSectionFormHTML["img-banner"].addEventListener("change", e => {
//   imgBanner = e.target.files[0];
// });
// addSectionFormHTML["animation-banner"].addEventListener("change", e => {
//   animationBanner = e.target.files[0];
// });

const addSection = (e) => {
  e.preventDefault();

  const sectionType = addSectionFormHTML["section-type"].value;
  const sectionName = addSectionFormHTML["section-name"].value;
  const sectioncategory = addSectionFormHTML["section-category"].value;
  // const colorTopLeft = addSectionFormHTML["color-top-left"].value;
  // const colorBottomRight = addSectionFormHTML["color-bottom-right"].value;
  let productsSelected = [];

  if (sectionType === "4") {
    console.log(4);
    productsSelected = [];
    // let t1 = addSectionFormHTML["product-tag-1"].value;
    // let t2 = addSectionFormHTML["product-tag-2"].value;
    // let t3 = addSectionFormHTML["product-tag-3"].value;
    // let t4 = addSectionFormHTML["product-tag-4"].value;

    // if (i1 && t1) {
    //   productsSelected.push({
    //     tag: t1,
    //     img: `card__${Math.random()}__${i1.name}`,
    //   });
    // }
    // if (i2 && t2) {
    //   productsSelected.push({
    //     tag: t2,
    //     img: `card__${Math.random()}__${i2.name}`,
    //   });
    // }
    // if (i3 && t3) {
    //   productsSelected.push({
    //     tag: t3,
    //     img: `card__${Math.random()}__${i3.name}`,
    //   });
    // }
    // if (i4 && t4) {
    //   productsSelected.push({
    //     tag: t4,
    //     img: `card__${Math.random()}__${i1.name}`,
    //   });
    // }
    console.log(productsSelected);
  } else if (sectionType === "6") {
    console.log(6);
    productsSelected = [];
    addSectionFormHTML
      .querySelectorAll("input[name='products-list']:checked")
      .forEach((prod) => {
        // console.log(prod.value);
        productsSelected.push(prod.value);
      });
    productsSelected.length = 6;
  } else if (sectionType === "slider") {
    console.log("slider");
    productsSelected = [];
    addSectionFormHTML
      .querySelectorAll("input[name='products-list']:checked")
      .forEach((prod) => {
        // console.log(prod.value);
        productsSelected.push(prod.value);
      });
  } else if (sectionType === "img") {
    console.log("img");
    // productsSelected = imgBanner;
    console.log(productsSelected);
  } else if (sectionType === "animation") {
    console.log("animation");
    // productsSelected = animationBanner;
    console.log(productsSelected);
  } else {
    console.log("invalid");
  }

  let wholeSectionData = {
    title: sectionName,
    type: sectionType,
    category: sectioncategory,
    colorTL: colorTopLeft,
    colorBR: colorBottomRight,
    card: productsSelected,
  };
  console.log(wholeSectionData);
};

addSectionFormHTML.addEventListener("submit", addSection);

// const sectionType = e => {
//   console.log(e.target.value);
// }

// sectionTypeHTML.addEventListener('change', sectionType);







































var firebase = require("firebase");
require("firebase/auth");
require("firebase/database");
require("firebase/storage");

var firebaseConfig = {
  apiKey: "AIzaSyAeO9tCAzMIHjD2D3oaYzDeBOFMUmsbT5g",
  authDomain: "chitransh-club.firebaseapp.com",
  databaseURL: "https://chitransh-club.firebaseio.com",
  projectId: "chitransh-club",
  storageBucket: "chitransh-club.appspot.com",
  messagingSenderId: "718717916102",
  appId: "1:718717916102:web:ac6b4e73365fe8153298c7",
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

const functions = require("firebase-functions");

const admin = require("firebase-admin");

const nodemailer = require("nodemailer");
var smtpTransport = require("nodemailer-smtp-transport");

admin.initializeApp({
  credential: admin.credential.applicationDefault(),
  databaseURL: "https://chitransh-club.firebaseio.com/",
});

//google account credentials used to send email

var transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  service: "gmail",
  auth: {
    user: "chitranshclubapp@gmail.com",
    pass: "chitranshclub9450021817",
  },
  tls: {
    // do not fail on invalid certs
    rejectUnauthorized: false,
  },
});

exports.sendAcceptUser = functions.database
  .ref("/ChitranshUsers/{pushID}")
  .onUpdate(async (change) => {
    const snapshot = change.after;
    const snapshot2 = change.before;
    // const snapshot = change.after;
    const val = snapshot.val();
    const val2 = snapshot2.val();
    const payload = {
      notification: {
        title: "Chitransh Club",
        body:
          val.name +
          " " +
          "has requested to join Chitransh Club. Click to view ",
        sound: "default",
      },
    };

    //Create an options object that contains the time to live for the notification and the priority
    const options = {
      priority: "high",
      timeToLive: 60 * 60 * 24,
    };
    const mailOptions = {
      from: '"Chitransh Club " <chitranshclubapp@gmail.com>',
      to: val.email,
    };

    var ID;
    ref2 = firebase.database().ref("ChitranshUsers");
    ref2.once("value", gotData2, errData);
    function gotData2(data) {
      var sc2 = data.val();
      var keys2 = Object.keys(sc2);
      console.log("Loop");
      for (var i = 0; i < keys2.length; i++) {
        var k = keys2[i];
        var id = sc2[k].ID;
        if (id === "53CC24") {
          ID = sc2[k].Deviceid;
          break;
        }
      }

      console.log(val.confirmationid);
      console.log(val2.confirmationid);
      if (
        val.confirmationid === "confirmed" &&
        val2.confirmationid !== "confirmed" &&
        val.confirmationid !== "rejected"
      ) {
        admin.messaging().sendToDevice(ID, payload, options);
      } else {
        console.log("IDIDNTCAME IN NTOI");
      }
    }

    // Building Email message.
    mailOptions.subject = "Chitransh Club";
    //for example

    function errData(err) {
      console.log("error");
      console.log(err);
    }
  });

exports.sendEmailAcceptUser = functions.database
  .ref("/ChitranshUsers/{pushID}")
  .onUpdate(async (change) => {
    const snapshot = change.after;
    const snapshot2 = change.before;
    // const snapshot = change.after;
    const val = snapshot.val();
    const val2 = snapshot2.val();
    var ID, key, keys2, sc2;
    //Create an options object that contains the time to live for the notification and the priority

    const mailOptions = {
      from: '"Chitransh Club " <chitranshclubapp@gmail.com>',
      to: val.email,
    };
    const mailOptions2 = {
      from: '"Chitransh Club" <chitranshclubapp@gmail.com>',
      to: val.email,
    };
    const mailOptions3 = {
      from: '"Chitransh Club" <chitranshclubapp@gmail.com>',
      to: val.email,
    };
    // Building Email message.
    mailOptions.subject = "Registration Request Accepted  ";
    mailOptions2.subject = "Registration Request Rejected ";
    mailOptions3.subject = "Request For Password Reset";
    //for example
    mailOptions.html =
      '<p style="color:black;" >' +
      "Hello" +
      " " +
      val.name +
      "<br>" +
      '<h4 style="color:green;">Your Registration has been approved</h4>' +
      "Now you can LOGIN to chitransh-club-app by using your email id and password" +
      " . " +
      "Your Login details are listed below" +
      '</p><br><h1 style="font-size:1em; color:black;border: 4px groove cyan;background:lightyellow ;border-radius: 20px;margin-left:2%;text-align:center; ">' +
      " " +
      '<p style="color:#ff3333;text-align: center;font-size:1rem">Chitransh Club</p>' +
      " " +
      "<br><hr><br>" +
      " " +
      "&nbsp; Email id: " +
      " " +
      val.email +
      "<br><br>" +
      " " +
      "&nbsp; Password :" +
      "Use the password entered during SIGNUP part." +
      "</p><br><br>" +
      "Thnakyou : " +
      "Team Chitransh." +
      "" +
      " " +
      "</p>";
    mailOptions2.html =
      '<p style="color:black;" >' +
      "Dear" +
      " " +
      val.name +
      "<br>" +
      "This email is to inform you that you were " +
      '<h4 style="color:red">NOT SELECTED </h4>' +
      " to undergo for the position for which you applied. We appreciate your interest in our open position and that you took the time to send us your credentials and an application." +
      "<br>" +
      "The reason of your rejection is listed below" +
      '</p><br><h1 style="font-size:1em; color:black;border: 4px groove cyan;background:lightgray ;border-radius: 20px;margin-left:2%; ">' +
      " " +
      '<p style="color:#ff3333;text-align: center;font-size:1rem">Chitransh Club (Reason of Rejection)</p>' +
      " " +
      "<br><hr><br>" +
      " " +
      "&nbsp; Reason: " +
      " " +
      val.status +
      "<br><br>" +
      " " +
      "For more information or in case of any enquiry,&nbsp; please feel free to contact to our admin" +
      "<br>" +
      "Phone Number: +919450021817." +
      "<br>" +
      "Email ID: rejeshchitraguptbst@gmail.com" +
      "</p><br><br>" +
      "Thnakyou : " +
      "Team Chitransh." +
      "" +
      " " +
      "</p>";
    mailOptions3.html =
      '<p style="color:black;" >Hello' +
      val.name +
      "<br>We have recieved your password reset request for chitransh club app.<br><h1>Your password reset code is " +
      " " +
      val.forgotpass +
      "<br>Thankyou";
    if (
      val.confirmationid === "accepted" &&
      val2.confirmationid === "confirmed"
    ) {
      try {
        transporter.sendMail(mailOptions);
        console.log("email sent to:", val.email);
        transporter.close();
        console.log(val.email);
      } catch (error) {
        console.error(
          "There was an error while sending the email:" + val.email,
          error
        );
      }
    }
    if (
      val.confirmationid === "rejected" &&
      val2.confirmationid === "confirmed"
    ) {
      try {
        transporter.sendMail(mailOptions2);
        console.log("email sent to:", val.email);
        transporter.close();
        console.log(val.email);
        console.log(key);
        firebase.database().ref("ChitranshUsers").child(key).remove();
      } catch (error) {
        console.error(
          "There was an error while sending the email:" + val.email,
          error
        );
      }
    }
    if (val.forgotpass !== 0 && val2.forgotpass === 0) {
      try {
        console.log("came");

        transporter.sendMail(mailOptions3);
        console.log("email sent to:", val.email);
        transporter.close();
        console.log(val.email);
        console.log(key);
      } catch (error) {
        console.error(
          "There was an error while sending the email:" + val.email,
          error
        );
      }
    }
  });

//   const mailOptions = {
//     from: '"Reetik " <reetikchitragupt@gmail.com>',
//     to: val.email,
//   };

//   // Building Email message.
//   mailOptions.subject = 'Sanchalana 2k20 ';
//  //for example
//   mailOptions.text = 'Welcome '+val.name+' '+'Your registration for the event'+' '+val.event+' '+ 'with USN'+' '+val.usn+' '+ 'has been confirmed'+ ' Your unique Id is'+' '+ val.random;

//   try {
//     console.log(val.email);
//     await transporter.sendMail(mailOptions);
//     console.log('email sent to:', val.email);
//     transporter.close();
//     console.log(val.email)
//   } catch(error) {
//     console.error('There was an error while sending the email:'+val.email, error);
//   }
//   return null;
// });
exports.sendPushNotification = functions.database
  .ref("/ChitranshUsers/{pushID}")
  .onUpdate(async (change) => {
    const snapshot = change.after;
    // const snapshot = change.after;
    const val = snapshot.val();
    var keyvalue;
    var useraddedid = val.ID;

    const payload = {
      notification: {
        title: "Chitransh Club",
        body: "Hey" + " " + val.name + "," + " Welcome to chitransh club app",
        sound: "default",
      },
    };

    //Create an options object that contains the time to live for the notification and the priority
    const options = {
      priority: "high",
      timeToLive: 60 * 60 * 24,
    };
    console.log("**ENTEREDSS");
    ref2 = firebase.database().ref("ChitranshUsers");
    ref2.once("value", gotData2, errData);
    function gotData2(data) {
      console.log("INSIDE FUNCTION");
      var sc2 = data.val();
      var keys2 = Object.keys(sc2);
      for (var i = 0; i < keys2.length; i++) {
        console.log("INSIDE LOOP");
        var k = keys2[i];
        var id = sc2[k].ID;
        if (useraddedid === id) {
          keyvalue = k;
          console.log("GOT keyvalue");
          break;
        }
      }
      console.log("**" + keyvalue + "SS");
      if (val.tokengenerated !== "yes") {
        admin.messaging().sendToDevice(val.Deviceid, payload, options);
        updatefunc();
      }
      function updatefunc() {
        sleep(3000);
        ref2.child(keyvalue).child("tokengenerated").set("yes");
      }
      function sleep(ms) {
        return new Promise((resolve) => setTimeout(resolve, ms));
      }
    }

    function errData(err) {
      console.log("error");
      console.log(err);
    }
  });

/***  TO SEND PUSH WHEN TIMELINE POST IS PUSHED**/
exports.sendPostNotification = functions.database
  .ref("/ChitranshPost/{pushID}")
  .onCreate((snapshot, context) => {
    // const snapshot = change.after;
    const val = snapshot.val();

    const payload = {
      notification: {
        title: "Chitransh Club",
        body:
          val.name +
          " " +
          "has recently posted to chitransh Timeline. Click to view ",
        sound: "default",
      },
    };

    const payload2 = {
      notification: {
        title: "Chitransh Club",
        body:
          "Your post has been successfully pushed on chitransh Timeline. Click to view",
        sound: "default",
      },
    };

    //Create an options object that contains the time to live for the notification and the priority
    const options = {
      priority: "high",
      timeToLive: 60 * 60 * 24,
    };

    ref2 = firebase.database().ref("ChitranshUsers");
    ref2.once("value", gotData2, errData);
    function gotData2(data) {
      var sc2 = data.val();
      var keys2 = Object.keys(sc2);
      for (var i = 0; i < keys2.length; i++) {
        var k = keys2[i];
        var id = sc2[k].ID;
        var id2 = val.id;

        if (val.content !== "") {
          if (id === id2) {
            admin.messaging().sendToDevice(sc2[k].Deviceid, payload2, options);
          } else {
            if (
              sc2[k].Deviceid === null ||
              sc2[k].Deviceid === "" ||
              sc2[k].Deviceid === " " ||
              sc2[k].Deviceid === "0" ||
              sc2[k].Deviceid === 0
            ) {
              continue;
            }
            admin.messaging().sendToDevice(sc2[k].Deviceid, payload, options);
          }
        }
      }
    }

    function errData(err) {
      console.log("error");
      console.log(err);
    }
  });

exports.UpdatePostNotification = functions.database
  .ref("/ChitranshPost/{pushID}")
  .onUpdate(async (change) => {
    const snapshot = change.after;
    const snapshot2 = change.before;
    // const snapshot = change.after;
    const val = snapshot.val();
    const val2 = snapshot2.val();

    const payload3 = {
      notification: {
        title: "Chitransh Club",
        body: val.likedUsers[val.lastIndex][1] + " has liked your post.",
        sound: "default",
      },
    };

    const options = {
      priority: "high",
      timeToLive: 60 * 60 * 24,
    };

    ref2 = firebase.database().ref("ChitranshUsers");
    ref2.once("value", gotData2, errData);

    function gotData2(data) {
      var sc2 = data.val();
      var keys2 = Object.keys(sc2);
      for (var i = 0; i < keys2.length; i++) {
        var k = keys2[i];
        var id = sc2[k].ID;
        var id2 = val.id;

        if (val.content !== "") {
          // console.log("first"+(Object.keys(val.likedUsers))[Object.keys(val.likedUsers).length-1])
          // console.log("second"+val.likedUsers[Object.keys(val.likedUsers)])
          if (id === id2 && val.lastIndex !== val2.lastIndex) {
            if (
              sc2[k].Deviceid === null ||
              sc2[k].Deviceid === "" ||
              sc2[k].Deviceid === " " ||
              sc2[k].Deviceid === "0" ||
              sc2[k].Deviceid === 0
            ) {
              continue;
            }
            admin.messaging().sendToDevice(sc2[k].Deviceid, payload3, options);
          }
        }
      }
    }

    function errData(err) {
      console.log("error");
      console.log(err);
    }
  });

/***  TO SEND PUSH WHEN TIMELINE POST IS UPDATED**/
//   exports.UpdatePostNotification = functions.database.ref('/ChitranshPost/{pushID}')
//   .onUpdate(async (change) => {
//   const snapshot = change.after;
//   const snapshot2 = change.before;
//    // const snapshot = change.after;
//   const val = snapshot.val();
//   const val2 = snapshot2.val();

//   const payload = {
//     notification: {
//       title:"Chitransh Club",
//       body:val.name+' '+'has recently posted to chitransh Timeline. Click to view ',
//       sound: "default"
//     },
//   };

//   const payload2 = {
//     notification: {
//       title:"Chitransh Club",
//       body:'Your post has been successfully pushed on chitransh Timeline. Click to view',
//       sound: "default"
//     },
//   };
//   // console.log(Object.keys(val.likedUsers).length-1)
//   // console.log("*******"+(Object.keys(val.likedUsers))[Object.keys(val.likedUsers).length-1]+"****")
//   const payload3 = {
//     notification: {
//       title:"Chitransh Club",
//       body: val.likedUsers[[Object.keys(val.likedUsers).length]]+' has liked your post.',
//       sound: "default"
//     },
//   };
//   console.log(Object.keys(val.likedUsers)[Object.keys(val.likedUsers).length])

//   //Create an options object that contains the time to live for the notification and the priority
//   const options = {
//     priority: "high",
//     timeToLive: 60 * 60 * 24
//   };

//   ref2 = firebase.database().ref('ChitranshUsers');
//   ref2.once('value',gotData2,errData);
//   function gotData2(data) {
//     var sc2=data.val();
//     var keys2=Object.keys(sc2);
//     for(var i=0;i<keys2.length;i++) {
//       var k=keys2[i];
//       var id=sc2[k].ID;
//       var id2=val.id;

//       if(val.content!=='') {
//         // console.log("first"+(Object.keys(val.likedUsers))[Object.keys(val.likedUsers).length-1])
//         // console.log("second"+val.likedUsers[Object.keys(val.likedUsers)])
//         if(id===id2){
//           if((id ===((Object.keys(val.likedUsers))[Object.keys(val.likedUsers).length-1]))||((Object.keys(val.likedUsers).includes("temp")))||((Object.keys(val.likedUsers).includes("*abc"))))
//           {
//               console.log("came")
//           }
//           else{
//             console.log("went")
//            admin.messaging().sendToDevice(sc2[k].Deviceid, payload3, options);
//          }
//         }else{

//           console.log("d")

//         }
//       }
//     }
//   }

//   function errData(err) {
//     console.log('error');
//     console.log(err);
//   }
// });
exports.sendEmail = functions.database
  .ref("/ChitranshUsers/{pushID}")

  .onCreate((snapshot, context) => {
    // const snapshot = change.after;
    const val = snapshot.val();

    const mailOptions = {
      from: '"Reetik " <reetikchitragupt@gmail.com>',
      to: val.email,
    };

    // Building Email message.
    mailOptions.subject = "Chitransh Club";
    //for example

    mailOptions.html =
      '<p style="color:black;" >Hello' +
      val.name +
      "<br>Welcome to Chitransh Club.<br>We have recieved your registration request for chitransh club.<br><h1>Your verification code is " +
      " " +
      val.confirmationid +
      "<br>Thankyou";
    try {
      console.log(val.email);
      transporter.sendMail(mailOptions);
      console.log("email sent to:", val.email);
      transporter.close();
      console.log(val.email);
    } catch (error) {
      console.error(
        "There was an error while sending the email:" + val.email,
        error
      );
    }
    return null;
  });

exports.UpdateNoticeNotification = functions.database
  .ref("/ChitranshNotice/{pushID}")
  .onUpdate(async (change) => {
    const snapshot = change.after;
    const snapshot2 = change.before;
    // const snapshot = change.after;
    const val = snapshot.val();
    const val2 = snapshot2.val();

    const payload = {
      notification: {
        title: "Chitransh Club",
        body: "Admin has recently uploaded to chitransh Board. Click to view ",
        sound: "default",
      },
    };

    //Create an options object that contains the time to live for the notification and the priority
    const options = {
      priority: "high",
      timeToLive: 30 * 30 * 12,
    };

    ref2 = firebase.database().ref("ChitranshUsers");
    ref2.once("value", gotData2, errData);
    function gotData2(data) {
      var sc2 = data.val();
      var keys2 = Object.keys(sc2);
      for (var i = 0; i < keys2.length; i++) {
        var k = keys2[i];
        var id = sc2[k].ID;
        var id2 = val.id;

        if (val.postdata !== "") {
          if (id === "53CC24") {
            console.log("came");
          } else {
            if (
              sc2[k].Deviceid === null ||
              sc2[k].Deviceid === "" ||
              sc2[k].Deviceid === " " ||
              sc2[k].Deviceid === "0" ||
              sc2[k].Deviceid === 0
            ) {
              continue;
            }
            admin.messaging().sendToDevice(sc2[k].Deviceid, payload, options);
          }
        } else {
          console.log("d");
        }
      }
    }

    function errData(err) {
      console.log("error");
      console.log(err);
    }
  });
