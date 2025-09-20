import { artifact } from "@ai-sdk-tools/artifacts";
import { z } from "zod";

/**
 * Consent Artifact - When user fills out Terms & Conditions
 */
export const consentArtifact = artifact(
  "consent",
  z.object({
    user: z.object({
      name: z.string(),
      email: z.string(),
      companyUrl: z.string().optional(),
    }),
    consent: z.object({
      allowed: z.boolean(),
      policyVersion: z.string().optional(),
      timestamp: z.string(),
      sessionId: z.string(),
    }),
    researchTriggered: z.boolean(),
    intelligenceReady: z.boolean(),
    summary: z.string(),
  })
);

/**
 * Research Progress Artifact - Real-time lead research
 */
export const researchProgressArtifact = artifact(
  "research-progress",
  z.object({
    sessionId: z.string(),
    status: z.enum(["starting", "searching", "analyzing", "completed", "error"]),
    progress: z.object({
      currentStep: z.string(),
      totalSteps: z.number(),
      percentage: z.number().min(0).max(100),
    }),
    research: z.object({
      company: z.object({
        name: z.string().optional(),
        industry: z.string().optional(),
        size: z.string().optional(),
        summary: z.string().optional(),
      }).optional(),
      person: z.object({
        name: z.string().optional(),
        role: z.string().optional(),
        seniority: z.string().optional(),
        summary: z.string().optional(),
      }).optional(),
      role: z.string().optional(),
      confidence: z.number().min(0).max(1).optional(),
      citations: z.array(z.object({
        uri: z.string(),
        title: z.string().optional(),
        description: z.string().optional(),
      })).optional(),
    }).optional(),
    error: z.string().optional(),
    summary: z.string(),
  })
);

/**
 * Context Personalization Artifact - How research personalizes conversation
 */
export const contextPersonalizationArtifact = artifact(
  "context-personalization",
  z.object({
    sessionId: z.string(),
    contextReady: z.boolean(),
    personalization: z.object({
      lead: z.object({
        name: z.string(),
        email: z.string(),
      }),
      company: z.object({
        name: z.string().optional(),
        industry: z.string().optional(),
        size: z.string().optional(),
      }).optional(),
      person: z.object({
        role: z.string().optional(),
        seniority: z.string().optional(),
      }).optional(),
      role: z.string().optional(),
      roleConfidence: z.number().min(0).max(1).optional(),
      capabilities: z.array(z.string()).default([]),
    }),
    conversationContext: z.object({
      personalizedGreeting: z.string(),
      relevantCapabilities: z.array(z.string()),
      suggestedTopics: z.array(z.string()),
      businessContext: z.string(),
    }),
    summary: z.string(),
  })
);

/**
 * Session Completion Artifact - Final PDF generation and email
 */
export const sessionCompletionArtifact = artifact(
  "session-completion",
  z.object({
    sessionId: z.string(),
    lead: z.object({
      name: z.string(),
      email: z.string(),
      company: z.string().optional(),
    }),
    conversation: z.object({
      totalMessages: z.number(),
      duration: z.string(),
      keyTopics: z.array(z.string()),
      sentiment: z.enum(["positive", "neutral", "negative"]),
      engagement: z.enum(["high", "medium", "low"]),
    }),
    research: z.object({
      leadScore: z.number().min(0).max(100),
      qualification: z.enum(["high", "medium", "low"]),
      painPoints: z.array(z.string()),
      opportunities: z.array(z.string()),
      recommendations: z.array(z.string()),
    }),
    deliverables: z.object({
      pdfGenerated: z.boolean(),
      pdfUrl: z.string().optional(),
      emailSent: z.boolean(),
      emailSubject: z.string().optional(),
      followUpScheduled: z.boolean(),
    }),
    summary: z.string(),
    completedAt: z.string(),
  })
);

/**
 * Complete Real Workflow Artifact - End-to-end flow
 */
export const realWorkflowArtifact = artifact(
  "real-workflow",
  z.object({
    sessionId: z.string(),
    status: z.enum(["consent", "research", "personalized", "completed", "error"]),
    steps: z.array(z.object({
      step: z.enum(["consent", "research", "personalization", "completion"]),
      status: z.enum(["pending", "in-progress", "completed", "error"]),
      startedAt: z.string().optional(),
      completedAt: z.string().optional(),
      error: z.string().optional(),
    })),
    artifacts: z.object({
      consent: z.any().optional(),
      research: z.any().optional(),
      personalization: z.any().optional(),
      completion: z.any().optional(),
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

// Export all real workflow artifacts
export const realWorkflowArtifacts = {
  consent: consentArtifact,
  researchProgress: researchProgressArtifact,
  contextPersonalization: contextPersonalizationArtifact,
  sessionCompletion: sessionCompletionArtifact,
  realWorkflow: realWorkflowArtifact,
} as const;

export type RealWorkflowArtifactTypes = keyof typeof realWorkflowArtifacts;