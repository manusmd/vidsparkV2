import { NextRequest, NextResponse } from "next/server";
import { getPrices, createPrice } from "@/lib/stripeApi";
import Stripe from "stripe";
import {
  authenticate,
  isAdmin,
  unauthorizedResponse,
  forbiddenResponse,
  badRequestResponse,
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
    const { id } = await params;
    const validationError = validateRequiredParam(id, "Product ID");
    if (validationError) {
      return validationError;
    }

    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const active = searchParams.get("active");

    // Prepare query parameters for Stripe
    const queryParams: Stripe.PriceListParams = {
      product: id,
    };

    if (active !== null) {
      queryParams.active = active === "true";
    }

    // Fetch prices from Stripe
    const prices = await getPrices(queryParams);

    // Return the prices
    return NextResponse.json({ prices: prices.data });
  } catch (error) {
    return handleStripeError(error, "Failed to fetch prices");
  }
}

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
    const { id: productId } = await params;
    const validationError = validateRequiredParam(productId, "Product ID");
    if (validationError) {
      return validationError;
    }

    // Parse the request body
    const body = await request.json();

    // Validate required fields
    if (!body.unit_amount) {
      return badRequestResponse("Price amount is required");
    }

    if (!body.currency) {
      return badRequestResponse("Currency is required");
    }

    // Prepare price creation parameters
    const priceParams: Stripe.PriceCreateParams = {
      product: productId,
      unit_amount: body.unit_amount,
      currency: body.currency,
      active: body.active !== false, // Default to true if not specified
    };

    // Add recurring parameters if this is a recurring price
    if (body.type === "recurring" && body.recurring) {
      priceParams.recurring = {
        interval: body.recurring.interval,
        interval_count: body.recurring.interval_count || 1,
      };

      if (body.recurring.trial_period_days) {
        priceParams.recurring.trial_period_days =
          body.recurring.trial_period_days;
      }
    }

    // Add metadata if provided
    if (body.metadata) {
      priceParams.metadata = body.metadata;
    }

    // Create the price in Stripe
    const price = await createPrice(priceParams);

    // Return the created price
    return NextResponse.json({ price }, { status: 201 });
  } catch (error) {
    // For Stripe invalid request errors, provide more specific messages
    if (
      error instanceof Stripe.errors.StripeError &&
      error.type === "StripeInvalidRequestError"
    ) {
      if (error.statusCode === 404) {
        return NextResponse.json(
          { error: "Product not found" },
          { status: 404 },
        );
      }

      return NextResponse.json(
        { error: `Stripe error: ${error.message}` },
        { status: 400 },
      );
    }

    return handleStripeError(error, "Failed to create price");
  }
}
