import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getAuth as firebaseGetAuth } from "firebase-admin/auth";
import { getFunctions } from "firebase-admin/functions";
import { adminEnvironment } from "@/lib/adminEnvironment";
import { getStorage } from "firebase-admin/storage";

const app =
  getApps().length === 0
    ? initializeApp({
        credential: cert({
          privateKey: adminEnvironment.firebasePrivateKey,
          projectId: adminEnvironment.firebaseProjectId,
          clientEmail: adminEnvironment.firebaseClientEmail,
        }),
      })
    : getApps()[0];

const db = getFirestore(app);
const auth = firebaseGetAuth(app);
const storage = getStorage(app);
const functions = getFunctions();

// Function to return the auth instance for compatibility with API routes
const getAuth = () => auth;

export { db, auth, functions, storage, getAuth };
