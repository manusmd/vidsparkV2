import { NextResponse } from "next/server";
import { getFirebaseApp } from "@/lib/firebase";
import {
  doc,
  getDoc,
  getFirestore,
  addDoc,
  collection,
  onSnapshot,
} from "firebase/firestore";
import { withAuth } from "@/lib/api/middleware/withAuth";

// Server-side function to create a checkout session
const createServerCheckoutSession = async (
  userId: string,
  priceId: string,
  successUrl: string = "https://vidspark.app",
  cancelUrl: string = "https://vidspark.app",
): Promise<string> => {
  const app = getFirebaseApp();
  const db = getFirestore(app);

  // Create a checkout session in Firestore
  const checkoutSessionRef = collection(
    db,
    "customers",
    userId,
    "checkout_sessions",
  );

  const docRef = await addDoc(checkoutSessionRef, {
    price: priceId,
    success_url: successUrl,
    cancel_url: cancelUrl,
  });

  // Wait for the checkout session to be created by the Firebase extension
  return new Promise<string>((resolve, reject) => {
    // Set up a listener for the document
    const unsubscribe = onSnapshot(doc(checkoutSessionRef, docRef.id),
      (snap) => {
        const data = snap.data();
        if (!data) return;

        if (data.error) {
          unsubscribe();
          reject(
            new Error(`Error creating checkout session: ${data.error.message}`),
          );
        }

        if (data.url) {
          unsubscribe();
          resolve(data.url);
        }
      },
      (error) => {
        unsubscribe();
        reject(error);
      },
    );

    // Set a timeout to prevent hanging
    setTimeout(() => {
      unsubscribe();
      reject(new Error("Timeout waiting for checkout session"));
    }, 10000);
  });
};

export const POST = withAuth(async (req: Request, _context, userId) => {
  try {
    // Get the package ID from the request body
    const { packageId } = await req.json();
    if (!packageId) {
      return NextResponse.json(
        { error: "Package ID is required" },
        { status: 400 },
      );
    }

    // Get the package details from Firestore
    const app = getFirebaseApp();
    const db = getFirestore(app);
    const packageRef = doc(db, "credit_packages", packageId);
    const packageDoc = await getDoc(packageRef);

    if (!packageDoc.exists()) {
      return NextResponse.json({ error: "Package not found" }, { status: 404 });
    }

    const packageData = packageDoc.data();
    if (!packageData.isActive) {
      return NextResponse.json(
        { error: "Package is not available" },
        { status: 400 },
      );
    }

    // Create a Stripe checkout session using the server-side function
    const checkoutUrl = await createServerCheckoutSession(
      userId,
      packageData.stripePriceId,
      `${req.headers.get("origin") || "https://vidspark.app"}`,
      `${req.headers.get("origin") || "https://vidspark.app"}`,
    );

    return NextResponse.json({ checkoutUrl });
  } catch (error) {
    console.error("Error creating checkout session:", error);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 },
    );
  }
});
