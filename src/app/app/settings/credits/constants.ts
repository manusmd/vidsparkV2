// Credit plan constants
export const PLANS = {
  STARTER: {
    name: "Starter",
    credits: 10,
    price: 9.99,
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_STARTER || "",
    features: [
      "10 Video Credits",
      "Basic templates",
      "720p video quality",
      "Standard support"
    ]
  },
  PRO: {
    name: "Pro",
    credits: 50,
    price: 39.99,
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_PRO || "",
    features: [
      "50 Video Credits",
      "All templates",
      "1080p video quality",
      "Priority support",
      "YouTube direct publishing"
    ]
  },
  ENTERPRISE: {
    name: "Enterprise",
    credits: 100,
    price: 69.99,
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_ENTERPRISE || "",
    features: [
      "100 Video Credits",
      "All templates",
      "4K video quality",
      "Premium support",
      "YouTube direct publishing",
      "Custom branding"
    ]
  }
}; 