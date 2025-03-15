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
  updateDoc,
  arrayRemove,
  where,
  deleteDoc,
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

async function getDocsFromDb(collectionName) {
  const q = query(collection(myDb, collectionName));
  const querySnapshot = await getDocs(q);

  const jobListings = [];

  querySnapshot.forEach((doc) => {
    jobListings.push({ id: doc.id, ...doc.data() });
  });

  return jobListings;
}

async function addDocsToDb(collectionName, data) {
  const docRef = await addDoc(collection(myDb, collectionName), data);
  console.log("Document written with ID: ", docRef.id);
  return docRef.id;
}

async function updateDocInDb(collectionName, docId, data) {
  const docRef = doc(myDb, collectionName, docId);
  await updateDoc(docRef, data);
}

async function deleteDocFromDb(collectionName, docId) {
  const docRef = doc(myDb, collectionName, docId);
  await deleteDoc(docRef);
}

async function updateJobApplication(jobId, applicationId, status) {
  const jobRef = doc(myDb, "JobListings", jobId);
  await updateDoc(jobRef, {
    Applications: arrayRemove(applicationId),
  });

  const applicationRef = doc(myDb, "JobApplications", applicationId);
  await updateDoc(applicationRef, {
    Status: status,
  });
}

async function getRandomUsers(count) {
  const users = await getDocsFromDb("Users");
  const shuffled = users.sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

async function createJobWithApplications(jobData) {
  // Create the job first
  const jobId = await addDocsToDb("JobListings", {
    ...jobData,
    Applications: [],
  });

  // Get 3-7 random users
  const randomCount = Math.floor(Math.random() * 5) + 3;
  const applicants = await getRandomUsers(randomCount);
  const applicationIds = [];

  // Create applications for each random user
  for (const user of applicants) {
    const applicationId = await addDocsToDb("JobApplications", {
      UserID: user.id,
      JobID: jobId,
      Status: "Pending",
    });
    applicationIds.push(applicationId);
  }

  // Update job with application IDs
  const jobRef = doc(myDb, "JobListings", jobId);
  await updateDoc(jobRef, {
    Applications: applicationIds,
  });

  return jobId;
}

export {
  createNewUser,
  signInUser,
  getDocsFromDb,
  addDocsToDb,
  updateDocInDb,
  deleteDocFromDb,
  updateJobApplication,
  createJobWithApplications,
};
