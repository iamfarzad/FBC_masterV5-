'use client'

import { PageHeader, PageShell } from "@/components/page-shell"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BookCallButton } from '@/components/meeting/BookCallButton'
import Link from "next/link"
import { ArrowRight, Lightbulb, Star, Users , Brain, Zap, Sparkles, Target } from "lucide-react"
import { FbcIcon , FbcIcon as FbcIconPolished } from "@/components/ui/fbc-icon"
import type { Metadata } from "next"
import { MotionCard } from "@/components/ui/motion-card"
import { FadeIn } from "@/components/ui/fade-in"
import { ProgressTracker } from "@/components/experience/progress-tracker"
import { CitationsDemo } from "@/components/experience/citations-demo"
// import { DotScreenShader } from "@/components/ui/dot-shader-background" // Removed

const features = [
  {
    icon: Brain,
    title: "AI Strategy & Implementation",
    description: "Custom AI solutions designed for your specific business needs and workflows."
  },
  {
    icon: FbcIcon,
    title: "Intelligent Chatbots",
    description: "Advanced conversational AI that understands context and delivers real value."
  },
  {
    icon: Zap,
    title: "Workflow Automation",
    description: "Streamline repetitive tasks with smart automation that learns and adapts."
  },
  {
    icon: Target,
    title: "Rapid Prototyping",
    description: "Quick proof-of-concepts to validate AI solutions before full implementation."
  }
]

const testimonials = [
  {
    name: "Sarah Johnson",
    role: "CEO, TechStart",
    content: "Farzad's AI automation saved us 20 hours per week. The chatbot he built understands our customers better than we expected."
  },
  {
    name: "Michael Chen",
    role: "Operations Director",
    content: "The workflow automation Farzad implemented reduced our processing time by 60%. Incredible results."
  },
  {
    name: "Lisa Rodriguez",
    role: "Marketing Manager",
    content: "Working with Farzad was a game-changer. His AI solutions are practical and actually work in the real world."
  }
]

const stats = [
  { number: "10,000+", label: "Hours of AI Experience" },
  { number: "50+", label: "AI Projects Delivered" },
  { number: "95%", label: "Client Satisfaction Rate" },
  { number: "4+", label: "Years in AI Consulting" }
]

export default function HomePage() {
  return (
    <>
      {/* Hero Section */}
      <div className="relative flex min-h-screen w-full flex-col items-center justify-center gap-6 overflow-hidden px-4 py-8 sm:gap-8">
        <div className="absolute inset-0 z-0">
          {/* <DotScreenShader /> */}
        </div>
        <h1 className="pointer-events-none relative z-20 px-4 text-center text-4xl font-light tracking-tight text-foreground drop-shadow-lg sm:text-5xl md:text-6xl lg:text-7xl">
          Build AI That Actually <span className="text-accent drop-shadow-sm">Works</span>
        </h1>
        <p className="pointer-events-none relative z-20 max-w-2xl px-4 text-center text-base font-light leading-relaxed text-muted-foreground drop-shadow-md sm:text-lg md:text-xl">
          I'm Farzad Bayat, an AI consultant with 10,000+ hours of hands-on experience.
          I build practical AI automation solutions that deliver real business results—not just hype.
        </p>
        <div className="relative z-20 flex flex-col flex-wrap items-center justify-center gap-4 px-4 sm:flex-row">
          <BookCallButton size="lg" className="hover:bg-accent/90 bg-accent text-accent-foreground shadow-lg" title="Book Your Free AI Consultation">
            Start Your AI Project
            <ArrowRight className="ml-2 size-4" />
          </BookCallButton>
          <Button asChild variant="outline" size="lg" className="hover:bg-muted border-border backdrop-blur-sm">
            <Link href="/chat" className="flex items-center">
              <FbcIcon variant="default" size={16} className="mr-2" />
              Talk with F.B/c AI
            </Link>
          </Button>
          <Button asChild variant="ghost" size="lg" className="hover:text-foreground">
            <Link href="/about">Learn My Story</Link>
          </Button>
        </div>
      </div>


      {/* Features Section */}
      <PageShell className="relative overflow-hidden">
        {/* Subtle Transition Background */}
        <div className="via-accent/5 absolute inset-0 bg-gradient-to-b from-transparent to-background" />
        
        {/* Large FBC Icon on Right */}
        <div className="pointer-events-none absolute right-0 top-1/2 -translate-y-1/2 opacity-10">
          <FbcIcon variant="large-logo" className="text-accent/20" />
        </div>
        
        <div className="mb-6 flex justify-center">
          <ProgressTracker />
        </div>
        <div className="mb-16 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-primary sm:text-4xl">
            AI Solutions That Drive Results
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
            From intelligent chatbots to workflow automation, I build AI systems that solve real business problems.
          </p>
        </div>
        
        <div className="relative z-10 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, i) => (
            <FadeIn key={feature.title} delay={i * 0.06}>
              <MotionCard className="neu-card transition-all hover:shadow-lg">
                <CardContent className="p-6 text-center">
                  <feature.icon className="mx-auto mb-4 size-12 text-accent transition-transform group-hover:scale-110" />
                  <h3 className="mb-2 text-lg font-semibold text-primary">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </CardContent>
              </MotionCard>
            </FadeIn>
          ))}
        </div>
      </PageShell>

      {/* Testimonials Section */}
      <PageShell className="bg-secondary">
        <div className="mb-16 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-primary sm:text-4xl">
            What Clients Say
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Real results from real businesses using AI automation.
          </p>
        </div>
        
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {testimonials.map((testimonial) => (
            <Card key={testimonial.name} className="neu-card">
              <CardContent className="p-6">
                <div className="mb-4 flex">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="size-4 fill-accent text-accent" />
                  ))}
                </div>
                <p className="mb-4 text-muted-foreground">"{testimonial.content}"</p>
                <div>
                  <div className="font-semibold text-primary">{testimonial.name}</div>
                  <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </PageShell>

      {/* Citations Preview */}
      <PageShell>
        <CitationsDemo />
      </PageShell>

      {/* Why Choose Me Section */}
      <PageShell>
        <div className="grid items-center gap-12 md:grid-cols-2">
          <div>
            <h2 className="mb-6 text-3xl font-bold tracking-tight text-primary sm:text-4xl">
              Why Work With Me?
            </h2>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Lightbulb className="mt-1 size-6 flex-shrink-0 text-accent" />
                <div>
                  <h3 className="font-semibold text-primary">Practical Experience</h3>
                  <p className="text-muted-foreground">10,000+ hours building real AI solutions, not just theory.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Users className="mt-1 size-6 flex-shrink-0 text-accent" />
                <div>
                  <h3 className="font-semibold text-primary">Business-Focused</h3>
                  <p className="text-muted-foreground">I understand business needs and build AI that delivers ROI.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Target className="mt-1 size-6 flex-shrink-0 text-accent" />
                <div>
                  <h3 className="font-semibold text-primary">Rapid Implementation</h3>
                  <p className="text-muted-foreground">Quick prototypes and fast deployment to get results sooner.</p>
                </div>
              </div>
            </div>
          </div>
          <div className="from-accent/10 to-primary/10 rounded-lg bg-gradient-to-br p-8">
            <h3 className="mb-4 text-xl font-bold text-primary">Ready to Transform Your Business?</h3>
            <p className="mb-6 text-muted-foreground">
              Let's discuss how AI automation can streamline your workflows and boost productivity.
            </p>
            <BookCallButton className="hover:bg-accent/90 w-full bg-accent" title="Schedule Free Consultation" />
          </div>
        </div>
      </PageShell>

      {/* Services Preview */}
      <PageShell className="bg-secondary">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-primary sm:text-4xl">
            How I Can Help Your Business
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
            From strategy to implementation, I provide end-to-end AI solutions.
          </p>
        </div>
        
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          <Card className="neu-card">
            <CardContent className="p-8">
              <h3 className="mb-4 text-xl font-bold text-primary">AI Consulting & Strategy</h3>
              <p className="mb-6 text-muted-foreground">
                Comprehensive AI assessment and strategic planning to identify the best opportunities for automation in your business.
              </p>
              <Button asChild variant="outline">
                <Link href="/consulting">Learn More</Link>
              </Button>
            </CardContent>
          </Card>
          
          <Card className="neu-card">
            <CardContent className="p-8">
              <h3 className="mb-4 text-xl font-bold text-primary">Hands-On AI Workshop</h3>
              <p className="mb-6 text-muted-foreground">
                Interactive workshop where you'll build your first AI automation tool and learn practical implementation strategies.
              </p>
              <Button asChild variant="outline">
                <Link href="/workshop">Join Workshop</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </PageShell>

      {/* CTA Section */}
      <PageShell>
        <div className="from-accent/10 to-primary/10 rounded-2xl bg-gradient-to-r p-12 text-center">
          <h2 className="mb-4 text-3xl font-bold tracking-tight text-primary sm:text-4xl">
            Ready to Build AI That Works?
          </h2>
          <p className="mx-auto mb-8 max-w-2xl text-lg text-muted-foreground">
            Stop wasting time on AI solutions that don't deliver. Let's build something that actually moves your business forward.
          </p>
          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            <Button asChild size="lg" className="hover:bg-accent/90 bg-accent">
              <Link href="/contact">
                Start Your Project Today
                <ArrowRight className="ml-2 size-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/chat">Try AI Chat Demo</Link>
            </Button>
          </div>
        </div>
      </PageShell>
    </>
  )
}
