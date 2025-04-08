"use client";
import React, { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useCredits } from "@/hooks/useCredits";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ReloadIcon } from "@radix-ui/react-icons";
import { BsCreditCard } from "react-icons/bs";
import { Button } from "@/components/ui/button";
import CustomerPortal from "./customer-portal";
import { useRouter } from "next/navigation";
import ROUTES from "@/lib/routes";
import { useStripePayments } from "@/hooks/useStripePayments";

// Define a type for the Stripe product
interface StripeProduct {
  id: string;
  name?: string;
  description?: string;
  metadata?: {
    credits?: string;
    popular?: string;
    [key: string]: string | undefined;
  };
}

export default function CreditsPage() {
  const { user } = useAuth();
  const { credits, creditsLoading } = useCredits();
  const { products, prices, isLoading: productsLoading, createCheckoutSession } = useStripePayments();
  const [billingInterval, setBillingInterval] = useState<"month" | "year">("month");
  const [processingPriceId, setProcessingPriceId] = useState<string | null>(null);
  const router = useRouter();

  // Filter products by billing interval
  const filteredPrices = prices.filter(price => 
    price.type === 'recurring' && 
    price.recurring?.interval === billingInterval
  );
  
  // Group prices by product
  const productsByInterval = filteredPrices.map(price => {
    const product = products.find(p => p.id === price.product_id);
    return {
      priceId: price.id,
      price: price.unit_amount / 100,
      interval: price.recurring?.interval || '',
      name: product?.name || '',
      description: product?.description || '',
      features: getProductFeatures(product),
      popular: product?.metadata?.popular === 'true'
    };
  });

  // Extract features from product metadata
  function getProductFeatures(product: StripeProduct | undefined) {
    const features: string[] = [];
    
    if (product?.metadata?.credits) {
      features.push(`${product.metadata.credits} Credits`);
    }
    
    features.push('All VidSpark Features');
    features.push(`${billingInterval === 'month' ? 'Monthly' : 'Yearly'} Billing`);
    
    if (billingInterval === 'year') {
      features.push('Save 16%');
    }
    
    return features;
  }

  // Handle subscription
  const handleSubscribe = async (priceId: string) => {
    if (!user) {
      // If not logged in, redirect to sign in page
      router.push(ROUTES.PAGES.AUTH.SIGNIN);
      return;
    }
    
    try {
      setProcessingPriceId(priceId);
      // Create checkout session and redirect to Stripe
      const checkoutUrl = await createCheckoutSession(priceId);
      window.location.href = checkoutUrl;
    } catch (error) {
      console.error("Error creating checkout session:", error);
      alert("Failed to create checkout session. Please try again.");
    } finally {
      setProcessingPriceId(null);
    }
  };

  if (creditsLoading || productsLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <ReloadIcon className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8">Credits Management</h1>

      {/* Credits Overview */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Your Credits</CardTitle>
          <CardDescription>
            Use credits to create and publish videos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="p-4 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full">
              <BsCreditCard className="h-8 w-8 text-white" />
            </div>
            <div>
              <div className="text-3xl font-bold">
                {credits?.availableCredits || 0} Credits
              </div>
              <div className="text-sm text-muted-foreground">
                Lifetime: {credits?.lifetimeCredits || 0} Credits
              </div>
            </div>
          </div>
          {user && (
            <div className="mt-4 flex justify-end">
              <CustomerPortal />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pricing Section */}
      <div className="my-8">
        <h2 className="text-2xl font-bold mb-4">Get More Credits</h2>
        
        {/* Billing Interval Toggle */}
        <div className="flex justify-center mb-8">
          <div className="bg-muted inline-flex p-1 rounded-lg">
            <button
              onClick={() => setBillingInterval("month")}
              className={`px-4 py-2 rounded-md ${
                billingInterval === "month" 
                  ? "bg-primary text-primary-foreground" 
                  : "hover:bg-muted-foreground/10"
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingInterval("year")}
              className={`px-4 py-2 rounded-md ${
                billingInterval === "year" 
                  ? "bg-primary text-primary-foreground" 
                  : "hover:bg-muted-foreground/10"
              }`}
            >
              Yearly
            </button>
          </div>
        </div>
        
        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
          {productsByInterval.map((plan) => (
            <Card key={plan.priceId} className={`overflow-hidden ${plan.popular ? 'border-primary' : ''}`}>
              {plan.popular && (
                <div className="bg-primary text-primary-foreground text-center py-2">
                  <p className="text-sm font-medium">Most Popular</p>
                </div>
              )}
              <CardHeader>
                <CardTitle>{plan.name}</CardTitle>
                <CardDescription>
                  {plan.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <span className="text-3xl font-bold">${plan.price.toFixed(2)}</span>
                  <span className="text-muted-foreground">/{plan.interval}</span>
                </div>
                
                <ul className="space-y-2 mb-6">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-center">
                      <svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        width="24" 
                        height="24" 
                        viewBox="0 0 24 24" 
                        fill="none" 
                        stroke="currentColor" 
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="w-5 h-5 mr-2 text-green-500"
                      >
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      {feature}
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button 
                  className="w-full" 
                  onClick={() => handleSubscribe(plan.priceId)}
                  disabled={processingPriceId === plan.priceId}
                >
                  {processingPriceId === plan.priceId ? (
                    <>
                      <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    'Subscribe'
                  )}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
