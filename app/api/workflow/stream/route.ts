import { NextRequest, NextResponse } from "next/server";
import { WorkflowStreamingService } from "@/lib/artifacts/workflow-streaming-service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Workflow Streaming API Endpoint
 * Generates and streams data for the TC → Research → Summary → PDF workflow
 */
export async function POST(req: NextRequest) {
  try {
    const { artifactType, data, context } = await req.json();

    if (!artifactType || !data) {
      return NextResponse.json(
        { error: "Missing required fields: artifactType and data" },
        { status: 400 }
      );
    }

    // Validate artifact type
    const validTypes = ["tc-analysis", "research", "summary", "pdf-generation", "workflow"];
    if (!validTypes.includes(artifactType)) {
      return NextResponse.json(
        { error: `Invalid artifact type. Must be one of: ${validTypes.join(", ")}` },
        { status: 400 }
      );
    }

    console.log(`[WORKFLOW_STREAM] Generating ${artifactType} for session: ${data.sessionId || 'unknown'}`);

    // Generate the artifact data
    const result = await WorkflowStreamingService.streamWorkflowArtifact(artifactType, data, context);

    return NextResponse.json(
      { 
        success: true, 
        artifactType,
        sessionId: data.sessionId,
        data: result.data,
        message: `${artifactType} artifact generated successfully`
      },
      { status: 200 }
    );

  } catch (error) {
    console.error("[WORKFLOW_STREAM] Error:", error);
    
    return NextResponse.json(
      { 
        error: "Failed to generate workflow artifact",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}

/**
 * GET endpoint for workflow artifact types and metadata
 */
export async function GET() {
  return NextResponse.json({
    workflowTypes: [
      {
        id: "tc-analysis",
        name: "TC Analysis",
        description: "Terms & Conditions document analysis and risk assessment",
        icon: "📄",
        step: 1
      },
      {
        id: "research",
        name: "Lead Research",
        description: "Lead intelligence gathering and qualification",
        icon: "🔍",
        step: 2
      },
      {
        id: "summary",
        name: "Conversation Summary",
        description: "Comprehensive conversation and lead summary",
        icon: "📝",
        step: 3
      },
      {
        id: "pdf-generation",
        name: "PDF Generation",
        description: "Professional PDF summary document creation",
        icon: "📊",
        step: 4
      },
      {
        id: "workflow",
        name: "Complete Workflow",
        description: "End-to-end workflow orchestration and monitoring",
        icon: "🔄",
        step: 0
      }
    ],
    workflowSteps: [
      { step: 1, name: "TC Analysis", description: "Analyze Terms & Conditions documents" },
      { step: 2, name: "Lead Research", description: "Gather lead intelligence and qualification" },
      { step: 3, name: "Summary Generation", description: "Create comprehensive conversation summary" },
      { step: 4, name: "PDF Generation", description: "Generate professional PDF document" }
    ]
  });
}