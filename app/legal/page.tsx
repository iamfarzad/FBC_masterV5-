"use client"

import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, FileText, Shield, Cookie } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

export default function LegalPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-border/20 bg-background/95 sticky top-0 z-40 border-b backdrop-blur-sm">
        <div className="mx-auto max-w-4xl p-4">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={() => router.back()}
              className="hover:bg-accent/10 flex items-center gap-2"
            >
              <ArrowLeft className="size-4" />
              Back
            </Button>
            <h1 className="text-xl font-bold text-foreground">F.B/c Legal</h1>
            <div className="w-20" /> {/* Spacer for centering */}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-4xl space-y-8 px-4 py-8">
        {/* Introduction */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="size-5 text-accent" />
              Legal Information
            </CardTitle>
            <CardDescription>
              Last updated: {new Date().toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              This page contains our Privacy Policy, Terms of Service, and Cookie Policy.
              By using our services, you agree to these terms.
            </p>
          </CardContent>
        </Card>

        {/* Table of Contents */}
        <Card>
          <CardHeader>
            <CardTitle>Table of Contents</CardTitle>
          </CardHeader>
          <CardContent>
            <nav className="space-y-2">
              <a href="#privacy" className="hover:text-accent/80 block text-accent transition-colors">
                1. Privacy Policy
              </a>
              <a href="#terms" className="hover:text-accent/80 ml-4 block text-accent transition-colors">
                2. Terms of Service
              </a>
              <a href="#cookies" className="hover:text-accent/80 ml-4 block text-accent transition-colors">
                3. Cookie Policy
              </a>
            </nav>
          </CardContent>
        </Card>

        {/* Privacy Policy */}
        <Card id="privacy">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="size-5" />
              1. Privacy Policy
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="mb-3 text-lg font-semibold">Information We Collect</h3>
              <div className="space-y-3 text-muted-foreground">
                <p>
                  <strong>Personal Information:</strong> When you provide consent, we collect your name,
                  work email address, and company website to personalize your AI consultation experience.
                </p>
                <p>
                  <strong>Usage Data:</strong> We collect information about how you interact with our AI
                  chat system, including conversation history, tool usage, and session duration.
                </p>
                <p>
                  <strong>Technical Data:</strong> We automatically collect technical information such as
                  your IP address, browser type, device information, and usage patterns.
                </p>
              </div>
            </div>

            <Separator />

            <div>
              <h3 className="mb-3 text-lg font-semibold">How We Use Your Information</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li>• <strong>Personalization:</strong> To provide personalized AI responses and recommendations</li>
                <li>• <strong>Service Delivery:</strong> To operate and maintain our AI consultation platform</li>
                <li>• <strong>Communication:</strong> To respond to your inquiries and provide support</li>
                <li>• <strong>Improvement:</strong> To analyze usage patterns and improve our services</li>
                <li>• <strong>Legal Compliance:</strong> To comply with applicable laws and regulations</li>
              </ul>
            </div>

            <Separator />

            <div>
              <h3 className="mb-3 text-lg font-semibold">Information Sharing</h3>
              <p className="text-muted-foreground">
                We do not sell, trade, or otherwise transfer your personal information to third parties
                without your consent, except as described in this policy or required by law.
              </p>
            </div>

            <Separator />

            <div>
              <h3 className="mb-3 text-lg font-semibold">Data Security</h3>
              <p className="text-muted-foreground">
                We implement appropriate technical and organizational measures to protect your personal
                information against unauthorized access, alteration, disclosure, or destruction.
              </p>
            </div>

            <Separator />

            <div>
              <h3 className="mb-3 text-lg font-semibold">Your Rights</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li>• <strong>Access:</strong> You can request access to your personal information</li>
                <li>• <strong>Correction:</strong> You can request correction of inaccurate information</li>
                <li>• <strong>Deletion:</strong> You can request deletion of your personal information</li>
                <li>• <strong>Portability:</strong> You can request a copy of your data in a portable format</li>
                <li>• <strong>Withdraw Consent:</strong> You can withdraw consent at any time</li>
              </ul>
            </div>

            <Separator />

            <div>
              <h3 className="mb-3 text-lg font-semibold">Contact Us</h3>
              <p className="text-muted-foreground">
                If you have questions about this Privacy Policy, please contact us at:
                <br />
                <strong>Email:</strong> privacy@farzadbayat.com
                <br />
                <strong>Address:</strong> F.B Consulting, Business Address
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Terms of Service */}
        <Card id="terms">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="size-5" />
              2. Terms of Service
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="mb-3 text-lg font-semibold">Acceptance of Terms</h3>
              <p className="text-muted-foreground">
                By accessing and using F.B/c AI consultation services, you accept and agree to be bound
                by the terms and provision of this agreement.
              </p>
            </div>

            <Separator />

            <div>
              <h3 className="mb-3 text-lg font-semibold">Service Description</h3>
              <p className="text-muted-foreground">
                F.B/c provides AI-powered business consultation services through our web platform.
                Our services include personalized AI chat interactions, business analysis tools,
                and consultation support.
              </p>
            </div>

            <Separator />

            <div>
              <h3 className="mb-3 text-lg font-semibold">User Responsibilities</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li>• Provide accurate and truthful information when using our services</li>
                <li>• Use the services in accordance with applicable laws and regulations</li>
                <li>• Respect intellectual property rights</li>
                <li>• Not attempt to circumvent security measures</li>
                <li>• Not use the service for illegal or harmful purposes</li>
              </ul>
            </div>

            <Separator />

            <div>
              <h3 className="mb-3 text-lg font-semibold">Intellectual Property</h3>
              <p className="text-muted-foreground">
                All content, features, and functionality of our services are owned by F.B Consulting
                and are protected by copyright, trademark, and other intellectual property laws.
              </p>
            </div>

            <Separator />

            <div>
              <h3 className="mb-3 text-lg font-semibold">Limitation of Liability</h3>
              <p className="text-muted-foreground">
                F.B/c services are provided "as is" without warranties of any kind. We shall not be
                liable for any indirect, incidental, special, or consequential damages arising out
                of your use of our services.
              </p>
            </div>

            <Separator />

            <div>
              <h3 className="mb-3 text-lg font-semibold">Termination</h3>
              <p className="text-muted-foreground">
                We reserve the right to terminate or suspend your access to our services at our
                sole discretion, without prior notice, for conduct that we believe violates these
                terms or is harmful to other users, us, or third parties.
              </p>
            </div>

            <Separator />

            <div>
              <h3 className="mb-3 text-lg font-semibold">Governing Law</h3>
              <p className="text-muted-foreground">
                These terms shall be governed by and construed in accordance with the laws of
                the jurisdiction in which F.B Consulting operates, without regard to its conflict
                of law provisions.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Cookie Policy */}
        <Card id="cookies">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Cookie className="size-5" />
              3. Cookie Policy
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="mb-3 text-lg font-semibold">What Are Cookies</h3>
              <p className="text-muted-foreground">
                Cookies are small text files that are stored on your device when you visit our website.
                They help us provide you with a better browsing experience and allow certain features
                to function properly.
              </p>
            </div>

            <Separator />

            <div>
              <h3 className="mb-3 text-lg font-semibold">Cookies We Use</h3>
              <div className="space-y-4">
                <div>
                  <h4 className="mb-2 font-medium">Essential Cookies</h4>
                  <p className="text-sm text-muted-foreground">
                    Required for the website to function properly. These include:
                  </p>
                  <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                    <li>• Session management cookies</li>
                    <li>• Security and authentication cookies</li>
                    <li>• Consent preference cookies</li>
                  </ul>
                </div>

                <div>
                  <h4 className="mb-2 font-medium">Functional Cookies</h4>
                  <p className="text-sm text-muted-foreground">
                    Enhance your experience on our site:
                  </p>
                  <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                    <li>• Language and localization preferences</li>
                    <li>• Theme and display settings</li>
                    <li>• Chat session preferences</li>
                  </ul>
                </div>

                <div>
                  <h4 className="mb-2 font-medium">Analytics Cookies</h4>
                  <p className="text-sm text-muted-foreground">
                    Help us understand how you use our services:
                  </p>
                  <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                    <li>• Usage patterns and feature adoption</li>
                    <li>• Performance and error monitoring</li>
                    <li>• Service improvement insights</li>
                  </ul>
                </div>
              </div>
            </div>

            <Separator />

            <div>
              <h3 className="mb-3 text-lg font-semibold">Third-Party Cookies</h3>
              <p className="text-muted-foreground">
                We may use third-party services that place their own cookies. These include:
              </p>
              <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                <li>• AI service providers for chat functionality</li>
                <li>• Analytics services for usage insights</li>
                <li>• Cloud infrastructure providers</li>
              </ul>
            </div>

            <Separator />

            <div>
              <h3 className="mb-3 text-lg font-semibold">Managing Cookies</h3>
              <div className="space-y-3 text-muted-foreground">
                <p>
                  <strong>Browser Settings:</strong> You can control and delete cookies through your
                  browser settings. Most browsers allow you to block or delete cookies.
                </p>
                <p>
                  <strong>Opt-out:</strong> You can withdraw consent for non-essential cookies at any time
                  by updating your preferences or contacting us.
                </p>
                <p>
                  <strong>Impact:</strong> Please note that disabling certain cookies may affect the
                  functionality of our services.
                </p>
              </div>
            </div>

            <Separator />

            <div>
              <h3 className="mb-3 text-lg font-semibold">Updates to This Policy</h3>
              <p className="text-muted-foreground">
                We may update this Cookie Policy from time to time. We will notify you of any material
                changes by posting the new policy on this page and updating the "Last updated" date.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle>Questions or Concerns?</CardTitle>
            <CardDescription>
              If you have any questions about these terms or our practices, please contact us:
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-muted-foreground">
              <p><strong>Email:</strong> legal@farzadbayat.com</p>
              <p><strong>Business Address:</strong> F.B Consulting</p>
              <p><strong>Response Time:</strong> We aim to respond within 30 days</p>
            </div>
          </CardContent>
        </Card>

        {/* Back to Top */}
        <div className="text-center">
          <Button
            variant="outline"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="mt-8"
          >
            Back to Top
          </Button>
        </div>
      </div>
    </div>
  )
}
