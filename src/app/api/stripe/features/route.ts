import { NextRequest, NextResponse } from "next/server";
import { getProductFeatures, addProductFeature } from "@/lib/stripeApi";
import {
  authenticate,
  isAdmin,
  unauthorizedResponse,
  forbiddenResponse,
  badRequestResponse,
  handleStripeError,
  validateRequiredParam,
} from "@/lib/apiUtils";

// Using Stripe.Entitlements.Feature from the Stripe types

/**
 * GET /api/stripe/features
 *
 * Retrieves all features for a specific product
 * The product ID is passed in the request body
 */
export async function GET(request: NextRequest) {
  try {
    // Authenticate the request
    const auth = await authenticate(request);
    if (!auth) {
      return unauthorizedResponse();
    }

    // Check if the user is an admin
    const admin = await isAdmin(auth.userId);
    if (!admin) {
      return forbiddenResponse();
    }

    // Parse the request body to get the product ID
    const body = await request.json();
    const productId = body.productId;

    // Validate the product ID
    const validationError = validateRequiredParam(productId, "Product ID");
    if (validationError) {
      return validationError;
    }

    // Fetch the product features from Stripe
    const features = await getProductFeatures(productId);

    // Return the features
    return NextResponse.json({ features });
  } catch (error) {
    return handleStripeError(error, "Failed to fetch product features");
  }
}

/**
 * POST /api/stripe/features
 *
 * Adds a new feature to a product
 * The product ID is passed in the request body
 */
export async function POST(request: NextRequest) {
  try {
    // Authenticate the request
    const auth = await authenticate(request);
    if (!auth) {
      return unauthorizedResponse();
    }

    // Check if the user is an admin
    const admin = await isAdmin(auth.userId);
    if (!admin) {
      return forbiddenResponse();
    }

    // Parse the request body
    const body = await request.json();

    // Get the product ID from the request body
    const productId = body.productId;

    // Validate the product ID
    const validationError = validateRequiredParam(productId, "Product ID");
    if (validationError) {
      return validationError;
    }

    // Validate required fields
    if (!body.name) {
      return badRequestResponse("Feature name is required");
    }

    // Add the feature to the product
    const result = await addProductFeature(productId, {
      name: body.name,
      description: body.description || "",
    });

    const addedFeature = result.addedFeature;
    const features = result.features;

    // Return the result
    return NextResponse.json(
      {
        feature: addedFeature,
        features: features,
      },
      { status: 201 },
    );
  } catch (error) {
    return handleStripeError(error, "Failed to add product feature");
  }
}
