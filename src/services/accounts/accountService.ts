import { db } from "@/lib/firebaseAdmin";
import { google } from "googleapis";
import { NotFoundError, UnauthorizedError } from "@/lib/api/middleware/withErrorHandling";

// Define interfaces for type safety
export interface AccountData {
  userId: string;
  token: string;
  refreshToken: string;
  accountId: string;
  [key: string]: unknown; // For other properties
}

export interface CreateAccountData {
  userId: string;
  token: string;
  refreshToken: string;
  accountId: string;
  [key: string]: unknown; // For other properties
}

/**
 * Fetches an account by ID and verifies ownership
 * @param accountId The account ID to fetch
 * @param userId The user ID to verify ownership
 * @returns The account data
 * @throws NotFoundError if the account doesn't exist
 * @throws UnauthorizedError if the user doesn't own the account
 */
export async function getAccountById(accountId: string, userId: string): Promise<AccountData> {
  const accountDoc = await db.collection("accounts").doc(accountId).get();

  if (!accountDoc.exists) {
    throw new NotFoundError("Account not found");
  }

  const accountData = accountDoc.data() as AccountData;
  if (!accountData) {
    throw new NotFoundError("Account data not found");
  }

  if (accountData.userId !== userId) {
    throw new UnauthorizedError("You don't have permission to access this account");
  }

  return accountData;
}

/**
 * Creates an OAuth2 client for the account
 * @param accountData The account data
 * @returns The OAuth2 client
 */
export function createOAuth2Client(accountData: AccountData) {
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID!,
    process.env.GOOGLE_CLIENT_SECRET!
  );

  oauth2Client.setCredentials({
    access_token: accountData.token,
    refresh_token: accountData.refreshToken,
  });

  return oauth2Client;
}

/**
 * Refreshes the OAuth2 token for an account
 * @param accountId The account ID
 * @param oauth2Client The OAuth2 client
 * @param currentRefreshToken The current refresh token
 * @returns The updated OAuth2 client
 */
export async function refreshOAuth2Token(
  accountId: string,
  oauth2Client: ReturnType<typeof createOAuth2Client>,
  currentRefreshToken: string
) {
  try {
    const { credentials } = await oauth2Client.refreshAccessToken();

    // Update the token in the database
    await db.collection("accounts").doc(accountId).update({
      token: credentials.access_token,
      refreshToken: credentials.refresh_token || currentRefreshToken,
    });

    // Update the client credentials
    oauth2Client.setCredentials({
      access_token: credentials.access_token,
      refresh_token: credentials.refresh_token || currentRefreshToken,
    });

    return oauth2Client;
  } catch (error) {
    console.error("Failed to refresh access token:", error);
    throw new Error("Failed to refresh access token");
  }
}

/**
 * Gets all accounts for a user
 * @param userId The user ID
 * @returns Array of accounts
 */
export async function getUserAccounts(userId: string): Promise<Array<AccountData & { id: string }>> {
  const snapshot = await db
    .collection("accounts")
    .where("userId", "==", userId)
    .get();

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...(doc.data() as AccountData),
  }));
}

/**
 * Creates a new account
 * @param accountData The account data
 * @returns The ID of the created account
 */
export async function createAccount(accountData: CreateAccountData): Promise<string> {
  const docRef = await db.collection("accounts").add({
    ...accountData,
    createdAt: new Date().toISOString(),
  });

  return docRef.id;
}

/**
 * Deletes an account
 * @param accountId The account ID to delete
 * @param userId The user ID to verify ownership
 * @returns Promise that resolves when the account is deleted
 */
export async function deleteAccount(accountId: string, userId: string): Promise<void> {
  // Verify ownership first
  await getAccountById(accountId, userId);

  // Delete the account
  await db.collection("accounts").doc(accountId).delete();
}
