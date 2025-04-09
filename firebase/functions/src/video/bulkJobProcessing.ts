import { onDocumentCreated } from "firebase-functions/v2/firestore";
import { db } from "../../firebaseConfig";
import { logger } from "firebase-functions";

interface BulkJob {
  id: string;
  userId: string;
  templateId: string;
  count: number;
  topicPrompt: string;
  status: "queued" | "processing" | "completed" | "completed_with_errors" | "cancelled" | "failed";
  progress: number;
  createdAt: string;
  completedVideos: string[];
  failedVideos: string[];
}

export const processBulkJob = onDocumentCreated("bulkJobs/{jobId}", async (event) => {
  const snapshot = event.data;
  if (!snapshot) {
    logger.error("❌ No document snapshot found for bulk job");
    return;
  }

  const bulkJob = snapshot.data() as BulkJob;
  const jobId = snapshot.id;

  logger.info(`📝 Processing bulk job ${jobId}`);

  // If job already in progress, exit
  if (bulkJob.status !== "queued") {
    logger.info(`Job ${jobId} is not in queued state, skipping processing`);
    return;
  }

  try {
    // Update job status to processing
    await db.collection("bulkJobs").doc(jobId).update({
      status: "processing",
      progress: 0,
    });

    // Fetch template details
    const templateDoc = await db.collection("templates").doc(bulkJob.templateId).get();
    if (!templateDoc.exists) {
      throw new Error(`Template ${bulkJob.templateId} not found`);
    }
    const template = templateDoc.data() || {};
    
    // Fetch content type details to get the prompt
    const contentTypeDoc = await db.collection("contentTypes").doc(template.contentTypeId || '').get();
    if (!contentTypeDoc.exists) {
      throw new Error(`Content type ${template.contentTypeId} not found`);
    }
    const contentType = contentTypeDoc.data() || {};
    const basePrompt = contentType.prompt || '';
    
    // Check if we have a valid prompt source
    // If content type doesn't have a prompt, require a user-provided topic prompt
    if (!basePrompt && (!bulkJob.topicPrompt || bulkJob.topicPrompt.trim() === '')) {
      throw new Error(`Content type ${template.contentTypeId} has no default prompt defined. A topic prompt must be provided when using this content type for bulk creation.`);
    }

    // Process each video in the job
    const completedVideos: string[] = [];
    const failedVideos: string[] = [];

    for (let i = 0; i < bulkJob.count; i++) {
      try {
        logger.info(`Processing video ${i + 1} of ${bulkJob.count} for job ${jobId}`);
        
        // Determine which prompt to use
        let promptToUse: string;
        if (bulkJob.topicPrompt && bulkJob.topicPrompt.trim().length > 0) {
          // Use the user-provided topic prompt if available
          promptToUse = bulkJob.topicPrompt;
          logger.info(`Using user-provided topic prompt: ${promptToUse}`);
        } else {
          // Fall back to the content type's prompt
          promptToUse = basePrompt;
          logger.info(`Using content type's default prompt: ${promptToUse}`);
        }
        
        // Make each prompt unique by adding a randomization directive
        const uniquePrompt = `${promptToUse} Create a completely unique video different from others. Make it highly specific and distinct. Variation #${i + 1} of ${bulkJob.count}.`;
        
        // Create a new video document
        const videoData = {
          uid: bulkJob.userId,
          title: `Generated from template: ${template.name || 'Unnamed Template'} (${i + 1})`,
          status: "pending",
          templateId: bulkJob.templateId, // Store reference to the template
          imageTypeId: template.imageStyleId || '',
          voiceId: template.voiceId || '',
          contentTypeId: template.contentTypeId || '',
          styling: template.styling || null,
          textPosition: template.textPosition || 'top',
          showTitle: template.showTitle !== undefined ? template.showTitle : true,
          musicId: template.musicId || null,
          musicVolume: template.musicVolume !== undefined ? template.musicVolume : 0.5,
          bulkJobId: jobId,
          createdAt: new Date().toISOString(),
        };
        
        const videoRef = await db.collection("videos").add(videoData);
        const videoId = videoRef.id;
        
        logger.info(`Created video ${videoId} for bulk job ${jobId}`);
        
        // Step 2: Create story idea document - triggers storyIdeaProcessing
        const storyIdeaData = {
          prompt: uniquePrompt,
          status: "pending",
          uid: bulkJob.userId,
          createdAt: new Date(),
          videoId: videoId, // Track which video this story is for
        };
        
        const storyIdeaRef = await db.collection("storyIdeas").add(storyIdeaData);
        const storyIdeaId = storyIdeaRef.id;
        
        logger.info(`Created story idea ${storyIdeaId} for video ${videoId}`);
        
        // Step 3: Wait for the story idea to be processed
        const storyIdea = await waitForStoryIdea(storyIdeaId);
        logger.info(`Story idea ${storyIdeaId} processed successfully`);
        
        // Step 4: Update the video with narration
        await videoRef.update({
          narration: storyIdea.narration,
        });
        
        // Step 5: Create storyRequest to generate structured content
        const storyRequestData = {
          narration: storyIdea.narration,
          imageType: template.imageStyleId || '',
          videoId: videoId,
          createdAt: new Date(),
        };
        
        const storyRequestRef = await db.collection("storyRequest").add(storyRequestData);
        const storyRequestId = storyRequestRef.id;
        
        logger.info(`Created story request ${storyRequestId} for video ${videoId}`);
        
        // Step 6: Wait for story request to be processed
        await waitForVideo(videoId);
        logger.info(`Story request for video ${videoId} processed successfully`);
        
        // Step 7: Add to pendingVideos collection to trigger video processing
        await db.collection("pendingVideos").add({
          videoId: videoId,
          createdAt: new Date(),
        });
        
        logger.info(`Added video ${videoId} to pendingVideos queue`);
        completedVideos.push(videoId);

        // Update job progress
        await db.collection("bulkJobs").doc(jobId).update({
          progress: Math.round(((i + 1) / bulkJob.count) * 100),
          completedVideos,
        });
      } catch (error) {
        logger.error(`Error processing video ${i + 1} in bulk job ${jobId}:`, error);
        failedVideos.push(`Video ${i + 1}`);
        
        // Update job with failure info
        await db.collection("bulkJobs").doc(jobId).update({
          failedVideos,
        });
      }
    }

    // Update job to completed
    let finalStatus = "completed";
    if (completedVideos.length === 0) {
      finalStatus = "failed";
    } else if (failedVideos.length > 0) {
      finalStatus = "completed_with_errors";
    }
    
    await db.collection("bulkJobs").doc(jobId).update({
      status: finalStatus,
      progress: 100,
      completedAt: new Date().toISOString(),
    });
    
    logger.info(`✅ Bulk job ${jobId} processed. Status: ${finalStatus}`);
  } catch (error) {
    logger.error(`Error processing bulk job ${jobId}:`, error);
    
    // Update job to failed status
    await db.collection("bulkJobs").doc(jobId).update({
      status: "failed",
      completedAt: new Date().toISOString(),
    });
  }
});

// Helper function to wait for a story idea to be processed
async function waitForStoryIdea(ideaId: string, maxAttempts = 30, delayMs = 2000) {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const doc = await db.collection("storyIdeas").doc(ideaId).get();
    
    if (!doc.exists) {
      throw new Error(`Story idea ${ideaId} not found`);
    }
    
    const data = doc.data();
    
    if (data?.status === "completed") {
      return data;
    }
    
    if (data?.status === "error" || data?.status === "failed") {
      throw new Error(`Story idea ${ideaId} processing failed: ${data.error || "Unknown error"}`);
    }
    
    // Wait before checking again
    await new Promise(resolve => setTimeout(resolve, delayMs));
  }
  
  throw new Error(`Timed out waiting for story idea ${ideaId} to be processed`);
}

// Helper function to wait for video to be updated with scenes
async function waitForVideo(videoId: string, maxAttempts = 30, delayMs = 2000) {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const doc = await db.collection("videos").doc(videoId).get();
    
    if (!doc.exists) {
      throw new Error(`Video ${videoId} not found`);
    }
    
    const data = doc.data();
    
    // Check if video has scenes, which means storyRequest processing is complete
    if (data?.scenes && Object.keys(data.scenes).length > 0) {
      return data;
    }
    
    // If status is error, throw error
    if (data?.status === "error") {
      throw new Error(`Video ${videoId} processing failed: ${data.error || "Unknown error"}`);
    }
    
    // Wait before checking again
    await new Promise(resolve => setTimeout(resolve, delayMs));
  }
  
  throw new Error(`Timed out waiting for video ${videoId} to be processed by storyRequest`);
} 