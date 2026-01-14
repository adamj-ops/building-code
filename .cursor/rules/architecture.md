# System Architecture

## High-Level Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              CLIENT LAYER                                    │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│   ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐   │
│   │   Home /     │  │  Codes /     │  │ Jurisdictions│  │   Permits    │   │
│   │   Search     │  │  Browse      │  │   Browser    │  │   Analyzer   │   │
│   └──────┬───────┘  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘   │
│          │                 │                 │                 │            │
│          └─────────────────┴────────┬────────┴─────────────────┘            │
│                                     │                                        │
│                          ┌──────────▼──────────┐                            │
│                          │   Next.js App       │                            │
│                          │   (React + SSR)     │                            │
│                          └──────────┬──────────┘                            │
│                                     │                                        │
└─────────────────────────────────────┼────────────────────────────────────────┘
                                      │
┌─────────────────────────────────────┼────────────────────────────────────────┐
│                              API LAYER                                       │
├─────────────────────────────────────┼────────────────────────────────────────┤
│                                     │                                        │
│   ┌─────────────────────────────────▼─────────────────────────────────────┐ │
│   │                    Next.js API Routes                                  │ │
│   │  /api/codes/search  │  /api/jurisdictions  │  /api/fees/calculate     │ │
│   └─────────┬───────────┴──────────┬───────────┴───────────┬──────────────┘ │
│             │                      │                       │                 │
│   ┌─────────▼─────────┐  ┌─────────▼─────────┐  ┌─────────▼─────────┐      │
│   │  Search Service   │  │  Data Service     │  │  AI Service       │      │
│   │  - Full-text      │  │  - CRUD ops       │  │  - Claude API     │      │
│   │  - Semantic       │  │  - Caching        │  │  - Embeddings     │      │
│   │  - Hybrid         │  │  - Validation     │  │  - Summaries      │      │
│   └─────────┬─────────┘  └─────────┬─────────┘  └─────────┬─────────┘      │
│             │                      │                       │                 │
└─────────────┼──────────────────────┼───────────────────────┼─────────────────┘
              │                      │                       │
┌─────────────┼──────────────────────┼───────────────────────┼─────────────────┐
│             │            DATA LAYER                        │                 │
├─────────────┼──────────────────────┼───────────────────────┼─────────────────┤
│             │                      │                       │                 │
│   ┌─────────▼──────────────────────▼───────────────────────▼─────────────┐  │
│   │                         SUPABASE                                      │  │
│   │  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐       │  │
│   │  │   PostgreSQL    │  │    pgvector     │  │   Storage       │       │  │
│   │  │   - Tables      │  │   - Embeddings  │  │   - PDFs        │       │  │
│   │  │   - tsvector    │  │   - Similarity  │  │   - Documents   │       │  │
│   │  │   - Indexes     │  │   - Search      │  │   - Forms       │       │  │
│   │  └─────────────────┘  └─────────────────┘  └─────────────────┘       │  │
│   └──────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────────────┐
│                          DATA INGESTION LAYER                                │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│   ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐   │
│   │   State      │  │   City       │  │   PDF        │  │   Manual     │   │
│   │   Scraper    │  │   Scrapers   │  │   Parser     │  │   Entry      │   │
│   │  (MN Rules)  │  │ (Playwright) │  │  (Claude)    │  │   (Admin)    │   │
│   └──────┬───────┘  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘   │
│          │                 │                 │                 │            │
│          └─────────────────┴────────┬────────┴─────────────────┘            │
│                                     │                                        │
│                          ┌──────────▼──────────┐                            │
│                          │   Data Pipeline     │                            │
│                          │   - Validation      │                            │
│                          │   - Normalization   │                            │
│                          │   - Embedding Gen   │                            │
│                          └──────────┬──────────┘                            │
│                                     │                                        │
│                                     ▼                                        │
│                              [ Supabase DB ]                                 │
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘
```

## Component Details

### Frontend (Next.js 14 + React)

| Component | Purpose | Key Files |
|-----------|---------|-----------|
| Home Page | Search interface, quick actions | `app/page.tsx` |
| Jurisdictions | Browse/search jurisdictions | `app/jurisdictions/page.tsx` |
| Jurisdiction Detail | City-specific info, permits, fees | `app/jurisdictions/[id]/page.tsx` |
| Code Search | Search results with AI summaries | `app/search/page.tsx` |
| Permit Analyzer | Determine required permits | `app/permits/analyzer/page.tsx` |
| Fee Calculator | Estimate permit costs | `app/fees/page.tsx` |

### API Routes

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/codes/search` | POST | Natural language code search |
| `/api/jurisdictions` | GET | List/filter jurisdictions |
| `/api/jurisdictions/[id]` | GET | Get jurisdiction details |
| `/api/fees/calculate` | POST | Calculate permit fees |
| `/api/permits/requirements` | POST | Get permit requirements for scope |

### Database (Supabase/PostgreSQL)

See `database-schema.md` for complete schema documentation.

**Key Tables:**
- `jurisdictions` - Counties, cities, townships
- `base_codes` - State-adopted model codes (IRC, IBC, etc.)
- `code_sections` - Granular searchable code sections
- `local_amendments` - Jurisdiction-specific modifications
- `permit_types` - Available permits by jurisdiction
- `permit_fee_schedules` - Fee calculation rules
- `inspection_types` - Required inspections
- `permit_requirements` - When permits are required
- `documents` - Source PDFs and ordinances

### External Services

| Service | Purpose | Integration |
|---------|---------|-------------|
| Claude API | AI summaries, PDF parsing | Server-side only |
| Mapbox GL | Interactive jurisdiction maps | Client-side |
| Vercel | Hosting, edge functions | Deployment |

## Data Flow Diagrams

### Search Flow

```
User Query: "deck railing requirements in Minneapolis"
                    │
                    ▼
┌─────────────────────────────────────┐
│         Query Processing            │
│  1. Parse natural language          │
│  2. Extract entities (deck, railing)│
│  3. Identify jurisdiction           │
└─────────────────┬───────────────────┘
                  │
        ┌─────────┴─────────┐
        ▼                   ▼
┌───────────────┐   ┌───────────────┐
│  Full-Text    │   │   Semantic    │
│   Search      │   │    Search     │
│  (tsvector)   │   │  (pgvector)   │
└───────┬───────┘   └───────┬───────┘
        │                   │
        └─────────┬─────────┘
                  ▼
┌─────────────────────────────────────┐
│         Result Merging              │
│  1. Combine & deduplicate           │
│  2. Apply jurisdiction hierarchy    │
│  3. Include local amendments        │
│  4. Rank by relevance               │
└─────────────────┬───────────────────┘
                  │
                  ▼
┌─────────────────────────────────────┐
│         AI Enhancement              │
│  1. Generate summary (Claude)       │
│  2. Extract key requirements        │
│  3. Add practical guidance          │
└─────────────────┬───────────────────┘
                  │
                  ▼
            [ Response ]
```

### Jurisdiction Hierarchy

```
┌─────────────────────────────────────────────────────────┐
│                    State of Minnesota                    │
│                  (Base Code Authority)                   │
│                                                          │
│   Adopts: IRC 2020, IBC 2020, IPC 2020, IMC 2020, etc.  │
│   MN Rules Chapter: 1300-1370                           │
└────────────────────────┬────────────────────────────────┘
                         │
         ┌───────────────┼───────────────┐
         ▼               ▼               ▼
┌─────────────┐  ┌─────────────┐  ┌─────────────┐
│  Hennepin   │  │   Ramsey    │  │   Dakota    │
│   County    │  │   County    │  │   County    │
│             │  │             │  │             │
│ May enforce │  │ May enforce │  │ May enforce │
│ for rural   │  │ for rural   │  │ for rural   │
│ townships   │  │ townships   │  │ townships   │
└──────┬──────┘  └──────┬──────┘  └──────┬──────┘
       │                │                │
   ┌───┴───┐        ┌───┴───┐        ┌───┴───┐
   ▼       ▼        ▼       ▼        ▼       ▼
┌─────┐ ┌─────┐  ┌─────┐ ┌─────┐  ┌─────┐ ┌─────┐
│MPLS │ │Edina│  │St.  │ │Rose-│  │Eagan│ │Apple│
│     │ │     │  │Paul │ │ville│  │     │ │Vly  │
│ Own │ │ Own │  │ Own │ │ Own │  │ Own │ │ Own │
│Dept │ │Dept │  │Dept │ │Dept │  │Dept │ │Dept │
│     │ │     │  │     │ │     │  │     │ │     │
│Local│ │Local│  │Local│ │Local│  │Local│ │Local│
│Amend│ │Amend│  │Amend│ │Amend│  │Amend│ │Amend│
└─────┘ └─────┘  └─────┘ └─────┘  └─────┘ └─────┘
```

## Security Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Security Layers                       │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌─────────────────────────────────────────────────┐    │
│  │                   Vercel Edge                    │    │
│  │  - DDoS protection                              │    │
│  │  - Rate limiting                                │    │
│  │  - SSL/TLS termination                          │    │
│  └─────────────────────────────────────────────────┘    │
│                          │                               │
│  ┌─────────────────────────────────────────────────┐    │
│  │                  Application                     │    │
│  │  - Input validation (Zod schemas)               │    │
│  │  - CSRF protection (Next.js built-in)           │    │
│  │  - XSS prevention (React auto-escaping)         │    │
│  └─────────────────────────────────────────────────┘    │
│                          │                               │
│  ┌─────────────────────────────────────────────────┐    │
│  │                   Supabase                       │    │
│  │  - Row Level Security (RLS)                     │    │
│  │  - API key rotation                             │    │
│  │  - Connection pooling                           │    │
│  └─────────────────────────────────────────────────┘    │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

## Performance Considerations

1. **Database Indexing**
   - GIN indexes on tsvector columns for full-text search
   - IVFFlat indexes on vector columns for semantic search
   - B-tree indexes on foreign keys and common filters

2. **Caching Strategy**
   - Static generation for jurisdiction list pages
   - ISR (Incremental Static Regeneration) for jurisdiction details
   - React Query for client-side caching
   - Edge caching for API responses

3. **Search Optimization**
   - Hybrid search combining full-text and semantic
   - Pre-computed embeddings stored in database
   - Query result pagination (50 results per page)
