"use client"

import React, { useState, useRef, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ToolCardWrapper } from "@/components/chat/ToolCardWrapper"
import { Calculator } from "@/src/core/icon-mapping"
import { useToast } from "@/hooks/use-toast"
import { markCapabilityUsed } from "@/components/experience/progress-tracker"

import type { ROICalculatorProps, ROICalculationResult, WizardStep } from "./ROICalculator.types"
import type { ROIResultPayload } from "@/src/core/chat"
// Import types from correct location
import type { UnifiedMessage } from '@/src/core/chat/unified-types.js'
type ChatMessage = UnifiedMessage;

// Using ROIResultPayload from @/src/core/chat

// Import extracted components
import {
  WIZARD_STEPS,
  STEP_CONTENT,
  type ROICalculationAPIResponse
} from "./ROICalculatorConstants"
import { CompanyInfoStep } from "./CompanyInfoStep"
import { MetricsStep } from "./MetricsStep"
import { ResultsStep } from "./ResultsStep"
import { ProgressSidebar } from "./ProgressSidebar"
import {
  generateCacheKey,
  loadCachedResult,
  saveCachedResult,
  clearAllCachedResults,
  createDefaultFormData,
  createDefaultCompanyInfo,
  validateFormData,
  validateCompanyInfo
} from "./ROICalculatorUtils"

export function ROICalculator({
  mode = 'card',
  onComplete,
  onCancel,
  onClose,
  sessionId,
  defaults
}: ROICalculatorProps) {
  const { toast } = useToast()
  const inputRef = useRef<HTMLInputElement>(null)

  // State management
  const [currentStep, setCurrentStep] = useState<WizardStep>("company-info")
  const [formData, setFormData] = useState(() => createDefaultFormData(defaults))
  const [companyInfo, setCompanyInfo] = useState(() => createDefaultCompanyInfo(defaults))
  const [lastHash, setLastHash] = useState<string | null>(null)
  const [isRunning, setIsRunning] = useState(false)
  const [result, setResult] = useState<ROICalculationAPIResponse | null>(null)

  // Generate cache key
  const cacheKey = React.useMemo(() => generateCacheKey(sessionId ?? undefined, formData), [sessionId, formData])

  // Load cached result on mount
  useEffect(() => {
    const cachedResult = loadCachedResult(cacheKey)
    if (cachedResult) {
      setResult(cachedResult)
      setCurrentStep("results")
      setLastHash(cacheKey)
    } else {
      // Auto-calculate if no cache and not already calculated
      const timer = window.setTimeout(() => {
        if (!lastHash) void handleCalculate(true)
      }, 200)
      return () => window.clearTimeout(timer)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Handle calculation
  const handleCalculate = async (isAuto?: boolean) => {
    if (!validateFormData(formData)) {
      toast({
        title: "Invalid Data",
        description: "Please provide valid financial metrics.",
        variant: "destructive",
      })
      return
    }

    setIsRunning(true)

    try {
      const response = await fetch('/api/tools/roi', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(sessionId ? { 'x-intelligence-session-id': sessionId } : {})
        },
        body: JSON.stringify(formData)
      })

      if (!response.ok) throw new Error("Calculation failed")

      const data: { ok: boolean; output: ROICalculationAPIResponse } = await response.json()
      if (!data?.ok || !data?.output) throw new Error("Invalid ROI API response")

      setResult(data.output)
      setCurrentStep("results")

      if (!isAuto) {
        toast({
          title: "ROI Calculation Complete",
          description: "Your ROI analysis is ready!"
        })
      }

      // Mark capability as used
      if (typeof window !== 'undefined') {
        markCapabilityUsed("roi")
        saveCachedResult(cacheKey, data.output)
      }

      setLastHash(cacheKey)

      // Emit structured chat message
      try {
        const payload: ROIResultPayload = {
          roi: data.output.roi,
          paybackPeriod: data.output.paybackPeriod,
          netProfit: data.output.netProfit,
          monthlyProfit: data.output.monthlyProfit,
          totalRevenue: data.output.totalRevenue,
          totalExpenses: data.output.totalExpenses,
          inputs: { ...formData, ...companyInfo },
          calculatedAt: data.output.calculatedAt,
        }
        const msg = { role: 'tool', type: 'roi.result', payload }
        if (typeof (globalThis as any).onEmitMessage === 'function') {
          (globalThis as any).onEmitMessage(msg)
        }
      } catch {
        // Message emission failed - continue
      }

    } catch (error) {
      console.error('ROI calculation error:', error)
      toast({
        title: "Calculation Error",
        description: "Failed to calculate ROI",
        variant: "destructive"
      })
    } finally {
      setIsRunning(false)
    }
  }

  // Handle form reset
  const handleReset = () => {
    setCurrentStep("company-info")
    setFormData(createDefaultFormData(defaults))
    setCompanyInfo(createDefaultCompanyInfo(defaults))
    setLastHash(null)
    setIsRunning(false)
    setResult(null)

    // Clear cache
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem(cacheKey)
        clearAllCachedResults()
        window.dispatchEvent(new CustomEvent('roi-reset'))
      } catch {
        // Cache operation failed - continue
      }
    }

    toast({
      title: "Form Reset",
      description: "All fields have been cleared. Start fresh!"
    })
  }

  // Handle step navigation
  const handleStepBack = () => {
    const currentIndex = WIZARD_STEPS.indexOf(currentStep)
    if (currentIndex > 0) {
      setCurrentStep(WIZARD_STEPS[currentIndex - 1]!)
    }
  }

  const handleNextStep = () => {
    setCurrentStep("metrics")
  }

  // Render current step content
  const renderStepContent = () => {
    switch (currentStep) {
      case "company-info":
        return (
          <CompanyInfoStep
            companyInfo={companyInfo}
            onCompanyInfoChange={setCompanyInfo}
            onNext={handleNextStep}
          />
        )
      case "metrics":
        return (
          <MetricsStep
            formData={formData}
            onFormDataChange={setFormData}
            onCalculate={() => handleCalculate(false)}
            isRunning={isRunning}
          />
        )
      case "results":
        return (
          <ResultsStep
            result={result}
            companyInfo={companyInfo}
            formData={formData}
            onComplete={onComplete || (() => {})}
          />
        )
      default:
        return null
    }
  }

  // Main UI component
  const ROICalculatorUI = ({ showSidebar = true }: { showSidebar?: boolean } = {}) => (
    <div className="flex h-full gap-4 lg:grid lg:grid-cols-[minmax(0,1fr)_18rem]">
      {/* Main ROI Calculator Area */}
      <div className="flex-1 p-4">
        <div>
          <Card className="w-full border border-border bg-card">
            <CardHeader className="text-center">
              <CardTitle className="mb-2 text-xl">
                {STEP_CONTENT[currentStep].title}
              </CardTitle>
              <p className="text-muted-foreground">
                {STEP_CONTENT[currentStep].description}
              </p>
            </CardHeader>
            <CardContent className="space-y-3">
              {renderStepContent()}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Sidebar */}
      {showSidebar && (
        <ProgressSidebar
          currentStep={currentStep}
          result={result}
          isRunning={isRunning}
          onStepBack={handleStepBack}
          onRecalculate={() => handleCalculate(false)}
          onReset={handleReset}
          onCancel={onCancel || (() => {})}
        />
      )}
    </div>
  )

  // Modal variant
  if (mode === 'modal') {
    return (
      <Dialog open={true} onOpenChange={(open) => !open && onClose?.()}>
        <DialogContent className="p-0 sm:max-w-2xl md:max-w-3xl">
          <DialogHeader className="flex flex-row items-center justify-between space-y-0 px-6 pb-2 pt-6">
            <DialogTitle className="flex items-center gap-2">
              <Calculator className="size-5" />
              ROI Calculator
            </DialogTitle>
          </DialogHeader>
          <div className="px-4 pb-6">
            <ROICalculatorUI showSidebar={false} />
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  // Card variant
  return (
    <ToolCardWrapper
      title="ROI Calculator"
      description="Calculate the ROI for your business."
      icon={<Calculator className="size-4" />}
    >
      <ROICalculatorUI />
    </ToolCardWrapper>
  )
}
