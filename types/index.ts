/**
 * Minnesota Building Code Database - TypeScript Type Definitions
 */

// Re-export database types
export * from './database'

// ============================================
// SEARCH TYPES
// ============================================

export interface SearchFilters {
  codeTypes?: string[]
  categories?: string[]
  jurisdictionId?: string
  effectiveDate?: string
}

export interface SearchOptions {
  includeAiSummary?: boolean
  includeRelatedSections?: boolean
  maxResults?: number
}

export interface SearchRequest {
  query: string
  jurisdiction?: string
  filters?: SearchFilters
  options?: SearchOptions
}

// ============================================
// FEE CALCULATOR TYPES
// ============================================

export interface PermitFeeInput {
  type: string
  valuation?: number
  quantity?: number
  unitCount?: number
}

export interface CalculatedFee {
  permitType: string
  baseFee: number
  planReviewFee: number
  totalFee: number
  notes?: string
}

export interface FeeCalculationRequest {
  jurisdictionId: string
  permits: PermitFeeInput[]
}

export interface FeeCalculationResponse {
  jurisdiction: string
  fees: CalculatedFee[]
  totalBaseFees: number
  totalPlanReviewFees: number
  grandTotal: number
  effectiveDate: string
  disclaimer: string
}

// ============================================
// PERMIT ANALYZER TYPES
// ============================================

export interface ScopeItem {
  id: string
  category: string
  item: string
  description?: string
  requiresPermit: boolean
  permitTypes: string[]
}

export interface PermitAnalysisRequest {
  jurisdictionId: string
  scopeItems: string[]
  propertyDetails?: {
    yearBuilt?: number
    propertyType?: string
    squareFootage?: number
  }
}

export interface PermitAnalysisResponse {
  jurisdiction: string
  requiredPermits: {
    type: string
    name: string
    estimatedFee: string
    processingTime: string
    applicationMethod: string
  }[]
  exemptions: string[]
  notes: string[]
  totalEstimatedFees: string
}

// ============================================
// MAP TYPES
// ============================================

export interface MapBounds {
  north: number
  south: number
  east: number
  west: number
}

export interface JurisdictionMapData {
  id: string
  name: string
  type: 'county' | 'city' | 'township'
  latitude: number
  longitude: number
  dataStatus: 'complete' | 'partial' | 'state_only'
  population?: number
}

// ============================================
// API RESPONSE TYPES
// ============================================

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    total: number
    limit: number
    offset: number
    hasMore: boolean
  }
}

export interface ApiError {
  code: string
  message: string
  details?: string
}

export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: ApiError
}

// ============================================
// DATA STATUS TYPES
// ============================================

export type DataStatus = 'complete' | 'partial' | 'state_only' | 'pending'

export const DATA_STATUS_CONFIG: Record<DataStatus, {
  label: string
  color: string
  bgColor: string
  borderColor: string
}> = {
  complete: {
    label: 'Complete',
    color: 'text-emerald-400',
    bgColor: 'bg-emerald-500/10',
    borderColor: 'border-emerald-500/20'
  },
  partial: {
    label: 'Partial',
    color: 'text-amber-400',
    bgColor: 'bg-amber-500/10',
    borderColor: 'border-amber-500/20'
  },
  state_only: {
    label: 'State Code Only',
    color: 'text-zinc-400',
    bgColor: 'bg-zinc-500/10',
    borderColor: 'border-zinc-500/20'
  },
  pending: {
    label: 'Pending',
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/20'
  }
}

// ============================================
// CODE CATEGORY TYPES
// ============================================

export type CodeCategory = 
  | 'structural'
  | 'electrical'
  | 'plumbing'
  | 'hvac'
  | 'egress'
  | 'roofing'
  | 'fire'
  | 'energy'
  | 'accessibility'
  | 'foundation'
  | 'exterior'
  | 'windows'

export const CODE_CATEGORIES: Record<CodeCategory, {
  label: string
  description: string
}> = {
  structural: { label: 'Structural', description: 'Load-bearing walls, beams, foundations' },
  electrical: { label: 'Electrical', description: 'Wiring, panels, outlets, fixtures' },
  plumbing: { label: 'Plumbing', description: 'Pipes, fixtures, water heaters' },
  hvac: { label: 'HVAC', description: 'Heating, ventilation, air conditioning' },
  egress: { label: 'Egress', description: 'Emergency exits, windows, doors' },
  roofing: { label: 'Roofing', description: 'Roof systems, materials, drainage' },
  fire: { label: 'Fire Safety', description: 'Smoke detectors, sprinklers, separation' },
  energy: { label: 'Energy', description: 'Insulation, efficiency, solar' },
  accessibility: { label: 'Accessibility', description: 'ADA compliance, ramps, clearances' },
  foundation: { label: 'Foundation', description: 'Footings, slabs, basement walls' },
  exterior: { label: 'Exterior', description: 'Siding, trim, decks, fences' },
  windows: { label: 'Windows', description: 'Glazing, installation, replacement' }
}
