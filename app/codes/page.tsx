"use client"

import { useState, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { motion } from "framer-motion"
import Link from "next/link"
import { 
  BookOpen,
  Search,
  ChevronRight,
  Filter,
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
  FileText
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Sidebar } from "@/components/layout/sidebar"
import { cn } from "@/lib/utils"

const categories = [
  { id: "structural", label: "Structural", icon: Building2, count: 245 },
  { id: "electrical", label: "Electrical", icon: Zap, count: 312 },
  { id: "plumbing", label: "Plumbing", icon: Wrench, count: 198 },
  { id: "hvac", label: "HVAC", icon: Thermometer, count: 156 },
  { id: "egress", label: "Egress", icon: DoorOpen, count: 89 },
  { id: "roofing", label: "Roofing", icon: Home, count: 67 },
  { id: "fire", label: "Fire Safety", icon: Flame, count: 234 },
  { id: "energy", label: "Energy", icon: Leaf, count: 178 },
  { id: "accessibility", label: "Accessibility", icon: Accessibility, count: 145 },
  { id: "foundation", label: "Foundation", icon: Shield, count: 112 },
  { id: "exterior", label: "Exterior", icon: Layers, count: 98 },
  { id: "windows", label: "Windows", icon: DoorOpen, count: 76 },
]

const baseCodes = [
  { 
    id: "irc-2020", 
    name: "International Residential Code", 
    abbreviation: "IRC",
    year: 2020,
    sections: 1250,
    description: "Residential one- and two-family dwellings and townhouses"
  },
  { 
    id: "ibc-2020", 
    name: "International Building Code", 
    abbreviation: "IBC",
    year: 2020,
    sections: 2100,
    description: "Commercial and multi-family buildings"
  },
  { 
    id: "nec-2020", 
    name: "National Electrical Code", 
    abbreviation: "NEC",
    year: 2020,
    sections: 890,
    description: "Electrical installations and systems"
  },
  { 
    id: "upc-2021", 
    name: "Uniform Plumbing Code", 
    abbreviation: "UPC",
    year: 2021,
    sections: 650,
    description: "Plumbing systems and fixtures"
  },
  { 
    id: "imc-2020", 
    name: "International Mechanical Code", 
    abbreviation: "IMC",
    year: 2020,
    sections: 420,
    description: "Mechanical systems and equipment"
  },
  { 
    id: "iecc-2020", 
    name: "International Energy Conservation Code", 
    abbreviation: "IECC",
    year: 2020,
    sections: 310,
    description: "Energy efficiency requirements"
  },
]

function CodesContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const selectedCategory = searchParams.get("category")

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`)
    }
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      
      <main className="flex-1 overflow-auto">
        <div className="mx-auto max-w-6xl px-6 py-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="mb-8"
          >
            <h1 className="text-3xl font-bold mb-2">Browse Building Codes</h1>
            <p className="text-muted-foreground">
              Explore Minnesota State Building Code and adopted model codes
            </p>
          </motion.div>

          {/* Search */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="mb-8"
          >
            <form onSubmit={handleSearch} className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Search code sections..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 h-12 text-base"
              />
            </form>
          </motion.div>

          {/* Categories Grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            className="mb-12"
          >
            <h2 className="text-lg font-semibold mb-4">Browse by Category</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {categories.map((category, index) => (
                <Link 
                  key={category.id} 
                  href={`/search?category=${category.id}`}
                >
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2, delay: index * 0.02 }}
                  >
                    <Card className={cn(
                      "card-hover cursor-pointer h-full",
                      selectedCategory === category.id && "border-emerald-500/50 bg-emerald-500/5"
                    )}>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-surface-2">
                            <category.icon className="h-5 w-5 text-muted-foreground" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-sm truncate">{category.label}</div>
                            <div className="text-xs text-muted-foreground">{category.count} sections</div>
                          </div>
                          <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                </Link>
              ))}
            </div>
          </motion.div>

          {/* Base Codes */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
          >
            <h2 className="text-lg font-semibold mb-4">Adopted Model Codes</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {baseCodes.map((code, index) => (
                <motion.div
                  key={code.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, delay: index * 0.03 }}
                >
                  <Card className="card-hover">
                    <CardContent className="p-5">
                      <div className="flex items-start gap-4">
                        <div className="p-3 rounded-lg bg-surface-2 shrink-0">
                          <BookOpen className="h-6 w-6 text-muted-foreground" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold truncate">{code.name}</h3>
                            <Badge variant="secondary" className="shrink-0">
                              {code.year}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-3">
                            {code.description}
                          </p>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <FileText className="h-3.5 w-3.5" />
                              {code.sections} sections
                            </span>
                            <span className="font-mono">{code.abbreviation}</span>
                          </div>
                        </div>
                      </div>
                      <div className="mt-4 pt-4 border-t border-border flex items-center justify-between">
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/search?code=${code.abbreviation.toLowerCase()}`}>
                            Search {code.abbreviation}
                          </Link>
                        </Button>
                        <Button variant="outline" size="sm">
                          Browse Chapters
                          <ChevronRight className="h-4 w-4 ml-1" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* MN Rules Reference */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.4 }}
            className="mt-12"
          >
            <Card className="bg-surface-2 border-dashed">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-lg bg-background">
                    <FileText className="h-6 w-6 text-emerald-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Minnesota Rules Reference</h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      Minnesota State Building Code is codified in Minnesota Rules, Chapters 1300-1370. 
                      These rules adopt and amend the model codes above.
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="secondary">Ch. 1300 - Administration</Badge>
                      <Badge variant="secondary">Ch. 1303 - Building Code</Badge>
                      <Badge variant="secondary">Ch. 1305 - Accessibility</Badge>
                      <Badge variant="secondary">Ch. 1309 - Residential</Badge>
                      <Badge variant="secondary">Ch. 1315 - Plumbing</Badge>
                      <Badge variant="secondary">Ch. 1322 - Electrical</Badge>
                      <Badge variant="secondary">Ch. 1323 - Mechanical</Badge>
                      <Badge variant="secondary">Ch. 1346 - Energy</Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </main>
    </div>
  )
}

export default function CodesPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen bg-background">
        <Sidebar />
        <main className="flex-1 flex items-center justify-center">
          <div className="animate-pulse text-muted-foreground">Loading...</div>
        </main>
      </div>
    }>
      <CodesContent />
    </Suspense>
  )
}
