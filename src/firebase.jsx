import { initializeApp } from "firebase/app";
import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  getFirestore,
  query,
  setDoc,
  where,
} from "firebase/firestore";
import {
  createUserWithEmailAndPassword,
  getAuth,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBp4sUFwck77gAF9Yqa6XgggV1gRrgGGhU",
  authDomain: "tsparks-b886a.firebaseapp.com",
  projectId: "tsparks-b886a",
  storageBucket: "tsparks-b886a.firebasestorage.app",
  messagingSenderId: "157003567295",
  appId: "1:157003567295:web:c4c1218da83831e0c8760a",
  measurementId: "G-NV7G756GR9",
};

// Initialize Firebase
const myApp = initializeApp(firebaseConfig);
const myDb = getFirestore(myApp);

const auth = getAuth();

async function addUserDetail(user, role) {
  const authRef = doc(myDb, "auth", user.uid);
  try {
    await setDoc(authRef, {
      role: role,
    });
    return true;
  } catch (error) {
    return false;
  }
}

async function getUserDetail(user, role) {
  const authRef = doc(myDb, "auth", user.uid);
  const docSnap = await getDoc(authRef);

  if (docSnap.exists()) {
    return docSnap.data().role === role;
  }
  return false;
}

async function createNewUser(email, password, role) {
  try {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    const userDetail = await addUserDetail(userCredential.user, role);
    if (userDetail) {
      return { status: "success", message: "logged in successfully" };
    } else {
      return { status: "error", message: "Couldnt add role" };
    }
  } catch (error) {
    const errorCode = error.code;
    const errorMessage = error.message;
    return { status: "error", message: errorMessage };
  }
}

async function signInUser(email, password, role) {
  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );
    const userDetail = await getUserDetail(userCredential.user, role);
    if (userDetail) {
      return { status: "success", message: "logged in successfully" };
    } else {
      return { status: "error", message: "Role didn't match" };
    }
  } catch (error) {
    const errorCode = error.code;
    const errorMessage = error.message;
    return { status: "error", message: errorMessage };
  }
}

// createNewUser("joelrai910@gmail.com", "rememberme?", "Upper Management");

async function getDocsFromDb(collectionName) {
  const q = query(collection(myDb, collectionName));
  const querySnapshot = await getDocs(q);

  const jobListings = [];

  querySnapshot.forEach((doc) => {
    jobListings.push(doc.data());
  });

  return jobListings;
}

async function addDocsToDb(collectionName, data) {
  const docRef = await addDoc(collection(myDb, collectionName), data);
  console.log("Document written with ID: ", docRef.id);
  return docRef.id;
}
export { createNewUser, signInUser, getDocsFromDb, addDocsToDb };
