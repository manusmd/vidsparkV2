import { NextRequest, NextResponse } from "next/server";
import { getAllFeatures } from "@/lib/stripeApi";
import {
  authenticate,
  isAdmin,
  unauthorizedResponse,
  forbiddenResponse,
  handleStripeError,
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

    const features = await getAllFeatures({
      archived: false,
    });

    return NextResponse.json({ features });
  } catch (error) {
    return handleStripeError(error, "Failed to fetch all features");
  }
}
