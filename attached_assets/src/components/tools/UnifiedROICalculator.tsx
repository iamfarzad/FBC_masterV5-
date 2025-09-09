"use client"

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';
import { 
  Calculator, 
  TrendingUp, 
  DollarSign, 
  Clock, 
  BarChart3, 
  ArrowRight,
  CheckCircle,
  ArrowLeft,
  Download,
  RefreshCw
} from 'lucide-react';

interface CompanyInfo {
  name: string;
  industry: string;
  size: string;
  currentRevenue: number;
}

interface MetricsData {
  initialInvestment: number;
  monthlyRevenue: number;
  monthlyCosts: number;
  timePeriod: number;
  automationSavings: number;
  efficiencyGains: number;
}

interface ROIResults {
  roi: number;
  paybackPeriod: number;
  netProfit: number;
  breakEvenPoint: number;
  projectedSavings: number;
  confidenceScore: number;
}

type CalculatorStep = 'company-info' | 'metrics' | 'results';

interface UnifiedROICalculatorProps {
  onComplete?: (results: ROIResults) => void;
  onClose?: () => void;
  className?: string;
}

const INDUSTRY_OPTIONS = [
  'Technology', 'Healthcare', 'Finance', 'Manufacturing', 
  'Retail', 'Education', 'Real Estate', 'Other'
];

const COMPANY_SIZES = [
  'Startup (1-10)', 'Small (11-50)', 'Medium (51-200)', 
  'Large (201-1000)', 'Enterprise (1000+)'
];

function generateCacheKey(data: Partial<CompanyInfo & MetricsData>): string {
  return btoa(JSON.stringify(data)).slice(0, 16);
}

function validateCompanyInfo(info: CompanyInfo): boolean {
  return !!(info.name && info.industry && info.size && info.currentRevenue > 0);
}

function validateMetricsData(metrics: MetricsData): boolean {
  return !!(
    metrics.initialInvestment > 0 &&
    metrics.monthlyRevenue >= 0 &&
    metrics.monthlyCosts >= 0 &&
    metrics.timePeriod > 0
  );
}

async function calculateROI(companyInfo: CompanyInfo, metrics: MetricsData): Promise<ROIResults> {
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  const totalRevenue = metrics.monthlyRevenue * metrics.timePeriod;
  const totalCosts = metrics.monthlyCosts * metrics.timePeriod;
  const totalSavings = (metrics.automationSavings + metrics.efficiencyGains) * metrics.timePeriod;
  const netProfit = totalRevenue + totalSavings - totalCosts - metrics.initialInvestment;
  const roi = ((netProfit) / metrics.initialInvestment) * 100;
  const paybackPeriod = metrics.initialInvestment / (metrics.monthlyRevenue + (metrics.automationSavings / 12));
  
  return {
    roi: Math.round(roi),
    paybackPeriod: Math.round(paybackPeriod * 10) / 10,
    netProfit: Math.round(netProfit),
    breakEvenPoint: Math.round(paybackPeriod * 12),
    projectedSavings: Math.round(totalSavings),
    confidenceScore: Math.min(95, Math.max(65, 85 + (roi > 100 ? 10 : 0)))
  };
}

export function UnifiedROICalculator({ onComplete, onClose, className = "" }: UnifiedROICalculatorProps) {
  const [currentStep, setCurrentStep] = useState<CalculatorStep>('company-info');
  const [isCalculating, setIsCalculating] = useState(false);
  
  const [companyInfo, setCompanyInfo] = useState<CompanyInfo>({
    name: '',
    industry: '',
    size: '',
    currentRevenue: 0
  });
  
  const [metrics, setMetrics] = useState<MetricsData>({
    initialInvestment: 0,
    monthlyRevenue: 0,
    monthlyCosts: 0,
    timePeriod: 12,
    automationSavings: 0,
    efficiencyGains: 0
  });
  
  const [results, setResults] = useState<ROIResults | null>(null);

  const handleCompanyInfoSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (validateCompanyInfo(companyInfo)) {
      setCurrentStep('metrics');
    }
  }, [companyInfo]);

  const handleMetricsSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (validateMetricsData(metrics)) {
      setIsCalculating(true);
      try {
        const calculatedResults = await calculateROI(companyInfo, metrics);
        setResults(calculatedResults);
        setCurrentStep('results');
        
        // Mark capability as used
        if (typeof window !== 'undefined' && (window as any).markCapabilityUsed) {
          (window as any).markCapabilityUsed('roi');
        }
      } catch (error) {
        console.error('ROI calculation failed:', error);
      } finally {
        setIsCalculating(false);
      }
    }
  }, [companyInfo, metrics]);

  const handleReset = useCallback(() => {
    setCurrentStep('company-info');
    setCompanyInfo({ name: '', industry: '', size: '', currentRevenue: 0 });
    setMetrics({
      initialInvestment: 0,
      monthlyRevenue: 0,
      monthlyCosts: 0,
      timePeriod: 12,
      automationSavings: 0,
      efficiencyGains: 0
    });
    setResults(null);
  }, []);

  const renderCompanyInfoStep = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
    >
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="w-5 h-5" />
          Company Information
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleCompanyInfoSubmit} className="space-y-4">
          <div>
            <Label htmlFor="company-name">Company Name</Label>
            <Input
              id="company-name"
              value={companyInfo.name}
              onChange={(e) => setCompanyInfo(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Enter your company name"
              required
              className="glass-button"
            />
          </div>
          
          <div>
            <Label htmlFor="industry">Industry</Label>
            <select
              id="industry"
              value={companyInfo.industry}
              onChange={(e) => setCompanyInfo(prev => ({ ...prev, industry: e.target.value }))}
              required
              className="w-full p-2 rounded-lg glass-button bg-background border border-border"
            >
              <option value="">Select industry</option>
              {INDUSTRY_OPTIONS.map(industry => (
                <option key={industry} value={industry}>{industry}</option>
              ))}
            </select>
          </div>
          
          <div>
            <Label htmlFor="company-size">Company Size</Label>
            <select
              id="company-size"
              value={companyInfo.size}
              onChange={(e) => setCompanyInfo(prev => ({ ...prev, size: e.target.value }))}
              required
              className="w-full p-2 rounded-lg glass-button bg-background border border-border"
            >
              <option value="">Select company size</option>
              {COMPANY_SIZES.map(size => (
                <option key={size} value={size}>{size}</option>
              ))}
            </select>
          </div>
          
          <div>
            <Label htmlFor="current-revenue">Annual Revenue ($)</Label>
            <Input
              id="current-revenue"
              type="number"
              value={companyInfo.currentRevenue || ''}
              onChange={(e) => setCompanyInfo(prev => ({ ...prev, currentRevenue: Number(e.target.value) }))}
              placeholder="0"
              min="0"
              required
              className="glass-button"
            />
          </div>
          
          <Button type="submit" className="w-full glass-button">
            Continue to Metrics <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </form>
      </CardContent>
    </motion.div>
  );

  const renderMetricsStep = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
    >
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5" />
          Financial Metrics
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleMetricsSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="initial-investment">Initial Investment ($)</Label>
              <Input
                id="initial-investment"
                type="number"
                value={metrics.initialInvestment || ''}
                onChange={(e) => setMetrics(prev => ({ ...prev, initialInvestment: Number(e.target.value) }))}
                placeholder="0"
                min="0"
                required
                className="glass-button"
              />
            </div>
            
            <div>
              <Label htmlFor="time-period">Time Period (months)</Label>
              <Input
                id="time-period"
                type="number"
                value={metrics.timePeriod}
                onChange={(e) => setMetrics(prev => ({ ...prev, timePeriod: Number(e.target.value) }))}
                min="1"
                max="60"
                required
                className="glass-button"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="monthly-revenue">Expected Monthly Revenue ($)</Label>
              <Input
                id="monthly-revenue"
                type="number"
                value={metrics.monthlyRevenue || ''}
                onChange={(e) => setMetrics(prev => ({ ...prev, monthlyRevenue: Number(e.target.value) }))}
                placeholder="0"
                min="0"
                className="glass-button"
              />
            </div>
            
            <div>
              <Label htmlFor="monthly-costs">Monthly Operating Costs ($)</Label>
              <Input
                id="monthly-costs"
                type="number"
                value={metrics.monthlyCosts || ''}
                onChange={(e) => setMetrics(prev => ({ ...prev, monthlyCosts: Number(e.target.value) }))}
                placeholder="0"
                min="0"
                className="glass-button"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="automation-savings">Annual Automation Savings ($)</Label>
              <Input
                id="automation-savings"
                type="number"
                value={metrics.automationSavings || ''}
                onChange={(e) => setMetrics(prev => ({ ...prev, automationSavings: Number(e.target.value) }))}
                placeholder="0"
                min="0"
                className="glass-button"
              />
            </div>
            
            <div>
              <Label htmlFor="efficiency-gains">Annual Efficiency Gains ($)</Label>
              <Input
                id="efficiency-gains"
                type="number"
                value={metrics.efficiencyGains || ''}
                onChange={(e) => setMetrics(prev => ({ ...prev, efficiencyGains: Number(e.target.value) }))}
                placeholder="0"
                min="0"
                className="glass-button"
              />
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setCurrentStep('company-info')}
              className="glass-button"
            >
              <ArrowLeft className="w-4 h-4 mr-2" /> Back
            </Button>
            <Button type="submit" className="flex-1 glass-button" disabled={isCalculating}>
              {isCalculating ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Calculating...
                </>
              ) : (
                <>
                  Calculate ROI <TrendingUp className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </motion.div>
  );

  const renderResultsStep = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
    >
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5" />
          ROI Analysis Results
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {results && (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div className="glass-card p-4 text-center">
                <DollarSign className="w-8 h-8 mx-auto mb-2 text-green-500" />
                <div className="text-2xl font-bold text-green-500">{results.roi}%</div>
                <div className="text-sm text-muted-foreground">Return on Investment</div>
              </div>
              
              <div className="glass-card p-4 text-center">
                <Clock className="w-8 h-8 mx-auto mb-2 text-blue-500" />
                <div className="text-2xl font-bold text-blue-500">{results.paybackPeriod}</div>
                <div className="text-sm text-muted-foreground">Months to Break Even</div>
              </div>
            </div>
            
            <Separator />
            
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Net Profit:</span>
                <span className="font-medium">${results.netProfit.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Projected Savings:</span>
                <span className="font-medium">${results.projectedSavings.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Confidence Score:</span>
                <Badge variant={results.confidenceScore > 80 ? 'default' : 'secondary'}>
                  {results.confidenceScore}%
                </Badge>
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleReset} className="glass-button">
                <RefreshCw className="w-4 h-4 mr-2" />
                Recalculate
              </Button>
              <Button 
                onClick={() => onComplete?.(results)} 
                className="flex-1 glass-button"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Complete Analysis
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </motion.div>
  );

  return (
    <div className={`max-w-2xl mx-auto p-6 ${className}`}>
      <Card className="glass-card">
        <AnimatePresence mode="wait">
          {currentStep === 'company-info' && renderCompanyInfoStep()}
          {currentStep === 'metrics' && renderMetricsStep()}
          {currentStep === 'results' && renderResultsStep()}
        </AnimatePresence>
      </Card>
    </div>
  );
}