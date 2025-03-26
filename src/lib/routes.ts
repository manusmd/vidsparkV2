/**
 * Central file for all application routes
 * This file exports objects containing all routes used in the application
 * When a route needs to be changed, it should only be changed here
 */

// Page routes
export const PAGES = {
  // Home and main pages
  HOME: "/",

  // Auth pages
  AUTH: {
    SIGNIN: "/auth/signin",
    SIGNUP: "/auth/signup",
  },

  // App pages (authenticated)
  APP: {
    // Dashboard
    DASHBOARD: "/app/dashboard",
    // Content Creation
    CREATE: "/app/create",
    MY_VIDEOS: {
      INDEX: "/app/my-videos",
      ALL: "/app/my-videos/all",
      DRAFTS: "/app/my-videos/drafts",
      PUBLISHED: "/app/my-videos/published",
      ARCHIVED: "/app/my-videos/archived",
    },
    // Legacy - to be removed after migration
    HISTORY: "/app/history",
    VIDEOS: {
      INDEX: "/app/videos",
      DETAIL: (id: string) => `/app/videos/${id}`,
    },
    // Account Management
    ANALYTICS: {
      INDEX: "/app/analytics",
      OVERVIEW: "/app/analytics/overview",
      CHANNEL: "/app/analytics/channel",
      VIDEO: "/app/analytics/video",
    },
    SETTINGS: {
      INDEX: "/app/settings",
      PROFILE: "/app/settings/profile",
      CONNECTED_ACCOUNTS: "/app/settings/connected-accounts",
      BILLING: "/app/settings/billing",
      CREDITS: "/app/settings/credits",
    },
    // Administration
    ADMIN: {
      INDEX: "/app/admin",
      CONTENT_TYPES: "/app/admin/content-types",
      IMAGE_TYPES: "/app/admin/image-types",
      MUSIC: "/app/admin/music",
      USERS: "/app/admin/users",
      SETTINGS: "/app/admin/settings",
      PRODUCTS: "/app/admin/products",
    },
  },
};

// API routes
export const API = {
  // Video related endpoints
  VIDEO: {
    BASE: "/api/video",
    GET_USER_VIDEOS: "/api/video/get-user-videos",
    RENDER: "/api/video/render",
    GENERATE: "/api/video/generate",
    STYLING: "/api/video/styling",
    MUSIC: "/api/video/music",
    YOUTUBE: {
      UPLOAD: "/api/video/youtube/upload",
      CALLBACK: "/api/video/youtube/upload/callback",
    },
  },

  // Account related endpoints
  ACCOUNTS: {
    BASE: "/api/accounts",
    CONNECT: "/api/accounts/connect",
    CONNECT_CALLBACK: "/api/accounts/connect/callback",
    ANALYTICS: (id: string) => `/api/accounts/${id}/analytics`,
    DETAIL: (id: string) => `/api/accounts/${id}`,
  },

  // Content types
  CONTENT_TYPES: {
    BASE: "/api/contenttypes",
    DETAIL: (id: string) => `/api/contenttypes/${id}`,
  },

  // Image types
  IMAGE_TYPES: {
    BASE: "/api/imagetypes",
    GENERATE_IMAGE: "/api/imagetypes/generateImage",
    DETAIL: (id: string) => `/api/imagetypes/${id}`,
  },

  // Music
  MUSIC: {
    BASE: "/api/music",
    UPLOAD: "/api/music/upload",
    DETAIL: (id: string) => `/api/music/${id}`,
  },

  // External services
  OPENAI: {
    STORY_REQUEST: "/api/openai/storyrequest",
    STORY_IDEA: "/api/openai/storyidea",
  },

  ELEVENLABS: {
    VOICES: "/api/elevenlabs/voices",
  },
};

// Export a default object with all routes for convenience
const ROUTES = {
  PAGES,
  API,
};

export default ROUTES;
