# Data Collection Strategy

## Overview

The Minnesota Building Code Database requires systematic collection of building codes, local amendments, permit requirements, and fee schedules from multiple sources across 87 counties and 853+ cities.

## Data Source Hierarchy

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         DATA SOURCE HIERARCHY                                │
└─────────────────────────────────────────────────────────────────────────────┘

TIER 1: State-Level Sources (Highest Authority)
├── Minnesota Department of Labor and Industry (DLI)
│   └── https://www.dli.mn.gov/business/codes-and-laws
├── Minnesota Rules (Office of the Revisor)
│   └── https://www.revisor.mn.gov/rules/
├── Minnesota State Building Code (Chapters 1300-1370)
│   └── IRC, IBC, IPC, IMC, IECC, NEC adoptions
└── State Fire Marshal
    └── Fire code amendments

TIER 2: Metro Area (7-County) - Priority
├── Hennepin County (45 cities)
├── Ramsey County (18 cities)
├── Dakota County (34 cities)
├── Anoka County (21 cities)
├── Washington County (28 cities)
├── Scott County (17 cities)
└── Carver County (11 cities)

TIER 3: Greater Minnesota
├── Regional centers (Duluth, Rochester, St. Cloud)
├── County seats
└── Cities > 10,000 population

TIER 4: Rural Areas
├── Smaller cities
├── Townships (county-enforced)
└── Unincorporated areas
```

## Data Collection Pipeline

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       DATA COLLECTION PIPELINE                               │
└─────────────────────────────────────────────────────────────────────────────┘

     ┌──────────────┐
     │   Sources    │
     │  - Websites  │
     │  - PDFs      │
     │  - APIs      │
     └──────┬───────┘
            │
            ▼
     ┌──────────────┐
     │   Scrapers   │
     │  - Playwright│
     │  - Cheerio   │
     │  - PDF Parse │
     └──────┬───────┘
            │
            ▼
     ┌──────────────┐
     │  Raw Data    │
     │   Storage    │
     │  (Staging)   │
     └──────┬───────┘
            │
            ▼
     ┌──────────────┐
     │  AI Extract  │
     │   (Claude)   │
     │  - Parse     │
     │  - Structure │
     │  - Validate  │
     └──────┬───────┘
            │
            ▼
     ┌──────────────┐
     │  Normalize   │
     │  - Schema    │
     │  - Types     │
     │  - Relations │
     └──────┬───────┘
            │
            ▼
     ┌──────────────┐
     │  Embeddings  │
     │  - Generate  │
     │  - Store     │
     └──────┬───────┘
            │
            ▼
     ┌──────────────┐
     │  Production  │
     │   Database   │
     │  (Supabase)  │
     └─────────────┘
```

## Scraper Architecture

### Base Scraper Class

```python
# lib/scrapers/base.py
from abc import ABC, abstractmethod
from playwright.async_api import async_playwright
import anthropic

class JurisdictionScraper(ABC):
    def __init__(self, jurisdiction_id: str):
        self.jurisdiction_id = jurisdiction_id
        self.client = anthropic.Anthropic()
    
    @abstractmethod
    async def scrape_permits(self) -> list[dict]:
        """Scrape permit types and requirements"""
        pass
    
    @abstractmethod
    async def scrape_fees(self) -> list[dict]:
        """Scrape fee schedules"""
        pass
    
    @abstractmethod
    async def scrape_contacts(self) -> dict:
        """Scrape department contact info"""
        pass
    
    async def parse_pdf_with_ai(self, pdf_url: str, schema: dict) -> dict:
        """Use Claude to extract structured data from PDF"""
        # Download PDF
        pdf_content = await self.download_pdf(pdf_url)
        
        # Extract with Claude
        response = self.client.messages.create(
            model="claude-sonnet-4-20250514",
            max_tokens=4096,
            messages=[{
                "role": "user",
                "content": [
                    {
                        "type": "document",
                        "source": {
                            "type": "base64",
                            "media_type": "application/pdf",
                            "data": pdf_content
                        }
                    },
                    {
                        "type": "text",
                        "text": f"Extract the following data from this document:\n{schema}"
                    }
                ]
            }]
        )
        return self.parse_response(response)
```

### City-Specific Scrapers

```python
# lib/scrapers/minneapolis.py
class MinneapolisScraper(JurisdictionScraper):
    BASE_URL = "https://www.minneapolismn.gov"
    
    async def scrape_permits(self):
        async with async_playwright() as p:
            browser = await p.chromium.launch()
            page = await browser.new_page()
            
            await page.goto(f"{self.BASE_URL}/government/departments/community-planning-economic-development/development-services/permits")
            
            # Extract permit types
            permits = await page.query_selector_all('.permit-type-card')
            results = []
            
            for permit in permits:
                name = await permit.query_selector('.permit-name')
                description = await permit.query_selector('.permit-description')
                results.append({
                    'permit_name': await name.inner_text(),
                    'description': await description.inner_text(),
                    'jurisdiction_id': self.jurisdiction_id
                })
            
            await browser.close()
            return results
    
    async def scrape_fees(self):
        # Minneapolis publishes fees as PDF
        fee_pdf_url = f"{self.BASE_URL}/media/fee-schedule.pdf"
        
        schema = {
            "permit_type": "string",
            "fee_type": "flat|valuation_based|per_unit",
            "flat_fee": "number or null",
            "base_fee": "number or null",
            "per_thousand_rate": "number or null",
            "effective_date": "date"
        }
        
        return await self.parse_pdf_with_ai(fee_pdf_url, schema)
```

## AI-Assisted Extraction

### Fee Schedule Parsing

```python
async def parse_fee_schedule_pdf(pdf_url: str) -> list[dict]:
    """Extract structured fee data from PDF using Claude"""
    
    prompt = """
    Extract all permit fees from this fee schedule document.
    For each fee, provide:
    
    1. permit_type: The type of permit (building, electrical, plumbing, etc.)
    2. fee_type: One of:
       - "flat" (fixed amount regardless of project size)
       - "valuation_based" (calculated from project value)
       - "per_unit" (per fixture, circuit, sq ft, etc.)
       - "tiered" (different rates for different value ranges)
    3. For flat fees:
       - flat_fee: The fixed amount
    4. For valuation-based fees:
       - valuation_min: Minimum project value for this tier
       - valuation_max: Maximum project value for this tier
       - base_fee: Base fee amount
       - per_thousand_rate: Additional fee per $1000 of valuation
    5. For per-unit fees:
       - unit_type: What unit (fixture, circuit, sq ft)
       - per_unit_fee: Fee per unit
    6. plan_review_fee: If separate plan review fee exists
    7. plan_review_percentage: If plan review is % of permit fee
    
    Return as JSON array.
    """
    
    # Claude API call with PDF
    response = await extract_with_claude(pdf_url, prompt)
    return response
```

### Code Section Extraction

```python
async def extract_code_sections(code_text: str, code_id: str) -> list[dict]:
    """Parse code text into searchable sections"""
    
    prompt = """
    Parse this building code text into individual sections.
    For each section provide:
    
    1. section_number: The section reference (e.g., "R302.1")
    2. section_title: The section heading
    3. full_text: Complete section text
    4. summary: 1-2 sentence plain English summary
    5. category: Main category (Structural, Fire Safety, Egress, etc.)
    6. subcategory: More specific category
    7. tags: Array of relevant keywords for search
    
    Focus on practical requirements that contractors need to know.
    """
    
    response = await extract_with_claude(code_text, prompt)
    return response
```

## Data Quality Checks

### Validation Rules

```typescript
// lib/validation/jurisdiction.ts
import { z } from 'zod'

export const JurisdictionSchema = z.object({
  name: z.string().min(1),
  type: z.enum(['state', 'county', 'city', 'township']),
  county_id: z.string().uuid().optional(),
  building_department_phone: z.string()
    .regex(/^\d{3}-\d{3}-\d{4}$|^311$/)
    .optional(),
  building_department_email: z.string().email().optional(),
  website_url: z.string().url().optional(),
  permit_portal_url: z.string().url().optional(),
  population: z.number().int().positive().optional(),
})

export const PermitFeeSchema = z.object({
  permit_type_id: z.string().uuid(),
  jurisdiction_id: z.string().uuid(),
  fee_type: z.enum(['flat', 'valuation_based', 'per_unit', 'tiered', 'calculated']),
  flat_fee: z.number().positive().optional(),
  base_fee: z.number().positive().optional(),
  per_thousand_rate: z.number().positive().optional(),
  effective_date: z.string().datetime(),
}).refine(data => {
  // Flat fees must have flat_fee
  if (data.fee_type === 'flat' && !data.flat_fee) {
    return false
  }
  // Valuation-based must have rate
  if (data.fee_type === 'valuation_based' && !data.per_thousand_rate) {
    return false
  }
  return true
})
```

### Automated Checks

```typescript
// lib/validation/checks.ts
export async function validateJurisdictionData(jurisdictionId: string) {
  const checks = [
    checkContactInfo,
    checkPermitTypes,
    checkFeeSchedule,
    checkInspectionTypes,
    checkLocalAmendments,
  ]
  
  const results = await Promise.all(
    checks.map(check => check(jurisdictionId))
  )
  
  return {
    jurisdictionId,
    passed: results.every(r => r.passed),
    checks: results,
    coverage: calculateCoverage(results),
  }
}

async function checkContactInfo(jurisdictionId: string) {
  const { data } = await supabase
    .from('jurisdictions')
    .select('building_department_phone, building_department_email, website_url')
    .eq('id', jurisdictionId)
    .single()
  
  return {
    name: 'contact_info',
    passed: !!(data?.building_department_phone || data?.building_department_email),
    details: {
      hasPhone: !!data?.building_department_phone,
      hasEmail: !!data?.building_department_email,
      hasWebsite: !!data?.website_url,
    }
  }
}
```

## Collection Schedule

### Priority Order

1. **Week 1-2**: State codes and rules
2. **Week 3-4**: Minneapolis, St. Paul (largest cities)
3. **Week 5-8**: Remaining Hennepin County cities
4. **Week 9-12**: Other metro counties
5. **Month 4+**: Greater Minnesota

### Automated Updates

```typescript
// lib/scrapers/scheduler.ts
import { CronJob } from 'cron'

// Check for fee schedule updates monthly
const feeUpdateJob = new CronJob('0 0 1 * *', async () => {
  const jurisdictions = await getActiveJurisdictions()
  
  for (const jurisdiction of jurisdictions) {
    const scraper = getScraperForJurisdiction(jurisdiction.id)
    const currentFees = await scraper.scrape_fees()
    const storedFees = await getStoredFees(jurisdiction.id)
    
    if (hasChanges(currentFees, storedFees)) {
      await updateFees(jurisdiction.id, currentFees)
      await notifyAdmin('fee_update', jurisdiction)
    }
  }
})

// Check for new ordinances weekly
const ordinanceJob = new CronJob('0 0 * * 0', async () => {
  // Monitor city council agendas for building code changes
})
```

## Manual Data Entry

### Admin Interface

For jurisdictions without scrapeable websites:

```typescript
// app/admin/jurisdictions/[id]/page.tsx
export default function JurisdictionAdmin({ params }) {
  return (
    <form onSubmit={handleSubmit}>
      <h2>Manual Data Entry: {jurisdiction.name}</h2>
      
      {/* Contact Information */}
      <section>
        <h3>Building Department Contact</h3>
        <Input name="building_department_name" />
        <Input name="building_department_phone" />
        <Input name="building_department_email" />
        <Input name="building_department_address" />
        <Input name="website_url" />
        <Input name="permit_portal_url" />
      </section>
      
      {/* Permit Types */}
      <section>
        <h3>Permit Types</h3>
        <PermitTypeEditor jurisdictionId={params.id} />
      </section>
      
      {/* Fee Schedule */}
      <section>
        <h3>Fee Schedule</h3>
        <FeeScheduleEditor jurisdictionId={params.id} />
        <FileUpload 
          label="Upload Fee Schedule PDF"
          onUpload={handleFeeScheduleUpload}
        />
      </section>
      
      {/* Verification */}
      <section>
        <h3>Verification</h3>
        <DatePicker name="last_verified_date" />
        <Input name="verified_by" />
        <Textarea name="verification_notes" />
      </section>
      
      <Button type="submit">Save Changes</Button>
    </form>
  )
}
```

## Data Sources by Jurisdiction

### Minneapolis

| Data Type | Source | Method |
|-----------|--------|--------|
| Permits | minneapolismn.gov/permits | Scraper |
| Fees | PDF fee schedule | AI extraction |
| Contacts | Website | Scraper |
| Local amendments | Municode | Scraper |
| Inspections | Accela API | API |

### St. Paul

| Data Type | Source | Method |
|-----------|--------|--------|
| Permits | stpaul.gov/departments/safety-inspections | Scraper |
| Fees | PDF fee schedule | AI extraction |
| Contacts | Website | Scraper |
| Local amendments | City ordinances | Manual + AI |

### Hennepin County

| Data Type | Source | Method |
|-----------|--------|--------|
| Permits | hennepin.us/permits | Scraper |
| Fees | Website table | Scraper |
| Contacts | Website | Scraper |
| Jurisdiction list | County GIS | API |

## Embedding Generation

```typescript
// lib/embeddings/generate.ts
import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic()

export async function generateEmbedding(text: string): Promise<number[]> {
  // Use Claude to generate embeddings via the embedding endpoint
  // Note: As of 2026, you may want to use a dedicated embedding model
  
  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 1,
    messages: [{
      role: "user",
      content: `Generate a semantic embedding for search purposes. Text: ${text}`
    }]
  })
  
  // For production, use OpenAI's text-embedding-3-large or similar
  // This is a placeholder for the embedding generation approach
  return []
}

export async function generateEmbeddingsForCodeSections() {
  const sections = await supabase
    .from('code_sections')
    .select('id, full_text, summary')
    .is('embedding', null)
  
  for (const section of sections.data || []) {
    const textToEmbed = `${section.summary}\n\n${section.full_text}`
    const embedding = await generateEmbedding(textToEmbed)
    
    await supabase
      .from('code_sections')
      .update({ embedding })
      .eq('id', section.id)
  }
}
```
