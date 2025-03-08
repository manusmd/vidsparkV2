import {
  cert,
  initializeApp,
  getApps,
  ServiceAccount,
} from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";
import serviceAccount from "./serviceAccount.json";
import { getFunctions } from "firebase-admin/functions";

const app =
  getApps().length === 0
    ? initializeApp({ credential: cert(serviceAccount as ServiceAccount) })
    : getApps()[0];

const db = getFirestore(app);
const auth = getAuth(app);
const functions = getFunctions();

export { db, auth, functions };
