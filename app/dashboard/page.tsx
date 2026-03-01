"use client";

import { useState, useCallback, useRef } from "react";

// --- Types ---

interface VehicleInfo {
  driver_name_first: string;
  driver_name_last: string;
  sex: string;
  plate_number: string;
  plate_state: string;
  vehicle_year: string;
  vehicle_make: string;
  vehicle_type: string;
  is_pedestrian: boolean;
  is_bicyclist: boolean;
  address: string;
  city: string;
  state: string;
  zip: string;
}

interface ExtractionData {
  accident_date: string;
  accident_time: string;
  no_injured: number;
  no_killed: number;
  no_vehicles: number;
  accident_location: {
    road: string;
    intersecting_street: string;
    borough: string;
  };
  vehicle_1: VehicleInfo;
  vehicle_2: VehicleInfo;
  officer_notes: string;
  all_persons_involved: { name: string; age: number; sex: string }[];
  confidence: Record<string, number>;
}

interface MatchResult {
  matter: { id: number; client: { id: number; name: string } };
  matchedVehicle: 1 | 2;
  clientFirst: string;
  clientLast: string;
  defendantFirst: string;
  defendantLast: string;
  clientEmail: string;
}

type Phase = "upload" | "extracting" | "review" | "processing" | "success";

type ProcessingStep = {
  label: string;
  status: "pending" | "active" | "done" | "error";
};

// --- Helpers ---

function computeStatuteDate(accidentDate: string, years: number): string {
  const parts = accidentDate.split("/");
  if (parts.length !== 3) return "";
  const y = parseInt(parts[2]) + years;
  const m = parts[0].padStart(2, "0");
  const d = parts[1].padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function formatStatuteDisplay(isoDate: string): string {
  if (!isoDate) return "";
  const [y, m, d] = isoDate.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  return `${date.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })} (8 years)`;
}

function confidenceBadge(score: number | undefined) {
  if (!score) return null;
  const level =
    score >= 90 ? "high" : score >= 70 ? "medium" : "low";
  const colors = {
    high: "bg-clio-success-bg text-clio-success",
    medium: "bg-clio-warning-bg text-clio-warning",
    low: "bg-red-50 text-clio-error",
  };
  return (
    <span className={`rounded px-1.5 py-0.5 text-xs font-semibold ${colors[level]}`}>
      {score}%
    </span>
  );
}

function buildLocationString(loc: ExtractionData["accident_location"]): string {
  const parts = [loc.road, loc.intersecting_street, loc.borough]
    .filter(Boolean)
    .join(", ");
  return parts || "";
}

// --- Component ---

export default function Dashboard() {
  const [phase, setPhase] = useState<Phase>("upload");
  const [fileName, setFileName] = useState("");
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [extraction, setExtraction] = useState<ExtractionData | null>(null);
  const [match, setMatch] = useState<MatchResult | null>(null);
  const [matches, setMatches] = useState<MatchResult[]>([]);
  const [error, setError] = useState("");
  const [steps, setSteps] = useState<ProcessingStep[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Editable fields
  const [clientFirst, setClientFirst] = useState("");
  const [clientLast, setClientLast] = useState("");
  const [clientGender, setClientGender] = useState("M");
  const [clientPlate, setClientPlate] = useState("");
  const [clientAddress, setClientAddress] = useState("");
  const [accidentDate, setAccidentDate] = useState("");
  const [noInjured, setNoInjured] = useState(0);
  const [accidentLocation, setAccidentLocation] = useState("");
  const [officerNotes, setOfficerNotes] = useState("");
  const [defendantName, setDefendantName] = useState("");
  const [defendantVehicle, setDefendantVehicle] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [matterId, setMatterId] = useState(0);
  const [statuteDate, setStatuteDate] = useState("");

  // --- Upload ---

  const handleFile = useCallback(async (file: File) => {
    setError("");
    setFileName(file.name);
    // Create a blob URL so the original PDF can be displayed in the left panel
    if (pdfUrl) URL.revokeObjectURL(pdfUrl);
    const blobUrl = URL.createObjectURL(file);
    setPdfUrl(blobUrl);
    setPhase("extracting");

    try {
      // Step 1: Extract
      const formData = new FormData();
      formData.append("file", file);
      const extractRes = await fetch("/api/extract", {
        method: "POST",
        body: formData,
      });
      const extractJson = await extractRes.json();
      if (!extractRes.ok) throw new Error(extractJson.error);

      const data: ExtractionData = extractJson.data;
      setExtraction(data);

      // Step 2: Match
      const matchRes = await fetch("/api/match", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          all_persons: data.all_persons_involved,
          vehicle_1: data.vehicle_1,
          vehicle_2: data.vehicle_2,
        }),
      });
      const matchJson = await matchRes.json();

      if (matchJson.matchCount === 1) {
        const m = matchJson.matches[0];
        setMatch(m);
        populateFields(data, m);
      } else if (matchJson.matchCount > 1) {
        setMatches(matchJson.matches);
        // Populate with first match, user can switch
        const m = matchJson.matches[0];
        setMatch(m);
        populateFields(data, m);
      } else {
        // No match — populate from V1 as default
        populateFieldsNoMatch(data);
      }

      setPhase("review");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setPhase("upload");
    }
  }, []);

  function populateFields(data: ExtractionData, m: MatchResult) {
    const clientVehicle = m.matchedVehicle === 1 ? data.vehicle_1 : data.vehicle_2;
    const defendantVehicle_ = m.matchedVehicle === 1 ? data.vehicle_2 : data.vehicle_1;

    setClientFirst(m.clientFirst);
    setClientLast(m.clientLast);
    setClientGender(clientVehicle.sex || "M");
    setClientPlate(clientVehicle.plate_number || "N/A");
    setClientAddress(
      [clientVehicle.address, clientVehicle.city, clientVehicle.state, clientVehicle.zip]
        .filter(Boolean)
        .join(", ")
    );
    setAccidentDate(data.accident_date);
    setNoInjured(data.no_injured);
    setAccidentLocation(buildLocationString(data.accident_location));
    setOfficerNotes(data.officer_notes);
    setDefendantName(`${m.defendantFirst} ${m.defendantLast}`);
    setDefendantVehicle(
      [defendantVehicle_.vehicle_year, defendantVehicle_.vehicle_make, defendantVehicle_.vehicle_type]
        .filter(Boolean)
        .join(" ")
    );
    setClientEmail(m.clientEmail);
    setMatterId(m.matter.id);

    const sol = computeStatuteDate(data.accident_date, 8);
    setStatuteDate(sol);
  }

  function populateFieldsNoMatch(data: ExtractionData) {
    setClientFirst(data.vehicle_1.driver_name_first);
    setClientLast(data.vehicle_1.driver_name_last);
    setClientGender(data.vehicle_1.sex || "M");
    setClientPlate(data.vehicle_1.plate_number || "N/A");
    setClientAddress(
      [data.vehicle_1.address, data.vehicle_1.city, data.vehicle_1.state, data.vehicle_1.zip]
        .filter(Boolean)
        .join(", ")
    );
    setAccidentDate(data.accident_date);
    setNoInjured(data.no_injured);
    setAccidentLocation(buildLocationString(data.accident_location));
    setOfficerNotes(data.officer_notes);
    setDefendantName(`${data.vehicle_2.driver_name_first} ${data.vehicle_2.driver_name_last}`);
    setDefendantVehicle(
      [data.vehicle_2.vehicle_year, data.vehicle_2.vehicle_make, data.vehicle_2.vehicle_type]
        .filter(Boolean)
        .join(" ")
    );
    setClientEmail(process.env.NEXT_PUBLIC_HACKATHON_EMAIL || "");
    setMatterId(0);

    const sol = computeStatuteDate(data.accident_date, 8);
    setStatuteDate(sol);
  }

  function selectMatch(m: MatchResult) {
    setMatch(m);
    if (extraction) populateFields(extraction, m);
  }

  // --- Approve ---

  async function handleApprove() {
    if (!matterId) {
      setError("No Clio Matter linked. Cannot approve.");
      return;
    }

    setPhase("processing");
    const processingSteps: ProcessingStep[] = [
      { label: "Updating Matter custom fields", status: "pending" },
      { label: "Generating retainer agreement", status: "pending" },
      { label: "Creating calendar entry (SOL)", status: "pending" },
      { label: "Downloading retainer PDF", status: "pending" },
      { label: "Sending email to client", status: "pending" },
    ];
    setSteps(processingSteps);

    try {
      // Animate steps then fire the actual API call
      for (let i = 0; i < processingSteps.length; i++) {
        setSteps((prev) =>
          prev.map((s, j) => ({
            ...s,
            status: j === i ? "active" : j < i ? "done" : "pending",
          }))
        );

        if (i === 0) {
          // Fire the approve API on first step
          const res = await fetch("/api/approve", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              matterId,
              clientFirstName: clientFirst,
              clientLastName: clientLast,
              clientEmail,
              clientGender,
              accidentDate,
              accidentLocation,
              defendantName,
              registrationPlate: clientPlate,
              noInjured,
              officerNotes,
              statuteDate,
            }),
          });

          const json = await res.json();
          if (!res.ok) throw new Error(json.error);

          // Mark remaining steps as done with slight delays for visual effect
          for (let k = 0; k < processingSteps.length; k++) {
            await new Promise((r) => setTimeout(r, 400));
            setSteps((prev) =>
              prev.map((s, j) => ({
                ...s,
                status: j <= k ? "done" : j === k + 1 ? "active" : "pending",
              }))
            );
          }
          break;
        }
      }

      setPhase("success");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Approval failed");
      setSteps((prev) =>
        prev.map((s) => ({
          ...s,
          status: s.status === "active" ? "error" : s.status,
        }))
      );
    }
  }

  // --- Reset ---

  function handleReset() {
    if (pdfUrl) URL.revokeObjectURL(pdfUrl);
    setPhase("upload");
    setFileName("");
    setPdfUrl(null);
    setExtraction(null);
    setMatch(null);
    setMatches([]);
    setError("");
    setSteps([]);
    setClientFirst("");
    setClientLast("");
    setClientGender("M");
    setClientPlate("");
    setClientAddress("");
    setAccidentDate("");
    setNoInjured(0);
    setAccidentLocation("");
    setOfficerNotes("");
    setDefendantName("");
    setDefendantVehicle("");
    setClientEmail("");
    setMatterId(0);
    setStatuteDate("");
  }

  // --- Drop handler ---

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  // --- Render ---

  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="flex items-center justify-between border-b border-clio-border bg-white px-6 py-3">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-bold text-clio-blue">
            Richards & Law <span className="font-normal text-clio-text">| Intake</span>
          </h1>
          <span className="rounded-full bg-clio-blue-light px-3 py-1 text-xs font-semibold text-clio-blue">
            Powered by Clio
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-clio-text-light">Andrew Richards</span>
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-clio-blue text-xs font-semibold text-white">
            AR
          </div>
        </div>
      </header>

      {/* Main */}
      <div className="flex flex-1">
        {/* Left: PDF Panel */}
        <div className="flex w-[45%] flex-col border-r border-clio-border bg-white">
          <div className="border-b border-clio-border px-5 py-4">
            <div className="text-sm font-semibold text-clio-text">Police Report</div>
            <div className="text-xs text-clio-text-light">
              {fileName || "No file uploaded"}
            </div>
          </div>

          {phase === "upload" && (
            <div
              className="flex flex-1 items-center justify-center p-10"
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
            >
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full cursor-pointer rounded-xl border-2 border-dashed border-clio-border p-12 text-center transition-colors hover:border-clio-blue hover:bg-clio-blue-light"
              >
                <div className="mb-3 text-4xl">📄</div>
                <div className="text-base font-semibold">Drop police report PDF here</div>
                <div className="text-sm text-clio-text-light">
                  or click to upload — supports MV-104AN and other formats
                </div>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFile(file);
                }}
              />
            </div>
          )}

          {phase !== "upload" && pdfUrl && (
            <iframe
              src={pdfUrl}
              className="flex-1 w-full"
              title="Police Report PDF"
            />
          )}

          {phase !== "upload" && !pdfUrl && (
            <div className="flex flex-1 items-center justify-center bg-gray-100 text-sm text-clio-text-light">
              PDF preview not available
            </div>
          )}
        </div>

        {/* Right: Form Panel */}
        <div className="flex flex-1 flex-col overflow-y-auto">
          {/* Status bar */}
          {phase === "extracting" && (
            <div className="flex items-center gap-2 bg-clio-warning-bg px-5 py-3 text-sm text-clio-warning">
              <div className="h-2 w-2 animate-pulse-dot rounded-full bg-current" />
              AI extracting data from police report...
            </div>
          )}
          {phase === "review" && (
            <div className="flex items-center gap-2 bg-clio-success-bg px-5 py-3 text-sm text-clio-success">
              <div className="h-2 w-2 rounded-full bg-current" />
              AI extraction complete — review fields below
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="bg-red-50 px-5 py-3 text-sm text-clio-error">
              {error}
              <button onClick={() => setError("")} className="ml-3 underline">
                Dismiss
              </button>
            </div>
          )}

          {/* Form */}
          {(phase === "review" || phase === "extracting") && (
            <div className="flex-1 p-5">
              {/* Multiple matches picker */}
              {matches.length > 1 && (
                <Section title="Multiple Matches Found">
                  <div className="space-y-2">
                    {matches.map((m, i) => (
                      <button
                        key={i}
                        onClick={() => selectMatch(m)}
                        className={`w-full rounded-md border p-3 text-left text-sm transition-colors ${
                          match === m
                            ? "border-clio-blue bg-clio-blue-light"
                            : "border-clio-border hover:bg-gray-50"
                        }`}
                      >
                        <span className="font-semibold">{m.matter.client.name}</span>
                        <span className="ml-2 text-clio-text-light">
                          Matter #{m.matter.id} — Vehicle {m.matchedVehicle}
                        </span>
                      </button>
                    ))}
                  </div>
                </Section>
              )}

              {/* Client Info */}
              <Section title={`Client Information${match ? ` (Vehicle ${match.matchedVehicle})` : ""}`}>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="First Name" confidence={extraction?.confidence?.vehicle_1_name}>
                    <input className="input-field input-ai" value={clientFirst} onChange={(e) => setClientFirst(e.target.value)} />
                  </Field>
                  <Field label="Last Name" confidence={extraction?.confidence?.vehicle_1_name}>
                    <input className="input-field input-ai" value={clientLast} onChange={(e) => setClientLast(e.target.value)} />
                  </Field>
                  <Field label="Gender">
                    <select className="input-field input-ai" value={clientGender} onChange={(e) => setClientGender(e.target.value)}>
                      <option value="M">Male (his/him)</option>
                      <option value="F">Female (her/she)</option>
                    </select>
                  </Field>
                  <Field label="Registration Plate" confidence={extraction?.confidence?.plate_number}>
                    <input className="input-field input-ai" value={clientPlate} onChange={(e) => setClientPlate(e.target.value)} />
                  </Field>
                  <Field label="Client Address" full>
                    <input className="input-field input-ai" value={clientAddress} onChange={(e) => setClientAddress(e.target.value)} />
                  </Field>
                </div>
              </Section>

              {/* Accident Details */}
              <Section title="Accident Details">
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Date of Accident" confidence={extraction?.confidence?.accident_date}>
                    <input className="input-field input-ai" value={accidentDate} onChange={(e) => setAccidentDate(e.target.value)} />
                  </Field>
                  <Field label="Number Injured" confidence={extraction?.confidence?.no_injured}>
                    <input className="input-field input-ai" type="number" value={noInjured} onChange={(e) => setNoInjured(parseInt(e.target.value) || 0)} />
                  </Field>
                  <Field label="Accident Location" confidence={extraction?.confidence?.accident_location} full>
                    <input className="input-field input-ai" value={accidentLocation} onChange={(e) => setAccidentLocation(e.target.value)} />
                  </Field>
                  <Field label="Accident Description (officer notes)" confidence={extraction?.confidence?.officer_notes} full>
                    <textarea className="input-field input-ai min-h-[80px] resize-y" value={officerNotes} onChange={(e) => setOfficerNotes(e.target.value)} />
                  </Field>
                </div>
              </Section>

              {/* Defendant */}
              <Section title="Defendant">
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Defendant Name" confidence={extraction?.confidence?.vehicle_2_name}>
                    <input className="input-field input-ai" value={defendantName} onChange={(e) => setDefendantName(e.target.value)} />
                  </Field>
                  <Field label="Defendant Vehicle">
                    <input className="input-field input-ai" value={defendantVehicle} onChange={(e) => setDefendantVehicle(e.target.value)} />
                  </Field>
                </div>
              </Section>

              {/* Clio Matter */}
              <Section title="Clio Matter">
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Linked Matter">
                    <input
                      className="input-field bg-gray-50"
                      value={match ? `${match.matter.client.name} — #${match.matter.id}` : "No match found"}
                      disabled
                    />
                  </Field>
                  <Field label="Statute of Limitations">
                    <input className="input-field bg-gray-50" value={formatStatuteDisplay(statuteDate)} disabled />
                  </Field>
                </div>
              </Section>

              {/* Email Settings */}
              <Section title="Email Settings">
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Send To">
                    <input className="input-field" value={clientEmail} onChange={(e) => setClientEmail(e.target.value)} />
                  </Field>
                  <Field label="Calendly Link">
                    <input
                      className="input-field bg-gray-50 text-xs"
                      value={accidentDate ? (
                        parseInt(accidentDate.split("/")[0]) >= 3 && parseInt(accidentDate.split("/")[0]) <= 8
                          ? "In-office (Mar-Aug)"
                          : "Virtual (Sep-Feb)"
                      ) : ""}
                      disabled
                    />
                  </Field>
                </div>
              </Section>
            </div>
          )}

          {/* Upload placeholder */}
          {phase === "upload" && (
            <div className="flex flex-1 items-center justify-center text-clio-text-light">
              Upload a police report to get started
            </div>
          )}

          {/* Footer */}
          {phase === "review" && (
            <div className="sticky bottom-0 flex items-center justify-between border-t border-clio-border bg-white px-5 py-4">
              <div className="text-xs text-clio-text-light">
                {extraction?.confidence && (
                  <>
                    <span className="font-semibold text-clio-blue">
                      {Object.keys(extraction.confidence).length} fields
                    </span>{" "}
                    extracted
                  </>
                )}
              </div>
              <div className="flex gap-2">
                <button className="btn-secondary" onClick={handleReset}>
                  Reset
                </button>
                <button className="btn-primary" onClick={handleApprove} disabled={!matterId}>
                  Approve & Push to Clio
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Processing Overlay */}
      {phase === "processing" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-xl bg-white p-10 text-center">
            <h2 className="mb-6 text-lg font-bold">Pushing to Clio...</h2>
            <div className="mx-auto max-w-xs space-y-2 text-left">
              {steps.map((step, i) => (
                <div key={i} className={`flex items-center gap-3 py-2 text-sm ${
                  step.status === "done" ? "text-clio-success" :
                  step.status === "active" ? "font-semibold text-clio-text" :
                  step.status === "error" ? "text-clio-error" :
                  "text-clio-text-light"
                }`}>
                  <div className={`flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full text-xs ${
                    step.status === "done" ? "bg-clio-success text-white" :
                    step.status === "active" ? "animate-pulse-dot border-2 border-clio-blue text-clio-blue" :
                    step.status === "error" ? "bg-clio-error text-white" :
                    "border-2 border-clio-border"
                  }`}>
                    {step.status === "done" ? "✓" : step.status === "error" ? "!" : i + 1}
                  </div>
                  {step.label}
                </div>
              ))}
            </div>
            {error && (
              <div className="mt-4">
                <p className="text-sm text-clio-error">{error}</p>
                <button className="btn-secondary mt-3" onClick={handleReset}>
                  Try Again
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Success Overlay */}
      {phase === "success" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-xl bg-white p-10 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-clio-success-bg text-3xl text-clio-success">
              ✓
            </div>
            <h2 className="mb-2 text-xl font-bold">All Done!</h2>
            <p className="mb-6 text-sm leading-relaxed text-clio-text-light">
              Matter updated in Clio<br />
              Retainer agreement generated & stored<br />
              SOL calendared for {formatStatuteDisplay(statuteDate)}<br />
              Email sent to {clientEmail}
            </p>
            <button className="btn-primary w-full" onClick={handleReset}>
              Process Next Report
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// --- Sub-components ---

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-6">
      <h3 className="mb-3 border-b border-clio-border pb-2 text-xs font-bold uppercase tracking-wide text-clio-text-light">
        {title}
      </h3>
      {children}
    </div>
  );
}

function Field({
  label,
  confidence,
  full,
  children,
}: {
  label: string;
  confidence?: number;
  full?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className={`flex flex-col gap-1 ${full ? "col-span-2" : ""}`}>
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold text-clio-text-light">{label}</label>
        {confidenceBadge(confidence)}
      </div>
      {children}
    </div>
  );
}

