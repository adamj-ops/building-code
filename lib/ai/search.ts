import { createClient } from '@/lib/supabase/server'
import { generateEmbedding } from './embeddings'
import { generateSearchSummary, parseSearchQuery, CodeSearchResult } from './summaries'

export interface SearchOptions {
  query: string
  jurisdiction?: string
  filters?: {
    codeTypes?: string[]
    categories?: string[]
    includeAmendments?: boolean
  }
  options?: {
    includeAiSummary?: boolean
    limit?: number
    offset?: number
  }
}

export interface SearchResponse {
  queryInterpretation: {
    intent: string
    entities: string[]
    jurisdictionResolved: {
      id: string | null
      name: string
      type: string | null
      county: string | null
    }
  }
  results: CodeSearchResult[]
  aiSummary?: string
  relatedSections: Array<{
    id: string
    section: string
    title: string
    relationship: string
  }>
  totalCount: number
  hasMore: boolean
}

/**
 * Perform a hybrid search combining full-text and semantic search
 */
export async function hybridSearch(options: SearchOptions): Promise<SearchResponse> {
  const { query, jurisdiction, filters, options: searchOptions } = options
  const limit = searchOptions?.limit || 20
  const offset = searchOptions?.offset || 0
  const includeAiSummary = searchOptions?.includeAiSummary ?? true
  
  const supabase = await createClient()
  
  // Parse the query to understand intent and entities
  const queryAnalysis = await parseSearchQuery(query)
  
  // Resolve jurisdiction
  let jurisdictionData = {
    id: null as string | null,
    name: jurisdiction || 'All Minnesota',
    type: null as string | null,
    county: null as string | null
  }
  
  if (jurisdiction && jurisdiction !== 'all-minnesota') {
    const { data: jurisdictionResult } = await supabase
      .from('jurisdictions')
      .select('id, name, type, county_id')
      .or(`name.ilike.%${jurisdiction}%,id.eq.${jurisdiction}`)
      .limit(1)
      .single()
    
    if (jurisdictionResult) {
      const result = jurisdictionResult as { id: string; name: string; type: string | null; county_id: string | null }
      jurisdictionData = {
        id: result.id,
        name: result.name,
        type: result.type,
        county: null // Would need another query to get county name
      }
    }
  }
  
  // Perform full-text search
  const fullTextResults = await performFullTextSearch(supabase, query, filters, limit * 2)
  
  // Perform semantic search (if we have embeddings)
  // For now, we'll skip this since we haven't populated embeddings yet
  // const semanticResults = await performSemanticSearch(supabase, query, filters, limit * 2)
  
  // Merge and deduplicate results
  const mergedResults = mergeResults(fullTextResults, [], limit)
  
  // Fetch local amendments for the jurisdiction if specified
  if (jurisdictionData.id && (filters?.includeAmendments !== false)) {
    await enrichWithLocalAmendments(supabase, mergedResults, jurisdictionData.id)
  }
  
  // Generate AI summary if requested
  let aiSummary: string | undefined
  if (includeAiSummary && mergedResults.length > 0) {
    try {
      aiSummary = await generateSearchSummary({
        query,
        jurisdiction: jurisdictionData.name,
        results: mergedResults
      })
    } catch (error) {
      console.error('Failed to generate AI summary:', error)
    }
  }
  
  // Find related sections
  const relatedSections = await findRelatedSections(supabase, mergedResults.slice(0, 3))
  
  return {
    queryInterpretation: {
      intent: queryAnalysis.intent,
      entities: queryAnalysis.entities,
      jurisdictionResolved: jurisdictionData
    },
    results: mergedResults.slice(offset, offset + limit),
    aiSummary,
    relatedSections,
    totalCount: mergedResults.length,
    hasMore: mergedResults.length > offset + limit
  }
}

/**
 * Perform full-text search using PostgreSQL tsvector
 */
async function performFullTextSearch(
  supabase: Awaited<ReturnType<typeof createClient>>,
  query: string,
  filters: SearchOptions['filters'],
  limit: number
): Promise<CodeSearchResult[]> {
  // Build the search terms - convert to OR search for better results
  const searchTerms = query.trim().split(/\s+/).filter(t => t.length > 2)
  
  if (searchTerms.length === 0) {
    return []
  }
  
  // Use OR query for broader matching
  const tsQuery = searchTerms.join(' | ')
  
  // Build the search query using raw filter for text search
  const { data, error } = await supabase
    .from('code_sections')
    .select(`
      id,
      section_number,
      section_title,
      full_text,
      summary,
      category,
      base_code_id,
      base_codes!inner (
        code_name,
        code_abbreviation
      )
    `)
    .or(`section_title.ilike.%${searchTerms[0]}%,full_text.ilike.%${searchTerms[0]}%,summary.ilike.%${searchTerms[0]}%`)
    .limit(limit)
  
  if (error) {
    console.error('Full-text search error:', error)
    return []
  }
  
  return (data || []).map((row: any, index: number) => ({
    id: row.id,
    section_number: row.section_number,
    section_title: row.section_title,
    full_text: row.full_text,
    summary: row.summary,
    category: row.category,
    base_code_name: row.base_codes?.code_name,
    base_code_abbreviation: row.base_codes?.code_abbreviation,
    relevance_score: 1 - (index * 0.05), // Approximate score based on position
    local_amendments: []
  }))
}

/**
 * Perform semantic search using vector embeddings
 */
async function performSemanticSearch(
  supabase: Awaited<ReturnType<typeof createClient>>,
  query: string,
  filters: SearchOptions['filters'],
  limit: number
): Promise<CodeSearchResult[]> {
  // Generate embedding for the query
  const queryEmbedding = await generateEmbedding(query)
  
  // Search using vector similarity
  // Note: This requires the embedding column to be populated
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any).rpc('match_code_sections', {
    query_embedding: queryEmbedding,
    match_threshold: 0.7,
    match_count: limit
  })
  
  if (error) {
    console.error('Semantic search error:', error)
    return []
  }
  
  return (data || []).map((row: any) => ({
    id: row.id,
    section_number: row.section_number,
    section_title: row.section_title,
    full_text: row.full_text,
    summary: row.summary,
    category: row.category,
    base_code_name: row.base_code_name,
    base_code_abbreviation: row.base_code_abbreviation,
    relevance_score: row.similarity,
    local_amendments: []
  }))
}

/**
 * Merge results from full-text and semantic search
 */
function mergeResults(
  fullTextResults: CodeSearchResult[],
  semanticResults: CodeSearchResult[],
  limit: number
): CodeSearchResult[] {
  const seen = new Set<string>()
  const merged: CodeSearchResult[] = []
  
  // Interleave results, preferring higher scores
  const allResults = [...fullTextResults, ...semanticResults]
    .sort((a, b) => (b.relevance_score || 0) - (a.relevance_score || 0))
  
  for (const result of allResults) {
    if (!seen.has(result.id)) {
      seen.add(result.id)
      merged.push(result)
      if (merged.length >= limit) break
    }
  }
  
  return merged
}

/**
 * Enrich results with local amendments
 */
async function enrichWithLocalAmendments(
  supabase: Awaited<ReturnType<typeof createClient>>,
  results: CodeSearchResult[],
  jurisdictionId: string
): Promise<void> {
  if (results.length === 0) return
  
  const sectionIds = results.map(r => r.id)
  
  const { data: amendments } = await supabase
    .from('local_amendments')
    .select(`
      code_section_id,
      amendment_type,
      amendment_text,
      jurisdictions!inner (
        name
      )
    `)
    .in('code_section_id', sectionIds)
    .eq('jurisdiction_id', jurisdictionId)
  
  if (!amendments) return
  
  // Map amendments to results
  const amendmentMap = new Map<string, Array<{
    jurisdiction: string
    amendment_type: string
    text: string
  }>>()
  
  for (const amendment of amendments as any[]) {
    const existing = amendmentMap.get(amendment.code_section_id) || []
    existing.push({
      jurisdiction: amendment.jurisdictions?.name || 'Unknown',
      amendment_type: amendment.amendment_type,
      text: amendment.amendment_text
    })
    amendmentMap.set(amendment.code_section_id, existing)
  }
  
  for (const result of results) {
    result.local_amendments = amendmentMap.get(result.id) || []
  }
}

/**
 * Find related code sections
 */
async function findRelatedSections(
  supabase: Awaited<ReturnType<typeof createClient>>,
  results: CodeSearchResult[]
): Promise<Array<{
  id: string
  section: string
  title: string
  relationship: string
}>> {
  if (results.length === 0) return []
  
  // Get categories from top results
  const categories = [...new Set(results.map(r => r.category).filter(Boolean))]
  
  if (categories.length === 0) return []
  
  // Find other sections in the same categories
  const { data } = await supabase
    .from('code_sections')
    .select('id, section_number, section_title, category')
    .in('category', categories)
    .not('id', 'in', `(${results.map(r => r.id).join(',')})`)
    .limit(5)
  
  return (data || []).map((row: any) => ({
    id: row.id,
    section: row.section_number,
    title: row.section_title,
    relationship: 'related'
  }))
}
