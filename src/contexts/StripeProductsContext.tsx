"use client";

import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { useAuth } from "@/hooks/useAuth";
import Stripe from "stripe";

export interface StripeProduct {
  id: string;
  name: string;
  description?: string;
  active: boolean;
  images?: string[];
  metadata?: Record<string, string>;
  default_price?: string;
  created: number;
  updated: number;
  prices?: StripePrice[];
  features?: Stripe.Entitlements.Feature[];
}

export interface StripePrice {
  id: string;
  product: string;
  unit_amount: number;
  currency: string;
  active: boolean;
  type: "one_time" | "recurring";
  recurring?: {
    interval: "day" | "week" | "month" | "year";
    interval_count: number;
    trial_period_days?: number;
  };
  metadata?: Record<string, string>;
  created: number;
}

interface StripeProductsContextType {
  products: StripeProduct[];
  loading: boolean;
  error: Error | null;
  refreshProducts: () => Promise<void>;
  getProduct: (id: string) => Promise<StripeProduct>;
  createProduct: (product: Partial<StripeProduct>) => Promise<StripeProduct>;
  updateProduct: (
    id: string,
    product: Partial<StripeProduct>,
  ) => Promise<StripeProduct>;
  deleteProduct: (id: string) => Promise<void>;
  getProductPrices: (productId: string) => Promise<StripePrice[]>;
  createPrice: (
    productId: string,
    price: Partial<StripePrice>,
  ) => Promise<StripePrice>;
  updatePrice: (
    priceId: string,
    price: Partial<StripePrice>,
  ) => Promise<StripePrice>;
  deletePrice: (priceId: string) => Promise<void>;
  getProductFeatures: (
    productId: string,
  ) => Promise<Stripe.ApiList<Stripe.ProductFeature>>;
  getAllFeatures: () => Promise<Stripe.Entitlements.Feature[]>;
  createProductFeature: (
    productId: string,
    feature: Partial<Stripe.Entitlements.Feature>,
  ) => Promise<Stripe.Entitlements.Feature>;
  updateProductFeature: (
    productId: string,
    featureId: string,
    feature: Partial<Stripe.Entitlements.Feature>,
  ) => Promise<Stripe.Entitlements.Feature>;
  deleteProductFeature: (productId: string, featureId: string) => Promise<void>;
  createGeneralFeature: (
    feature: Partial<Stripe.Entitlements.Feature>,
  ) => Promise<Stripe.Entitlements.Feature>;
  updateGeneralFeature: (
    featureId: string,
    feature: Partial<Stripe.Entitlements.Feature>,
  ) => Promise<Stripe.Entitlements.Feature>;
  assignFeatureToProduct: (
    productId: string,
    featureId: string,
  ) => Promise<{
    product: StripeProduct;
    features: Stripe.Entitlements.Feature[];
    addedFeature?: Stripe.Entitlements.Feature;
    message?: string;
  }>;
}

const StripeProductsContext = createContext<
  StripeProductsContextType | undefined
>(undefined);

export function StripeProductsProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [products, setProducts] = useState<StripeProduct[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchProducts = async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      const idToken = await user.getIdToken();
      const response = await fetch("/api/stripe/products", {
        headers: {
          Authorization: `Bearer ${idToken}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch products: ${response.statusText}`);
      }

      const data = await response.json();
      setProducts(data.products || []);
    } catch (err) {
      console.error("Error fetching products:", err);
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchProducts();
    } else {
      setProducts([]);
    }
  }, [user]);

  const getProduct = async (id: string): Promise<StripeProduct> => {
    if (!user) throw new Error("User not authenticated");

    const idToken = await user.getIdToken();

    const response = await fetch(`/api/stripe/products/${id}`, {
      headers: {
        Authorization: `Bearer ${idToken}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch product: ${response.statusText}`);
    }

    const data = await response.json();
    return data.product;
  };

  const createProduct = async (
    product: Partial<StripeProduct>,
  ): Promise<StripeProduct> => {
    if (!user) throw new Error("User not authenticated");

    const idToken = await user.getIdToken();

    const response = await fetch("/api/stripe/products", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${idToken}`,
      },
      body: JSON.stringify(product),
    });

    if (!response.ok) {
      throw new Error(`Failed to create product: ${response.statusText}`);
    }

    const data = await response.json();

    await fetchProducts();

    return data.product;
  };

  const updateProduct = async (
    id: string,
    product: Partial<StripeProduct>,
  ): Promise<StripeProduct> => {
    if (!user) throw new Error("User not authenticated");

    const idToken = await user.getIdToken();

    const response = await fetch(`/api/stripe/products/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${idToken}`,
      },
      body: JSON.stringify(product),
    });

    if (!response.ok) {
      throw new Error(`Failed to update product: ${response.statusText}`);
    }

    const data = await response.json();

    // Refresh the products list
    await fetchProducts();

    return data.product;
  };

  const deleteProduct = async (id: string): Promise<void> => {
    if (!user) throw new Error("User not authenticated");

    const idToken = await user.getIdToken();

    const response = await fetch(`/api/stripe/products/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${idToken}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to delete product: ${response.statusText}`);
    }

    await fetchProducts();
  };

  const getProductPrices = async (
    productId: string,
  ): Promise<StripePrice[]> => {
    if (!user) throw new Error("User not authenticated");

    const idToken = await user.getIdToken();

    const response = await fetch(`/api/stripe/products/${productId}/prices`, {
      headers: {
        Authorization: `Bearer ${idToken}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch prices: ${response.statusText}`);
    }

    const data = await response.json();
    return data.prices || [];
  };

  const createPrice = async (
    productId: string,
    price: Partial<StripePrice>,
  ): Promise<StripePrice> => {
    if (!user) throw new Error("User not authenticated");

    const idToken = await user.getIdToken();

    const response = await fetch(`/api/stripe/products/${productId}/prices`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${idToken}`,
      },
      body: JSON.stringify(price),
    });

    if (!response.ok) {
      throw new Error(`Failed to create price: ${response.statusText}`);
    }

    const data = await response.json();

    await fetchProducts();

    return data.price;
  };

  const updatePrice = async (
    priceId: string,
    price: Partial<StripePrice>,
  ): Promise<StripePrice> => {
    if (!user) throw new Error("User not authenticated");

    const idToken = await user.getIdToken();

    const response = await fetch(`/api/stripe/prices/${priceId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${idToken}`,
      },
      body: JSON.stringify(price),
    });

    if (!response.ok) {
      throw new Error(`Failed to update price: ${response.statusText}`);
    }

    const data = await response.json();

    await fetchProducts();

    return data.price;
  };

  const deletePrice = async (priceId: string): Promise<void> => {
    if (!user) throw new Error("User not authenticated");

    const idToken = await user.getIdToken();

    const response = await fetch(`/api/stripe/prices/${priceId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${idToken}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to delete price: ${response.statusText}`);
    }

    await fetchProducts();
  };

  const refreshProducts = async (): Promise<void> => {
    await fetchProducts();
  };

  const getProductFeatures = async (
    productId: string,
  ): Promise<Stripe.ApiList<Stripe.ProductFeature>> => {
    if (!user) throw new Error("User not authenticated");

    const idToken = await user.getIdToken();

    const response = await fetch(`/api/stripe/features/${productId}`, {
      headers: {
        Authorization: `Bearer ${idToken}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch features: ${response.statusText}`);
    }

    const data = await response.json();
    return data.features || { data: [] };
  };

  const createProductFeature = async (
    productId: string,
    feature: Partial<Stripe.Entitlements.Feature>,
  ): Promise<Stripe.Entitlements.Feature> => {
    if (!user) throw new Error("User not authenticated");

    const idToken = await user.getIdToken();

    const response = await fetch(`/api/stripe/features`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${idToken}`,
      },
      body: JSON.stringify({
        productId,
        ...feature,
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to create feature: ${response.statusText}`);
    }

    const data = await response.json();

    await fetchProducts();

    return data.feature;
  };

  const updateProductFeature = async (
    productId: string,
    featureId: string,
    feature: Partial<Stripe.Entitlements.Feature>,
  ): Promise<Stripe.Entitlements.Feature> => {
    if (!user) throw new Error("User not authenticated");

    const idToken = await user.getIdToken();

    const response = await fetch(`/api/stripe/features/feature`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${idToken}`,
      },
      body: JSON.stringify({
        productId,
        featureId,
        ...feature,
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to update feature: ${response.statusText}`);
    }

    const data = await response.json();

    await fetchProducts();

    return data.feature;
  };

  const deleteProductFeature = async (
    productId: string,
    featureId: string,
  ): Promise<void> => {
    if (!user) throw new Error("User not authenticated");

    const idToken = await user.getIdToken();

    const response = await fetch(`/api/stripe/features/feature`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${idToken}`,
      },
      body: JSON.stringify({
        productId,
        featureId,
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to delete feature: ${response.statusText}`);
    }

    await fetchProducts();
  };

  const getAllFeatures = async (): Promise<Stripe.Entitlements.Feature[]> => {
    if (!user) throw new Error("User not authenticated");

    const idToken = await user.getIdToken();

    const response = await fetch(`/api/stripe/features/all`, {
      headers: {
        Authorization: `Bearer ${idToken}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch all features: ${response.statusText}`);
    }

    const data = await response.json();
    return data.features || [];
  };

  // Create a new general feature
  const createGeneralFeature = async (
    feature: Partial<Stripe.Entitlements.Feature>,
  ): Promise<Stripe.Entitlements.Feature> => {
    if (!user) throw new Error("User not authenticated");

    const idToken = await user.getIdToken();

    const response = await fetch(`/api/stripe/features/general`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${idToken}`,
      },
      body: JSON.stringify(feature),
    });

    if (!response.ok) {
      throw new Error(
        `Failed to create general feature: ${response.statusText}`,
      );
    }

    const data = await response.json();

    // Refresh the products list
    await fetchProducts();

    return data.feature;
  };

  // Update an existing general feature
  const updateGeneralFeature = async (
    featureId: string,
    feature: Partial<Stripe.Entitlements.Feature>,
  ): Promise<Stripe.Entitlements.Feature> => {
    if (!user) throw new Error("User not authenticated");

    const idToken = await user.getIdToken();

    const response = await fetch(`/api/stripe/features/general`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${idToken}`,
      },
      body: JSON.stringify({
        featureId,
        ...feature,
      }),
    });

    if (!response.ok) {
      throw new Error(
        `Failed to update general feature: ${response.statusText}`,
      );
    }

    const data = await response.json();

    // Refresh the products list
    await fetchProducts();

    return data.feature;
  };

  // Assign an existing feature to a product
  const assignFeatureToProduct = async (
    productId: string,
    featureId: string,
  ): Promise<{
    product: StripeProduct;
    features: Stripe.Entitlements.Feature[];
    addedFeature?: Stripe.Entitlements.Feature;
    message?: string;
  }> => {
    if (!user) throw new Error("User not authenticated");

    const idToken = await user.getIdToken();

    const response = await fetch(
      `/api/stripe/products/${productId}/assign-feature`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({
          featureId,
        }),
      },
    );

    if (!response.ok) {
      throw new Error(
        `Failed to assign feature to product: ${response.statusText}`,
      );
    }

    const data = await response.json();

    // Refresh the products list
    await fetchProducts();

    return data;
  };

  // Context value
  const value: StripeProductsContextType = {
    products,
    loading,
    error,
    refreshProducts,
    getProduct,
    createProduct,
    updateProduct,
    deleteProduct,
    getProductPrices,
    createPrice,
    updatePrice,
    deletePrice,
    getProductFeatures,
    getAllFeatures,
    createProductFeature,
    updateProductFeature,
    deleteProductFeature,
    createGeneralFeature,
    updateGeneralFeature,
    assignFeatureToProduct,
  };

  return (
    <StripeProductsContext.Provider value={value}>
      {children}
    </StripeProductsContext.Provider>
  );
}

// Custom hook to use the context
export function useStripeProducts() {
  const context = useContext(StripeProductsContext);

  if (context === undefined) {
    throw new Error(
      "useStripeProducts must be used within a StripeProductsProvider",
    );
  }

  return context;
}
