import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { addCredits } from "@/services/credits/creditService";
import {
  collection,
  query,
  where,
  getDocs,
  getFirestore,
} from "firebase/firestore";
import { getFirebaseApp } from "@/lib/firebase";

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-02-24.acacia",
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const signature = req.headers.get("stripe-signature") as string;

    // Verify the event is from Stripe
    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET!,
      );
    } catch (err) {
      console.error("Webhook signature verification failed:", err);
      return NextResponse.json(
        { error: "Webhook signature verification failed" },
        { status: 400 },
      );
    }

    // Handle the event
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;

      // Get the customer ID and price ID from the session
      const customerId = session.customer as string;
      const priceId = session.line_items?.data[0]?.price?.id;

      if (!priceId) {
        console.error("No price ID found in session:", session);
        return NextResponse.json(
          { error: "No price ID found in session" },
          { status: 400 },
        );
      }

      // Find the package with this price ID
      const app = getFirebaseApp();
      const db = getFirestore(app);
      const packagesRef = collection(db, "credit_packages");
      const q = query(packagesRef, where("stripePriceId", "==", priceId));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        console.error("No package found with price ID:", priceId);
        return NextResponse.json(
          { error: "No package found with this price ID" },
          { status: 400 },
        );
      }

      const packageDoc = querySnapshot.docs[0];
      const packageData = packageDoc.data();

      // Get the user ID from the customer ID
      // In Firebase, the customer ID is the user ID
      const userId = customerId;

      // Add credits to the user's account
      await addCredits(
        userId,
        packageData.credits,
        "purchase",
        `Purchased ${packageData.name} package`,
        session.id,
      );

      console.log(`Added ${packageData.credits} credits to user ${userId}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Error processing webhook:", error);
    return NextResponse.json(
      { error: "Failed to process webhook" },
      { status: 500 },
    );
  }
}
