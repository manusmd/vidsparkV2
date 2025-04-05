"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import { VideoTemplate } from "@/app/types";
import ROUTES from "@/lib/routes";

interface UseTemplatesReturn {
  templates: VideoTemplate[];
  loading: boolean;
  error: Error | null;
  createTemplate: (template: Partial<VideoTemplate>) => Promise<VideoTemplate>;
  updateTemplate: (id: string, template: Partial<VideoTemplate>) => Promise<VideoTemplate>;
  deleteTemplate: (id: string) => Promise<void>;
  getTemplate: (id: string) => VideoTemplate | undefined;
}

export function useTemplates(): UseTemplatesReturn {
  const { user } = useAuth();
  const [templates, setTemplates] = useState<VideoTemplate[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  // Helper for auth headers
  const getAuthHeader = useCallback(async (): Promise<HeadersInit> => {
    if (user) {
      const token = await user.getIdToken();
      return {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };
    }
    return { 'Content-Type': 'application/json' };
  }, [user]);

  const fetchTemplates = useCallback(async () => {
    if (!user) {
      setTemplates([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const headers = await getAuthHeader();
      const response = await fetch(ROUTES.API.TEMPLATES.BASE, { headers });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch templates: ${response.status}`);
      }
      
      const data = await response.json();
      setTemplates(data);
    } catch (err) {
      console.error("Error fetching templates:", err);
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setLoading(false);
    }
  }, [user, getAuthHeader]);

  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  const createTemplate = async (templateData: Partial<VideoTemplate>): Promise<VideoTemplate> => {
    if (!user) {
      throw new Error("User must be authenticated to create a template");
    }

    const headers = await getAuthHeader();
    const response = await fetch(ROUTES.API.TEMPLATES.BASE, {
      method: "POST",
      headers,
      body: JSON.stringify({
        ...templateData,
        userId: user.uid,
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to create template: ${response.status}`);
    }

    const newTemplate = await response.json();
    setTemplates((prev) => [...prev, newTemplate]);
    return newTemplate;
  };

  const updateTemplate = async (id: string, templateData: Partial<VideoTemplate>): Promise<VideoTemplate> => {
    if (!user) {
      throw new Error("User must be authenticated to update a template");
    }

    const headers = await getAuthHeader();
    const response = await fetch(ROUTES.API.TEMPLATES.DETAIL(id), {
      method: "PUT",
      headers,
      body: JSON.stringify(templateData),
    });

    if (!response.ok) {
      throw new Error(`Failed to update template: ${response.status}`);
    }

    const updatedTemplate = await response.json();
    setTemplates((prev) => 
      prev.map((template) => (template.id === id ? updatedTemplate : template))
    );
    return updatedTemplate;
  };

  const deleteTemplate = async (id: string): Promise<void> => {
    if (!user) {
      throw new Error("User must be authenticated to delete a template");
    }

    const headers = await getAuthHeader();
    const response = await fetch(ROUTES.API.TEMPLATES.DETAIL(id), {
      method: "DELETE",
      headers,
    });

    if (!response.ok) {
      throw new Error(`Failed to delete template: ${response.status}`);
    }

    setTemplates((prev) => prev.filter((template) => template.id !== id));
  };

  const getTemplate = (id: string): VideoTemplate | undefined => {
    return templates.find((template) => template.id === id);
  };

  return {
    templates,
    loading,
    error,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    getTemplate,
  };
} 