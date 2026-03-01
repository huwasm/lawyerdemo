-- ============================================================
-- Migration: Create Lawyer Intake Tables (60001–60002)
-- Project: Richards & Law — Smart Intake (Hackathon)
-- Date: 2026-03-01
-- Range: 60001–60999 reserved for this project
-- ============================================================

-- 60001: intake_reports
-- Stores every uploaded police report + extracted data + pipeline status
CREATE TABLE IF NOT EXISTS "60001_intake_reports" (
  id              uuid PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now(),

  -- Upload
  filename        text NOT NULL,
  file_size_bytes integer,

  -- AI Extraction
  extracted_json  jsonb,                -- Full AI extraction result
  ai_provider     text,                 -- 'openai' or 'anthropic'
  extraction_ms   integer,              -- How long extraction took (ms)

  -- Clio Match
  matter_id       integer,              -- Clio Matter ID
  matter_name     text,                 -- e.g. "Reyes v Francois"
  client_name     text,                 -- Matched client full name
  contact_id      integer,              -- Clio Contact ID

  -- Pipeline Status
  status          text NOT NULL DEFAULT 'draft'
                  CHECK (status IN ('draft', 'reviewing', 'approved', 'error', 'partial')),

  -- Pipeline Step Results (traffic lights)
  step_fields     text DEFAULT 'pending'
                  CHECK (step_fields IN ('pending', 'success', 'error', 'skipped')),
  step_retainer   text DEFAULT 'pending'
                  CHECK (step_retainer IN ('pending', 'success', 'error', 'skipped')),
  step_calendar   text DEFAULT 'pending'
                  CHECK (step_calendar IN ('pending', 'success', 'error', 'skipped')),
  step_email      text DEFAULT 'pending'
                  CHECK (step_email IN ('pending', 'success', 'error', 'skipped')),

  -- Approval
  approved_at     timestamptz,
  approved_by     text,                 -- User email or 'anonymous'
  error_message   text,

  -- Clio IDs created during pipeline
  clio_document_id integer,             -- Retainer document ID in Clio
  clio_calendar_id integer,             -- Calendar entry ID in Clio
  email_id        text                  -- Resend email ID
);

-- Index for deduplication check (same matter already processed?)
CREATE INDEX IF NOT EXISTS idx_60001_matter_id ON "60001_intake_reports" (matter_id);
CREATE INDEX IF NOT EXISTS idx_60001_status ON "60001_intake_reports" (status);
CREATE INDEX IF NOT EXISTS idx_60001_created_at ON "60001_intake_reports" (created_at DESC);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_60001_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_60001_updated_at
  BEFORE UPDATE ON "60001_intake_reports"
  FOR EACH ROW
  EXECUTE FUNCTION update_60001_updated_at();


-- ============================================================
-- 60002: audit_log
-- Per-step audit trail for every action in the pipeline
-- ============================================================

CREATE TABLE IF NOT EXISTS "60002_audit_log" (
  id              uuid PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  created_at      timestamptz NOT NULL DEFAULT now(),

  -- Link to report
  report_id       uuid NOT NULL REFERENCES "60001_intake_reports" (id) ON DELETE CASCADE,

  -- What happened
  action          text NOT NULL
                  CHECK (action IN (
                    'uploaded',
                    'extracted',
                    'matched',
                    'fields_updated',
                    'retainer_generated',
                    'calendar_created',
                    'email_sent',
                    'retry',
                    'error'
                  )),

  -- Details
  detail          jsonb,                -- Action-specific data (field IDs, doc ID, etc.)
  success         boolean NOT NULL DEFAULT true,
  error_message   text,
  duration_ms     integer               -- How long this step took
);

CREATE INDEX IF NOT EXISTS idx_60002_report_id ON "60002_audit_log" (report_id);
CREATE INDEX IF NOT EXISTS idx_60002_action ON "60002_audit_log" (action);
CREATE INDEX IF NOT EXISTS idx_60002_created_at ON "60002_audit_log" (created_at DESC);


-- ============================================================
-- RLS: Disable for now (using service_role key from server)
-- Enable later when we add user auth
-- ============================================================
ALTER TABLE "60001_intake_reports" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "60002_audit_log" ENABLE ROW LEVEL SECURITY;

-- Allow service_role full access (our API routes use this key)
CREATE POLICY "Service role full access on 60001"
  ON "60001_intake_reports"
  FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Service role full access on 60002"
  ON "60002_audit_log"
  FOR ALL
  USING (true)
  WITH CHECK (true);
