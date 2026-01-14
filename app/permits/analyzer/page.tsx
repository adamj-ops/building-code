"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  FileText,
  ChevronRight,
  ChevronDown,
  CheckCircle2,
  AlertCircle,
  Zap,
  Wrench,
  Thermometer,
  Building2,
  Home,
  Hammer,
  Plus,
  Minus,
  Sparkles,
  ArrowRight
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Sidebar } from "@/components/layout/sidebar"
import { JurisdictionSelect } from "@/components/codes/jurisdiction-select"
import { cn } from "@/lib/utils"

interface ScopeItem {
  id: string
  label: string
  description?: string
  checked: boolean
  permitTypes: string[]
}

interface ScopeCategory {
  id: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  items: ScopeItem[]
  expanded: boolean
}

const initialCategories: ScopeCategory[] = [
  {
    id: "electrical",
    label: "Electrical",
    icon: Zap,
    expanded: true,
    items: [
      { id: "panel_upgrade", label: "Panel upgrade", description: "Upgrading service to 200A or higher", checked: false, permitTypes: ["electrical"] },
      { id: "new_circuits", label: "New circuits", description: "Adding new circuit breakers", checked: false, permitTypes: ["electrical"] },
      { id: "outlet_installation", label: "Outlet installation", description: "Adding new outlets or switches", checked: false, permitTypes: ["electrical"] },
      { id: "ev_charger", label: "EV charger installation", checked: false, permitTypes: ["electrical"] },
      { id: "generator", label: "Generator hookup", checked: false, permitTypes: ["electrical"] },
    ]
  },
  {
    id: "plumbing",
    label: "Plumbing",
    icon: Wrench,
    expanded: false,
    items: [
      { id: "water_heater", label: "Water heater replacement", checked: false, permitTypes: ["plumbing"] },
      { id: "new_fixtures", label: "New fixtures", description: "Adding sinks, toilets, showers", checked: false, permitTypes: ["plumbing"] },
      { id: "water_line", label: "Water line work", checked: false, permitTypes: ["plumbing"] },
      { id: "sewer_line", label: "Sewer line work", checked: false, permitTypes: ["plumbing"] },
      { id: "gas_line", label: "Gas line work", checked: false, permitTypes: ["plumbing", "mechanical"] },
    ]
  },
  {
    id: "hvac",
    label: "HVAC / Mechanical",
    icon: Thermometer,
    expanded: false,
    items: [
      { id: "furnace", label: "Furnace replacement", checked: false, permitTypes: ["mechanical"] },
      { id: "ac_replacement", label: "A/C replacement", checked: false, permitTypes: ["mechanical"] },
      { id: "new_hvac", label: "New HVAC system", checked: false, permitTypes: ["mechanical", "electrical"] },
      { id: "ductwork", label: "Ductwork modification", checked: false, permitTypes: ["mechanical"] },
      { id: "mini_split", label: "Mini-split installation", checked: false, permitTypes: ["mechanical", "electrical"] },
    ]
  },
  {
    id: "structural",
    label: "Structural",
    icon: Building2,
    expanded: false,
    items: [
      { id: "load_bearing", label: "Load-bearing wall removal", checked: false, permitTypes: ["building"] },
      { id: "foundation", label: "Foundation work", checked: false, permitTypes: ["building"] },
      { id: "addition", label: "Room addition", checked: false, permitTypes: ["building", "electrical", "plumbing", "mechanical"] },
      { id: "deck", label: "Deck construction", description: ">200 sq ft or >30\" above grade", checked: false, permitTypes: ["building"] },
      { id: "egress_window", label: "Egress window installation", checked: false, permitTypes: ["building"] },
    ]
  },
  {
    id: "exterior",
    label: "Exterior",
    icon: Home,
    expanded: false,
    items: [
      { id: "roofing", label: "Roofing replacement", checked: false, permitTypes: ["roofing"] },
      { id: "siding", label: "Siding replacement", checked: false, permitTypes: ["building"] },
      { id: "windows", label: "Window replacement", description: "Same size, no structural changes", checked: false, permitTypes: [] },
      { id: "window_resize", label: "Window resize/new opening", checked: false, permitTypes: ["building"] },
      { id: "fence", label: "Fence installation", description: ">6 ft height", checked: false, permitTypes: ["building"] },
    ]
  },
  {
    id: "interior",
    label: "Interior Remodel",
    icon: Hammer,
    expanded: false,
    items: [
      { id: "basement_finish", label: "Basement finishing", checked: false, permitTypes: ["building", "electrical", "plumbing"] },
      { id: "bathroom_remodel", label: "Bathroom remodel", description: "Moving fixtures or adding new", checked: false, permitTypes: ["building", "plumbing", "electrical"] },
      { id: "kitchen_remodel", label: "Kitchen remodel", description: "Moving fixtures or adding new", checked: false, permitTypes: ["building", "plumbing", "electrical"] },
      { id: "cosmetic", label: "Cosmetic updates only", description: "Paint, flooring, cabinets", checked: false, permitTypes: [] },
    ]
  },
]

export default function PermitAnalyzerPage() {
  const [jurisdiction, setJurisdiction] = useState<string | null>("minneapolis")
  const [categories, setCategories] = useState(initialCategories)
  const [analyzed, setAnalyzed] = useState(false)

  const toggleCategory = (categoryId: string) => {
    setCategories(prev => prev.map(cat => 
      cat.id === categoryId ? { ...cat, expanded: !cat.expanded } : cat
    ))
  }

  const toggleItem = (categoryId: string, itemId: string) => {
    setCategories(prev => prev.map(cat => 
      cat.id === categoryId 
        ? { 
            ...cat, 
            items: cat.items.map(item => 
              item.id === itemId ? { ...item, checked: !item.checked } : item
            )
          } 
        : cat
    ))
    setAnalyzed(false)
  }

  const getSelectedItems = () => {
    return categories.flatMap(cat => cat.items.filter(item => item.checked))
  }

  const getRequiredPermits = () => {
    const selected = getSelectedItems()
    const permitSet = new Set<string>()
    selected.forEach(item => {
      item.permitTypes.forEach(permit => permitSet.add(permit))
    })
    return Array.from(permitSet)
  }

  const handleAnalyze = () => {
    setAnalyzed(true)
  }

  const selectedCount = getSelectedItems().length
  const requiredPermits = getRequiredPermits()

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      
      <main className="flex-1 overflow-auto">
        <div className="mx-auto max-w-5xl px-6 py-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="mb-8"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium mb-4">
              <Sparkles className="h-3.5 w-3.5" />
              AI-Powered Analysis
            </div>
            <h1 className="text-3xl font-bold mb-2">Permit Analyzer</h1>
            <p className="text-muted-foreground max-w-2xl">
              Select your project scope to determine which permits are required. 
              We&apos;ll analyze jurisdiction-specific requirements and provide estimated fees.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Scope Selection */}
            <div className="lg:col-span-2 space-y-4">
              {/* Jurisdiction Selector */}
              <Card className="mb-6">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-medium mb-1">Project Location</div>
                      <div className="text-xs text-muted-foreground">
                        Requirements vary by jurisdiction
                      </div>
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

              {/* Scope Categories */}
              <div className="space-y-3">
                {categories.map((category, catIndex) => (
                  <motion.div
                    key={category.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2, delay: catIndex * 0.03 }}
                  >
                    <Card>
                      <button
                        onClick={() => toggleCategory(category.id)}
                        className="w-full"
                      >
                        <CardHeader className="py-3 px-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="p-2 rounded-lg bg-surface-2">
                                <category.icon className="h-4 w-4 text-muted-foreground" />
                              </div>
                              <CardTitle className="text-base">{category.label}</CardTitle>
                              {category.items.some(i => i.checked) && (
                                <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
                                  {category.items.filter(i => i.checked).length} selected
                                </Badge>
                              )}
                            </div>
                            <ChevronDown className={cn(
                              "h-5 w-5 text-muted-foreground transition-transform",
                              category.expanded && "rotate-180"
                            )} />
                          </div>
                        </CardHeader>
                      </button>
                      
                      <AnimatePresence>
                        {category.expanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                          >
                            <CardContent className="pt-0 pb-4 px-4">
                              <div className="space-y-2 pl-11">
                                {category.items.map((item) => (
                                  <label
                                    key={item.id}
                                    className={cn(
                                      "flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-colors",
                                      item.checked 
                                        ? "bg-emerald-500/5 border border-emerald-500/20" 
                                        : "hover:bg-surface-2 border border-transparent"
                                    )}
                                  >
                                    <Checkbox
                                      checked={item.checked}
                                      onCheckedChange={() => toggleItem(category.id, item.id)}
                                      className="mt-0.5"
                                    />
                                    <div className="flex-1">
                                      <div className="font-medium text-sm">{item.label}</div>
                                      {item.description && (
                                        <div className="text-xs text-muted-foreground mt-0.5">
                                          {item.description}
                                        </div>
                                      )}
                                    </div>
                                    {item.permitTypes.length === 0 && (
                                      <Badge variant="secondary" className="text-xs">
                                        No permit
                                      </Badge>
                                    )}
                                  </label>
                                ))}
                              </div>
                            </CardContent>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Results Sidebar */}
            <div className="space-y-4">
              <Card className="sticky top-6">
                <CardHeader>
                  <CardTitle className="text-base">Analysis Summary</CardTitle>
                  <CardDescription>
                    {selectedCount} scope items selected
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {selectedCount > 0 ? (
                    <>
                      {/* Required Permits Preview */}
                      <div>
                        <div className="text-sm font-medium mb-2">Permits Required</div>
                        <div className="space-y-2">
                          {requiredPermits.length > 0 ? (
                            requiredPermits.map((permit) => (
                              <div 
                                key={permit}
                                className="flex items-center gap-2 p-2 rounded-lg bg-surface-2"
                              >
                                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                                <span className="text-sm capitalize">{permit} Permit</span>
                              </div>
                            ))
                          ) : (
                            <div className="flex items-center gap-2 p-2 rounded-lg bg-emerald-500/5 border border-emerald-500/20">
                              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                              <span className="text-sm text-emerald-400">No permits required</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Analyze Button */}
                      <Button 
                        className="w-full" 
                        onClick={handleAnalyze}
                        disabled={!jurisdiction}
                      >
                        <Sparkles className="h-4 w-4 mr-2" />
                        Analyze Requirements
                      </Button>

                      {/* Analysis Results */}
                      <AnimatePresence>
                        {analyzed && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="space-y-4 pt-4 border-t border-border"
                          >
                            <div className="p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/20">
                              <div className="flex items-center gap-2 mb-2">
                                <Sparkles className="h-4 w-4 text-emerald-400" />
                                <span className="text-sm font-medium text-emerald-400">AI Analysis</span>
                              </div>
                              <p className="text-xs text-muted-foreground">
                                Based on your scope in {jurisdiction}, you&apos;ll need {requiredPermits.length} permit(s). 
                                Estimated total fees: ${requiredPermits.length * 150} - ${requiredPermits.length * 400}
                              </p>
                            </div>

                            <Button variant="outline" className="w-full" asChild>
                              <a href={`/fees?jurisdiction=${jurisdiction}`}>
                                Calculate Exact Fees
                                <ArrowRight className="h-4 w-4 ml-2" />
                              </a>
                            </Button>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </>
                  ) : (
                    <div className="text-center py-6">
                      <FileText className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">
                        Select scope items to see permit requirements
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
