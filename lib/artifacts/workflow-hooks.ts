import { useState, useEffect } from "react";
import { 
  tcAnalysisArtifact,
  researchArtifact,
  summaryArtifact,
  pdfGenerationArtifact,
  workflowArtifact,
  workflowArtifacts
} from "./workflow-artifacts";

// Simple artifact state management
const artifactStates = new Map();

// Function to update artifact state
export function updateArtifactState(artifactType: string, data: any, isStreaming: boolean = false, error: any = null) {
  artifactStates.set(artifactType, { data, isStreaming, error });
}

/**
 * Hook for TC Analysis Artifact
 */
export function useTCAnalysisArtifact() {
  const [data, setData] = useState(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const state = artifactStates.get('tc-analysis') || { data: null, isStreaming: false, error: null };
    setData(state.data);
    setIsStreaming(state.isStreaming);
    setError(state.error);
  }, []);

  return { data, isStreaming, error };
}

/**
 * Hook for Research Artifact
 */
export function useResearchArtifact() {
  const [data, setData] = useState(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const state = artifactStates.get('research') || { data: null, isStreaming: false, error: null };
    setData(state.data);
    setIsStreaming(state.isStreaming);
    setError(state.error);
  }, []);

  return { data, isStreaming, error };
}

/**
 * Hook for Summary Artifact
 */
export function useSummaryArtifact() {
  const [data, setData] = useState(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const state = artifactStates.get('summary') || { data: null, isStreaming: false, error: null };
    setData(state.data);
    setIsStreaming(state.isStreaming);
    setError(state.error);
  }, []);

  return { data, isStreaming, error };
}

/**
 * Hook for PDF Generation Artifact
 */
export function usePDFGenerationArtifact() {
  const [data, setData] = useState(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const state = artifactStates.get('pdf-generation') || { data: null, isStreaming: false, error: null };
    setData(state.data);
    setIsStreaming(state.isStreaming);
    setError(state.error);
  }, []);

  return { data, isStreaming, error };
}

/**
 * Hook for Complete Workflow Artifact
 */
export function useWorkflowArtifact() {
  const [data, setData] = useState(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const state = artifactStates.get('workflow') || { data: null, isStreaming: false, error: null };
    setData(state.data);
    setIsStreaming(state.isStreaming);
    setError(state.error);
  }, []);

  return { data, isStreaming, error };
}

/**
 * Hook to get all workflow artifacts
 */
export function useAllWorkflowArtifacts() {
  return {
    tcAnalysis: useTCAnalysisArtifact(),
    research: useResearchArtifact(),
    summary: useSummaryArtifact(),
    pdfGeneration: usePDFGenerationArtifact(),
    workflow: useWorkflowArtifact(),
  };
}

/**
 * Hook for workflow streaming status
 */
export function useWorkflowStreamingStatus() {
  const tcAnalysis = useTCAnalysisArtifact();
  const research = useResearchArtifact();
  const summary = useSummaryArtifact();
  const pdfGeneration = usePDFGenerationArtifact();
  const workflow = useWorkflowArtifact();

  return {
    isStreaming: {
      tcAnalysis: tcAnalysis.isStreaming,
      research: research.isStreaming,
      summary: summary.isStreaming,
      pdfGeneration: pdfGeneration.isStreaming,
      workflow: workflow.isStreaming,
    },
    hasData: {
      tcAnalysis: !!tcAnalysis.data,
      research: !!research.data,
      summary: !!summary.data,
      pdfGeneration: !!pdfGeneration.data,
      workflow: !!workflow.data,
    },
    errors: {
      tcAnalysis: tcAnalysis.error,
      research: research.error,
      summary: summary.error,
      pdfGeneration: pdfGeneration.error,
      workflow: workflow.error,
    },
  };
}