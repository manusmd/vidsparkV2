import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";


/**
 * API route that proxies image requests to prevent rate limiting issues
 * 
 * @param request The incoming request
 * @returns The proxied image response
 */
export async function GET(request: NextRequest) {
  try {
    // Get the URL from the query parameter
    const { searchParams } = new URL(request.url);
    const imageUrl = searchParams.get("url");

    // Validate the URL
    if (!imageUrl) {
      return new NextResponse("Missing URL parameter", { status: 400 });
    }

    // Only allow proxying from trusted domains
    const trustedDomains = ["yt3.ggpht.com", "i.ytimg.com", "files.stripe.com"];
    const url = new URL(imageUrl);
    if (!trustedDomains.some(domain => url.hostname.includes(domain))) {
      return new NextResponse("Invalid domain", { status: 403 });
    }

    // Create a cache key from the URL
    const cacheKey = crypto.createHash('md5').update(imageUrl).digest('hex');

    // Fetch the image
    const response = await fetch(imageUrl, {
      headers: {
        // Add a user agent to avoid being blocked
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
      }
    });

    if (!response.ok) {
      return new NextResponse(`Failed to fetch image: ${response.statusText}`, { 
        status: response.status 
      });
    }

    // Get the image data
    const imageData = await response.arrayBuffer();
    const contentType = response.headers.get("content-type") || "image/jpeg";

    // Create a new response with the image data
    const imageResponse = new NextResponse(imageData);
    imageResponse.headers.set("content-type", contentType);
    imageResponse.headers.set("Cache-Control", "public, max-age=604800, immutable");
    imageResponse.headers.set("ETag", cacheKey);
    imageResponse.headers.set("Vary", "Accept-Encoding");
    imageResponse.headers.set("Access-Control-Allow-Origin", "*");

    return imageResponse;
  } catch (error) {
    console.error("Error proxying image:", error);
    return new NextResponse("Error proxying image", { status: 500 });
  }
}
