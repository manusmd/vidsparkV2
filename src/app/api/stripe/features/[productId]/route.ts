import { NextRequest, NextResponse } from "next/server";
import { getProductFeatures } from "@/lib/stripeApi";
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
  { params }: { params: Promise<{ productId: string }> },
) {
  try {
    const auth = await authenticate(request);
    if (!auth) {
      return unauthorizedResponse();
    }

    const admin = await isAdmin(auth.userId);
    if (!admin) {
      return forbiddenResponse();
    }

    const { productId } = await params;

    const validationError = validateRequiredParam(productId, "Product ID");
    if (validationError) {
      return validationError;
    }

    const features = await getProductFeatures(productId);

    return NextResponse.json({ features });
  } catch (error) {
    return handleStripeError(error, "Failed to fetch product features");
  }
}
