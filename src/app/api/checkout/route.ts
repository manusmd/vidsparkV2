import { NextResponse } from "next/server";
import { db } from "@/lib/firebaseAdmin";
import { withAuth } from "@/lib/api/middleware/withAuth";

export const POST = withAuth(async (req: Request, _context, userId) => {
  try {
    // Get the price ID from the request body
    const { priceId } = await req.json();

    if (!priceId) {
      return NextResponse.json(
        { error: "Price ID is required" },
        { status: 400 },
      );
    }

    // Create a checkout session in Firestore
    const checkoutSessionRef = db
      .collection("customers")
      .doc(userId)
      .collection("checkout_sessions");

    const docRef = await checkoutSessionRef.add({
      price: priceId,
      success_url: req.headers.get("origin") || "https://vidspark.app",
      cancel_url: req.headers.get("origin") || "https://vidspark.app",
    });

    // Wait for the checkout session to be created by the Firebase extension
    // We need to poll for the URL since we can't use onSnapshot in a server environment
    let attempts = 0;
    const maxAttempts = 10;
    const delay = 500; // 500ms

    while (attempts < maxAttempts) {
      const docSnapshot = await docRef.get();
      const data = docSnapshot.data();

      if (data?.url) {
        return NextResponse.json({ checkoutUrl: data.url });
      }

      if (data?.error) {
        return NextResponse.json(
          { error: `Error creating checkout session: ${data.error.message}` },
          { status: 500 },
        );
      }

      // Wait before trying again
      await new Promise((resolve) => setTimeout(resolve, delay));
      attempts++;
    }

    return NextResponse.json(
      { error: "Timeout waiting for checkout session" },
      { status: 500 },
    );
  } catch (error) {
    console.error("Error creating checkout session:", error);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 },
    );
  }
});
