"use client";

import { useDataContext } from "@/contexts/DataContext";

/**
 * A unified hook to access all cached data from the DataContext
 * This provides a simple way to access all prefetched data at once
 */
export function useCachedData() {
  const {
    // Content Types
    contentTypes,
    contentTypesLoading,
    contentTypesError,
    
    // Image Types
    imageTypes,
    imageTypesLoading,
    imageTypesError,
    
    // Voices
    voices,
    voicesLoading,
    voicesError,
    
    // User Videos
    userVideos,
    userVideosLoading,
    userVideosError,
  } = useDataContext();
  
  // Calculate overall loading state
  const isLoading = contentTypesLoading || imageTypesLoading || voicesLoading || userVideosLoading;
  
  // Calculate if any errors exist
  const hasError = !!(contentTypesError || imageTypesError || voicesError || userVideosError);
  
  // Combine all error messages if any exist
  const errorMessage = hasError 
    ? [
        contentTypesError, 
        imageTypesError, 
        voicesError, 
        userVideosError
      ].filter(Boolean).join(", ") 
    : null;
  
  return {
    // All data combined in a single object
    data: {
      contentTypes,
      imageTypes,
      voices,
      userVideos,
    },
    
    // Simple loading state for all data
    isLoading,
    
    // Error state and message
    hasError,
    errorMessage,
    
    // Individual loading states
    loadingStates: {
      contentTypesLoading,
      imageTypesLoading,
      voicesLoading,
      userVideosLoading,
    },
    
    // Individual error states
    errors: {
      contentTypesError,
      imageTypesError,
      voicesError,
      userVideosError,
    },
  };
} 