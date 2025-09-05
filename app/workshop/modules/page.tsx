"use client"

import { motion } from 'framer-motion'
import Link from 'next/link'
import { ArrowRight, Lock, CheckCircle, Circle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { getAllModules } from '@/src/core/education/modules'
import { useModuleProgress } from '@/hooks/workshop/use-module-progress'

export default function ModulesPage() {
  const modules = getAllModules()
  const { completedModules } = useModuleProgress()

  const modulesByPhase = modules.reduce((acc, m) => {
    (acc[m.phase] ||= []).push(m)
    return acc
  }, {} as Record<number, typeof modules>)

  const phases = Object.keys(modulesByPhase).map(Number).sort((a, b) => a - b)
  const progress = (completedModules.length / modules.length) * 100

  return (
    <div className="container mx-auto px-4 py-10">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Your AI Learning Journey</h1>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">{completedModules.length} of {modules.length} completed</span>
          <Progress value={progress} className="w-32" />
        </div>
      </div>

      <div className="space-y-12">
        {phases.map((phase) => {
          const phaseModules = modulesByPhase[phase]
          const prevPhase = phase - 1
          const prevModules = modulesByPhase[prevPhase] || []
          const isPrevDone = prevPhase < 1 || prevModules.every(m => completedModules.includes(m.slug))

          return (
            <div key={phase}>
              <div className="mb-6 flex items-center gap-2">
                <div className="flex size-8 items-center justify-center rounded-full bg-muted">
                  <span className="font-medium">{phase}</span>
                </div>
                <h2 className="text-2xl font-bold">
                  {phase === 1 && 'Foundational Concepts'}
                  {phase === 2 && 'Core Mechanics & Customization'}
                </h2>
              </div>

              <div className="relative">
                <div className="absolute inset-y-0 left-6 w-0.5 bg-border" />
                <div className="space-y-6">
                  {phaseModules && phaseModules.map((module, index) => {
                    const isCompleted = completedModules.includes(module.slug)
                    const isAvailable = isPrevDone && (index === 0 || (phaseModules[index - 1]?.slug ? completedModules.includes(phaseModules[index - 1]!.slug) : false))
                    return (
                      <motion.div key={module.slug} className={`relative pl-12 ${!isAvailable ? 'opacity-60' : ''}`}
                        initial={{ opacity: 0, y: 20 }} animate={{ opacity: isAvailable ? 1 : 0.6, y: 0 }} transition={{ duration: 0.4 }}>
                        <div className="absolute left-4 top-1 -ml-[9px]">
                          {isCompleted ? <CheckCircle className="size-5 text-green-500" /> : isAvailable ? <Circle className="size-5 text-blue-500" /> : <Lock className="size-5 text-muted-foreground" />}
                        </div>
                        <div className={`rounded-xl border bg-card p-6 shadow-sm ${isCompleted ? 'border-green-500/30' : ''}`}>
                          <div className="mb-4 flex items-start justify-between">
                            <div>
                              <h3 className="text-xl font-bold">{module.title}</h3>
                              <p className="text-muted-foreground">{module.description}</p>
                            </div>
                            {isCompleted && <div className="rounded-full bg-green-500/20 px-2 py-1 text-xs text-green-500">Completed</div>}
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="text-sm"><span className="font-medium">Interaction:</span> {module.interaction}</div>
                            <Link href={`/workshop/modules/${module.slug}`} className="inline-flex">
                              <Button variant={isCompleted ? 'outline' : 'default'} disabled={!isAvailable}>
                                {isCompleted ? 'Review' : isAvailable ? 'Start' : 'Locked'}
                                {isAvailable && !isCompleted && <ArrowRight className="ml-2 size-4" />}
                              </Button>
                            </Link>
                          </div>
                        </div>
                      </motion.div>
                    )
                  })}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}


