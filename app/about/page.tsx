'use client'

import { PageHeader, PageShell } from "@/components/page-shell"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Award, BookOpen, Heart, MessageSquare, Target } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { MotionCard } from "@/components/ui/motion-card"
import { FadeIn } from "@/components/ui/fade-in"
import { ProgressTracker } from "@/components/experience/progress-tracker"
import { CitationsDemo } from "@/components/experience/citations-demo"

const coreValues = [
  { icon: Target, text: "Deliver real business value through AI automation, not hype" },
  { icon: BookOpen, text: "Commit to continuous AI learning and innovation" },
  { icon: Heart, text: "Uphold ethical and responsible AI consulting practices" },
  { icon: MessageSquare, text: "Communicate transparently about AI implementation, always" },
]

const skills = [
  { name: "AI Research & Implementation", value: 90 },
  { name: "System Design & Architecture", value: 85 },
  { name: "Problem Solving & Analysis", value: 95 },
  { name: "Team Collaboration & Training", value: 90 },
]

const timeline = [
  { year: 2020, milestone: "Began self-learning AI & automation, built Optix.io AI platform" },
  { year: 2021, milestone: "Launched iWriter.ai for Norwegian SMEs - AI automation success" },
  { year: 2022, milestone: "Developed 'Talk to Eve' AI for workplace mental wellness" },
  { year: 2023, milestone: "Built ZingZang Lab (AI music app), expanded AI consulting services" },
  { year: 2024, milestone: "Ran hands-on AI workshops, launched F.B AI Consulting" },
]

export default function AboutPage() {
  return (
    <>
      <PageShell>
        <PageHeader
          title="Self-Taught AI Consultant. Results-Focused. AI That Actually Works."
          subtitle="I'm Farzad Bayat—AI consultant, builder, and systems thinker. I don't just talk about AI. I build, test, and deliver proven automation solutions."
        />
      </PageShell>

      <PageShell>
        <div className="mb-6 flex justify-center">
          <ProgressTracker />
        </div>
        <div className="grid items-start gap-10 md:grid-cols-3">
          <div className="md:col-span-2">
            <h2 className="text-2xl font-bold tracking-tight text-primary sm:text-3xl">My AI Automation Journey</h2>
            <p className="mt-4 text-muted-foreground">
              After 17 years creating and producing TV shows, documentaries, and commercials for major networks across
              the globe, I found myself at a crossroads. I wanted to build something lasting—<strong>AI tools that actually help
              people</strong> and deliver measurable business results.
            </p>
            <p className="mt-4 text-muted-foreground">
              In 2020, I launched my first startup, Optix.io, and dove headfirst into the world of <strong>artificial intelligence and automation</strong>. It
              was a hard reset: I had no formal tech background. I broke things, rebuilt them, and learned by
              doing—starting with GPT-2. Since then, I&apos;ve discovered what really works in <strong>AI implementation</strong>. My philosophy: you have to build
              and break things yourself to truly understand them.
            </p>
          </div>
          <div className="flex justify-center">
            <div className="relative">
              <div className="absolute inset-0 -z-10">
                <div className="bg-gradient-conic absolute left-1/2 top-1/2 size-56 -translate-x-1/2 -translate-y-1/2 animate-[spin_18s_linear_infinite] 
                                rounded-full from-brand to-transparent 
                                opacity-25 blur-xl" />
                <div className="border-accent/20 absolute left-1/2 top-1/2 size-60 -translate-x-1/2 -translate-y-1/2 rounded-full border" />
              </div>
              <Avatar className="size-48 border-4 border-border shadow-lg">
                <AvatarImage src="/placeholder-user.jpg" alt="Farzad Bayat - AI Automation Consultant with 10,000+ hours experience in artificial intelligence and business automation" />
                <AvatarFallback>FB</AvatarFallback>
              </Avatar>
            </div>
          </div>
        </div>
      </PageShell>

      <PageShell className="bg-secondary">
        <h2 className="text-center text-2xl font-bold tracking-tight text-primary sm:text-3xl">Core Values in AI Consulting</h2>
        <div className="mt-8 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {coreValues.map((value, i) => (
            <FadeIn key={value.text} delay={i * 0.06}>
              <MotionCard className="neu-card flex flex-col items-center justify-center p-8 text-center transition-all">
                <CardContent className="p-6 text-center">
                  <value.icon className="mx-auto size-10 text-accent transition-transform group-hover:scale-110" aria-hidden="true" />
                  <h3 className="mt-4 text-base font-medium">{value.text}</h3>
                </CardContent>
              </MotionCard>
            </FadeIn>
          ))}
        </div>
      </PageShell>

      <PageShell>
        <div className="grid items-center gap-10 md:grid-cols-2">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-primary sm:text-3xl">My AI Expertise & Strengths</h2>
            <div className="mt-6 space-y-4">
              {skills.map((skill) => (
                <div key={skill.name}>
                  <div className="mb-1 flex justify-between">
                    <span className="text-base font-medium text-primary">{skill.name}</span>
                    <span className="text-sm font-medium text-accent">{skill.value}%</span>
                  </div>
                  <Progress value={skill.value} className="[&>div]:bg-accent" />
                </div>
              ))}
            </div>
          </div>
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-primary sm:text-3xl">Timeline & AI Milestones</h2>
            <div className="mt-6 flow-root">
              <ul className="-mb-8">
                {timeline.map((event, eventIdx) => (
                  <li key={event.year}>
                    <div className="relative pb-8">
                      {eventIdx !== timeline.length - 1 ? (
                        <span className="absolute left-4 top-4 -ml-px h-full w-0.5 overflow-hidden bg-border" aria-hidden="true">
                          <span className="block size-full animate-[grow_1.2s_ease-out_forwards] bg-accent" />
                        </span>
                      ) : null}
                      <div className="relative flex space-x-3">
                        <div>
                          <span className="bg-accent/20 flex size-8 items-center justify-center rounded-full text-accent ring-8 ring-background">
                            <Award className="size-5" aria-hidden="true" />
                          </span>
                        </div>
                        <div className="flex min-w-0 flex-1 justify-between space-x-4 pt-1.5">
                          <div>
                            <h3 className="text-sm font-semibold text-muted-foreground">{event.year}</h3>
                            <p className="font-medium text-primary">{event.milestone}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </PageShell>

      <PageShell>
        <CitationsDemo />
      </PageShell>

      <PageShell className="bg-secondary">
        <div className="text-center">
          <h2 className="text-2xl font-bold tracking-tight text-primary sm:text-3xl">Let&apos;s Connect & Discuss Your AI Needs</h2>
          <p className="mx-auto mt-4 max-w-xl text-lg text-muted-foreground">
            Ready for a direct path to working <strong>AI automation solutions</strong> in your business? Let&apos;s discuss your specific <strong>AI implementation needs</strong>.
          </p>
          <div className="mt-8 flex items-center justify-center gap-x-6">
            <Button asChild size="lg">
              <Link href="/contact" title="Book free AI consultation call with expert consultant Farzad Bayat">Book a Free AI Consultation Call</Link>
            </Button>
          </div>
        </div>
      </PageShell>
    </>
  )
}
