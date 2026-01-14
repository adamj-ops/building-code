import { anthropic, CLAUDE_MODEL } from './client'

export interface CodeSearchResult {
  id: string
  section_number: string
  section_title: string
  full_text: string
  summary: string | null
  category: string | null
  base_code_name?: string
  base_code_abbreviation?: string
  relevance_score?: number
  local_amendments?: Array<{
    jurisdiction: string
    amendment_type: string
    text: string
  }>
}

export interface SearchSummaryInput {
  query: string
  jurisdiction: string
  results: CodeSearchResult[]
}

/**
 * Generate an AI summary of search results
 */
export async function generateSearchSummary(input: SearchSummaryInput): Promise<string> {
  const { query, jurisdiction, results } = input
  
  if (results.length === 0) {
    return `No relevant code sections found for "${query}" in ${jurisdiction}. Try broadening your search terms or checking a different jurisdiction.`
  }
  
  // Format the results for the prompt
  const formattedResults = results.slice(0, 5).map((r, i) => `
${i + 1}. ${r.base_code_abbreviation || 'Code'} ${r.section_number} - ${r.section_title}
${r.summary || r.full_text.substring(0, 300)}...
${r.local_amendments?.length ? `⚠️ Local amendments in: ${r.local_amendments.map(a => a.jurisdiction).join(', ')}` : ''}
`).join('\n')

  const prompt = `You are an expert on Minnesota building codes. A user searched for "${query}" in ${jurisdiction}.

Here are the most relevant code sections found:
${formattedResults}

Provide a concise, practical summary (3-5 bullet points) that:
1. Directly answers what the user is looking for
2. Highlights the key requirements with specific numbers (dimensions, heights, etc.)
3. Notes any local amendments that might apply
4. Uses plain language a contractor or homeowner would understand

Format your response as bullet points starting with •. Be specific and actionable.`

  try {
    const response = await anthropic.messages.create({
      model: CLAUDE_MODEL,
      max_tokens: 500,
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ]
    })
    
    const content = response.content[0]
    if (content.type === 'text') {
      return content.text
    }
    
    return 'Unable to generate summary.'
  } catch (error) {
    console.error('Error generating search summary:', error)
    // Return a fallback summary based on the first result
    const firstResult = results[0]
    return `For "${query}" in ${jurisdiction}:\n• See ${firstResult.base_code_abbreviation || 'Code'} Section ${firstResult.section_number} - ${firstResult.section_title}\n• ${firstResult.summary || firstResult.full_text.substring(0, 200)}...`
  }
}

/**
 * Parse a natural language query to extract entities and intent
 */
export async function parseSearchQuery(query: string): Promise<{
  intent: 'requirement_lookup' | 'definition' | 'comparison' | 'permit_check' | 'general'
  entities: string[]
  suggestedFilters: {
    categories?: string[]
    codeTypes?: string[]
  }
}> {
  const prompt = `Analyze this building code search query and extract key information.

Query: "${query}"

Respond in JSON format:
{
  "intent": "requirement_lookup" | "definition" | "comparison" | "permit_check" | "general",
  "entities": ["list", "of", "key", "terms"],
  "suggestedFilters": {
    "categories": ["relevant", "categories"],
    "codeTypes": ["IRC", "IBC", etc if mentioned]
  }
}

Categories can include: Egress, Guards, Stairs, Fire Safety, Structural, Electrical, Plumbing, HVAC, Energy, Accessibility, Foundation, Roofing, Exterior

Only respond with the JSON, no other text.`

  try {
    const response = await anthropic.messages.create({
      model: CLAUDE_MODEL,
      max_tokens: 200,
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ]
    })
    
    const content = response.content[0]
    if (content.type === 'text') {
      return JSON.parse(content.text)
    }
  } catch (error) {
    console.error('Error parsing search query:', error)
  }
  
  // Fallback: simple keyword extraction
  const words = query.toLowerCase().split(/\s+/)
  const entities = words.filter(w => w.length > 3 && !['what', 'where', 'when', 'requirements', 'need', 'does'].includes(w))
  
  return {
    intent: 'general',
    entities,
    suggestedFilters: {}
  }
}

/**
 * Generate a code section summary
 */
export async function generateCodeSectionSummary(
  sectionNumber: string,
  sectionTitle: string,
  fullText: string
): Promise<string> {
  const prompt = `Summarize this building code section in 1-2 sentences that a contractor or homeowner would understand.

Section: ${sectionNumber} - ${sectionTitle}
Text: ${fullText}

Focus on the practical requirement - what must be done and any specific measurements or thresholds.`

  try {
    const response = await anthropic.messages.create({
      model: CLAUDE_MODEL,
      max_tokens: 150,
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ]
    })
    
    const content = response.content[0]
    if (content.type === 'text') {
      return content.text
    }
  } catch (error) {
    console.error('Error generating section summary:', error)
  }
  
  // Fallback: return first sentence
  const firstSentence = fullText.split('.')[0]
  return firstSentence.length > 200 ? firstSentence.substring(0, 200) + '...' : firstSentence + '.'
}
