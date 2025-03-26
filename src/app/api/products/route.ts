import { NextResponse } from "next/server";
import { db } from "@/lib/firebaseAdmin";

interface Price {
  id: string;
  [key: string]: unknown;
}

interface Product {
  id: string;
  prices: Price[];
  [key: string]: unknown;
}

export async function GET() {
  try {
    // Get all active products
    const productsSnapshot = await db.collection("products").where("active", "==", true).get();

    const products: Product[] = [];

    // Process each product
    for (const productDoc of productsSnapshot.docs) {
      const product: Product = {
        id: productDoc.id,
        ...productDoc.data(),
        prices: []
      };

      // Get prices for this product
      const pricesSnapshot = await productDoc.ref.collection("prices").get();

      // Add prices to the product
      product.prices = pricesSnapshot.docs.map(priceDoc => ({
        id: priceDoc.id,
        ...priceDoc.data()
      } as Price));

      products.push(product);
    }

    return NextResponse.json({ products });
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}
