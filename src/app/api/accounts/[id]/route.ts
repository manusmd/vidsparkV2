import { withAuth } from "@/lib/api/middleware/withAuth";
import { withErrorHandling } from "@/lib/api/middleware/withErrorHandling";
import {
  successResponse,
  errorResponse,
} from "@/lib/api/responses/apiResponse";
import { deleteAccount } from "@/services/accounts/accountService";

export const DELETE = withErrorHandling(
  withAuth(
    async (
      req: Request,
      { params }: { params: Record<string, Promise<string>> },
      userId: string,
    ) => {
      try {
        const id = await params.id;
        await deleteAccount(id, userId);
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
