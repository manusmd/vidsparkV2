import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Sparkles, X } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import ROUTES from "@/lib/routes";
import { motion, AnimatePresence } from "framer-motion";
import { useStripePayments } from "@/hooks/useStripePayments";

export default function CustomPricingTable() {
  const { products, prices, isLoading, checkoutSessionProcessing, createCheckoutSession } = useStripePayments();
  const { user } = useAuth();
  const router = useRouter();
  const [processingPriceId, setProcessingPriceId] = useState<string | null>(null);
  const [selectedTab, setSelectedTab] = useState<"month" | "year">("month");

  const handleSubscribe = async (priceId: string) => {
    try {
      setProcessingPriceId(priceId);
      
      // If user is not logged in, redirect to sign in page
      if (!user) {
        router.push(ROUTES.PAGES.AUTH.SIGNIN);
        return;
      }
      
      // Create checkout session and redirect to payment
      const checkoutUrl = await createCheckoutSession(priceId);
      window.location.href = checkoutUrl;
    } catch (error) {
      console.error("Error creating checkout session:", error);
      // Provide more user-friendly error message
      const errorMessage = error instanceof Error 
        ? error.message
        : "Unknown error occurred";
        
      // Check for common error types
      if (errorMessage.includes("No such customer")) {
        alert("Account setup required. Please try again in a moment.");
      } else if (errorMessage.includes("Timeout")) {
        alert("Payment processing is taking longer than expected. Please try again.");
      } else {
        alert(`Payment setup failed: ${errorMessage}. Please try again.`);
      }
    } finally {
      setProcessingPriceId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col justify-center items-center py-16 space-y-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-purple-600"
        />
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-lg font-medium text-gray-300"
        >
          Loading pricing plans...
        </motion.p>
      </div>
    );
  }

  // Group products by type (one-time vs recurring)
  const recurringProducts = products.filter((product) =>
    product.prices?.some((price) => price.type === "recurring"),
  );

  const oneTimeProducts = products.filter((product) =>
    product.prices?.some((price) => price.type === "one_time"),
  );

  // No unused variables

  return (
    <div className="space-y-12">
      {/* Section Title */}
      <motion.div
        className="text-center"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-4xl font-bold mb-3 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600">
          Choose Your Plan
        </h2>
        <p className="text-xl text-gray-300 max-w-2xl mx-auto">
          Select the perfect plan for your needs and start creating amazing
          videos today
        </p>

        {/* Custom Billing Interval Toggle */}
        {recurringProducts.length > 0 && (
          <div className="mt-8 flex justify-center">
            <div className="relative w-64 h-12 bg-gray-800/50 backdrop-blur-sm rounded-lg border border-gray-700 p-1 overflow-hidden">
              {/* Tab Buttons */}
              <div className="grid grid-cols-2 h-full relative z-10">
                <motion.button
                  onClick={() => setSelectedTab("month")}
                  className={`relative z-20 flex items-center justify-center text-sm font-medium transition-colors duration-300 ${
                    selectedTab === "month"
                      ? "text-white"
                      : "text-gray-300 hover:text-white"
                  }`}
                  whileTap={{ scale: 0.95 }}
                  whileHover={{ y: -1 }}
                >
                  Monthly Billing
                </motion.button>
                <motion.button
                  onClick={() => setSelectedTab("year")}
                  className={`relative z-20 flex items-center justify-center text-sm font-medium transition-colors duration-300 ${
                    selectedTab === "year"
                      ? "text-white"
                      : "text-gray-300 hover:text-white"
                  }`}
                  whileTap={{ scale: 0.95 }}
                  whileHover={{ y: -1 }}
                >
                  Yearly Billing
                </motion.button>
              </div>

              {/* Animated Slider */}
              <motion.div
                className="absolute top-1 bottom-1 rounded-md bg-gradient-to-r from-blue-500 to-purple-600 z-0 shadow-lg shadow-purple-500/20"
                initial={false}
                animate={{
                  x: selectedTab === "month" ? 0 : "100%",
                  width: "50%",
                }}
                transition={{
                  type: "spring",
                  stiffness: 400,
                  damping: 40,
                  mass: 1,
                }}
                layoutId="tab-slider"
              />
            </div>
          </div>
        )}
      </motion.div>

      {/* Subscription Plans */}
      {recurringProducts.length > 0 && (
        <div>
          <h3 className="text-2xl font-bold mb-6 text-center">
            Subscription Plans
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recurringProducts.map((product) => {
              // Find the monthly and yearly prices
              const monthlyPrice = product.prices?.find(
                (price) => price.recurring?.interval === "month",
              );
              const yearlyPrice = product.prices?.find(
                (price) => price.recurring?.interval === "year",
              );

              return (
                <Card
                  key={product.id}
                  className={`flex flex-col h-full relative overflow-hidden ${
                    product.metadata?.popular === "true"
                      ? "border-2 border-purple-500 bg-gradient-to-b from-gray-900 to-gray-800 shadow-xl shadow-purple-500/10"
                      : "border border-gray-700 bg-gray-900/70 backdrop-blur-sm hover:border-purple-500"
                  } transition-all duration-300`}
                >
                  {product.metadata?.popular === "true" && (
                    <div className="absolute top-0 right-0 w-32 h-32 overflow-hidden">
                      <div className="absolute top-0 right-0 transform translate-y-[-50%] translate-x-[-50%] rotate-45 bg-purple-600 text-white font-bold py-1 w-[170%] text-center">
                        <Sparkles className="h-3 w-3 inline-block mr-1" />
                        POPULAR
                      </div>
                    </div>
                  )}
                  <CardHeader
                    className={`pb-2 ${product.metadata?.popular === "true" ? "bg-gradient-to-r from-blue-600/20 to-purple-600/20" : ""}`}
                  >
                    {product.images && product.images.length > 0 && (
                      <div className="mb-4 flex justify-center">
                        <img
                          src={`/api/proxy/image?url=${encodeURIComponent(product.images[0])}`}
                          alt={product.name}
                          className="h-16 w-auto object-contain rounded-md"
                        />
                      </div>
                    )}
                    <CardTitle
                      className={`text-2xl font-bold ${product.metadata?.popular === "true" ? "text-white" : ""}`}
                    >
                      {product.name}
                    </CardTitle>
                    <CardDescription className="text-gray-300">
                      {product.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex-grow">
                    {/* Price with animated transitions */}
                    <div className="relative mb-4 min-h-[180px]">
                      <AnimatePresence mode="wait">
                        {selectedTab === "month" && monthlyPrice && (
                          <motion.div
                            key="monthly"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            transition={{ duration: 0.3 }}
                            className="absolute w-full"
                          >
                            <p className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
                              ${(monthlyPrice.unit_amount / 100).toFixed(2)}
                              <span className="text-sm font-normal text-gray-400">
                                /month
                              </span>
                            </p>
                            <p className="text-sm text-gray-400 mt-1">
                              Billed monthly
                            </p>
                            <Button
                              className="w-full mt-4 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 shadow-lg shadow-purple-500/10"
                              onClick={() => handleSubscribe(monthlyPrice.id)}
                              disabled={processingPriceId === monthlyPrice.id}
                            >
                              {processingPriceId === monthlyPrice.id ? (
                                <span className="flex items-center justify-center">
                                  <svg
                                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                  >
                                    <circle
                                      className="opacity-25"
                                      cx="12"
                                      cy="12"
                                      r="10"
                                      stroke="currentColor"
                                      strokeWidth="4"
                                    ></circle>
                                    <path
                                      className="opacity-75"
                                      fill="currentColor"
                                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                    ></path>
                                  </svg>
                                  Processing...
                                </span>
                              ) : (
                                "Get Started"
                              )}
                            </Button>
                          </motion.div>
                        )}

                        {selectedTab === "year" && yearlyPrice && (
                          <motion.div
                            key="yearly"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.3 }}
                            className="absolute w-full"
                          >
                            <p className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
                              ${(yearlyPrice.unit_amount / 100).toFixed(2)}
                              <span className="text-sm font-normal text-gray-400">
                                /year
                              </span>
                            </p>
                            {monthlyPrice && (
                              <p className="text-sm text-green-400 mt-1">
                                Save $
                                {(
                                  (monthlyPrice.unit_amount * 12 -
                                    yearlyPrice.unit_amount) /
                                  100
                                ).toFixed(2)}{" "}
                                per year
                              </p>
                            )}
                            <Button
                              className="w-full mt-4 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 shadow-lg shadow-purple-500/10"
                              onClick={() => handleSubscribe(yearlyPrice.id)}
                              disabled={processingPriceId === yearlyPrice.id}
                            >
                              {processingPriceId === yearlyPrice.id ? (
                                <span className="flex items-center justify-center">
                                  <svg
                                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                  >
                                    <circle
                                      className="opacity-25"
                                      cx="12"
                                      cy="12"
                                      r="10"
                                      stroke="currentColor"
                                      strokeWidth="4"
                                    ></circle>
                                    <path
                                      className="opacity-75"
                                      fill="currentColor"
                                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                    ></path>
                                  </svg>
                                  Processing...
                                </span>
                              ) : (
                                "Get Started"
                              )}
                            </Button>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* Features */}
                    <div className="mt-8">
                      <h4 className="font-semibold mb-4 text-gray-200">
                        What&apos;s included:
                      </h4>
                      <ul className="space-y-3">
                        {/* Credits information */}
                        {product.metadata?.credits && (
                          <li className="flex items-start">
                            <div
                              className={`rounded-full p-1 mr-3 ${product.metadata?.popular === "true" ? "bg-purple-500/20 text-purple-400" : "bg-gray-800 text-blue-500"}`}
                            >
                              <Check className="h-4 w-4" />
                            </div>
                            <span className="text-gray-300">
                              <span className="font-semibold">
                                {product.metadata?.credits}
                              </span>{" "}
                              credits included
                            </span>
                          </li>
                        )}

                        {/* Basic features fallback */}
                        {!product.metadata?.credits && (
                          <li className="flex items-start">
                            <div className="rounded-full p-1 bg-gray-800 text-green-500 mr-3">
                              <Check className="h-4 w-4" />
                            </div>
                            <span className="text-gray-300">
                              All basic functionality
                            </span>
                          </li>
                        )}
                      </ul>
                    </div>
                  </CardContent>
                  <CardFooter>
                    {product.metadata?.popular === "true" && (
                      <Badge className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
                        Most Popular
                      </Badge>
                    )}
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* One-time Purchases */}
      {oneTimeProducts.length > 0 && (
        <div className="mt-16">
          <motion.h3
            className="text-2xl font-bold mb-8 text-center bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            One-time Purchases
          </motion.h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {oneTimeProducts.map((product, index) => {
              const price = product.prices?.[0]; // Assuming one price per one-time product

              return (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 + 0.3 }}
                  whileHover={{
                    y: -10,
                    transition: { duration: 0.3 },
                    boxShadow:
                      "0 20px 25px -5px rgba(99, 102, 241, 0.2), 0 10px 10px -5px rgba(168, 85, 247, 0.15)",
                  }}
                >
                  <Card className="flex flex-col h-full relative overflow-hidden border border-gray-700 bg-gray-900/70 backdrop-blur-sm hover:border-blue-500 transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/10">
                    <CardHeader className="pb-2">
                      {product.images && product.images.length > 0 && (
                        <div className="mb-4 flex justify-center">
                          <img
                            src={`/api/proxy/image?url=${encodeURIComponent(product.images[0])}`}
                            alt={product.name}
                            className="h-16 w-auto object-contain rounded-md"
                          />
                        </div>
                      )}
                      <CardTitle className="text-2xl font-bold">
                        {product.name}
                      </CardTitle>
                      <CardDescription className="text-gray-300">
                        {product.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="flex-grow">
                      {price && (
                        <motion.div
                          className="mb-6"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.4 }}
                        >
                          <p className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
                            ${(price.unit_amount / 100).toFixed(2)}
                          </p>
                          <p className="text-sm text-gray-400 mt-1">
                            One-time payment
                          </p>
                          <Button
                            className="w-full mt-4 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 shadow-lg shadow-blue-500/10"
                            onClick={() => handleSubscribe(price.id)}
                            disabled={processingPriceId === price.id}
                          >
                            {processingPriceId === price.id ? (
                              <span className="flex items-center justify-center">
                                <svg
                                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                                  xmlns="http://www.w3.org/2000/svg"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                >
                                  <circle
                                    className="opacity-25"
                                    cx="12"
                                    cy="12"
                                    r="10"
                                    stroke="currentColor"
                                    strokeWidth="4"
                                  ></circle>
                                  <path
                                    className="opacity-75"
                                    fill="currentColor"
                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                  ></path>
                                </svg>
                                Processing...
                              </span>
                            ) : (
                              "Buy Now"
                            )}
                          </Button>
                        </motion.div>
                      )}

                      {/* Features */}
                      <div className="mt-8">
                        <h4 className="font-semibold mb-4 text-gray-200">
                          What&apos;s included:
                        </h4>
                        <ul className="space-y-3">
                          {/* Credits information */}
                          {product.metadata?.credits && (
                            <li className="flex items-start">
                              <div className="rounded-full p-1 mr-3 bg-gray-800 text-blue-500">
                                <Check className="h-4 w-4" />
                              </div>
                              <span className="text-gray-300">
                                <span className="font-semibold">
                                  {product.metadata?.credits}
                                </span>{" "}
                                credits included
                              </span>
                            </li>
                          )}

                          {/* Basic functionality fallback */}
                          {!product.metadata?.credits && (
                            <li className="flex items-start">
                              <div className="rounded-full p-1 bg-gray-800 text-blue-500 mr-3">
                                <Check className="h-4 w-4" />
                              </div>
                              <span className="text-gray-300">Full access</span>
                            </li>
                          )}
                        </ul>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {/* No products found */}
      {products.length === 0 && (
        <div className="text-center py-12">
          <h3 className="text-xl font-bold">No pricing plans available</h3>
          <p className="mt-2">Please check back later</p>
        </div>
      )}
    </div>
  );
}
