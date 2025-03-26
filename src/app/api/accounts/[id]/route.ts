import { withAuth } from "@/lib/api/middleware/withAuth";
import { withErrorHandling } from "@/lib/api/middleware/withErrorHandling";
import {
  successResponse,
  errorResponse,
} from "@/lib/api/responses/apiResponse";
import { deleteAccount } from "@/services/accounts/accountService";

/**
 * DELETE handler for /api/accounts/[id]
 * Deletes an account by ID
 */
export const DELETE = withErrorHandling(
  withAuth(
    async (
      req: Request,
      { params }: { params: { id: string } },
      userId: string,
    ) => {
      try {
        const accountId = params.id;

        // Delete the account (this will also verify ownership)
        await deleteAccount(accountId, userId);

        // Return success response
        return successResponse({ message: "Account deleted successfully" });
      } catch (error) {
        console.error("Error deleting account:", error);
        const message =
          error instanceof Error ? error.message : "Unknown error occurred";
        return errorResponse(message, 500);
      }
    },
  ),
);
