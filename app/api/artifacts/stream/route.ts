import { NextRequest, NextResponse } from "next/server";
import { ArtifactStreamingService } from "@/lib/artifacts/streaming-service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Artifact Streaming API Endpoint
 * Generates and streams chart data for various business metrics
 */
export async function POST(req: NextRequest) {
  try {
    const { artifactType, query, context } = await req.json();

    if (!artifactType || !query) {
      return NextResponse.json(
        { error: "Missing required fields: artifactType and query" },
        { status: 400 }
      );
    }

    // Validate artifact type
    const validTypes = ["burn-rate", "revenue-analytics", "lead-conversion", "performance-dashboard"];
    if (!validTypes.includes(artifactType)) {
      return NextResponse.json(
        { error: `Invalid artifact type. Must be one of: ${validTypes.join(", ")}` },
        { status: 400 }
      );
    }

    console.log(`[ARTIFACT_STREAM] Generating ${artifactType} for query: ${query}`);

    // Generate and stream the artifact
    const stream = await ArtifactStreamingService.streamArtifact(artifactType, query, context);
    
    // Complete the stream
    stream.complete();

    return NextResponse.json(
      { 
        success: true, 
        artifactType,
        message: `${artifactType} artifact generated successfully`
      },
      { status: 200 }
    );

  } catch (error) {
    console.error("[ARTIFACT_STREAM] Error:", error);
    
    return NextResponse.json(
      { 
        error: "Failed to generate artifact",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}

/**
 * GET endpoint for artifact types and metadata
 */
export async function GET() {
  return NextResponse.json({
    artifactTypes: [
      {
        id: "burn-rate",
        name: "Burn Rate Analysis",
        description: "Monthly burn rate tracking and trend analysis",
        icon: "🔥"
      },
      {
        id: "revenue-analytics",
        name: "Revenue Analytics",
        description: "Revenue trends, growth rates, and forecasting",
        icon: "💰"
      },
      {
        id: "lead-conversion",
        name: "Lead Conversion Funnel",
        description: "Lead funnel analysis and conversion metrics",
        icon: "🎯"
      },
      {
        id: "performance-dashboard",
        name: "Performance Dashboard",
        description: "Comprehensive business performance overview",
        icon: "📊"
      }
    ]
  });
}