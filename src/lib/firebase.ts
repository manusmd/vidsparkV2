import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { environment } from "./environment";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStripePayments } from "@invertase/firestore-stripe-payments";

export const firebaseConfig = {
  apiKey: environment.firebaseApiKey,
  authDomain: environment.firebaseAuthDomain,
  projectId: environment.firebaseProjectId,
  storageBucket: environment.firebaseStorageBucket,
  messagingSenderId: environment.firebaseMessagingSenderId,
  appId: environment.firebaseAppId,
  measurementId: environment.firebaseMeasurementId,
};

const app = initializeApp(firebaseConfig);

const db = getFirestore(app);
/*
const storage = getStorage(app);
*/
const auth = getAuth(app);
/*
const functions = getFunctions(app);
*/

/* Emulator connection logic is commented out
if (process.env.NEXT_PUBLIC_APP_ENV === "emulato") {
  // Use emulator settings for Firestore
  const firestorePath =
    process.env.NEXT_PUBLIC_EMULATOR_FIRESTORE_PATH || "localhost:8080";
  const [firestoreHost, firestorePort] = firestorePath.split(":");
  connectFirestoreEmulator(db, firestoreHost, parseInt(firestorePort, 10));

  // Use emulator settings for Auth
  const authPath =
    process.env.NEXT_PUBLIC_EMULATOR_AUTH_PATH || "localhost:9099";
  const [authHost, authPort] = authPath.split(":");
  connectAuthEmulator(auth, `http://${authHost}:${authPort}`, {
    disableWarnings: true,
  });

  // Use emulator settings for Storage
  const storagePath =
    process.env.NEXT_PUBLIC_EMULATOR_STORAGE_PATH || "localhost:9199";
  const [storageHost, storagePort] = storagePath.split(":");
  connectStorageEmulator(storage, storageHost, parseInt(storagePort, 10));

  // Use emulator settings for Functions
  const functionsPath =
    process.env.NEXT_PUBLIC_EMULATOR_FUNCTIONS_PATH || "localhost:5001";
  const [functionHost, functionPort] = functionsPath.split(":");
  connectFunctionsEmulator(functions, functionHost, parseInt(functionPort, 10));
}
*/

const analytics =
  typeof window !== "undefined" &&
  process.env.NEXT_PUBLIC_APP_ENV !== "emulator"
    ? getAnalytics(app)
    : null;

const payments = getStripePayments(app, {
  productsCollection: "products",
  customersCollection: "customers",
});

export { app, analytics, db, auth, payments };
