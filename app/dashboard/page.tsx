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
  ins_code: string;
  is_pedestrian: boolean;
  is_bicyclist: boolean;
  is_other_pedestrian: boolean;
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

interface SavedReport {
  id: string;
  filename: string;
  created_at: string;
  ai_provider: string;
  status: string;
  extraction_ms: number;
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

function computeDayOfWeek(dateStr: string): string {
  // dateStr = "MM/DD/YYYY"
  const parts = dateStr.split("/");
  if (parts.length !== 3) return "";
  const [m, d, y] = parts.map(Number);
  const date = new Date(y, m - 1, d);
  if (isNaN(date.getTime())) return "";
  return date.toLocaleDateString("en-US", { weekday: "long" });
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
  const [clientPlateState, setClientPlateState] = useState("");
  const [clientVehicleYearMake, setClientVehicleYearMake] = useState("");
  const [clientVehicleType, setClientVehicleType] = useState("");
  const [clientInsCode, setClientInsCode] = useState("");
  const [clientAddress, setClientAddress] = useState("");
  const [clientCity, setClientCity] = useState("");
  const [clientState, setClientState] = useState("");
  const [clientZip, setClientZip] = useState("");
  const [accidentDate, setAccidentDate] = useState("");
  const [noInjured, setNoInjured] = useState(0);
  const [accidentLocation, setAccidentLocation] = useState("");
  const [officerNotes, setOfficerNotes] = useState("");
  const [defendantFirst, setDefendantFirst] = useState("");
  const [defendantLast, setDefendantLast] = useState("");
  const [defendantVehicle, setDefendantVehicle] = useState("");
  const [defendantIsVehicle, setDefendantIsVehicle] = useState(false);
  const [defendantVehicleNum, setDefendantVehicleNum] = useState(0);
  const [defendantIsBicyclist, setDefendantIsBicyclist] = useState(false);
  const [defendantIsPedestrian, setDefendantIsPedestrian] = useState(false);
  const [defendantIsOtherPed, setDefendantIsOtherPed] = useState(false);
  const [showDefendantFlags, setShowDefendantFlags] = useState(true);
  const [defendantPlate, setDefendantPlate] = useState("");
  const [defendantPlateState, setDefendantPlateState] = useState("");
  const [defendantVehicleYearMake, setDefendantVehicleYearMake] = useState("");
  const [defendantVehicleType, setDefendantVehicleType] = useState("");
  const [defendantInsCode, setDefendantInsCode] = useState("");
  const [defendantAddress, setDefendantAddress] = useState("");
  const [defendantCity, setDefendantCity] = useState("");
  const [defendantState, setDefendantState] = useState("");
  const [defendantZip, setDefendantZip] = useState("");
  // Client party type flags
  const [clientIsVehicle, setClientIsVehicle] = useState(false);
  const [clientVehicleNum, setClientVehicleNum] = useState(0);
  const [clientIsBicyclist, setClientIsBicyclist] = useState(false);
  const [clientIsPedestrian, setClientIsPedestrian] = useState(false);
  const [clientIsOtherPed, setClientIsOtherPed] = useState(false);
  const [showClientFlags, setShowClientFlags] = useState(true);
  const [clientEmail, setClientEmail] = useState("");
  const [accidentTime, setAccidentTime] = useState("");
  const [dayOfWeek, setDayOfWeek] = useState("");
  const [noVehicles, setNoVehicles] = useState(0);
  const [noKilled, setNoKilled] = useState(0);
  const [showExtraAccident, setShowExtraAccident] = useState(false);
  const [matterId, setMatterId] = useState(0);
  const [statuteDate, setStatuteDate] = useState("");

  // QA audit mode
  const [showAudit, setShowAudit] = useState(false);
  const [fieldAudit, setFieldAudit] = useState<Record<string, boolean>>({});

  // Saved reports
  const [savedReports, setSavedReports] = useState<SavedReport[]>([]);
  const [showSaved, setShowSaved] = useState(false);
  const [loadingReport, setLoadingReport] = useState(false);

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
    setClientPlateState(clientVehicle.plate_state || "");
    setClientVehicleYearMake([clientVehicle.vehicle_year, clientVehicle.vehicle_make].filter(Boolean).join(" "));
    setClientVehicleType(clientVehicle.vehicle_type || "");
    setClientInsCode(clientVehicle.ins_code || "");
    setClientAddress(clientVehicle.address || "");
    setClientCity(clientVehicle.city || "");
    setClientState(clientVehicle.state || "");
    setClientZip(clientVehicle.zip || "");
    setAccidentDate(data.accident_date);
    setNoInjured(data.no_injured);
    setAccidentLocation(buildLocationString(data.accident_location));
    setOfficerNotes(data.officer_notes);
    setDefendantFirst(m.defendantFirst);
    setDefendantLast(m.defendantLast);
    setDefendantVehicle(
      [defendantVehicle_.vehicle_year, defendantVehicle_.vehicle_make, defendantVehicle_.vehicle_type]
        .filter(Boolean)
        .join(" ")
    );
    setDefendantVehicleNum(m.matchedVehicle === 1 ? 2 : 1);
    setDefendantIsVehicle(!defendantVehicle_.is_bicyclist && !defendantVehicle_.is_pedestrian);
    setDefendantIsBicyclist(defendantVehicle_.is_bicyclist || false);
    setDefendantIsPedestrian(defendantVehicle_.is_pedestrian || false);
    setDefendantIsOtherPed(defendantVehicle_.is_other_pedestrian || false);
    setDefendantPlate(defendantVehicle_.plate_number || "");
    setDefendantPlateState(defendantVehicle_.plate_state || "");
    setDefendantVehicleYearMake([defendantVehicle_.vehicle_year, defendantVehicle_.vehicle_make].filter(Boolean).join(" "));
    setDefendantVehicleType(defendantVehicle_.vehicle_type || "");
    setDefendantInsCode(defendantVehicle_.ins_code || "");
    setDefendantAddress(defendantVehicle_.address || "");
    setDefendantCity(defendantVehicle_.city || "");
    setDefendantState(defendantVehicle_.state || "");
    setDefendantZip(defendantVehicle_.zip || "");
    // Client party type flags
    setClientVehicleNum(m.matchedVehicle);
    setClientIsVehicle(!clientVehicle.is_bicyclist && !clientVehicle.is_pedestrian);
    setClientIsBicyclist(clientVehicle.is_bicyclist || false);
    setClientIsPedestrian(clientVehicle.is_pedestrian || false);
    setClientIsOtherPed(clientVehicle.is_other_pedestrian || false);
    setClientEmail(m.clientEmail);
    setMatterId(m.matter.id);
    setAccidentTime(data.accident_time || "");
    setDayOfWeek(computeDayOfWeek(data.accident_date));
    setNoVehicles(data.no_vehicles || 0);
    setNoKilled(data.no_killed || 0);

    const sol = computeStatuteDate(data.accident_date, 8);
    setStatuteDate(sol);
  }

  function populateFieldsNoMatch(data: ExtractionData) {
    setClientFirst(data.vehicle_1.driver_name_first);
    setClientLast(data.vehicle_1.driver_name_last);
    setClientGender(data.vehicle_1.sex || "M");
    setClientPlate(data.vehicle_1.plate_number || "N/A");
    setClientPlateState(data.vehicle_1.plate_state || "");
    setClientVehicleYearMake([data.vehicle_1.vehicle_year, data.vehicle_1.vehicle_make].filter(Boolean).join(" "));
    setClientVehicleType(data.vehicle_1.vehicle_type || "");
    setClientInsCode(data.vehicle_1.ins_code || "");
    setClientAddress(data.vehicle_1.address || "");
    setClientCity(data.vehicle_1.city || "");
    setClientState(data.vehicle_1.state || "");
    setClientZip(data.vehicle_1.zip || "");
    setAccidentDate(data.accident_date);
    setNoInjured(data.no_injured);
    setAccidentLocation(buildLocationString(data.accident_location));
    setOfficerNotes(data.officer_notes);
    setDefendantFirst(data.vehicle_2.driver_name_first);
    setDefendantLast(data.vehicle_2.driver_name_last);
    setDefendantVehicle(
      [data.vehicle_2.vehicle_year, data.vehicle_2.vehicle_make, data.vehicle_2.vehicle_type]
        .filter(Boolean)
        .join(" ")
    );
    setDefendantVehicleNum(2);
    setDefendantIsVehicle(!data.vehicle_2.is_bicyclist && !data.vehicle_2.is_pedestrian);
    setDefendantIsBicyclist(data.vehicle_2.is_bicyclist || false);
    setDefendantIsPedestrian(data.vehicle_2.is_pedestrian || false);
    setDefendantIsOtherPed(data.vehicle_2.is_other_pedestrian || false);
    setDefendantPlate(data.vehicle_2.plate_number || "");
    setDefendantPlateState(data.vehicle_2.plate_state || "");
    setDefendantVehicleYearMake([data.vehicle_2.vehicle_year, data.vehicle_2.vehicle_make].filter(Boolean).join(" "));
    setDefendantVehicleType(data.vehicle_2.vehicle_type || "");
    setDefendantInsCode(data.vehicle_2.ins_code || "");
    setDefendantAddress(data.vehicle_2.address || "");
    setDefendantCity(data.vehicle_2.city || "");
    setDefendantState(data.vehicle_2.state || "");
    setDefendantZip(data.vehicle_2.zip || "");
    // Client party type flags (no match = default to V1)
    setClientVehicleNum(1);
    setClientIsVehicle(!data.vehicle_1.is_bicyclist && !data.vehicle_1.is_pedestrian);
    setClientIsBicyclist(data.vehicle_1.is_bicyclist || false);
    setClientIsPedestrian(data.vehicle_1.is_pedestrian || false);
    setClientIsOtherPed(data.vehicle_1.is_other_pedestrian || false);
    setClientEmail(process.env.NEXT_PUBLIC_HACKATHON_EMAIL || "");
    setMatterId(0);
    setAccidentTime(data.accident_time || "");
    setDayOfWeek(computeDayOfWeek(data.accident_date));
    setNoVehicles(data.no_vehicles || 0);
    setNoKilled(data.no_killed || 0);

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
              defendantName: `${defendantFirst} ${defendantLast}`.trim(),
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

  // --- Saved Reports ---

  async function fetchSavedReports() {
    setShowSaved(true);
    try {
      const res = await fetch("/api/reports");
      const json = await res.json();
      if (json.success) setSavedReports(json.reports || []);
    } catch {
      setError("Failed to load saved reports");
    }
  }

  async function loadReport(reportId: string) {
    setLoadingReport(true);
    try {
      const res = await fetch(`/api/reports?id=${reportId}`);
      const json = await res.json();
      if (!json.success) throw new Error(json.error);

      const report = json.report;
      const data: ExtractionData = report.extracted_json;
      setExtraction(data);
      setFileName(report.filename);
      if (pdfUrl) URL.revokeObjectURL(pdfUrl);
      setPdfUrl(json.pdfUrl || null);

      // Populate fields from saved extraction
      populateFieldsNoMatch(data);

      setShowSaved(false);
      setPhase("review");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load report");
    } finally {
      setLoadingReport(false);
    }
  }

  // --- QA Audit helpers ---

  function auditProps(key: string) {
    if (!showAudit) return {};
    return {
      auditKey: key,
      auditChecked: fieldAudit[key] || false,
      onAuditToggle: () => setFieldAudit((prev) => ({ ...prev, [key]: !prev[key] })),
    };
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
    setClientPlateState("");
    setClientVehicleYearMake("");
    setClientVehicleType("");
    setClientInsCode("");
    setClientAddress("");
    setClientCity("");
    setClientState("");
    setClientZip("");
    setAccidentDate("");
    setNoInjured(0);
    setAccidentLocation("");
    setOfficerNotes("");
    setDefendantFirst("");
    setDefendantLast("");
    setDefendantVehicle("");
    setDefendantIsVehicle(false);
    setDefendantVehicleNum(0);
    setDefendantIsBicyclist(false);
    setDefendantIsPedestrian(false);
    setDefendantIsOtherPed(false);
    setDefendantPlate("");
    setDefendantPlateState("");
    setDefendantVehicleYearMake("");
    setDefendantVehicleType("");
    setDefendantInsCode("");
    setDefendantAddress("");
    setDefendantCity("");
    setDefendantState("");
    setDefendantZip("");
    setClientIsVehicle(false);
    setClientVehicleNum(0);
    setClientIsBicyclist(false);
    setClientIsPedestrian(false);
    setClientIsOtherPed(false);
    setAccidentTime("");
    setDayOfWeek("");
    setNoVehicles(0);
    setNoKilled(0);
    setShowExtraAccident(false);
    setFieldAudit({});
    setShowSaved(false);
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
            <div className="flex items-center justify-between bg-clio-success-bg px-5 py-3 text-sm">
              <div className="flex items-center gap-2 text-clio-success">
                <div className="h-2 w-2 rounded-full bg-current" />
                AI extraction complete — review fields below
              </div>
              <button
                type="button"
                onClick={() => setShowAudit(!showAudit)}
                className={`flex items-center gap-1.5 rounded-md px-3 py-1 text-xs font-semibold transition-colors ${
                  showAudit
                    ? "bg-orange-100 text-orange-700"
                    : "bg-white/60 text-clio-text-light hover:bg-white"
                }`}
              >
                {showAudit ? "Hide" : "Show"} QA
                {showAudit && Object.keys(fieldAudit).length > 0 && (
                  <span className="rounded-full bg-orange-200 px-1.5 text-[10px]">
                    {Object.values(fieldAudit).filter(Boolean).length}/{Object.keys(fieldAudit).length}
                  </span>
                )}
              </button>
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

              {/* Accident Row — top of form, before client info */}
              <div className="mb-6">
                <div className="mb-3 flex items-center justify-between border-b border-clio-border pb-2">
                  <h3 className="text-xs font-bold uppercase tracking-wide text-clio-text-light">
                    Accident Details
                  </h3>
                  <button
                    type="button"
                    onClick={() => setShowExtraAccident(!showExtraAccident)}
                    className="flex items-center gap-1 rounded px-2 py-0.5 text-xs text-clio-text-light transition-colors hover:bg-gray-100 hover:text-clio-text"
                  >
                    {showExtraAccident ? "Hide" : "Show"} Extra
                    <span className="text-[10px]">{showExtraAccident ? "\u25B2" : "\u25BC"}</span>
                  </button>
                </div>
                <div className={`grid gap-3 ${showExtraAccident ? "grid-cols-6" : "grid-cols-2"}`}>
                  <Field label="Date of Accident" confidence={extraction?.confidence?.accident_date} {...auditProps("accidentDate")}>
                    <input className="input-field input-ai" value={accidentDate} onChange={(e) => setAccidentDate(e.target.value)} />
                  </Field>
                  {showExtraAccident && (
                    <Field label="Day of Week" {...auditProps("dayOfWeek")}>
                      <input className="input-field input-ai bg-gray-50" value={dayOfWeek} readOnly />
                    </Field>
                  )}
                  {showExtraAccident && (
                    <Field label="Time of Accident" confidence={extraction?.confidence?.accident_time} {...auditProps("accidentTime")}>
                      <input className="input-field input-ai" value={accidentTime} onChange={(e) => setAccidentTime(e.target.value)} />
                    </Field>
                  )}
                  {showExtraAccident && (
                    <Field label="No. of Vehicles" {...auditProps("noVehicles")}>
                      <input className="input-field input-ai" type="number" value={noVehicles} onChange={(e) => setNoVehicles(parseInt(e.target.value) || 0)} />
                    </Field>
                  )}
                  <Field label="Number Injured" confidence={extraction?.confidence?.no_injured} {...auditProps("noInjured")}>
                    <input className="input-field input-ai" type="number" value={noInjured} onChange={(e) => setNoInjured(parseInt(e.target.value) || 0)} />
                  </Field>
                  {showExtraAccident && (
                    <Field label="No. Killed" {...auditProps("noKilled")}>
                      <input className="input-field input-ai" type="number" value={noKilled} onChange={(e) => setNoKilled(parseInt(e.target.value) || 0)} />
                    </Field>
                  )}
                </div>
              </div>

              {/* Client Info */}
              <div className="mb-6">
                <div className="mb-3 flex items-center justify-between border-b border-clio-border pb-2">
                  <h3 className="text-xs font-bold uppercase tracking-wide text-clio-text-light">
                    Client Information{match ? ` (Vehicle ${match.matchedVehicle})` : ""}
                  </h3>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="First Name" confidence={extraction?.confidence?.vehicle_1_name} {...auditProps("clientFirst")}>
                    <input className="input-field input-ai" value={clientFirst} onChange={(e) => setClientFirst(e.target.value)} />
                  </Field>
                  <Field label="Last Name" confidence={extraction?.confidence?.vehicle_1_name} {...auditProps("clientLast")}>
                    <input className="input-field input-ai" value={clientLast} onChange={(e) => setClientLast(e.target.value)} />
                  </Field>
                  <Field label="Address" full {...auditProps("clientAddress")}>
                    <input className="input-field input-ai" value={clientAddress} onChange={(e) => setClientAddress(e.target.value)} />
                  </Field>
                </div>
                <div className="mt-3 grid grid-cols-3 gap-3">
                  <Field label="City or Town" {...auditProps("clientCity")}>
                    <input className="input-field input-ai" value={clientCity} onChange={(e) => setClientCity(e.target.value)} />
                  </Field>
                  <Field label="State" {...auditProps("clientState")}>
                    <input className="input-field input-ai" value={clientState} onChange={(e) => setClientState(e.target.value)} />
                  </Field>
                  <Field label="Zip Code" {...auditProps("clientZip")}>
                    <input className="input-field input-ai" value={clientZip} onChange={(e) => setClientZip(e.target.value)} />
                  </Field>
                </div>
                <div className="mt-3 grid grid-cols-1 gap-3">
                  <Field label="Sex / Gender" {...auditProps("clientGender")}>
                    <select className="input-field input-ai" value={clientGender} onChange={(e) => setClientGender(e.target.value)}>
                      <option value="M">Male (his/him)</option>
                      <option value="F">Female (her/she)</option>
                    </select>
                  </Field>
                </div>
                <div className="mt-3 grid grid-cols-5 gap-3">
                  <Field label="Registration Plate" confidence={extraction?.confidence?.plate_number} {...auditProps("clientPlate")}>
                    <input className="input-field input-ai" value={clientPlate} onChange={(e) => setClientPlate(e.target.value)} />
                  </Field>
                  <Field label="State of Reg." {...auditProps("clientPlateState")}>
                    <input className="input-field input-ai" value={clientPlateState} onChange={(e) => setClientPlateState(e.target.value)} />
                  </Field>
                  <Field label="Vehicle Year & Make" {...auditProps("clientVehicleYearMake")}>
                    <input className="input-field input-ai" value={clientVehicleYearMake} onChange={(e) => setClientVehicleYearMake(e.target.value)} />
                  </Field>
                  <Field label="Vehicle Type" {...auditProps("clientVehicleType")}>
                    <input className="input-field input-ai" value={clientVehicleType} onChange={(e) => setClientVehicleType(e.target.value)} />
                  </Field>
                  <Field label="Ins. Code" {...auditProps("clientInsCode")}>
                    <input className="input-field input-ai" value={clientInsCode} onChange={(e) => setClientInsCode(e.target.value)} />
                  </Field>
                </div>
                <div className="mt-3 grid grid-cols-4 gap-3">
                  <Field label="Vehicle" {...auditProps("clientIsVehicle")}>
                    <button
                      type="button"
                      onClick={() => setClientIsVehicle(!clientIsVehicle)}
                      className={`flex h-[38px] w-[38px] cursor-pointer items-center justify-center rounded-md border text-sm font-bold transition-colors ${
                        clientIsVehicle
                          ? "border-clio-blue bg-clio-blue text-white"
                          : "border-clio-border bg-white text-transparent hover:border-gray-400"
                      }`}
                    >
                      {clientVehicleNum || ""}
                    </button>
                  </Field>
                  <Field label="Bicyclist" {...auditProps("clientBicyclist")}>
                    <button
                      type="button"
                      onClick={() => setClientIsBicyclist(!clientIsBicyclist)}
                      className={`flex h-[38px] w-[38px] cursor-pointer items-center justify-center rounded-md border text-lg transition-colors ${
                        clientIsBicyclist
                          ? "border-clio-blue bg-clio-blue text-white"
                          : "border-clio-border bg-white text-transparent hover:border-gray-400"
                      }`}
                    >
                      ✓
                    </button>
                  </Field>
                  <Field label="Pedestrian" {...auditProps("clientPedestrian")}>
                    <button
                      type="button"
                      onClick={() => setClientIsPedestrian(!clientIsPedestrian)}
                      className={`flex h-[38px] w-[38px] cursor-pointer items-center justify-center rounded-md border text-lg transition-colors ${
                        clientIsPedestrian
                          ? "border-clio-blue bg-clio-blue text-white"
                          : "border-clio-border bg-white text-transparent hover:border-gray-400"
                      }`}
                    >
                      ✓
                    </button>
                  </Field>
                  <Field label="Other Pedestrian" {...auditProps("clientOtherPed")}>
                    <button
                      type="button"
                      onClick={() => setClientIsOtherPed(!clientIsOtherPed)}
                      className={`flex h-[38px] w-[38px] cursor-pointer items-center justify-center rounded-md border text-lg transition-colors ${
                        clientIsOtherPed
                          ? "border-clio-blue bg-clio-blue text-white"
                          : "border-clio-border bg-white text-transparent hover:border-gray-400"
                      }`}
                    >
                      ✓
                    </button>
                  </Field>
                </div>
              </div>

              {/* Defendant */}
              <div className="mb-6">
                <div className="mb-3 flex items-center justify-between border-b border-clio-border pb-2">
                  <h3 className="text-xs font-bold uppercase tracking-wide text-clio-text-light">
                    Defendant
                  </h3>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="First Name" confidence={extraction?.confidence?.vehicle_2_name} {...auditProps("defendantFirst")}>
                    <input className="input-field input-ai" value={defendantFirst} onChange={(e) => setDefendantFirst(e.target.value)} />
                  </Field>
                  <Field label="Last Name" confidence={extraction?.confidence?.vehicle_2_name} {...auditProps("defendantLast")}>
                    <input className="input-field input-ai" value={defendantLast} onChange={(e) => setDefendantLast(e.target.value)} />
                  </Field>
                  <Field label="Address" full {...auditProps("defendantAddress")}>
                    <input className="input-field input-ai" value={defendantAddress} onChange={(e) => setDefendantAddress(e.target.value)} />
                  </Field>
                </div>
                <div className="mt-3 grid grid-cols-3 gap-3">
                  <Field label="City or Town" {...auditProps("defendantCity")}>
                    <input className="input-field input-ai" value={defendantCity} onChange={(e) => setDefendantCity(e.target.value)} />
                  </Field>
                  <Field label="State" {...auditProps("defendantState")}>
                    <input className="input-field input-ai" value={defendantState} onChange={(e) => setDefendantState(e.target.value)} />
                  </Field>
                  <Field label="Zip Code" {...auditProps("defendantZip")}>
                    <input className="input-field input-ai" value={defendantZip} onChange={(e) => setDefendantZip(e.target.value)} />
                  </Field>
                </div>
                <div className="mt-3 grid grid-cols-5 gap-3">
                  <Field label="Registration Plate" {...auditProps("defendantPlate")}>
                    <input className="input-field input-ai" value={defendantPlate} onChange={(e) => setDefendantPlate(e.target.value)} />
                  </Field>
                  <Field label="State of Reg." {...auditProps("defendantPlateState")}>
                    <input className="input-field input-ai" value={defendantPlateState} onChange={(e) => setDefendantPlateState(e.target.value)} />
                  </Field>
                  <Field label="Vehicle Year & Make" {...auditProps("defendantVehicleYearMake")}>
                    <input className="input-field input-ai" value={defendantVehicleYearMake} onChange={(e) => setDefendantVehicleYearMake(e.target.value)} />
                  </Field>
                  <Field label="Vehicle Type" {...auditProps("defendantVehicleType")}>
                    <input className="input-field input-ai" value={defendantVehicleType} onChange={(e) => setDefendantVehicleType(e.target.value)} />
                  </Field>
                  <Field label="Ins. Code" {...auditProps("defendantInsCode")}>
                    <input className="input-field input-ai" value={defendantInsCode} onChange={(e) => setDefendantInsCode(e.target.value)} />
                  </Field>
                </div>
                <div className="mt-3 grid grid-cols-4 gap-3">
                  <Field label="Vehicle" {...auditProps("defendantIsVehicle")}>
                    <button
                      type="button"
                      onClick={() => setDefendantIsVehicle(!defendantIsVehicle)}
                      className={`flex h-[38px] w-[38px] cursor-pointer items-center justify-center rounded-md border text-sm font-bold transition-colors ${
                        defendantIsVehicle
                          ? "border-clio-blue bg-clio-blue text-white"
                          : "border-clio-border bg-white text-transparent hover:border-gray-400"
                      }`}
                    >
                      {defendantVehicleNum || ""}
                    </button>
                  </Field>
                  <Field label="Bicyclist" {...auditProps("defendantBicyclist")}>
                    <button
                      type="button"
                      onClick={() => setDefendantIsBicyclist(!defendantIsBicyclist)}
                      className={`flex h-[38px] w-[38px] cursor-pointer items-center justify-center rounded-md border text-lg transition-colors ${
                        defendantIsBicyclist
                          ? "border-clio-blue bg-clio-blue text-white"
                          : "border-clio-border bg-white text-transparent hover:border-gray-400"
                      }`}
                    >
                      ✓
                    </button>
                  </Field>
                  <Field label="Pedestrian" {...auditProps("defendantPedestrian")}>
                    <button
                      type="button"
                      onClick={() => setDefendantIsPedestrian(!defendantIsPedestrian)}
                      className={`flex h-[38px] w-[38px] cursor-pointer items-center justify-center rounded-md border text-lg transition-colors ${
                        defendantIsPedestrian
                          ? "border-clio-blue bg-clio-blue text-white"
                          : "border-clio-border bg-white text-transparent hover:border-gray-400"
                      }`}
                    >
                      ✓
                    </button>
                  </Field>
                  <Field label="Other Pedestrian" {...auditProps("defendantOtherPed")}>
                    <button
                      type="button"
                      onClick={() => setDefendantIsOtherPed(!defendantIsOtherPed)}
                      className={`flex h-[38px] w-[38px] cursor-pointer items-center justify-center rounded-md border text-lg transition-colors ${
                        defendantIsOtherPed
                          ? "border-clio-blue bg-clio-blue text-white"
                          : "border-clio-border bg-white text-transparent hover:border-gray-400"
                      }`}
                    >
                      ✓
                    </button>
                  </Field>
                </div>
              </div>

              {/* Accident Location & Description */}
              <Section title="Accident Location & Description">
                <div className="grid grid-cols-1 gap-3">
                  <Field label="Accident Location" confidence={extraction?.confidence?.accident_location} {...auditProps("accidentLocation")}>
                    <input className="input-field input-ai" value={accidentLocation} onChange={(e) => setAccidentLocation(e.target.value)} />
                  </Field>
                  <Field label="Accident Description (officer notes)" confidence={extraction?.confidence?.officer_notes} {...auditProps("officerNotes")}>
                    <textarea className="input-field input-ai min-h-[80px] resize-y" value={officerNotes} onChange={(e) => setOfficerNotes(e.target.value)} />
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
          {phase === "upload" && !showSaved && (
            <div className="flex flex-1 flex-col items-center justify-center gap-4 text-clio-text-light">
              Upload a police report to get started
              <button
                onClick={fetchSavedReports}
                className="rounded-md border border-clio-border px-4 py-2 text-xs font-semibold text-clio-text transition-colors hover:bg-gray-50"
              >
                or load a saved report
              </button>
            </div>
          )}

          {/* Saved reports list */}
          {phase === "upload" && showSaved && (
            <div className="flex flex-1 flex-col overflow-y-auto">
              <div className="flex items-center justify-between border-b border-clio-border px-5 py-3">
                <h3 className="text-sm font-semibold text-clio-text">Saved Reports</h3>
                <button
                  onClick={() => setShowSaved(false)}
                  className="text-xs text-clio-text-light hover:text-clio-text"
                >
                  Back
                </button>
              </div>
              {savedReports.length === 0 && (
                <div className="flex flex-1 items-center justify-center text-sm text-clio-text-light">
                  No saved reports found
                </div>
              )}
              <div className="divide-y divide-clio-border">
                {savedReports.map((r) => (
                  <button
                    key={r.id}
                    onClick={() => loadReport(r.id)}
                    disabled={loadingReport}
                    className="flex w-full items-center justify-between px-5 py-3 text-left transition-colors hover:bg-gray-50 disabled:opacity-50"
                  >
                    <div>
                      <div className="text-sm font-medium text-clio-text">{r.filename}</div>
                      <div className="text-xs text-clio-text-light">
                        {new Date(r.created_at).toLocaleString()} · {r.ai_provider} · {r.extraction_ms}ms
                      </div>
                    </div>
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                      r.status === "draft" ? "bg-gray-100 text-gray-600" :
                      r.status === "approved" ? "bg-clio-success-bg text-clio-success" :
                      "bg-clio-warning-bg text-clio-warning"
                    }`}>
                      {r.status}
                    </span>
                  </button>
                ))}
              </div>
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
  auditKey,
  auditChecked,
  onAuditToggle,
  children,
}: {
  label: string;
  confidence?: number;
  full?: boolean;
  auditKey?: string;
  auditChecked?: boolean;
  onAuditToggle?: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className={`flex flex-col gap-1 ${full ? "col-span-2" : ""}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          {auditKey !== undefined && (
            <input
              type="checkbox"
              checked={auditChecked || false}
              onChange={onAuditToggle}
              className="h-3.5 w-3.5 cursor-pointer rounded border-gray-300 accent-green-600"
              title={auditChecked ? "Marked correct" : "Mark as correct"}
            />
          )}
          <label className="text-xs font-semibold text-clio-text-light">{label}</label>
        </div>
        {confidenceBadge(confidence)}
      </div>
      {children}
    </div>
  );
}

