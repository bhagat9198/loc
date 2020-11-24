
var firebase = require("firebase");
require('firebase/auth');
require('firebase/database');
require('firebase/storage');

var firebaseConfig = {
    apiKey: "AIzaSyAeO9tCAzMIHjD2D3oaYzDeBOFMUmsbT5g",
    authDomain: "chitransh-club.firebaseapp.com",
    databaseURL: "https://chitransh-club.firebaseio.com",
    projectId: "chitransh-club",
    storageBucket: "chitransh-club.appspot.com",
    messagingSenderId: "718717916102",
    appId: "1:718717916102:web:ac6b4e73365fe8153298c7"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

const functions = require('firebase-functions');

const admin = require("firebase-admin")

const nodemailer = require('nodemailer');
var smtpTransport = require('nodemailer-smtp-transport');

admin.initializeApp({
    credential: admin.credential.applicationDefault(),
    databaseURL: 'https://chitransh-club.firebaseio.com/'
});


//google account credentials used to send email

var transporter = nodemailer.createTransport({

    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    service: 'gmail',
    auth: {

        user: 'chitranshclubapp@gmail.com',
        pass: 'chitranshclub9450021817'
    },
    tls: {
        // do not fail on invalid certs
        rejectUnauthorized: false
    }
});



exports.sendAcceptUser = functions.database.ref('/ChitranshUsers/{pushID}')
    .onUpdate(async (change) => {
        const snapshot = change.after;
        const snapshot2 = change.before;
        // const snapshot = change.after;
        const val = snapshot.val();
        const val2 = snapshot2.val();
        const payload = {
            notification: {
                title: "Chitransh Club",
                body: val.name + ' ' + 'has requested to join Chitransh Club. Click to view ',
                sound: "default"
            },
        };


        //Create an options object that contains the time to live for the notification and the priority
        const options = {
            priority: "high",
            timeToLive: 60 * 60 * 24
        };
        const mailOptions = {
            from: '"Chitransh Club " <chitranshclubapp@gmail.com>',
            to: val.email,
        };

        var ID;
        ref2 = firebase.database().ref('ChitranshUsers');
        ref2.once('value', gotData2, errData);
        function gotData2(data) {
            var sc2 = data.val();
            var keys2 = Object.keys(sc2);
            console.log("Loop")
            for (var i = 0; i < keys2.length; i++) {
                var k = keys2[i];
                var id = sc2[k].ID;
                if (id === '53CC24') {
                    ID = sc2[k].Deviceid;
                    break;
                }
            }

            console.log(val.confirmationid)
            console.log(val2.confirmationid)
            if (val.confirmationid === "confirmed" && val2.confirmationid !== "confirmed" && val.confirmationid !== "rejected") {


                admin.messaging().sendToDevice(ID, payload, options);

            }
            else {
                console.log("IDIDNTCAME IN NTOI")
            }




        }



        // Building Email message.
        mailOptions.subject = 'Chitransh Club';
        //for example



        function errData(err) {
            console.log('error');
            console.log(err);
        }

    });
