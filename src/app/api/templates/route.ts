import { NextRequest, NextResponse } from "next/server";
import { authenticate } from "@/lib/apiUtils";
import { VideoTemplate } from "@/app/types";
import admin from 'firebase-admin';

// Use FirebaseAdmin for server-side operations
import { db } from "@/lib/firebaseAdmin";

/**
 * GET /api/templates
 * Retrieves all templates for the authenticated user
 */
export async function GET(request: NextRequest) {
  // Authenticate the user
  const auth = await authenticate(request);
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Query templates for the authenticated user
    const templatesSnapshot = await db
      .collection("templates")
      .where("userId", "==", auth.userId)
      .get();

    // Convert the documents to template objects
    const templates: VideoTemplate[] = [];
    templatesSnapshot.forEach((doc) => {
      const data = doc.data();
      
      // Handle lastUsedAt which might be a Firestore timestamp, a string, or undefined
      let lastUsedAt: Date;
      if (data.lastUsedAt && typeof data.lastUsedAt.toDate === 'function') {
        // It's a Firestore timestamp
        lastUsedAt = data.lastUsedAt.toDate();
      } else if (data.lastUsedAt) {
        // It's a string or another format
        lastUsedAt = new Date(data.lastUsedAt);
      } else {
        // It's undefined
        lastUsedAt = new Date();
      }
      
      templates.push({
        id: doc.id,
        userId: data.userId,
        name: data.name,
        contentTypeId: data.contentTypeId,
        voiceId: data.voiceId,
        imageStyleId: data.imageStyleId,
        textDesign: data.textDesign,
        textPosition: data.textPosition,
        showTitle: data.showTitle,
        musicId: data.musicId,
        createdAt: data.createdAt?.toDate() || new Date(),
        lastUsedAt: lastUsedAt,
      });
    });

    return NextResponse.json(templates);
  } catch (error) {
    console.error("Error fetching templates:", error);
    return NextResponse.json(
      { error: "Failed to fetch templates" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/templates
 * Creates a new template for the authenticated user
 */
export async function POST(request: NextRequest) {
  // Authenticate the user
  const auth = await authenticate(request);
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Parse the request body
    const templateData: Partial<VideoTemplate> = await request.json();

    // Validate required fields
    if (
      !templateData.name ||
      !templateData.contentTypeId ||
      !templateData.voiceId ||
      !templateData.imageStyleId
    ) {
      return NextResponse.json(
        { error: "Missing required template fields" },
        { status: 400 }
      );
    }

    // Add timestamps and user ID
    const completeTemplateData = {
      ...templateData,
      userId: auth.userId,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      lastUsedAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    // Add the template to the database
    const docRef = await db.collection("templates").add(completeTemplateData);

    // Return the created template with the generated ID
    return NextResponse.json({
      id: docRef.id,
      ...completeTemplateData
    });
  } catch (error) {
    console.error("Error creating template:", error);
    return NextResponse.json(
      { error: "Failed to create template" },
      { status: 500 }
    );
  }
} 