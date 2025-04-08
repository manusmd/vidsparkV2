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

export async function POST(
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
        { error: 'Unauthorized to cancel this job' },
        { status: 403 }
      );
    }
    
    // Check if job can be cancelled
    if (jobData.status === 'completed' || jobData.status === 'cancelled') {
      return NextResponse.json(
        { error: `Job is already ${jobData.status}` },
        { status: 400 }
      );
    }
    
    // Update job status to cancelled
    await db.collection('bulkJobs').doc(jobId).update({
      status: 'cancelled',
      cancelledAt: new Date().toISOString(),
    });
    
    return NextResponse.json({
      success: true,
      message: 'Job cancelled successfully',
    });
  } catch (error) {
    console.error('Error cancelling job:', error);
    return NextResponse.json(
      { error: 'Failed to cancel job' },
      { status: 500 }
    );
  }
} 