import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { Configuration, OpenAIApi } from 'openai';

// Initialize OpenAI with API key from environment
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

/**
 * Cloud Function to generate episode plans for a series
 * This would be triggered via HTTP or by a direct function call
 */
export const generateEpisodePlans = functions.https.onCall(async (data, context) => {
  // Check if the user is authenticated
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'User must be authenticated to generate episode plans'
    );
  }

  const { seriesId, jobId } = data;
  
  if (!seriesId || !jobId) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'Series ID and Job ID are required'
    );
  }

  try {
    // Get series data
    const seriesDoc = await admin.firestore().collection('series').doc(seriesId).get();
    if (!seriesDoc.exists) {
      throw new functions.https.HttpsError('not-found', 'Series not found');
    }

    const seriesData = seriesDoc.data();
    if (seriesData?.userId !== context.auth.uid) {
      throw new functions.https.HttpsError('permission-denied', 'User does not have permission to access this series');
    }

    // Get job data to ensure it's still in the planning stage
    const jobDoc = await admin.firestore().collection('seriesJobs').doc(jobId).get();
    if (!jobDoc.exists) {
      throw new functions.https.HttpsError('not-found', 'Job not found');
    }

    const jobData = jobDoc.data();
    if (!jobData?.planningStage) {
      throw new functions.https.HttpsError('failed-precondition', 'Job is not in planning stage');
    }

    // Extract series details for planning
    const { prompt, episodeCount, settings } = seriesData;
    
    // Update job status
    await admin.firestore().collection('seriesJobs').doc(jobId).update({
      status: 'processing',
      progress: 10,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    // Call OpenAI to generate episode plans
    const episodePlans = await generateEpisodeOutlinesWithAI(prompt, episodeCount, settings);

    // Create episodes object from plans
    const episodes: Record<number, { title: string; status: string; summary: string }> = {};
    episodePlans.forEach((plan) => {
      episodes[plan.episodeNumber] = {
        title: plan.title,
        status: "pending",
        summary: plan.summary
      };
    });

    // Update series with episodes
    await admin.firestore().collection('series').doc(seriesId).update({
      episodes,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    // Update job with generated episode plans
    await admin.firestore().collection('seriesJobs').doc(jobId).update({
      episodePlans,
      progress: 100,
      status: 'completed',
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    return { success: true, episodePlans };
  } catch (error) {
    console.error('Error generating episode plans:', error);
    
    // Update job status to indicate failure
    await admin.firestore().collection('seriesJobs').doc(jobId).update({
      status: 'failed',
      error: error.message || 'Unknown error during plan generation',
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    
    throw new functions.https.HttpsError('internal', 'Failed to generate episode plans');
  }
});

/**
 * Helper function to generate episode outlines using OpenAI
 */
async function generateEpisodeOutlinesWithAI(
  prompt: string,
  episodeCount: number,
  settings: any
): Promise<any[]> {
  try {
    // Create a detailed prompt for the AI
    const systemPrompt = `
      You are a professional screenwriter and story expert.
      Create a compelling ${episodeCount}-episode series based on the following concept.
      For each episode, provide a title and detailed summary that maintains narrative continuity.
      Ensure character development across episodes and a satisfying story arc.
      First episode should introduce characters and setting.
      Middle episodes should develop plot and increase tension.
      Final episode should provide resolution while maintaining excitement.
    `;

    const userPrompt = `
      Series Concept: ${prompt}
      Number of Episodes: ${episodeCount}
      Style/Tone: ${settings.style || 'No specific style provided'}
      
      Additional details:
      ${settings.characters && settings.characters.length > 0 ? 
        `Characters: ${settings.characters.map(c => `${c.name} - ${c.description}`).join(', ')}` : 
        'No specific characters provided'
      }
      ${settings.visualTheme ? `Visual Theme: ${settings.visualTheme}` : ''}
      ${settings.continuityRules ? `Continuity Rules: ${settings.continuityRules}` : ''}

      Format each episode as:
      Episode [number]: [Title]
      Summary: [Detailed episode summary of at least 3-4 sentences]
    `;

    // Call OpenAI API
    const response = await openai.createChatCompletion({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.7,
      max_tokens: 2000
    });

    // Process the AI response
    const aiText = response.data.choices[0]?.message?.content || '';
    
    // Parse the AI-generated text into episode plans
    // This is a simplified parsing logic and may need refinement
    const episodeRegex = /Episode\s+(\d+):\s+(.+?)(?:\n|$)(?:Summary:|$)\s*([\s\S]+?)(?=Episode\s+\d+:|$)/gi;
    
    const episodePlans = [];
    let match;
    
    while ((match = episodeRegex.exec(aiText)) !== null) {
      const episodeNumber = parseInt(match[1], 10);
      const title = match[2].trim();
      const summary = match[3].trim();
      
      episodePlans.push({
        episodeNumber,
        title,
        summary,
        approved: false
      });
    }
    
    // If parsing failed, fall back to simple numbered episodes
    if (episodePlans.length === 0) {
      for (let i = 1; i <= episodeCount; i++) {
        episodePlans.push({
          episodeNumber: i,
          title: `Episode ${i}`,
          summary: `This is episode ${i} of the series based on: ${prompt.substring(0, 100)}...`,
          approved: false
        });
      }
    }
    
    return episodePlans;
  } catch (error) {
    console.error('OpenAI API error:', error);
    throw new Error('Failed to generate episode outlines with AI');
  }
}

/**
 * HTTP endpoint to trigger episode planning (for testing or external triggers)
 */
export const triggerEpisodePlanning = functions.https.onRequest(async (request, response) => {
  if (request.method !== 'POST') {
    response.status(405).send('Method Not Allowed');
    return;
  }
  
  // In production, this would include authentication checks
  const { seriesId, jobId } = request.body;
  
  if (!seriesId || !jobId) {
    response.status(400).send('Series ID and Job ID are required');
    return;
  }
  
  try {
    // Call the same planning logic
    const result = await generateEpisodePlans({
      seriesId,
      jobId
    }, {
      auth: { uid: 'test-user' } // This would be a real auth context in production
    });
    
    response.status(200).send(result);
  } catch (error) {
    console.error('Error triggering episode planning:', error);
    response.status(500).send('Failed to trigger episode planning');
  }
});

/**
 * Cloud Function to generate episodes based on approved episode plans
 */
export const generateEpisodes = functions.https.onCall(async (data, context) => {
  // Check if the user is authenticated
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated', 
      'User must be authenticated to generate episodes'
    );
  }

  const { seriesId, jobId } = data;
  
  if (!seriesId || !jobId) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'Series ID and Job ID are required'
    );
  }

  try {
    // Get series data
    const seriesDoc = await admin.firestore().collection('series').doc(seriesId).get();
    if (!seriesDoc.exists) {
      throw new functions.https.HttpsError('not-found', 'Series not found');
    }

    const seriesData = seriesDoc.data();
    if (seriesData?.userId !== context.auth.uid) {
      throw new functions.https.HttpsError('permission-denied', 'User does not have permission to access this series');
    }

    // Get job data
    const jobDoc = await admin.firestore().collection('seriesJobs').doc(jobId).get();
    if (!jobDoc.exists) {
      throw new functions.https.HttpsError('not-found', 'Job not found');
    }

    const jobData = jobDoc.data();
    
    // Make sure job is not in planning stage and has episode plans
    if (jobData?.planningStage) {
      throw new functions.https.HttpsError('failed-precondition', 'Job is still in planning stage');
    }
    
    if (!jobData.episodePlans || jobData.episodePlans.length === 0) {
      throw new functions.https.HttpsError('failed-precondition', 'No episode plans found');
    }
    
    // Make sure all episode plans are approved
    const allApproved = jobData.episodePlans.every(plan => plan.approved);
    if (!allApproved) {
      throw new functions.https.HttpsError('failed-precondition', 'Not all episode plans have been approved');
    }

    // Update job status
    await admin.firestore().collection('seriesJobs').doc(jobId).update({
      status: 'processing',
      progress: 5,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    // Apply the narrative arc model to ensure continuity across episodes
    const arcType = await determineNarrativeArcType(seriesData.prompt, jobData.episodePlans);
    
    // Initialize continuity data
    let continuityData = jobData.continuityData || {
      characters: {},
      plotPoints: {},
      settings: {}
    };
    
    // Track completed episodes for reference
    const completedVideos = [];
    const episodeIds = [];
    
    // Extract settings for videos
    const {
      voiceId = 'default',
      imageStyleId = 'default',
      textPosition = 'bottom',
      showTitle = true,
      textDesign = {},
      musicId,
      musicVolume = 50
    } = seriesData.settings || {};

    // Generate each episode in order
    const totalEpisodes = jobData.episodePlans.length;
    for (let i = 0; i < totalEpisodes; i++) {
      const episodePlan = jobData.episodePlans[i];
      const episodeNumber = episodePlan.episodeNumber;
      
      try {
        // Update progress
        const progress = Math.round(5 + ((i / totalEpisodes) * 95));
        await admin.firestore().collection('seriesJobs').doc(jobId).update({
          progress,
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });
        
        // Create a video document for this episode
        const videoId = admin.firestore().collection('videos').doc().id;
        
        // Incorporate previous episodes context for continuity
        const previousEpisodes = jobData.episodePlans
          .filter(ep => ep.episodeNumber < episodeNumber)
          .sort((a, b) => a.episodeNumber - b.episodeNumber);
        
        // Generate content with narrative continuity
        const narrativePrompt = await generateNarrativePrompt(
          episodePlan, 
          previousEpisodes, 
          arcType, 
          continuityData
        );
        
        // Create a video document with the generated content
        await admin.firestore().collection('videos').doc(videoId).set({
          id: videoId,
          userId: context.auth.uid,
          title: `${seriesData.title} - Episode ${episodeNumber}: ${episodePlan.title}`,
          description: episodePlan.summary,
          status: 'draft',
          voiceId,
          imageStyleId,
          textPosition,
          showTitle,
          textDesign,
          musicId,
          musicVolume,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          // Series specific metadata
          seriesId,
          episodeNumber,
          // Content that would be generated by story processing
          // This is placeholder - in production this would trigger the story generation
          content: {
            prompt: narrativePrompt,
          }
        });
        
        // Add this episode to the generated list
        episodeIds.push(videoId);
        completedVideos.push({
          videoId,
          episodeNumber
        });
        
        // Update continuity data with new information (simplified here)
        // In production, this would analyze the generated content to update continuity
        updateContinuityData(continuityData, episodePlan, episodeNumber);
      } catch (error) {
        console.error(`Error generating episode ${episodeNumber}:`, error);
        // Continue with other episodes despite failure
      }
    }
    
    // Update series with the generated episodes
    await admin.firestore().collection('series').doc(seriesId).update({
      episodeIds,
      status: 'completed',
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    
    // Update job as completed
    await admin.firestore().collection('seriesJobs').doc(jobId).update({
      status: 'completed',
      progress: 100,
      completedVideos,
      continuityData,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    
    return { 
      success: true, 
      episodeCount: completedVideos.length,
      episodeIds 
    };
  } catch (error) {
    console.error('Error generating episodes:', error);
    
    // Update job status to indicate failure
    await admin.firestore().collection('seriesJobs').doc(jobId).update({
      status: 'failed',
      error: error.message || 'Unknown error during episode generation',
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    
    throw new functions.https.HttpsError('internal', 'Failed to generate episodes');
  }
});

/**
 * Helper function to determine narrative arc type
 */
async function determineNarrativeArcType(prompt: string, episodePlans: any[]): Promise<string> {
  // Simple implementation - in production this would use more sophisticated analysis
  const allText = prompt + ' ' + episodePlans.map(ep => ep.title + ' ' + ep.summary).join(' ');
  const text = allText.toLowerCase();
  
  if (text.includes('hero') || text.includes('journey') || text.includes('adventure')) {
    return 'classic_hero';
  } else if (text.includes('mystery') || text.includes('detective')) {
    return 'mystery';
  } else if (text.includes('learn') || text.includes('educational')) {
    return 'educational';
  } else if (text.includes('family') || text.includes('team') || text.includes('group')) {
    return 'ensemble';
  }
  
  return 'three_act'; // Default structure
}

/**
 * Helper function to generate a prompt with narrative continuity
 */
async function generateNarrativePrompt(
  episodePlan: any,
  previousEpisodes: any[],
  arcType: string,
  continuityData: any
): Promise<string> {
  // Build context from previous episodes
  const previousContext = previousEpisodes.length > 0 
    ? `Previous Episodes:\n${previousEpisodes.map(ep => 
        `Episode ${ep.episodeNumber}: ${ep.title}\n${ep.summary}`).join('\n\n')}`
    : 'This is the first episode of the series.';
  
  // Add character information
  const characterContext = Object.keys(continuityData.characters).length > 0
    ? `Characters:\n${Object.entries(continuityData.characters)
        .map(([name, info]: [string, any]) => `${name}: ${info.description}`)
        .join('\n')}`
    : '';
  
  // Create the prompt
  return `
This is episode ${episodePlan.episodeNumber} of a series.

Episode Title: ${episodePlan.title}
Episode Summary: ${episodePlan.summary}

${previousContext}

${characterContext}

Based on this information, create a detailed story for this episode that:
1. Maintains continuity with previous episodes
2. Develops the characters consistently
3. Advances the overall narrative arc
4. Creates a compelling and engaging story that works as a standalone episode
`;
}

/**
 * Helper function to update continuity data with new information
 */
function updateContinuityData(
  continuityData: any,
  episodePlan: any,
  episodeNumber: number
): void {
  // In a real implementation, this would analyze the content to extract entities
  // For this example, we'll just add any new names we find in the title/summary
  
  const text = `${episodePlan.title} ${episodePlan.summary}`;
  
  // Extract potential character names (capitalized words)
  const potentialNames = text.match(/\b[A-Z][a-z]+\b/g) || [];
  
  for (const name of potentialNames) {
    if (!continuityData.characters[name]) {
      // Create new character entry if it doesn't exist
      continuityData.characters[name] = {
        description: `Character introduced in episode ${episodeNumber}`,
        firstAppearance: episodeNumber
      };
    }
  }
  
  // Add plot point for this episode
  const plotPointId = `episode_${episodeNumber}_main`;
  continuityData.plotPoints[plotPointId] = {
    description: `${episodePlan.title}: ${episodePlan.summary.split('.')[0]}.`,
    episodeNumber,
    importance: episodeNumber === 1 ? 'major' : 'normal'
  };
} 