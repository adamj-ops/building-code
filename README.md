# Minnesota Building Code Database

A comprehensive database of Minnesota building codes, permits, and jurisdictional requirements. Built for Build Co. to streamline permit research and compliance across 87 counties and 853 cities.

## Features

- **🔍 AI-Powered Code Search** - Natural language search with semantic understanding
- **🗺️ Jurisdiction Browser** - Interactive map and list view of all Minnesota jurisdictions
- **📋 Permit Analyzer** - Determine required permits based on project scope
- **💰 Fee Calculator** - Estimate permit fees by jurisdiction
- **📖 Code Browser** - Browse by category or model code (IRC, IBC, NEC, etc.)
- **📍 Local Amendments** - Track jurisdiction-specific code modifications

## Tech Stack

- **Frontend**: Next.js 16, React 19, Tailwind CSS 4
- **Backend**: Supabase (PostgreSQL + pgvector)
- **AI**: Claude API for semantic search and summaries
- **Maps**: Mapbox GL (optional)
- **UI**: shadcn/ui components

## Documentation

Detailed documentation is available in `.cursor/rules/`:

| Document | Description |
|----------|-------------|
| `RULES.md` | Quick reference and conventions |
| `project-overview.md` | Mission, stakeholders, success metrics |
| `architecture.md` | System diagrams and data flow |
| `database-schema.md` | Complete schema documentation |
| `api-reference.md` | API endpoints and formats |
| `development-workflow.md` | Setup, conventions, testing |
| `data-collection.md` | Scraping and data strategy |
| `roadmap.md` | Development phases and timeline |

## Getting Started

### Prerequisites

- Node.js 20+
- Supabase account
- (Optional) Mapbox account for interactive maps
- (Optional) Anthropic API key for AI features

### Installation

```bash
# Clone the repository
git clone <repo-url>
cd mn-building-codes

# Install dependencies
npm install

# Create .env.local with your environment variables (see below)

# Run the development server
npm run dev
```

### Environment Variables

Create a `.env.local` file in the project root:

```bash
# Required: Supabase
# Get from: https://supabase.com/dashboard/project/_/settings/api
NEXT_PUBLIC_SUPABASE_URL="https://your-project-id.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key-here"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key-here"

# Required for AI features: Claude API
# Get from: https://console.anthropic.com/
CLAUDE_API_KEY="sk-ant-your-key-here"

# Optional: Mapbox for interactive maps
# Get from: https://account.mapbox.com/access-tokens/
NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN="pk.your-mapbox-token-here"
```

### Database Setup

1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Go to the SQL Editor in your project dashboard
3. Copy the contents of `schema.sql` and run it
4. Enable the `vector` extension for semantic search:
   ```sql
   CREATE EXTENSION IF NOT EXISTS vector;
   ```

This creates all tables, indexes, and enums for the application.

## Project Structure

```
├── app/
│   ├── page.tsx              # Home page with search
│   ├── search/               # Search results
│   ├── codes/                # Browse codes
│   ├── jurisdictions/        # Jurisdiction browser
│   │   └── [id]/             # Jurisdiction detail
│   ├── permits/
│   │   └── analyzer/         # Permit analyzer
│   ├── fees/                 # Fee calculator
│   ├── history/              # Search history
│   └── api/                  # API routes
├── components/
│   ├── codes/                # Code-specific components
│   ├── layout/               # Layout components
│   └── ui/                   # shadcn/ui components
├── lib/
│   └── supabase/             # Supabase clients
├── types/
│   ├── database.ts           # Database types
│   └── index.ts              # App types
└── schema.sql                # Database schema
```

## Database Schema

### Core Tables

- **jurisdictions** - Counties, cities, townships with contact info
- **base_codes** - Adopted model codes (IRC, IBC, NEC, etc.)
- **code_sections** - Granular code sections with full-text search
- **local_amendments** - Jurisdiction-specific modifications
- **permit_types** - Available permits by jurisdiction
- **permit_fee_schedules** - Fee structures
- **inspection_types** - Inspection requirements
- **permit_requirements** - Scope-to-permit mapping

### Search Features

- PostgreSQL full-text search (`tsvector`)
- Semantic search with pgvector embeddings
- Combined ranking for best results

## Data Sources

- Minnesota Rules, Chapters 1300-1370
- ICC Digital Codes (IBC, IRC, IMC, IECC)
- NFPA (NEC)
- IAPMO (UPC)
- Individual jurisdiction websites

## Roadmap

- [ ] Phase 1: Foundation & Metro Area (Hennepin, Ramsey)
- [ ] Phase 2: Remaining Metro Counties
- [ ] Phase 3: Greater Minnesota
- [ ] Phase 4: AI-powered summaries and recommendations
- [ ] Phase 5: Mobile app

## License

Private - Build Co. internal use only.
