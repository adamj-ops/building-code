# Development Workflow

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Git
- Supabase account (for database)
- Claude API key (for AI features)
- Mapbox token (optional, for maps)

### Initial Setup

```bash
# Clone the repository
git clone <repo-url>
cd mn-building-codes

# Install dependencies
npm install

# Copy environment template
cp .env.example .env.local

# Edit .env.local with your keys
# NEXT_PUBLIC_SUPABASE_URL=
# NEXT_PUBLIC_SUPABASE_ANON_KEY=
# SUPABASE_SERVICE_ROLE_KEY=
# CLAUDE_API_KEY=
# NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN=

# Run database migrations (in Supabase SQL editor)
# Copy contents of schema.sql

# Start development server
npm run dev
```

## Project Structure

```
mn-building-codes/
├── .cursor/
│   └── rules/              # Project documentation
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   │   ├── codes/
│   │   ├── jurisdictions/
│   │   └── fees/
│   ├── codes/             # Code browser pages
│   ├── jurisdictions/     # Jurisdiction pages
│   ├── permits/           # Permit analyzer
│   ├── fees/              # Fee calculator
│   ├── search/            # Search results
│   ├── history/           # User history
│   ├── settings/          # Settings
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Home page
│   └── globals.css        # Global styles
├── components/
│   ├── ui/                # shadcn/ui components
│   ├── layout/            # Layout components
│   ├── codes/             # Code-specific components
│   ├── jurisdictions/     # Jurisdiction components
│   └── providers.tsx      # Context providers
├── lib/
│   ├── supabase/          # Supabase clients
│   ├── ai/                # AI service functions
│   ├── scrapers/          # Data collection scripts
│   └── utils.ts           # Utility functions
├── types/
│   ├── database.ts        # Supabase types
│   └── index.ts           # Shared types
├── public/                # Static assets
├── schema.sql             # Database schema
├── package.json
├── tsconfig.json
└── README.md
```

## Development Conventions

### Code Style

- **TypeScript**: Strict mode enabled
- **React**: Functional components with hooks
- **Styling**: Tailwind CSS with shadcn/ui
- **Formatting**: Prettier (default config)
- **Linting**: ESLint with Next.js config

### Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| Files | kebab-case | `jurisdiction-select.tsx` |
| Components | PascalCase | `JurisdictionSelect` |
| Functions | camelCase | `calculatePermitFee` |
| Constants | SCREAMING_SNAKE | `MAX_RESULTS` |
| Types | PascalCase | `JurisdictionType` |
| Database | snake_case | `permit_types` |

### Component Structure

```tsx
// 1. Imports (external, then internal)
import { useState } from 'react'
import { Button } from '@/components/ui/button'

// 2. Types
interface Props {
  jurisdiction: Jurisdiction
  onSelect: (id: string) => void
}

// 3. Component
export function JurisdictionCard({ jurisdiction, onSelect }: Props) {
  // 3a. Hooks
  const [isOpen, setIsOpen] = useState(false)
  
  // 3b. Handlers
  const handleClick = () => {
    onSelect(jurisdiction.id)
  }
  
  // 3c. Render
  return (
    <div>...</div>
  )
}
```

### API Route Structure

```typescript
// app/api/jurisdictions/route.ts
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  // 1. Parse request
  const { searchParams } = new URL(request.url)
  const county = searchParams.get('county')
  
  // 2. Validate input
  if (!county) {
    return NextResponse.json(
      { error: 'County parameter required' },
      { status: 400 }
    )
  }
  
  // 3. Database operation
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('jurisdictions')
    .select('*')
    .eq('county_id', county)
  
  // 4. Handle errors
  if (error) {
    console.error('Database error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch jurisdictions' },
      { status: 500 }
    )
  }
  
  // 5. Return response
  return NextResponse.json(data)
}
```

## Git Workflow

### Branch Naming

- `main` - Production-ready code
- `develop` - Integration branch
- `feature/xxx` - New features
- `fix/xxx` - Bug fixes
- `docs/xxx` - Documentation updates

### Commit Messages

Follow conventional commits:

```
type(scope): description

[optional body]

[optional footer]
```

Types:
- `feat` - New feature
- `fix` - Bug fix
- `docs` - Documentation
- `style` - Formatting
- `refactor` - Code restructure
- `test` - Tests
- `chore` - Maintenance

Examples:
```
feat(search): add semantic search with pgvector
fix(jurisdictions): correct fee calculation for tiered rates
docs(readme): update setup instructions
```

### Pull Request Process

1. Create feature branch from `develop`
2. Make changes with atomic commits
3. Run tests: `npm run test`
4. Run linter: `npm run lint`
5. Create PR with description
6. Request review
7. Address feedback
8. Squash and merge

## Testing

### Unit Tests

```bash
# Run all tests
npm run test

# Run with coverage
npm run test:coverage

# Run specific file
npm run test -- jurisdictions.test.ts
```

### Test Structure

```typescript
// __tests__/lib/fee-calculator.test.ts
import { describe, it, expect } from 'vitest'
import { calculateFee } from '@/lib/fee-calculator'

describe('calculateFee', () => {
  it('calculates flat fee correctly', () => {
    const result = calculateFee({
      feeType: 'flat',
      flatFee: 150,
      valuation: 50000
    })
    expect(result).toBe(150)
  })
  
  it('calculates valuation-based fee', () => {
    const result = calculateFee({
      feeType: 'valuation_based',
      baseFee: 50,
      perThousandRate: 5,
      valuation: 100000
    })
    expect(result).toBe(550) // 50 + (100 * 5)
  })
})
```

## Deployment

### Vercel Deployment

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy to preview
vercel

# Deploy to production
vercel --prod
```

### Environment Variables

Set these in Vercel dashboard:

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service key |
| `CLAUDE_API_KEY` | Anthropic API key |
| `NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN` | Mapbox public token |

## Troubleshooting

### Common Issues

**Build fails with type errors**
```bash
# Regenerate types from Supabase
npx supabase gen types typescript --project-id <id> > types/database.ts
```

**Supabase connection errors**
- Check `.env.local` has correct values
- Verify Supabase project is running
- Check RLS policies allow access

**Search not returning results**
- Ensure search_vector column is populated
- Check GIN index exists
- Verify tsvector configuration

### Debug Mode

```bash
# Enable verbose logging
DEBUG=* npm run dev

# Check Supabase logs
npx supabase logs
```

## Performance Monitoring

### Key Metrics

- Search response time < 500ms
- Page load time < 2s
- Database query time < 100ms
- API response time < 200ms

### Monitoring Tools

- Vercel Analytics (built-in)
- Supabase Dashboard (database metrics)
- React DevTools (component profiling)
