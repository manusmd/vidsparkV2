import { useState, useEffect } from "react";
import type { ContentType } from "@/app/types";

export function useContentTypes() {
  const [contentTypes, setContentTypes] = useState<ContentType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchContentTypes = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/contenttypes");
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
      const res = await fetch("/api/contenttypes", {
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
      const res = await fetch(`/api/contenttypes/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(contentData),
      });
      if (!res.ok) {
        throw new Error("Failed to update content type");
      }
      const updatedType = await res.json();
      setContentTypes((prev) =>
        prev.map((ct) => (ct.id === id ? updatedType : ct)),
      );
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
      const res = await fetch(`/api/contenttypes/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        throw new Error("Failed to delete content type");
      }
      setContentTypes((prev) => prev.filter((ct) => ct.id !== id));
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
