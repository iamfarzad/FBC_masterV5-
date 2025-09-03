'use client'

import dynamic from 'next/dynamic'
import { Loader2 } from 'lucide-react'

const modules = {
  'roi-calculator': dynamic(
    () => import('./modules/roi-calculator').then(mod => ({ default: mod.ROICalculatorModule })),
    { loading: () => <ModuleLoader /> }
  ),
  'tokenization-visualizer': dynamic(
    () => import('./modules/tokenization-visualizer').then(mod => ({ default: mod.TokenizationVisualizer })),
    { loading: () => <ModuleLoader /> }
  ),
  'attention-mechanism-demo': dynamic(
    () => import('./modules/attention-mechanism').then(mod => ({ default: mod.AttentionMechanismDemo })),
    { loading: () => <ModuleLoader /> }
  ),
  'embedding-explorer': dynamic(
    () => import('./modules/embedding-explorer').then(mod => ({ default: mod.EmbeddingExplorer })),
    { loading: () => <ModuleLoader /> }
  ),
  'temperature-sampling-controls': dynamic(
    () => import('./modules/temperature-sampling').then(mod => ({ default: mod.TemperatureSamplingControls })),
    { loading: () => <ModuleLoader /> }
  ),
}

function ModuleLoader() {
  return (
    <div className="flex items-center justify-center p-8">
      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
    </div>
  )
}

interface ModuleRendererProps {
  moduleId: string
}

export function ModuleRenderer({ moduleId }: ModuleRendererProps) {
  const Module = modules[moduleId as keyof typeof modules]
  
  if (!Module) {
    return (
      <div className="text-center p-8 text-muted-foreground">
        Module not found: {moduleId}
      </div>
    )
  }

  return <Module />
}