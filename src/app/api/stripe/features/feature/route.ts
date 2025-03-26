import { NextRequest, NextResponse } from "next/server";
import {
  getProductFeatures,
  updateProductFeature,
  removeProductFeature,
} from "@/lib/stripeApi";
import {
  authenticate,
  isAdmin,
  unauthorizedResponse,
  forbiddenResponse,
  badRequestResponse,
  notFoundResponse,
  handleStripeError,
  validateRequiredParam,
} from "@/lib/apiUtils";
export async function GET(request: NextRequest) {
  try {
    const auth = await authenticate(request);
    if (!auth) {
      return unauthorizedResponse();
    }

    const admin = await isAdmin(auth.userId);
    if (!admin) {
      return forbiddenResponse();
    }

    const body = await request.json();
    const productId = body.productId;
    const featureId = body.featureId;

    const productIdValidationError = validateRequiredParam(
      productId,
      "Product ID",
    );
    if (productIdValidationError) {
      return productIdValidationError;
    }

    const featureIdValidationError = validateRequiredParam(
      featureId,
      "Feature ID",
    );
    if (featureIdValidationError) {
      return featureIdValidationError;
    }

    const features = await getProductFeatures(productId);

    const feature = features.data.find((f) => f.id === featureId);

    if (!feature) {
      return notFoundResponse(
        `Feature ${featureId} not found for product ${productId}`,
      );
    }

    return NextResponse.json({ feature });
  } catch (error) {
    return handleStripeError(error, "Failed to fetch product feature");
  }
}
export async function PUT(request: NextRequest) {
  try {
    const auth = await authenticate(request);
    if (!auth) {
      return unauthorizedResponse();
    }

    const admin = await isAdmin(auth.userId);
    if (!admin) {
      return forbiddenResponse();
    }

    const body = await request.json();
    const productId = body.productId;
    const featureId = body.featureId;

    const productIdValidationError = validateRequiredParam(
      productId,
      "Product ID",
    );
    if (productIdValidationError) {
      return productIdValidationError;
    }

    const featureIdValidationError = validateRequiredParam(
      featureId,
      "Feature ID",
    );
    if (featureIdValidationError) {
      return featureIdValidationError;
    }

    if (!body.name && body.description === undefined) {
      return badRequestResponse(
        "At least one field (name or description) must be provided",
      );
    }

    const result = await updateProductFeature(productId, featureId, {
      name: body.name,
      description: body.description,
    });

    const updatedFeature = result.updatedFeature;
    const features = result.features;
    return NextResponse.json({
      feature: updatedFeature,
      features: features,
    });
  } catch (error) {
    return handleStripeError(error, "Failed to update product feature");
  }
}
export async function DELETE(request: NextRequest) {
  try {
    const auth = await authenticate(request);
    if (!auth) {
      return unauthorizedResponse();
    }

    const admin = await isAdmin(auth.userId);
    if (!admin) {
      return forbiddenResponse();
    }

    const body = await request.json();
    const productId = body.productId;
    const featureId = body.featureId;

    const productIdValidationError = validateRequiredParam(
      productId,
      "Product ID",
    );
    if (productIdValidationError) {
      return productIdValidationError;
    }

    const featureIdValidationError = validateRequiredParam(
      featureId,
      "Feature ID",
    );
    if (featureIdValidationError) {
      return featureIdValidationError;
    }

    const result = await removeProductFeature(productId, featureId);

    const removedFeature = result.removedFeature;
    const features = result.features;
    return NextResponse.json({
      success: true,
      message: "Feature removed successfully",
      removedFeature: removedFeature,
      features: features,
    });
  } catch (error) {
    return handleStripeError(error, "Failed to remove product feature");
  }
}
