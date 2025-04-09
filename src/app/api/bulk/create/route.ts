import { NextRequest, NextResponse } from 'next/server';
import { db, auth } from '@/lib/firebaseAdmin';
import { v4 as uuidv4 } from 'uuid';
import admin from 'firebase-admin';

// Helper function for auth verification
async function verifyAuth(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return { success: false, userId: null };
    }

    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await auth.verifyIdToken(token);
    
    return { success: true, userId: decodedToken.uid };
  } catch (error) {
    console.error('Auth verification error:', error);
    return { success: false, userId: null };
  }
}

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const authResult = await verifyAuth(request);
    if (!authResult.success) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const userId = authResult.userId;
    const body = await request.json();
    
    // Validate request
    const { templateId, count, topicPrompt } = body;
    
    if (!templateId || !count) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    if (typeof count !== 'number' || count < 1 || count > 20) {
      return NextResponse.json(
        { error: 'Count must be between 1 and 20' },
        { status: 400 }
      );
    }
    
    // Verify template exists and belongs to user
    const templateDoc = await db.collection('templates').doc(templateId).get();
    if (!templateDoc.exists) {
      return NextResponse.json(
        { error: 'Template not found' },
        { status: 404 }
      );
    }
    
    const template = templateDoc.data();
    if (template?.userId !== userId) {
      return NextResponse.json(
        { error: 'Unauthorized to use this template' },
        { status: 403 }
      );
    }
    
    // Check if content type has a prompt, if not, ensure topic prompt is provided
    const contentTypeDoc = await db.collection('contentTypes').doc(template.contentTypeId).get();
    if (!contentTypeDoc.exists) {
      return NextResponse.json(
        { error: 'Content type not found' },
        { status: 404 }
      );
    }

    const contentType = contentTypeDoc.data();
    const hasContentTypePrompt = contentType?.prompt && contentType.prompt.trim().length > 0;

    // If content type doesn't have a prompt, topic prompt is required
    if (!hasContentTypePrompt && (!topicPrompt || topicPrompt.trim().length === 0)) {
      return NextResponse.json(
        { error: 'Topic prompt is required for content types without a default prompt' },
        { status: 400 }
      );
    }
    
    // Create bulk job record
    const jobId = uuidv4();
    const bulkJob = {
      id: jobId,
      userId,
      templateId,
      count,
      topicPrompt: topicPrompt || '',
      status: 'queued',
      progress: 0,
      createdAt: new Date().toISOString(),
      completedVideos: [],
      failedVideos: [],
    };
    
    // Save job to database
    await db.collection('bulkJobs').doc(jobId).set(bulkJob);
    
    // Update template lastUsedAt
    await db.collection('templates').doc(templateId).update({
      lastUsedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    
    // Return the job ID to client
    return NextResponse.json({
      success: true,
      jobId,
      message: 'Bulk creation job queued successfully',
      successCount: count, // Return the count as successCount for the hook
    });
  } catch (error) {
    console.error('Error in bulk creation:', error);
    return NextResponse.json(
      { error: 'Failed to process bulk creation request' },
      { status: 500 }
    );
  }
} 