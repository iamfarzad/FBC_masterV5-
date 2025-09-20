import { artifact } from "@ai-sdk-tools/artifacts";
import { z } from "zod";

/**
 * TC Analysis Artifact
 * For Terms & Conditions document analysis
 */
export const tcAnalysisArtifact = artifact(
  "tc-analysis",
  z.object({
    document: z.object({
      filename: z.string(),
      type: z.string(),
      size: z.number(),
      processedAt: z.string(),
    }),
    analysis: z.object({
      executiveSummary: z.string(),
      keyPoints: z.array(z.string()),
      businessRisks: z.array(z.string()),
      opportunities: z.array(z.string()),
      recommendations: z.array(z.string()),
      riskLevel: z.enum(["low", "medium", "high", "critical"]),
      complianceScore: z.number().min(0).max(100),
    }),
    metadata: z.object({
      processingTime: z.number(),
      confidence: z.number().min(0).max(1),
      language: z.string(),
      hasUrlContext: z.boolean(),
    }),
    summary: z.string(),
  })
);

/**
 * Research Artifact
 * For lead research and intelligence gathering
 */
export const researchArtifact = artifact(
  "research",
  z.object({
    lead: z.object({
      name: z.string(),
      email: z.string(),
      company: z.string().optional(),
      role: z.string().optional(),
      confidence: z.number().min(0).max(1),
    }),
    research: z.object({
      conversationSummary: z.string(),
      consultantBrief: z.string(),
      leadScore: z.number().min(0).max(100),
      aiCapabilitiesShown: z.array(z.string()),
      painPoints: z.array(z.string()),
      interests: z.array(z.string()),
      nextSteps: z.array(z.string()),
    }),
    context: z.object({
      companyContext: z.object({
        name: z.string(),
        industry: z.string().optional(),
        size: z.string().optional(),
        summary: z.string(),
      }).optional(),
      personContext: z.object({
        name: z.string(),
        role: z.string(),
        seniority: z.string().optional(),
        summary: z.string(),
      }).optional(),
    }),
    summary: z.string(),
    lastUpdated: z.string(),
  })
);

/**
 * Summary Artifact
 * For conversation and lead summary generation
 */
export const summaryArtifact = artifact(
  "summary",
  z.object({
    leadInfo: z.object({
      name: z.string(),
      email: z.string(),
      company: z.string().optional(),
      role: z.string().optional(),
    }),
    conversation: z.object({
      totalMessages: z.number(),
      duration: z.string(),
      keyTopics: z.array(z.string()),
      sentiment: z.enum(["positive", "neutral", "negative"]),
      engagement: z.enum(["high", "medium", "low"]),
    }),
    insights: z.object({
      leadScore: z.number().min(0).max(100),
      qualification: z.enum(["high", "medium", "low"]),
      painPoints: z.array(z.string()),
      opportunities: z.array(z.string()),
      recommendations: z.array(z.string()),
    }),
    nextSteps: z.array(z.string()),
    summary: z.string(),
    generatedAt: z.string(),
  })
);

/**
 * PDF Generation Artifact
 * For PDF summary generation and download
 */
export const pdfGenerationArtifact = artifact(
  "pdf-generation",
  z.object({
    document: z.object({
      filename: z.string(),
      format: z.enum(["pdf", "markdown"]),
      size: z.number(),
      pages: z.number().optional(),
      generatedAt: z.string(),
    }),
    content: z.object({
      leadInfo: z.object({
        name: z.string(),
        email: z.string(),
        company: z.string().optional(),
        role: z.string().optional(),
      }),
      conversationHistory: z.array(z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string(),
        timestamp: z.string(),
      })),
      leadResearch: z.object({
        conversationSummary: z.string(),
        consultantBrief: z.string(),
        leadScore: z.number(),
        aiCapabilitiesShown: z.string(),
      }).optional(),
    }),
    status: z.object({
      generated: z.boolean(),
      downloadUrl: z.string().optional(),
      error: z.string().optional(),
    }),
    summary: z.string(),
  })
);

/**
 * Complete Workflow Artifact
 * For the entire TC → Research → Summary → PDF workflow
 */
export const workflowArtifact = artifact(
  "workflow",
  z.object({
    sessionId: z.string(),
    status: z.enum(["tc-analysis", "research", "summary", "pdf-generation", "completed", "error"]),
    steps: z.array(z.object({
      step: z.enum(["tc-analysis", "research", "summary", "pdf-generation"]),
      status: z.enum(["pending", "in-progress", "completed", "error"]),
      startedAt: z.string().optional(),
      completedAt: z.string().optional(),
      error: z.string().optional(),
    })),
    artifacts: z.object({
      tcAnalysis: z.any().optional(),
      research: z.any().optional(),
      summary: z.any().optional(),
      pdfGeneration: z.any().optional(),
    }),
    progress: z.object({
      currentStep: z.number(),
      totalSteps: z.number(),
      percentage: z.number().min(0).max(100),
    }),
    summary: z.string(),
    lastUpdated: z.string(),
  })
);

// Export all workflow artifacts
export const workflowArtifacts = {
  tcAnalysis: tcAnalysisArtifact,
  research: researchArtifact,
  summary: summaryArtifact,
  pdfGeneration: pdfGenerationArtifact,
  workflow: workflowArtifact,
} as const;

export type WorkflowArtifactTypes = keyof typeof workflowArtifacts;