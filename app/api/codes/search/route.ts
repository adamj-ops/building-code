import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { query, jurisdiction, filters, options } = body

    if (!query || typeof query !== 'string') {
      return NextResponse.json(
        { error: 'Query is required' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // For now, return mock data
    // TODO: Implement actual search with pgvector embeddings
    const mockResults = [
      {
        id: "1",
        source: "IRC 2020",
        section: "R312.1",
        title: "Guards Required",
        text: "Guards shall be provided on open-sided walking surfaces, including stairs, ramps and landings, that are located more than 30 inches measured vertically to the floor or grade below.",
        relevance_score: 0.95,
        local_amendments: []
      }
    ]

    const response = {
      query_interpretation: {
        intent: "requirement_lookup",
        entities: query.split(' ').filter((w: string) => w.length > 3),
        jurisdiction_resolved: jurisdiction ? {
          name: jurisdiction,
          type: "city",
          county: "Hennepin"
        } : null
      },
      results: mockResults,
      ai_summary: options?.include_ai_summary 
        ? `Based on your search for "${query}", here are the relevant code sections...`
        : null,
      related_sections: []
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Search error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get('q')
  const jurisdiction = searchParams.get('jurisdiction')

  if (!query) {
    return NextResponse.json(
      { error: 'Query parameter "q" is required' },
      { status: 400 }
    )
  }

  // Redirect to POST handler logic
  const response = await POST(
    new NextRequest(request.url, {
      method: 'POST',
      body: JSON.stringify({ query, jurisdiction })
    })
  )

  return response
}
