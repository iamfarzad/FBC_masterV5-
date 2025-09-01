'use client'

import { Calendar, Mail } from "lucide-react"

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-16">
        <div className="mx-auto max-w-4xl">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">Book Your Free AI Consultation Call</h1>
            <p className="text-xl text-muted-foreground">
              Let's discuss how AI automation can reduce costs, streamline your workflows, or help your team get started with real AI implementation tools.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="rounded-lg border bg-card p-8 text-center">
              <div className="mb-4 rounded-full bg-primary/10 p-4 mx-auto w-fit">
                <Calendar className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-2">Schedule Your AI Consultation</h3>
              <p className="text-muted-foreground mb-6">Book a free 30-minute call. Pick a time from my live availability.</p>
              <div className="rounded-xl border bg-background/60 p-6">
                <p className="text-muted-foreground mb-4">AI consultation scheduling coming soon.</p>
                <button disabled className="w-full px-4 py-2 bg-muted text-muted-foreground rounded-md cursor-not-allowed">
                  Scheduler Coming Soon
                </button>
              </div>
            </div>

            <div className="rounded-lg border bg-card p-8 text-center">
              <div className="mb-4 rounded-full bg-primary/10 p-4 mx-auto w-fit">
                <Mail className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-2">Email AI Consultant Directly</h3>
              <p className="text-muted-foreground mb-6">Have an AI automation project or question? Email me directly for personalized AI consulting advice.</p>
              <a href="/contact-form" className="w-full inline-flex items-center justify-center px-4 py-2 border border-border bg-background hover:bg-accent hover:text-accent-foreground rounded-md transition-colors">
                Send Message
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
