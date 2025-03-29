import { NextRequest, NextResponse } from 'next/server';
import { getPrice, updatePrice, deletePrice } from '@/lib/stripeApi';
import { getAuth } from '@/lib/firebaseAdmin';
import Stripe from 'stripe';

// Helper function to check if a user is an admin
async function isAdmin(userId: string): Promise<boolean> {
  try {
    // First check custom claims (backend admin)
    const user = await getAuth().getUser(userId);
    if (user.customClaims?.admin === true) {
      return true;
    }

    // If not in custom claims, check Firestore roles (frontend admin)
    const db = (await import('@/lib/firebaseAdmin')).db;
    const userDoc = await db.collection('users').doc(userId).get();

    if (userDoc.exists) {
      const data = userDoc.data();
      const roles = data?.roles;
      return Array.isArray(roles) && roles.includes('admin');
    }

    return false;
  } catch (error) {
    console.error('Error checking admin status:', error);
    return false;
  }
}

// Authentication middleware
async function authenticate(request: NextRequest): Promise<{ userId: string } | null> {
  try {
    // Get the authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }

    // Extract the token
    const token = authHeader.split('Bearer ')[1];
    if (!token) {
      return null;
    }

    // Verify the token
    const decodedToken = await getAuth().verifyIdToken(token);
    return { userId: decodedToken.uid };
  } catch (error) {
    console.error('Authentication error:', error);
    return null;
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ priceId: string }> }
) {
  try {
    // Authenticate the request
    const auth = await authenticate(request);
    if (!auth) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if the user is an admin
    const admin = await isAdmin(auth.userId);
    if (!admin) {
      return NextResponse.json(
        { error: 'Forbidden: Admin access required' },
        { status: 403 }
      );
    }

    // Get the price ID from the URL
    const { priceId } = await params;
    if (!priceId) {
      return NextResponse.json(
        { error: 'Price ID is required' },
        { status: 400 }
      );
    }

    // Fetch the price from Stripe
    const price = await getPrice(priceId);

    // Return the price
    return NextResponse.json({ price });
  } catch (error) {
    console.error('Error fetching price:', error);

    // Check if it's a Stripe error
    if (error instanceof Stripe.errors.StripeError) {
      if (error.type === 'StripeInvalidRequestError' && error.statusCode === 404) {
        return NextResponse.json(
          { error: 'Price not found' },
          { status: 404 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Failed to fetch price' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ priceId: string }> }
) {
  try {
    // Authenticate the request
    const auth = await authenticate(request);
    if (!auth) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if the user is an admin
    const admin = await isAdmin(auth.userId);
    if (!admin) {
      return NextResponse.json(
        { error: 'Forbidden: Admin access required' },
        { status: 403 }
      );
    }

    // Get the price ID from the URL
    const { priceId } = await params;
    if (!priceId) {
      return NextResponse.json(
        { error: 'Price ID is required' },
        { status: 400 }
      );
    }

    // Parse the request body
    const body = await request.json();

    // Prepare update parameters
    const updateParams: Stripe.PriceUpdateParams = {};

    // Only include fields that are provided and can be updated
    // Note: Stripe only allows updating metadata, active status, and nickname for prices
    if (body.active !== undefined) updateParams.active = body.active;
    if (body.metadata !== undefined) updateParams.metadata = body.metadata;
    if (body.nickname !== undefined) updateParams.nickname = body.nickname;

    // Update the price in Stripe
    const price = await updatePrice(priceId, updateParams);

    // Return the updated price
    return NextResponse.json({ price });
  } catch (error) {
    console.error('Error updating price:', error);

    // Check if it's a Stripe error
    if (error instanceof Stripe.errors.StripeError) {
      if (error.type === 'StripeInvalidRequestError') {
        if (error.statusCode === 404) {
          return NextResponse.json(
            { error: 'Price not found' },
            { status: 404 }
          );
        }

        return NextResponse.json(
          { error: `Stripe error: ${error.message}` },
          { status: 400 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Failed to update price' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ priceId: string }> }
) {
  try {
    // Authenticate the request
    const auth = await authenticate(request);
    if (!auth) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if the user is an admin
    const admin = await isAdmin(auth.userId);
    if (!admin) {
      return NextResponse.json(
        { error: 'Forbidden: Admin access required' },
        { status: 403 }
      );
    }

    // Get the price ID from the URL
    const { priceId } = await params;
    if (!priceId) {
      return NextResponse.json(
        { error: 'Price ID is required' },
        { status: 400 }
      );
    }

    // Delete (archive) the price in Stripe
    const price = await deletePrice(priceId);

    // Return success
    return NextResponse.json({ 
      success: true,
      message: 'Price archived successfully',
      price 
    });
  } catch (error) {
    console.error('Error deleting price:', error);

    // Check if it's a Stripe error
    if (error instanceof Stripe.errors.StripeError) {
      if (error.type === 'StripeInvalidRequestError') {
        if (error.statusCode === 404) {
          return NextResponse.json(
            { error: 'Price not found' },
            { status: 404 }
          );
        }

        return NextResponse.json(
          { error: `Stripe error: ${error.message}` },
          { status: 400 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Failed to delete price' },
      { status: 500 }
    );
  }
}
