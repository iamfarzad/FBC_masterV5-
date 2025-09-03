'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { 
  Calculator, 
  TrendingUp, 
  DollarSign, 
  Calendar,
  BarChart3,
  PieChart,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react'
import { toast } from 'sonner'

export default function ROICalculatorPage() {
  const [formData, setFormData] = useState({
    investment: '',
    revenue: '',
    costs: '',
    timeframe: '12'
  })
  
  const [results, setResults] = useState<any>(null)
  const [isCalculating, setIsCalculating] = useState(false)

  const handleCalculate = async () => {
    if (!formData.investment || !formData.revenue) {
      toast.error('Please fill in required fields')
      return
    }

    setIsCalculating(true)
    
    try {
      const response = await fetch('/api/tools/roi-calculator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        const data = await response.json()
        setResults(data.calculation)
        toast.success('ROI calculated successfully!')
      } else {
        throw new Error('Calculation failed')
      }
    } catch (error) {
      toast.error('Failed to calculate ROI')
    } finally {
      setIsCalculating(false)
    }
  }

  return (
    <div className="min-h-screen pt-20 pb-8 px-4">
      <div className="container max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 font-space-grotesk">
            <span className="text-gradient">ROI Calculator</span>
          </h1>
          <p className="text-xl text-gray-400">
            Calculate return on investment with AI-powered insights
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Input Form */}
          <Card className="glass-dark border-gray-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="w-5 h-5 text-green-500" />
                Investment Details
              </CardTitle>
              <CardDescription>
                Enter your investment parameters
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Initial Investment *
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <Input
                    type="number"
                    placeholder="10000"
                    value={formData.investment}
                    onChange={(e) => setFormData({...formData, investment: e.target.value})}
                    className="pl-10 bg-gray-800/50"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">
                  Expected Revenue *
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <Input
                    type="number"
                    placeholder="15000"
                    value={formData.revenue}
                    onChange={(e) => setFormData({...formData, revenue: e.target.value})}
                    className="pl-10 bg-gray-800/50"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">
                  Operating Costs
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <Input
                    type="number"
                    placeholder="1000"
                    value={formData.costs}
                    onChange={(e) => setFormData({...formData, costs: e.target.value})}
                    className="pl-10 bg-gray-800/50"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">
                  Timeframe (months)
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <Input
                    type="number"
                    placeholder="12"
                    value={formData.timeframe}
                    onChange={(e) => setFormData({...formData, timeframe: e.target.value})}
                    className="pl-10 bg-gray-800/50"
                  />
                </div>
              </div>

              <Button 
                onClick={handleCalculate}
                disabled={isCalculating}
                className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
              >
                {isCalculating ? 'Calculating...' : 'Calculate ROI'}
              </Button>
            </CardContent>
          </Card>

          {/* Results */}
          <div className="space-y-6">
            {results ? (
              <>
                {/* ROI Summary */}
                <Card className="glass-dark border-gray-800">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-purple-500" />
                      ROI Analysis
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center mb-6">
                      <div className="text-5xl font-bold mb-2">
                        <span className={results.roiPercentage > 0 ? 'text-green-500' : 'text-red-500'}>
                          {results.roiPercentage > 0 ? '+' : ''}{results.roiPercentage}%
                        </span>
                      </div>
                      <p className="text-gray-400">Total Return on Investment</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="glass rounded-xl p-4">
                        <div className="flex items-center gap-2 mb-1">
                          <ArrowUpRight className="w-4 h-4 text-green-500" />
                          <span className="text-sm text-gray-400">Net Profit</span>
                        </div>
                        <p className="text-2xl font-semibold text-green-500">
                          ${results.netProfit?.toLocaleString() || '0'}
                        </p>
                      </div>

                      <div className="glass rounded-xl p-4">
                        <div className="flex items-center gap-2 mb-1">
                          <BarChart3 className="w-4 h-4 text-blue-500" />
                          <span className="text-sm text-gray-400">Monthly ROI</span>
                        </div>
                        <p className="text-2xl font-semibold text-blue-500">
                          {results.monthlyROI}%
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Insights */}
                <Card className="glass-dark border-gray-800">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <PieChart className="w-5 h-5 text-yellow-500" />
                      AI Insights
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      {results.insights?.map((insight: string, index: number) => (
                        <li key={index} className="flex items-start gap-2">
                          <Badge className="mt-0.5" variant="outline">
                            {index + 1}
                          </Badge>
                          <span className="text-sm text-gray-300">{insight}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </>
            ) : (
              <Card className="glass-dark border-gray-800">
                <CardContent className="py-12 text-center">
                  <Calculator className="w-12 h-12 mx-auto mb-4 text-gray-500" />
                  <p className="text-gray-400">
                    Enter your investment details to see ROI analysis
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}