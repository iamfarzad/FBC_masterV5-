'use client'

import dynamic from 'next/dynamic'
import { MotionCard } from "@/components/ui/motion-card"
import { FadeIn } from "@/components/ui/fade-in"
import { ProgressTracker, CitationsDemo, Avatar, AvatarImage, AvatarFallback } from "@/components/ui/client-about-wrapper"
import { Target, BookOpen, Heart, MessageSquare, Award } from "lucide-react"

const Progress = dynamic(() => import('@/components/ui/progress').then(mod => ({ default: mod.Progress })), {
  ssr: false,
  loading: () => <div className="h-2 bg-muted/30 rounded animate-pulse" />
})

export function AboutPageContent() {
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

  return (
    <div>
      <div className="mb-6 flex justify-center">
        <ProgressTracker />
      </div>
      <div className="grid md:grid-cols-3 gap-10 items-start">
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
            doing—starting with GPT-2. Since then, I've discovered what really works in <strong>AI implementation</strong>. My philosophy: you have to build
            and break things yourself to truly understand them.
          </p>
        </div>
        <div className="flex justify-center">
          <div className="relative">
            <div className="absolute inset-0 -z-10">
              <div className="absolute left-1/2 top-1/2 h-56 w-56 -translate-x-1/2 -translate-y-1/2 rounded-full
                              bg-gradient-conic from-brand to-transparent
                              opacity-25 blur-xl animate-[spin_18s_linear_infinite]" />
              <div className="absolute left-1/2 top-1/2 h-60 w-60 -translate-x-1/2 -translate-y-1/2 rounded-full border border-accent/20" />
            </div>
            <Avatar className="w-48 h-48 border-4 border-border shadow-lg">
              <AvatarImage src="/placeholder.svg?width=200&height=200" alt="Farzad Bayat - AI Automation Consultant with 10,000+ hours experience in artificial intelligence and business automation" />
              <AvatarFallback>FB</AvatarFallback>
            </Avatar>
          </div>
        </div>
      </div>

      <div className="bg-secondary">
        <h2 className="text-center text-2xl font-bold tracking-tight text-primary sm:text-3xl">Core Values in AI Consulting</h2>
        <div className="mt-8 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {coreValues.map((value, i) => (
            <FadeIn key={value.text} delay={i * 0.06}>
              <MotionCard className="neu-card transition-all flex flex-col items-center justify-center p-8 text-center">
                <div className="p-6 text-center">
                  <value.icon className="mx-auto h-10 w-10 text-accent transition-transform group-hover:scale-110" aria-hidden="true" />
                  <h3 className="mt-4 font-medium text-base">{value.text}</h3>
                </div>
              </MotionCard>
            </FadeIn>
          ))}
        </div>
      </div>

      <div>
        <div className="grid md:grid-cols-2 gap-10 items-center">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-primary sm:text-3xl">My AI Expertise & Strengths</h2>
            <div className="mt-6 space-y-4">
              {skills.map((skill) => (
                <div key={skill.name}>
                  <div className="flex justify-between mb-1">
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
                        <span className="absolute left-4 top-4 -ml-px h-full w-0.5 bg-border overflow-hidden" aria-hidden="true">
                          <span className="block h-full w-full bg-accent animate-[grow_1.2s_ease-out_forwards]" />
                        </span>
                      ) : null}
                      <div className="relative flex space-x-3">
                        <div>
                          <span className="h-8 w-8 rounded-full bg-accent/20 text-accent flex items-center justify-center ring-8 ring-background">
                            <Award className="h-5 w-5" aria-hidden="true" />
                          </span>
                        </div>
                        <div className="flex min-w-0 flex-1 justify-between space-x-4 pt-1.5">
                          <div>
                            <h3 className="text-sm text-muted-foreground font-semibold">{event.year}</h3>
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
      </div>

      <CitationsDemo />
    </div>
  )
}
