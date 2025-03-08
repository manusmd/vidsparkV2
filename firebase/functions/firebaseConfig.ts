import { initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";
import { getFunctions } from "firebase-admin/functions";

initializeApp();

const db = getFirestore();
const storage = getStorage().bucket();
const functions = getFunctions();

export { db, storage, functions };
