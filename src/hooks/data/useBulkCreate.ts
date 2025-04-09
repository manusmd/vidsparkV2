"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import ROUTES from "@/lib/routes";
import { toast } from "@/components/ui/use-toast";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";

interface BulkJob {
  id: string;
  userId: string;
  templateId: string;
  count: number;
  topicPrompt: string;
  status: "queued" | "processing" | "completed" | "completed_with_errors" | "cancelled" | "failed";
  progress: number;
  createdAt: string;
  completedAt?: string;
  completedVideos: string[];
  failedVideos: string[];
}

interface BulkCreateParams {
  templateId: string;
  count: number;
  topicPrompt: string;
}

interface BulkCreateResult {
  successCount: number;
  jobId?: string;
  errors?: string[];
}

export function useBulkCreate() {
  const { user } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [errors, setErrors] = useState<string[]>([]);
  const [currentJob, setCurrentJob] = useState<BulkJob | null>(null);
  const [isSubscribed, setIsSubscribed] = useState(false);

  const getAuthHeader = async (): Promise<HeadersInit> => {
    if (user) {
      const token = await user.getIdToken();
      return {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };
    }
    return { 'Content-Type': 'application/json' };
  };

  const createBulkVideos = async (params: BulkCreateParams): Promise<BulkCreateResult> => {
    if (!user) {
      throw new Error("User must be authenticated to create bulk videos");
    }

    setIsProcessing(true);
    setErrors([]);
    setProgress(0);

    try {
      const headers = await getAuthHeader();
      const response = await fetch(ROUTES.API.BULK_CREATION.CREATE, {
        method: "POST",
        headers,
        body: JSON.stringify({
          templateId: params.templateId,
          count: params.count,
          topicPrompt: params.topicPrompt
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to create bulk videos: ${response.status}`);
      }

      const result = await response.json();
      
      // If we got a job ID, subscribe to updates
      if (result.jobId) {
        subscribeToBulkJob(result.jobId);
      }
      
      return {
        successCount: result.successCount || 0,
        jobId: result.jobId,
        errors: result.errors
      };
    } catch (err) {
      console.error("Error creating bulk videos:", err);
      const errorMessage = err instanceof Error ? err.message : String(err);
      setErrors(prev => [...prev, errorMessage]);
      throw err;
    } finally {
      setIsProcessing(false);
    }
  };

  const subscribeToBulkJob = (jobId: string) => {
    if (!db || !jobId) return;
    
    setIsSubscribed(true);
    
    const jobRef = doc(db, "bulkJobs", jobId);
    const unsubscribe = onSnapshot(
      jobRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data() as BulkJob;
          setCurrentJob(data);
          setProgress(data.progress || 0);
          
          // Handle status changes
          if (data.status === "completed" || data.status === "failed" || data.status === "cancelled") {
            setIsProcessing(false);
          } else {
            setIsProcessing(true);
          }
          
        } else {
          console.warn("Bulk job document does not exist:", jobId);
          setCurrentJob(null);
        }
      },
      (err) => {
        console.error("Error subscribing to bulk job:", err);
        setErrors(prev => [...prev, `Error tracking job: ${err.message}`]);
        setIsSubscribed(false);
      }
    );
    
    // Return unsubscribe function
    return unsubscribe;
  };

  const checkBulkJobStatus = async (jobId: string): Promise<{ status: string; progress: number; completedVideos: string[] }> => {
    if (!user) {
      throw new Error("User must be authenticated to check bulk job status");
    }

    // If we're not already subscribed to this job, subscribe now
    if (!isSubscribed && jobId) {
      subscribeToBulkJob(jobId);
    }

    try {
      const headers = await getAuthHeader();
      const response = await fetch(`${ROUTES.API.BULK_CREATION.STATUS}/${jobId}`, {
        headers,
      });

      if (!response.ok) {
        throw new Error(`Failed to check job status: ${response.status}`);
      }

      const data = await response.json();
      setProgress(data.progress || 0);
      return data;
    } catch (err) {
      console.error("Error checking bulk job status:", err);
      throw err;
    }
  };

  const cancelBulkJob = async (jobId: string): Promise<boolean> => {
    if (!user) {
      throw new Error("User must be authenticated to cancel bulk job");
    }

    try {
      const headers = await getAuthHeader();
      const response = await fetch(`${ROUTES.API.BULK_CREATION.CANCEL}/${jobId}`, {
        method: "POST",
        headers,
      });

      if (!response.ok) {
        throw new Error(`Failed to cancel job: ${response.status}`);
      }

      const data = await response.json();
      return data.success || false;
    } catch (err) {
      console.error("Error canceling bulk job:", err);
      toast("Error", {
        description: "Failed to cancel bulk creation job",
        style: { backgroundColor: "red" }
      });
      return false;
    }
  };

  const deleteBulkJob = async (jobId: string): Promise<{ success: boolean; deletedVideoCount?: number }> => {
    if (!user) {
      throw new Error("User must be authenticated to delete bulk job");
    }

    try {
      const headers = await getAuthHeader();
      const response = await fetch(`${ROUTES.API.BULK_CREATION.DELETE}/${jobId}`, {
        method: "DELETE",
        headers,
      });

      if (!response.ok) {
        throw new Error(`Failed to delete job: ${response.status}`);
      }

      const data = await response.json();
      return { 
        success: data.success || false,
        deletedVideoCount: data.deletedVideoCount || 0
      };
    } catch (err) {
      console.error("Error deleting bulk job:", err);
      toast("Error", {
        description: "Failed to delete bulk creation job",
        style: { backgroundColor: "red" }
      });
      return { success: false };
    }
  };

  // Clean up subscription when component unmounts
  useEffect(() => {
    return () => {
      setIsSubscribed(false);
    };
  }, []);

  return {
    createBulkVideos,
    checkBulkJobStatus,
    cancelBulkJob,
    deleteBulkJob,
    subscribeToBulkJob,
    isProcessing,
    progress,
    errors,
    currentJob,
  };
} 