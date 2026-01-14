"use client"

import { useState, useEffect, Suspense, useCallback } from "react"
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
  FileText,
  Loader2
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Sidebar } from "@/components/layout/sidebar"
import { JurisdictionSelect } from "@/components/codes/jurisdiction-select"
import { cn } from "@/lib/utils"

interface SearchResult {
  id: string
  source: string
  section: string
  title: string
  text: string
  summary?: string
  relevance_score: number
  category?: string
  local_amendments: Array<{
    jurisdiction: string
    amendment_type: string
    text: string
  }>
}

interface SearchResponse {
  query_interpretation: {
    intent: string
    entities: string[]
    jurisdiction_resolved: {
      id: string | null
      name: string
      type: string | null
      county: string | null
    }
  }
  results: SearchResult[]
  ai_summary?: string
  related_sections: Array<{
    id: string
    section: string
    title: string
    relationship: string
  }>
  total_count: number
  has_more: boolean
}

function SearchContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [query, setQuery] = useState(searchParams.get("q") || "")
  const [jurisdiction, setJurisdiction] = useState<string | null>(
    searchParams.get("jurisdiction") || null
  )
  const [isLoading, setIsLoading] = useState(false)
  const [results, setResults] = useState<SearchResult[]>([])
  const [aiSummary, setAiSummary] = useState<string | null>(null)
  const [activeFilters, setActiveFilters] = useState<string[]>([])
  const [error, setError] = useState<string | null>(null)
  const [totalCount, setTotalCount] = useState(0)

  const performSearch = useCallback(async (searchQuery: string, searchJurisdiction: string | null) => {
    if (!searchQuery.trim()) return
    
    setIsLoading(true)
    setError(null)
    
    try {
      const response = await fetch('/api/codes/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: searchQuery,
          jurisdiction: searchJurisdiction,
          filters: {
            code_types: activeFilters.filter(f => ['IRC', 'IBC'].includes(f)),
            include_amendments: activeFilters.includes('Local Amendments')
          },
          options: {
            include_ai_summary: true,
            limit: 20
          }
        })
      })
      
      if (!response.ok) {
        throw new Error('Search failed')
      }
      
      const data: SearchResponse = await response.json()
      
      setResults(data.results)
      setAiSummary(data.ai_summary || null)
      setTotalCount(data.total_count)
    } catch (err) {
      console.error('Search error:', err)
      setError('Failed to search. Please try again.')
      setResults([])
      setAiSummary(null)
    } finally {
      setIsLoading(false)
    }
  }, [activeFilters])

  // Search on initial load if query exists
  useEffect(() => {
    const q = searchParams.get("q")
    const j = searchParams.get("jurisdiction")
    if (q) {
      setQuery(q)
      setJurisdiction(j)
      performSearch(q, j)
    }
  }, [searchParams, performSearch])

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    const params = new URLSearchParams()
    if (query) params.set("q", query)
    if (jurisdiction) params.set("jurisdiction", jurisdiction)
    router.push(`/search?${params.toString()}`)
    
    await performSearch(query, jurisdiction)
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
                  <Button type="submit" size="sm" disabled={isLoading}>
                    {isLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      "Search"
                    )}
                  </Button>
                </div>
              </div>
            </form>

            {/* Search Meta */}
            {query && !isLoading && (
              <div className="mt-4 flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  <span className="font-medium text-foreground">{totalCount}</span> results for{" "}
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

          {/* Loading State */}
          {isLoading && (
            <div className="flex flex-col items-center justify-center py-16">
              <Loader2 className="h-8 w-8 text-emerald-400 animate-spin mb-4" />
              <p className="text-muted-foreground">Searching building codes...</p>
            </div>
          )}

          {/* Error State */}
          {error && !isLoading && (
            <div className="text-center py-16">
              <AlertTriangle className="h-12 w-12 text-amber-400 mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">Search Error</h2>
              <p className="text-muted-foreground max-w-md mx-auto">{error}</p>
              <Button onClick={() => performSearch(query, jurisdiction)} className="mt-4">
                Try Again
              </Button>
            </div>
          )}

          {/* Results */}
          {query && !isLoading && !error && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main Results */}
              <div className="lg:col-span-2 space-y-4">
                {/* AI Summary */}
                {aiSummary && (
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
                              return line.trim() ? <p key={i} className="my-2">{line}</p> : null
                            })}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )}

                {/* No Results */}
                {results.length === 0 && (
                  <div className="text-center py-12">
                    <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h2 className="text-xl font-semibold mb-2">No Results Found</h2>
                    <p className="text-muted-foreground max-w-md mx-auto">
                      Try different keywords or broaden your search. Make sure to check spelling.
                    </p>
                  </div>
                )}

                {/* Code Sections */}
                {results.length > 0 && (
                  <>
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
                              {result.summary || result.text.substring(0, 300)}
                              {result.text.length > 300 && !result.summary && '...'}
                            </p>

                            {/* Local Amendments */}
                            {result.local_amendments && result.local_amendments.length > 0 && (
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
                  </>
                )}
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
                        <span className="text-sm font-medium">Building Permit</span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Required for most structural modifications
                      </p>
                      <div className="mt-2 text-xs text-muted-foreground">
                        Est. fee: <span className="text-foreground">$100-$500</span>
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
                        <span className="text-muted-foreground">Code Base</span>
                        <span className="font-medium">MN State Code 2020</span>
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
          {!query && !isLoading && (
            <div className="text-center py-16">
              <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">Search Building Codes</h2>
              <p className="text-muted-foreground max-w-md mx-auto">
                Enter a search query to find relevant building codes, permit requirements, 
                and local amendments across Minnesota jurisdictions.
              </p>
              
              {/* Quick Search Suggestions */}
              <div className="mt-8">
                <p className="text-sm text-muted-foreground mb-4">Try searching for:</p>
                <div className="flex flex-wrap justify-center gap-2">
                  {[
                    "deck railing requirements",
                    "stair dimensions",
                    "egress window size",
                    "smoke detector placement",
                    "garage door to house"
                  ].map((suggestion) => (
                    <button
                      key={suggestion}
                      onClick={() => {
                        setQuery(suggestion)
                        performSearch(suggestion, jurisdiction)
                        router.push(`/search?q=${encodeURIComponent(suggestion)}`)
                      }}
                      className="px-3 py-1.5 text-sm rounded-full border border-border text-muted-foreground hover:text-foreground hover:border-emerald-500/30 hover:bg-emerald-500/5 transition-colors"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
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
