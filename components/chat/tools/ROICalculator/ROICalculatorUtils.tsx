import { CACHE_PREFIX, DEFAULT_FORM_DATA, DEFAULT_COMPANY_INFO } from "./ROICalculatorConstants"
import { type ROICalculationAPIResponse } from "./ROICalculatorConstants"

// Generate cache key for form data
export function generateCacheKey(sessionId: string | undefined, formData: any): string {
  const key = `${sessionId || 'anon'}:${formData.initialInvestment}:${formData.monthlyRevenue}:${formData.monthlyExpenses}:${formData.timePeriod}`
  return `${CACHE_PREFIX}${key}`
}

// Load cached result from localStorage
export function loadCachedResult(cacheKey: string): ROICalculationAPIResponse | null {
  try {
    const raw = localStorage.getItem(cacheKey)
    if (raw) {
      const cached = JSON.parse(raw) as { output: ROICalculationAPIResponse, ts: number }
      return cached.output
    }
  } catch {
    // Cache read failed - continue without cached data
  }
  return null
}

// Save result to localStorage cache
export function saveCachedResult(cacheKey: string, result: ROICalculationAPIResponse): void {
  try {
    localStorage.setItem(cacheKey, JSON.stringify({ output: result, ts: Date.now() }))
  } catch {
    // Cache operation failed - continue
  }
}

// Clear all cached ROI results
export function clearAllCachedResults(): void {
  try {
    const keys = Object.keys(localStorage).filter(key => key.startsWith(CACHE_PREFIX))
    keys.forEach(key => localStorage.removeItem(key))
  } catch {
    // Cache operation failed - continue
  }
}

// Reset form data to defaults
export function createDefaultFormData(defaults?: any) {
  return {
    ...DEFAULT_FORM_DATA,
    ...(defaults || {})
  }
}

// Reset company info to defaults
export function createDefaultCompanyInfo(defaults?: any) {
  return {
    ...DEFAULT_COMPANY_INFO,
    ...(defaults || {})
  }
}

// Validate form data
export function validateFormData(formData: any): boolean {
  return Object.values(formData).every(value => value > 0)
}

// Validate company info
export function validateCompanyInfo(companyInfo: any): boolean {
  return Boolean(companyInfo.companySize && companyInfo.industry)
}
