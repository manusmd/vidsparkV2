import { useState, useEffect } from "react";
import type { ContentType } from "@/app/types";
import ROUTES from "@/lib/routes";
import { useDataContext } from "@/contexts/DataContext";

export function useContentTypes() {
  const [contentTypes, setContentTypes] = useState<ContentType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const dataContext = useDataContext();

  // If context is not available, fall back to original implementation
  const fetchContentTypes = async () => {
    setLoading(true);
    try {
      const response = await fetch(ROUTES.API.CONTENT_TYPES.BASE);
      if (!response.ok) {
        throw new Error("Failed to fetch content types");
      }
      const data = await response.json();
      setContentTypes(data);
      setError(null);
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to fetch content types");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContentTypes().catch(console.error);
  }, []);
  
  if (dataContext) {
    // Return the data from context instead of making separate API calls
    return {
      contentTypes: dataContext.contentTypes,
      loading: dataContext.contentTypesLoading,
      error: dataContext.contentTypesError,
      fetchContentTypes: dataContext.refreshContentTypes,
      createContentType: dataContext.createContentType,
      updateContentType: dataContext.updateContentType,
      deleteContentType: dataContext.deleteContentType,
      generateContentTypeImage: dataContext.generateContentTypeImage,
    };
  }

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

      // Update state
      const updatedTypes = [...contentTypes, newType];
      setContentTypes(updatedTypes);

      return newType;
    } catch (err: unknown) {
      if (err instanceof Error) {
        throw new Error(err.message);
      } else {
        throw new Error("Unknown error occurred");
      }
    }
  };

  const updateContentType = async (
    id: string,
    contentData: Partial<ContentType>,
  ) => {
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

      // Update state
      const updatedTypes = contentTypes.map((ct) => (ct.id === id ? updatedType : ct));
      setContentTypes(updatedTypes);

      return updatedType;
    } catch (err: unknown) {
      if (err instanceof Error) {
        throw new Error(err.message);
      } else {
        throw new Error("Unknown error occurred");
      }
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

      // Update state
      const updatedTypes = contentTypes.filter((ct) => ct.id !== id);
      setContentTypes(updatedTypes);
    } catch (err: unknown) {
      if (err instanceof Error) {
        throw new Error(err.message);
      } else {
        throw new Error("Unknown error occurred");
      }
    }
  };

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
      if (err instanceof Error) {
        throw new Error(err.message);
      } else {
        throw new Error("Unknown error occurred");
      }
    }
  };

  return {
    contentTypes,
    loading,
    error,
    fetchContentTypes,
    createContentType,
    updateContentType,
    deleteContentType,
    generateContentTypeImage,
  };
}
