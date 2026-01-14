-- =====================================================
-- MINNESOTA BUILDING CODE DATABASE SCHEMA
-- =====================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "vector";  -- For semantic search with pgvector

-- =====================================================
-- ENUMS
-- =====================================================

CREATE TYPE jurisdiction_type AS ENUM ('state', 'county', 'city', 'township');
CREATE TYPE enforcement_authority AS ENUM ('self', 'county', 'state');
CREATE TYPE amendment_type AS ENUM ('addition', 'modification', 'deletion', 'stricter');
CREATE TYPE permit_category AS ENUM (
  'building', 'electrical', 'plumbing', 'mechanical', 
  'roofing', 'siding', 'window', 'demolition', 
  'grading', 'sign', 'fence', 'deck', 'other'
);
CREATE TYPE fee_type AS ENUM ('flat', 'valuation_based', 'per_unit', 'tiered', 'calculated');
CREATE TYPE application_method AS ENUM ('online', 'in_person', 'mail', 'either');
CREATE TYPE inspection_phase AS ENUM ('pre_construction', 'foundation', 'rough', 'insulation', 'final');
CREATE TYPE document_type AS ENUM (
  'ordinance', 'fee_schedule', 'application_form', 
  'checklist', 'code_amendment', 'guide', 'other'
);

-- =====================================================
-- JURISDICTIONS TABLE
-- Every county, city, township in Minnesota
-- =====================================================

CREATE TABLE jurisdictions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Identity
    name VARCHAR(255) NOT NULL,
    type jurisdiction_type NOT NULL,
    fips_code VARCHAR(10),  -- Federal ID
    gnis_code VARCHAR(10),  -- Geographic Names ID
    
    -- Hierarchy
    parent_jurisdiction_id UUID REFERENCES jurisdictions(id),
    county_id UUID REFERENCES jurisdictions(id),
    
    -- Geography
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    boundary_geojson JSONB,  -- For map visualization
    
    -- Contact
    building_department_name VARCHAR(255),
    building_department_phone VARCHAR(50),
    building_department_email VARCHAR(255),
    building_department_address TEXT,
    website_url VARCHAR(500),
    permit_portal_url VARCHAR(500),
    department_hours VARCHAR(255),
    
    -- Metadata
    population INTEGER,
    has_local_amendments BOOLEAN DEFAULT FALSE,
    enforcement_authority enforcement_authority DEFAULT 'self',
    data_status VARCHAR(50) DEFAULT 'pending', -- 'complete', 'partial', 'state_only', 'pending'
    last_verified_date DATE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- BASE CODES TABLE
-- State-adopted model codes
-- =====================================================

CREATE TABLE base_codes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    code_name VARCHAR(255) NOT NULL,  -- 'International Residential Code'
    code_abbreviation VARCHAR(20) NOT NULL,  -- 'IRC'
    code_year INTEGER NOT NULL,  -- 2020
    code_organization VARCHAR(255),  -- 'ICC'
    
    effective_date DATE,
    supersedes_code_id UUID REFERENCES base_codes(id),
    
    -- Minnesota adoption reference
    mn_rules_chapter VARCHAR(50),  -- '1309'
    mn_adoption_date DATE,
    
    -- Full text storage
    full_text_url VARCHAR(500),
    full_text_stored BOOLEAN DEFAULT FALSE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- CODE SECTIONS TABLE
-- Granular code sections for search
-- =====================================================

CREATE TABLE code_sections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    base_code_id UUID REFERENCES base_codes(id) NOT NULL,
    
    -- Section hierarchy
    chapter VARCHAR(20),
    section_number VARCHAR(50) NOT NULL,  -- 'R302.1'
    section_title VARCHAR(500),
    
    -- Content
    full_text TEXT NOT NULL,
    summary TEXT,  -- AI-generated summary
    
    -- Categorization
    category VARCHAR(100),  -- 'Fire Safety', 'Structural', 'Electrical'
    subcategory VARCHAR(100),
    tags TEXT[],  -- ['egress', 'bedroom', 'window']
    
    -- Search optimization
    search_vector TSVECTOR GENERATED ALWAYS AS (
      setweight(to_tsvector('english', coalesce(section_title, '')), 'A') ||
      setweight(to_tsvector('english', coalesce(full_text, '')), 'B') ||
      setweight(to_tsvector('english', coalesce(summary, '')), 'C')
    ) STORED,
    
    -- Semantic search embedding (OpenAI/Claude)
    embedding VECTOR(1536),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- LOCAL AMENDMENTS TABLE
-- Jurisdiction-specific modifications
-- =====================================================

CREATE TABLE local_amendments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    jurisdiction_id UUID REFERENCES jurisdictions(id) NOT NULL,
    base_code_id UUID REFERENCES base_codes(id),
    code_section_id UUID REFERENCES code_sections(id),
    
    -- Amendment details
    amendment_type amendment_type NOT NULL,
    amendment_title VARCHAR(500),
    amendment_text TEXT NOT NULL,
    original_text TEXT,  -- What it's replacing
    
    -- Effective dates
    effective_date DATE,
    expiration_date DATE,
    
    -- Source
    ordinance_number VARCHAR(100),
    ordinance_url VARCHAR(500),
    
    -- Search
    search_vector TSVECTOR GENERATED ALWAYS AS (
      setweight(to_tsvector('english', coalesce(amendment_title, '')), 'A') ||
      setweight(to_tsvector('english', coalesce(amendment_text, '')), 'B')
    ) STORED,
    embedding VECTOR(1536),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- PERMIT TYPES TABLE
-- All permit types by jurisdiction
-- =====================================================

CREATE TABLE permit_types (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    jurisdiction_id UUID REFERENCES jurisdictions(id) NOT NULL,
    
    -- Permit identification
    permit_name VARCHAR(255) NOT NULL,  -- 'Building Permit'
    permit_code VARCHAR(50),  -- Internal code used by jurisdiction
    permit_category permit_category NOT NULL,
    
    -- Requirements
    description TEXT,
    when_required TEXT,  -- Conditions that trigger this permit
    exemptions TEXT,  -- When permit NOT required
    
    -- Contractor requirements
    contractor_license_required BOOLEAN DEFAULT FALSE,
    license_type VARCHAR(100),  -- 'MN Electrical License'
    homeowner_can_pull BOOLEAN DEFAULT TRUE,
    
    -- Process
    application_method application_method,
    application_url VARCHAR(500),
    application_form_url VARCHAR(500),
    
    -- Timing
    typical_processing_days INTEGER,
    expedited_available BOOLEAN DEFAULT FALSE,
    expedited_fee_multiplier DECIMAL(3,2),
    
    -- Validity
    permit_validity_days INTEGER,  -- How long before expires
    extension_available BOOLEAN DEFAULT TRUE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- PERMIT FEE SCHEDULES TABLE
-- =====================================================

CREATE TABLE permit_fee_schedules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    permit_type_id UUID REFERENCES permit_types(id) NOT NULL,
    jurisdiction_id UUID REFERENCES jurisdictions(id) NOT NULL,
    
    -- Fee structure
    fee_type fee_type,
    
    -- Flat fee
    flat_fee DECIMAL(10,2),
    
    -- Valuation-based
    valuation_min DECIMAL(12,2),
    valuation_max DECIMAL(12,2),
    base_fee DECIMAL(10,2),
    per_thousand_rate DECIMAL(8,4),  -- $ per $1000 of valuation
    
    -- Per unit (e.g., per fixture, per circuit)
    unit_type VARCHAR(100),  -- 'fixture', 'circuit', 'square_foot'
    per_unit_fee DECIMAL(10,2),
    
    -- Additional fees
    plan_review_fee DECIMAL(10,2),
    plan_review_percentage DECIMAL(5,2),  -- % of permit fee
    
    -- Source
    fee_schedule_url VARCHAR(500),
    effective_date DATE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- INSPECTION TYPES TABLE
-- =====================================================

CREATE TABLE inspection_types (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    jurisdiction_id UUID REFERENCES jurisdictions(id) NOT NULL,
    permit_type_id UUID REFERENCES permit_types(id),
    
    -- Inspection details
    inspection_name VARCHAR(255) NOT NULL,  -- 'Rough Electrical'
    inspection_code VARCHAR(50),
    
    -- Sequence
    phase inspection_phase,
    typical_sequence_order INTEGER,  -- 1, 2, 3...
    
    -- Prerequisites
    prerequisite_inspections UUID[],  -- Other inspections that must pass first
    
    -- What's inspected
    description TEXT,
    checklist_items TEXT[],  -- What inspector looks for
    common_failures TEXT[],  -- Why inspections fail
    
    -- Scheduling
    scheduling_method application_method,
    scheduling_url VARCHAR(500),
    scheduling_phone VARCHAR(50),
    advance_notice_hours INTEGER,  -- How far ahead to schedule
    
    -- Timing
    inspection_window VARCHAR(100),  -- 'AM (7am-12pm)' or 'PM (12pm-5pm)'
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- PERMIT REQUIREMENTS TABLE
-- Links scope of work to required permits
-- =====================================================

CREATE TABLE permit_requirements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    jurisdiction_id UUID REFERENCES jurisdictions(id) NOT NULL,
    permit_type_id UUID REFERENCES permit_types(id) NOT NULL,
    
    -- Trigger conditions
    scope_category VARCHAR(100),  -- 'electrical', 'plumbing', 'structural'
    scope_item VARCHAR(255),  -- 'panel_upgrade', 'water_heater_replacement'
    
    -- Conditions
    trigger_condition TEXT,  -- 'When upgrading electrical service'
    threshold_value DECIMAL(10,2),  -- e.g., '$500' or '200' (sq ft)
    threshold_unit VARCHAR(50),  -- 'dollars', 'square_feet', 'fixtures'
    
    -- Result
    permit_required BOOLEAN DEFAULT TRUE,
    notes TEXT,
    
    -- Code reference
    code_reference VARCHAR(255),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- DOCUMENTS TABLE
-- Store source documents (ordinances, fee schedules, etc.)
-- =====================================================

CREATE TABLE documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    jurisdiction_id UUID REFERENCES jurisdictions(id),
    
    document_type document_type,
    
    title VARCHAR(500),
    description TEXT,
    
    -- Storage
    file_url VARCHAR(500),
    file_type VARCHAR(50),  -- 'pdf', 'docx', 'html'
    file_size_bytes INTEGER,
    
    -- Content extraction
    extracted_text TEXT,
    extraction_date TIMESTAMP WITH TIME ZONE,
    
    -- Metadata
    publish_date DATE,
    effective_date DATE,
    expiration_date DATE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- SEARCH HISTORY TABLE
-- Track searches for analytics and improvement
-- =====================================================

CREATE TABLE search_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    user_id UUID,  -- Optional, for authenticated users
    session_id VARCHAR(255),
    
    query TEXT NOT NULL,
    jurisdiction_id UUID REFERENCES jurisdictions(id),
    
    filters JSONB,
    result_count INTEGER,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- INDEXES
-- =====================================================

-- Full-text search indexes
CREATE INDEX idx_code_sections_search ON code_sections USING GIN(search_vector);
CREATE INDEX idx_local_amendments_search ON local_amendments USING GIN(search_vector);

-- Vector similarity search indexes (using ivfflat for performance)
CREATE INDEX idx_code_sections_embedding ON code_sections 
  USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);
CREATE INDEX idx_local_amendments_embedding ON local_amendments 
  USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

-- Foreign key indexes
CREATE INDEX idx_jurisdictions_type ON jurisdictions(type);
CREATE INDEX idx_jurisdictions_county ON jurisdictions(county_id);
CREATE INDEX idx_jurisdictions_data_status ON jurisdictions(data_status);
CREATE INDEX idx_code_sections_base_code ON code_sections(base_code_id);
CREATE INDEX idx_code_sections_category ON code_sections(category);
CREATE INDEX idx_local_amendments_jurisdiction ON local_amendments(jurisdiction_id);
CREATE INDEX idx_permit_types_jurisdiction ON permit_types(jurisdiction_id);
CREATE INDEX idx_permit_types_category ON permit_types(permit_category);
CREATE INDEX idx_permit_fee_schedules_permit ON permit_fee_schedules(permit_type_id);
CREATE INDEX idx_inspection_types_jurisdiction ON inspection_types(jurisdiction_id);
CREATE INDEX idx_documents_jurisdiction ON documents(jurisdiction_id);

-- =====================================================
-- ROW LEVEL SECURITY
-- =====================================================

ALTER TABLE jurisdictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE base_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE code_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE local_amendments ENABLE ROW LEVEL SECURITY;
ALTER TABLE permit_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE permit_fee_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE inspection_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE permit_requirements ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

-- Public read access for all tables
CREATE POLICY "Public read access" ON jurisdictions FOR SELECT USING (true);
CREATE POLICY "Public read access" ON base_codes FOR SELECT USING (true);
CREATE POLICY "Public read access" ON code_sections FOR SELECT USING (true);
CREATE POLICY "Public read access" ON local_amendments FOR SELECT USING (true);
CREATE POLICY "Public read access" ON permit_types FOR SELECT USING (true);
CREATE POLICY "Public read access" ON permit_fee_schedules FOR SELECT USING (true);
CREATE POLICY "Public read access" ON inspection_types FOR SELECT USING (true);
CREATE POLICY "Public read access" ON permit_requirements FOR SELECT USING (true);
CREATE POLICY "Public read access" ON documents FOR SELECT USING (true);

-- =====================================================
-- FUNCTIONS
-- =====================================================

-- Semantic search function
CREATE OR REPLACE FUNCTION search_codes(
  query_embedding VECTOR(1536),
  match_threshold FLOAT DEFAULT 0.7,
  match_count INT DEFAULT 10,
  filter_jurisdiction UUID DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  section_number VARCHAR,
  section_title VARCHAR,
  full_text TEXT,
  base_code_id UUID,
  similarity FLOAT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    cs.id,
    cs.section_number,
    cs.section_title,
    cs.full_text,
    cs.base_code_id,
    1 - (cs.embedding <=> query_embedding) AS similarity
  FROM code_sections cs
  WHERE 1 - (cs.embedding <=> query_embedding) > match_threshold
  ORDER BY cs.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- Full-text search function
CREATE OR REPLACE FUNCTION search_codes_fulltext(
  search_query TEXT,
  filter_jurisdiction UUID DEFAULT NULL,
  match_count INT DEFAULT 20
)
RETURNS TABLE (
  id UUID,
  section_number VARCHAR,
  section_title VARCHAR,
  full_text TEXT,
  base_code_id UUID,
  rank FLOAT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    cs.id,
    cs.section_number,
    cs.section_title,
    cs.full_text,
    cs.base_code_id,
    ts_rank(cs.search_vector, websearch_to_tsquery('english', search_query)) AS rank
  FROM code_sections cs
  WHERE cs.search_vector @@ websearch_to_tsquery('english', search_query)
  ORDER BY rank DESC
  LIMIT match_count;
END;
$$;

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers
CREATE TRIGGER update_jurisdictions_updated_at
  BEFORE UPDATE ON jurisdictions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_local_amendments_updated_at
  BEFORE UPDATE ON local_amendments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_permit_types_updated_at
  BEFORE UPDATE ON permit_types
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- SEED DATA - Minnesota Counties
-- =====================================================

-- Insert Minnesota state
INSERT INTO jurisdictions (id, name, type, fips_code, population, enforcement_authority, data_status)
VALUES (
  'c0000000-0000-0000-0000-000000000001',
  'Minnesota',
  'state',
  '27',
  5706494,
  'state',
  'complete'
);

-- Insert Metro Counties
INSERT INTO jurisdictions (name, type, fips_code, parent_jurisdiction_id, population, enforcement_authority, data_status) VALUES
('Hennepin County', 'county', '27053', 'c0000000-0000-0000-0000-000000000001', 1281565, 'self', 'complete'),
('Ramsey County', 'county', '27123', 'c0000000-0000-0000-0000-000000000001', 552352, 'self', 'complete'),
('Dakota County', 'county', '27037', 'c0000000-0000-0000-0000-000000000001', 439882, 'self', 'complete'),
('Anoka County', 'county', '27003', 'c0000000-0000-0000-0000-000000000001', 363887, 'self', 'partial'),
('Washington County', 'county', '27163', 'c0000000-0000-0000-0000-000000000001', 267568, 'self', 'partial'),
('Scott County', 'county', '27139', 'c0000000-0000-0000-0000-000000000001', 150928, 'self', 'state_only'),
('Carver County', 'county', '27019', 'c0000000-0000-0000-0000-000000000001', 106922, 'self', 'state_only');

-- Insert Base Codes
INSERT INTO base_codes (code_name, code_abbreviation, code_year, code_organization, mn_rules_chapter, effective_date) VALUES
('International Residential Code', 'IRC', 2020, 'ICC', '1309', '2020-03-31'),
('International Building Code', 'IBC', 2020, 'ICC', '1303', '2020-03-31'),
('National Electrical Code', 'NEC', 2020, 'NFPA', '1322', '2020-03-31'),
('Uniform Plumbing Code', 'UPC', 2021, 'IAPMO', '1315', '2022-01-23'),
('International Mechanical Code', 'IMC', 2020, 'ICC', '1323', '2020-03-31'),
('International Energy Conservation Code', 'IECC', 2020, 'ICC', '1346', '2020-03-31'),
('Minnesota Accessibility Code', 'MAC', 2020, 'MN DLI', '1305', '2020-03-31'),
('Minnesota Fire Code', 'MFC', 2020, 'MN DPS', '7511', '2020-03-31');
