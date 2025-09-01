"use client"

import { useState, useEffect } from 'react'

export interface Conversation {
  id: string
  name: string | null
  email: string | null
  summary: string | null
  leadScore: number | null
  researchJson: any
  pdfUrl: string | null
  emailStatus: string | null
  createdAt: string | null
}

export function useConversationContext() {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null)
  const [conversationContext, setConversationContext] = useState<string>("")
  const [showConversationSelector, setShowConversationSelector] = useState(false)

  // Load conversations from API
  const loadConversations = async () => {
    try {
      const response = await fetch('/api/admin/conversations?period=last_30_days')
      if (response.ok) {
        const data = await response.json()
        setConversations(data)
      }
    } catch (error) {
      console.error('Failed to load conversations:', error)
    }
  }

  // Build conversation context for AI
  const buildConversationContext = (conversation: Conversation): string => {
    const research = conversation.researchJson
    const company = research?.company || {}
    const person = research?.person || {}
    const intelligence = research?.intelligence || {}

    let context = `Lead Context:\n`

    if (conversation.name) context += `Name: ${conversation.name}\n`
    if (conversation.email) context += `Email: ${conversation.email}\n`
    if (conversation.leadScore) context += `Lead Score: ${conversation.leadScore}/100\n`

    if (company.name) context += `\nCompany Information:\n- Name: ${company.name}\n`
    if (company.industry) context += `- Industry: ${company.industry}\n`
    if (company.size) context += `- Size: ${company.size}\n`
    if (company.website) context += `- Website: ${company.website}\n`
    if (company.description) context += `- Description: ${company.description}\n`

    if (person.role) context += `\nPerson Information:\n- Role: ${person.role}\n`
    if (person.seniority) context += `- Seniority: ${person.seniority}\n`
    if (person.department) context += `- Department: ${person.department}\n`
    if (person.experience) context += `- Experience: ${person.experience} years\n`

    if (intelligence.interests?.length > 0) {
      context += `\nInterests: ${intelligence.interests.join(', ')}\n`
    }

    if (intelligence.painPoints?.length > 0) {
      context += `\nPain Points: ${intelligence.painPoints.join(', ')}\n`
    }

    if (intelligence.goals?.length > 0) {
      context += `\nGoals: ${intelligence.goals.join(', ')}\n`
    }

    if (conversation.summary) {
      context += `\nConversation Summary:\n${conversation.summary}\n`
    }

    return context
  }

  const handleConversationSelect = (conversation: Conversation) => {
    setSelectedConversation(conversation)
    const context = buildConversationContext(conversation)
    setConversationContext(context)
    setShowConversationSelector(false)
  }

  return {
    conversations,
    selectedConversation,
    conversationContext,
    showConversationSelector,
    setShowConversationSelector,
    loadConversations,
    handleConversationSelect
  }
}
