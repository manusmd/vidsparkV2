import { auth } from "firebase-functions/v1";
import { Timestamp } from "firebase-admin/firestore";
import { db } from "../../firebaseConfig";
import * as admin from "firebase-admin";

export const syncNewUserToFirestore = auth.user().onCreate(async (user) => {
  const { uid, email } = user;
  const defaultRoles = ["user"];

  try {
    // Set custom claims on the user.
    await admin.auth().setCustomUserClaims(uid, { roles: defaultRoles });

    // Create the Firestore document for the user, including the roles.
    await db.collection("users").doc(uid).set({
      uid,
      email,
      roles: defaultRoles,
      createdAt: Timestamp.now(),
    });
    console.log(
      `Created Firestore document and set custom claims for user: ${uid}`,
    );
  } catch (error) {
    console.error(`Error processing user ${uid}:`, error);
  }
});
