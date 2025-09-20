import { google } from "@ai-sdk/google";
import { generateObject } from "ai";
import { z } from "zod";

/**
 * AI Model for generating workflow data
 */
const model = google("gemini-1.5-pro-latest");

/**
 * Workflow Streaming Service
 * Generates real-time data for your TC → Research → Summary → PDF workflow
 */
export class WorkflowStreamingService {
  /**
   * Generate TC Analysis Data
   */
  static async generateTCAnalysis(documentData: any, query: string) {
    try {
      const result = await generateObject({
        model,
        system: `You are a legal and business analysis AI that analyzes Terms & Conditions documents.

Generate comprehensive TC analysis including:
- Executive summary of key terms
- Critical business risks and opportunities
- Compliance scoring and recommendations
- Actionable insights for business decisions

Focus on practical business implications and risk assessment.`,
        prompt: `Analyze this Terms & Conditions document: ${query}

Document Data: ${JSON.stringify(documentData)}

Provide a comprehensive analysis with:
1. Executive summary
2. Key points and critical terms
3. Business risks and opportunities
4. Compliance assessment
5. Actionable recommendations`,
        schema: z.object({
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
        }),
        temperature: 0.3,
      });

      return result.object;
    } catch (error) {
      console.error("Error generating TC analysis:", error);
      throw new Error("Failed to generate TC analysis");
    }
  }

  /**
   * Generate Research Data
   */
  static async generateResearch(leadData: any, conversationHistory: any[]) {
    try {
      const result = await generateObject({
        model,
        system: `You are a lead research AI that analyzes conversation data and generates intelligence insights.

Generate comprehensive lead research including:
- Conversation summary and key insights
- Lead scoring and qualification
- Pain points and interests identification
- Consultant brief for follow-up
- Next steps recommendations

Focus on actionable intelligence for sales and business development.`,
        prompt: `Analyze this lead conversation and generate research insights:

Lead Data: ${JSON.stringify(leadData)}
Conversation History: ${JSON.stringify(conversationHistory)}

Provide comprehensive research including:
1. Lead qualification and scoring
2. Pain points and interests
3. AI capabilities demonstrated
4. Consultant brief for follow-up
5. Recommended next steps`,
        schema: z.object({
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
        }),
        temperature: 0.4,
      });

      return result.object;
    } catch (error) {
      console.error("Error generating research:", error);
      throw new Error("Failed to generate research");
    }
  }

  /**
   * Generate Summary Data
   */
  static async generateSummary(leadInfo: any, conversationHistory: any[], researchData: any) {
    try {
      const result = await generateObject({
        model,
        system: `You are a business intelligence AI that creates comprehensive conversation summaries.

Generate professional summaries including:
- Lead information and qualification
- Conversation insights and key topics
- Business opportunities and pain points
- Strategic recommendations
- Next steps for follow-up

Focus on creating actionable business intelligence.`,
        prompt: `Create a comprehensive summary for this lead conversation:

Lead Info: ${JSON.stringify(leadInfo)}
Conversation History: ${JSON.stringify(conversationHistory)}
Research Data: ${JSON.stringify(researchData)}

Generate a professional summary including:
1. Lead qualification and scoring
2. Key conversation insights
3. Business opportunities identified
4. Strategic recommendations
5. Recommended next steps`,
        schema: z.object({
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
        }),
        temperature: 0.3,
      });

      return result.object;
    } catch (error) {
      console.error("Error generating summary:", error);
      throw new Error("Failed to generate summary");
    }
  }

  /**
   * Generate PDF Generation Data
   */
  static async generatePDFData(summaryData: any, leadInfo: any) {
    try {
      const result = await generateObject({
        model,
        system: `You are a document generation AI that prepares data for PDF summary creation.

Prepare comprehensive PDF content including:
- Lead information and context
- Conversation history formatting
- Research insights and recommendations
- Professional document structure
- Download and sharing metadata

Focus on creating professional, actionable business documents.`,
        prompt: `Prepare PDF generation data for this lead summary:

Summary Data: ${JSON.stringify(summaryData)}
Lead Info: ${JSON.stringify(leadInfo)}

Prepare comprehensive PDF content including:
1. Lead information and context
2. Formatted conversation history
3. Research insights and recommendations
4. Professional document structure
5. Download metadata`,
        schema: z.object({
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
        }),
        temperature: 0.2,
      });

      return result.object;
    } catch (error) {
      console.error("Error generating PDF data:", error);
      throw new Error("Failed to generate PDF data");
    }
  }

  /**
   * Generate Complete Workflow Data
   */
  static async generateWorkflowData(sessionId: string, currentStep: string, allData: any) {
    try {
      const result = await generateObject({
        model,
        system: `You are a workflow orchestration AI that manages the complete TC → Research → Summary → PDF workflow.

Track and coordinate the entire business intelligence workflow:
- Monitor progress through each step
- Coordinate data flow between steps
- Provide real-time status updates
- Handle errors and recovery
- Generate comprehensive workflow summary

Focus on seamless workflow execution and user experience.`,
        prompt: `Manage the complete workflow for session ${sessionId}:

Current Step: ${currentStep}
All Data: ${JSON.stringify(allData)}

Provide comprehensive workflow management including:
1. Current step status and progress
2. Completed steps and their results
3. Pending steps and requirements
4. Error handling and recovery
5. Overall workflow summary`,
        schema: z.object({
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
        }),
        temperature: 0.2,
      });

      return result.object;
    } catch (error) {
      console.error("Error generating workflow data:", error);
      throw new Error("Failed to generate workflow data");
    }
  }

  /**
   * Stream Workflow Artifact
   */
  static async streamWorkflowArtifact(artifactType: string, data: any, context?: any) {
    let artifactData;
    
    switch (artifactType) {
      case "tc-analysis":
        artifactData = await this.generateTCAnalysis(data.documentData, data.query);
        return { data: artifactData, type: artifactType };
      
      case "research":
        artifactData = await this.generateResearch(data.leadData, data.conversationHistory);
        return { data: artifactData, type: artifactType };
      
      case "summary":
        artifactData = await this.generateSummary(data.leadInfo, data.conversationHistory, data.researchData);
        return { data: artifactData, type: artifactType };
      
      case "pdf-generation":
        artifactData = await this.generatePDFData(data.summaryData, data.leadInfo);
        return { data: artifactData, type: artifactType };
      
      case "workflow":
        artifactData = await this.generateWorkflowData(data.sessionId, data.currentStep, data.allData);
        return { data: artifactData, type: artifactType };
      
      default:
        throw new Error(`Unknown workflow artifact type: ${artifactType}`);
    }
  }
}