import { withAuth } from "@/lib/api/middleware/withAuth";
import { withErrorHandling } from "@/lib/api/middleware/withErrorHandling";
import {
  successResponse,
  errorResponse,
} from "@/lib/api/responses/apiResponse";
import { getAccountById } from "@/services/accounts/accountService";
import { getChannelAnalytics } from "@/services/accounts/analyticsService";

/**
 * GET handler for /api/accounts/[id]/analytics
 * Returns analytics data for a YouTube channel
 */
export const GET = withErrorHandling(
  withAuth(
    async (
      req: Request,
      { params }: { params: { id: string } },
      userId: string,
    ) => {
      try {
        const accountId = params.id;

        // Get account data and verify ownership
        const accountData = await getAccountById(accountId, userId);

        // Get analytics data
        const analyticsData = await getChannelAnalytics(accountData, accountId);

        // Return success response
        return successResponse(analyticsData);
      } catch (error) {
        console.error("Error fetching analytics:", error);
        const message =
          error instanceof Error ? error.message : "Unknown error occurred";
        return errorResponse(message, 500);
      }
    },
  ),
);
