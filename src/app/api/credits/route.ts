import { NextResponse } from "next/server";
import {
  getUserCredits,
  getUserTransactions,
} from "@/services/credits/creditService";
import { withAuth } from "@/lib/api/middleware/withAuth";

export const GET = withAuth(async (req, context, userId) => {
  try {
    // Get user credits and transactions
    const credits = await getUserCredits(userId);
    const transactions = await getUserTransactions(userId);

    return NextResponse.json({ credits, transactions });
  } catch (error) {
    console.error("Error fetching user credits:", error);
    return NextResponse.json(
      { error: "Failed to fetch credits" },
      { status: 500 },
    );
  }
});
