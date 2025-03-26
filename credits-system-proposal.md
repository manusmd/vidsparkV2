# VidSpark Credits System Implementation Proposal

## Overview

This document outlines a comprehensive proposal for implementing a credits system in VidSpark. The credits system will require users to spend credits each time they create a video, providing a flexible way to monetize the platform while giving users control over their usage.

## Current System Analysis

VidSpark currently has:
- A tiered subscription model (Free, Pro, Business)
- Firebase Authentication for user management
- Firestore for data storage
- Stripe integration for payments
- A video creation workflow that stores videos in a Firestore collection

## Proposed Credits System

### 1. Database Schema Changes

#### User Document Extensions
Add the following fields to the user document in the "users" collection:

```typescript
interface UserCredits {
  availableCredits: number;        // Current balance of credits
  lifetimeCredits: number;         // Total credits ever acquired
  creditsExpiration?: Date;        // Optional expiration date for credits
  plan: "free" | "pro" | "business"; // User's subscription plan
}
```

#### New Collections

**Credits Transactions**
Create a "credits_transactions" collection to track credit usage and purchases:

```typescript
interface CreditTransaction {
  userId: string;
  amount: number;              // Positive for purchases, negative for usage
  balance: number;             // Balance after transaction
  type: "purchase" | "usage" | "refund" | "expiration" | "plan_allocation";
  description: string;         // E.g., "Video creation", "Monthly allocation"
  resourceId?: string;         // E.g., videoId for usage transactions
  resourceType?: string;       // E.g., "video" for usage transactions
  createdAt: Date;
  paymentId?: string;          // For purchases via Stripe
}
```

**Credit Packages**
Create a "credit_packages" collection to define available credit purchase options:

```typescript
interface CreditPackage {
  id: string;
  name: string;
  credits: number;
  price: number;               // In cents
  stripePriceId: string;       // Stripe Price ID for checkout
  isActive: boolean;
  bestValue?: boolean;         // Flag for marketing
}
```

### 2. API Endpoints

#### Credits Management

1. **GET /api/credits**
   - Returns user's current credit balance and transaction history
   - Response: `{ availableCredits: number, transactions: CreditTransaction[] }`

2. **GET /api/credits/packages**
   - Returns available credit packages for purchase
   - Response: `{ packages: CreditPackage[] }`

3. **POST /api/credits/purchase**
   - Initiates a credit purchase
   - Request: `{ packageId: string }`
   - Response: `{ checkoutUrl: string }` (Stripe checkout URL)

4. **POST /api/credits/check-availability**
   - Checks if user has enough credits for an operation
   - Request: `{ operation: string, quantity?: number }`
   - Response: `{ available: boolean, requiredCredits: number, availableCredits: number }`

#### Integration with Video Creation

Modify the existing video creation endpoint to check and deduct credits:

1. **POST /api/video**
   - Add credit check before video creation
   - Deduct credits after successful creation
   - Return error if insufficient credits

### 3. Service Layer Changes

#### New Credit Service

Create a new service `creditService.ts` with the following functions:

```typescript
// Get user's credit balance
async function getUserCredits(userId: string): Promise<UserCredits>

// Add credits to user's account
async function addCredits(userId: string, amount: number, source: string, metadata?: any): Promise<void>

// Deduct credits for an operation
async function deductCredits(userId: string, amount: number, operation: string, resourceId?: string): Promise<boolean>

// Check if user has enough credits
async function hasEnoughCredits(userId: string, amount: number): Promise<boolean>

// Get credit transaction history
async function getCreditTransactions(userId: string, limit?: number): Promise<CreditTransaction[]>

// Handle credit allocation for subscription plans
async function allocateSubscriptionCredits(userId: string, plan: string): Promise<void>
```

#### Modify Video Service

Update the `createVideo` function in `videoService.ts`:

```typescript
export async function createVideo(videoData: CreateVideoData): Promise<string> {
  const { userId } = videoData;

  // Check if user has enough credits
  const creditCost = 1; // Base cost, could vary by video type/length
  const hasCredits = await creditService.hasEnoughCredits(userId, creditCost);

  if (!hasCredits) {
    throw new Error("Insufficient credits to create video");
  }

  // Create the video
  const now = new Date().toISOString();
  const docRef = await db.collection("videos").add({
    ...videoData,
    status: "draft",
    createdAt: now,
    updatedAt: now,
  });

  // Deduct credits after successful creation
  await creditService.deductCredits(
    userId, 
    creditCost, 
    "Video creation", 
    docRef.id
  );

  return docRef.id;
}
```

### 4. UI Components

#### Credits Display

Add a credits display component to the navbar:

```tsx
// CreditBalance.component.tsx
const CreditBalance = () => {
  const { user } = useAuth();
  const { credits, isLoading } = useCredits(user?.uid);

  return (
    <div className="flex items-center gap-2">
      <CreditIcon className="h-4 w-4" />
      {isLoading ? (
        <span className="text-sm font-medium">Loading...</span>
      ) : (
        <span className="text-sm font-medium">{credits} Credits</span>
      )}
    </div>
  );
};
```

#### Credits Page

Create a dedicated credits page under settings:

```tsx
// src/app/app/settings/credits/page.tsx
export default function CreditsPage() {
  const { user } = useAuth();
  const { credits, transactions, isLoading } = useCredits(user?.uid);
  const { packages, isLoading: isLoadingPackages } = useCreditPackages();

  return (
    <div className="space-y-6">
      {/* Current Balance Card */}
      <Card>
        <CardHeader>
          <CardTitle>Credit Balance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">{credits} Credits</div>
          <p className="text-sm text-muted-foreground mt-2">
            Use credits to create and publish videos
          </p>
        </CardContent>
      </Card>

      {/* Buy Credits Section */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Buy Credits</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {packages.map(pkg => (
            <CreditPackageCard 
              key={pkg.id}
              package={pkg}
              onPurchase={handlePurchase}
            />
          ))}
        </div>
      </div>

      {/* Transaction History */}
      <Card>
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
        </CardHeader>
        <CardContent>
          <TransactionHistory transactions={transactions} />
        </CardContent>
      </Card>
    </div>
  );
}
```

#### Video Creation Integration

Modify the video creation flow to show credit requirements:

1. Add credit cost information to the video creation form
2. Show a warning if credits are low
3. Provide a direct link to purchase credits if insufficient

### 5. Subscription Plan Integration

Modify the existing subscription plans to include credits:

1. **Free Plan**: 5 credits per month
2. **Pro Plan**: 50 credits per month + rollover up to 100 credits
3. **Business Plan**: 200 credits per month + rollover up to 500 credits

Implement a monthly credit allocation function that runs on a schedule or when a user logs in after the allocation date.

### 6. Credit Pricing Model

Suggested credit packages:

1. **Starter Pack**: 10 credits for $9.99
2. **Creator Pack**: 25 credits for $19.99 ($0.80/credit)
3. **Pro Pack**: 75 credits for $49.99 ($0.67/credit)
4. **Studio Pack**: 200 credits for $99.99 ($0.50/credit)

### 7. Implementation Phases

#### Phase 1: Core Infrastructure
- Database schema updates
- Credit service implementation
- Basic API endpoints

#### Phase 2: Integration with Video Creation
- Modify video creation flow to use credits
- Add credit check before video creation
- Implement credit deduction

#### Phase 3: UI Components
- Add credit balance display
- Create credits management page
- Integrate with Stripe for purchases

#### Phase 4: Subscription Integration
- Update subscription plans to include credits
- Implement monthly credit allocation
- Add credit rollover functionality

### 8. Edge Cases and Considerations

1. **Credit Refunds**: Implement a policy for refunding credits if video creation fails
2. **Expiration Policy**: Decide if credits should expire and implement expiration logic
3. **Subscription Changes**: Handle credit adjustments when users upgrade/downgrade
4. **Bulk Operations**: Consider discounts or special handling for bulk video creation
5. **Analytics**: Track credit usage patterns to optimize pricing
6. **Grandfathering**: Consider how to handle existing users when implementing the system

### 9. Admin Dashboard for Package Management

To enable administrators to manage credit packages, we'll add a dedicated section to the admin dashboard.

#### Admin Routes

Add a new route to the admin section:

```typescript
// In src/lib/routes.ts
ADMIN: {
  // ... existing routes
  CREDIT_PACKAGES: "/app/admin/credit-packages",
}
```

#### UI Components

Create a new page for managing credit packages:

```tsx
// src/app/app/admin/credit-packages/page.tsx
export default function CreditPackagesAdmin() {
  const { packages, isLoading, error } = useAdminCreditPackages();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Credit Packages</h1>
        <Button onClick={() => setShowCreateModal(true)}>
          Create New Package
        </Button>
      </div>

      {/* Tabs for One-time vs Recurring packages */}
      <Tabs defaultValue="one-time">
        <TabsList>
          <TabsTrigger value="one-time">One-time Packages</TabsTrigger>
          <TabsTrigger value="recurring">Recurring Packages</TabsTrigger>
        </TabsList>

        <TabsContent value="one-time">
          <PackagesList 
            packages={packages.filter(p => p.type === 'one-time')}
            onEdit={handleEditPackage}
            onDelete={handleDeletePackage}
            onToggleActive={handleToggleActive}
          />
        </TabsContent>

        <TabsContent value="recurring">
          <PackagesList 
            packages={packages.filter(p => p.type === 'recurring')}
            onEdit={handleEditPackage}
            onDelete={handleDeletePackage}
            onToggleActive={handleToggleActive}
          />
        </TabsContent>
      </Tabs>

      {/* Create/Edit Package Modal */}
      <PackageFormModal 
        open={showCreateModal || !!editingPackage}
        onClose={() => {
          setShowCreateModal(false);
          setEditingPackage(null);
        }}
        package={editingPackage}
        onSubmit={handleSubmitPackage}
      />
    </div>
  );
}
```

Create reusable components for the package management UI:

1. **PackagesList**: A table/grid component to display packages with actions
2. **PackageFormModal**: A modal for creating/editing packages
3. **PackageAnalytics**: A component to show usage statistics for each package

#### API Endpoints

Add new admin-only API endpoints for managing packages:

1. **GET /api/admin/credit-packages**
   - Returns all credit packages (both one-time and recurring)
   - Response: `{ packages: (CreditPackage & { usage: { purchases: number, revenue: number } })[] }`

2. **POST /api/admin/credit-packages**
   - Creates a new credit package
   - Request: 
     ```typescript
     { 
       name: string;
       credits: number;
       price: number;
       type: "one-time" | "recurring";
       interval?: "month" | "year";  // For recurring packages
       isActive: boolean;
       bestValue?: boolean;
     }
     ```
   - Response: `{ id: string, success: boolean }`

3. **PUT /api/admin/credit-packages/:id**
   - Updates an existing credit package
   - Request: Same as POST but with partial fields
   - Response: `{ success: boolean }`

4. **DELETE /api/admin/credit-packages/:id**
   - Deletes a credit package (or marks as inactive)
   - Response: `{ success: boolean }`

5. **GET /api/admin/credit-packages/analytics**
   - Returns analytics data for all packages
   - Response: `{ totalRevenue: number, packageStats: { [packageId]: { purchases: number, revenue: number } } }`

#### Extended Database Schema

Update the credit package schema to support both one-time and recurring packages:

```typescript
interface CreditPackage {
  id: string;
  name: string;
  credits: number;
  price: number;               // In cents
  type: "one-time" | "recurring";
  interval?: "month" | "year"; // For recurring packages
  stripePriceId: string;       // Stripe Price ID for checkout
  isActive: boolean;
  bestValue?: boolean;         // Flag for marketing
  createdAt: Date;
  updatedAt: Date;
}
```

#### Access Control

Ensure that only administrators can access the package management functionality:

1. Add server-side middleware to verify admin role for all `/api/admin/*` routes
2. Add client-side checks using the `isAdmin` property from `useAuth()`
3. Implement proper error handling for unauthorized access attempts

#### Implementation Workflow

1. Create a new credit package:
   - Admin fills out the package form (name, credits, price, type, etc.)
   - For recurring packages, specify the billing interval
   - System creates the package in Firestore
   - System creates corresponding product and price in Stripe
   - Package is now available for purchase by users

2. Edit a credit package:
   - Admin can modify non-critical fields (name, description, isActive, bestValue)
   - Price and credit amount changes create a new Stripe price ID
   - Old purchases continue to use the original terms

3. Deactivate a package:
   - Admin can toggle the isActive status
   - Inactive packages are not shown to users but remain in the database
   - Existing subscriptions to inactive packages continue to work

### 10. Technical Considerations

1. **Transaction Consistency**: Use Firestore transactions to ensure credit operations are atomic
2. **Caching**: Implement caching for credit balances to reduce database reads
3. **Rate Limiting**: Prevent abuse by implementing rate limits on credit-consuming operations
4. **Monitoring**: Add monitoring for credit-related errors and unusual patterns
5. **Testing**: Create comprehensive tests for credit operations
6. **Stripe Integration**: Ensure proper synchronization between Firestore packages and Stripe products/prices

## Conclusion

The proposed credits system provides a flexible way to monetize VidSpark while giving users control over their usage. By integrating with the existing subscription model, it creates multiple revenue streams and encourages user engagement through the "pay-as-you-go" model for power users while maintaining predictable costs for regular users through subscription allocations.

The admin dashboard for package management gives administrators full control over the credit packages offered to users, allowing them to create and manage both one-time purchases and recurring subscriptions.

The implementation can be phased to minimize disruption to existing users while providing immediate value through the new monetization channel.
