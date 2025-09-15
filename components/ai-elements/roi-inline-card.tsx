"use client"

import React, { useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToolActions } from '@/hooks/use-tool-actions'

interface RoiResult {
  roi: number
  paybackPeriod: number | null
  initialInvestment: number
  monthlyRevenue: number
  monthlyExpenses: number
  monthlyProfit: number
  totalRevenue: number
  totalExpenses: number
  totalProfit: number
  netProfit: number
  timePeriod: number
  calculatedAt: string
}

export const ROIInlineCard: React.FC = () => {
  const { callTool } = useToolActions()
  const [initialInvestment, setInitialInvestment] = useState('10000')
  const [monthlyRevenue, setMonthlyRevenue] = useState('5000')
  const [monthlyExpenses, setMonthlyExpenses] = useState('2000')
  const [timePeriod, setTimePeriod] = useState('12')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<RoiResult | null>(null)

  const calc = useCallback(async () => {
    const inv = Number(initialInvestment)
    const rev = Number(monthlyRevenue)
    const exp = Number(monthlyExpenses)
    const months = Number(timePeriod)
    if ([inv, rev, exp, months].some(n => !Number.isFinite(n) || n < 0) || months === 0) return
    setLoading(true)
    try {
      const res = await callTool('/api/tools/roi', {
        initialInvestment: inv,
        monthlyRevenue: rev,
        monthlyExpenses: exp,
        timePeriod: months
      })
      if (res.ok && res.output) {
        setResult(res.output as RoiResult)
      }
    } finally {
      setLoading(false)
    }
  }, [callTool, initialInvestment, monthlyRevenue, monthlyExpenses, timePeriod])

  return (
    <Card className="p-3 border-accent/30 bg-accent/5 rounded-xl">
      <div className="text-sm font-medium mb-2">ROI Calculator</div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <Label className="text-xs">Initial Investment ($)</Label>
          <Input value={initialInvestment} onChange={e => setInitialInvestment(e.target.value)} className="h-8" />
        </div>
        <div>
          <Label className="text-xs">Monthly Revenue ($)</Label>
          <Input value={monthlyRevenue} onChange={e => setMonthlyRevenue(e.target.value)} className="h-8" />
        </div>
        <div>
          <Label className="text-xs">Monthly Expenses ($)</Label>
          <Input value={monthlyExpenses} onChange={e => setMonthlyExpenses(e.target.value)} className="h-8" />
        </div>
        <div>
          <Label className="text-xs">Time Period (months)</Label>
          <Input value={timePeriod} onChange={e => setTimePeriod(e.target.value)} className="h-8" />
        </div>
      </div>
      <div className="mt-2 flex items-center gap-2">
        <Button size="sm" onClick={calc} disabled={loading} className="h-8">
          {loading ? 'Calculating…' : 'Calculate ROI'}
        </Button>
      </div>
      {result && (
        <div className="mt-3 text-xs grid grid-cols-2 gap-2">
          <div><span className="text-muted-foreground">ROI:</span> <span className="font-medium">{result.roi}%</span></div>
          <div><span className="text-muted-foreground">Payback:</span> <span className="font-medium">{result.paybackPeriod !== null ? `${result.paybackPeriod} mo` : 'n/a'}</span></div>
          <div><span className="text-muted-foreground">Monthly Profit:</span> <span className="font-medium">${result.monthlyProfit}</span></div>
          <div><span className="text-muted-foreground">Net Profit:</span> <span className="font-medium">${result.netProfit}</span></div>
          <div><span className="text-muted-foreground">Total Revenue:</span> <span className="font-medium">${result.totalRevenue}</span></div>
          <div><span className="text-muted-foreground">Total Expenses:</span> <span className="font-medium">${result.totalExpenses}</span></div>
        </div>
      )}
    </Card>
  )
}

