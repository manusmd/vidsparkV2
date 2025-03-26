import { NextRequest, NextResponse } from "next/server";
import { createFeature, updateFeature } from "@/lib/stripeApi";
import {
  authenticate,
  isAdmin,
  unauthorizedResponse,
  forbiddenResponse,
  badRequestResponse,
  handleStripeError,
  validateRequiredParam,
} from "@/lib/apiUtils";

/**
 * POST /api/stripe/features/general
 *
 * Creates a new general feature without assigning it to a product
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

    // Validate required fields
    if (!body.name) {
      return badRequestResponse("Feature name is required");
    }

    // Create the feature
    const feature = await createFeature({
      name: body.name,
      lookup_key: body.lookup_key,
    });

    // Return the result
    return NextResponse.json(
      {
        feature,
      },
      { status: 201 },
    );
  } catch (error) {
    return handleStripeError(error, "Failed to create feature");
  }
}

/**
 * PUT /api/stripe/features/general
 *
 * Updates an existing general feature
 */
export async function PUT(request: NextRequest) {
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

    // Get the feature ID from the request body
    const featureId = body.featureId;

    // Validate the feature ID
    const validationError = validateRequiredParam(featureId, "Feature ID");
    if (validationError) {
      return validationError;
    }

    // Validate that at least one field is provided
    if (!body.name && !body.lookup_key) {
      return badRequestResponse(
        "At least one field (name or lookup_key) must be provided",
      );
    }

    // Update the feature
    const feature = await updateFeature(featureId, {
      name: body.name,
    });

    // Return the result
    return NextResponse.json({ feature });
  } catch (error) {
    return handleStripeError(error, "Failed to update feature");
  }
}
