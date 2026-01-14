# API Reference

## Base URL

- **Development**: `http://localhost:3000/api`
- **Production**: `https://mn-building-codes.vercel.app/api`

## Authentication

Currently, the API is public for read operations. Write operations (admin) require authentication via Supabase Auth.

```typescript
// Include auth header for protected endpoints
headers: {
  'Authorization': `Bearer ${supabaseAccessToken}`
}
```

---

## Code Search

### POST `/api/codes/search`

Natural language search across building codes with AI-powered summaries.

#### Request Body

```typescript
{
  query: string           // Natural language search query
  jurisdiction?: string   // Jurisdiction ID or name (optional)
  filters?: {
    code_types?: string[] // ['IRC', 'IBC', 'IPC', 'IMC', 'IECC']
    categories?: string[] // ['structural', 'fire_safety', 'egress', etc.]
    include_amendments?: boolean // Include local amendments (default: true)
  }
  options?: {
    include_ai_summary?: boolean  // Generate AI summary (default: true)
    limit?: number                // Max results (default: 20, max: 100)
    offset?: number               // Pagination offset
  }
}
```

#### Response

```typescript
{
  query_interpretation: {
    intent: string        // 'requirement_lookup' | 'definition' | 'comparison'
    entities: string[]    // Extracted entities ['egress', 'window', 'bedroom']
    jurisdiction_resolved: {
      id: string
      name: string
      type: string
      county: string
    }
  }
  results: [{
    id: string
    source: string        // 'IRC 2020'
    section: string       // 'R310.1'
    title: string
    text: string
    summary: string
    relevance_score: number
    local_amendments: [{
      jurisdiction: string
      amendment_type: string
      text: string
    }]
  }]
  ai_summary?: string     // AI-generated plain English summary
  related_sections: [{
    id: string
    section: string
    title: string
    relationship: string  // 'references' | 'referenced_by' | 'related'
  }]
  total_count: number
  has_more: boolean
}
```

#### Example

```bash
curl -X POST https://api.example.com/api/codes/search \
  -H "Content-Type: application/json" \
  -d '{
    "query": "egress window requirements for basement bedroom",
    "jurisdiction": "minneapolis",
    "options": {
      "include_ai_summary": true,
      "limit": 10
    }
  }'
```

---

## Jurisdictions

### GET `/api/jurisdictions`

List all jurisdictions with optional filtering.

#### Query Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `type` | string | Filter by type: 'state', 'county', 'city', 'township' |
| `county` | string | Filter by county ID or name |
| `search` | string | Search by jurisdiction name |
| `has_amendments` | boolean | Only jurisdictions with local amendments |
| `limit` | number | Max results (default: 50) |
| `offset` | number | Pagination offset |

#### Response

```typescript
{
  data: [{
    id: string
    name: string
    type: string
    county_name: string
    population: number
    has_local_amendments: boolean
    enforcement_authority: string
    data_coverage: string  // 'complete' | 'partial' | 'minimal'
    last_verified_date: string
  }]
  total_count: number
  has_more: boolean
}
```

#### Example

```bash
# Get all cities in Hennepin County
curl "https://api.example.com/api/jurisdictions?type=city&county=hennepin"

# Search for jurisdictions by name
curl "https://api.example.com/api/jurisdictions?search=bloom"
```

---

### GET `/api/jurisdictions/[id]`

Get detailed information for a specific jurisdiction.

#### Response

```typescript
{
  id: string
  name: string
  type: string
  fips_code: string
  gnis_code: string
  
  // Hierarchy
  parent_jurisdiction: {
    id: string
    name: string
    type: string
  }
  county: {
    id: string
    name: string
  }
  
  // Geography
  latitude: number
  longitude: number
  boundary_geojson: GeoJSON
  
  // Contact
  building_department: {
    name: string
    phone: string
    email: string
    address: string
    hours: string
  }
  website_url: string
  permit_portal_url: string
  
  // Stats
  population: number
  has_local_amendments: boolean
  amendment_count: number
  enforcement_authority: string
  
  // Data quality
  data_coverage: string
  last_verified_date: string
  
  // Related data counts
  permit_types_count: number
  inspection_types_count: number
  documents_count: number
}
```

---

### GET `/api/jurisdictions/[id]/permits`

Get all permit types for a jurisdiction.

#### Response

```typescript
{
  data: [{
    id: string
    permit_name: string
    permit_code: string
    permit_category: string
    description: string
    when_required: string
    exemptions: string
    
    // Requirements
    contractor_license_required: boolean
    license_type: string
    homeowner_can_pull: boolean
    
    // Process
    application_method: string
    application_url: string
    typical_processing_days: number
    expedited_available: boolean
    
    // Validity
    permit_validity_days: number
    extension_available: boolean
    
    // Fee info (summary)
    fee_type: string
    fee_range: {
      min: number
      max: number
    }
  }]
}
```

---

### GET `/api/jurisdictions/[id]/fees`

Get fee schedules for a jurisdiction.

#### Query Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `permit_type` | string | Filter by permit type ID |
| `category` | string | Filter by permit category |

#### Response

```typescript
{
  data: [{
    id: string
    permit_type: {
      id: string
      name: string
      category: string
    }
    fee_type: string
    
    // Fee details based on type
    flat_fee?: number
    valuation_tiers?: [{
      min: number
      max: number
      base_fee: number
      per_thousand_rate: number
    }]
    per_unit_fee?: number
    unit_type?: string
    
    // Additional fees
    plan_review_fee: number
    plan_review_percentage: number
    
    // Source
    fee_schedule_url: string
    effective_date: string
  }]
}
```

---

### GET `/api/jurisdictions/[id]/amendments`

Get local code amendments for a jurisdiction.

#### Response

```typescript
{
  data: [{
    id: string
    base_code: {
      id: string
      name: string
      abbreviation: string
    }
    code_section: {
      id: string
      section_number: string
      title: string
    }
    amendment_type: string
    amendment_title: string
    amendment_text: string
    original_text: string
    effective_date: string
    ordinance_number: string
    ordinance_url: string
  }]
}
```

---

## Fee Calculator

### POST `/api/fees/calculate`

Calculate permit fees for a specific project.

#### Request Body

```typescript
{
  jurisdiction_id: string
  permit_type_id: string
  
  // Project details (provide based on fee type)
  project_valuation?: number    // For valuation-based fees
  unit_count?: number           // For per-unit fees
  square_footage?: number       // For sq ft based fees
  
  // Options
  include_plan_review?: boolean // Include plan review fee (default: true)
  expedited?: boolean           // Calculate expedited fee (default: false)
}
```

#### Response

```typescript
{
  jurisdiction: {
    id: string
    name: string
  }
  permit_type: {
    id: string
    name: string
    category: string
  }
  
  // Calculated fees
  base_permit_fee: number
  plan_review_fee: number
  expedited_fee?: number
  total_fee: number
  
  // Calculation details
  calculation_method: string
  calculation_details: {
    fee_type: string
    valuation_tier?: {
      min: number
      max: number
      base_fee: number
      per_thousand_rate: number
    }
    formula?: string
  }
  
  // Source
  fee_schedule_url: string
  effective_date: string
  
  // Disclaimer
  disclaimer: string
}
```

#### Example

```bash
curl -X POST https://api.example.com/api/fees/calculate \
  -H "Content-Type: application/json" \
  -d '{
    "jurisdiction_id": "uuid-minneapolis",
    "permit_type_id": "uuid-building-permit",
    "project_valuation": 150000,
    "include_plan_review": true
  }'
```

---

## Permit Requirements

### POST `/api/permits/requirements`

Determine which permits are required for a scope of work.

#### Request Body

```typescript
{
  jurisdiction_id: string
  scope_items: [{
    category: string      // 'electrical', 'plumbing', 'structural', etc.
    item: string          // 'panel_upgrade', 'water_heater', 'deck', etc.
    details?: {
      value?: number      // Project value
      quantity?: number   // Number of units
      size?: number       // Square footage
    }
  }]
}
```

#### Response

```typescript
{
  jurisdiction: {
    id: string
    name: string
  }
  
  required_permits: [{
    permit_type: {
      id: string
      name: string
      category: string
    }
    triggered_by: string[]  // Which scope items triggered this
    reason: string          // Why permit is required
    code_reference: string  // Relevant code section
    
    // Process info
    application_method: string
    typical_processing_days: number
    estimated_fee_range: {
      min: number
      max: number
    }
  }]
  
  exemptions: [{
    scope_item: string
    reason: string          // Why no permit needed
    conditions: string      // Conditions for exemption
  }]
  
  inspections_required: [{
    permit_type: string
    inspections: [{
      name: string
      phase: string
      sequence_order: number
    }]
  }]
  
  total_estimated_fees: {
    min: number
    max: number
  }
  
  notes: string[]           // Additional guidance
}
```

---

## Error Responses

All endpoints return consistent error responses:

```typescript
{
  error: {
    code: string        // 'VALIDATION_ERROR', 'NOT_FOUND', 'SERVER_ERROR'
    message: string     // Human-readable error message
    details?: object    // Additional error details
  }
}
```

### HTTP Status Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 400 | Bad Request - Invalid input |
| 401 | Unauthorized - Auth required |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found - Resource doesn't exist |
| 429 | Too Many Requests - Rate limited |
| 500 | Server Error - Internal error |

---

## Rate Limits

| Endpoint | Limit |
|----------|-------|
| Search | 60 requests/minute |
| Jurisdictions | 120 requests/minute |
| Fee Calculator | 60 requests/minute |
| All others | 120 requests/minute |

Rate limit headers are included in responses:
```
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 45
X-RateLimit-Reset: 1704067200
```

---

## Webhooks (Future)

For data update notifications:

```typescript
// Webhook payload for fee schedule updates
{
  event: 'fee_schedule.updated'
  jurisdiction_id: string
  permit_type_id: string
  previous_effective_date: string
  new_effective_date: string
  changes: [{
    field: string
    old_value: any
    new_value: any
  }]
  timestamp: string
}
```
