import { useState, useEffect } from "react";
import { 
  consentArtifact,
  researchProgressArtifact,
  contextPersonalizationArtifact,
  sessionCompletionArtifact,
  realWorkflowArtifact,
} from "./real-workflow-artifacts";

// Real workflow state management
const realWorkflowStates = new Map();

// Function to update real workflow state
export function updateRealWorkflowState(artifactType: string, data: any, isStreaming: boolean = false, error: any = null) {
  realWorkflowStates.set(artifactType, { data, isStreaming, error });
}

/**
 * Hook for Consent Artifact
 */
export function useConsentArtifact() {
  const [data, setData] = useState(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const state = realWorkflowStates.get('consent') || { data: null, isStreaming: false, error: null };
    setData(state.data);
    setIsStreaming(state.isStreaming);
    setError(state.error);
  }, []);

  return { data, isStreaming, error };
}

/**
 * Hook for Research Progress Artifact
 */
export function useResearchProgressArtifact() {
  const [data, setData] = useState(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const state = realWorkflowStates.get('research-progress') || { data: null, isStreaming: false, error: null };
    setData(state.data);
    setIsStreaming(state.isStreaming);
    setError(state.error);
  }, []);

  return { data, isStreaming, error };
}

/**
 * Hook for Context Personalization Artifact
 */
export function useContextPersonalizationArtifact() {
  const [data, setData] = useState(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const state = realWorkflowStates.get('context-personalization') || { data: null, isStreaming: false, error: null };
    setData(state.data);
    setIsStreaming(state.isStreaming);
    setError(state.error);
  }, []);

  return { data, isStreaming, error };
}

/**
 * Hook for Session Completion Artifact
 */
export function useSessionCompletionArtifact() {
  const [data, setData] = useState(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const state = realWorkflowStates.get('session-completion') || { data: null, isStreaming: false, error: null };
    setData(state.data);
    setIsStreaming(state.isStreaming);
    setError(state.error);
  }, []);

  return { data, isStreaming, error };
}

/**
 * Hook for Complete Real Workflow Artifact
 */
export function useRealWorkflowArtifact() {
  const [data, setData] = useState(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const state = realWorkflowStates.get('real-workflow') || { data: null, isStreaming: false, error: null };
    setData(state.data);
    setIsStreaming(state.isStreaming);
    setError(state.error);
  }, []);

  return { data, isStreaming, error };
}

/**
 * Hook to get all real workflow artifacts
 */
export function useAllRealWorkflowArtifacts() {
  return {
    consent: useConsentArtifact(),
    researchProgress: useResearchProgressArtifact(),
    contextPersonalization: useContextPersonalizationArtifact(),
    sessionCompletion: useSessionCompletionArtifact(),
    realWorkflow: useRealWorkflowArtifact(),
  };
}

/**
 * Hook for real workflow streaming status
 */
export function useRealWorkflowStreamingStatus() {
  const consent = useConsentArtifact();
  const researchProgress = useResearchProgressArtifact();
  const contextPersonalization = useContextPersonalizationArtifact();
  const sessionCompletion = useSessionCompletionArtifact();
  const realWorkflow = useRealWorkflowArtifact();

  return {
    isStreaming: {
      consent: consent.isStreaming,
      researchProgress: researchProgress.isStreaming,
      contextPersonalization: contextPersonalization.isStreaming,
      sessionCompletion: sessionCompletion.isStreaming,
      realWorkflow: realWorkflow.isStreaming,
    },
    hasData: {
      consent: !!consent.data,
      researchProgress: !!researchProgress.data,
      contextPersonalization: !!contextPersonalization.data,
      sessionCompletion: !!sessionCompletion.data,
      realWorkflow: !!realWorkflow.data,
    },
    errors: {
      consent: consent.error,
      researchProgress: researchProgress.error,
      contextPersonalization: contextPersonalization.error,
      sessionCompletion: sessionCompletion.error,
      realWorkflow: realWorkflow.error,
    },
  };
}