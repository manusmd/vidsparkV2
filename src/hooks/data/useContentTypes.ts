import { useState, useEffect } from "react";
import type { ContentType } from "@/app/types";
import ROUTES from "@/lib/routes";


export function useContentTypes() {
  const [contentTypes, setContentTypes] = useState<ContentType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchContentTypes = async () => {
    setLoading(true);
    try {
      const res = await fetch(ROUTES.API.CONTENT_TYPES.BASE);
      if (!res.ok) {
        throw new Error("Failed to fetch content types");
      }
      const data: ContentType[] = await res.json();

      setContentTypes(data);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Unknown error occurred");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContentTypes();
  }, []);

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

  return {
    contentTypes,
    loading,
    error,
    fetchContentTypes,
    createContentType,
    updateContentType,
    deleteContentType,
  };
}
