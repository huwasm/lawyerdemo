"use client";

import { useState } from "react";
import Link from "next/link";

type Step = 1 | 2 | 3;

export default function InfoAndrew() {
  const [step, setStep] = useState<Step>(1);

  return (
    <div className="flex min-h-screen flex-col bg-clio-bg">
      {/* Header */}
      <header className="flex items-center justify-between border-b border-clio-border bg-white px-7 py-3">
        <div className="flex items-center gap-3">
          <span className="text-lg font-bold text-clio-blue">Richards &amp; Law</span>
          <span className="text-xl font-light text-clio-border">|</span>
          <span className="text-[15px] font-semibold text-clio-text">Smart Intake</span>
          <span className="rounded-full bg-clio-blue-light px-3 py-1 text-xs font-semibold text-clio-blue">
            Powered by Swans
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[13px] font-medium text-clio-text">Andrew Richards</span>
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-clio-blue text-xs font-semibold text-white">
            AR
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="flex flex-1 flex-col items-center px-4 py-10">
        {/* Step badge */}
        <div className="mb-5 inline-flex items-center gap-1.5 rounded-full bg-clio-blue-light px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wide text-clio-blue">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 6v6l4 2" />
          </svg>
          Step {step} of 3
        </div>

        {/* === STEP 1 — Welcome & ROI === */}
        {step === 1 && (
          <>
            <h1 className="mb-2 max-w-[680px] text-center text-[26px] font-bold tracking-tight text-clio-text">
              Welcome, Andrew. Here&apos;s What Smart Intake Does for Your Firm.
            </h1>
            <p className="mb-9 max-w-[560px] text-center text-[15px] leading-relaxed text-clio-text-light">
              One-click automation from police report to client email &mdash; after your team verifies the data.
            </p>

            {/* ROI Cards */}
            <div className="mb-8 grid w-full max-w-[780px] grid-cols-3 gap-5">
              <RoiCard icon="clock" stat="45 min → 3 min" label="Average intake time per case" />
              <RoiCard icon="shield" stat="99.2%" label="Data accuracy with AI extraction" />
              <RoiCard icon="dollar" stat="12 hrs/week" label="Staff time saved on manual entry" />
            </div>

            {/* Description */}
            <div className="mb-8 w-full max-w-[780px] rounded-xl border border-clio-border bg-white p-6 shadow-sm">
              <p className="text-sm leading-[1.7] text-clio-text">
                Smart Intake reads police report PDFs, extracts all relevant data, matches to the right Clio Matter, generates the retainer agreement, sets the statute of limitations deadline, and emails the client &mdash; all in one click after your team verifies the data.
              </p>
            </div>

            {/* CTA */}
            <button
              onClick={() => setStep(2)}
              className="inline-flex items-center gap-2 rounded-lg bg-clio-blue px-8 py-3 text-[15px] font-semibold text-white transition-colors hover:bg-clio-blue-dark"
            >
              Your Workflow with Smart Intake
              <ArrowRight />
            </button>
          </>
        )}

        {/* === STEP 2 — Workflow Overview === */}
        {step === 2 && (
          <>
            <h1 className="mb-2 max-w-[680px] text-center text-[26px] font-bold tracking-tight text-clio-text">
              Your Workflow
            </h1>
            <p className="mb-9 max-w-[560px] text-center text-[15px] leading-relaxed text-clio-text-light">
              This is how Smart Intake works. You can review and change any data before approving.
            </p>

            {/* Workflow steps card */}
            <div className="mb-6 w-full max-w-[780px] overflow-hidden rounded-xl border border-clio-border bg-white shadow-sm">
              <WorkflowItem
                num={1}
                title="Upload Police Report"
                desc="Drop an MV-104AN PDF into the dashboard. AI reads and extracts all fields automatically."
                active
              />
              <WorkflowItem
                num={2}
                title="Review Extracted Data"
                desc="All extracted fields are editable. Change anything that looks wrong before proceeding."
                active
              />
              <WorkflowItem
                num={3}
                title="Match to Clio Matter"
                desc="The system auto-matches the client name to an existing Matter in Clio. You can override the match."
                active
              />
              <WorkflowItem
                num={4}
                title="Approve & Send"
                desc="One click: updates custom fields, generates retainer, sets calendar deadline, and emails the client."
                active
                last
              />
            </div>

            {/* Info note */}
            <div className="mb-7 flex w-full max-w-[780px] items-start gap-2.5 rounded-lg bg-clio-blue-light px-5 py-3.5">
              <svg className="mt-0.5 h-[18px] w-[18px] flex-shrink-0 text-clio-blue" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="16" x2="12" y2="12" />
                <line x1="12" y1="8" x2="12.01" y2="8" />
              </svg>
              <p className="text-[13px] leading-relaxed text-clio-blue-dark">
                You have full control. Every field is editable before approval. Nothing is sent without your confirmation.
              </p>
            </div>

            {/* Buttons */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => setStep(1)}
                className="inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium text-clio-text-light transition-colors hover:text-clio-text"
              >
                <ArrowLeft />
                Back
              </button>
              <button
                onClick={() => setStep(3)}
                className="inline-flex items-center gap-2 rounded-lg bg-clio-blue px-8 py-3 text-[15px] font-semibold text-white transition-colors hover:bg-clio-blue-dark"
              >
                Continue
                <ArrowRight />
              </button>
            </div>
          </>
        )}

        {/* === STEP 3 — Integration Status === */}
        {step === 3 && (
          <>
            <h1 className="mb-2 max-w-[680px] text-center text-[26px] font-bold tracking-tight text-clio-text">
              Your Integrations
            </h1>
            <p className="mb-9 max-w-[560px] text-center text-[15px] leading-relaxed text-clio-text-light">
              Everything is connected and ready to go.
            </p>

            {/* Integration list */}
            <div className="mb-8 flex w-full max-w-[780px] flex-col gap-3">
              <IntegrationCard
                status="green"
                name="Clio Manage"
                statusText={<><span className="font-medium text-clio-success">Connected</span> &mdash; US Account</>}
                detail="8 custom fields configured"
              />
              <IntegrationCard
                status="green"
                name="AI Provider"
                statusText={<><span className="font-medium text-clio-success">Anthropic Claude</span> &mdash; Active</>}
                detail="PDF extraction and email generation"
              />
              <IntegrationCard
                status="green"
                name="Email (Resend)"
                statusText={<><span className="font-medium text-clio-success">Connected</span></>}
                detail="Sending to: client email"
              />
              <IntegrationCard
                status="green"
                name="Calendar"
                statusText={<><span className="font-medium text-clio-success">Connected</span> &mdash; Calendar ID: 8709871</>}
                detail="SOL = accident date + 8 years"
              />
              <IntegrationCard
                status="green"
                name="Retainer Templates"
                statusText={<><span className="font-medium text-clio-success">Connected</span> &mdash; 2 templates</>}
                detail="Bodily Injury (#9131206) &middot; Property Damage (#9131221)"
              />
            </div>

            {/* CTA */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => setStep(2)}
                className="inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium text-clio-text-light transition-colors hover:text-clio-text"
              >
                <ArrowLeft />
                Back
              </button>
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 rounded-lg bg-clio-blue px-10 py-3.5 text-base font-semibold text-white transition-colors hover:bg-clio-blue-dark"
              >
                Go to Dashboard
                <ArrowRight />
              </Link>
            </div>
          </>
        )}

        {/* Progress bar */}
        <div className="mt-10 w-full max-w-[780px] border-t border-clio-border pt-6">
          <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-clio-text-light">
            Step {step} of 3
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-200">
            <div
              className="h-full rounded-full bg-clio-blue transition-all duration-300"
              style={{ width: `${(step / 3) * 100}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// --- Sub-components ---

function RoiCard({ icon, stat, label }: { icon: string; stat: string; label: string }) {
  return (
    <div className="relative overflow-hidden rounded-xl border border-clio-border bg-white px-6 py-7 text-center shadow-sm">
      <div className="absolute left-0 right-0 top-0 h-[3px] bg-clio-blue" />
      <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-clio-blue-light">
        {icon === "clock" && (
          <svg className="h-6 w-6 text-clio-blue" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
        )}
        {icon === "shield" && (
          <svg className="h-6 w-6 text-clio-blue" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /><polyline points="9 12 11 14 15 10" /></svg>
        )}
        {icon === "dollar" && (
          <svg className="h-6 w-6 text-clio-blue" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>
        )}
      </div>
      <div className="mb-1 text-[28px] font-bold tracking-tight text-clio-blue">{stat}</div>
      <div className="text-[13px] leading-snug text-clio-text-light">{label}</div>
    </div>
  );
}

function WorkflowItem({ num, title, desc, active, last }: { num: number; title: string; desc: string; active?: boolean; last?: boolean }) {
  return (
    <div className={`flex items-start gap-4 px-6 py-5 ${last ? "" : "border-b border-clio-border"}`}>
      <div className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-sm font-bold ${active ? "bg-clio-blue text-white" : "bg-gray-200 text-clio-text-light"}`}>
        {num}
      </div>
      <div className="flex-1">
        <div className="text-sm font-semibold text-clio-text">{title}</div>
        <div className="text-[13px] leading-relaxed text-clio-text-light">{desc}</div>
      </div>
    </div>
  );
}

function IntegrationCard({ status, name, statusText, detail }: { status: "green" | "yellow"; name: string; statusText: React.ReactNode; detail: string }) {
  return (
    <div className="flex items-start gap-4 rounded-xl border border-clio-border bg-white px-6 py-5 shadow-sm">
      <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-[10px] ${status === "green" ? "bg-clio-success-bg" : "bg-clio-warning-bg"}`}>
        {status === "green" ? (
          <svg className="h-5 w-5 text-clio-success" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
        ) : (
          <svg className="h-5 w-5 text-clio-warning" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>
        )}
      </div>
      <div className="flex-1">
        <div className="text-[15px] font-semibold text-clio-text">{name}</div>
        <div className="text-[13px] text-clio-text-light">{statusText}</div>
        <div className="mt-0.5 text-xs text-clio-text-light">{detail}</div>
      </div>
    </div>
  );
}

function ArrowRight() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>
  );
}

function ArrowLeft() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" /></svg>
  );
}
