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

const app =
  typeof window !== "undefined" ? initializeApp(firebaseConfig) : null;
const db = app ? getFirestore(app) : null;
const auth = app ? getAuth(app) : null;

const analytics =
  typeof window !== "undefined" &&
  app &&
  process.env.NEXT_PUBLIC_APP_ENV !== "emulator"
    ? getAnalytics(app)
    : null;

let payments = null;
try {
  if (app) {
    payments = getStripePayments(app, {
      productsCollection: "products",
      customersCollection: "customers",
    });
  }
} catch (error) {
  console.error("Error initializing Stripe payments:", error);
}

export const getFirebaseApp = () => {
  if (!app) {
    throw new Error("Firebase app is not initialized");
  }
  return app;
};

export { app, analytics, db, auth, payments };