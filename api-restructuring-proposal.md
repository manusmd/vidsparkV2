# API Restructuring Proposal

## Current Structure Issues
After analyzing the current API folder structure, I've identified the following issues:

1. **Large Route Handlers**: Some route handlers (like accounts/[id]/analytics/route.ts) are very large (372 lines) and contain a lot of business logic that could be extracted.
2. **Deep Nesting**: Some API endpoints have very deep nesting (e.g., /api/video/youtube/upload/callback).
3. **No Service Layer**: There's no dedicated service layer for API functionality, leading to business logic being mixed with route handling.
4. **Inconsistent Error Handling**: Error handling patterns vary across different route handlers.
5. **Limited Code Reuse**: There's limited reuse of common functionality across route handlers.

## Proposed Structure

I recommend restructuring the API folder following these principles:

### 1. Create a Service Layer

Create a new directory structure in `src/services` to encapsulate business logic:

```
src/
  services/
    accounts/
      accountService.ts
      analyticsService.ts
    video/
      videoService.ts
      youtubeService.ts
    contentTypes/
      contentTypeService.ts
    videoTypes/
      videoTypeService.ts
    music/
      musicService.ts
    openai/
      storyService.ts
    elevenlabs/
      voiceService.ts
```

Each service file would contain functions that implement the business logic for the corresponding domain.

### 2. Simplify API Routes

Keep the API routes in `src/app/api` but simplify them to delegate to the service layer:

```
src/app/api/
  accounts/
    route.ts
    [id]/
      route.ts
      analytics/
        route.ts
  video/
    route.ts
    generate/
      route.ts
    render/
      route.ts
    ...
  ...
```

Each route.ts file would be much simpler, focusing on:
- Request validation
- Authentication
- Calling the appropriate service function
- Response formatting

### 3. Create Shared Utilities

Create shared utilities for common functionality:

```
src/lib/
  api/
    middleware/
      withAuth.ts
      withErrorHandling.ts
    responses/
      apiResponse.ts
    validation/
      validateRequest.ts
```

These utilities would help standardize common patterns across API routes.

### 4. Implement Controller Pattern

For complex domains, implement a controller pattern:

```
src/controllers/
  accountsController.ts
  videoController.ts
  ...
```

Controllers would coordinate between multiple services and handle complex workflows.

## Example Implementation

Here's how the accounts/[id]/analytics route would be restructured:

1. **Service Layer**:
```typescript
// src/services/accounts/analyticsService.ts
export async function getChannelAnalytics(channelId: string, userId: string) {
  // Fetch channel data
  // Refresh OAuth2 token
  // Fetch channel statistics
  // Process data
  return { /* analytics data */ };
}
```

2. **API Route**:
```typescript
// src/app/api/accounts/[id]/analytics/route.ts
import { NextResponse } from "next/server";
import { withAuth } from "@/lib/api/middleware/withAuth";
import { getChannelAnalytics } from "@/services/accounts/analyticsService";

export const GET = withAuth(async (req, { params }, userId) => {
  try {
    const channelId = params.id;
    const analytics = await getChannelAnalytics(channelId, userId);
    return NextResponse.json(analytics);
  } catch (error) {
    console.error("Error fetching analytics:", error);
    return NextResponse.json(
      { error: "Failed to fetch analytics" },
      { status: 500 }
    );
  }
});
```

## Benefits of Restructuring

1. **Improved Maintainability**: Smaller, focused files that are easier to understand and maintain.
2. **Better Testability**: Business logic in services can be tested independently of the API routes.
3. **Code Reuse**: Common functionality is extracted into shared utilities.
4. **Separation of Concerns**: Clear separation between route handling, business logic, and data access.
5. **Consistency**: Standardized patterns for authentication, error handling, and response formatting.

## Implementation Strategy

1. Create the new directory structure
2. Implement shared utilities and middleware
3. Extract business logic into service files
4. Refactor API routes to use the service layer
5. Update tests to reflect the new structure

This restructuring can be done incrementally, starting with the most complex routes (like accounts/[id]/analytics) and gradually moving to simpler ones.