# Database Schema Documentation

## Overview

The Minnesota Building Code Database uses Supabase (PostgreSQL) with the following extensions:
- `pgvector` - Vector similarity search for semantic queries
- `pg_trgm` - Trigram matching for fuzzy text search

## Entity Relationship Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          ENTITY RELATIONSHIPS                                │
└─────────────────────────────────────────────────────────────────────────────┘

                                ┌─────────────────┐
                                │  base_codes     │
                                │─────────────────│
                                │ id (PK)         │
                                │ code_name       │
                                │ code_year       │
                                │ mn_rules_chapter│
                                └────────┬────────┘
                                         │
                    ┌────────────────────┼────────────────────┐
                    │                    │                    │
                    ▼                    ▼                    ▼
         ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
         │  code_sections  │  │local_amendments │  │  jurisdictions  │
         │─────────────────│  │─────────────────│  │─────────────────│
         │ id (PK)         │  │ id (PK)         │  │ id (PK)         │
         │ base_code_id(FK)│◄─│ base_code_id(FK)│  │ name            │
         │ section_number  │  │ code_section(FK)│─►│ type            │
         │ full_text       │  │ jurisdiction(FK)│─►│ county_id (FK)  │◄─┐
         │ embedding       │  │ amendment_text  │  │ parent_id (FK)  │──┘
         │ search_vector   │  │ embedding       │  │ has_amendments  │
         └─────────────────┘  └─────────────────┘  └────────┬────────┘
                                                            │
                    ┌───────────────────┬───────────────────┼───────────────────┐
                    │                   │                   │                   │
                    ▼                   ▼                   ▼                   ▼
         ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
         │  permit_types   │  │inspection_types │  │   documents     │  │permit_requiremts│
         │─────────────────│  │─────────────────│  │─────────────────│  │─────────────────│
         │ id (PK)         │  │ id (PK)         │  │ id (PK)         │  │ id (PK)         │
         │ jurisdiction(FK)│  │ jurisdiction(FK)│  │ jurisdiction(FK)│  │ jurisdiction(FK)│
         │ permit_name     │  │ permit_type(FK) │  │ document_type   │  │ permit_type(FK) │
         │ permit_category │  │ inspection_name │  │ file_url        │  │ scope_category  │
         │ when_required   │  │ phase           │  │ extracted_text  │  │ trigger_cond    │
         └────────┬────────┘  └─────────────────┘  └─────────────────┘  └─────────────────┘
                  │
                  ▼
         ┌─────────────────┐
         │permit_fee_scheds│
         │─────────────────│
         │ id (PK)         │
         │ permit_type(FK) │
         │ jurisdiction(FK)│
         │ fee_type        │
         │ flat_fee        │
         │ per_thousand    │
         └─────────────────┘
```

## Table Definitions

### jurisdictions

Primary table for all Minnesota jurisdictions (state, counties, cities, townships).

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `name` | VARCHAR(255) | Jurisdiction name |
| `type` | ENUM | 'state', 'county', 'city', 'township' |
| `fips_code` | VARCHAR(10) | Federal ID code |
| `gnis_code` | VARCHAR(10) | Geographic Names ID |
| `parent_jurisdiction_id` | UUID (FK) | Self-reference for hierarchy |
| `county_id` | UUID (FK) | Reference to parent county |
| `latitude` | DECIMAL | Centroid latitude |
| `longitude` | DECIMAL | Centroid longitude |
| `boundary_geojson` | JSONB | GeoJSON boundary for maps |
| `building_department_name` | VARCHAR | Dept name |
| `building_department_phone` | VARCHAR | Contact phone |
| `building_department_email` | VARCHAR | Contact email |
| `building_department_address` | TEXT | Physical address |
| `website_url` | VARCHAR | Main website |
| `permit_portal_url` | VARCHAR | Online permit system |
| `population` | INTEGER | Population count |
| `has_local_amendments` | BOOLEAN | Has local code amendments |
| `enforcement_authority` | ENUM | 'self', 'county', 'state' |
| `last_verified_date` | DATE | Data verification date |
| `created_at` | TIMESTAMP | Record creation |
| `updated_at` | TIMESTAMP | Last update |

**Indexes:**
- `idx_jurisdictions_type` - Filter by jurisdiction type
- `idx_jurisdictions_county` - Filter by county
- `idx_jurisdictions_name_trgm` - Fuzzy name search

### base_codes

State-adopted model codes (ICC codes with MN amendments).

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `code_name` | VARCHAR | Full name (e.g., "International Residential Code") |
| `code_abbreviation` | VARCHAR | Short name (e.g., "IRC") |
| `code_year` | INTEGER | Edition year (e.g., 2020) |
| `code_organization` | VARCHAR | Publishing org (e.g., "ICC") |
| `effective_date` | DATE | When code became effective in MN |
| `supersedes_code_id` | UUID (FK) | Previous edition |
| `mn_rules_chapter` | VARCHAR | MN Rules reference (e.g., "1309") |
| `mn_adoption_date` | DATE | MN adoption date |
| `full_text_url` | VARCHAR | Link to full code text |
| `full_text_stored` | BOOLEAN | Whether we have full text |
| `created_at` | TIMESTAMP | Record creation |

### code_sections

Granular code sections for search indexing.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `base_code_id` | UUID (FK) | Parent code reference |
| `chapter` | VARCHAR | Chapter number |
| `section_number` | VARCHAR | Section reference (e.g., "R302.1") |
| `section_title` | VARCHAR | Section heading |
| `full_text` | TEXT | Complete section text |
| `summary` | TEXT | AI-generated summary |
| `category` | VARCHAR | Topic category |
| `subcategory` | VARCHAR | Sub-topic |
| `tags` | TEXT[] | Searchable tags |
| `search_vector` | TSVECTOR | Full-text search index |
| `embedding` | VECTOR(1536) | Semantic search embedding |
| `created_at` | TIMESTAMP | Record creation |

**Indexes:**
- `idx_code_sections_search` - GIN index on tsvector
- `idx_code_sections_embedding` - IVFFlat on vector
- `idx_code_sections_category` - Filter by category

### local_amendments

Jurisdiction-specific code modifications.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `jurisdiction_id` | UUID (FK) | Which jurisdiction |
| `base_code_id` | UUID (FK) | Which base code |
| `code_section_id` | UUID (FK) | Specific section amended |
| `amendment_type` | ENUM | 'addition', 'modification', 'deletion', 'stricter' |
| `amendment_title` | VARCHAR | Amendment name |
| `amendment_text` | TEXT | Amendment content |
| `original_text` | TEXT | Original text being modified |
| `effective_date` | DATE | When effective |
| `expiration_date` | DATE | If temporary |
| `ordinance_number` | VARCHAR | Local ordinance reference |
| `ordinance_url` | VARCHAR | Link to ordinance |
| `search_vector` | TSVECTOR | Full-text search |
| `embedding` | VECTOR(1536) | Semantic search |
| `created_at` | TIMESTAMP | Record creation |
| `updated_at` | TIMESTAMP | Last update |

### permit_types

Available permit types by jurisdiction.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `jurisdiction_id` | UUID (FK) | Which jurisdiction |
| `permit_name` | VARCHAR | Permit name |
| `permit_code` | VARCHAR | Internal code |
| `permit_category` | ENUM | Category (see enum below) |
| `description` | TEXT | What permit covers |
| `when_required` | TEXT | Conditions requiring permit |
| `exemptions` | TEXT | When NOT required |
| `contractor_license_required` | BOOLEAN | Licensed contractor needed |
| `license_type` | VARCHAR | Required license type |
| `homeowner_can_pull` | BOOLEAN | DIY allowed |
| `application_method` | ENUM | 'online', 'in_person', 'mail', 'either' |
| `application_url` | VARCHAR | Online application link |
| `application_form_url` | VARCHAR | PDF form link |
| `typical_processing_days` | INTEGER | Expected turnaround |
| `expedited_available` | BOOLEAN | Rush option exists |
| `expedited_fee_multiplier` | DECIMAL | Rush fee multiplier |
| `permit_validity_days` | INTEGER | Days until expiration |
| `extension_available` | BOOLEAN | Can extend |
| `created_at` | TIMESTAMP | Record creation |
| `updated_at` | TIMESTAMP | Last update |

**Permit Categories:**
- building, electrical, plumbing, mechanical
- roofing, siding, window, demolition
- grading, sign, fence, deck, other

### permit_fee_schedules

Fee calculation rules by permit type and jurisdiction.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `permit_type_id` | UUID (FK) | Which permit |
| `jurisdiction_id` | UUID (FK) | Which jurisdiction |
| `fee_type` | ENUM | 'flat', 'valuation_based', 'per_unit', 'tiered', 'calculated' |
| `flat_fee` | DECIMAL | Fixed fee amount |
| `valuation_min` | DECIMAL | Minimum project value |
| `valuation_max` | DECIMAL | Maximum project value |
| `base_fee` | DECIMAL | Base fee for tier |
| `per_thousand_rate` | DECIMAL | $ per $1000 valuation |
| `unit_type` | VARCHAR | Unit measure (sq ft, fixture, etc.) |
| `per_unit_fee` | DECIMAL | Fee per unit |
| `plan_review_fee` | DECIMAL | Flat plan review fee |
| `plan_review_percentage` | DECIMAL | Plan review as % of permit |
| `fee_schedule_url` | VARCHAR | Source document link |
| `effective_date` | DATE | When fees took effect |
| `created_at` | TIMESTAMP | Record creation |

### inspection_types

Required inspections by permit type.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `jurisdiction_id` | UUID (FK) | Which jurisdiction |
| `permit_type_id` | UUID (FK) | Which permit |
| `inspection_name` | VARCHAR | Inspection name |
| `inspection_code` | VARCHAR | Internal code |
| `phase` | ENUM | 'pre_construction', 'foundation', 'rough', 'insulation', 'final' |
| `typical_sequence_order` | INTEGER | Order in sequence |
| `prerequisite_inspections` | UUID[] | Must pass first |
| `description` | TEXT | What's inspected |
| `checklist_items` | TEXT[] | Inspector checklist |
| `common_failures` | TEXT[] | Why inspections fail |
| `scheduling_method` | ENUM | 'online', 'phone', 'app', 'either' |
| `scheduling_url` | VARCHAR | Online scheduling link |
| `scheduling_phone` | VARCHAR | Phone to schedule |
| `advance_notice_hours` | INTEGER | Lead time required |
| `inspection_window` | VARCHAR | Time window description |
| `created_at` | TIMESTAMP | Record creation |

### permit_requirements

Links scope of work to required permits.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `jurisdiction_id` | UUID (FK) | Which jurisdiction |
| `permit_type_id` | UUID (FK) | Which permit |
| `scope_category` | VARCHAR | Work category |
| `scope_item` | VARCHAR | Specific work item |
| `trigger_condition` | TEXT | When permit required |
| `threshold_value` | DECIMAL | Threshold amount |
| `threshold_unit` | VARCHAR | Unit (dollars, sq ft, etc.) |
| `permit_required` | BOOLEAN | Is permit required |
| `notes` | TEXT | Additional notes |
| `code_reference` | VARCHAR | Code section reference |
| `created_at` | TIMESTAMP | Record creation |

### documents

Source documents (PDFs, ordinances, forms).

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `jurisdiction_id` | UUID (FK) | Which jurisdiction |
| `document_type` | ENUM | Type (see below) |
| `title` | VARCHAR | Document title |
| `description` | TEXT | Description |
| `file_url` | VARCHAR | Storage URL |
| `file_type` | VARCHAR | MIME type |
| `file_size_bytes` | INTEGER | File size |
| `extracted_text` | TEXT | OCR/parsed text |
| `extraction_date` | TIMESTAMP | When extracted |
| `publish_date` | DATE | Publication date |
| `effective_date` | DATE | Effective date |
| `expiration_date` | DATE | Expiration date |
| `created_at` | TIMESTAMP | Record creation |

**Document Types:**
- ordinance, fee_schedule, application_form
- checklist, code_amendment, guide, other

## Enum Types

```sql
-- Jurisdiction types
CREATE TYPE jurisdiction_type AS ENUM ('state', 'county', 'city', 'township');

-- Enforcement authority
CREATE TYPE enforcement_authority AS ENUM ('self', 'county', 'state');

-- Amendment types
CREATE TYPE amendment_type AS ENUM ('addition', 'modification', 'deletion', 'stricter');

-- Permit categories
CREATE TYPE permit_category AS ENUM (
  'building', 'electrical', 'plumbing', 'mechanical',
  'roofing', 'siding', 'window', 'demolition',
  'grading', 'sign', 'fence', 'deck', 'other'
);

-- Application methods
CREATE TYPE permit_application_method AS ENUM ('online', 'in_person', 'mail', 'either');

-- Fee types
CREATE TYPE permit_fee_type AS ENUM ('flat', 'valuation_based', 'per_unit', 'tiered', 'calculated');

-- Inspection phases
CREATE TYPE inspection_phase AS ENUM ('pre_construction', 'foundation', 'rough', 'insulation', 'final');

-- Scheduling methods
CREATE TYPE permit_inspection_scheduling_method AS ENUM ('online', 'phone', 'app', 'either');

-- Document types
CREATE TYPE source_document_type AS ENUM (
  'ordinance', 'fee_schedule', 'application_form',
  'checklist', 'code_amendment', 'guide', 'other'
);
```

## Search Indexes

```sql
-- Full-text search on code sections
CREATE INDEX idx_code_sections_search 
ON code_sections USING GIN(search_vector);

-- Semantic search on code sections
CREATE INDEX idx_code_sections_embedding 
ON code_sections USING ivfflat(embedding vector_cosine_ops);

-- Full-text search on local amendments
CREATE INDEX idx_local_amendments_search 
ON local_amendments USING GIN(search_vector);

-- Jurisdiction lookups
CREATE INDEX idx_jurisdictions_type ON jurisdictions(type);
CREATE INDEX idx_jurisdictions_county ON jurisdictions(county_id);

-- Permit lookups
CREATE INDEX idx_permit_types_jurisdiction ON permit_types(jurisdiction_id);
CREATE INDEX idx_permit_types_category ON permit_types(permit_category);
```

## Sample Queries

### Find code sections by keyword
```sql
SELECT id, section_number, section_title, 
       ts_rank(search_vector, query) as rank
FROM code_sections, 
     plainto_tsquery('english', 'egress window bedroom') query
WHERE search_vector @@ query
ORDER BY rank DESC
LIMIT 20;
```

### Semantic search with embeddings
```sql
SELECT id, section_number, section_title,
       1 - (embedding <=> $1) as similarity
FROM code_sections
WHERE 1 - (embedding <=> $1) > 0.7
ORDER BY embedding <=> $1
LIMIT 20;
```

### Get jurisdiction with local amendments
```sql
SELECT j.*, 
       COUNT(la.id) as amendment_count
FROM jurisdictions j
LEFT JOIN local_amendments la ON la.jurisdiction_id = j.id
WHERE j.type = 'city' AND j.county_id = $1
GROUP BY j.id
ORDER BY j.population DESC;
```

### Calculate permit fee
```sql
SELECT 
  CASE 
    WHEN pfs.fee_type = 'flat' THEN pfs.flat_fee
    WHEN pfs.fee_type = 'valuation_based' THEN 
      pfs.base_fee + (($1 / 1000) * pfs.per_thousand_rate)
    WHEN pfs.fee_type = 'per_unit' THEN 
      $2 * pfs.per_unit_fee
  END as calculated_fee,
  pfs.plan_review_percentage
FROM permit_fee_schedules pfs
WHERE pfs.jurisdiction_id = $3
  AND pfs.permit_type_id = $4
  AND ($1 BETWEEN pfs.valuation_min AND pfs.valuation_max 
       OR pfs.fee_type = 'flat');
```
