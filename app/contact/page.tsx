'use client'

import { Calendar, Mail } from "lucide-react"

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-16">
        <div className="mx-auto max-w-4xl">
          <div className="mb-12 text-center">
            <h1 className="mb-4 text-4xl font-bold">Book Your Free AI Consultation Call</h1>
            <p className="text-xl text-muted-foreground">
              Let's discuss how AI automation can reduce costs, streamline your workflows, or help your team get started with real AI implementation tools.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            <div className="rounded-lg border bg-card p-8 text-center">
              <div className="bg-primary/10 mx-auto mb-4 w-fit rounded-full p-4">
                <Calendar className="size-8 text-primary" />
              </div>
              <h3 className="mb-2 text-xl font-bold">Schedule Your AI Consultation</h3>
              <p className="mb-6 text-muted-foreground">Book a free 30-minute call. Pick a time from my live availability.</p>
              <div className="bg-background/60 rounded-xl border p-6">
                <p className="mb-4 text-muted-foreground">AI consultation scheduling coming soon.</p>
                <button disabled className="w-full cursor-not-allowed rounded-md bg-muted px-4 py-2 text-muted-foreground">
                  Scheduler Coming Soon
                </button>
              </div>
            </div>

            <div className="rounded-lg border bg-card p-8 text-center">
              <div className="bg-primary/10 mx-auto mb-4 w-fit rounded-full p-4">
                <Mail className="size-8 text-primary" />
              </div>
              <h3 className="mb-2 text-xl font-bold">Email AI Consultant Directly</h3>
              <p className="mb-6 text-muted-foreground">Have an AI automation project or question? Email me directly for personalized AI consulting advice.</p>
              <a href="/contact-form" className="inline-flex w-full items-center justify-center rounded-md border border-border bg-background px-4 py-2 transition-colors hover:bg-accent hover:text-accent-foreground">
                Send Message
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
