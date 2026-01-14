"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import { 
  Map,
  List,
  Search,
  ChevronRight,
  Building2,
  Phone,
  Mail,
  Globe,
  CheckCircle2,
  AlertCircle,
  Clock
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Sidebar } from "@/components/layout/sidebar"
import { cn } from "@/lib/utils"

// Mock data for jurisdictions
const counties = [
  { 
    id: "hennepin", 
    name: "Hennepin County", 
    cities: 45, 
    dataStatus: "complete",
    lastUpdated: "Jan 10, 2026"
  },
  { 
    id: "ramsey", 
    name: "Ramsey County", 
    cities: 18, 
    dataStatus: "complete",
    lastUpdated: "Jan 8, 2026"
  },
  { 
    id: "dakota", 
    name: "Dakota County", 
    cities: 34, 
    dataStatus: "complete",
    lastUpdated: "Jan 5, 2026"
  },
  { 
    id: "anoka", 
    name: "Anoka County", 
    cities: 21, 
    dataStatus: "partial",
    lastUpdated: "Dec 28, 2025"
  },
  { 
    id: "washington", 
    name: "Washington County", 
    cities: 28, 
    dataStatus: "partial",
    lastUpdated: "Dec 20, 2025"
  },
  { 
    id: "scott", 
    name: "Scott County", 
    cities: 17, 
    dataStatus: "state_only",
    lastUpdated: "Dec 15, 2025"
  },
  { 
    id: "carver", 
    name: "Carver County", 
    cities: 11, 
    dataStatus: "state_only",
    lastUpdated: "Dec 10, 2025"
  },
]

const cities = [
  {
    id: "minneapolis",
    name: "Minneapolis",
    county: "Hennepin",
    population: 429954,
    dataStatus: "complete",
    localAmendments: 12,
    phone: "311",
    email: "permits@minneapolismn.gov",
    website: "minneapolismn.gov/permits"
  },
  {
    id: "st-paul",
    name: "St. Paul",
    county: "Ramsey",
    population: 311527,
    dataStatus: "complete",
    localAmendments: 8,
    phone: "651-266-8989",
    email: "dsi@stpaul.gov",
    website: "stpaul.gov/dsi"
  },
  {
    id: "bloomington",
    name: "Bloomington",
    county: "Hennepin",
    population: 89987,
    dataStatus: "complete",
    localAmendments: 5,
    phone: "952-563-8920",
    email: "permits@bloomingtonmn.gov",
    website: "bloomingtonmn.gov"
  },
  {
    id: "brooklyn-park",
    name: "Brooklyn Park",
    county: "Hennepin",
    population: 86478,
    dataStatus: "complete",
    localAmendments: 3,
    phone: "763-493-8020",
    email: "permits@brooklynpark.org",
    website: "brooklynpark.org"
  },
  {
    id: "plymouth",
    name: "Plymouth",
    county: "Hennepin",
    population: 81026,
    dataStatus: "complete",
    localAmendments: 4,
    phone: "763-509-5400",
    email: "permits@plymouthmn.gov",
    website: "plymouthmn.gov"
  },
  {
    id: "woodbury",
    name: "Woodbury",
    county: "Washington",
    population: 75102,
    dataStatus: "partial",
    localAmendments: 2,
    phone: "651-714-3500",
    email: "permits@woodburymn.gov",
    website: "woodburymn.gov"
  },
]

function getStatusBadge(status: string) {
  switch (status) {
    case "complete":
      return (
        <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
          <CheckCircle2 className="h-3 w-3 mr-1" />
          Complete
        </Badge>
      )
    case "partial":
      return (
        <Badge className="bg-amber-500/10 text-amber-400 border-amber-500/20">
          <Clock className="h-3 w-3 mr-1" />
          Partial
        </Badge>
      )
    default:
      return (
        <Badge className="bg-zinc-500/10 text-zinc-400 border-zinc-500/20">
          <AlertCircle className="h-3 w-3 mr-1" />
          State Code Only
        </Badge>
      )
  }
}

export default function JurisdictionsPage() {
  const [viewMode, setViewMode] = useState<"map" | "list">("list")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCounty, setSelectedCounty] = useState<string | null>(null)

  const filteredCities = cities.filter(city => {
    const matchesSearch = city.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      city.county.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCounty = !selectedCounty || city.county.toLowerCase() === selectedCounty.toLowerCase()
    return matchesSearch && matchesCounty
  })

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      
      <main className="flex-1 overflow-auto">
        <div className="mx-auto max-w-6xl px-6 py-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold mb-1">Browse Jurisdictions</h1>
              <p className="text-muted-foreground">
                Explore building departments across Minnesota&apos;s 87 counties and 853 cities
              </p>
            </div>
            
            {/* View Toggle */}
            <div className="flex items-center gap-1 p-1 rounded-lg bg-surface-2 border border-border">
              <button
                onClick={() => setViewMode("list")}
                className={cn(
                  "flex items-center gap-2 px-3 py-1.5 rounded-md text-sm transition-colors",
                  viewMode === "list" 
                    ? "bg-background text-foreground shadow-sm" 
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <List className="h-4 w-4" />
                List
              </button>
              <button
                onClick={() => setViewMode("map")}
                className={cn(
                  "flex items-center gap-2 px-3 py-1.5 rounded-md text-sm transition-colors",
                  viewMode === "map" 
                    ? "bg-background text-foreground shadow-sm" 
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Map className="h-4 w-4" />
                Map
              </button>
            </div>
          </div>

          {viewMode === "list" ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Counties Sidebar */}
              <div className="space-y-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Metro Counties</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-1">
                    <button
                      onClick={() => setSelectedCounty(null)}
                      className={cn(
                        "w-full flex items-center justify-between p-2 rounded-lg text-sm transition-colors",
                        !selectedCounty 
                          ? "bg-emerald-500/10 text-emerald-400" 
                          : "hover:bg-surface-2 text-muted-foreground hover:text-foreground"
                      )}
                    >
                      <span>All Counties</span>
                      <span className="text-xs">{cities.length}</span>
                    </button>
                    {counties.map((county) => (
                      <button
                        key={county.id}
                        onClick={() => setSelectedCounty(county.name.replace(" County", ""))}
                        className={cn(
                          "w-full flex items-center justify-between p-2 rounded-lg text-sm transition-colors",
                          selectedCounty === county.name.replace(" County", "")
                            ? "bg-emerald-500/10 text-emerald-400" 
                            : "hover:bg-surface-2 text-muted-foreground hover:text-foreground"
                        )}
                      >
                        <div className="flex items-center gap-2">
                          <span>{county.name}</span>
                          {county.dataStatus === "complete" && (
                            <CheckCircle2 className="h-3 w-3 text-emerald-400" />
                          )}
                        </div>
                        <span className="text-xs">{county.cities}</span>
                      </button>
                    ))}
                  </CardContent>
                </Card>

                {/* Legend */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Data Coverage</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-2 text-sm">
                      <div className="h-3 w-3 rounded-full bg-emerald-400" />
                      <span className="text-muted-foreground">Complete data</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <div className="h-3 w-3 rounded-full bg-amber-400" />
                      <span className="text-muted-foreground">Partial data</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <div className="h-3 w-3 rounded-full bg-zinc-400" />
                      <span className="text-muted-foreground">State code only</span>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Cities List */}
              <div className="lg:col-span-2 space-y-4">
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search cities..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>

                {/* Results */}
                <div className="space-y-3">
                  {filteredCities.map((city, index) => (
                    <motion.div
                      key={city.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2, delay: index * 0.03 }}
                    >
                      <Link href={`/jurisdictions/${city.id}`}>
                        <Card className="card-hover cursor-pointer">
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between">
                              <div className="flex items-start gap-3">
                                <div className="p-2 rounded-lg bg-surface-2">
                                  <Building2 className="h-5 w-5 text-muted-foreground" />
                                </div>
                                <div>
                                  <div className="flex items-center gap-2 mb-1">
                                    <h3 className="font-semibold">{city.name}</h3>
                                    {getStatusBadge(city.dataStatus)}
                                  </div>
                                  <p className="text-sm text-muted-foreground mb-2">
                                    {city.county} County • Pop. {city.population.toLocaleString()}
                                  </p>
                                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                    <span className="flex items-center gap-1">
                                      <Phone className="h-3 w-3" />
                                      {city.phone}
                                    </span>
                                    <span>{city.localAmendments} local amendments</span>
                                  </div>
                                </div>
                              </div>
                              <ChevronRight className="h-5 w-5 text-muted-foreground" />
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            /* Map View */
            <Card className="overflow-hidden">
              <CardContent className="p-0">
                <div className="h-[600px] bg-surface-2 flex items-center justify-center">
                  <div className="text-center">
                    <Map className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Interactive Map</h3>
                    <p className="text-sm text-muted-foreground max-w-md">
                      Map view requires Mapbox integration. Click on counties and cities 
                      to view building department details.
                    </p>
                    <p className="text-xs text-muted-foreground mt-4">
                      Add NEXT_PUBLIC_MAPBOX_TOKEN to enable
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  )
}
