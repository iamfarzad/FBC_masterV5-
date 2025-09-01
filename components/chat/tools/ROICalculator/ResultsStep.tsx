"use client"

import { Button } from "@/components/ui/button"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { type ROICalculationAPIResponse } from "./ROICalculatorConstants"

interface CompanyInfo {
  companySize: string
  industry: string
  useCase: string
}

interface FormData {
  initialInvestment: number
  monthlyRevenue: number
  monthlyExpenses: number
  timePeriod: number
}

interface ResultsStepProps {
  result: ROICalculationAPIResponse | null
  companyInfo: CompanyInfo
  formData: FormData
  onComplete: (result: any) => void
}

export function ResultsStep({
  result,
  companyInfo,
  formData,
  onComplete
}: ResultsStepProps) {
  if (!result) {
    return (
      <div className="space-y-3">
        <h3 className="font-semibold">ROI Analysis Results</h3>
        <p className="text-muted-foreground">No results available</p>
      </div>
    )
  }

  const handleComplete = () => {
    const combinedResult = {
      ...companyInfo,
      estimatedROI: result.roi,
      paybackPeriod: result.paybackPeriod || 0,
      currentProcessTime: 0,
      currentCost: result.monthlyExpenses,
      automationPotential: 0,
      timeSavings: 0,
      costSavings: result.netProfit
    }
    onComplete(combinedResult)
  }

  return (
    <div className="space-y-3">
      <h3 className="font-semibold">ROI Analysis Results</h3>
      <div className="space-y-3">
        <div className="grid grid-cols-3 gap-3">
          <div className="text-center p-3 rounded-md bg-accent/10">
            <div className="text-xl font-bold text-accent">{result.roi}%</div>
            <div className="text-xs text-muted-foreground">ROI</div>
          </div>
          <div className="text-center p-3 rounded-md bg-accent/5">
            <div className="text-xl font-bold">{result.paybackPeriod ?? '—'}</div>
            <div className="text-xs text-muted-foreground">Payback (mo)</div>
          </div>
          <div className="text-center p-3 rounded-md bg-accent/5">
            <div className={`text-lg font-bold ${result.netProfit > 0 ? 'text-green-600' : 'text-red-600'}`}>
              ${result.netProfit?.toLocaleString()}
            </div>
            <div className="text-xs text-muted-foreground">Net Profit</div>
          </div>
        </div>

        <Accordion type="single" collapsible defaultValue="details">
          <AccordionItem value="details">
            <AccordionTrigger className="text-sm">Financial Breakdown</AccordionTrigger>
            <AccordionContent>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Monthly Profit</span>
                  <strong>${result.monthlyProfit?.toLocaleString()}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Revenue ({result.timePeriod} mo)</span>
                  <strong>${result.totalRevenue?.toLocaleString()}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Expenses</span>
                  <strong>${result.totalExpenses?.toLocaleString()}</strong>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
      <Button
        onClick={handleComplete}
        className="w-full"
      >
        Complete Analysis
      </Button>
    </div>
  )
}
