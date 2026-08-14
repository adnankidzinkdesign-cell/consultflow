/**
 * Hand-written Supabase database types, covering every table currently
 * defined in supabase/migrations/ (including ones not yet wired into a page,
 * like the checklist tables) — this mirrors the schema, not just Phase 1.
 *
 * Once the schema is applied to a real project, prefer regenerating this
 * file from the live database instead of hand-editing it:
 *
 *   npx supabase gen types typescript --project-id <ref> > lib/supabase/types.ts
 *
 * Keeping it hand-written for now avoids requiring a live Supabase project
 * just to get type-checking working during initial development.
 *
 * Every table needs a `Relationships` array (even if empty) — the
 * supabase-js/postgrest-js generics require that exact shape
 * (`{ Row, Insert, Update, Relationships }`) to resolve query result types;
 * omitting it silently collapses every query's row type to `never`.
 */

export type AppRole = "admin" | "project_lead";

export type ConsultantStatus =
  | "pending_review"
  | "approved"
  | "rejected"
  | "suspended";

export type ConsultantTier = "tier_1" | "tier_2" | "tier_3" | "unrated";

export type ChecklistStatus =
  | "not_submitted"
  | "submitted"
  | "verified"
  | "rejected"
  | "expired";

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          role: AppRole;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["profiles"]["Row"]> & {
          id: string;
          email: string;
        };
        Update: Partial<Database["public"]["Tables"]["profiles"]["Row"]>;
        Relationships: [];
      };
      consultants: {
        Row: {
          id: string;
          company_name: string;
          contact_name: string | null;
          discipline: string;
          contact_email: string;
          contact_phone: string | null;
          regions: string[];
          status: ConsultantStatus;
          tier: ConsultantTier;
          notes: string | null;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["consultants"]["Row"]> & {
          company_name: string;
          discipline: string;
          contact_email: string;
        };
        Update: Partial<Database["public"]["Tables"]["consultants"]["Row"]>;
        Relationships: [];
      };
      checklist_item_defs: {
        Row: {
          id: string;
          code: string;
          label: string;
          description: string | null;
          requires_document: boolean;
          requires_expiry: boolean;
          sort_order: number;
          is_active: boolean;
          created_at: string;
        };
        Insert: Partial<
          Database["public"]["Tables"]["checklist_item_defs"]["Row"]
        > & { code: string; label: string };
        Update: Partial<
          Database["public"]["Tables"]["checklist_item_defs"]["Row"]
        >;
        Relationships: [];
      };
      consultant_checklist_items: {
        Row: {
          id: string;
          consultant_id: string;
          checklist_item_id: string;
          status: ChecklistStatus;
          document_path: string | null;
          expiry_date: string | null;
          submitted_at: string | null;
          verified_by: string | null;
          verified_at: string | null;
          rejection_reason: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<
          Database["public"]["Tables"]["consultant_checklist_items"]["Row"]
        > & { consultant_id: string; checklist_item_id: string };
        Update: Partial<
          Database["public"]["Tables"]["consultant_checklist_items"]["Row"]
        >;
        Relationships: [];
      };
      feedback_reviews: {
        Row: {
          id: string;
          consultant_id: string;
          reviewer_id: string;
          project_name: string | null;
          technical_competence: number;
          quality_of_deliverables: number;
          programme_reliability: number;
          communication: number;
          commercial_value: number;
          blacklist: boolean;
          comments: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<
          Database["public"]["Tables"]["feedback_reviews"]["Row"]
        > & {
          consultant_id: string;
          reviewer_id: string;
          technical_competence: number;
          quality_of_deliverables: number;
          programme_reliability: number;
          communication: number;
          commercial_value: number;
        };
        Update: Partial<Database["public"]["Tables"]["feedback_reviews"]["Row"]>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      app_role: AppRole;
      consultant_status: ConsultantStatus;
      consultant_tier: ConsultantTier;
      checklist_status: ChecklistStatus;
    };
    CompositeTypes: Record<string, never>;
  };
}

export const FEEDBACK_CATEGORIES = [
  { key: "technical_competence", label: "Technical competence" },
  { key: "quality_of_deliverables", label: "Quality of deliverables" },
  { key: "programme_reliability", label: "Programme / delivery reliability" },
  { key: "communication", label: "Communication & coordination" },
  { key: "commercial_value", label: "Commercial / price value" },
] as const;

export type FeedbackCategoryKey = (typeof FEEDBACK_CATEGORIES)[number]["key"];
