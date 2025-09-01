"use client"

import type React from "react"
import { useState } from "react"
import { Calculator, ArrowRight, ArrowLeft, Check, X, Maximize2, Minimize2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ToolCardWrapper } from "@/components/chat/ToolCardWrapper"
import { cn } from "@/src/core/utils"
import type { ROICalculatorProps, ROICalculationResult, WizardStep } from "./ROICalculator.types"

const WIZARD_STEPS: WizardStep[] = ["company-info", "metrics", "results"];

export function ROICalculator({
  mode = 'card',
  onComplete,
  onCancel
}: ROICalculatorProps) {
  const { toast } = useToast()
  const [currentStep, setCurrentStep] = useState<WizardStep>("company-info")
  const [formData, setFormData] = useState({
    currentCosts: 5000,
    projectedSavings: 3500,
    implementationCost: 500,
    timeFrameMonths: 12
  })
  const [result, setResult] = useState<ROICalculationResult | null>(null)

  const handleCalculate = async () => {
    try {
      const response = await fetch('/api/tools/roi-calculation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (!response.ok) throw new Error("Calculation failed");
      const data = await response.json();
      setResult(data.data);
      setCurrentStep("results");
      toast({ title: "Calculation Complete" });
    } catch (error) {
      toast({ title: "Error", description: (error as Error).message, variant: "destructive" });
    }
  }

  const renderStep = () => {
    switch (currentStep) {
      case "metrics":
        return (
          <div className="space-y-4">
            <h3 className="font-semibold">Enter Metrics</h3>
            {Object.entries(formData).map(([key, value]) => (
              <div key={key}>
                <Label htmlFor={key}>{key.replace(/([A-Z])/g, ' $1').trim()}</Label>
                <Input
                  id={key}
                  type="number"
                  value={value}
                  onChange={(e) => setFormData(prev => ({ ...prev, [key]: Number(e.target.value) }))}
                />
              </div>
            ))}
            <Button onClick={handleCalculate} className="w-full">Calculate ROI</Button>
          </div>
        )
      case "results":
        return (
          <div className="space-y-4">
            <h3 className="font-semibold">Results</h3>
            {result && Object.entries(result).map(([key, value]) => (
              <div key={key} className="flex justify-between">
                <span>{key.replace(/([A-Z])/g, ' $1').trim()}:</span>
                <strong>{typeof value === 'number' ? value.toFixed(2) : value}</strong>
              </div>
            ))}
            <Button onClick={() => onComplete?.(result!)} className="w-full">Complete</Button>
          </div>
        )
      default: // company-info and fallback
        return (
          <div className="space-y-4">
            <h3 className="font-semibold">Company Info</h3>
            <p>This step is for collecting company information.</p>
            <Button onClick={() => setCurrentStep("metrics")} className="w-full">Next</Button>
          </div>
        )
    }
  }

  return (
    <ToolCardWrapper title="ROI Calculator" description="Calculate the ROI for your business." icon={Calculator}>
      <div className="p-4">
        {renderStep()}
        <div className="flex justify-between mt-4">
            {currentStep !== "company-info" && <Button variant="ghost" onClick={() => setCurrentStep(WIZARD_STEPS[WIZARD_STEPS.indexOf(currentStep) - 1])}>Back</Button>}
            {onCancel && <Button variant="destructive" onClick={onCancel}>Cancel</Button>}
        </div>
      </div>
    </ToolCardWrapper>
  )
}
