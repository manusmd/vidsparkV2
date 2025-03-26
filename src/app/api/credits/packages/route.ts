import { NextResponse } from "next/server";
import { getCreditPackages } from "@/services/credits/creditService";

export async function GET() {
  try {
    // Get all active credit packages
    const packages = await getCreditPackages();

    return NextResponse.json({ packages });
  } catch (error) {
    console.error("Error fetching credit packages:", error);
    return NextResponse.json(
      { error: "Failed to fetch credit packages" },
      { status: 500 }
    );
  }
}