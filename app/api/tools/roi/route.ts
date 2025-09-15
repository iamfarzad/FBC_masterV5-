import { NextRequest } from 'next/server'
import { z } from 'zod'
import { withApiHandler, parseJson, api } from '@/src/core/api/api-utils'
import { recordCapabilityUsed } from '@/src/core/context/capabilities'
import { rateLimit } from '@/src/core/api/rate-limit'
import type { ToolRunResult } from '@/src/core/types/intelligence'

const RoiInputSchema = z.object({
  initialInvestment: z.number().min(0),
  monthlyRevenue: z.number().min(0),
  monthlyExpenses: z.number().min(0),
  timePeriod: z.number().min(1).max(60)
})

function round(n: number) { return Math.round(n * 100) / 100 }

export const POST = withApiHandler(async (req: NextRequest) => {
  const rl = rateLimit(req, { limit: 12, windowMs: 15000 })
  if (!rl.ok) {
    return new Response(JSON.stringify({ ok: false, error: 'Rate limited' }), { status: 429, headers: { 'Content-Type': 'application/json', 'Retry-After': String(Math.ceil((rl.retryAfterMs || 1000)/1000)) } })
  }
  const body = await parseJson(req)
  const data = RoiInputSchema.parse(body)

  const monthlyProfit = data.monthlyRevenue - data.monthlyExpenses
  const totalProfit = monthlyProfit * data.timePeriod
  const totalRevenue = data.monthlyRevenue * data.timePeriod
  const totalExpenses = data.monthlyExpenses * data.timePeriod
  const netProfit = totalProfit - data.initialInvestment
  const roi = ((totalProfit - data.initialInvestment) / Math.max(1, data.initialInvestment)) * 100
  const paybackPeriod = monthlyProfit > 0 ? data.initialInvestment / monthlyProfit : null

  const output = {
    roi: round(roi),
    paybackPeriod: paybackPeriod !== null ? round(paybackPeriod) : null,
    initialInvestment: round(data.initialInvestment),
    monthlyRevenue: round(data.monthlyRevenue),
    monthlyExpenses: round(data.monthlyExpenses),
    monthlyProfit: round(monthlyProfit),
    totalRevenue: round(totalRevenue),
    totalExpenses: round(totalExpenses),
    totalProfit: round(totalProfit),
    netProfit: round(netProfit),
    timePeriod: data.timePeriod,
    calculatedAt: new Date().toISOString()
  }

  // Record capability usage (non-blocking)
  const sessionId = req.headers.get('x-intelligence-session-id')
  if (sessionId) {
    recordCapabilityUsed(String(sessionId), 'roi', {
      input: data,
      output: { roi: output.roi, paybackPeriod: output.paybackPeriod }
    }).catch(() => {}) // Ignore errors
  }

  return api.success(output, 'ROI calculation completed')
})
