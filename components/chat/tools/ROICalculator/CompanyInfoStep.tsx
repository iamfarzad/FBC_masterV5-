"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { COMPANY_SIZE_OPTIONS, INDUSTRY_OPTIONS } from "./ROICalculatorConstants"

interface CompanyInfo {
  companySize: string
  industry: string
  useCase: string
}

interface CompanyInfoStepProps {
  companyInfo: CompanyInfo
  onCompanyInfoChange: (companyInfo: CompanyInfo) => void
  onNext: () => void
}

export function CompanyInfoStep({
  companyInfo,
  onCompanyInfoChange,
  onNext
}: CompanyInfoStepProps) {
  const handleFieldChange = (field: keyof CompanyInfo, value: string) => {
    onCompanyInfoChange({
      ...companyInfo,
      [field]: value
    })
  }

  const isValid = companyInfo.companySize && companyInfo.industry

  return (
    <div className="space-y-4">
      <h3 className="font-semibold">Company Information</h3>
      <div>
        <Label htmlFor="companySize">Company Size</Label>
        <Select
          value={companyInfo.companySize}
          onValueChange={(value) => handleFieldChange('companySize', value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select company size" />
          </SelectTrigger>
          <SelectContent>
            {COMPANY_SIZE_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label htmlFor="industry">Industry</Label>
        <Select
          value={companyInfo.industry}
          onValueChange={(value) => handleFieldChange('industry', value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select industry" />
          </SelectTrigger>
          <SelectContent>
            {INDUSTRY_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label htmlFor="useCase">Primary Use Case</Label>
        <Input
          id="useCase"
          value={companyInfo.useCase}
          onChange={(e) => handleFieldChange('useCase', e.target.value)}
          placeholder="e.g., Process automation, Customer service, Data analysis"
        />
      </div>
      <Button
        onClick={onNext}
        className="w-full"
        disabled={!isValid}
      >
        Next: Enter Metrics
      </Button>
    </div>
  )
}
