import Anthropic from '@anthropic-ai/sdk'

// Initialize Anthropic client
const anthropic = new Anthropic({
  apiKey: process.env.CLAUDE_API_KEY,
})

export { anthropic }

// Model constants
export const CLAUDE_MODEL = 'claude-sonnet-4-20250514'
export const EMBEDDING_DIMENSIONS = 1536
