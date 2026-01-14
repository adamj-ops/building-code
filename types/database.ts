/**
 * Minnesota Building Code Database Types
 */

export type JurisdictionType = 'state' | 'county' | 'city' | 'township';
export type EnforcementAuthority = 'self' | 'county' | 'state';
export type AmendmentType = 'addition' | 'modification' | 'deletion' | 'stricter';
export type PermitCategory = 
  | 'building' 
  | 'electrical' 
  | 'plumbing' 
  | 'mechanical' 
  | 'roofing' 
  | 'siding' 
  | 'window' 
  | 'demolition' 
  | 'grading' 
  | 'sign' 
  | 'fence' 
  | 'deck' 
  | 'other';
export type FeeType = 'flat' | 'valuation_based' | 'per_unit' | 'tiered' | 'calculated';
export type ApplicationMethod = 'online' | 'in_person' | 'mail' | 'either';
export type InspectionPhase = 'pre_construction' | 'foundation' | 'rough' | 'insulation' | 'final';
export type DocumentType = 
  | 'ordinance' 
  | 'fee_schedule' 
  | 'application_form' 
  | 'checklist' 
  | 'code_amendment' 
  | 'guide' 
  | 'other';

export interface Jurisdiction {
  id: string;
  name: string;
  type: JurisdictionType;
  fips_code?: string;
  gnis_code?: string;
  parent_jurisdiction_id?: string;
  county_id?: string;
  latitude?: number;
  longitude?: number;
  boundary_geojson?: GeoJSON.Geometry;
  building_department_name?: string;
  building_department_phone?: string;
  building_department_email?: string;
  building_department_address?: string;
  website_url?: string;
  permit_portal_url?: string;
  population?: number;
  has_local_amendments: boolean;
  enforcement_authority: EnforcementAuthority;
  last_verified_date?: string;
  created_at: string;
  updated_at: string;
}

export interface BaseCode {
  id: string;
  code_name: string;
  code_abbreviation: string;
  code_year: number;
  code_organization?: string;
  effective_date?: string;
  supersedes_code_id?: string;
  mn_rules_chapter?: string;
  mn_adoption_date?: string;
  full_text_url?: string;
  full_text_stored: boolean;
  created_at: string;
}

export interface CodeSection {
  id: string;
  base_code_id: string;
  chapter?: string;
  section_number: string;
  section_title?: string;
  full_text: string;
  summary?: string;
  category?: string;
  subcategory?: string;
  tags?: string[];
  created_at: string;
  // Relations
  base_code?: BaseCode;
  local_amendments?: LocalAmendment[];
}

export interface LocalAmendment {
  id: string;
  jurisdiction_id: string;
  base_code_id?: string;
  code_section_id?: string;
  amendment_type: AmendmentType;
  amendment_title?: string;
  amendment_text: string;
  original_text?: string;
  effective_date?: string;
  expiration_date?: string;
  ordinance_number?: string;
  ordinance_url?: string;
  created_at: string;
  updated_at: string;
  // Relations
  jurisdiction?: Jurisdiction;
}

export interface PermitType {
  id: string;
  jurisdiction_id: string;
  permit_name: string;
  permit_code?: string;
  permit_category: PermitCategory;
  description?: string;
  when_required?: string;
  exemptions?: string;
  contractor_license_required: boolean;
  license_type?: string;
  homeowner_can_pull: boolean;
  application_method?: ApplicationMethod;
  application_url?: string;
  application_form_url?: string;
  typical_processing_days?: number;
  expedited_available: boolean;
  expedited_fee_multiplier?: number;
  permit_validity_days?: number;
  extension_available: boolean;
  created_at: string;
  updated_at: string;
  // Relations
  jurisdiction?: Jurisdiction;
  fee_schedules?: PermitFeeSchedule[];
}

export interface PermitFeeSchedule {
  id: string;
  permit_type_id: string;
  jurisdiction_id: string;
  fee_type: FeeType;
  flat_fee?: number;
  valuation_min?: number;
  valuation_max?: number;
  base_fee?: number;
  per_thousand_rate?: number;
  unit_type?: string;
  per_unit_fee?: number;
  plan_review_fee?: number;
  plan_review_percentage?: number;
  fee_schedule_url?: string;
  effective_date?: string;
  created_at: string;
}

export interface InspectionType {
  id: string;
  jurisdiction_id: string;
  permit_type_id?: string;
  inspection_name: string;
  inspection_code?: string;
  phase?: InspectionPhase;
  typical_sequence_order?: number;
  prerequisite_inspections?: string[];
  description?: string;
  checklist_items?: string[];
  common_failures?: string[];
  scheduling_method?: ApplicationMethod;
  scheduling_url?: string;
  scheduling_phone?: string;
  advance_notice_hours?: number;
  inspection_window?: string;
  created_at: string;
}

export interface PermitRequirement {
  id: string;
  jurisdiction_id: string;
  permit_type_id: string;
  scope_category?: string;
  scope_item?: string;
  trigger_condition?: string;
  threshold_value?: number;
  threshold_unit?: string;
  permit_required: boolean;
  notes?: string;
  code_reference?: string;
  created_at: string;
}

export interface Document {
  id: string;
  jurisdiction_id?: string;
  document_type?: DocumentType;
  title?: string;
  description?: string;
  file_url?: string;
  file_type?: string;
  file_size_bytes?: number;
  extracted_text?: string;
  extraction_date?: string;
  publish_date?: string;
  effective_date?: string;
  expiration_date?: string;
  created_at: string;
}

// Search Result Types
export interface CodeSearchResult {
  id: string;
  source: string;
  section: string;
  title: string;
  text: string;
  relevance_score: number;
  local_amendments?: {
    jurisdiction: string;
    amendment_type: AmendmentType;
    text: string;
  }[];
}

export interface SearchResponse {
  query_interpretation: {
    intent: string;
    entities: string[];
    jurisdiction_resolved?: {
      name: string;
      type: JurisdictionType;
      county?: string;
    };
  };
  results: CodeSearchResult[];
  ai_summary?: string;
  related_sections?: CodeSearchResult[];
}

// Fee Calculator Types
export interface FeeCalculationRequest {
  jurisdiction: string;
  permits: {
    type: PermitCategory;
    valuation?: number;
    quantity?: number;
    unit_count?: number;
  }[];
}

export interface FeeCalculationResult {
  permit_type: string;
  base_fee: number;
  plan_review_fee: number;
  total_fee: number;
  notes?: string;
}

// Database schema for Supabase
export interface Database {
  public: {
    Tables: {
      jurisdictions: {
        Row: Jurisdiction;
        Insert: Omit<Jurisdiction, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Jurisdiction, 'id' | 'created_at'>>;
      };
      base_codes: {
        Row: BaseCode;
        Insert: Omit<BaseCode, 'id' | 'created_at'>;
        Update: Partial<Omit<BaseCode, 'id' | 'created_at'>>;
      };
      code_sections: {
        Row: CodeSection;
        Insert: Omit<CodeSection, 'id' | 'created_at'>;
        Update: Partial<Omit<CodeSection, 'id' | 'created_at'>>;
      };
      local_amendments: {
        Row: LocalAmendment;
        Insert: Omit<LocalAmendment, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<LocalAmendment, 'id' | 'created_at'>>;
      };
      permit_types: {
        Row: PermitType;
        Insert: Omit<PermitType, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<PermitType, 'id' | 'created_at'>>;
      };
      permit_fee_schedules: {
        Row: PermitFeeSchedule;
        Insert: Omit<PermitFeeSchedule, 'id' | 'created_at'>;
        Update: Partial<Omit<PermitFeeSchedule, 'id' | 'created_at'>>;
      };
      inspection_types: {
        Row: InspectionType;
        Insert: Omit<InspectionType, 'id' | 'created_at'>;
        Update: Partial<Omit<InspectionType, 'id' | 'created_at'>>;
      };
      permit_requirements: {
        Row: PermitRequirement;
        Insert: Omit<PermitRequirement, 'id' | 'created_at'>;
        Update: Partial<Omit<PermitRequirement, 'id' | 'created_at'>>;
      };
      documents: {
        Row: Document;
        Insert: Omit<Document, 'id' | 'created_at'>;
        Update: Partial<Omit<Document, 'id' | 'created_at'>>;
      };
    };
    Views: Record<string, never>;
    Functions: {
      search_codes: {
        Args: { query: string; jurisdiction_id?: string; limit?: number };
        Returns: CodeSearchResult[];
      };
    };
    Enums: {
      jurisdiction_type: JurisdictionType;
      enforcement_authority: EnforcementAuthority;
      amendment_type: AmendmentType;
      permit_category: PermitCategory;
      fee_type: FeeType;
      application_method: ApplicationMethod;
      inspection_phase: InspectionPhase;
      document_type: DocumentType;
    };
  };
}
