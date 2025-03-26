import { NextRequest, NextResponse } from "next/server";
import { assignFeatureToProduct } from "@/lib/stripeApi";
import {
  authenticate,
  isAdmin,
  unauthorizedResponse,
  forbiddenResponse,
  handleStripeError,
  validateRequiredParam,
} from "@/lib/apiUtils";

/**
 * POST /api/stripe/products/[id]/assign-feature
 *
 * Assigns an existing feature to a product
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
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

    // Get the product ID from the URL
    const { id } = await params;
    const validationError = validateRequiredParam(id, "Product ID");
    if (validationError) {
      return validationError;
    }

    // Parse the request body
    const body = await request.json();

    // Get the feature ID from the request body
    const featureId = body.featureId;

    // Validate the feature ID
    const featureIdValidationError = validateRequiredParam(
      featureId,
      "Feature ID",
    );
    if (featureIdValidationError) {
      return featureIdValidationError;
    }

    // Assign the feature to the product
    const result = await assignFeatureToProduct(id, featureId);

    // Return the result directly
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    return handleStripeError(error, "Failed to assign feature to product");
  }
}
