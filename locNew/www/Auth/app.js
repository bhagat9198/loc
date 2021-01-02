/*
 * Copyright 2016 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except
 * in compliance with the License. You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under the
 * License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either
 * express or implied. See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * FirebaseUI initialization to be used in a Single Page application context.
 */

/**
 * @return {!Object} The FirebaseUI config.
 */
// var firebaseConfig = {
//   apiKey: "AIzaSyATUjzcsSQMIKlEeBQqMGTy_4zugRTPILg",
//   authDomain: "lake-of-cakes.firebaseapp.com",
//   databaseURL: "https://lake-of-cakes.firebaseio.com",
//   projectId: "lake-of-cakes",
//   storageBucket: "lake-of-cakes.appspot.com",
//   messagingSenderId: "779843608951",
//   appId: "1:779843608951:web:48c6afe1773e2b395e8172",
//   measurementId: "G-5ER0QF0FDW"
// };
// firebase.initializeApp(firebaseConfig);

function getUiConfig() {
  return {
    'callbacks': {
      // Called when the user has been successfully signed in.
      'signInSuccessWithAuthResult': function (authResult, redirectUrl) {
        if (authResult.user) {
          handleSignedInUser(authResult.user);
        }
        if (authResult.additionalUserInfo) {
          document.getElementById('is-new-user').textContent =
            authResult.additionalUserInfo.isNewUser ?
              'New User' : 'Existing User';
        }
        // Do not redirect.
        return false;
      }
    },
    // Opens IDP Providers sign-in flow in a popup.
    'signInFlow': 'popup',
    'signInOptions': [
      // TODO(developer): Remove the providers you don't need for your app.
      {
        provider: firebase.auth.GoogleAuthProvider.PROVIDER_ID,
        // Required to enable this provider in One-Tap Sign-up.
        authMethod: 'https://accounts.google.com',
        // Required to enable ID token credentials for this provider.
        clientId: CLIENT_ID
      },
      // {
      //   provider:firebase.auth.EmailAuthProvider.PROVIDER_ID,
      // },
     
      // {
      
      //   provider: firebase.auth.FacebookAuthProvider.PROVIDER_ID,
      //   scopes: [
      //     'public_profile',
      //     'email',
      //     'user_likes',
      //     'user_friends'
      //   ]
      // },
      {
        provider: firebase.auth.PhoneAuthProvider.PROVIDER_ID,
        // recaptchaParameters: {
        //   size: getRecaptchaMode()
        // }
         defaultCountry: 'IN',
        defaultNationalNumber: '',
        loginHint: ''
      },
      // firebase.auth.TwitterAuthProvider.PROVIDER_ID,
      // firebase.auth.GithubAuthProvider.PROVIDER_ID,
      // {
      //   provider: firebase.auth.EmailAuthProvider.PROVIDER_ID,
      //   // Whether the display name should be displayed in Sign Up page.
      //   requireDisplayName: true,
      //   signInMethod: getEmailSignInMethod()
      // },
      // {
      //   provider: firebase.auth.PhoneAuthProvider.PROVIDER_ID,
      //   recaptchaParameters: {
      //     size: getRecaptchaMode()
      //   }
      // },
      // {
      //   provider: 'microsoft.com',
      //   loginHintKey: 'login_hint'
      // },
      // {
      //   provider: 'apple.com',
      // },
      // firebaseui.auth.AnonymousAuthProvider.PROVIDER_ID
    ],
    // Terms of service url.
    'tosUrl': 'https://developers.google.com/terms/api-services-user-data-policy',
    // Privacy policy url.
    'privacyPolicyUrl': 'https://developers.google.com/terms/api-services-user-data-policy',
    'credentialHelper': CLIENT_ID && CLIENT_ID != 'YOUR_OAUTH_CLIENT_ID' ?
      firebaseui.auth.CredentialHelper.GOOGLE_YOLO :
      firebaseui.auth.CredentialHelper.ACCOUNT_CHOOSER_COM
  };
}

// Initialize the FirebaseUI Widget using Firebase.
var ui = new firebaseui.auth.AuthUI(firebase.auth());
// Disable auto-sign in.
ui.disableAutoSignIn();


/**
 * @return {string} The URL of the FirebaseUI standalone widget.
 */
function getWidgetUrl() {
  return '/widget#recaptcha=' + getRecaptchaMode() + '&emailSignInMethod=' +
    getEmailSignInMethod();
}


/**
 * Redirects to the FirebaseUI widget.
 */
var signInWithRedirect = function () {
  window.location.assign(getWidgetUrl());
};


/**
 * Open a popup with the FirebaseUI widget.
 */
var signInWithPopup = function () {
  window.open(getWidgetUrl(), 'Sign In', 'width=985,height=735');
};


/**
 * Displays the UI for a signed in user.
 * @param {!firebase.User} user
 */
var counter = 0;
var handleSignedInUser = function (user) {

  counter++;
  document.getElementById('user-signed-in').style.display = 'block';
  document.getElementById('user-signed-out').style.display = 'none';
  document.getElementById('name').textContent = user.displayName;
  document.getElementById('email').textContent = user.email;
  document.getElementById('phone').textContent = user.phoneNumber;
  if (user.photoURL) {
    var photoURL = user.photoURL;
    // Append size to the photo URL for Google hosted images to avoid requesting
    // the image with its original resolution (using more bandwidth than needed)
    // when it is going to be presented in smaller size.
    if ((photoURL.indexOf('googleusercontent.com') != -1) ||
      (photoURL.indexOf('ggpht.com') != -1)) {
      photoURL = photoURL + '?sz=' +
        document.getElementById('photo').clientHeight;
    }
    document.getElementById('photo').src = photoURL;
    document.getElementById('photo').style.display = 'block';

  } else {
    document.getElementById('photo').style.display = 'none';
  }
};


/**
 * Displays the UI for a signed out user.
 */
var handleSignedOutUser = function () {
  document.getElementById('user-signed-in').style.display = 'none';
  document.getElementById('user-signed-out').style.display = 'block';
  ui.start('#firebaseui-container', getUiConfig());
};

// Listen to change in auth state so it displays the correct UI for when
// the user is signed in or not.
firebase.auth().onAuthStateChanged(function(user) {
  // document.getElementById('loading').style.display = 'none';
  // document.getElementById('loaded').style.display = 'block';

  const db = firebase.firestore();
 
  window.localStorage.setItem("isGoogleAuthUser",user)
  var counter = 0;
  let getUserStatus=window.localStorage.getItem("locLoggedInUser")
  
  if (user!=null && user!="null" && getUserStatus!=null) {
   
    db.collection("Customers").onSnapshot(async (snapshots) => {
      
    
      let snapshotDocs = snapshots.docs;
      var dbref = db.collection('Customers');
      let USER_DATA;
      for (let doc of snapshotDocs) {
        let docData = doc.data();
        USER_DATA = docData;
        if (docData.Email == user.email) {
          await dbref.doc(doc.id).update({
            UserName: user.displayName,
            Email: user.email,
            Image: user.photoURL,
            UserAuthID: user.uid,
            userId:doc.id,
            token:btoa(user.email)
          });
          window.localStorage.setItem("locLoggedInUser",doc.id)
          counter++;
          user ? handleSignedInUser(user) : handleSignedOutUser();
          let goTo=window.localStorage.getItem("redirectURL");
         
          if(goTo!=null &&(goTo!="null")){
            if(goTo=="index.html"){
              window.location="../index.html"
            }else if(goTo.includes("product.html")){
              
              let buyNowProd = window.sessionStorage.getItem('buyNowProd');
              
              if(buyNowProd) {
                buyNowProd = JSON.parse(buyNowProd);
                if(USER_DATA.orders) {
                  USER_DATA.orders.push(buyNowProd);
                } else {
                  let orders = [];
                  orders.push(buyNowProd);
                  USER_DATA.orders = orders;
                }
                await dbref.doc(doc.id).update(USER_DATA);
                let orderId = buyNowProd.orderId;
                await sessionStorage.removeItem("buyNowProd");
                window.location = `../Payment/checkout.html?checkout=${orderId}`;
                // console.log(doc.data());
                // let userRef = await db.collection("Customers").doc(userId);
              }else{
                window.location=goTo;
              }
             
            }else{
              
               window.location=goTo;
            }
        
          }
 
          else{
   
            window.location="../index.html"
          }
         
          break;
         
         
        }

      }
      if (counter == 0) {
        if(user.Email==null ||user.Email=="null"){
          user.Email=""
        }
        var setWithMerge = dbref.add({
          UserName: user.displayName,
          Email: user.email,
          Image: user.photoURL,
          createdDtm: firebase.firestore.FieldValue.serverTimestamp(),
          lastLoginTime: firebase.firestore.FieldValue.serverTimestamp(),
          token:"newUser",
          Phone :user.phoneNumber
        });
     

      }


    });


  } else {
 
    // window.localStorage.clear("locLoggedInUser")

    if( getUserStatus=="null" || getUserStatus==null){
      
    
      window.localStorage.setItem("locLoggedInUser",null)
      user ? handleSignedInUser(user) : handleSignedOutUser();
    }else{
      
      let goTo=window.localStorage.getItem("redirectURL");
    
      // if(goTo!=null &&(goTo!="null")){
        
      //   window.location=goTo;
      // }


      // else{
      //   window.location="../index.html"
      // }
      
    }

  }


});
async function signOut(){
 await firebase.auth().signOut();
}

/**
 * Deletes the user's account.
 */
var deleteAccount = function () {
  firebase.auth().currentUser.delete().catch(function (error) {
    if (error.code == 'auth/requires-recent-login') {
      // The user's credential is too old. She needs to sign in again.
      firebase.auth().signOut().then(function () {
        // The timeout allows the message to be displayed after the UI has
        // changed to the signed out state.
        setTimeout(function () {
          alert('Please sign in again to delete your account.');
        }, 1);
      });
    }
  });
};
// alert(firebase.auth().currentUser)

/**
 * Handles when the user changes the reCAPTCHA or email signInMethod config.
 */
function handleConfigChange() {
  var newRecaptchaValue = document.querySelector(
    'input[name="recaptcha"]:checked').value;
  var newEmailSignInMethodValue = document.querySelector(
    'input[name="emailSignInMethod"]:checked').value;
  location.replace(
    location.pathname + '#recaptcha=' + newRecaptchaValue +
    '&emailSignInMethod=' + newEmailSignInMethodValue);

  // Reset the inline widget so the config changes are reflected.
  ui.reset();
  ui.start('#firebaseui-container', getUiConfig());
}


/**
 * Initializes the app.
 */
var initApp = function () {
  // document.getElementById('sign-in-with-redirect').addEventListener(
  //   'click', signInWithRedirect);
  // document.getElementById('sign-in-with-popup').addEventListener(
  //   'click', signInWithPopup);
  // document.getElementById('sign-out').addEventListener('click', function () {
  //   firebase.auth().signOut();
  // });
  // document.getElementById('delete-account').addEventListener(
  //   'click', function () {
  //     deleteAccount();
  //   });

  // document.getElementById('recaptcha-normal').addEventListener(
  //   'change', handleConfigChange);
  // document.getElementById('recaptcha-invisible').addEventListener(
  //   'change', handleConfigChange);
  // Check the selected reCAPTCHA mode.
  // document.querySelector(
  //   'input[name="recaptcha"][value="' + getRecaptchaMode() + '"]')
  //   .checked = true;

  // document.getElementById('email-signInMethod-password').addEventListener(
  //   'change', handleConfigChange);
  // document.getElementById('email-signInMethod-emailLink').addEventListener(
  //   'change', handleConfigChange);
  // Check the selected email signInMethod mode.
  // document.querySelector(
  //   'input[name="emailSignInMethod"][value="' + getEmailSignInMethod() + '"]')
  //   .checked = true;
};

window.addEventListener('load', initApp);
