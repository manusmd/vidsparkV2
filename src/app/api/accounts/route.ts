import { withAuth } from "@/lib/api/middleware/withAuth";
import { withErrorHandling } from "@/lib/api/middleware/withErrorHandling";
import {
  successResponse,
  errorResponse,
} from "@/lib/api/responses/apiResponse";
import {
  getUserAccounts,
  createAccount,
} from "@/services/accounts/accountService";

/**
 * GET handler for /api/accounts
 * Returns all accounts for the authenticated user
 */
export const GET = withErrorHandling(
  withAuth(
    async (
      req: Request,
      context: { params: Record<string, Promise<string>> },
      userId: string,
    ) => {
      try {
        // Get all accounts for the user
        const accounts = await getUserAccounts(userId);

        // Return success response
        return successResponse({ accounts });
      } catch (error) {
        console.error("Error fetching accounts:", error);
        const message =
          error instanceof Error ? error.message : "Unknown error occurred";
        return errorResponse(message, 500);
      }
    },
  ),
);

/**
 * POST handler for /api/accounts
 * Creates a new account
 */
export const POST = withErrorHandling(
  withAuth(
    async (
      req: Request,
      context: { params: Record<string, Promise<string>> },
      userId: string,
    ) => {
      try {
        // Parse request body
        const body = await req.json();

        // Add userId to the account data
        const accountData = {
          ...body,
          userId,
        };

        // Create the account
        const accountId = await createAccount(accountData);

        // Return success response
        return successResponse({ id: accountId }, 201);
      } catch (error) {
        console.error("Error creating account:", error);
        const message =
          error instanceof Error ? error.message : "Unknown error occurred";
        return errorResponse(message, 500);
      }
    },
  ),
);
