/**
 * Copyright 2016 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
'use strict';

// Initializes the Demo.
function Demo() {
  document.addEventListener('DOMContentLoaded', function() {
    // Shortcuts to DOM Elements.
    this.signInButton = document.getElementById('demo-sign-in-button');
    this.signInCustomTokenButton = document.getElementById('demo-sign-in-custom-token-button');
    this.signOutButton = document.getElementById('demo-sign-out-button');
    this.responseContainer = document.getElementById('demo-response');
    this.responseContainerCookie = document.getElementById('demo-response-cookie');
    this.responseContainerCustomToken = document.getElementById('demo-response-custom-token');
    this.urlContainer = document.getElementById('demo-url');
    this.urlContainerCookie = document.getElementById('demo-url-cookie');
    this.urlContainerCustomToken = document.getElementById('demo-url-custom-token');
    this.helloUserUrl = window.location.href + 'hello';
    this.signedOutCard = document.getElementById('demo-signed-out-card');
    this.signedInCard = document.getElementById('demo-signed-in-card');
    this.customTokenUrl = window.location.href + 'custom_token';

    // Bind events.
    this.signInButton.addEventListener('click', this.signIn.bind(this));
    this.signInCustomTokenButton.addEventListener('click', this.signInCustomToken.bind(this));
    this.signOutButton.addEventListener('click', this.signOut.bind(this));
    firebase.auth().onAuthStateChanged(this.onAuthStateChanged.bind(this));

    // Try to sign-in with custom token in local storage.
    this.signInCustomTokenInLocalStorage();
  }.bind(this));
}

// Triggered on Firebase auth state change.
Demo.prototype.onAuthStateChanged = function(user) {
  if (user) {
    this.urlContainer.textContent = this.helloUserUrl;
    this.urlContainerCookie.textContent = this.helloUserUrl;
    this.urlContainerCustomToken.textContent = this.customTokenUrl;
    this.signedOutCard.style.display = 'none';
    this.signedInCard.style.display = 'block';
    this.startFunctionsRequest();
    this.startFunctionsCookieRequest();
    this.startFunctionsCustomTokenRequest();
  } else {
    this.signedOutCard.style.display = 'block';
    this.signedInCard.style.display = 'none';
  }
};

// Initiates the sign-in flow using GoogleAuthProvider sign in in a popup.
Demo.prototype.signIn = function() {
  firebase.auth().signInWithPopup(new firebase.auth.GoogleAuthProvider());
};

Demo.prototype.signInCustomToken = function() {
  var cookies = document.cookie;
  var cookiesArray = cookies.split(';');
  for (var c of cookiesArray) {
    var cArray = c.split('=');
    if (cArray[0] == 'custom_token') {
      firebase.auth().signInWithCustomToken(cArray[1])
      return
    }
  }
};

// Signs-out of Firebase.
Demo.prototype.signOut = function() {
  firebase.auth().signOut();
  // clear the __session cookie
  document.cookie = '__session=';

  if (navigator.userAgent.indexOf('Android') > 0) {
    // Send Signs-out message to Android
    alert("signOut");
  }

  if (navigator.userAgent.indexOf('iPhone') > 0 || navigator.userAgent.indexOf('iPad') > 0 || navigator.userAgent.indexOf('iPod') > 0) {
    // Send Signs-out message to iOS
    window.webkit.messageHandlers.signOut.postMessage("");
  }
};

// Does an authenticated request to a Firebase Functions endpoint using an Authorization header.
Demo.prototype.startFunctionsRequest = function() {
  firebase.auth().currentUser.getIdToken().then(function(token) {
    console.log('Sending request to', this.helloUserUrl, 'with ID token in Authorization header.');
    var req = new XMLHttpRequest();
    req.onload = function() {
      this.responseContainer.innerText = req.responseText;
    }.bind(this);
    req.onerror = function() {
      this.responseContainer.innerText = 'There was an error';
    }.bind(this);
    req.open('GET', this.helloUserUrl, true);
    req.setRequestHeader('Authorization', 'Bearer ' + token);
    req.send();
  }.bind(this));
};

// Does an authenticated request to a Firebase Functions endpoint using a __session cookie.
Demo.prototype.startFunctionsCookieRequest = function() {
  // Set the __session cookie.
  firebase.auth().currentUser.getIdToken(true).then(function(token) {
    // set the __session cookie
    document.cookie = '__session=' + token + ';max-age=3600';

    console.log('Sending request to', this.helloUserUrl, 'with ID token in __session cookie.');
    var req = new XMLHttpRequest();
    req.onload = function() {
      this.responseContainerCookie.innerText = req.responseText;
    }.bind(this);
    req.onerror = function() {
      this.responseContainerCookie.innerText = 'There was an error';
    }.bind(this);
    req.open('GET', this.helloUserUrl, true);
    req.send();
  }.bind(this));
};

Demo.prototype.startFunctionsCustomTokenRequest = function() {
  firebase.auth().currentUser.getIdToken().then(function(token) {
    console.log('Sending request to', this.customTokenUrl, 'with ID token in Authorization header.');
    var req = new XMLHttpRequest();
    req.onload = function() {
      this.responseContainerCustomToken.innerText = req.responseText;
    }.bind(this);
    req.onerror = function() {
      this.responseContainerCustomToken.innerText = 'There was an error';
    }.bind(this);
    req.open('GET', this.customTokenUrl, true);
    req.setRequestHeader('Authorization', 'Bearer ' + token);
    req.send();
  }.bind(this));
};

Demo.prototype.signInCustomTokenInLocalStorage = function() {
  var customToken = localStorage.getItem("custom_token");
  if (customToken) {
    firebase.auth().signInWithCustomToken(customToken)
  }
};

// Load the demo.
window.demo = new Demo();
