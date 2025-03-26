"use client";

import React from "react";
import { StripeProductsProvider } from "@/contexts/StripeProductsContext";
import ProductsList from "@/components/admin/ProductsList.component";

export default function ProductsAdminPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold">Products Management</h1>
      <p className="text-muted-foreground mt-2">
        Manage your Stripe products and prices.
      </p>

      <div className="mt-8">
        <StripeProductsProvider>
          <ProductsList />
        </StripeProductsProvider>
      </div>
    </div>
  );
}
