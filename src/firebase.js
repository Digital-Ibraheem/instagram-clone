import firebase from 'firebase'

const firebaseApp = firebase.initializeApp({
    apiKey: "AIzaSyDPlOjQM5BdWSyqW-5lWu6GbfD3rj0Ni5s",
    authDomain: "instagram-clone-bc483.firebaseapp.com",
    projectId: "instagram-clone-bc483",
    storageBucket: "instagram-clone-bc483.appspot.com",
    messagingSenderId: "1083192529620",
    appId: "1:1083192529620:web:054f8abe9e4deb1f1e6141",
    measurementId: "G-WCD514XX5H"
})

const db = firebaseApp.firestore()
// database
const auth = firebase.auth()
// authentication
const storage = firebase.storage()
// storage

export { db, auth, storage }