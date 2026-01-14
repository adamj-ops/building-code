import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET /api/jurisdictions - List jurisdictions with optional filters
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') // 'county' | 'city' | 'township'
    const county = searchParams.get('county')
    const search = searchParams.get('search')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    const supabase = await createClient()

    // For now, return mock data
    // TODO: Query from Supabase once tables are set up
    const mockJurisdictions = [
      {
        id: "minneapolis",
        name: "Minneapolis",
        type: "city",
        county: "Hennepin",
        population: 429954,
        has_local_amendments: true,
        enforcement_authority: "self",
        building_department_phone: "311",
        building_department_email: "permits@minneapolismn.gov",
        website_url: "minneapolismn.gov/permits",
        last_verified_date: "2026-01-10"
      },
      {
        id: "st-paul",
        name: "St. Paul",
        type: "city",
        county: "Ramsey",
        population: 311527,
        has_local_amendments: true,
        enforcement_authority: "self",
        building_department_phone: "651-266-8989",
        building_department_email: "dsi@stpaul.gov",
        website_url: "stpaul.gov/dsi",
        last_verified_date: "2026-01-08"
      },
      {
        id: "bloomington",
        name: "Bloomington",
        type: "city",
        county: "Hennepin",
        population: 89987,
        has_local_amendments: true,
        enforcement_authority: "self",
        building_department_phone: "952-563-8920",
        building_department_email: "permits@bloomingtonmn.gov",
        website_url: "bloomingtonmn.gov",
        last_verified_date: "2026-01-05"
      }
    ]

    // Apply filters
    let filtered = mockJurisdictions
    
    if (type) {
      filtered = filtered.filter(j => j.type === type)
    }
    
    if (county) {
      filtered = filtered.filter(j => 
        j.county.toLowerCase() === county.toLowerCase()
      )
    }
    
    if (search) {
      const searchLower = search.toLowerCase()
      filtered = filtered.filter(j => 
        j.name.toLowerCase().includes(searchLower) ||
        j.county.toLowerCase().includes(searchLower)
      )
    }

    // Pagination
    const total = filtered.length
    const paginated = filtered.slice(offset, offset + limit)

    return NextResponse.json({
      jurisdictions: paginated,
      pagination: {
        total,
        limit,
        offset,
        has_more: offset + limit < total
      }
    })
  } catch (error) {
    console.error('Jurisdictions error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
