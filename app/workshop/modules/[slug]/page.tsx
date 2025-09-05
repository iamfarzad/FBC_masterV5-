"use client"

import { useEffect, useMemo, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Home, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import ModuleRenderer from '@/components/workshop/ModuleRenderer'
import { getAllModules, getModuleBySlug } from '@/src/core/education/modules'
import { useModuleProgress } from '@/hooks/workshop/use-module-progress'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
// import { Confetti } from '@/components/ui/confetti' // Removed
import { MODULE_QUIZZES, hasQuizFor, type QuizQuestion } from '@/src/core/education/quizzes'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function WorkshopModulePage() {
  const params = useParams()
  const slug = params?.slug as string
  const router = useRouter()
  const selectedModule = useMemo(() => getModuleBySlug(slug), [slug])
  const { completedModules, completeModule } = useModuleProgress()

  const [redirect, setRedirect] = useState(false)
  const [showCompletionDialog, setShowCompletionDialog] = useState(false)
  const [isCompleted, setIsCompleted] = useState(false)
  const [nextModule, setNextModule] = useState<string | null>(null)
  // const [showConfetti, setShowConfetti] = useState(false) // Confetti removed
  const [quizAnswers, setQuizAnswers] = useState<Record<string, string>>({})
  const [quizSubmitted, setQuizSubmitted] = useState(false)

  useEffect(() => {
    if (!selectedModule) { setRedirect(true); return }
    setIsCompleted(completedModules.includes(slug))
    const modules = getAllModules()
    const idx = modules.findIndex(m => m.slug === slug)
    if (idx >= 0 && idx < modules.length - 1) {
      setNextModule(modules[idx + 1]?.slug ?? null)
    } else {
      setNextModule(null)
    }
  }, [selectedModule, slug, completedModules])

  useEffect(() => { if (redirect) router.push('/workshop/modules') }, [redirect, router])

  if (!selectedModule || redirect) return null

  const handleComplete = () => {
    if (isCompleted) return
    // Gate behind quiz if present
    if (hasQuizFor(slug)) {
      const questions: QuizQuestion[] = MODULE_QUIZZES[slug] || []
      const allCorrect = questions.every(q => quizAnswers[q.id] === q.correctKey)
      if (!allCorrect) {
        setQuizSubmitted(true)
        return
      }
    }
    // setShowConfetti(true) // Confetti removed
    completeModule(slug, { title: selectedModule.title, phase: selectedModule.phase })
    try {
      fetch('/api/intelligence/education', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ moduleId: slug, stepId: 'quiz', xp: 30, moduleTitle: selectedModule.title })
      }).catch(() => {})
    } catch {}
    setIsCompleted(true)
    setTimeout(() => { setShowCompletionDialog(true) }, 1200)
  }

  return (
    <div className="min-h-screen">
      <div className="bg-background/80 fixed left-0 top-0 z-40 w-full border-b backdrop-blur-sm">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/workshop/modules">
                <ArrowLeft className="size-5" />
                <span className="sr-only">Back to journey</span>
              </Link>
            </Button>
            <div>
              <h1 className="text-lg font-medium">{selectedModule.title}</h1>
              <p className="text-xs text-muted-foreground">Phase {selectedModule.phase}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant={isCompleted ? 'outline' : 'default'} size="sm" onClick={handleComplete} disabled={isCompleted}>
              {isCompleted ? (<><CheckCircle className="mr-2 size-4" />Completed</>) : 'Mark as Complete'}
            </Button>
            <Button variant="ghost" size="icon" asChild>
              <Link href="/">
                <Home className="size-5" />
                <span className="sr-only">Home</span>
              </Link>
            </Button>
          </div>
        </div>
      </div>

      <div className="pt-16">
        <ModuleRenderer module={selectedModule} />
      </div>

      {hasQuizFor(slug) && (
        <div className="container mx-auto px-4 py-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quick Check</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {(MODULE_QUIZZES[slug] || []).map(q => (
                  <div key={q.id} className="space-y-3">
                    <div className="text-sm font-medium">{q.prompt}</div>
                    <div className="grid gap-2 sm:grid-cols-2">
                      {q.options.map(opt => (
                        <Button key={opt.key} variant={quizAnswers[q.id] === opt.key ? 'default' : 'outline'} onClick={() => setQuizAnswers(prev => ({ ...prev, [q.id]: opt.key }))} className="justify-start">
                          {opt.label}
                        </Button>
                      ))}
                    </div>
                    {quizSubmitted && quizAnswers[q.id] !== q.correctKey && (
                      <div className="text-xs text-red-600">Try again.</div>
                    )}
                  </div>
                ))}
                <div className="flex gap-2">
                  <Button onClick={() => setQuizSubmitted(true)}>Check Answers</Button>
                  <Button variant="ghost" onClick={() => { setQuizAnswers({}); setQuizSubmitted(false) }}>Reset</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* <Confetti isActive={showConfetti} /> */}

      <Dialog open={showCompletionDialog} onOpenChange={setShowCompletionDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center text-2xl">🎉 Module Completed! 🎉</DialogTitle>
            <DialogDescription className="text-center">
              Great work. You completed {selectedModule.title}.
            </DialogDescription>
          </DialogHeader>
          <div className="py-6">
            <div className="bg-primary/5 mb-4 rounded-lg border p-4">
              <p className="mb-2 text-center font-medium">Achievement Unlocked</p>
              <p className="text-center text-sm text-muted-foreground">{selectedModule.title} Master</p>
            </div>
          </div>
          <DialogFooter className="flex justify-center gap-2 sm:justify-center">
            {nextModule ? (
              <Button onClick={() => router.push(`/workshop/modules/${nextModule}`)} className="w-full sm:w-auto">Continue to Next Module</Button>
            ) : (
              <Button onClick={() => router.push('/workshop/modules')} className="w-full sm:w-auto">Return to Journey</Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}


