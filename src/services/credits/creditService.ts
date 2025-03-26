import { db } from "@/lib/firebase";
import {
  collection,
  doc,
  getDoc,
  updateDoc,
  addDoc,
  query,
  where,
  orderBy,
  getDocs,
  Timestamp,
  increment,
  serverTimestamp,
} from "firebase/firestore";

export interface UserCredits {
  availableCredits: number;
  lifetimeCredits: number;
  creditsExpiration?: Timestamp;
  plan: "free" | "pro" | "business";
}

export interface CreditTransaction {
  userId: string;
  amount: number;
  balance: number;
  type: "purchase" | "usage" | "refund" | "expiration" | "plan_allocation";
  description: string;
  resourceId?: string;
  resourceType?: string;
  createdAt: Timestamp;
  paymentId?: string;
}

export interface CreditPackage {
  id: string;
  name: string;
  credits: number;
  price: number;
  stripePriceId: string;
  isActive: boolean;
  type: "one-time" | "recurring";
  interval?: "month" | "year";
  sortOrder: number;
}

export async function getUserCredits(userId: string): Promise<UserCredits> {
  if (!db) throw new Error("Firebase not initialized");

  const userRef = doc(db, "users", userId);
  const userDoc = await getDoc(userRef);

  if (!userDoc.exists()) {
    throw new Error("User not found");
  }

  const userData = userDoc.data();

  const creditsValue =
    userData.credits !== undefined
      ? userData.credits
      : userData.availableCredits;

  if (creditsValue === undefined) {
    const defaultCredits: UserCredits = {
      availableCredits: 0,
      lifetimeCredits: 0,
      plan: "free",
    };

    await updateDoc(userRef, {
      availableCredits: defaultCredits.availableCredits,
      lifetimeCredits: defaultCredits.lifetimeCredits,
      plan: defaultCredits.plan
    });
    return defaultCredits;
  }

  return {
    availableCredits: creditsValue || 0,
    lifetimeCredits: userData.lifetimeCredits || 0,
    creditsExpiration: userData.creditsExpiration,
    plan: userData.plan || "free",
  };
}

// Add credits to user's account
export async function addCredits(
  userId: string,
  amount: number,
  type: CreditTransaction["type"],
  description: string,
  paymentId?: string,
): Promise<void> {
  if (!db) return;
  const userRef = doc(db, "users", userId);
  const userDoc = await getDoc(userRef);

  if (!userDoc.exists()) {
    throw new Error("User not found");
  }

  const userData = userDoc.data();
  // Check for credits property first, then fallback to availableCredits
  const currentCredits =
    userData.credits !== undefined
      ? userData.credits
      : userData.availableCredits || 0;
  const newBalance = currentCredits + amount;

  // Update user document with both credits and availableCredits for backward compatibility
  await updateDoc(userRef, {
    credits: newBalance,
    availableCredits: newBalance,
    lifetimeCredits: increment(amount),
  });

  // Create transaction record
  await addDoc(collection(db, "credits_transactions"), {
    userId,
    amount,
    balance: newBalance,
    type,
    description,
    createdAt: serverTimestamp(),
    paymentId,
  });
}

// Deduct credits for an operation
export async function deductCredits(
  userId: string,
  amount: number,
  operation: string,
  resourceId?: string,
  resourceType?: string,
): Promise<boolean> {
  if (!db) throw new Error("Firebase not initialized");

  const userRef = doc(db, "users", userId);
  const userDoc = await getDoc(userRef);

  if (!userDoc.exists()) {
    throw new Error("User not found");
  }

  const userData = userDoc.data();
  // Check for credits property first, then fallback to availableCredits
  const currentCredits =
    userData.credits !== undefined
      ? userData.credits
      : userData.availableCredits || 0;

  if (currentCredits < amount) {
    return false; // Not enough credits
  }

  const newBalance = currentCredits - amount;

  // Update user document with both credits and availableCredits for backward compatibility
  await updateDoc(userRef, {
    credits: newBalance,
    availableCredits: newBalance,
  });

  // Create transaction record
  await addDoc(collection(db, "credits_transactions"), {
    userId,
    amount: -amount,
    balance: newBalance,
    type: "usage",
    description: operation,
    resourceId,
    resourceType,
    createdAt: serverTimestamp(),
  });

  return true;
}

// Check if user has enough credits
export async function hasEnoughCredits(
  userId: string,
  amount: number,
): Promise<boolean> {
  const userCredits = await getUserCredits(userId);
  return userCredits.availableCredits >= amount;
}

// Get user's credit transactions
export async function getUserTransactions(
  userId: string,
): Promise<CreditTransaction[]> {
  if (!db) throw new Error("Firebase not initialized");

  const transactionsRef = collection(db, "credits_transactions");
  const q = query(
    transactionsRef,
    where("userId", "==", userId),
    orderBy("createdAt", "desc"),
  );

  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map((doc) => ({
    ...(doc.data() as CreditTransaction),
    id: doc.id,
  }));
}

// Allocate subscription credits based on plan
export async function allocateSubscriptionCredits(
  userId: string,
  plan: string,
): Promise<void> {
  let creditsToAdd = 0;

  switch (plan) {
    case "free":
      creditsToAdd = 5;
      break;
    case "pro":
      creditsToAdd = 50;
      break;
    case "business":
      creditsToAdd = 200;
      break;
    default:
      creditsToAdd = 0;
  }

  if (creditsToAdd > 0) {
    await addCredits(
      userId,
      creditsToAdd,
      "plan_allocation",
      `Monthly credits for ${plan} plan`,
    );
  }
}

// Get all credit packages
export async function getCreditPackages(): Promise<CreditPackage[]> {
  if (!db) throw new Error("Firebase not initialized");

  const packagesRef = collection(db, "credit_packages");
  const q = query(
    packagesRef,
    where("isActive", "==", true),
    orderBy("sortOrder", "asc"),
  );

  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map((doc) => ({
    ...(doc.data() as CreditPackage),
    id: doc.id,
  }));
}
