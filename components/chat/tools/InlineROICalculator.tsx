'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Calculator, TrendingUp, DollarSign, Calendar } from 'lucide-react'

interface InlineROIProps {
  onComplete?: (result: any) => void
  className?: string
}

export function InlineROICalculator({ onComplete, className }: InlineROIProps) {
  const [formData, setFormData] = useState({
    initialInvestment: 10000,
    monthlyRevenue: 5000,
    monthlyExpenses: 3000,
    timePeriod: 12
  })
  const [result, setResult] = useState<any>(null)
  const [isCalculating, setIsCalculating] = useState(false)

  const handleCalculate = async () => {
    setIsCalculating(true)
    
    try {
      // Simulate API call
      const response = await fetch('/api/tools/roi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      
      if (!response.ok) throw new Error('Calculation failed')
      
      const data = await response.json()
      if (data?.ok && data?.output) {
        setResult(data.output)
        onComplete?.(data.output)
      }
    } catch (error) {
      console.error('ROI calculation error:', error)
    } finally {
      setIsCalculating(false)
    }
  }

  const handleFieldChange = (field: string, value: number) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    setResult(null) // Clear result when inputs change
  }

  return (
    <Card className={`border-accent/20 ${className}`}>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Calculator className="size-5 text-accent" />
          ROI Calculator
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!result ? (
          // Input Form
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="investment">Initial Investment ($)</Label>
              <Input
                id="investment"
                type="number"
                value={formData.initialInvestment}
                onChange={(e) => handleFieldChange('initialInvestment', Number(e.target.value))}
              />
            </div>
            <div>
              <Label htmlFor="revenue">Monthly Revenue ($)</Label>
              <Input
                id="revenue"
                type="number"
                value={formData.monthlyRevenue}
                onChange={(e) => handleFieldChange('monthlyRevenue', Number(e.target.value))}
              />
            </div>
            <div>
              <Label htmlFor="expenses">Monthly Expenses ($)</Label>
              <Input
                id="expenses"
                type="number"
                value={formData.monthlyExpenses}
                onChange={(e) => handleFieldChange('monthlyExpenses', Number(e.target.value))}
              />
            </div>
            <div>
              <Label htmlFor="period">Time Period (months)</Label>
              <Input
                id="period"
                type="number"
                value={formData.timePeriod}
                onChange={(e) => handleFieldChange('timePeriod', Number(e.target.value))}
              />
            </div>
          </div>
        ) : (
          // Results Display
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-accent/5 border-accent/10 rounded-lg border p-4 text-center">
                <div className="text-2xl font-bold text-accent">{result.roi}%</div>
                <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground">
                  <TrendingUp className="size-3" />
                  ROI
                </div>
              </div>
              <div className="bg-muted/50 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold">{result.paybackPeriod || '--'}</div>
                <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground">
                  <Calendar className="size-3" />
                  Payback (mo)
                </div>
              </div>
              <div className="bg-muted/50 rounded-lg p-4 text-center">
                <div className={`text-lg font-bold ${result.netProfit > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  ${result.netProfit?.toLocaleString()}
                </div>
                <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground">
                  <DollarSign className="size-3" />
                  Net Profit
                </div>
              </div>
            </div>
            
            <div className="text-center text-sm text-muted-foreground">
              Monthly profit: ${result.monthlyProfit?.toLocaleString()} | Total revenue: ${result.totalRevenue?.toLocaleString()}
            </div>
          </div>
        )}
        
        <div className="flex gap-2 pt-2">
          {!result ? (
            <Button 
              onClick={handleCalculate} 
              disabled={isCalculating}
              className="flex-1"
            >
              {isCalculating ? 'Calculating...' : 'Calculate ROI'}
            </Button>
          ) : (
            <>
              <Button 
                variant="outline" 
                onClick={() => setResult(null)}
                className="flex-1"
              >
                Recalculate
              </Button>
              <Button
                onClick={() => onComplete?.(result)}
                className="flex-1"
              >
                Use Results
              </Button>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export default InlineROICalculator
