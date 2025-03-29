import { NextRequest, NextResponse } from "next/server";
import { getProduct, updateProduct, deleteProduct } from "@/lib/stripeApi";
import Stripe from "stripe";
import {
  authenticate,
  isAdmin,
  unauthorizedResponse,
  forbiddenResponse,
  handleStripeError,
  validateRequiredParam,
} from "@/lib/apiUtils";

export async function GET(
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
    const { id: productId } = await params;
    const validationError = validateRequiredParam(productId, "Product ID");
    if (validationError) {
      return validationError;
    }

    // Fetch the product from Stripe
    const product = await getProduct(productId);

    // Return the product
    return NextResponse.json({ product });
  } catch (error) {
    return handleStripeError(error, "Failed to fetch product");
  }
}

export async function PUT(
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
    const { id: productId } = await params;
    const validationError = validateRequiredParam(productId, "Product ID");
    if (validationError) {
      return validationError;
    }

    // Parse the request body
    const body = await request.json();

    // Prepare update parameters
    const updateParams: Stripe.ProductUpdateParams = {};

    // Only include fields that are provided
    if (body.name !== undefined) updateParams.name = body.name;
    if (body.description !== undefined)
      updateParams.description = body.description;
    if (body.active !== undefined) updateParams.active = body.active;
    if (body.metadata !== undefined) updateParams.metadata = body.metadata;
    if (body.images !== undefined) updateParams.images = body.images;
    if (body.tax_code !== undefined) updateParams.tax_code = body.tax_code;

    // Update the product in Stripe
    const product = await updateProduct(productId, updateParams);

    // Return the updated product
    return NextResponse.json({ product });
  } catch (error) {
    return handleStripeError(error, "Failed to update product");
  }
}

export async function DELETE(
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
    const { id: productId } = await params;
    const validationError = validateRequiredParam(productId, "Product ID");
    if (validationError) {
      return validationError;
    }

    // Delete (archive) the product in Stripe
    const product = await deleteProduct(productId);

    // Return success
    return NextResponse.json({
      success: true,
      message: "Product archived successfully",
      product,
    });
  } catch (error) {
    return handleStripeError(error, "Failed to delete product");
  }
}
