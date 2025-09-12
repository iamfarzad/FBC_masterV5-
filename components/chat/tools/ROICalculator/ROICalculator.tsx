"use client"

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Calculator, TrendingUp, DollarSign } from 'lucide-react'

interface ROICalculatorProps {
  mode?: 'card' | 'full'
}

export function ROICalculator({ mode = 'full' }: ROICalculatorProps) {
  const [investment, setInvestment] = useState<number>(10000)
  const [revenue, setRevenue] = useState<number>(50000)
  const [months, setMonths] = useState<number>(12)

  const calculateROI = () => {
    if (investment === 0) return 0
    const monthlyRevenue = revenue / months
    const monthlyInvestment = investment / months
    const monthlyROI = ((monthlyRevenue - monthlyInvestment) / monthlyInvestment) * 100
    return Math.round(monthlyROI * months) // Annual ROI
  }

  const roi = calculateROI()
  const savings = Math.round((revenue - investment) * (roi / 100))

  if (mode === 'card') {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Calculator className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium">ROI Calculator</span>
        </div>
        <div className="grid grid-cols-2 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-primary">{roi}%</div>
            <div className="text-xs text-muted-foreground">ROI</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-green-600">${savings.toLocaleString()}</div>
            <div className="text-xs text-muted-foreground">Savings</div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="w-5 h-5" />
          AI ROI Calculator
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div>
            <Label htmlFor="investment">Initial Investment ($)</Label>
            <Input
              id="investment"
              type="number"
              value={investment}
              onChange={(e) => setInvestment(Number(e.target.value))}
              placeholder="10000"
            />
          </div>

          <div>
            <Label htmlFor="revenue">Expected Revenue ($)</Label>
            <Input
              id="revenue"
              type="number"
              value={revenue}
              onChange={(e) => setRevenue(Number(e.target.value))}
              placeholder="50000"
            />
          </div>

          <div>
            <Label htmlFor="months">Payback Period (months)</Label>
            <Input
              id="months"
              type="number"
              value={months}
              onChange={(e) => setMonths(Number(e.target.value))}
              placeholder="12"
            />
          </div>
        </div>

        <div className="space-y-4 pt-4 border-t">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">ROI</span>
            <Badge variant="outline" className="text-green-600">
              <TrendingUp className="w-3 h-3 mr-1" />
              {roi}%
            </Badge>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Annual Savings</span>
            <Badge variant="outline" className="text-green-600">
              <DollarSign className="w-3 h-3 mr-1" />
              ${savings.toLocaleString()}
            </Badge>
          </div>
        </div>

        <Button className="w-full">
          Calculate Custom ROI
        </Button>
      </CardContent>
    </Card>
  )
}
