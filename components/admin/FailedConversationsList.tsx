"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Eye, Building, Mail, FileText, AlertCircle, Clock, XCircle, RefreshCw } from "lucide-react"
import { formatDistanceToNow } from "date-fns"

interface FailedConversation {
  failed_id: string | null
  failed_at: string | null
  retries: number | null
  failure_reason: string | null
  conversation_id: string | null
  name: string | null
  email: string | null
  summary: string | null
  lead_score: number | null
  research_json: any
  pdf_url: string | null
  email_status: string | null
  conversation_created_at: string | null
}

interface FailedConversationsListProps {}

export function FailedConversationsList() {
  const [failedConversations, setFailedConversations] = useState<FailedConversation[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedConversation, setSelectedConversation] = useState<FailedConversation | null>(null)
  const [minScoreFilter, setMinScoreFilter] = useState<number | null>(null)

  useEffect(() => {
    fetchFailedConversations()
  }, [minScoreFilter])

  const fetchFailedConversations = async () => {
    try {
      const params = new URLSearchParams()
      if (minScoreFilter !== null) {
        params.set('minScore', minScoreFilter.toString())
      }

      const response = await fetch(`/api/admin/failed-conversations?${params}`)
      if (response.ok) {
        const data = await response.json()
        setFailedConversations(data)
      }
    } catch (error) {
      console.error('Failed to fetch failed conversations:', error)
    } finally {
      setLoading(false)
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

  const getFailureReasonDisplay = (reason: string | null) => {
    if (!reason) return 'Unknown error'

    // Truncate long error messages
    if (reason.length > 50) {
      return reason.substring(0, 50) + '...'
    }

    return reason
  }

  const getRetryStatus = (retries: number | null) => {
    if (!retries) return { label: 'No retries', variant: 'secondary' as const }

    if (retries >= 3) {
      return { label: 'Max retries reached', variant: 'destructive' as const }
    }

    return { label: `${retries} retries`, variant: 'outline' as const }
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
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-red-500" />
                Failed Conversations
              </CardTitle>
              <CardDescription>
                View failed email deliveries with complete lead context and failure details
              </CardDescription>
            </div>
            <div className="flex items-center gap-4">
              <Select
                value={minScoreFilter?.toString() || 'all'}
                onValueChange={(value) => setMinScoreFilter(value === 'all' ? null : parseInt(value))}
              >
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Filter by score" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All scores</SelectItem>
                  <SelectItem value="70">70+ (High)</SelectItem>
                  <SelectItem value="50">50+ (Medium)</SelectItem>
                  <SelectItem value="30">30+ (Low)</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={fetchFailedConversations} variant="outline" size="sm">
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Lead</TableHead>
                <TableHead>Company</TableHead>
                <TableHead>Score</TableHead>
                <TableHead>Failed At</TableHead>
                <TableHead>Failure Reason</TableHead>
                <TableHead>Retries</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {failedConversations.map((failedConv) => {
                const researchData = formatResearchData(failedConv.research_json)
                const retryStatus = getRetryStatus(failedConv.retries)

                return (
                  <TableRow key={failedConv.failed_id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback>
                            {(failedConv.name || failedConv.email || 'U')[0].toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{failedConv.name || 'Unknown'}</div>
                          <div className="text-sm text-muted-foreground">{failedConv.email}</div>
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
                      <Badge variant={failedConv.lead_score && failedConv.lead_score > 70 ? "default" : "secondary"}>
                        {failedConv.lead_score || 0}/100
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {failedConv.failed_at ? (
                        <span className="text-sm text-muted-foreground">
                          {formatDistanceToNow(new Date(failedConv.failed_at), { addSuffix: true })}
                        </span>
                      ) : (
                        'Unknown'
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="max-w-48">
                        <div className="text-sm font-medium text-red-600 truncate">
                          {getFailureReasonDisplay(failedConv.failure_reason)}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={retryStatus.variant}>
                        {retryStatus.label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedConversation(failedConv)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle>Failed Conversation Details</DialogTitle>
                          </DialogHeader>
                          {selectedConversation && (
                            <FailedConversationDetails conversation={selectedConversation} />
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

function FailedConversationDetails({ conversation }: { conversation: FailedConversation }) {
  const researchData = formatResearchData(conversation.research_json)

  return (
    <div className="space-y-6">
      {/* Failure Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <XCircle className="w-5 h-5 text-red-500" />
            Failure Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Failed At</label>
              <p>{conversation.failed_at ? formatDistanceToNow(new Date(conversation.failed_at), { addSuffix: true }) : 'Unknown'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Retries</label>
              <p>{conversation.retries || 0}</p>
            </div>
            <div className="col-span-2">
              <label className="text-sm font-medium text-muted-foreground">Failure Reason</label>
              <p className="text-red-600">{conversation.failure_reason || 'Unknown error'}</p>
            </div>
          </div>
        </CardContent>
      </Card>

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
              <p>{conversation.lead_score}/100</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Created</label>
              <p>{conversation.conversation_created_at ? formatDistanceToNow(new Date(conversation.conversation_created_at), { addSuffix: true }) : 'Unknown'}</p>
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

      {/* Delivery Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="w-5 h-5" />
            Delivery Status
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">PDF Status</label>
              <p>{conversation.pdf_url ? 'Generated' : 'Pending'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Email Status</label>
              <p>{conversation.email_status || 'Pending'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Final Status</label>
              <p className="text-red-600">Failed</p>
            </div>
          </div>
          {conversation.pdf_url && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open(conversation.pdf_url!, '_blank')}
              className="w-full"
            >
              <FileText className="w-4 h-4 mr-2" />
              View PDF
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
