import { NextResponse } from 'next/server'
import { hybridSearch, SearchOptions } from '@/lib/ai'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { query, jurisdiction, filters, options } = body as {
      query: string
      jurisdiction?: string
      filters?: {
        code_types?: string[]
        categories?: string[]
        include_amendments?: boolean
      }
      options?: {
        include_ai_summary?: boolean
        limit?: number
        offset?: number
      }
    }

    if (!query || typeof query !== 'string') {
      return NextResponse.json(
        { error: 'Query parameter is required' },
        { status: 400 }
      )
    }

    // Transform the request to match our internal API
    const searchOptions: SearchOptions = {
      query,
      jurisdiction,
      filters: {
        codeTypes: filters?.code_types,
        categories: filters?.categories,
        includeAmendments: filters?.include_amendments
      },
      options: {
        includeAiSummary: options?.include_ai_summary ?? true,
        limit: options?.limit || 20,
        offset: options?.offset || 0
      }
    }

    const result = await hybridSearch(searchOptions)

    // Transform the response to match the API spec
    return NextResponse.json({
      query_interpretation: {
        intent: result.queryInterpretation.intent,
        entities: result.queryInterpretation.entities,
        jurisdiction_resolved: {
          id: result.queryInterpretation.jurisdictionResolved.id,
          name: result.queryInterpretation.jurisdictionResolved.name,
          type: result.queryInterpretation.jurisdictionResolved.type,
          county: result.queryInterpretation.jurisdictionResolved.county
        }
      },
      results: result.results.map(r => ({
        id: r.id,
        source: `${r.base_code_abbreviation || 'Code'} 2020`,
        section: r.section_number,
        title: r.section_title,
        text: r.full_text,
        summary: r.summary,
        relevance_score: r.relevance_score,
        local_amendments: r.local_amendments
      })),
      ai_summary: result.aiSummary,
      related_sections: result.relatedSections.map(s => ({
        id: s.id,
        section: s.section,
        title: s.title,
        relationship: s.relationship
      })),
      total_count: result.totalCount,
      has_more: result.hasMore
    })
  } catch (error) {
    console.error('Search API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Also support GET for simple searches
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get('q')
  const jurisdiction = searchParams.get('jurisdiction')
  
  if (!query) {
    return NextResponse.json(
      { error: 'Query parameter (q) is required' },
      { status: 400 }
    )
  }

  // Convert to POST request format
  const body = {
    query,
    jurisdiction: jurisdiction || undefined,
    options: {
      include_ai_summary: searchParams.get('summary') !== 'false',
      limit: parseInt(searchParams.get('limit') || '20'),
      offset: parseInt(searchParams.get('offset') || '0')
    }
  }

  // Create a new request with the body
  const postRequest = new Request(request.url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  })

  return POST(postRequest)
}
