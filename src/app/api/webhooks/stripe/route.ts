import { NextRequest, NextResponse } from "next/server";
import { Stripe } from "stripe";
import { PLANS } from "@/app/app/settings/credits/constants";
import { doc, updateDoc, collection, addDoc, getFirestore, query, where, getDocs } from "firebase/firestore";
import { getFirebaseApp } from "@/lib/firebase";

// Initialize Stripe with API version
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: "2022-11-15" as Stripe.LatestApiVersion,
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || "";

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const signature = req.headers.get("stripe-signature") || "";

    // Verify webhook signature
    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      console.error("Webhook signature verification failed:", err);
      return NextResponse.json({ error: "Webhook signature verification failed" }, { status: 400 });
    }

    // Handle the event
    switch (event.type) {
      case "checkout.session.completed":
        await handleCheckoutSessionCompleted(event);
        break;
      case "customer.subscription.deleted":
        await handleSubscriptionDeleted(event);
        break;
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Error processing webhook:", error);
    return NextResponse.json(
      { error: "Failed to process webhook" },
      { status: 500 }
    );
  }
}

async function handleCheckoutSessionCompleted(event: Stripe.Event) {
  const session = event.data.object as Stripe.Checkout.Session;
  
  // Get the customer and line items
  const customerId = session.customer as string;
  const lineItems = await stripe.checkout.sessions.listLineItems(session.id);
  const priceId = lineItems.data[0]?.price?.id;

  if (!priceId) {
    console.error("No price ID found in session:", session);
    return;
  }

  // Find the plan that matches this price ID
  const matchedPlan = getPlanFromProductId(priceId);
  if (!matchedPlan) {
    console.error("No matching plan found for price ID:", priceId);
    return;
  }

  // Get the customer details
  const customer = await stripe.customers.retrieve(customerId);
  if (!customer || customer.deleted) {
    console.error("Customer not found or deleted:", customerId);
    return;
  }

  const customerEmail = customer.email;
  if (!customerEmail) {
    console.error("Customer has no email:", customer);
    return;
  }

  // Get Firestore instance
  const app = getFirebaseApp();
  const db = getFirestore(app);
  
  if (!db) {
    console.error("Firebase not initialized");
    return;
  }

  // Find or create user in our database
  const userSnapshot = await getDocs(
    query(collection(db, "users"), where("email", "==", customerEmail))
  );

  if (userSnapshot.empty) {
    // We could create a new user here, but typically they should already exist
    console.log("User not found with email:", customerEmail);
    return;
  }

  const userDoc = userSnapshot.docs[0];
  const userData = userDoc.data();
  const userId = userDoc.id;

  // Get current credits amount
  const currentCredits = userData.availableCredits || 0;
  const lifetimeCredits = userData.lifetimeCredits || 0;

  // Add the credits from the purchased plan
  const newAvailableCredits = currentCredits + matchedPlan.credits;
  const newLifetimeCredits = lifetimeCredits + matchedPlan.credits;

  // Update user with new credits and stripe info
  await updateDoc(doc(db, "users", userId), {
    availableCredits: newAvailableCredits,
    credits: newAvailableCredits, // For backward compatibility
    lifetimeCredits: newLifetimeCredits,
    stripeCustomerId: customerId,
    stripePriceId: priceId,
    hasActiveSubscription: true,
    lastPayment: new Date(),
  });

  // Record transaction
  await addDoc(collection(db, "credits_transactions"), {
    userId,
    amount: matchedPlan.credits,
    balance: newAvailableCredits,
    type: "purchase",
    description: `Purchased ${matchedPlan.name} plan`,
    createdAt: new Date(),
    paymentId: session.id,
  });

  console.log(`Added ${matchedPlan.credits} credits to user ${userId}`);
}

async function handleSubscriptionDeleted(event: Stripe.Event) {
  const subscription = event.data.object as Stripe.Subscription;
  const customerId = subscription.customer as string;

  // Get Firestore instance
  const app = getFirebaseApp();
  const db = getFirestore(app);
  
  if (!db) {
    console.error("Firebase not initialized");
    return;
  }

  // Find the user with this stripe customer ID
  const userSnapshot = await getDocs(
    query(collection(db, "users"), where("stripeCustomerId", "==", customerId))
  );

  if (userSnapshot.empty) {
    console.log("No user found with Stripe customer ID:", customerId);
    return;
  }

  const userDoc = userSnapshot.docs[0];
  const userId = userDoc.id;

  // Update user to revoke access
  await updateDoc(doc(db, "users", userId), {
    hasActiveSubscription: false,
  });

  console.log(`Subscription cancelled for user ${userId}`);
}

// Get plan based on product ID
function getPlanFromProductId(productId: string): {
  credits: number;
  name: string;
} | null {
  switch (productId) {
    case process.env.NEXT_PUBLIC_STRIPE_PRODUCT_ID_STARTER:
      return PLANS.STARTER;
    case process.env.NEXT_PUBLIC_STRIPE_PRODUCT_ID_PRO:
      return PLANS.PRO;
    case process.env.NEXT_PUBLIC_STRIPE_PRODUCT_ID_ENTERPRISE:
      return PLANS.ENTERPRISE;
    default:
      return null;
  }
}
