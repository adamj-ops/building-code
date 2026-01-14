"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { 
  History,
  Search,
  Clock,
  MapPin,
  ChevronRight,
  Trash2
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Sidebar } from "@/components/layout/sidebar"

interface SearchHistoryItem {
  id: string
  query: string
  jurisdiction?: string
  resultCount: number
  timestamp: string
}

// Mock history data
const mockHistory: SearchHistoryItem[] = [
  {
    id: "1",
    query: "deck railing height requirements",
    jurisdiction: "Minneapolis",
    resultCount: 8,
    timestamp: "2026-01-14T10:30:00Z"
  },
  {
    id: "2",
    query: "water heater permit",
    jurisdiction: "Minneapolis",
    resultCount: 5,
    timestamp: "2026-01-14T09:15:00Z"
  },
  {
    id: "3",
    query: "egress window size basement",
    jurisdiction: "St. Paul",
    resultCount: 12,
    timestamp: "2026-01-13T16:45:00Z"
  },
  {
    id: "4",
    query: "electrical panel upgrade requirements",
    jurisdiction: "Bloomington",
    resultCount: 6,
    timestamp: "2026-01-13T14:20:00Z"
  },
  {
    id: "5",
    query: "fence height regulations",
    resultCount: 4,
    timestamp: "2026-01-12T11:00:00Z"
  },
]

function formatRelativeTime(timestamp: string): string {
  const date = new Date(timestamp)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  return date.toLocaleDateString()
}

export default function HistoryPage() {
  const [searchFilter, setSearchFilter] = useState("")
  const [history, setHistory] = useState(mockHistory)

  const filteredHistory = history.filter(item =>
    item.query.toLowerCase().includes(searchFilter.toLowerCase()) ||
    item.jurisdiction?.toLowerCase().includes(searchFilter.toLowerCase())
  )

  const clearHistory = () => {
    setHistory([])
  }

  const removeItem = (id: string) => {
    setHistory(prev => prev.filter(item => item.id !== id))
  }

  const repeatSearch = (item: SearchHistoryItem) => {
    const params = new URLSearchParams({ q: item.query })
    if (item.jurisdiction) {
      params.set("jurisdiction", item.jurisdiction.toLowerCase())
    }
    window.location.href = `/search?${params.toString()}`
  }

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
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold mb-2">Search History</h1>
                <p className="text-muted-foreground">
                  Your recent code searches and lookups
                </p>
              </div>
              {history.length > 0 && (
                <Button variant="outline" onClick={clearHistory}>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Clear History
                </Button>
              )}
            </div>
          </motion.div>

          {/* Filter */}
          {history.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              className="mb-6"
            >
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Filter history..."
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                  className="pl-10"
                />
              </div>
            </motion.div>
          )}

          {/* History List */}
          {filteredHistory.length > 0 ? (
            <div className="space-y-3">
              {filteredHistory.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, delay: index * 0.03 }}
                >
                  <Card className="card-hover group">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-4">
                        <button
                          onClick={() => repeatSearch(item)}
                          className="flex-1 flex items-center gap-4 text-left"
                        >
                          <div className="p-2 rounded-lg bg-surface-2">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-medium truncate">
                              &quot;{item.query}&quot;
                            </div>
                            <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                              {item.jurisdiction && (
                                <span className="flex items-center gap-1">
                                  <MapPin className="h-3 w-3" />
                                  {item.jurisdiction}
                                </span>
                              )}
                              <span>{item.resultCount} results</span>
                              <span>{formatRelativeTime(item.timestamp)}</span>
                            </div>
                          </div>
                          <ChevronRight className="h-5 w-5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                        </button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
                          onClick={() => removeItem(item.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              className="text-center py-16"
            >
              <History className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">No Search History</h2>
              <p className="text-muted-foreground max-w-md mx-auto">
                {searchFilter 
                  ? "No searches match your filter."
                  : "Your code searches will appear here for quick access."}
              </p>
              <Button className="mt-6" asChild>
                <a href="/">Start Searching</a>
              </Button>
            </motion.div>
          )}
        </div>
      </main>
    </div>
  )
}
