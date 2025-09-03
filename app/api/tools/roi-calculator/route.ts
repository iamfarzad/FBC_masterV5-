import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { investment, timeframe, revenue, costs } = body

    if (!investment || !timeframe) {
      return NextResponse.json(
        { error: 'Investment amount and timeframe are required' },
        { status: 400 }
      )
    }

    // Calculate ROI
    const totalRevenue = revenue || investment * 1.5 // Default 50% return
    const totalCosts = costs || investment * 0.1 // Default 10% operational costs
    const netProfit = totalRevenue - investment - totalCosts
    const roiPercentage = ((netProfit / investment) * 100).toFixed(2)
    const monthlyROI = (parseFloat(roiPercentage) / timeframe).toFixed(2)

    const calculation = {
      investment: parseFloat(investment),
      timeframe: parseInt(timeframe),
      totalRevenue,
      totalCosts,
      netProfit,
      roiPercentage: parseFloat(roiPercentage),
      monthlyROI: parseFloat(monthlyROI),
      breakEvenMonth: Math.ceil(investment / (totalRevenue / timeframe)),
      insights: [
        `Your ROI is ${roiPercentage}% over ${timeframe} months`,
        `Monthly average return: ${monthlyROI}%`,
        `Break-even point: Month ${Math.ceil(investment / (totalRevenue / timeframe))}`,
        netProfit > 0 ? 'This investment shows positive returns' : 'Consider reviewing your investment strategy'
      ]
    }

    return NextResponse.json({
      success: true,
      calculation,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('ROI Calculator API error:', error)
    return NextResponse.json(
      { error: 'Failed to calculate ROI' },
      { status: 500 }
    )
  }
}