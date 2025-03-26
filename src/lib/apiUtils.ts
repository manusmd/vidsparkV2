import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@/lib/firebaseAdmin';
import Stripe from 'stripe';

/**
 * Authentication middleware for API routes
 * @param request The Next.js request object
 * @returns An object with the authenticated user ID or null if authentication fails
 */
export async function authenticate(request: NextRequest): Promise<{ userId: string } | null> {
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

/**
 * Check if a user has admin privileges
 * @param userId The user ID to check
 * @returns A boolean indicating if the user is an admin
 */
export async function isAdmin(userId: string): Promise<boolean> {
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

/**
 * Create an unauthorized response
 * @returns A NextResponse with a 401 status code
 */
export function unauthorizedResponse() {
  return NextResponse.json(
    { error: 'Unauthorized' },
    { status: 401 }
  );
}

/**
 * Create a forbidden response for admin-only routes
 * @returns A NextResponse with a 403 status code
 */
export function forbiddenResponse() {
  return NextResponse.json(
    { error: 'Forbidden: Admin access required' },
    { status: 403 }
  );
}

/**
 * Create a bad request response
 * @param message The error message
 * @returns A NextResponse with a 400 status code
 */
export function badRequestResponse(message: string) {
  return NextResponse.json(
    { error: message },
    { status: 400 }
  );
}

/**
 * Create a not found response
 * @param message The error message
 * @returns A NextResponse with a 404 status code
 */
export function notFoundResponse(message: string) {
  return NextResponse.json(
    { error: message },
    { status: 404 }
  );
}

/**
 * Create a server error response
 * @param message The error message
 * @returns A NextResponse with a 500 status code
 */
export function serverErrorResponse(message: string) {
  return NextResponse.json(
    { error: message },
    { status: 500 }
  );
}

/**
 * Handle common Stripe errors and return appropriate responses
 * @param error The error object
 * @param defaultMessage The default error message
 * @returns A NextResponse with an appropriate status code
 */
export function handleStripeError(error: unknown, defaultMessage: string) {
  console.error(defaultMessage, error);

  // Check if it's a Stripe error
  if (error instanceof Stripe.errors.StripeError) {
    if (error.type === 'StripeInvalidRequestError' && error.statusCode === 404) {
      return notFoundResponse('Resource not found');
    }
  }

  return serverErrorResponse(defaultMessage);
}

/**
 * Validate that a parameter exists
 * @param param The parameter to validate
 * @param paramName The name of the parameter for the error message
 * @returns A NextResponse if validation fails, or null if validation passes
 */
export function validateRequiredParam(param: unknown, paramName: string) {
  if (!param) {
    return badRequestResponse(`${paramName} is required`);
  }
  return null;
}
