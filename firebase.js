import * as firebase from 'firebase'

let config = {
  apiKey: "YOUR_API_KEY",
    authDomain: "",
    databaseURL: "",
    projectId: "",
    storageBucket: "",
    messagingSenderId: ""
};
firebase.initializeApp(config);


export default firebase;