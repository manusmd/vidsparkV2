"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import ROUTES from "@/lib/routes";
import type { ContentType, ImageType, Video as VideoType, Account, VideoTemplate } from "@/app/types";
import { useAuth } from "@/hooks/useAuth";

interface Voice {
  id: string;
  name: string;
  labels: {
    accent?: string;
    age?: string;
    description?: string;
    gender?: string;
    use_case?: string;
  };
}

interface Video extends VideoType {
  youtubeVideoId?: string;
  youtubeStats?: {
    views: number;
    likes: number;
    comments: number;
  };
}

interface ChannelStats {
  viewCount: number;
  subscriberCount: number;
  videoCount: number;
}

interface BestPostingDay {
  day: string;
  dayName: string;
  totalViews: number;
  totalWatchTime: number;
  count: number;
  avgViews: number;
  avgWatchTime: number;
}

interface BestPostingHour {
  hour: string;
  hourFormatted: string;
  totalViews: number;
  totalWatchTime: number;
  count: number;
  avgViews: number;
  avgWatchTime: number;
  day: string;
}

interface VideoAnalysis {
  videosAnalyzed: number;
  dataSource: "channel_videos" | "analytics_api";
  dateRange: {
    start: string;
    end: string;
  };
  description: string;
}

interface ChannelAnalytics {
  channelStats: ChannelStats;
  bestPostingTimes: {
    days: BestPostingDay[];
    hours: BestPostingHour[];
    hoursByDay: { [day: string]: BestPostingHour[] };
  };
  videoAnalysis: VideoAnalysis;
}

interface AccountWithAnalytics extends Account {
  analytics?: ChannelAnalytics;
}

interface DataContextType {
  // Content Types
  contentTypes: ContentType[];
  contentTypesLoading: boolean;
  contentTypesError: string | null;
  refreshContentTypes: () => Promise<ContentType[]>;
  createContentType: (contentData: Partial<ContentType>) => Promise<ContentType>;
  updateContentType: (id: string, contentData: Partial<ContentType>) => Promise<ContentType>;
  deleteContentType: (id: string) => Promise<void>;
  generateContentTypeImage: (prompt: string) => Promise<string>;
  
  // Templates
  templates: VideoTemplate[];
  templatesLoading: boolean;
  templatesError: string | null;
  refreshTemplates: () => Promise<VideoTemplate[]>;
  createTemplate: (templateData: Partial<VideoTemplate>) => Promise<VideoTemplate>;
  updateTemplate: (id: string, templateData: Partial<VideoTemplate>) => Promise<VideoTemplate>;
  deleteTemplate: (id: string) => Promise<void>;
  
  // Image Types
  imageTypes: ImageType[];
  imageTypesLoading: boolean;
  imageTypesError: string | null;
  refreshImageTypes: () => Promise<ImageType[]>;
  createImageType: (imageTypeData: Partial<ImageType>) => Promise<ImageType>;
  updateImageType: (id: string, imageTypeData: Partial<ImageType>) => Promise<ImageType>;
  deleteImageType: (id: string) => Promise<void>;
  generateImageTypeImage: (prompt: string) => Promise<string>;
  
  // Voices
  voices: Voice[];
  voicesLoading: boolean;
  voicesError: string | null;
  refreshVoices: () => Promise<Voice[]>;
  
  // User Videos
  userVideos: Video[];
  userVideosLoading: boolean;
  userVideosError: string | null;
  refreshUserVideos: () => Promise<Video[]>;
  
  // Accounts
  accounts: Account[];
  accountsLoading: boolean;
  accountsError: string | null;
  refreshAccounts: () => Promise<Account[]>;
  connectAccount: () => Promise<void>;
  deleteAccount: (id: string) => Promise<void>;
  
  // Analytics
  accountsWithAnalytics: AccountWithAnalytics[];
  analyticsLoading: boolean;
  analyticsError: string | null;
  refreshAnalytics: (accountId: string) => Promise<ChannelAnalytics | null>;
  refreshAllAnalytics: () => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function useDataContext() {
  const context = useContext(DataContext);
  
  if (context === undefined) {
    throw new Error("useDataContext must be used within a DataProvider");
  }
  
  return context;
}

interface DataProviderProps {
  children: ReactNode;
}

export function DataProvider({ children }: DataProviderProps) {
  const { user } = useAuth();
  // Content Types state
  const [contentTypes, setContentTypes] = useState<ContentType[]>([]);
  const [contentTypesLoading, setContentTypesLoading] = useState(true);
  const [contentTypesError, setContentTypesError] = useState<string | null>(null);
  
  // Image Types state
  const [imageTypes, setImageTypes] = useState<ImageType[]>([]);
  const [imageTypesLoading, setImageTypesLoading] = useState(true);
  const [imageTypesError, setImageTypesError] = useState<string | null>(null);
  
  // Templates state
  const [templates, setTemplates] = useState<VideoTemplate[]>([]);
  const [templatesLoading, setTemplatesLoading] = useState(true);
  const [templatesError, setTemplatesError] = useState<string | null>(null);
  
  // Voices state
  const [voices, setVoices] = useState<Voice[]>([]);
  const [voicesLoading, setVoicesLoading] = useState(true);
  const [voicesError, setVoicesError] = useState<string | null>(null);
  
  // User Videos state
  const [userVideos, setUserVideos] = useState<Video[]>([]);
  const [userVideosLoading, setUserVideosLoading] = useState(true);
  const [userVideosError, setUserVideosError] = useState<string | null>(null);
  
  // Accounts state
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [accountsLoading, setAccountsLoading] = useState(true);
  const [accountsError, setAccountsError] = useState<string | null>(null);
  
  // Analytics state
  const [accountsWithAnalytics, setAccountsWithAnalytics] = useState<AccountWithAnalytics[]>([]);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);
  const [analyticsError, setAnalyticsError] = useState<string | null>(null);

  // Fetch Content Types
  const fetchContentTypes = async () => {
    setContentTypesLoading(true);
    try {
      const res = await fetch(ROUTES.API.CONTENT_TYPES.BASE);
      if (!res.ok) {
        throw new Error("Failed to fetch content types");
      }
      const data: ContentType[] = await res.json();
      setContentTypes(data);
      return data;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error occurred";
      setContentTypesError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setContentTypesLoading(false);
    }
  };

  // Fetch Image Types
  const fetchImageTypes = async () => {
    setImageTypesLoading(true);
    try {
      const res = await fetch(ROUTES.API.IMAGE_TYPES.BASE);
      if (!res.ok) {
        throw new Error("Failed to fetch image types");
      }
      const data: ImageType[] = await res.json();
      setImageTypes(data);
      return data;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error occurred";
      setImageTypesError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setImageTypesLoading(false);
    }
  };

  // Fetch Voices
  const fetchVoices = async () => {
    setVoicesLoading(true);
    try {
      const res = await fetch(ROUTES.API.ELEVENLABS.VOICES);
      if (!res.ok) {
        throw new Error("Failed to fetch voices");
      }
      const data = await res.json();
      setVoices(data.voices);
      return data.voices;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error occurred";
      setVoicesError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setVoicesLoading(false);
    }
  };

  // Fetch User Videos
  const fetchUserVideos = async () => {
    if (!user) {
      return [];
    }
    
    setUserVideosLoading(true);
    try {
      const token = await user.getIdToken();
      const res = await fetch(ROUTES.API.VIDEO.GET_USER_VIDEOS, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (!res.ok) {
        const errorData = await res.text();
        throw new Error(`Failed to fetch user videos: ${res.status} ${res.statusText}`);
      }
      
      const data = await res.json();
      
      // Handle different response formats
      let videos;
      if (Array.isArray(data)) {
        videos = data;
      } else if (data.videos && Array.isArray(data.videos)) {
        videos = data.videos;
      } else {
        videos = [];
      }
      
      setUserVideos(videos);
      return videos;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error occurred";
      setUserVideosError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setUserVideosLoading(false);
    }
  };

  // Content Types CRUD operations
  const createContentType = async (contentData: Partial<ContentType>) => {
    try {
      const res = await fetch(ROUTES.API.CONTENT_TYPES.BASE, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(contentData),
      });
      if (!res.ok) {
        throw new Error("Failed to create content type");
      }
      const newType = await res.json();
      setContentTypes((prev) => [...prev, newType]);
      return newType;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error occurred";
      throw new Error(errorMessage);
    }
  };

  const updateContentType = async (id: string, contentData: Partial<ContentType>) => {
    try {
      const res = await fetch(ROUTES.API.CONTENT_TYPES.DETAIL(id), {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(contentData),
      });
      if (!res.ok) {
        throw new Error("Failed to update content type");
      }
      const updatedType = await res.json();
      setContentTypes((prev) => prev.map((ct) => (ct.id === id ? updatedType : ct)));
      return updatedType;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error occurred";
      throw new Error(errorMessage);
    }
  };

  const deleteContentType = async (id: string) => {
    try {
      const res = await fetch(ROUTES.API.CONTENT_TYPES.DETAIL(id), {
        method: "DELETE",
      });
      if (!res.ok) {
        throw new Error("Failed to delete content type");
      }
      setContentTypes((prev) => prev.filter((ct) => ct.id !== id));
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error occurred";
      throw new Error(errorMessage);
    }
  };

  // Generate content type image
  const generateContentTypeImage = async (prompt: string): Promise<string> => {
    try {
      const res = await fetch(ROUTES.API.CONTENT_TYPES.GENERATE_IMAGE, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });
      if (!res.ok) {
        throw new Error("Failed to generate image for content type");
      }
      const data = await res.json();
      return data.imageUrl;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error occurred";
      throw new Error(errorMessage);
    }
  };

  // Image Types CRUD operations
  const createImageType = async (imageTypeData: Partial<ImageType>) => {
    try {
      const res = await fetch(ROUTES.API.IMAGE_TYPES.BASE, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(imageTypeData),
      });
      if (!res.ok) {
        throw new Error("Failed to create image type");
      }
      const newType = await res.json();
      setImageTypes((prev) => [...prev, newType]);
      return newType;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error occurred";
      throw new Error(errorMessage);
    }
  };

  const updateImageType = async (id: string, imageTypeData: Partial<ImageType>) => {
    try {
      const res = await fetch(ROUTES.API.IMAGE_TYPES.DETAIL(id), {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(imageTypeData),
      });
      if (!res.ok) {
        throw new Error("Failed to update image type");
      }
      const updatedType = await res.json();
      setImageTypes((prev) => prev.map((it) => (it.id === id ? updatedType : it)));
      return updatedType;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error occurred";
      throw new Error(errorMessage);
    }
  };

  const deleteImageType = async (id: string) => {
    try {
      const res = await fetch(ROUTES.API.IMAGE_TYPES.DETAIL(id), {
        method: "DELETE",
      });
      if (!res.ok) {
        throw new Error("Failed to delete image type");
      }
      setImageTypes((prev) => prev.filter((it) => it.id !== id));
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error occurred";
      throw new Error(errorMessage);
    }
  };

  const generateImageTypeImage = async (prompt: string): Promise<string> => {
    try {
      const res = await fetch(ROUTES.API.IMAGE_TYPES.GENERATE_IMAGE, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });
      if (!res.ok) {
        throw new Error("Failed to generate image");
      }
      const { imageUrl } = await res.json();
      return imageUrl;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error occurred";
      throw new Error(errorMessage);
    }
  };

  // Helper for auth headers
  const getAuthHeader = async (): Promise<Record<string, string>> => {
    if (user) {
      const token = await user.getIdToken();
      return { Authorization: `Bearer ${token}` };
    }
    return {};
  };
  
  // Fetch Accounts
  const fetchAccounts = async () => {
    if (!user) {
      return [];
    }
    
    setAccountsLoading(true);
    try {
      const headers = await getAuthHeader();
      const res = await fetch(ROUTES.API.ACCOUNTS.BASE, { headers });
      const data = await res.json();

      // Ensure accounts is always an array
      let accountsList: Account[] = [];
      if (data && data.data && Array.isArray(data.data.accounts)) {
        accountsList = data.data.accounts;
      }
      
      setAccounts(accountsList);
      return accountsList;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error occurred";
      setAccountsError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setAccountsLoading(false);
    }
  };
  
  // Connect Account (YouTube)
  const connectAccount = async () => {
    try {
      if (!user) {
        throw new Error("User not authenticated");
      }
      const res = await fetch(`${ROUTES.API.ACCOUNTS.CONNECT}?userId=${user.uid}`);
      const { url } = await res.json();
      const popupWindow = window.open(url, "_blank", "width=500,height=600");

      // Poll for window closure to refresh accounts
      if (popupWindow) {
        const checkClosed = setInterval(() => {
          if (popupWindow.closed) {
            clearInterval(checkClosed);
            fetchAccounts(); // Refresh the accounts list
          }
        }, 1000);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error occurred";
      throw new Error(errorMessage);
    }
  };
  
  // Delete Account
  const deleteAccount = async (id: string) => {
    try {
      const headers = await getAuthHeader();
      const res = await fetch(ROUTES.API.ACCOUNTS.DETAIL(id), {
        method: "DELETE",
        headers,
      });
      if (!res.ok) throw new Error("Failed to delete account");
      await fetchAccounts();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error occurred";
      throw new Error(errorMessage);
    }
  };
  
  // Fetch Analytics for a single account
  const fetchAnalytics = async (accountId: string): Promise<ChannelAnalytics | null> => {
    if (!user || !accountId) {
      return null;
    }
    
    try {
      const headers = await getAuthHeader();
      const res = await fetch(`/api/accounts/${accountId}/analytics`, { headers });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to fetch analytics");
      }

      const responseData = await res.json();
      return responseData.data;
    } catch (err: unknown) {
      setAnalyticsError(err instanceof Error ? err.message : "Unknown error occurred");
      return null;
    }
  };
  
  // Fetch Analytics for all accounts
  const fetchAllAnalytics = async () => {
    if (!user || accounts.length === 0) {
      setAnalyticsLoading(false);
      return;
    }
    
    setAnalyticsLoading(true);
    try {
      const accountsWithData: AccountWithAnalytics[] = [...accounts];
      
      // Fetch analytics for each account in parallel
      const analyticsPromises = accounts.map(account => 
        fetchAnalytics(account.id)
          .then(analytics => {
            if (analytics) {
              const index = accountsWithData.findIndex(a => a.id === account.id);
              if (index !== -1) {
                accountsWithData[index] = {
                  ...accountsWithData[index],
                  analytics
                };
              }
            }
          })
      );
      
      await Promise.allSettled(analyticsPromises);
      setAccountsWithAnalytics(accountsWithData);
      
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error occurred";
      setAnalyticsError(errorMessage);
    } finally {
      setAnalyticsLoading(false);
    }
  };

  // Templates CRUD operations
  const fetchTemplates = async () => {
    if (!user) {
      setTemplatesLoading(false);
      return [];
    }
    
    setTemplatesLoading(true);
    setTemplatesError(null);
    
    try {
      const headers = await getAuthHeader();
      const res = await fetch(ROUTES.API.TEMPLATES.BASE, { headers });
      if (!res.ok) {
        throw new Error("Failed to fetch templates");
      }
      const data: VideoTemplate[] = await res.json();
      setTemplates(data);
      setTemplatesLoading(false);
      return data;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error occurred";
      setTemplatesError(errorMessage);
      setTemplatesLoading(false);
      return [];
    }
  };
  
  const createTemplate = async (templateData: Partial<VideoTemplate>): Promise<VideoTemplate> => {
    try {
      const headers = await getAuthHeader();
      const res = await fetch(ROUTES.API.TEMPLATES.BASE, {
        method: "POST",
        headers: { 
          ...headers,
          "Content-Type": "application/json" 
        },
        body: JSON.stringify(templateData),
      });
      
      if (!res.ok) {
        throw new Error("Failed to create template");
      }
      
      const newTemplate = await res.json();
      setTemplates((prev) => [...prev, newTemplate]);
      return newTemplate;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error occurred";
      throw new Error(errorMessage);
    }
  };
  
  const updateTemplate = async (id: string, templateData: Partial<VideoTemplate>): Promise<VideoTemplate> => {
    try {
      const headers = await getAuthHeader();
      const res = await fetch(ROUTES.API.TEMPLATES.DETAIL(id), {
        method: "PUT",
        headers: {
          ...headers,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(templateData),
      });
      
      if (!res.ok) {
        throw new Error("Failed to update template");
      }
      
      const updatedTemplate = await res.json();
      setTemplates((prev) => prev.map((t) => t.id === id ? updatedTemplate : t));
      return updatedTemplate;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error occurred";
      throw new Error(errorMessage);
    }
  };
  
  const deleteTemplate = async (id: string): Promise<void> => {
    try {
      const headers = await getAuthHeader();
      const res = await fetch(ROUTES.API.TEMPLATES.DETAIL(id), {
        method: "DELETE",
        headers
      });
      
      if (!res.ok) {
        throw new Error("Failed to delete template");
      }
      
      setTemplates((prev) => prev.filter((t) => t.id !== id));
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error occurred";
      throw new Error(errorMessage);
    }
  };

  // Initial data fetching
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        await Promise.allSettled([
          fetchContentTypes(),
          fetchImageTypes(),
          fetchVoices(),
          user ? fetchUserVideos() : Promise.resolve([]),
          user ? fetchTemplates() : Promise.resolve([])
        ]);
        
        // Fetch accounts first, then fetch analytics
        if (user) {
          const accountsList = await fetchAccounts();
          if (accountsList.length > 0) {
            fetchAllAnalytics();
          }
        }
      } catch (error) {
        // Silently handle initialization errors
      }
    };
    
    loadInitialData();
  }, [user]);
  
  // Update analytics when accounts change
  useEffect(() => {
    if (accounts.length > 0) {
      fetchAllAnalytics();
    }
  }, [accounts]);
  
  const contextValue = {
    // Content Types
    contentTypes,
    contentTypesLoading,
    contentTypesError,
    refreshContentTypes: fetchContentTypes,
    createContentType,
    updateContentType,
    deleteContentType,
    generateContentTypeImage,
    
    // Templates
    templates,
    templatesLoading,
    templatesError,
    refreshTemplates: fetchTemplates,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    
    // Image Types
    imageTypes,
    imageTypesLoading, 
    imageTypesError,
    refreshImageTypes: fetchImageTypes,
    createImageType,
    updateImageType,
    deleteImageType,
    generateImageTypeImage,
    
    // Voices
    voices,
    voicesLoading,
    voicesError,
    refreshVoices: fetchVoices,
    
    // User Videos
    userVideos,
    userVideosLoading,
    userVideosError,
    refreshUserVideos: fetchUserVideos,
    
    // Accounts
    accounts,
    accountsLoading,
    accountsError,
    refreshAccounts: fetchAccounts,
    connectAccount,
    deleteAccount,
    
    // Analytics
    accountsWithAnalytics,
    analyticsLoading,
    analyticsError,
    refreshAnalytics: fetchAnalytics,
    refreshAllAnalytics: fetchAllAnalytics,
  };
  
  return (
    <DataContext.Provider value={contextValue}>
      {children}
    </DataContext.Provider>
  );
} 