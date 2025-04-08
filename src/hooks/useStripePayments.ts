"use client";

import { useState, useEffect } from "react";
import { useAuth } from "./useAuth";
import { db } from "@/lib/firebase";
import { collection, addDoc, onSnapshot, query, where, getDocs, doc, setDoc } from "firebase/firestore";
// Temporarily remove Firebase Functions imports causing build errors
// import { getFunctions, httpsCallable } from "firebase/functions";

// Define types for Stripe products and prices
export interface StripePrice {
  id: string;
  product_id: string;
  active: boolean;
  currency: string;
  description: string;
  type: 'one_time' | 'recurring';
  unit_amount: number;
  recurring?: {
    interval: 'day' | 'week' | 'month' | 'year';
    interval_count: number;
  };
}

export interface StripeProduct {
  id: string;
  active: boolean;
  description: string;
  name: string;
  images: string[];
  metadata: Record<string, string>;
  prices?: StripePrice[];
}

export interface Subscription {
  id: string;
  status: 'trialing' | 'active' | 'canceled' | 'incomplete' | 'incomplete_expired' | 'past_due' | 'unpaid';
  created: number;
  current_period_start: number;
  current_period_end: number;
  ended_at: number | null;
  cancel_at: number | null;
  canceled_at: number | null;
  price_id: string;
  product_id: string;
  prices: StripePrice[];
}

export function useStripePayments() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [products, setProducts] = useState<StripeProduct[]>([]);
  const [prices, setPrices] = useState<StripePrice[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [checkoutSessionProcessing, setCheckoutSessionProcessing] = useState(false);

  // Get active products and prices from Firestore
  useEffect(() => {
    if (!db) {
      console.error("Firestore not initialized");
      return;
    }
    
    setIsLoading(true);
    const q = query(collection(db, "products"), where("active", "==", true));

    const unsubscribe = onSnapshot(q, async (querySnapshot) => {
      const products = await Promise.all(
        querySnapshot.docs.map(async (doc) => {
          const product = {
            id: doc.id,
            ...doc.data(),
          } as StripeProduct;
          
          // Get the prices for this product
          const pricesSnapshot = await getDocs(query(
            collection(doc.ref, "prices"), 
            where("active", "==", true)
          ));

          const prices = pricesSnapshot.docs.map((doc) => ({
            id: doc.id,
            product_id: product.id,
            ...doc.data(),
          })) as StripePrice[];

          product.prices = prices;
          return product;
        })
      );

      setProducts(products);
      
      // Create a flat list of prices for easier lookup
      const allPrices = products.reduce((acc, product) => {
        return [...acc, ...(product.prices || [])];
      }, [] as StripePrice[]);
      
      setPrices(allPrices);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Get user subscriptions
  useEffect(() => {
    if (!user || !db) {
      setSubscriptions([]);
      return;
    }

    const q = query(
      collection(db, "customers", user.uid, "subscriptions"),
      where("status", "in", ["trialing", "active"])
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const subs = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Subscription[];
      
      setSubscriptions(subs);
    });

    return () => unsubscribe();
  }, [user]);

  // Create a checkout session
  const createCheckoutSession = async (priceId: string) => {
    if (!user) {
      throw new Error("User must be logged in");
    }
    
    if (!db) {
      throw new Error("Firestore not initialized");
    }

    setCheckoutSessionProcessing(true);
    
    try {
      // First ensure the customer document exists
      // This step helps when the Stripe customer record doesn't exist yet
      try {
        const customerDocRef = doc(db, "customers", user.uid);
        await setDoc(customerDocRef, {
          app_metadata: {
            provider: "email",
          },
          email: user.email || "",
          uid: user.uid,
        }, { merge: true });
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (_error) {
        console.log("Customer document already exists or couldn't be created");
      }
      
      // Add a document to the checkout_sessions collection
      const checkoutSessionRef = collection(db, "customers", user.uid, "checkout_sessions");
      const docRef = await addDoc(checkoutSessionRef, {
        price: priceId,
        success_url: window.location.origin,
        cancel_url: window.location.origin,
        metadata: {
          uid: user.uid,
        },
      });

      // Listen for changes to the document
      return new Promise<string>((resolve, reject) => {
        const unsubscribe = onSnapshot(docRef, (snap) => {
          const data = snap.data();
          if (!data) return;

          if (data.error) {
            unsubscribe();
            reject(new Error(data.error.message));
          }

          if (data.url) {
            unsubscribe();
            resolve(data.url);
          }
        });

        // Set a timeout to prevent hanging
        setTimeout(() => {
          unsubscribe();
          reject(new Error("Timeout creating checkout session"));
        }, 10000);
      });
    } finally {
      setCheckoutSessionProcessing(false);
    }
  };

  // Create a Stripe Customer Portal session
  // Temporarily use a simpler approach that doesn't require Firebase Functions
  const createPortalSession = async () => {
    if (!user) {
      throw new Error("User must be logged in");
    }
    
    if (!db) {
      throw new Error("Firestore not initialized");
    }

    try {
      // First ensure the customer document exists
      try {
        const customerDocRef = doc(db, "customers", user.uid);
        await setDoc(customerDocRef, {
          app_metadata: {
            provider: "email",
          },
          email: user.email || "",
          uid: user.uid,
        }, { merge: true });
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (_error) {
        console.log("Customer document already exists or couldn't be created");
      }
      
      // Create a portal-sessions document in Firestore
      // This is similar to how checkout sessions work
      const portalSessionRef = collection(db, "customers", user.uid, "portal-sessions");
      const docRef = await addDoc(portalSessionRef, {
        return_url: window.location.origin,
      });

      // Listen for changes to the document
      return new Promise<string>((resolve, reject) => {
        const unsubscribe = onSnapshot(docRef, (snap) => {
          const data = snap.data();
          if (!data) return;

          if (data.error) {
            unsubscribe();
            reject(new Error(data.error.message));
          }

          if (data.url) {
            unsubscribe();
            resolve(data.url);
          }
        });

        // Set a timeout to prevent hanging
        setTimeout(() => {
          unsubscribe();
          reject(new Error("Timeout creating portal session"));
        }, 10000);
      });
    } catch (error) {
      console.error("Error creating portal session:", error);
      throw error;
    }
  };

  // Check if user has an active subscription
  const hasActiveSubscription = () => {
    return subscriptions.length > 0;
  };

  return {
    products,
    prices,
    subscriptions,
    isLoading,
    checkoutSessionProcessing,
    createCheckoutSession,
    createPortalSession,
    hasActiveSubscription,
  };
} 