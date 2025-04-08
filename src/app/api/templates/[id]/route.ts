import { NextRequest, NextResponse } from "next/server";
import { authenticate } from "@/lib/apiUtils";
import { db } from "@/lib/firebaseAdmin";
import { VideoTemplate } from "@/app/types";
import admin from 'firebase-admin';

/**
 * GET /api/templates/[id]
 * Retrieves a specific template by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  // Authenticate the user
  const auth = await authenticate(request);
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const templateDoc = await db.collection("templates").doc(id).get();

    if (!templateDoc.exists) {
      return NextResponse.json({ error: "Template not found" }, { status: 404 });
    }

    const templateData = templateDoc.data();
    
    // Verify the template belongs to the authenticated user
    if (templateData && templateData.userId !== auth.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Handle lastUsedAt which might be a Firestore timestamp or string
    let lastUsedAt: Date;
    if (templateData?.lastUsedAt && typeof templateData.lastUsedAt.toDate === 'function') {
      lastUsedAt = templateData.lastUsedAt.toDate();
    } else if (templateData?.lastUsedAt) {
      lastUsedAt = new Date(templateData.lastUsedAt);
    } else {
      lastUsedAt = new Date();
    }

    return NextResponse.json({
      id: templateDoc.id,
      ...(templateData || {}),
      createdAt: templateData?.createdAt?.toDate() || new Date(),
      lastUsedAt: lastUsedAt,
    });
  } catch (error) {
    console.error("Error fetching template:", error);
    return NextResponse.json(
      { error: "Failed to fetch template" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/templates/[id]
 * Updates a specific template by ID
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  // Authenticate the user
  const auth = await authenticate(request);
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const templateRef = db.collection("templates").doc(id);
    const templateDoc = await templateRef.get();

    // Check if template exists
    if (!templateDoc.exists) {
      return NextResponse.json({ error: "Template not found" }, { status: 404 });
    }

    // Verify the template belongs to the authenticated user
    const templateData = templateDoc.data();
    if (templateData && templateData.userId !== auth.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Parse the request body
    const updateData: Partial<VideoTemplate> = await request.json();

    // Remove fields that shouldn't be updated
    delete updateData.id;
    delete updateData.userId;
    delete updateData.createdAt;

    // Update lastUsedAt to current time
    const updatedData = {
      ...updateData,
      lastUsedAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    // Update the template
    await templateRef.update(updatedData);

    // Return the updated template
    return NextResponse.json({
      id: id,
      ...(templateData || {}),
      ...updatedData,
      createdAt: templateData?.createdAt?.toDate() || new Date(),
    });
  } catch (error) {
    console.error("Error updating template:", error);
    return NextResponse.json(
      { error: "Failed to update template" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/templates/[id]
 * Deletes a specific template by ID
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  // Authenticate the user
  const auth = await authenticate(request);
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const templateRef = db.collection("templates").doc(id);
    const templateDoc = await templateRef.get();

    // Check if template exists
    if (!templateDoc.exists) {
      return NextResponse.json({ error: "Template not found" }, { status: 404 });
    }

    // Verify the template belongs to the authenticated user
    const templateData = templateDoc.data();
    if (templateData && templateData.userId !== auth.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Delete the template
    await templateRef.delete();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting template:", error);
    return NextResponse.json(
      { error: "Failed to delete template" },
      { status: 500 }
    );
  }
} 