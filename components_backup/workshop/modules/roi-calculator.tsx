'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Calculator, TrendingUp, DollarSign } from 'lucide-react'

export function ROICalculatorModule() {
  const [investment, setInvestment] = useState('')
  const [returns, setReturns] = useState('')
  const [timeframe, setTimeframe] = useState('12')
  const [result, setResult] = useState<any>(null)

  const calculate = () => {
    const inv = parseFloat(investment) || 0
    const ret = parseFloat(returns) || 0
    const time = parseFloat(timeframe) || 12

    const profit = ret - inv
    const roi = (profit / inv) * 100
    const monthlyROI = roi / time

    setResult({
      totalROI: roi.toFixed(2),
      monthlyROI: monthlyROI.toFixed(2),
      profit: profit.toFixed(2),
      breakEven: inv > 0 ? Math.ceil(inv / (ret / time)) : 0
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="h-5 w-5" />
          ROI Calculator
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="investment">Initial Investment</Label>
          <div className="relative">
            <DollarSign className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              id="investment"
              type="number"
              placeholder="10000"
              value={investment}
              onChange={(e) => setInvestment(e.target.value)}
              className="pl-8"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="returns">Expected Returns</Label>
          <div className="relative">
            <DollarSign className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              id="returns"
              type="number"
              placeholder="15000"
              value={returns}
              onChange={(e) => setReturns(e.target.value)}
              className="pl-8"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="timeframe">Timeframe (months)</Label>
          <Input
            id="timeframe"
            type="number"
            placeholder="12"
            value={timeframe}
            onChange={(e) => setTimeframe(e.target.value)}
          />
        </div>

        <Button onClick={calculate} className="w-full">
          Calculate ROI
        </Button>

        {result && (
          <div className="mt-4 p-4 bg-muted rounded-lg">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Total ROI</p>
                <p className="text-2xl font-bold text-green-600">
                  {result.totalROI}%
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Monthly ROI</p>
                <p className="text-2xl font-bold">
                  {result.monthlyROI}%
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Net Profit</p>
                <p className="text-xl font-semibold">
                  ${result.profit}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Break Even</p>
                <p className="text-xl font-semibold">
                  Month {result.breakEven}
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}