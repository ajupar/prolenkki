// firebase.js

import firebase from 'firebase/app';
import config from '../config.js';  // config file for sensitive data, not included in Git

import 'firebase/auth';
import 'firebase/firestore';
import 'firebase/storage';


  const fire = firebase.initializeApp({
    apiKey: config.API_KEY,
    authDomain: config.AUTH_DOMAIN,
    projectId: config.PROJECT_ID,
    storageBucket: config.STORAGE_BUCKET,
    messagingSenderId: config.MESSAGING_SENDER_ID,
    appId: config.APP_ID
  });



export const auth = fire.auth();

export const db = fire.firestore();

export default {
  fire,
};