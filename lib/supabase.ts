import { createClient } from "@supabase/supabase-js";

// Server-side Supabase client (uses service_role key — bypasses RLS)
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.SUPABASE_SERVICE_ROLE_KEY || ""
);

// Table names
export const TABLES = {
  INTAKE_REPORTS: "60001_intake_reports",
  AUDIT_LOG: "60002_audit_log",
} as const;

// Storage bucket
export const BUCKETS = {
  INTAKE_PDFS: "60001-intake-pdfs",
} as const;
