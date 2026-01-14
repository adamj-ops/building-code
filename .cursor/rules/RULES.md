# Minnesota Building Code Database - Cursor Rules

## Project Context

This is the **Minnesota Building Code Database** - a comprehensive, searchable database of building codes, local amendments, permit requirements, and fee schedules for all Minnesota jurisdictions.

**Tech Stack**: Next.js 14, React, TypeScript, Tailwind CSS, shadcn/ui, Supabase (PostgreSQL + pgvector), Claude API

## Documentation Index

| Document | Purpose |
|----------|---------|
| `project-overview.md` | Mission, stakeholders, success metrics |
| `architecture.md` | System diagrams, component details, data flow |
| `database-schema.md` | Complete schema documentation, ERD, queries |
| `api-reference.md` | API endpoints, request/response formats |
| `development-workflow.md` | Setup, conventions, testing, deployment |
| `data-collection.md` | Scraping strategy, AI extraction, validation |
| `roadmap.md` | Development phases, milestones, timeline |

## Key Conventions

### File Organization
```
app/                    # Next.js pages and API routes
components/
├── ui/                # shadcn/ui primitives
├── layout/            # Sidebar, header, etc.
├── codes/             # Code search components
├── jurisdictions/     # Jurisdiction components
└── permits/           # Permit analyzer components
lib/
├── supabase/          # Database clients
├── ai/                # Claude integration
└── scrapers/          # Data collection
types/                 # TypeScript definitions
```

### Naming
- Files: `kebab-case.tsx`
- Components: `PascalCase`
- Functions: `camelCase`
- Database: `snake_case`
- Constants: `SCREAMING_SNAKE`

### Component Pattern
```tsx
// 1. External imports
// 2. Internal imports
// 3. Types
// 4. Component with hooks → handlers → render
```

## Current Status

**Phase 1**: ✅ Complete - Foundation, UI, schema
**Phase 2**: 🔄 In Progress - Database setup, state codes
**Next**: Set up Supabase, ingest state building codes

## Important Notes

1. **No original comp-oser impact** - This is a completely separate project
2. **Supabase not yet configured** - Need to create project and apply schema
3. **Mock data in UI** - Pages show placeholder data until DB connected
4. **AI search pending** - Requires embeddings and Claude integration

## Quick Commands

```bash
# Development
npm run dev           # Start dev server
npm run build         # Production build
npm run lint          # Run linter
npm run test          # Run tests

# Database (after Supabase setup)
# Apply schema via Supabase SQL Editor
# Generate types: npx supabase gen types typescript
```

## When Working on This Project

1. **Always check** `roadmap.md` for current phase and priorities
2. **Reference** `database-schema.md` for data model questions
3. **Follow** `development-workflow.md` conventions
4. **Use** `api-reference.md` for endpoint specifications
5. **Consult** `architecture.md` for system design decisions
