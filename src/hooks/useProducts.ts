import { useState, useEffect } from "react";

interface Product {
  id: string;
  name: string;
  description?: string;
  active: boolean;
  images?: string[];
  metadata?: Record<string, string>;
  role?: string | null;
  stripe_metadata_credits?: string | number;
  tax_code?: string;
  prices?: Price[];
}

// Define the BillingScheme type
type BillingScheme = 'per_unit' | 'tiered';

// Define the CurrencyOptions interface
interface CurrencyOptions {
  custom_unit_amount?: {
    enabled: boolean;
    maximum?: number;
    minimum?: number;
    preset?: number;
  };
  unit_amount?: number;
  unit_amount_decimal?: string;
  tax_behavior?: 'exclusive' | 'inclusive' | 'unspecified';
}

interface Price {
  id: string;
  object: "price";
  active: boolean;
  billing_scheme: BillingScheme;
  created: number;
  currency: string;
  currency_options?: {
    [p: string]: CurrencyOptions
  };
  // Keep the properties needed by the component
  unit_amount: number;
  product_id?: string;
  type?: string;
  recurring?: {
    interval: string;
    interval_count?: number;
    trial_period_days?: number | null;
  };
  metadata?: Record<string, string>;
}

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);

        // Fetch products from the API endpoint
        const response = await fetch('/api/products');

        if (!response.ok) {
          throw new Error(`Error fetching products: ${response.statusText}`);
        }

        const data = await response.json();
        setProducts(data.products);
      } catch (err) {
        console.error("Error fetching products:", err);
        setError(err instanceof Error ? err : new Error(String(err)));
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  return { products, loading, error };
}
