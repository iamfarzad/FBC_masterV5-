"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Eye, Building, Mail, FileText, Send, CheckCircle, XCircle, Clock, Download } from "lucide-react"
import { formatDistanceToNow } from "date-fns"

interface Conversation {
  id: string
  name: string | null
  email: string | null
  summary: string | null
  leadScore: number | null
  researchJson: any
  pdfUrl: string | null
  emailStatus: string | null
  emailRetries: number | null
  createdAt: string | null
}

interface ConversationsListProps {
  searchTerm: string
  period: string
}

export function ConversationsList({ searchTerm, period }: ConversationsListProps) {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null)

  useEffect(() => {
    fetchConversations()
  }, [fetchConversations])

  const fetchConversations = useCallback(async () => {
    try {
      const params = new URLSearchParams({
        searchTerm,
        period,
      })
      const response = await fetch(`/api/admin/conversations?${params}`)
      if (response.ok) {
        const data = await response.json()
        setConversations(data)
      }
    } catch (error) {
      console.error("Failed to fetch conversations:", error)
    } finally {
      setLoading(false)
    }
  }, [searchTerm, period])

  const getEmailStatusIcon = (status: string | null) => {
    switch (status) {
      case 'sent':
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-500" />
      case 'pending':
      default:
        return <Clock className="w-4 h-4 text-yellow-500" />
    }
  }

  const getEmailStatusBadge = (status: string | null) => {
    switch (status) {
      case 'sent':
        return <Badge variant="default" className="bg-success/10 text-success">Sent</Badge>
      case 'failed':
        return <Badge variant="destructive">Failed</Badge>
      case 'pending':
      default:
        return <Badge variant="secondary">Pending</Badge>
    }
  }

  const formatResearchData = (researchJson: any) => {
    if (!researchJson) return null

    const company = researchJson.company || {}
    const person = researchJson.person || {}
    const intelligence = researchJson.intelligence || {}

    return {
      companyName: company.name || 'Unknown',
      industry: company.industry || 'Unknown',
      role: person.role || 'Unknown',
      keywords: intelligence.keywords || [],
      confidence: intelligence.confidence || 0
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            Conversations
          </CardTitle>
          <CardDescription>
            View all lead conversations with research data, PDF status, and email delivery status
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Lead</TableHead>
                <TableHead>Company</TableHead>
                <TableHead>Score</TableHead>
                <TableHead>PDF</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {conversations.map((conversation) => {
                const researchData = formatResearchData(conversation.researchJson)
                return (
                  <TableRow key={conversation.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback>
                            {(conversation.name || conversation.email || 'U')[0].toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{conversation.name || 'Unknown'}</div>
                          <div className="text-sm text-muted-foreground">{conversation.email}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{researchData?.companyName}</div>
                        <div className="text-sm text-muted-foreground">{researchData?.industry}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={conversation.leadScore && conversation.leadScore > 70 ? "default" : "secondary"}>
                        {conversation.leadScore || 0}/100
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {conversation.pdfUrl ? (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => window.open(conversation.pdfUrl!, '_blank')}
                          className="text-green-600 hover:text-green-700"
                        >
                          <Download className="w-4 h-4 mr-1" />
                          PDF
                        </Button>
                      ) : (
                        <Badge variant="outline">Pending</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getEmailStatusIcon(conversation.emailStatus)}
                        {getEmailStatusBadge(conversation.emailStatus)}
                        {conversation.emailRetries && conversation.emailRetries > 0 && (
                          <span className="text-xs text-muted-foreground">
                            ({conversation.emailRetries} retries)
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {conversation.createdAt ? (
                        <span className="text-sm text-muted-foreground">
                          {formatDistanceToNow(new Date(conversation.createdAt), { addSuffix: true })}
                        </span>
                      ) : (
                        'Unknown'
                      )}
                    </TableCell>
                    <TableCell>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedConversation(conversation)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle>Conversation Details</DialogTitle>
                          </DialogHeader>
                          {selectedConversation && (
                            <ConversationDetails conversation={selectedConversation} />
                          )}
                        </DialogContent>
                      </Dialog>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

function ConversationDetails({ conversation }: { conversation: Conversation }) {
  const researchData = formatResearchData(conversation.researchJson)

  return (
    <div className="space-y-6">
      {/* Lead Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="w-5 h-5" />
            Lead Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Name</label>
              <p>{conversation.name || 'Unknown'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Email</label>
              <p>{conversation.email}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Lead Score</label>
              <p>{conversation.leadScore}/100</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Created</label>
              <p>{conversation.createdAt ? formatDistanceToNow(new Date(conversation.createdAt), { addSuffix: true }) : 'Unknown'}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Company Research */}
      {researchData && (
        <Card>
          <CardHeader>
            <CardTitle>Company Research</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Company</label>
                <p>{researchData.companyName}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Industry</label>
                <p>{researchData.industry}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Role</label>
                <p>{researchData.role}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Confidence</label>
                <p>{Math.round(researchData.confidence * 100)}%</p>
              </div>
            </div>
            {researchData.keywords.length > 0 && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">Keywords</label>
                <div className="flex flex-wrap gap-1 mt-1">
                  {researchData.keywords.slice(0, 10).map((keyword: string, index: number) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {keyword}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Conversation Summary */}
      {conversation.summary && (
        <Card>
          <CardHeader>
            <CardTitle>Conversation Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm leading-relaxed">{conversation.summary}</p>
          </CardContent>
        </Card>
      )}

      {/* Status Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Send className="w-5 h-5" />
            Delivery Status
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">PDF Status</label>
              <p>{conversation.pdfUrl ? 'Generated' : 'Pending'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Email Status</label>
              <p>{conversation.emailStatus || 'Pending'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Retries</label>
              <p>{conversation.emailRetries || 0}</p>
            </div>
          </div>
          {conversation.pdfUrl && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open(conversation.pdfUrl!, '_blank')}
              className="w-full"
            >
              <Download className="w-4 h-4 mr-2" />
              Download PDF
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function formatResearchData(researchJson: any) {
  if (!researchJson) return null

  const company = researchJson.company || {}
  const person = researchJson.person || {}
  const intelligence = researchJson.intelligence || {}

  return {
    companyName: company.name || 'Unknown',
    industry: company.industry || 'Unknown',
    role: person.role || 'Unknown',
    keywords: intelligence.keywords || [],
    confidence: intelligence.confidence || 0
  }
}
