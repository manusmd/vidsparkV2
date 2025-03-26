import { NextResponse } from "next/server";

/**
 * Middleware to handle errors for API routes
 * @param handler The route handler function
 * @returns A wrapped handler function that includes error handling
 */
export const withErrorHandling = <T extends Record<string, string>>(
  handler: (req: Request, context: { params: T }) => Promise<NextResponse>
) => {
  return async (req: Request, context: { params: T }) => {
    try {
      return await handler(req, context);
    } catch (error: unknown) {
      console.error("API error:", error);
      
      // Determine the error message and status code
      let message = "An unexpected error occurred";
      let statusCode = 500;
      
      if (error instanceof Error) {
        message = error.message;
        
        // Handle specific error types
        if (error.name === "ValidationError") {
          statusCode = 400;
        } else if (error.name === "NotFoundError") {
          statusCode = 404;
        } else if (error.name === "UnauthorizedError") {
          statusCode = 401;
        } else if (error.name === "ForbiddenError") {
          statusCode = 403;
        }
      }
      
      return NextResponse.json({ error: message }, { status: statusCode });
    }
  };
};

// Custom error classes for different error types
export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ValidationError";
  }
}

export class NotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "NotFoundError";
  }
}

export class UnauthorizedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "UnauthorizedError";
  }
}

export class ForbiddenError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ForbiddenError";
  }
}