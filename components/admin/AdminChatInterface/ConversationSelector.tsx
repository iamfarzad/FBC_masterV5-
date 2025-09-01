"use client"

import React from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { MessageSquare, Check, Clock, AlertCircle } from 'lucide-react'
import { cn } from '@/src/core/utils'

interface Conversation {
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

interface ConversationSelectorProps {
  conversations: Conversation[]
  selectedConversation: Conversation | null
  showConversationSelector: boolean
  onToggleSelector: () => void
  onSelectConversation: (conversation: Conversation) => void
}

export function ConversationSelector({
  conversations,
  selectedConversation,
  showConversationSelector,
  onToggleSelector,
  onSelectConversation
}: ConversationSelectorProps) {
  return (
    <>
      {/* Conversation Context Selector Trigger */}
      <Dialog open={showConversationSelector} onOpenChange={onToggleSelector}>
        <DialogTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="text-xs gap-1"
          >
            <MessageSquare className="w-3 h-3" />
            {selectedConversation ? 'Change Context' : 'Load Conversation'}
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-2xl max-h-[70vh]">
          <DialogHeader>
            <DialogTitle>Select Conversation Context</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 max-h-[50vh] overflow-y-auto">
            {conversations.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No conversations found. Try refreshing or check if conversations are being saved.
              </div>
            ) : (
              conversations.map((conversation) => {
                const researchData = conversation.researchJson
                const company = researchData?.company || {}
                const person = researchData?.person || {}

                return (
                  <Card
                    key={conversation.id}
                    className={cn(
                      "cursor-pointer transition-colors hover:bg-muted/50",
                      selectedConversation?.id === conversation.id && "ring-2 ring-primary"
                    )}
                    onClick={() => onSelectConversation(conversation)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-medium">
                              {conversation.name || conversation.email || 'Unknown Lead'}
                            </h4>
                            <Badge variant="outline" className="text-xs">
                              {conversation.leadScore || 0}/100
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">
                            {company.name || 'Unknown Company'} • {person.role || 'Unknown Role'}
                          </p>
                          <p className="text-xs text-muted-foreground line-clamp-2">
                            {conversation.summary || 'No summary available'}
                          </p>
                        </div>
                        <div className="text-right text-xs text-muted-foreground">
                          <div className="flex items-center gap-1 mb-1">
                            {conversation.pdfUrl ? (
                              <Check className="w-3 h-3 text-green-500" />
                            ) : (
                              <Clock className="w-3 h-3 text-yellow-500" />
                            )}
                            PDF
                          </div>
                          <div className="flex items-center gap-1">
                            {conversation.emailStatus === 'sent' ? (
                              <Check className="w-3 h-3 text-green-500" />
                            ) : conversation.emailStatus === 'failed' ? (
                              <AlertCircle className="w-3 h-3 text-red-500" />
                            ) : (
                              <Clock className="w-3 h-3 text-yellow-500" />
                            )}
                            Email
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Selected Conversation Badge */}
      {selectedConversation && (
        <Badge variant="outline" className="text-xs bg-info/10 text-info border-info/20">
          {selectedConversation.name || selectedConversation.email}
        </Badge>
      )}
    </>
  )
}
