import { NextRequest, NextResponse } from 'next/server';
import { db, auth } from '@/lib/firebaseAdmin';

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

export async function GET(request: NextRequest) {
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
    
    // Get jobs from database, newest first
    const jobsSnapshot = await db
      .collection('bulkJobs')
      .where('userId', '==', userId)
      .orderBy('createdAt', 'desc')
      .limit(50) // Limit to 50 recent jobs
      .get();
    
    const jobs = jobsSnapshot.docs.map((doc: any) => {
      const data = doc.data();
      return {
        id: doc.id,
        templateId: data.templateId,
        count: data.count,
        topicPrompt: data.topicPrompt,
        status: data.status,
        progress: data.progress,
        createdAt: data.createdAt,
        startedAt: data.startedAt,
        completedAt: data.completedAt,
        completedVideos: data.completedVideos || [],
        failedVideos: data.failedVideos || [],
      };
    });
    
    return NextResponse.json({
      success: true,
      jobs,
    });
  } catch (error) {
    console.error('Error retrieving bulk jobs:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve bulk jobs' },
      { status: 500 }
    );
  }
} 