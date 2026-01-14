"use client"

import { useState } from "react"
import { useParams } from "next/navigation"
import { motion } from "framer-motion"
import Link from "next/link"
import { 
  ArrowLeft,
  Building2,
  Phone,
  Mail,
  Globe,
  MapPin,
  Clock,
  FileText,
  AlertTriangle,
  ChevronRight,
  ExternalLink,
  Calendar,
  DollarSign,
  CheckCircle2,
  Copy
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Sidebar } from "@/components/layout/sidebar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

// Mock jurisdiction data
const jurisdictionData: Record<string, {
  name: string
  type: string
  county: string
  population: number
  department: {
    name: string
    address: string
    phone: string
    email: string
    website: string
    hours: string
    portalUrl: string
  }
  permits: {
    type: string
    category: string
    application: string
    processing: string
    feeRange: string
  }[]
  amendments: {
    title: string
    type: string
    description: string
    effectiveDate: string
  }[]
  inspections: {
    method: string
    url: string
    phone: string
    leadTime: string
    windows: string
  }
}> = {
  minneapolis: {
    name: "Minneapolis",
    type: "City",
    county: "Hennepin",
    population: 429954,
    department: {
      name: "Development Services",
      address: "250 S 4th St, Room 300, Minneapolis, MN 55415",
      phone: "311 (local) or 612-673-3000",
      email: "permits@minneapolismn.gov",
      website: "minneapolismn.gov/permits",
      hours: "M-F 8:00 AM - 4:30 PM",
      portalUrl: "https://minneapolismn.gov/permits"
    },
    permits: [
      { type: "Building", category: "building", application: "Online", processing: "3-5 days", feeRange: "$50 - $5,000+" },
      { type: "Electrical", category: "electrical", application: "Online", processing: "1-2 days", feeRange: "$50 - $500" },
      { type: "Plumbing", category: "plumbing", application: "Online", processing: "1-2 days", feeRange: "$50 - $400" },
      { type: "Mechanical", category: "mechanical", application: "Online", processing: "Same day", feeRange: "$50 - $300" },
      { type: "Roofing", category: "roofing", application: "Online", processing: "1-2 days", feeRange: "$75 - $300" },
      { type: "Window/Siding", category: "window", application: "Online", processing: "1-3 days", feeRange: "$50 - $250" },
      { type: "Demolition", category: "demolition", application: "In-Person", processing: "5-10 days", feeRange: "$100 - $1,000" },
      { type: "Deck", category: "deck", application: "Online", processing: "3-5 days", feeRange: "$100 - $400" },
    ],
    amendments: [
      {
        title: "Minneapolis Energy Disclosure Ordinance",
        type: "addition",
        description: "Commercial buildings must disclose energy benchmarking data annually.",
        effectiveDate: "Jan 1, 2024"
      },
      {
        title: "Rental Licensing Requirements",
        type: "stricter",
        description: "All rental properties require license and periodic inspection.",
        effectiveDate: "Ongoing"
      },
      {
        title: "Lead Paint Disclosure (Pre-1978)",
        type: "stricter",
        description: "Enhanced disclosure and remediation requirements for properties built before 1978.",
        effectiveDate: "Mar 1, 2020"
      },
      {
        title: "Green Roof Requirements",
        type: "addition",
        description: "New commercial buildings over 20,000 sq ft must include green roof or solar.",
        effectiveDate: "Jul 1, 2023"
      },
    ],
    inspections: {
      method: "Online or Phone",
      url: "minneapolismn.gov/inspections",
      phone: "311",
      leadTime: "24 hours minimum",
      windows: "AM (7am-12pm) or PM (12pm-5pm)"
    }
  }
}

export default function JurisdictionDetailPage() {
  const params = useParams()
  const id = params.id as string
  const jurisdiction = jurisdictionData[id] || jurisdictionData.minneapolis

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      
      <main className="flex-1 overflow-auto">
        <div className="mx-auto max-w-5xl px-6 py-8">
          {/* Back Link */}
          <Link 
            href="/jurisdictions" 
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Jurisdictions
          </Link>

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="mb-8"
          >
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-3xl font-bold">{jurisdiction.name}</h1>
                  <Badge variant="secondary">{jurisdiction.type}</Badge>
                </div>
                <p className="text-muted-foreground">
                  {jurisdiction.county} County • Population {jurisdiction.population.toLocaleString()}
                </p>
              </div>
              <Button>
                <ExternalLink className="h-4 w-4 mr-2" />
                Visit Permit Portal
              </Button>
            </div>
          </motion.div>

          {/* Contact Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="mb-8"
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  Building Department Contact
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div>
                        <div className="font-medium">{jurisdiction.department.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {jurisdiction.department.address}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Phone className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <span className="font-medium">{jurisdiction.department.phone}</span>
                        <button 
                          onClick={() => copyToClipboard(jurisdiction.department.phone)}
                          className="ml-2 text-muted-foreground hover:text-foreground"
                        >
                          <Copy className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <Mail className="h-5 w-5 text-muted-foreground" />
                      <a 
                        href={`mailto:${jurisdiction.department.email}`}
                        className="text-emerald-400 hover:underline"
                      >
                        {jurisdiction.department.email}
                      </a>
                    </div>
                    <div className="flex items-center gap-3">
                      <Globe className="h-5 w-5 text-muted-foreground" />
                      <a 
                        href={`https://${jurisdiction.department.website}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-emerald-400 hover:underline"
                      >
                        {jurisdiction.department.website}
                      </a>
                    </div>
                    <div className="flex items-center gap-3">
                      <Clock className="h-5 w-5 text-muted-foreground" />
                      <span className="text-sm">Hours: {jurisdiction.department.hours}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Tabs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <Tabs defaultValue="permits" className="space-y-6">
              <TabsList>
                <TabsTrigger value="permits">
                  <FileText className="h-4 w-4 mr-2" />
                  Permits
                </TabsTrigger>
                <TabsTrigger value="amendments">
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  Local Amendments
                </TabsTrigger>
                <TabsTrigger value="inspections">
                  <Calendar className="h-4 w-4 mr-2" />
                  Inspections
                </TabsTrigger>
                <TabsTrigger value="fees">
                  <DollarSign className="h-4 w-4 mr-2" />
                  Fee Schedule
                </TabsTrigger>
              </TabsList>

              {/* Permits Tab */}
              <TabsContent value="permits">
                <Card>
                  <CardHeader>
                    <CardTitle>Available Permits</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-border">
                            <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Permit Type</th>
                            <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Application</th>
                            <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Processing</th>
                            <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Est. Fee Range</th>
                            <th className="py-3 px-4"></th>
                          </tr>
                        </thead>
                        <tbody>
                          {jurisdiction.permits.map((permit, index) => (
                            <tr key={index} className="border-b border-border last:border-0 hover:bg-surface-2 transition-colors">
                              <td className="py-3 px-4">
                                <span className="font-medium">{permit.type}</span>
                              </td>
                              <td className="py-3 px-4">
                                <Badge variant={permit.application === "Online" ? "primary" : "secondary"}>
                                  {permit.application}
                                </Badge>
                              </td>
                              <td className="py-3 px-4 text-sm text-muted-foreground">
                                {permit.processing}
                              </td>
                              <td className="py-3 px-4 text-sm">
                                {permit.feeRange}
                              </td>
                              <td className="py-3 px-4">
                                <Button variant="ghost" size="xs">
                                  Details
                                  <ChevronRight className="h-3.5 w-3.5 ml-1" />
                                </Button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <div className="mt-4 flex gap-3">
                      <Button variant="outline">
                        <ExternalLink className="h-4 w-4 mr-2" />
                        View Full Fee Schedule
                      </Button>
                      <Button variant="outline">
                        Download Application Forms
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Amendments Tab */}
              <TabsContent value="amendments">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>Local Code Amendments ({jurisdiction.amendments.length})</CardTitle>
                      <Badge variant="secondary">
                        Last updated: Jan 10, 2026
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {jurisdiction.amendments.map((amendment, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2, delay: index * 0.05 }}
                        className="p-4 rounded-lg border border-border bg-card hover:bg-surface-2 transition-colors"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <AlertTriangle className="h-4 w-4 text-amber-400" />
                            <h4 className="font-medium">{amendment.title}</h4>
                          </div>
                          <Badge 
                            variant="secondary"
                            className={
                              amendment.type === "stricter" 
                                ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                                : "bg-blue-500/10 text-blue-400 border-blue-500/20"
                            }
                          >
                            {amendment.type}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          {amendment.description}
                        </p>
                        <div className="text-xs text-muted-foreground">
                          Effective: {amendment.effectiveDate}
                        </div>
                      </motion.div>
                    ))}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Inspections Tab */}
              <TabsContent value="inspections">
                <Card>
                  <CardHeader>
                    <CardTitle>Inspection Scheduling</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div>
                          <div className="text-sm text-muted-foreground mb-1">Scheduling Method</div>
                          <div className="font-medium">{jurisdiction.inspections.method}</div>
                        </div>
                        <div>
                          <div className="text-sm text-muted-foreground mb-1">Online Portal</div>
                          <a 
                            href={`https://${jurisdiction.inspections.url}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-emerald-400 hover:underline"
                          >
                            {jurisdiction.inspections.url}
                          </a>
                        </div>
                        <div>
                          <div className="text-sm text-muted-foreground mb-1">Phone</div>
                          <div className="font-medium">{jurisdiction.inspections.phone}</div>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div>
                          <div className="text-sm text-muted-foreground mb-1">Lead Time Required</div>
                          <div className="font-medium">{jurisdiction.inspections.leadTime}</div>
                        </div>
                        <div>
                          <div className="text-sm text-muted-foreground mb-1">Inspection Windows</div>
                          <div className="font-medium">{jurisdiction.inspections.windows}</div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 p-4 rounded-lg bg-emerald-500/5 border border-emerald-500/20">
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                        <span className="font-medium text-emerald-400">Pro Tip</span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Schedule inspections at least 24 hours in advance. Morning slots (AM) 
                        typically have shorter wait times. Have your permit number ready when calling.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Fees Tab */}
              <TabsContent value="fees">
                <Card>
                  <CardHeader>
                    <CardTitle>Fee Schedule</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8">
                      <DollarSign className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">Fee Calculator</h3>
                      <p className="text-sm text-muted-foreground max-w-md mx-auto mb-4">
                        Use our fee calculator to estimate permit costs based on your project scope and valuation.
                      </p>
                      <Button asChild>
                        <Link href={`/fees?jurisdiction=${id}`}>
                          Calculate Fees
                          <ChevronRight className="h-4 w-4 ml-2" />
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </motion.div>
        </div>
      </main>
    </div>
  )
}
