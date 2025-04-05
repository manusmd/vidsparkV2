"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Trash2, Clock, CheckCircle, AlertCircle, ExternalLink } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useBulkCreate } from "@/hooks/data/useBulkCreate";
import { toast } from "@/components/ui/use-toast";
import ROUTES from "@/lib/routes";

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Progress,
} from "@/components/ui/progress";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface BulkJob {
  id: string;
  templateId: string;
  count: number;
  topicPrompt: string;
  status: "queued" | "processing" | "completed" | "cancelled" | "failed";
  progress: number;
  createdAt: string;
  completedAt?: string;
  completedVideos: string[];
  failedVideos: string[];
}

export default function BulkJobsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { checkBulkJobStatus, cancelBulkJob, subscribeToBulkJob } = useBulkCreate();
  const [jobs, setJobs] = useState<BulkJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [activeSubscriptions, setActiveSubscriptions] = useState<{[key: string]: () => void}>({});

  // Fetch jobs
  const fetchJobs = async () => {
    if (!user) return;
    
    try {
      const token = await user.getIdToken();
      const response = await fetch(`/api/bulk/jobs`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      if (!response.ok) {
        throw new Error("Failed to fetch jobs");
      }
      
      const data = await response.json();
      setJobs(data.jobs || []);
      
      // Set up subscriptions for active jobs
      setupJobSubscriptions(data.jobs || []);
    } catch (error) {
      console.error("Error fetching bulk jobs:", error);
      toast("Error", {
        description: "Failed to load bulk jobs",
        style: { backgroundColor: "red" }
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };
  
  // Set up subscriptions for active jobs
  const setupJobSubscriptions = (jobsList: BulkJob[]) => {
    // Clean up old subscriptions first
    Object.values(activeSubscriptions).forEach(unsubscribe => unsubscribe());
    
    // Create new subscriptions for active jobs
    const newSubscriptions: {[key: string]: () => void} = {};
    
    jobsList.forEach(job => {
      if (job.status === "queued" || job.status === "processing") {
        const unsubscribe = subscribeToBulkJob(job.id);
        if (unsubscribe) {
          newSubscriptions[job.id] = unsubscribe;
        }
      }
    });
    
    setActiveSubscriptions(newSubscriptions);
  };

  // Cancel a job
  const handleCancelJob = async (jobId: string) => {
    if (!confirm("Are you sure you want to cancel this job?")) return;
    
    setCancellingId(jobId);
    try {
      const success = await cancelBulkJob(jobId);
      if (success) {
        toast("Job Cancelled", {
          description: "The bulk creation job has been cancelled",
        });
        // Refresh jobs
        await fetchJobs();
      }
    } catch (error) {
      console.error("Error cancelling job:", error);
    } finally {
      setCancellingId(null);
    }
  };

  // View videos from a job
  const viewJobVideos = (jobId: string) => {
    router.push(`${ROUTES.PAGES.APP.MY_VIDEOS.INDEX}?bulkJobId=${jobId}`);
  };

  // Fetch initial data and set up periodic refresh
  useEffect(() => {
    fetchJobs();
    
    // Set up interval to refresh the job list
    const intervalId = setInterval(() => {
      setRefreshing(true);
      fetchJobs();
    }, 30000); // Refresh every 30 seconds
    
    return () => {
      // Cleanup interval and subscriptions
      clearInterval(intervalId);
      Object.values(activeSubscriptions).forEach(unsubscribe => unsubscribe());
    };
  }, [user]);

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  // Get status badge
  const getStatusBadge = (status: BulkJob["status"]) => {
    switch (status) {
      case "queued":
        return (
          <div className="flex items-center text-amber-500">
            <Clock className="h-4 w-4 mr-1" />
            <span>Queued</span>
          </div>
        );
      case "processing":
        return (
          <div className="flex items-center text-blue-500">
            <Loader2 className="h-4 w-4 mr-1 animate-spin" />
            <span>Processing</span>
          </div>
        );
      case "completed":
        return (
          <div className="flex items-center text-green-500">
            <CheckCircle className="h-4 w-4 mr-1" />
            <span>Completed</span>
          </div>
        );
      case "cancelled":
        return (
          <div className="flex items-center text-slate-500">
            <Trash2 className="h-4 w-4 mr-1" />
            <span>Cancelled</span>
          </div>
        );
      case "failed":
        return (
          <div className="flex items-center text-red-500">
            <AlertCircle className="h-4 w-4 mr-1" />
            <span>Failed</span>
          </div>
        );
      default:
        return <span>{status}</span>;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary mr-2" />
        <span className="text-xl font-medium">Loading bulk jobs...</span>
      </div>
    );
  }

  return (
    <div className="container max-w-6xl py-8 px-4">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Bulk Video Jobs</h1>
          <p className="text-muted-foreground mt-1">
            Monitor and manage your bulk video creation jobs
          </p>
        </div>
      </div>

      {jobs.length === 0 ? (
        <div className="bg-muted/40 border rounded-lg p-10 text-center">
          <Clock className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-xl font-medium mb-2">No Bulk Jobs Yet</h3>
          <p className="text-muted-foreground max-w-md mx-auto mb-6">
            You haven't created any bulk video jobs yet. Go to your templates and select "Bulk Create" to get started.
          </p>
          <Button
            onClick={() => router.push(ROUTES.PAGES.APP.TEMPLATES)}
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
          >
            Go to Templates
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {jobs.map((job) => (
            <Card key={job.id} className="bg-card border rounded-lg overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-xl font-semibold break-words pr-6">
                    {`Bulk Job: ${job.count} Videos`}
                  </CardTitle>
                  {getStatusBadge(job.status)}
                </div>
              </CardHeader>
              <CardContent className="pb-4">
                <div className="space-y-3">
                  <div>
                    <span className="text-sm text-muted-foreground">Created:</span>{" "}
                    <span className="text-sm font-medium">
                      {formatDate(job.createdAt)}
                    </span>
                  </div>
                  
                  {job.completedAt && (
                    <div>
                      <span className="text-sm text-muted-foreground">Completed:</span>{" "}
                      <span className="text-sm font-medium">
                        {formatDate(job.completedAt)}
                      </span>
                    </div>
                  )}
                  
                  <div>
                    <span className="text-sm text-muted-foreground">Topic Prompt:</span>{" "}
                    <span className="text-sm">
                      {job.topicPrompt.length > 50
                        ? `${job.topicPrompt.substring(0, 50)}...`
                        : job.topicPrompt}
                    </span>
                  </div>
                  
                  <div className="pt-2">
                    <div className="flex justify-between text-xs mb-1">
                      <span>Progress</span>
                      <span>
                        {job.completedVideos.length}/{job.count} Videos
                      </span>
                    </div>
                    <Progress value={job.progress} className="h-2" />
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex gap-2">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        onClick={() => viewJobVideos(job.id)}
                        className="flex-1"
                        variant="outline"
                      >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        View Videos
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>View all videos created by this job</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                {(job.status === "queued" || job.status === "processing") && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          onClick={() => handleCancelJob(job.id)}
                          variant="destructive"
                          disabled={cancellingId === job.id}
                        >
                          {cancellingId === job.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Cancel this job</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
} 