# Development Roadmap

## Phase Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         DEVELOPMENT PHASES                                   │
└─────────────────────────────────────────────────────────────────────────────┘

Phase 1: Foundation (Weeks 1-2) ✅ COMPLETE
├── Project setup and architecture
├── Database schema design
├── Core UI components
└── Basic API routes

Phase 2: Data Infrastructure (Weeks 3-4) 🔄 IN PROGRESS
├── Supabase database setup
├── State code ingestion
├── Search infrastructure
└── Embedding generation

Phase 3: Metro Data Collection (Weeks 5-8)
├── Minneapolis data
├── St. Paul data
├── Hennepin County cities
└── Other metro counties

Phase 4: Feature Completion (Weeks 9-12)
├── AI-powered search
├── Permit analyzer
├── Fee calculator
├── Interactive map

Phase 5: Polish & Launch (Weeks 13-16)
├── Performance optimization
├── Testing & QA
├── Documentation
└── Production deployment
```

---

## Phase 1: Foundation ✅ COMPLETE

### Completed Tasks

- [x] Project scaffolding (Next.js 14, React, TypeScript)
- [x] UI component library (shadcn/ui)
- [x] Dark theme and styling
- [x] Database schema design (10 tables)
- [x] TypeScript types for database
- [x] Core pages:
  - [x] Home page with search
  - [x] Jurisdictions browser
  - [x] Jurisdiction detail page
  - [x] Search results page
  - [x] Placeholder pages (codes, fees, permits, history)
- [x] Sidebar navigation
- [x] API route structure
- [x] Documentation setup

---

## Phase 2: Data Infrastructure 🔄 IN PROGRESS

### Week 3: Database Setup

- [ ] Create Supabase project
- [ ] Apply database schema (schema.sql)
- [ ] Enable pgvector extension
- [ ] Configure Row Level Security
- [ ] Set up database indexes
- [ ] Create database functions for search

### Week 4: State Code Ingestion

- [ ] Obtain Minnesota State Building Code text
- [ ] Parse IRC 2020 sections
- [ ] Parse IBC 2020 sections
- [ ] Parse other adopted codes (IPC, IMC, IECC, NEC)
- [ ] Generate embeddings for code sections
- [ ] Populate search_vector columns
- [ ] Test full-text search
- [ ] Test semantic search

### Deliverables
- Working Supabase database with schema
- State building codes searchable
- Basic search functionality operational

---

## Phase 3: Metro Data Collection

### Week 5-6: Minneapolis & St. Paul

**Minneapolis**
- [ ] Scrape permit types and requirements
- [ ] Extract fee schedule from PDF
- [ ] Capture contact information
- [ ] Document local amendments
- [ ] Verify inspection requirements
- [ ] Test data accuracy

**St. Paul**
- [ ] Scrape permit types and requirements
- [ ] Extract fee schedule
- [ ] Capture contact information
- [ ] Document local amendments
- [ ] Verify inspection requirements
- [ ] Test data accuracy

### Week 7-8: Remaining Metro Cities

**Hennepin County (45 cities)**
- [ ] Bloomington
- [ ] Brooklyn Park
- [ ] Plymouth
- [ ] Maple Grove
- [ ] Eden Prairie
- [ ] Edina
- [ ] Minnetonka
- [ ] St. Louis Park
- [ ] Golden Valley
- [ ] Richfield
- [ ] ... (remaining 35 cities)

**Other Metro Counties**
- [ ] Ramsey County (18 cities)
- [ ] Dakota County (34 cities)
- [ ] Anoka County (21 cities)
- [ ] Washington County (28 cities)
- [ ] Scott County (17 cities)
- [ ] Carver County (11 cities)

### Deliverables
- 174 metro area jurisdictions with data
- Permit types and fees for each
- Contact information verified
- Local amendments documented

---

## Phase 4: Feature Completion

### Week 9-10: AI-Powered Search

- [ ] Implement hybrid search (full-text + semantic)
- [ ] Query parsing with entity extraction
- [ ] Jurisdiction resolution from natural language
- [ ] AI summary generation (Claude)
- [ ] Related sections linking
- [ ] Search result ranking optimization
- [ ] Search analytics tracking

### Week 11: Permit Analyzer

- [ ] Project scope input form
- [ ] Permit requirement logic engine
- [ ] Code reference linking
- [ ] Fee estimation integration
- [ ] Inspection checklist generation
- [ ] PDF report generation
- [ ] Save/share analysis

### Week 12: Fee Calculator & Map

**Fee Calculator**
- [ ] Valuation-based calculation
- [ ] Per-unit calculation
- [ ] Tiered fee calculation
- [ ] Plan review fee inclusion
- [ ] Expedited fee option
- [ ] Comparison across jurisdictions

**Interactive Map**
- [ ] Mapbox GL integration
- [ ] County boundaries
- [ ] City boundaries
- [ ] Click-to-select jurisdiction
- [ ] Data coverage visualization
- [ ] Search by location

### Deliverables
- Full AI-powered search operational
- Permit analyzer functional
- Fee calculator accurate
- Interactive map working

---

## Phase 5: Polish & Launch

### Week 13-14: Performance & Testing

**Performance**
- [ ] Database query optimization
- [ ] API response caching
- [ ] Static page generation
- [ ] Image optimization
- [ ] Bundle size reduction
- [ ] Core Web Vitals passing

**Testing**
- [ ] Unit tests for calculations
- [ ] Integration tests for API
- [ ] E2E tests for critical flows
- [ ] Cross-browser testing
- [ ] Mobile responsiveness
- [ ] Accessibility audit (WCAG 2.1)

### Week 15: Documentation & Admin

**Documentation**
- [ ] User guide
- [ ] API documentation
- [ ] Admin documentation
- [ ] Data update procedures
- [ ] Troubleshooting guide

**Admin Features**
- [ ] Data entry interface
- [ ] Verification workflow
- [ ] Change tracking
- [ ] User feedback system

### Week 16: Launch

- [ ] Production environment setup
- [ ] DNS configuration
- [ ] SSL certificate
- [ ] Monitoring setup
- [ ] Error tracking (Sentry)
- [ ] Analytics (Vercel)
- [ ] Backup procedures
- [ ] Launch announcement

### Deliverables
- Production-ready application
- Complete documentation
- Monitoring in place
- Launched to users

---

## Future Enhancements (Post-Launch)

### Phase 6: Greater Minnesota Expansion
- Regional centers (Duluth, Rochester, St. Cloud)
- County seats
- Cities > 10,000 population
- Rural townships

### Phase 7: Advanced Features
- User accounts and saved searches
- Project tracking
- Contractor directory integration
- Permit application submission
- Mobile app (React Native)

### Phase 8: Business Features
- API access tiers
- White-label options
- Data licensing
- Premium features

---

## Success Metrics

### Phase 2 Targets
- Database operational: ✓/✗
- State codes searchable: ✓/✗
- Search response time < 500ms

### Phase 3 Targets
- Metro jurisdictions: 174/174
- Data accuracy: > 95%
- Contact info verified: > 90%

### Phase 4 Targets
- Search relevance score: > 0.8
- Fee calculation accuracy: > 98%
- User satisfaction: > 4.0/5

### Launch Targets
- Page load time: < 2s
- API uptime: > 99.5%
- Zero critical bugs
- 100+ daily users (week 1)

---

## Risk Mitigation

| Risk | Mitigation |
|------|------------|
| ICC licensing issues | Focus on MN-specific content, link to ICC |
| Data accuracy concerns | Verification workflow, source citations |
| Scraper blocking | Respect robots.txt, rate limiting |
| AI cost overruns | Caching, batch processing, usage limits |
| Scope creep | Strict MVP definition, phase gates |

---

## Resource Requirements

### Development
- 1 Full-stack developer (primary)
- AI/ML support (as needed)
- Design review (periodic)

### Infrastructure
- Supabase Pro ($25/month)
- Vercel Pro ($20/month)
- Claude API (~$100/month)
- Mapbox (~$50/month)

### Data Collection
- Manual entry time: ~40 hours
- Scraper development: ~20 hours
- Verification: ~20 hours
