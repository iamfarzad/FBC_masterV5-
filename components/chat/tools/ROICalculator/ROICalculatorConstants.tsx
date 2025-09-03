import type { ROICalculatorProps, WizardStep } from "./ROICalculator.types"

// Wizard step constants
export const WIZARD_STEPS: WizardStep[] = ["company-info", "metrics", "results"];

// Default form data
export const DEFAULT_FORM_DATA = {
  initialInvestment: 5000,
  monthlyRevenue: 10000,
  monthlyExpenses: 6500,
  timePeriod: 12
};

// Default company info
export const DEFAULT_COMPANY_INFO = {
  companySize: "",
  industry: "",
  useCase: ""
};

// Field labels mapping
export const FIELD_LABELS: Record<string, string> = {
  initialInvestment: "Initial Investment ($)",
  monthlyRevenue: "Monthly Revenue ($)",
  monthlyExpenses: "Monthly Expenses ($)",
  timePeriod: "Time Period (months)"
};

// Company size options
export const COMPANY_SIZE_OPTIONS = [
  { value: "startup", label: "Startup (1-10 employees)" },
  { value: "small", label: "Small (11-50 employees)" },
  { value: "medium", label: "Medium (51-200 employees)" },
  { value: "large", label: "Large (200+ employees)" }
];

// Industry options
export const INDUSTRY_OPTIONS = [
  { value: "technology", label: "Technology" },
  { value: "finance", label: "Finance" },
  { value: "healthcare", label: "Healthcare" },
  { value: "retail", label: "Retail" },
  { value: "manufacturing", label: "Manufacturing" },
  { value: "other", label: "Other" }
];

// Step titles and descriptions
export const STEP_CONTENT = {
  "company-info": {
    title: "Company Information",
    description: "Tell us about your company to get started"
  },
  "metrics": {
    title: "Financial Metrics",
    description: "Enter your business metrics to calculate ROI"
  },
  "results": {
    title: "ROI Analysis Results",
    description: "Your ROI analysis is complete"
  }
};

// Progress step labels
export const PROGRESS_STEP_LABELS = {
  "company-info": "Company Info",
  "metrics": "Financial Data",
  "results": "Results"
};

// Progress step descriptions
export const PROGRESS_STEP_DESCRIPTIONS = {
  "company-info": "Basic information",
  "metrics": "Revenue & expenses",
  "results": "ROI calculation"
};

// API response type
export type ROICalculationAPIResponse = {
  roi: number;
  paybackPeriod: number | null;
  initialInvestment: number;
  monthlyRevenue: number;
  monthlyExpenses: number;
  monthlyProfit: number;
  totalRevenue: number;
  totalExpenses: number;
  totalProfit: number;
  netProfit: number;
  timePeriod: number;
  calculatedAt: string;
}

// Cache key prefix
export const CACHE_PREFIX = 'fbc:roi:';
