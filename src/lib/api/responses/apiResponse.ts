import { NextResponse } from "next/server";

/**
 * Standard API response utility functions
 * These functions help create consistent API responses across all routes
 */

/**
 * Create a success response with data
 * @param data The data to include in the response
 * @param status The HTTP status code (default: 200)
 * @returns A NextResponse object with the formatted response
 */
export function successResponse<T>(data: T, status = 200): NextResponse {
  return NextResponse.json({ success: true, data }, { status });
}

/**
 * Create an error response
 * @param message The error message
 * @param status The HTTP status code (default: 500)
 * @returns A NextResponse object with the formatted error response
 */
export function errorResponse(message: string, status = 500): NextResponse {
  return NextResponse.json(
    { success: false, error: message },
    { status }
  );
}

/**
 * Create a not found response
 * @param message The not found message (default: "Resource not found")
 * @returns A NextResponse object with a 404 status
 */
export function notFoundResponse(message = "Resource not found"): NextResponse {
  return errorResponse(message, 404);
}

/**
 * Create an unauthorized response
 * @param message The unauthorized message (default: "Unauthorized")
 * @returns A NextResponse object with a 401 status
 */
export function unauthorizedResponse(message = "Unauthorized"): NextResponse {
  return errorResponse(message, 401);
}

/**
 * Create a forbidden response
 * @param message The forbidden message (default: "Forbidden")
 * @returns A NextResponse object with a 403 status
 */
export function forbiddenResponse(message = "Forbidden"): NextResponse {
  return errorResponse(message, 403);
}

/**
 * Create a validation error response
 * @param message The validation error message (default: "Validation error")
 * @returns A NextResponse object with a 400 status
 */
export function validationErrorResponse(message = "Validation error"): NextResponse {
  return errorResponse(message, 400);
}