export const adminEnvironment = {
  firebaseProjectId: process.env.FIREBASE_PROJECT_ID ?? "",
  firebasePrivateKey: process.env.FIREBASE_PRIVATE_KEY
    ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n")
    : "",
  firebaseClientEmail: process.env.FIREBASE_CLIENT_EMAIL ?? "",
} as const;
