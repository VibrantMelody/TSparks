require("dotenv").config();
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

const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID,
  measurementId: process.env.FIREBASE_MEASUREMENT_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const myDb = getFirestore(app);

async function getDocsFromDb(collectionName) {
  const q = query(collection(myDb, collectionName));
  const querySnapshot = await getDocs(q);

  const docs = [];

  querySnapshot.forEach((doc) => {
    docs.push({ id: doc.id, ...doc.data() });
  });

  return docs;
}

async function createNewUser(
  firstName,
  lastName,
  email,
  password,
  role,
  setDialog,
) {
  try {
    const docs = await getDocsFromDb("Auth");
    if (docs.find((doc) => doc.id === email)) {
      if (docs.find((doc) => doc.Role === role)) {
        setDialog({ trigger: true, message: "User already exists" });
        return false;
      }
    }

    await setDoc(doc(myDb, "Auth", email), {
      FirstName: firstName,
      LastName: lastName,
      Email: email,
      Password: password,
      Role: role,
    });

    return true;
  } catch (err) {
    console.error("Error creating new user: ", err);
    setDialog({ trigger: true, message: "Error creating user" });
  }
}

async function signInUser(email, password, role, setDialog) {
  try {
    const docs = await getDocsFromDb("Auth");
    const user = docs.find((doc) => doc.Email === email);
    if (!user) {
      console.error("User not found, please recheck your email");
      setDialog({
        trigger: true,
        message: "User not found, please recheck your email",
      });
      return false;
    }

    if (user.Password !== password) {
      console.error("Incorrect password");
      setDialog({ trigger: true, message: "Incorrect password" });
      return false;
    }

    if (user.Role !== role) {
      console.error("Incorrect role");
      setDialog({ trigger: true, message: "Incorrect role" });
      return false;
    }

    return { returnID: true, user: "Cvb85xRowQt0xm2QJx9B" };
  } catch (error) {
    console.error("Error signing in user: ", error);
    setDialog({ trigger: true, message: "Error signing in user" });
    return false;
  }
}

async function addDocsToDb(collectionName, data) {
  try {
    const docRef = await addDoc(collection(myDb, collectionName), data);
    console.log("Document written with ID: ", docRef.id);
    return docRef.id;
  } catch (error) {
    console.error("Error adding document: ", error);
  }
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
