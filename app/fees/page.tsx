"use client"

import { useState, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { motion } from "framer-motion"
import { 
  Calculator,
  DollarSign,
  Plus,
  Trash2,
  FileText,
  Download,
  ChevronRight,
  Info
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Sidebar } from "@/components/layout/sidebar"
import { JurisdictionSelect } from "@/components/codes/jurisdiction-select"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

interface PermitEntry {
  id: string
  type: string
  valuation?: number
  quantity?: number
}

const permitTypes = [
  { value: "building", label: "Building Permit", feeType: "valuation" },
  { value: "electrical", label: "Electrical Permit", feeType: "circuits" },
  { value: "plumbing", label: "Plumbing Permit", feeType: "fixtures" },
  { value: "mechanical", label: "Mechanical Permit", feeType: "flat" },
  { value: "roofing", label: "Roofing Permit", feeType: "sqft" },
  { value: "deck", label: "Deck Permit", feeType: "sqft" },
  { value: "demolition", label: "Demolition Permit", feeType: "flat" },
]

// Mock fee calculation - would be replaced with actual jurisdiction data
function calculateFee(type: string, valuation?: number, quantity?: number): { base: number, planReview: number, total: number } {
  const permitConfig = permitTypes.find(p => p.value === type)
  if (!permitConfig) return { base: 0, planReview: 0, total: 0 }

  let base = 0
  
  switch (permitConfig.feeType) {
    case "valuation":
      // Minneapolis-style valuation-based fee
      if (valuation) {
        if (valuation <= 500) base = 50
        else if (valuation <= 2000) base = 50 + ((valuation - 500) / 100) * 3.5
        else if (valuation <= 25000) base = 102.50 + ((valuation - 2000) / 1000) * 14
        else if (valuation <= 50000) base = 424.50 + ((valuation - 25000) / 1000) * 10
        else base = 674.50 + ((valuation - 50000) / 1000) * 7
      }
      break
    case "circuits":
      base = 50 + (quantity || 0) * 8
      break
    case "fixtures":
      base = 50 + (quantity || 0) * 12
      break
    case "sqft":
      base = 75 + ((quantity || 0) / 100) * 5
      break
    case "flat":
      base = type === "mechanical" ? 75 : 150
      break
  }

  const planReview = base * 0.65 // 65% plan review fee
  return { base: Math.round(base), planReview: Math.round(planReview), total: Math.round(base + planReview) }
}

function FeeCalculatorContent() {
  const searchParams = useSearchParams()
  const [jurisdiction, setJurisdiction] = useState<string | null>(
    searchParams.get("jurisdiction") || "minneapolis"
  )
  const [permits, setPermits] = useState<PermitEntry[]>([
    { id: "1", type: "building", valuation: 25000 }
  ])

  const addPermit = () => {
    setPermits(prev => [...prev, { 
      id: Date.now().toString(), 
      type: "electrical",
      quantity: 5
    }])
  }

  const removePermit = (id: string) => {
    setPermits(prev => prev.filter(p => p.id !== id))
  }

  const updatePermit = (id: string, updates: Partial<PermitEntry>) => {
    setPermits(prev => prev.map(p => 
      p.id === id ? { ...p, ...updates } : p
    ))
  }

  const getPermitConfig = (type: string) => permitTypes.find(p => p.value === type)

  const calculateTotals = () => {
    let totalBase = 0
    let totalPlanReview = 0
    let grandTotal = 0

    permits.forEach(permit => {
      const fees = calculateFee(permit.type, permit.valuation, permit.quantity)
      totalBase += fees.base
      totalPlanReview += fees.planReview
      grandTotal += fees.total
    })

    return { totalBase, totalPlanReview, grandTotal }
  }

  const totals = calculateTotals()

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      
      <main className="flex-1 overflow-auto">
        <div className="mx-auto max-w-4xl px-6 py-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="mb-8"
          >
            <h1 className="text-3xl font-bold mb-2">Fee Calculator</h1>
            <p className="text-muted-foreground">
              Estimate permit fees based on your project scope and jurisdiction fee schedules.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Calculator Form */}
            <div className="lg:col-span-2 space-y-6">
              {/* Jurisdiction */}
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-sm font-medium">Jurisdiction</Label>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Fee schedules vary by location
                      </p>
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-surface-2 border border-border">
                      <JurisdictionSelect 
                        value={jurisdiction}
                        onChange={setJurisdiction}
                        placeholder="Select jurisdiction"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Permits */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold">Permits</h2>
                  <Button variant="outline" size="sm" onClick={addPermit}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Permit
                  </Button>
                </div>

                {permits.map((permit, index) => {
                  const config = getPermitConfig(permit.type)
                  const fees = calculateFee(permit.type, permit.valuation, permit.quantity)
                  
                  return (
                    <motion.div
                      key={permit.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Card>
                        <CardContent className="p-4">
                          <div className="flex items-start gap-4">
                            <div className="flex-1 space-y-4">
                              <div className="grid grid-cols-2 gap-4">
                                {/* Permit Type */}
                                <div>
                                  <Label className="text-xs text-muted-foreground mb-1.5 block">
                                    Permit Type
                                  </Label>
                                  <Select
                                    value={permit.type}
                                    onValueChange={(value) => updatePermit(permit.id, { type: value })}
                                  >
                                    <SelectTrigger>
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {permitTypes.map((type) => (
                                        <SelectItem key={type.value} value={type.value}>
                                          {type.label}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>

                                {/* Value Input */}
                                <div>
                                  <Label className="text-xs text-muted-foreground mb-1.5 block">
                                    {config?.feeType === "valuation" && "Project Valuation ($)"}
                                    {config?.feeType === "circuits" && "Number of Circuits"}
                                    {config?.feeType === "fixtures" && "Number of Fixtures"}
                                    {config?.feeType === "sqft" && "Square Footage"}
                                    {config?.feeType === "flat" && "Flat Fee"}
                                  </Label>
                                  {config?.feeType === "flat" ? (
                                    <div className="h-9 flex items-center px-3 rounded-md bg-surface-2 border border-border text-sm text-muted-foreground">
                                      Fixed fee
                                    </div>
                                  ) : (
                                    <Input
                                      type="number"
                                      value={config?.feeType === "valuation" ? permit.valuation : permit.quantity}
                                      onChange={(e) => {
                                        const value = parseInt(e.target.value) || 0
                                        if (config?.feeType === "valuation") {
                                          updatePermit(permit.id, { valuation: value })
                                        } else {
                                          updatePermit(permit.id, { quantity: value })
                                        }
                                      }}
                                      placeholder={config?.feeType === "valuation" ? "25000" : "5"}
                                    />
                                  )}
                                </div>
                              </div>

                              {/* Fee Breakdown */}
                              <div className="flex items-center gap-4 pt-2 border-t border-border text-sm">
                                <div className="flex items-center gap-1.5">
                                  <span className="text-muted-foreground">Base:</span>
                                  <span className="font-medium">${fees.base}</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                  <span className="text-muted-foreground">Plan Review:</span>
                                  <span className="font-medium">${fees.planReview}</span>
                                </div>
                                <div className="flex items-center gap-1.5 ml-auto">
                                  <span className="text-muted-foreground">Subtotal:</span>
                                  <span className="font-semibold text-emerald-400">${fees.total}</span>
                                </div>
                              </div>
                            </div>

                            {/* Remove Button */}
                            {permits.length > 1 && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="shrink-0 text-muted-foreground hover:text-destructive"
                                onClick={() => removePermit(permit.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  )
                })}
              </div>
            </div>

            {/* Summary Sidebar */}
            <div className="space-y-4">
              <Card className="sticky top-6">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calculator className="h-5 w-5" />
                    Fee Summary
                  </CardTitle>
                  <CardDescription>
                    Estimated fees for {jurisdiction || "selected jurisdiction"}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Breakdown */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Permit Fees</span>
                      <span className="font-medium">${totals.totalBase}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-1">
                        <span className="text-muted-foreground">Plan Review (65%)</span>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger>
                              <Info className="h-3.5 w-3.5 text-muted-foreground" />
                            </TooltipTrigger>
                            <TooltipContent>
                              Plan review fees are typically 65% of permit fees
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                      <span className="font-medium">${totals.totalPlanReview}</span>
                    </div>
                    <div className="pt-3 border-t border-border">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold">Estimated Total</span>
                        <span className="text-2xl font-bold text-emerald-400">
                          ${totals.grandTotal}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Disclaimer */}
                  <div className="p-3 rounded-lg bg-amber-500/5 border border-amber-500/20">
                    <p className="text-xs text-muted-foreground">
                      <strong className="text-amber-400">Note:</strong> These are estimates based on 
                      standard fee schedules. Actual fees may vary. Contact the building department 
                      for exact amounts.
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="space-y-2 pt-2">
                    <Button className="w-full" variant="outline">
                      <Download className="h-4 w-4 mr-2" />
                      Export Estimate
                    </Button>
                    <Button className="w-full" variant="ghost" asChild>
                      <a href={`/jurisdictions/${jurisdiction}`}>
                        View Fee Schedule
                        <ChevronRight className="h-4 w-4 ml-2" />
                      </a>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default function FeeCalculatorPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen bg-background">
        <Sidebar />
        <main className="flex-1 flex items-center justify-center">
          <div className="animate-pulse text-muted-foreground">Loading...</div>
        </main>
      </div>
    }>
      <FeeCalculatorContent />
    </Suspense>
  )
}
