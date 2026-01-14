import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET /api/jurisdictions/[id] - Get single jurisdiction with full details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const supabase = await createClient()

    // Mock detailed jurisdiction data
    // TODO: Query from Supabase
    const mockJurisdiction = {
      id,
      name: "Minneapolis",
      type: "city",
      county: "Hennepin",
      population: 429954,
      has_local_amendments: true,
      enforcement_authority: "self",
      
      building_department: {
        name: "Development Services",
        address: "250 S 4th St, Room 300, Minneapolis, MN 55415",
        phone: "311 (local) or 612-673-3000",
        email: "permits@minneapolismn.gov",
        website: "minneapolismn.gov/permits",
        hours: "M-F 8:00 AM - 4:30 PM",
        permit_portal_url: "https://minneapolismn.gov/permits"
      },
      
      permits: [
        { type: "Building", category: "building", application: "Online", processing_days: 3, fee_range: "$50 - $5,000+" },
        { type: "Electrical", category: "electrical", application: "Online", processing_days: 1, fee_range: "$50 - $500" },
        { type: "Plumbing", category: "plumbing", application: "Online", processing_days: 1, fee_range: "$50 - $400" },
        { type: "Mechanical", category: "mechanical", application: "Online", processing_days: 1, fee_range: "$50 - $300" },
        { type: "Roofing", category: "roofing", application: "Online", processing_days: 1, fee_range: "$75 - $300" },
        { type: "Deck", category: "deck", application: "Online", processing_days: 3, fee_range: "$100 - $400" },
      ],
      
      local_amendments: [
        {
          id: "1",
          title: "Minneapolis Energy Disclosure Ordinance",
          type: "addition",
          description: "Commercial buildings must disclose energy benchmarking data annually.",
          effective_date: "2024-01-01"
        },
        {
          id: "2",
          title: "Rental Licensing Requirements",
          type: "stricter",
          description: "All rental properties require license and periodic inspection.",
          effective_date: null
        },
        {
          id: "3",
          title: "Lead Paint Disclosure (Pre-1978)",
          type: "stricter",
          description: "Enhanced disclosure and remediation requirements for properties built before 1978.",
          effective_date: "2020-03-01"
        }
      ],
      
      inspections: {
        scheduling_method: "Online or Phone",
        scheduling_url: "minneapolismn.gov/inspections",
        scheduling_phone: "311",
        advance_notice_hours: 24,
        inspection_windows: ["AM (7am-12pm)", "PM (12pm-5pm)"]
      },
      
      last_verified_date: "2026-01-10",
      data_status: "complete"
    }

    return NextResponse.json(mockJurisdiction)
  } catch (error) {
    console.error('Jurisdiction detail error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
