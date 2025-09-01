"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { FIELD_LABELS } from "./ROICalculatorConstants"

interface FormData {
  initialInvestment: number
  monthlyRevenue: number
  monthlyExpenses: number
  timePeriod: number
}

interface MetricsStepProps {
  formData: FormData
  onFormDataChange: (formData: FormData) => void
  onCalculate: () => void
  isRunning: boolean
}

export function MetricsStep({
  formData,
  onFormDataChange,
  onCalculate,
  isRunning
}: MetricsStepProps) {
  const handleFieldChange = (field: keyof FormData, value: number) => {
    onFormDataChange({
      ...formData,
      [field]: value
    })
  }

  const isValid = Object.values(formData).every(value => value > 0)

  return (
    <div className="space-y-4">
      <h3 className="font-semibold">Financial Metrics</h3>
      <p className="text-sm text-muted-foreground">Enter your business metrics to calculate ROI</p>
      {Object.entries(formData).map(([key, value]) => (
        <div key={key}>
          <Label htmlFor={key}>{FIELD_LABELS[key] || key}</Label>
          <Input
            id={key}
            type="number"
            value={value}
            onChange={(e) => handleFieldChange(key as keyof FormData, Number(e.target.value))}
            min="0"
            step={key === 'timePeriod' ? '1' : '0.01'}
            disabled={isRunning}
          />
        </div>
      ))}
      <Button
        onClick={onCalculate}
        className="w-full"
        disabled={!isValid || isRunning}
      >
        Calculate ROI
      </Button>
    </div>
  )
}
