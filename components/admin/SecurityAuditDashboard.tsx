"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Shield, ShieldAlert, ShieldCheck, RefreshCw, Eye, EyeOff } from "lucide-react"

interface SecurityCheck {
  check: string
  status: string
  description: string
}

interface SecurityAudit {
  timestamp: string
  security_checks: SecurityCheck[]
  rls_policies: any[]
  table_permissions: any[]
  rls_status: any[]
  sample_data_count: number
  overall_security: string
}

interface PublicAccessTest {
  test: string
  status: string
  error: string | null
  data_accessible: number
}

interface AccessTestResult {
  timestamp: string
  public_access_tests: PublicAccessTest[]
  summary: {
    public_blocked: string
    message: string
  }
}

export function SecurityAuditDashboard() {
  const [auditResult, setAuditResult] = useState<SecurityAudit | null>(null)
  const [accessTestResult, setAccessTestResult] = useState<AccessTestResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("audit")

  const runSecurityAudit = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/admin/security-audit')
      if (response.ok) {
        const data = await response.json()
        setAuditResult(data)
      }
    } catch (error) {
      console.error('Security audit failed:', error)
    } finally {
      setLoading(false)
    }
  }

  const testPublicAccess = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/admin/security-audit', {
        method: 'POST'
      })
      if (response.ok) {
        const data = await response.json()
        setAccessTestResult(data)
      }
    } catch (error) {
      console.error('Public access test failed:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    runSecurityAudit()
  }, [])

  const getStatusIcon = (status: string) => {
    if (status.includes('✅')) return <ShieldCheck className="w-4 h-4 text-success" />
    if (status.includes('❌')) return <ShieldAlert className="w-4 h-4 text-error" />
    return <Shield className="w-4 h-4 text-warning" />
  }

  const getStatusColor = (status: string) => {
    if (status.includes('✅')) return 'bg-success/10 text-success border-success/20'
    if (status.includes('❌')) return 'bg-error/10 text-error border-error/20'
    return 'bg-warning/10 text-warning border-warning/20'
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-6 h-6" />
                Security Audit Dashboard
              </CardTitle>
              <CardDescription>
                Monitor security status of sensitive data (conversations, failed emails, research data)
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button
                onClick={runSecurityAudit}
                variant="outline"
                size="sm"
                disabled={loading}
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh Audit
              </Button>
              <Button
                onClick={testPublicAccess}
                variant="outline"
                size="sm"
                disabled={loading}
              >
                <EyeOff className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Test Public Access
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="audit">Security Audit</TabsTrigger>
          <TabsTrigger value="access">Public Access Test</TabsTrigger>
          <TabsTrigger value="policies">RLS Policies</TabsTrigger>
        </TabsList>

        <TabsContent value="audit" className="space-y-4">
          {auditResult && (
            <>
              <Alert>
                <Shield className="h-4 w-4" />
                <AlertDescription>
                  <strong>Overall Security Status:</strong> {auditResult.overall_security}
                  {auditResult.overall_security.includes('SECURE') ? (
                    <span className="text-green-600 ml-2">✅ All security checks passed</span>
                  ) : (
                    <span className="text-red-600 ml-2">❌ Security issues detected</span>
                  )}
                </AlertDescription>
              </Alert>

              <Card>
                <CardHeader>
                  <CardTitle>Security Checks</CardTitle>
                  <CardDescription>Verification of security policies and configurations</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Check</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Description</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {auditResult.security_checks.map((check, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">{check.check}</TableCell>
                          <TableCell>
                            <Badge className={getStatusColor(check.status)}>
                              {getStatusIcon(check.status)}
                              <span className="ml-1">{check.status}</span>
                            </Badge>
                          </TableCell>
                          <TableCell className="text-muted-foreground">{check.description}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>RLS Status</CardTitle>
                  <CardDescription>Row Level Security enabled status</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Table</TableHead>
                        <TableHead>RLS Enabled</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {auditResult.rls_status.map((table, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">{table.tablename}</TableCell>
                          <TableCell>
                            <Badge variant={table.rowsecurity ? "default" : "destructive"}>
                              {table.rowsecurity ? "Enabled" : "Disabled"}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        <TabsContent value="access" className="space-y-4">
          {accessTestResult && (
            <>
              <Alert>
                <Shield className="h-4 w-4" />
                <AlertDescription>
                  <strong>Public Access Test Results:</strong> {accessTestResult.summary.public_blocked}
                </AlertDescription>
              </Alert>

              <Card>
                <CardHeader>
                  <CardTitle>Public Access Tests</CardTitle>
                  <CardDescription>Verification that public users cannot access sensitive data</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Test</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Error</TableHead>
                        <TableHead>Data Accessible</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {accessTestResult.public_access_tests.map((test, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">{test.test}</TableCell>
                          <TableCell>
                            <Badge className={getStatusColor(test.status)}>
                              {getStatusIcon(test.status)}
                              <span className="ml-1">{test.status}</span>
                            </Badge>
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {test.error || 'None'}
                          </TableCell>
                          <TableCell>
                            <Badge variant={test.data_accessible > 0 ? "destructive" : "default"}>
                              {test.data_accessible} rows
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        <TabsContent value="policies" className="space-y-4">
          {auditResult && (
            <Card>
              <CardHeader>
                <CardTitle>RLS Policies</CardTitle>
                <CardDescription>Active Row Level Security policies on sensitive tables</CardDescription>
              </CardHeader>
              <CardContent>
                {auditResult.rls_policies.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Table</TableHead>
                        <TableHead>Policy</TableHead>
                        <TableHead>Command</TableHead>
                        <TableHead>Roles</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {auditResult.rls_policies.map((policy, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">{policy.table_name}</TableCell>
                          <TableCell>{policy.policy_name}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{policy.command}</Badge>
                          </TableCell>
                          <TableCell>
                            {policy.roles?.length > 0 ? policy.roles.join(', ') : 'All'}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    No RLS policies found. Run the database migration to set up security policies.
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
