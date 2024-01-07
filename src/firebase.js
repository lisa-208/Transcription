import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCPEgBL6Su4F6BFfojFk_luhHAF9HrNLD8",
  authDomain: "audiotranscriptionalapp-b6259.firebaseapp.com",
  projectId: "audiotranscriptionalapp-b6259",
  storageBucket: "audiotranscriptionalapp-b6259.appspot.com",
  messagingSenderId: "53727811328",
  appId: "1:53727811328:web:fe95e772212d8774ec85e5"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Get a reference to the storage service
const storage = getStorage(app);

// Get a reference to the Firestore service
const db = getFirestore(app);

export { storage, db };
