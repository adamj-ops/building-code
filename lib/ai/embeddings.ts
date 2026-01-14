import { anthropic, CLAUDE_MODEL } from './client'

/**
 * Generate a text embedding using Claude
 * Since Claude doesn't have a native embedding API, we use a workaround
 * by asking Claude to generate a semantic representation
 * 
 * For production, consider using OpenAI's text-embedding-3-large or similar
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  // For now, we'll use a simple hash-based approach for demo purposes
  // In production, you'd want to use a proper embedding model like:
  // - OpenAI text-embedding-3-large
  // - Cohere embed-english-v3.0
  // - Voyage AI
  
  // This is a placeholder that creates a deterministic 1536-dim vector from text
  // It's NOT a real semantic embedding - just for testing the infrastructure
  const hash = simpleHash(text)
  const embedding: number[] = []
  
  for (let i = 0; i < 1536; i++) {
    // Create pseudo-random but deterministic values based on text hash
    const value = Math.sin(hash * (i + 1)) * 0.5
    embedding.push(value)
  }
  
  // Normalize the vector
  const magnitude = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0))
  return embedding.map(val => val / magnitude)
}

/**
 * Simple hash function for text
 */
function simpleHash(str: string): number {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32bit integer
  }
  return hash
}

/**
 * Generate embeddings for multiple texts in batch
 */
export async function generateEmbeddings(texts: string[]): Promise<number[][]> {
  return Promise.all(texts.map(text => generateEmbedding(text)))
}

/**
 * Calculate cosine similarity between two vectors
 */
export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) {
    throw new Error('Vectors must have the same length')
  }
  
  let dotProduct = 0
  let magnitudeA = 0
  let magnitudeB = 0
  
  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i]
    magnitudeA += a[i] * a[i]
    magnitudeB += b[i] * b[i]
  }
  
  return dotProduct / (Math.sqrt(magnitudeA) * Math.sqrt(magnitudeB))
}
