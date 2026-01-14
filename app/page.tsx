"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Search, 
  MapPin, 
  FileText, 
  Calculator, 
  Phone,
  Building2,
  Zap,
  Wrench,
  Thermometer,
  DoorOpen,
  Home,
  Flame,
  Leaf,
  Accessibility,
  Shield,
  Layers,
  ChevronRight,
  Sparkles,
  Clock,
  ArrowRight
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { JurisdictionSelect } from "@/components/codes/jurisdiction-select"
import { Sidebar } from "@/components/layout/sidebar"
import Link from "next/link"

const quickActions = [
  { 
    icon: FileText, 
    label: "Permit Analyzer", 
    description: "Determine required permits for your project",
    href: "/permits/analyzer",
    color: "text-emerald-400"
  },
  { 
    icon: Search, 
    label: "Code Search", 
    description: "Search building codes by keyword",
    href: "/search",
    color: "text-blue-400"
  },
  { 
    icon: Calculator, 
    label: "Fee Calculator", 
    description: "Estimate permit fees by jurisdiction",
    href: "/fees",
    color: "text-amber-400"
  },
  { 
    icon: Phone, 
    label: "Contact Lookup", 
    description: "Find building department contacts",
    href: "/jurisdictions",
    color: "text-purple-400"
  },
]

const categories = [
  { icon: Building2, label: "Structural", href: "/codes?category=structural" },
  { icon: Zap, label: "Electrical", href: "/codes?category=electrical" },
  { icon: Wrench, label: "Plumbing", href: "/codes?category=plumbing" },
  { icon: Thermometer, label: "HVAC", href: "/codes?category=hvac" },
  { icon: DoorOpen, label: "Egress", href: "/codes?category=egress" },
  { icon: Home, label: "Roofing", href: "/codes?category=roofing" },
  { icon: Flame, label: "Fire Safety", href: "/codes?category=fire" },
  { icon: Leaf, label: "Energy", href: "/codes?category=energy" },
  { icon: Accessibility, label: "Accessibility", href: "/codes?category=accessibility" },
  { icon: Shield, label: "Foundation", href: "/codes?category=foundation" },
  { icon: Layers, label: "Exterior", href: "/codes?category=exterior" },
  { icon: DoorOpen, label: "Windows", href: "/codes?category=windows" },
]

const recentSearches = [
  { query: "deck railing height requirements", jurisdiction: "Bloomington" },
  { query: "water heater permit", jurisdiction: "Minneapolis" },
  { query: "egress window size", jurisdiction: "St. Paul" },
]

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedJurisdiction, setSelectedJurisdiction] = useState<string | null>(null)
  const [isSearchFocused, setIsSearchFocused] = useState(false)

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      const params = new URLSearchParams({ q: searchQuery })
      if (selectedJurisdiction) {
        params.set("jurisdiction", selectedJurisdiction)
      }
      window.location.href = `/search?${params.toString()}`
    }
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      
      <main className="flex-1 overflow-auto">
        <div className="mx-auto max-w-5xl px-6 py-12">
          {/* Hero Section */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium mb-6">
              <Sparkles className="h-3.5 w-3.5" />
              AI-Powered Code Search
            </div>
            
            <h1 className="text-4xl font-bold tracking-tight mb-4 bg-gradient-to-b from-foreground to-foreground/70 bg-clip-text text-transparent">
              Minnesota Building Code Database
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Search codes, permits, and requirements across 87 counties and 853 cities. 
              Get instant answers with AI-powered summaries.
            </p>
          </motion.div>

          {/* Search Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mb-12"
          >
            <form onSubmit={handleSearch} className="relative">
              <div 
                className={`
                  relative rounded-2xl border transition-all duration-300
                  ${isSearchFocused 
                    ? 'border-emerald-500/50 shadow-lg shadow-emerald-500/10' 
                    : 'border-border hover:border-border-emphasis'
                  }
                  bg-surface-2
                `}
              >
                <div className="flex items-center gap-3 p-4">
                  <Search className="h-5 w-5 text-muted-foreground shrink-0" />
                  <input
                    type="text"
                    placeholder="Search codes, permits, and requirements..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => setIsSearchFocused(true)}
                    onBlur={() => setIsSearchFocused(false)}
                    className="flex-1 bg-transparent border-none outline-none text-foreground placeholder:text-muted-foreground text-base"
                  />
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface-3 border border-border">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <JurisdictionSelect 
                        value={selectedJurisdiction}
                        onChange={setSelectedJurisdiction}
                      />
                    </div>
                    <Button type="submit" size="md" className="rounded-xl">
                      Search
                    </Button>
                  </div>
                </div>
              </div>
            </form>

            {/* Search Suggestions */}
            <div className="mt-4 flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <span>Try:</span>
              {["egress window requirements", "deck permit", "electrical panel upgrade"].map((suggestion, i) => (
                <button
                  key={suggestion}
                  onClick={() => setSearchQuery(suggestion)}
                  className="px-2 py-1 rounded-md hover:bg-surface-2 hover:text-foreground transition-colors"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </motion.div>

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mb-12"
          >
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
              Quick Actions
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {quickActions.map((action, index) => (
                <Link key={action.label} href={action.href}>
                  <Card className="group cursor-pointer card-hover h-full">
                    <CardContent className="p-5">
                      <div className={`mb-3 ${action.color}`}>
                        <action.icon className="h-6 w-6" />
                      </div>
                      <h3 className="font-semibold mb-1 group-hover:text-foreground transition-colors">
                        {action.label}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {action.description}
                      </p>
                      <div className="mt-3 flex items-center text-xs text-muted-foreground group-hover:text-foreground transition-colors">
                        <span>Get started</span>
                        <ChevronRight className="h-3.5 w-3.5 ml-1 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </motion.div>

          {/* Browse by Category */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mb-12"
          >
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
              Browse by Category
            </h2>
            <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-3">
              {categories.map((category) => (
                <Link key={category.label} href={category.href}>
                  <div className="group flex flex-col items-center gap-2 p-4 rounded-xl border border-border bg-card hover:border-border-emphasis hover:bg-surface-2 transition-all cursor-pointer">
                    <category.icon className="h-5 w-5 text-muted-foreground group-hover:text-foreground transition-colors" />
                    <span className="text-xs font-medium text-muted-foreground group-hover:text-foreground transition-colors">
                      {category.label}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </motion.div>

          {/* Recent Searches */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
              Recent Searches
            </h2>
            <div className="space-y-2">
              {recentSearches.map((search, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setSearchQuery(search.query)
                    // Could also set jurisdiction
                  }}
                  className="w-full flex items-center gap-3 p-3 rounded-lg border border-border bg-card hover:bg-surface-2 hover:border-border-emphasis transition-all text-left group"
                >
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="flex-1 text-sm">
                    &quot;{search.query}&quot;
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {search.jurisdiction}
                  </span>
                  <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              ))}
            </div>
          </motion.div>

          {/* Footer Stats */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="mt-16 pt-8 border-t border-border"
          >
            <div className="grid grid-cols-3 gap-8 text-center">
              <div>
                <div className="text-2xl font-bold text-foreground">87</div>
                <div className="text-sm text-muted-foreground">Counties</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-foreground">853</div>
                <div className="text-sm text-muted-foreground">Cities</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-foreground">10k+</div>
                <div className="text-sm text-muted-foreground">Code Sections</div>
              </div>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  )
}
