import { NextRequest, NextResponse } from "next/server";
import { RealWorkflowStreamingService } from "@/lib/artifacts/real-workflow-streaming-service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Real Workflow Streaming API Endpoint
 * Generates and streams data for the actual TC → Research → Personalization → PDF workflow
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
    const validTypes = ["consent", "research-progress", "context-personalization", "session-completion", "real-workflow"];
    if (!validTypes.includes(artifactType)) {
      return NextResponse.json(
        { error: `Invalid artifact type. Must be one of: ${validTypes.join(", ")}` },
        { status: 400 }
      );
    }

    console.log(`[REAL_WORKFLOW_STREAM] Generating ${artifactType} for session: ${data.sessionId || 'unknown'}`);

    // Generate the artifact data
    const result = await RealWorkflowStreamingService.streamRealWorkflowArtifact(artifactType, data, context);

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
    console.error("[REAL_WORKFLOW_STREAM] Error:", error);
    
    return NextResponse.json(
      { 
        error: "Failed to generate real workflow artifact",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}

/**
 * GET endpoint for real workflow artifact types and metadata
 */
export async function GET() {
  return NextResponse.json({
    workflowTypes: [
      {
        id: "consent",
        name: "Consent & TC",
        description: "Terms & Conditions consent and user information collection",
        icon: "📋",
        step: 1
      },
      {
        id: "research-progress",
        name: "Lead Research",
        description: "Real-time lead intelligence gathering and analysis",
        icon: "🔍",
        step: 2
      },
      {
        id: "context-personalization",
        name: "Context Personalization",
        description: "How research personalizes the AI conversation",
        icon: "🎯",
        step: 3
      },
      {
        id: "session-completion",
        name: "Session Completion",
        description: "PDF generation and follow-up workflow",
        icon: "📊",
        step: 4
      },
      {
        id: "real-workflow",
        name: "Complete Workflow",
        description: "End-to-end real workflow orchestration",
        icon: "🔄",
        step: 0
      }
    ],
    workflowSteps: [
      { step: 1, name: "Consent & TC", description: "User fills out Terms & Conditions" },
      { step: 2, name: "Lead Research", description: "AI researches lead and company" },
      { step: 3, name: "Context Personalization", description: "Conversation gets personalized" },
      { step: 4, name: "Session Completion", description: "PDF generated and follow-up scheduled" }
    ]
  });
}