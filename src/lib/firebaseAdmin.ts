import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";
import { getFunctions } from "firebase-admin/functions";
import { adminEnvironment } from "@/lib/adminEnvironment";

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
const auth = getAuth(app);
const functions = getFunctions();

export { db, auth, functions };
