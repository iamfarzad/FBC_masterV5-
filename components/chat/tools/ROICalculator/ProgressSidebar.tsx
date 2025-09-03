"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calculator, Check, ArrowLeft } from "@/src/core/icon-mapping"
import { WIZARD_STEPS, PROGRESS_STEP_LABELS, PROGRESS_STEP_DESCRIPTIONS, type ROICalculationAPIResponse } from "./ROICalculatorConstants"

interface ProgressSidebarProps {
  currentStep: string
  result: ROICalculationAPIResponse | null
  isRunning: boolean
  onStepBack: () => void
  onRecalculate: () => void
  onReset: () => void
  onCancel?: () => void
}

export function ProgressSidebar({
  currentStep,
  result,
  isRunning,
  onStepBack,
  onRecalculate,
  onReset,
  onCancel
}: ProgressSidebarProps) {
  const currentStepIndex = WIZARD_STEPS.indexOf(currentStep as any)

  return (
    <div className="hidden w-72 space-y-4 p-4 lg:block">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Calculator className="size-5" />
            Progress
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-2">
            {WIZARD_STEPS.map((step, index) => (
              <div key={step} className="flex items-center gap-3">
                <div className={`flex size-8 items-center justify-center rounded-full text-sm font-medium ${
                  currentStepIndex > index
                    ? 'bg-accent/10 text-accent'
                    : currentStepIndex === index
                      ? 'bg-accent/20 text-accent'
                      : 'bg-muted text-muted-foreground'
                }`}>
                  {currentStepIndex > index ? <Check className="size-4" /> : index + 1}
                </div>
                <div>
                  <p className="text-sm font-medium">
                    {PROGRESS_STEP_LABELS[step as keyof typeof PROGRESS_STEP_LABELS]}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {PROGRESS_STEP_DESCRIPTIONS[step as keyof typeof PROGRESS_STEP_DESCRIPTIONS]}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {currentStep === "results" && result && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Key Metrics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3" aria-live="polite">
            <div className="grid grid-cols-1 gap-3">
              <div className="bg-accent/10 rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-accent">{result.roi}%</div>
                <div className="text-sm text-muted-foreground">Return on Investment</div>
              </div>
              <div className="bg-accent/5 rounded-lg p-3 text-center">
                <div className="text-2xl font-bold">{result.paybackPeriod || 'N/A'}</div>
                <div className="text-sm text-muted-foreground">Payback Period (months)</div>
              </div>
              <div className="bg-accent/5 rounded-lg p-3 text-center">
                <div className="text-lg font-bold">${result.netProfit?.toLocaleString()}</div>
                <div className="text-sm text-muted-foreground">Net Profit</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Actions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {currentStep !== "company-info" && (
            <Button
              variant="outline"
              className="w-full"
              onClick={onStepBack}
            >
              <ArrowLeft className="mr-2 size-4" />
              Back
            </Button>
          )}
          <Button
            className="hover:bg-accent/90 w-full bg-accent text-accent-foreground"
            disabled={isRunning}
            onClick={onRecalculate}
          >
            Re-run Analysis
          </Button>
          <Button
            variant="outline"
            className="w-full"
            onClick={onReset}
            disabled={isRunning}
          >
            Reset Form
          </Button>
          {onCancel && (
            <Button variant="ghost" className="w-full" onClick={onCancel}>
              Cancel
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
