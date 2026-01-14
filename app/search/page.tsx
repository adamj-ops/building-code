"use client"

import { useState, useEffect, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { 
  Search, 
  MapPin, 
  BookOpen,
  AlertTriangle,
  ChevronRight,
  Copy,
  ExternalLink,
  Sparkles,
  Filter,
  X,
  FileText
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Sidebar } from "@/components/layout/sidebar"
import { JurisdictionSelect } from "@/components/codes/jurisdiction-select"
import { cn } from "@/lib/utils"

// Mock search results - will be replaced with API call
const mockResults = [
  {
    id: "1",
    source: "IRC 2020",
    section: "R312.1",
    title: "Guards Required",
    text: "Guards shall be provided on open-sided walking surfaces, including stairs, ramps and landings, that are located more than 30 inches measured vertically to the floor or grade below at any point within 36 inches horizontally to the edge of the open side.",
    relevance_score: 0.98,
    category: "Egress",
    local_amendments: []
  },
  {
    id: "2",
    source: "IRC 2020",
    section: "R312.1.1",
    title: "Height",
    text: "Required guards at open-sided walking surfaces, including stairs, porches, balconies or landings, shall be not less than 36 inches in height as measured vertically above the adjacent walking surface, adjacent fixed seating or the line connecting the leading edges of the treads.",
    relevance_score: 0.95,
    category: "Egress",
    local_amendments: [
      {
        jurisdiction: "Minneapolis",
        amendment_type: "note",
        text: "Verify with inspector for properties in historic districts."
      }
    ]
  },
  {
    id: "3",
    source: "IRC 2020",
    section: "R312.1.3",
    title: "Opening Limitations",
    text: "Required guards shall not have openings from the walking surface to the required guard height that allow passage of a sphere 4 inches in diameter.",
    relevance_score: 0.92,
    category: "Egress",
    local_amendments: []
  },
  {
    id: "4",
    source: "IRC 2020",
    section: "R507.4",
    title: "Deck Posts",
    text: "Wood columns or posts shall be approved wood of natural decay resistance or approved pressure-preservatively-treated wood. Deck posts shall not be notched.",
    relevance_score: 0.78,
    category: "Structural",
    local_amendments: []
  },
]

const mockAISummary = `For deck railings in Minneapolis:

• **Required when** deck surface is 30" or more above grade
• **Minimum height:** 36" (residential)
• **Baluster spacing:** Maximum 4" (sphere cannot pass)
• **Load requirement:** Must withstand 200 lb concentrated load

Minneapolis has **no local amendments** to state deck railing requirements, but properties in historic districts should verify requirements with an inspector.`

function SearchContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [query, setQuery] = useState(searchParams.get("q") || "")
  const [jurisdiction, setJurisdiction] = useState<string | null>(
    searchParams.get("jurisdiction") || null
  )
  const [isLoading, setIsLoading] = useState(false)
  const [results, setResults] = useState(mockResults)
  const [aiSummary, setAiSummary] = useState(mockAISummary)
  const [activeFilters, setActiveFilters] = useState<string[]>([])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const params = new URLSearchParams()
    if (query) params.set("q", query)
    if (jurisdiction) params.set("jurisdiction", jurisdiction)
    router.push(`/search?${params.toString()}`)
    
    // Simulate search
    setIsLoading(true)
    setTimeout(() => {
      setIsLoading(false)
      setResults(mockResults)
    }, 500)
  }

  const toggleFilter = (filter: string) => {
    setActiveFilters(prev => 
      prev.includes(filter) 
        ? prev.filter(f => f !== filter)
        : [...prev, filter]
    )
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    // Could add toast notification here
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      
      <main className="flex-1 overflow-auto">
        <div className="mx-auto max-w-5xl px-6 py-8">
          {/* Search Header */}
          <div className="mb-8">
            <form onSubmit={handleSearch} className="relative">
              <div className="flex items-center gap-3 p-3 rounded-xl border border-border bg-surface-2">
                <Search className="h-5 w-5 text-muted-foreground shrink-0" />
                <input
                  type="text"
                  placeholder="Search codes, permits, and requirements..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="flex-1 bg-transparent border-none outline-none text-foreground placeholder:text-muted-foreground"
                />
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface-3 border border-border">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <JurisdictionSelect 
                      value={jurisdiction}
                      onChange={setJurisdiction}
                    />
                  </div>
                  <Button type="submit" size="sm">
                    Search
                  </Button>
                </div>
              </div>
            </form>

            {/* Search Meta */}
            {query && (
              <div className="mt-4 flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  <span className="font-medium text-foreground">{results.length}</span> results for{" "}
                  <span className="font-medium text-foreground">&quot;{query}&quot;</span>
                  {jurisdiction && (
                    <span> in <span className="font-medium text-foreground">{jurisdiction}</span></span>
                  )}
                </div>
                
                {/* Filters */}
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Filter:</span>
                  {["IRC", "IBC", "Local Amendments"].map((filter) => (
                    <button
                      key={filter}
                      onClick={() => toggleFilter(filter)}
                      className={cn(
                        "px-2.5 py-1 text-xs rounded-full border transition-colors",
                        activeFilters.includes(filter)
                          ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                          : "border-border text-muted-foreground hover:border-border-emphasis hover:text-foreground"
                      )}
                    >
                      {filter}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Results */}
          {query && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main Results */}
              <div className="lg:col-span-2 space-y-4">
                {/* AI Summary */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card className="border-emerald-500/20 bg-emerald-500/5">
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center gap-2 text-base">
                        <Sparkles className="h-4 w-4 text-emerald-400" />
                        AI Summary
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="prose prose-sm prose-invert max-w-none">
                        <div className="text-sm text-muted-foreground whitespace-pre-line">
                          {aiSummary.split('\n').map((line, i) => {
                            if (line.startsWith('•')) {
                              return (
                                <div key={i} className="flex gap-2 my-1">
                                  <span className="text-emerald-400">•</span>
                                  <span dangerouslySetInnerHTML={{ 
                                    __html: line.slice(1).replace(/\*\*(.*?)\*\*/g, '<strong class="text-foreground">$1</strong>')
                                  }} />
                                </div>
                              )
                            }
                            return <p key={i} className="my-2">{line}</p>
                          })}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                {/* Code Sections */}
                <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mt-6 mb-3">
                  Matching Code Sections
                </h2>
                
                {results.map((result, index) => (
                  <motion.div
                    key={result.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                  >
                    <Card className="card-hover">
                      <CardContent className="p-5">
                        <div className="flex items-start justify-between gap-4 mb-3">
                          <div className="flex items-center gap-2">
                            <BookOpen className="h-4 w-4 text-muted-foreground" />
                            <span className="font-mono text-sm font-medium">
                              {result.source} {result.section}
                            </span>
                            <span className="text-muted-foreground">—</span>
                            <span className="font-medium">{result.title}</span>
                          </div>
                          <Badge variant="secondary" className="text-xs">
                            {Math.round(result.relevance_score * 100)}% match
                          </Badge>
                        </div>

                        <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                          {result.text}
                        </p>

                        {/* Local Amendments */}
                        {result.local_amendments.length > 0 && (
                          <div className="mt-3 p-3 rounded-lg bg-amber-500/5 border border-amber-500/20">
                            <div className="flex items-center gap-2 mb-2">
                              <AlertTriangle className="h-3.5 w-3.5 text-amber-400" />
                              <span className="text-xs font-medium text-amber-400">
                                Local Amendment — {result.local_amendments[0].jurisdiction}
                              </span>
                            </div>
                            <p className="text-xs text-muted-foreground">
                              {result.local_amendments[0].text}
                            </p>
                          </div>
                        )}

                        {/* Actions */}
                        <div className="flex items-center gap-2 mt-4 pt-3 border-t border-border">
                          <Button 
                            variant="ghost" 
                            size="xs"
                            onClick={() => copyToClipboard(`${result.source} ${result.section}: ${result.text}`)}
                          >
                            <Copy className="h-3.5 w-3.5 mr-1.5" />
                            Copy Citation
                          </Button>
                          <Button variant="ghost" size="xs">
                            <ExternalLink className="h-3.5 w-3.5 mr-1.5" />
                            View Full Section
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>

              {/* Sidebar */}
              <div className="space-y-4">
                {/* Related Permits */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Related Permits</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="p-3 rounded-lg bg-surface-2 border border-border">
                      <div className="flex items-center gap-2 mb-1">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">Deck Permit</span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Required for decks &gt;200 sq ft or &gt;30&quot; above grade
                      </p>
                      <div className="mt-2 text-xs text-muted-foreground">
                        Est. fee: <span className="text-foreground">$150-$400</span>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" className="w-full">
                      View Permit Requirements
                      <ChevronRight className="h-4 w-4 ml-auto" />
                    </Button>
                  </CardContent>
                </Card>

                {/* Jurisdiction Info */}
                {jurisdiction && (
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm">Jurisdiction Info</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Location</span>
                        <span className="font-medium">{jurisdiction}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Local Amendments</span>
                        <span className="font-medium">12</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Last Updated</span>
                        <span className="font-medium">Jan 10, 2026</span>
                      </div>
                      <Button variant="outline" size="sm" className="w-full mt-2">
                        View Jurisdiction Details
                        <ChevronRight className="h-4 w-4 ml-auto" />
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          )}

          {/* Empty State */}
          {!query && (
            <div className="text-center py-16">
              <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">Search Building Codes</h2>
              <p className="text-muted-foreground max-w-md mx-auto">
                Enter a search query to find relevant building codes, permit requirements, 
                and local amendments across Minnesota jurisdictions.
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen bg-background">
        <Sidebar />
        <main className="flex-1 flex items-center justify-center">
          <div className="animate-pulse text-muted-foreground">Loading...</div>
        </main>
      </div>
    }>
      <SearchContent />
    </Suspense>
  )
}
