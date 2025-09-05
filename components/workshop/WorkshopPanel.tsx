"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
// import { Confetti } from "@/components/ui/confetti" // Removed
import { getAllModules } from '@/src/core/education/modules'
import { useModuleProgress } from "@/hooks/workshop/use-module-progress"
import { BookOpen, Award, TrendingUp, Brain, ChevronRight, Search, Filter, Star, Clock, Target, Trophy, Zap, BarChart3, PieChart, TrendingUp as TrendUp } from "lucide-react"
import { CourseOutline } from "@/components/workshop/CourseOutline"
import { CitationsDemo } from "@/components/experience/citations-demo"
import ModuleRenderer from "@/components/workshop/ModuleRenderer"
import { getModuleBySlug } from '@/src/core/education/modules'
import { MODULE_QUIZZES, hasQuizFor, type QuizQuestion } from "@/src/core/education/quizzes"

export function WorkshopPanel() {
  const { completedModules } = useModuleProgress()
  const [activeSection, setActiveSection] = useState<
    "dashboard" | "modules" | "outline" | "lab" | "achievements" | "stats"
  >("dashboard")
  // const [showConfetti, setShowConfetti] = useState(false) // Confetti removed
  const [activeModuleSlug, setActiveModuleSlug] = useState<string | null>(null)
  const [quizAnswers, setQuizAnswers] = useState<Record<string, string>>({})
  const [quizSubmitted, setQuizSubmitted] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [phaseFilter, setPhaseFilter] = useState<'all' | '1' | '2' | '3' | '4'>('all')
  const [statusFilter, setStatusFilter] = useState<'all' | 'completed' | 'incomplete' | 'recommended'>('all')
  const router = useRouter()
  const search = useSearchParams()

  const modules = useMemo(() => getAllModules(), [])
  const augmented = useMemo(() => {
    return modules.map(m => {
      const isCompleted = completedModules.includes(m.slug)
      const estMinutes = Math.max(12, 6 * (m.phase + 1))
      return { ...m, completed: isCompleted, duration: `${estMinutes} min` }
    })
  }, [modules, completedModules])

  // 🔍 ENHANCED FILTERING AND SEARCH SYSTEM
  const filteredModules = useMemo(() => {
    let filtered = [...augmented]
    
    // 🔎 Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(m => 
        m.title.toLowerCase().includes(query) ||
        m.description.toLowerCase().includes(query) ||
        m.slug.toLowerCase().includes(query)
      )
    }
    
    // 📊 Phase filter
    if (phaseFilter !== 'all') {
      filtered = filtered.filter(m => m.phase === parseInt(phaseFilter))
    }
    
    // ✅ Status filter
    if (statusFilter === 'completed') {
      filtered = filtered.filter(m => m.completed)
    } else if (statusFilter === 'incomplete') {
      filtered = filtered.filter(m => !m.completed)
    } else if (statusFilter === 'recommended') {
      // Smart recommendations: next logical modules to complete
      const incompleteModules = filtered.filter(m => !m.completed)
      const lowestPhase = Math.min(...incompleteModules.map(m => m.phase))
      filtered = incompleteModules.filter(m => m.phase <= lowestPhase + 1)
    }
    
    return filtered
  }, [augmented, searchQuery, phaseFilter, statusFilter])

  // 📊 Enhanced Analytics Data for Dashboard
  const progressByPhase = useMemo(() => {
    const phases = [1, 2, 3, 4]
    return phases.map(phase => {
      const phaseModules = augmented.filter(m => m.phase === phase)
      const completed = phaseModules.filter(m => m.completed).length
      return {
        phase,
        total: phaseModules.length,
        completed,
        percentage: phaseModules.length ? Math.round((completed / phaseModules.length) * 100) : 0,
        name: phase === 1 ? 'Foundations' : phase === 2 ? 'Application' : phase === 3 ? 'Advanced' : 'Expert'
      }
    })
  }, [augmented])

  const completedCount = augmented.filter(m => m.completed).length
  const progressPct = modules.length ? Math.round((completedCount / modules.length) * 100) : 0
  const nextModule = augmented.find(m => !m.completed)

  const xpForModule = (phase: number) => (phase <= 1 ? 30 : phase === 2 ? 40 : phase === 3 ? 50 : 60)
  const totalXp = augmented.reduce((sum, m) => sum + (m.completed ? xpForModule(m.phase) : 0), 0)

  const achievements = useMemo(() => {
    const unlocked = []
    if (completedCount >= 3) unlocked.push({ id: 'first-steps', title: 'First Steps', description: 'Completed 3 modules', icon: '🚀' })
    if (completedCount >= 6) unlocked.push({ id: 'learning-streak', title: 'Learning Streak', description: 'Completed 6 modules', icon: '🔥' })
    if (completedCount >= 9) unlocked.push({ id: 'expert-path', title: 'Expert Path', description: 'Completed 9 modules', icon: '🎯' })
    if (completedCount === modules.length) unlocked.push({ id: 'master', title: 'AI Master', description: 'All modules complete!', icon: '👑' })
    if (totalXp >= 200) unlocked.push({ id: 'xp-hunter', title: 'XP Hunter', description: '200+ XP earned', icon: '💎' })
    return unlocked
  }, [completedCount, totalXp, modules.length])

  // URL -> in-panel module view (shallow)
  useEffect(() => {
    const slug = search?.get('module')
    if (slug) {
      setActiveSection('modules')
      setActiveModuleSlug(slug)
      setQuizAnswers({})
      setQuizSubmitted(false)
    }
  }, [search])

  function openModule(slug: string) {
    setActiveSection('modules')
    setActiveModuleSlug(slug)
    setQuizAnswers({})
    setQuizSubmitted(false)
    try { router.replace(`/workshop?module=${slug}`, { scroll: false }) } catch {}
  }

  function closeModule() {
    setActiveModuleSlug(null)
    setQuizAnswers({})
    setQuizSubmitted(false)
    try { router.replace(`/workshop`, { scroll: false }) } catch {}
  }

  function handleCelebrate() {
    // Confetti removed - could show toast notification instead
  }

  function Dashboard() {
    return (
      <div className="space-y-6">
        <Card className="bg-card">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2"><Brain className="size-5" />Your AI Workshop</CardTitle>
              <Badge variant="outline">{completedCount}/{modules.length} complete</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Progress value={progressPct} className="h-2" />
              <div className="text-sm text-muted-foreground">{progressPct}% overall</div>
              <div className="flex gap-2">
                {nextModule ? (
                  <Button asChild>
                    <Link href={`/workshop/modules/${nextModule.slug}`}>
                      Continue: {nextModule.title}
                      <ChevronRight className="ml-1 size-4" />
                    </Link>
                  </Button>
                ) : (
                  <Button variant="outline" onClick={handleCelebrate}>Replay modules</Button>
                )}
                <Button variant="outline" onClick={() => setActiveSection("modules")}>View all modules</Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 📊 ENHANCED ANALYTICS GRID */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card className="border border-blue-200">
            <CardContent className="p-4 text-center">
              <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-lg bg-blue-100">
                <TrendingUp className="size-6 text-blue-600" />
              </div>
              <div className="text-2xl font-bold text-blue-700">{progressPct}%</div>
              <div className="text-sm text-blue-600">Progress</div>
            </CardContent>
          </Card>
          <Card className="border border-green-200">
            <CardContent className="p-4 text-center">
              <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-lg bg-green-100">
                <Award className="size-6 text-green-600" />
              </div>
              <div className="text-2xl font-bold text-green-700">{completedCount}</div>
              <div className="text-sm text-green-600">Completed</div>
            </CardContent>
          </Card>
          <Card className="border border-purple-200">
            <CardContent className="p-4 text-center">
              <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-lg bg-purple-100">
                <Trophy className="size-6 text-purple-600" />
              </div>
              <div className="text-2xl font-bold text-purple-700">{totalXp}</div>
              <div className="text-sm text-purple-600">Total XP</div>
            </CardContent>
          </Card>
          <Card className="border border-orange-200">
            <CardContent className="p-4 text-center">
              <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-lg bg-orange-100">
                <BookOpen className="size-6 text-orange-600" />
              </div>
              <div className="text-2xl font-bold text-orange-700">{modules.length - completedCount}</div>
              <div className="text-sm text-orange-600">Remaining</div>
            </CardContent>
          </Card>
        </div>

        {/* 📈 INTERACTIVE PROGRESS CHARTS */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="size-5 text-brand" />
                Progress by Phase
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {progressByPhase.map(phase => (
                  <div key={phase.phase} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium text-text">Phase {phase.phase}: {phase.name}</span>
                      <span className="text-text-muted">{phase.completed}/{phase.total}</span>
                    </div>
                    <Progress value={phase.percentage} className="h-2" />
                    <div className="text-xs text-text-muted">{phase.percentage}% complete</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="size-5 text-brand" />
                Learning Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between rounded-lg border border-green-200 bg-green-50 p-3">
                  <span className="font-medium text-green-700">Mastered</span>
                  <span className="text-green-600">{completedCount} modules</span>
                </div>
                <div className="flex items-center justify-between rounded-lg border border-blue-200 bg-blue-50 p-3">
                  <span className="font-medium text-blue-700">In Progress</span>
                  <span className="text-blue-600">{modules.length - completedCount} modules</span>
                </div>
                <div className="bg-brand/5 border-brand/20 flex items-center justify-between rounded-lg border p-3">
                  <span className="font-medium text-brand">XP Rate</span>
                  <span className="text-brand">{Math.round(totalXp / Math.max(completedCount, 1))} per module</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 🏆 ACHIEVEMENT SYSTEM */}
        {achievements.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="size-5 text-brand" />
                Achievements Unlocked
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                {achievements.map(achievement => (
                  <div key={achievement.id} className="rounded-lg border border-border bg-surface-elevated p-4 text-center transition-shadow hover:shadow-md">
                    <div className="mb-3 text-3xl">{achievement.icon}</div>
                    <div className="font-semibold text-text">{achievement.title}</div>
                    <div className="mt-1 text-xs text-text-muted">{achievement.description}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* 🎯 SMART RECOMMENDATIONS */}
        {nextModule && (
          <Card className="border-l-4 border-l-green-500">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="size-5 text-green-600" />
                Recommended Next
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold text-text">{nextModule.title}</div>
                  <div className="text-sm text-text-muted">{nextModule.description}</div>
                  <div className="mt-2 flex items-center gap-4 text-xs text-text-muted">
                    <div className="flex items-center gap-1">
                      <Clock className="size-3" />
                      ~{nextModule.duration}
                    </div>
                    <div className="flex items-center gap-1">
                      <Zap className="size-3" />
                      {xpForModule(nextModule.phase)} XP
                    </div>
                  </div>
                </div>
                <Button asChild className="rounded-xl bg-green-600 text-white hover:bg-green-700">
                  <Link href={`/workshop/modules/${nextModule.slug}`}>
                    Start Module
                    <ChevronRight className="ml-1 size-4" />
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    )
  }

  function Modules() {
    if (activeModuleSlug) {
      const selectedModule = getModuleBySlug(activeModuleSlug)
      if (!selectedModule) return <div className="text-muted-foreground">Module not found.</div>
      const questions: QuizQuestion[] = MODULE_QUIZZES[activeModuleSlug] || []
      const allCorrect = questions.length === 0 || questions.every(q => quizAnswers[q.id] === q.correctKey)
      const isCompleted = completedModules.includes(activeModuleSlug)
      return (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-semibold">{selectedModule.title}</h2>
              <div className="text-sm text-muted-foreground">Phase {selectedModule.phase}</div>
            </div>
            <div className="flex gap-2">
              <Button variant="ghost" onClick={closeModule}>Back</Button>
              <Button
                variant={isCompleted ? 'outline' : 'default'}
                disabled={isCompleted || (hasQuizFor(activeModuleSlug) && !allCorrect)}
                onClick={() => {
                  if (hasQuizFor(activeModuleSlug) && !allCorrect) { setQuizSubmitted(true); return }
                  // setShowConfetti(true) // Confetti removed
                  try {
                    fetch('/api/intelligence/education', {
                      method: 'POST', headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ moduleId: activeModuleSlug, stepId: 'quiz', xp: 30, moduleTitle: selectedModule.title })
                    }).catch(() => {})
                  } catch {}
                }}
              >{isCompleted ? 'Completed' : 'Mark as Complete'}</Button>
            </div>
          </div>
          <ModuleRenderer module={selectedModule} />
          {hasQuizFor(activeModuleSlug) && (
            <Card>
              <CardHeader><CardTitle className="text-lg">Quick Check</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {questions.map(q => (
                    <div key={q.id} className="space-y-3">
                      <div className="text-sm font-medium">{q.prompt}</div>
                      <div className="grid gap-2 sm:grid-cols-2">
                        {q.options.map(opt => (
                          <Button key={opt.key} variant={quizAnswers[q.id] === opt.key ? 'default' : 'outline'} onClick={() => setQuizAnswers(prev => ({ ...prev, [q.id]: opt.key }))} className="justify-start">{opt.label}</Button>
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
          )}
        </div>
      )
    }
    return (
      <div className="space-y-6">
        {/* 🧭 ENHANCED NAVIGATION HEADER */}
        <div className="rounded-xl border border-border bg-surface p-6">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="flex items-center gap-3 text-2xl font-semibold text-text">
                <div className="flex size-8 items-center justify-center rounded-lg bg-brand">
                  <Brain className="size-4 text-surface" />
                </div>
                Smart Learning Path
              </h2>
              <p className="mt-1 text-sm text-text-muted">
                {filteredModules.length} of {modules.length} modules • {completedCount} completed
              </p>
            </div>
            <Badge variant="outline" className="border-border bg-surface text-text">
              {completedCount}/{modules.length} complete
            </Badge>
          </div>
          
          {/* 🔍 SEARCH AND FILTER CONTROLS */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 transform text-text-muted" />
              <Input
                placeholder="Search modules..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-10 border-border pl-10 focus:border-brand"
              />
            </div>
            
            <Select value={phaseFilter} onValueChange={(value: any) => setPhaseFilter(value)}>
              <SelectTrigger className="h-10 border-border focus:border-brand">
                <SelectValue placeholder="Filter by phase" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Phases</SelectItem>
                <SelectItem value="1">Phase 1 - Foundations</SelectItem>
                <SelectItem value="2">Phase 2 - Application</SelectItem>
                <SelectItem value="3">Phase 3 - Advanced</SelectItem>
                <SelectItem value="4">Phase 4 - Expert</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={statusFilter} onValueChange={(value: any) => setStatusFilter(value)}>
              <SelectTrigger className="h-10 border-border focus:border-brand">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Modules</SelectItem>
                <SelectItem value="recommended">📍 Recommended</SelectItem>
                <SelectItem value="incomplete">🔄 In Progress</SelectItem>
                <SelectItem value="completed">✅ Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {/* 📊 Filter Results Summary */}
          {(searchQuery || phaseFilter !== 'all' || statusFilter !== 'all') && (
            <div className="bg-brand/5 border-brand/10 mt-4 rounded-lg border p-3">
              <div className="flex items-center gap-2 text-sm">
                <Filter className="size-4 text-brand" />
                <span className="text-text">
                  Showing {filteredModules.length} modules
                  {searchQuery && ` matching "${searchQuery}"`}
                  {phaseFilter !== 'all' && ` in Phase ${phaseFilter}`}
                  {statusFilter !== 'all' && ` (${statusFilter})`}
                </span>
                {(searchQuery || phaseFilter !== 'all' || statusFilter !== 'all') && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSearchQuery('')
                      setPhaseFilter('all')
                      setStatusFilter('all')
                    }}
                    className="ml-auto h-6 px-2 text-xs text-text-muted hover:text-text"
                  >
                    Clear filters
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* 🎯 ENHANCED MODULE CARDS */}
        <div className="space-y-3">
          {filteredModules.length === 0 ? (
            <div className="py-12 text-center">
              <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-surface-elevated">
                <Search className="size-8 text-text-muted" />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-text">No modules found</h3>
              <p className="text-text-muted">Try adjusting your search or filter criteria</p>
            </div>
          ) : (
            filteredModules.map(m => {
              const isRecommended = statusFilter === 'recommended' || 
                (!m.completed && m.phase === (nextModule?.phase || 1))
              
              return (
                <Card 
                  key={m.slug} 
                  className={`transition-all duration-200 hover:shadow-md ${
                    isRecommended ? 'border-l-4 border-l-brand shadow-md' : 'border-border'
                  }`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between gap-4">
                      <div className="min-w-0 flex-1">
                        <div className="mb-2 flex items-center gap-3">
                          <div className="font-semibold text-text">{m.title}</div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">
                              Phase {m.phase}
                            </Badge>
                            {m.completed && (
                              <Badge className="bg-green-600 text-xs text-white">
                                ✓ Completed
                              </Badge>
                            )}
                            {isRecommended && !m.completed && (
                              <Badge className="bg-brand text-xs text-surface">
                                <Star className="mr-1 size-3" />
                                Recommended
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div className="mb-1 text-sm text-text-muted">{m.description}</div>
                        <div className="flex items-center gap-4 text-xs text-text-muted">
                          <div className="flex items-center gap-1">
                            <Clock className="size-3" />
                            ~{m.duration}
                          </div>
                          <div className="flex items-center gap-1">
                            <Target className="size-3" />
                            {xpForModule(m.phase)} XP
                          </div>
                        </div>
                      </div>
                      <Button 
                        variant={m.completed ? "outline" : isRecommended ? "default" : "outline"}
                        onClick={() => openModule(m.slug)}
                        className={`px-4 py-2 ${
                          isRecommended && !m.completed ? 'bg-brand text-surface hover:bg-brand-hover' : ''
                        }`}
                      >
                        {m.completed ? "Review" : "Start"}
                        <ChevronRight className="ml-1 size-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )
            })
          )}
        </div>
      </div>
    )
  }

  function Outline() {
    return (
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold">Course Outline</h2>
        <CourseOutline />
      </div>
    )
  }

  function Lab() {
    return (
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold">Hands-on Lab</h2>
        <Card>
          <CardContent className="flex items-center justify-between gap-4 p-4">
            <div>
              <div className="font-medium">Build your first chatbot (open Chat preset)</div>
              <div className="text-sm text-muted-foreground">Open chat with a learning context</div>
            </div>
            <div className="flex gap-2">
              <Button asChild>
                <Link href="/chat?education=1">Open Chat</Link>
              </Button>
              <Button variant="outline" onClick={() => {
                fetch('/api/intelligence/education', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ moduleId: 'lab-chat', stepId: 'open-chat', xp: 20, moduleTitle: 'Hands-on Lab' }) }).catch(() => {})
                // setShowConfetti(true) // Confetti removed
                // setTimeout(() => setShowConfetti(false), 1200) // Confetti removed
              }}>Mark done</Button>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center justify-between gap-4 p-4">
            <div>
              <div className="font-medium">Estimate ROI (use the ROI card)</div>
              <div className="text-sm text-muted-foreground">Try the ROI calculator in chat</div>
            </div>
            <div className="flex gap-2">
              <Button asChild variant="outline">
                <Link href="/chat?education=1#roi">Open in Chat</Link>
              </Button>
              <Button variant="outline" onClick={() => {
                fetch('/api/intelligence/education', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ moduleId: 'lab-roi', stepId: 'roi-card', xp: 20, moduleTitle: 'Hands-on Lab' }) }).catch(() => {})
                // setShowConfetti(true) // Confetti removed
                // setTimeout(() => setShowConfetti(false), 1200) // Confetti removed
              }}>Mark done</Button>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center justify-between gap-4 p-4">
            <div>
              <div className="font-medium">Video → App (use launcher)</div>
              <div className="text-sm text-muted-foreground">Paste a YouTube link in chat to generate an app blueprint</div>
            </div>
            <div className="flex gap-2">
              <Button asChild variant="outline">
                <Link href="/chat?video=">Launch</Link>
              </Button>
              <Button variant="outline" onClick={() => {
                fetch('/api/intelligence/education', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ moduleId: 'lab-video2app', stepId: 'launcher', xp: 20, moduleTitle: 'Hands-on Lab' }) }).catch(() => {})
                // setShowConfetti(true) // Confetti removed
                // setTimeout(() => setShowConfetti(false), 1200) // Confetti removed
              }}>Mark done</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  function Achievements() {
    const milestones = [
      { id: "first", label: "First Module", achieved: completedCount >= 1 },
      { id: "phase2", label: "Phase 2 Unlocked", achieved: augmented.some(m => m.phase >= 2 && m.completed) },
      { id: "all", label: "All Modules", achieved: completedCount === modules.length && modules.length > 0 },
    ]
    return (
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold">Achievements</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {milestones.map(ms => (
            <Card key={ms.id}>
              <CardContent className="p-4 text-center">
                <Award className={`mx-auto mb-1 size-6 ${ms.achieved ? "text-primary" : "text-muted-foreground"}`} />
                <div className="font-medium">{ms.label}</div>
                <div className="text-xs text-muted-foreground">{ms.achieved ? "Earned" : "Locked"}</div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  function Stats() {
    return (
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold">Stats</h2>
        <Card>
          <CardContent className="p-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <div className="text-sm text-muted-foreground">Completion</div>
                <div className="text-xl font-semibold">{progressPct}%</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Completed Modules</div>
                <div className="text-xl font-semibold">{completedCount}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="h-dvh">
      <div className="container mx-auto h-full p-4">
        <div className="grid h-full grid-cols-1 gap-6 lg:grid-cols-[240px_1fr]">
          <aside className="min-h-0 self-start overflow-auto lg:sticky lg:top-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Workshop</CardTitle>
            </CardHeader>
            <CardContent className="p-2">
              <nav className="grid gap-1">
                <Button variant={activeSection === "dashboard" ? "default" : "ghost"} onClick={() => setActiveSection("dashboard")} className="justify-start">Dashboard</Button>
                <Button variant={activeSection === "modules" ? "default" : "ghost"} onClick={() => setActiveSection("modules")} className="justify-start">Modules</Button>
                  <Button variant={activeSection === "outline" ? "default" : "ghost"} onClick={() => setActiveSection("outline")} className="justify-start">Outline</Button>
                  <Button variant={activeSection === "lab" ? "default" : "ghost"} onClick={() => setActiveSection("lab")} className="justify-start">Lab</Button>
                <Button variant={activeSection === "achievements" ? "default" : "ghost"} onClick={() => setActiveSection("achievements")} className="justify-start">Achievements</Button>
                <Button variant={activeSection === "stats" ? "default" : "ghost"} onClick={() => setActiveSection("stats")} className="justify-start">Stats</Button>
              </nav>
            </CardContent>
          </Card>
          </aside>
          <main className="min-h-0 overflow-auto">
            {activeSection === "dashboard" && <Dashboard />}
            {activeSection === "modules" && <Modules />}
            {activeSection === "outline" && <Outline />}
            {activeSection === "lab" && <Lab />}
            {activeSection === "achievements" && <Achievements />}
            {activeSection === "stats" && <Stats />}
          </main>
        </div>
      </div>
    </div>
  )
}

export default WorkshopPanel


