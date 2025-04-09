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

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ jobId: string }> }
): Promise<NextResponse> {
  try {
    // Get jobId from params
    const { jobId } = await params;
    
    if (!jobId) {
      return NextResponse.json(
        { error: 'Job ID is required' },
        { status: 400 }
      );
    }

    // Verify authentication
    const authResult = await verifyAuth(request);
    if (!authResult.success) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const userId = authResult.userId;
    
    // Get job from database
    const jobDoc = await db.collection('bulkJobs').doc(jobId).get();
    
    if (!jobDoc.exists) {
      return NextResponse.json(
        { error: 'Job not found' },
        { status: 404 }
      );
    }
    
    const jobData = jobDoc.data();
    
    // Verify user owns this job
    if (jobData?.userId !== userId) {
      return NextResponse.json(
        { error: 'Unauthorized to delete this job' },
        { status: 403 }
      );
    }

    // Find all videos associated with this bulk job
    const videosSnapshot = await db
      .collection('videos')
      .where('bulkJobId', '==', jobId)
      .get();
    
    // Count how many videos will be deleted
    const videoCount = videosSnapshot.docs.length;
    
    // Delete all videos in a batch
    const batch = db.batch();
    videosSnapshot.docs.forEach(doc => {
      batch.delete(doc.ref);
    });
    
    // Also delete the bulk job itself
    batch.delete(db.collection('bulkJobs').doc(jobId));
    
    // Commit the batch deletion
    await batch.commit();
    
    return NextResponse.json({
      success: true,
      message: `Job and ${videoCount} videos deleted successfully`,
      deletedVideoCount: videoCount
    });
  } catch (error) {
    console.error('Error deleting job:', error);
    return NextResponse.json(
      { error: 'Failed to delete job and related videos' },
      { status: 500 }
    );
  }
} 