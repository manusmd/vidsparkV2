import { withAuth } from "@/lib/api/middleware/withAuth";
import { withErrorHandling } from "@/lib/api/middleware/withErrorHandling";
import {
  successResponse,
  errorResponse,
} from "@/lib/api/responses/apiResponse";
import { getAccountById } from "@/services/accounts/accountService";
import { getChannelAnalytics } from "@/services/accounts/analyticsService";

export const GET = withErrorHandling(
  withAuth(
    async (
      req: Request,
      { params }: { params: Promise<{ [key: string]: string }> },
      userId: string,
    ) => {
      try {
        const { id } = await params;
        const accountData = await getAccountById(id, userId);
        const analyticsData = await getChannelAnalytics(accountData, id);
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
