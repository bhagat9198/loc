var firebase = require("firebase");
require('firebase/auth');
require('firebase/database');
require('firebase/storage');

var firebaseConfig = {
    apiKey: "AIzaSyATUjzcsSQMIKlEeBQqMGTy_4zugRTPILg",
    authDomain: "lake-of-cakes.firebaseapp.com",
    databaseURL: "https://lake-of-cakes.firebaseio.com",
    projectId: "lake-of-cakes",
    storageBucket: "lake-of-cakes.appspot.com",
    messagingSenderId: "779843608951",
    appId: "1:779843608951:web:48c6afe1773e2b395e8172",
    measurementId: "G-5ER0QF0FDW"
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



exports.sendEmailAcceptUser = functions.database.ref('/ChitranshUsers/{pushID}')
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
        mailOptions.subject = 'Registration Request Accepted  ';
        mailOptions2.subject = 'Registration Request Rejected ';
        mailOptions3.subject = 'Request For Password Reset';
        //for example
        mailOptions.html = '<p style="color:black;" >' + "Hello" + " " + val.name + '<br>' + '<h4 style="color:green;">Your Registration has been approved</h4>' + "Now you can LOGIN to chitransh-club-app by using your email id and password" + " . " + "Your Login details are listed below" + '</p><br><h1 style="font-size:1em; color:black;border: 4px groove cyan;background:lightyellow ;border-radius: 20px;margin-left:2%;text-align:center; ">' + " " + '<p style="color:#ff3333;text-align: center;font-size:1rem">Chitransh Club</p>' + " " + '<br><hr><br>' + " " + '&nbsp; Email id: ' + " " + val.email + '<br><br>' + " " + "&nbsp; Password :" + "Use the password entered during SIGNUP part." + '</p><br><br>' + "Thnakyou : " + "Team Chitransh." + "" + " " + '</p>'
        mailOptions2.html = '<p style="color:black;" >' + "Dear" + " " + val.name + '<br>' + "This email is to inform you that you were " + '<h4 style="color:red">NOT SELECTED </h4>' + " to undergo for the position for which you applied. We appreciate your interest in our open position and that you took the time to send us your credentials and an application." + '<br>' + "The reason of your rejection is listed below" + '</p><br><h1 style="font-size:1em; color:black;border: 4px groove cyan;background:lightgray ;border-radius: 20px;margin-left:2%; ">' + " " + '<p style="color:#ff3333;text-align: center;font-size:1rem">Chitransh Club (Reason of Rejection)</p>' + " " + '<br><hr><br>' + " " + '&nbsp; Reason: ' + " " + val.status + '<br><br>' + " " + "For more information or in case of any enquiry,&nbsp; please feel free to contact to our admin" + '<br>' + "Phone Number: +919450021817." + '<br>' + "Email ID: rejeshchitraguptbst@gmail.com" + '</p><br><br>' + "Thnakyou : " + "Team Chitransh." + "" + " " + '</p>'
        mailOptions3.html = '<p style="color:black;" >Hello' + val.name + '<br>We have recieved your password reset request for chitransh club app.<br><h1>Your password reset code is ' + " " + val.forgotpass + '<br>Thankyou'
        if (val.confirmationid === "accepted" && val2.confirmationid === "confirmed") {
            try {

                transporter.sendMail(mailOptions);
                console.log('email sent to:', val.email);
                transporter.close();
                console.log(val.email)
            } catch (error) {
                console.error('There was an error while sending the email:' + val.email, error);
            }
        }
        if (val.confirmationid === "rejected" && val2.confirmationid === "confirmed") {

            try {



                transporter.sendMail(mailOptions2);
                console.log('email sent to:', val.email);
                transporter.close();
                console.log(val.email)
                console.log(key)
                firebase.database().ref("ChitranshUsers").child(key).remove();

            } catch (error) {
                console.error('There was an error while sending the email:' + val.email, error);
            }

        }
        if (val.forgotpass !== 0 && val2.forgotpass === 0) {

            try {
                console.log("came")

                transporter.sendMail(mailOptions3);
                console.log('email sent to:', val.email);
                transporter.close();
                console.log(val.email)
                console.log(key)


            } catch (error) {
                console.error('There was an error while sending the email:' + val.email, error);
            }

        }
    });