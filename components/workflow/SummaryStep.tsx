"use client";

import { useSummaryArtifact } from "@/lib/artifacts/workflow-hooks";
import { cn } from "@/src/core/utils";
import { FileText, User, MessageSquare, TrendingUp, Clock, Star } from "lucide-react";

interface SummaryStepProps {
  className?: string;
  leadInfo?: any;
}

export function SummaryStep({ className, leadInfo }: SummaryStepProps) {
  const { data, isStreaming, error } = useSummaryArtifact();

  if (error) {
    return (
      <div className={cn("p-4 border border-red-200 rounded-lg bg-red-50", className)}>
        <div className="flex items-center space-x-2">
          <FileText className="w-5 h-5 text-red-600" />
          <h3 className="text-red-800 font-semibold">Summary Error</h3>
        </div>
        <p className="text-red-600 text-sm mt-1">{error.message}</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className={cn("p-4 border border-border rounded-lg bg-surface", className)}>
        <div className="flex items-center space-x-2">
          <div className="animate-spin rounded-full h-4 w-4 border-2 border-brand border-t-transparent"></div>
          <span className="text-text-muted">Generating conversation summary...</span>
        </div>
      </div>
    );
  }

  const getQualificationColor = (qualification: string) => {
    switch (qualification) {
      case "high": return "text-green-600 bg-green-100";
      case "medium": return "text-yellow-600 bg-yellow-100";
      case "low": return "text-red-600 bg-red-100";
      default: return "text-gray-600 bg-gray-100";
    }
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case "positive": return "text-green-600";
      case "neutral": return "text-yellow-600";
      case "negative": return "text-red-600";
      default: return "text-gray-600";
    }
  };

  const getEngagementColor = (engagement: string) => {
    switch (engagement) {
      case "high": return "text-green-600";
      case "medium": return "text-yellow-600";
      case "low": return "text-red-600";
      default: return "text-gray-600";
    }
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* Header */}
      <div className="flex items-center space-x-3 p-4 bg-surface border border-border rounded-lg">
        <FileText className="w-6 h-6 text-brand" />
        <div>
          <h3 className="font-semibold text-text">Conversation Summary Complete</h3>
          <p className="text-sm text-text-muted">
            {data.leadInfo.name} • {data.conversation.totalMessages} messages
          </p>
        </div>
      </div>

      {/* Lead Information */}
      <div className="bg-surface border border-border rounded-lg p-4">
        <h4 className="font-semibold text-text mb-3 flex items-center space-x-2">
          <User className="w-4 h-4" />
          Lead Information
        </h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="text-text-muted">Name:</span>
            <p className="text-text font-medium">{data.leadInfo.name}</p>
          </div>
          <div>
            <span className="text-text-muted">Email:</span>
            <p className="text-text font-medium">{data.leadInfo.email}</p>
          </div>
          {data.leadInfo.company && (
            <div>
              <span className="text-text-muted">Company:</span>
              <p className="text-text font-medium">{data.leadInfo.company}</p>
            </div>
          )}
          {data.leadInfo.role && (
            <div>
              <span className="text-text-muted">Role:</span>
              <p className="text-text font-medium">{data.leadInfo.role}</p>
            </div>
          )}
        </div>
      </div>

      {/* Conversation Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Total Messages */}
        <div className="bg-surface border border-border rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-medium text-text">Messages</h4>
            <MessageSquare className="w-4 h-4 text-text-muted" />
          </div>
          <div className="text-2xl font-bold text-text">
            {data.conversation.totalMessages}
          </div>
        </div>

        {/* Duration */}
        <div className="bg-surface border border-border rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-medium text-text">Duration</h4>
            <Clock className="w-4 h-4 text-text-muted" />
          </div>
          <div className="text-2xl font-bold text-text">
            {data.conversation.duration}
          </div>
        </div>

        {/* Sentiment */}
        <div className="bg-surface border border-border rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-medium text-text">Sentiment</h4>
            <TrendingUp className="w-4 h-4 text-text-muted" />
          </div>
          <div className={cn(
            "text-2xl font-bold capitalize",
            getSentimentColor(data.conversation.sentiment)
          )}>
            {data.conversation.sentiment}
          </div>
        </div>

        {/* Engagement */}
        <div className="bg-surface border border-border rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-medium text-text">Engagement</h4>
            <Star className="w-4 h-4 text-text-muted" />
          </div>
          <div className={cn(
            "text-2xl font-bold capitalize",
            getEngagementColor(data.conversation.engagement)
          )}>
            {data.conversation.engagement}
          </div>
        </div>
      </div>

      {/* Key Topics */}
      <div className="bg-surface border border-border rounded-lg p-4">
        <h4 className="font-semibold text-text mb-3">Key Topics Discussed</h4>
        <div className="flex flex-wrap gap-2">
          {data.conversation.keyTopics.map((topic, index) => (
            <span
              key={index}
              className="px-3 py-1 bg-brand/10 text-brand text-sm rounded-full"
            >
              {topic}
            </span>
          ))}
        </div>
      </div>

      {/* Lead Insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Lead Score */}
        <div className="bg-surface border border-border rounded-lg p-4">
          <h4 className="font-semibold text-text mb-3">Lead Score</h4>
          <div className="text-center">
            <div className="text-4xl font-bold text-brand mb-2">
              {data.insights.leadScore}
            </div>
            <p className="text-sm text-text-muted">out of 100</p>
          </div>
        </div>

        {/* Qualification */}
        <div className="bg-surface border border-border rounded-lg p-4">
          <h4 className="font-semibold text-text mb-3">Qualification Level</h4>
          <div className="text-center">
            <div className={cn(
              "inline-flex items-center px-4 py-2 rounded-full text-lg font-bold",
              getQualificationColor(data.insights.qualification)
            )}>
              {data.insights.qualification.toUpperCase()}
            </div>
          </div>
        </div>
      </div>

      {/* Pain Points */}
      <div className="bg-surface border border-red-200 rounded-lg p-4">
        <h4 className="font-semibold text-red-800 mb-3">Pain Points Identified</h4>
        <ul className="space-y-2">
          {data.insights.painPoints.map((painPoint, index) => (
            <li key={index} className="flex items-start space-x-2">
              <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
              <span className="text-red-700 text-sm">{painPoint}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Opportunities */}
      <div className="bg-surface border border-green-200 rounded-lg p-4">
        <h4 className="font-semibold text-green-800 mb-3">Business Opportunities</h4>
        <ul className="space-y-2">
          {data.insights.opportunities.map((opportunity, index) => (
            <li key={index} className="flex items-start space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
              <span className="text-green-700 text-sm">{opportunity}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Recommendations */}
      <div className="bg-surface border border-brand/20 rounded-lg p-4">
        <h4 className="font-semibold text-brand mb-3">Strategic Recommendations</h4>
        <ul className="space-y-2">
          {data.insights.recommendations.map((recommendation, index) => (
            <li key={index} className="flex items-start space-x-2">
              <div className="w-2 h-2 bg-brand rounded-full mt-2 flex-shrink-0"></div>
              <span className="text-text-muted text-sm">{recommendation}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Next Steps */}
      <div className="bg-surface border border-brand/20 rounded-lg p-4">
        <h4 className="font-semibold text-brand mb-3">Recommended Next Steps</h4>
        <ul className="space-y-2">
          {data.nextSteps.map((step, index) => (
            <li key={index} className="flex items-start space-x-2">
              <div className="w-2 h-2 bg-brand rounded-full mt-2 flex-shrink-0"></div>
              <span className="text-text-muted text-sm">{step}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Summary */}
      <div className="bg-surface-elevated border border-border rounded-lg p-4">
        <h4 className="font-semibold text-text mb-2">Executive Summary</h4>
        <p className="text-text-muted text-sm leading-relaxed">{data.summary}</p>
        <div className="flex items-center justify-between mt-3 text-xs text-text-muted">
          <span>Generated: {new Date(data.generatedAt).toLocaleString()}</span>
          <span>Lead Score: {data.insights.leadScore}/100</span>
        </div>
      </div>

      {/* Streaming Indicator */}
      {isStreaming && (
        <div className="fixed bottom-4 right-4 bg-brand text-surface px-3 py-2 rounded-lg shadow-lg flex items-center space-x-2">
          <div className="animate-pulse w-2 h-2 bg-surface rounded-full"></div>
          <span className="text-sm font-medium">Generating summary...</span>
        </div>
      )}
    </div>
  );
}