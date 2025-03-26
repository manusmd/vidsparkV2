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
    CREATE: "/app/create",
    HISTORY: "/app/history",
    VIDEOS: {
      INDEX: "/app/videos",
      DETAIL: (id: string) => `/app/videos/${id}`,
    },
    SETTINGS: {
      INDEX: "/app/settings",
      PROFILE: "/app/settings/profile",
      CONNECTED_ACCOUNTS: "/app/settings/connected-accounts",
      PREFERENCES: "/app/settings/preferences",
      BILLING: "/app/settings/billing",
    },
    ADMIN: {
      INDEX: "/app/admin",
      CONTENT_TYPES: "/app/admin/content-types",
      VIDEO_TYPES: "/app/admin/video-types",
      MUSIC: "/app/admin/music",
      USERS: "/app/admin/users",
      SETTINGS: "/app/admin/settings",
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

  // Video types
  VIDEO_TYPES: {
    BASE: "/api/videotypes",
    GENERATE_IMAGE: "/api/videotypes/generateImage",
    DETAIL: (id: string) => `/api/videotypes/${id}`,
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
