export interface ExtractionResult {
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
  all_persons_involved: {
    name: string;
    age: number;
    sex: string;
  }[];
  confidence: Record<string, number>;
}

export interface VehicleInfo {
  driver_name_last: string;
  driver_name_first: string;
  sex: string;
  date_of_birth: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  plate_number: string;
  plate_state: string;
  vehicle_year: string;
  vehicle_make: string;
  vehicle_type: string;
  ins_code: string;
  is_pedestrian: boolean;
  is_bicyclist: boolean;
  is_other_pedestrian: boolean;
}

export interface AIProvider {
  extractFromPdf(pdfBase64: string): Promise<ExtractionResult>;
  draftParagraph(input: DraftInput): Promise<string>;
}

export interface DraftInput {
  clientFirstName: string;
  accidentDate: string;
  officerNotes: string;
}

export const EXTRACTION_PROMPT = `You are extracting data from a NYC police accident report (MV-104AN form).
Return valid JSON only — no markdown, no explanation.

## MV-104AN FORM LAYOUT (read fields from these exact positions):

ROW 1 (top of form):
  Box 1: Accident No. (e.g. "MV-2022-071-000314")
  Box 2: Complaint Number
  Then checkboxes: AMENDED REPORT

ROW 2 (header stats — 6 SEPARATE labeled boxes, left to right):
  Box A: Accident Date (Month | Day | Year)
  Box B: Day of Week
  Box C: Military Time
  Box D: No. of Vehicles    ← labeled "No. of Vehicles" — read the number DIRECTLY UNDER this label
  Box E: No. Injured        ← labeled "No. Injured" — read the number DIRECTLY UNDER this label
  Box F: No. Killed         ← labeled "No. Killed" — read the number DIRECTLY UNDER this label

  ⚠️ CRITICAL: Boxes D, E, F are the THREE rightmost boxes in this row.
  They are SEPARATE columns. Each has its LABEL on top and a SINGLE NUMBER below.
  Do NOT read across boxes. Read ONLY the digit under each label.
  Common values: 0, 1, 2. Most reports have No. Injured = 0 and No. Killed = 0.

ROW 2 (vehicle header): VEHICLE 1 section (left half) and VEHICLE 2 section (right half):
  Each vehicle section has checkboxes at top: ☐ VEHICLE  ☐ BICYCLIST  ☐ PEDESTRIAN  ☐ OTHER PEDESTRIAN
  Then: "License ID Number" (this is the DRIVER'S LICENSE — a long number like R29823070006942. Do NOT use this as the plate number!)
  Then: Driver Name (LAST, FIRST) / Date of Birth / Sex (M or F)

ROW 3 (owner/registrant): Name on registration / Address / City / State / Zip

ROW 4 (address): Driver address / City / State / Zip

ROW 5 (vehicle details) — ⚠️ THIS IS WHERE THE PLATE NUMBER IS:
  This is a SEPARATE row BELOW the driver/owner info, with these small boxes left to right:
    - "Plate Number": the vehicle license plate (short alphanumeric, e.g. "XCGY85", "DYY7657", "AZ2874", "47164BB"). Typically 5-8 characters. Do NOT include the state. Do NOT confuse with the "License ID Number" from Row 2 which is the driver's license.
    - "State of Reg.": 2-letter state code (e.g. "NY", "NJ"). This is SEPARATE from plate number.
    - "Vehicle Year & Make": year + manufacturer (e.g. "2018 FREIGHTLINER", "2017 MAZDA")
    - "Vehicle Type": body style code (e.g. "BOX TRUCK", "SW/SUV", "SEDAN", "VAN")
    - "Ins. Co. Code": insurance company code (1-5 digits), the LAST small box in this row. Examples: "36", "42", "100", "135". Can be just 2-3 digits. If not visible or unreadable, use "". For pedestrians/bicyclists this will be "".

  ⚠️ CRITICAL — PLATE NUMBER vs LICENSE ID:
  The "Plate Number" (Row 5) is SHORT (5-8 chars, e.g. "XCGY85", "DYY7657").
  The "License ID Number" (Row 2) is LONG (10-20 chars, e.g. "R29823070006942", "403334776").
  They are in DIFFERENT rows. Always extract the Plate Number from Row 5, NOT the License ID from Row 2.

BOTTOM SECTION:
  Accident Location: road name + intersecting street
  Borough: one of Bronx, Kings, New York, Queens, Richmond
  Officer narrative / accident description (free text block)

## EXTRACTION RULES:
- Extract ALL people/names from BOTH vehicles (V1 + V2)
- Vehicle 2 may be a PEDESTRIAN or BICYCLIST — check the checkboxes. If so, vehicle fields (plate, make, year, ins_code) will be empty — use ""
- "plate_number" is the VEHICLE LICENSE PLATE from Row 5 (short, e.g. "XCGY85", "DYY7657"). Do NOT use the "License ID Number" from Row 2 (that is the driver's license, much longer). Do NOT prepend the state. "plate_state" is the separate 2-letter state code from the same Row 5.
- "ins_code" is the Insurance Company Code — the LAST small box in Row 5. It can be 1-5 digits (e.g. "36", "42", "100", "135"). Extract EXACTLY what is printed — do NOT guess or pad. If the box is empty or unreadable, use "". For pedestrians/bicyclists this will be "".
- Sex uses M or F
- accident_date: use MM/DD/YYYY format
- accident_time: use HH:MM (from "Military Time" box)
- Borough must be one of: Bronx, Kings, New York, Queens, Richmond
- Confidence scores: 0-100 for how certain you are about each key field

## DOUBLE-CHECK (mandatory):
1. Look at Box D label → what number is under it? That is "no_vehicles".
2. Look at Box E label → what number is under it? That is "no_injured".
3. Look at Box F label → what number is under it? That is "no_killed".
4. Write your readings into "header_raw" (see JSON below) so we can verify.
5. Confirm: are the values in no_vehicles, no_injured, no_killed matching your Box D, E, F readings?

Return this exact JSON structure:
{
  "accident_date": "MM/DD/YYYY",
  "accident_time": "HH:MM",
  "no_injured": 0,
  "no_killed": 0,
  "no_vehicles": 0,
  "accident_location": {
    "road": "",
    "intersecting_street": "",
    "borough": ""
  },
  "vehicle_1": {
    "driver_name_last": "",
    "driver_name_first": "",
    "sex": "M",
    "date_of_birth": "",
    "address": "",
    "city": "",
    "state": "",
    "zip": "",
    "plate_number": "",
    "plate_state": "",
    "vehicle_year": "",
    "vehicle_make": "",
    "vehicle_type": "",
    "ins_code": "",
    "is_pedestrian": false,
    "is_bicyclist": false,
    "is_other_pedestrian": false
  },
  "vehicle_2": {
    "driver_name_last": "",
    "driver_name_first": "",
    "sex": "M",
    "date_of_birth": "",
    "address": "",
    "city": "",
    "state": "",
    "zip": "",
    "plate_number": "",
    "plate_state": "",
    "vehicle_year": "",
    "vehicle_make": "",
    "vehicle_type": "",
    "ins_code": "",
    "is_pedestrian": false,
    "is_bicyclist": false,
    "is_other_pedestrian": false
  },
  "officer_notes": "",
  "all_persons_involved": [
    {"name": "LAST, FIRST", "age": 0, "sex": "M"}
  ],
  "header_raw": "Box D=2, Box E=0, Box F=0",
  "confidence": {
    "accident_date": 99,
    "accident_location": 90,
    "vehicle_1_name": 95,
    "vehicle_2_name": 95,
    "no_injured": 95,
    "no_killed": 95,
    "officer_notes": 85,
    "plate_number": 90,
    "ins_code": 80
  }
}`;

export const DRAFT_PROMPT = (input: DraftInput) =>
  `You are Andrew Richards, a personal injury attorney. Write ONE paragraph (3-4 sentences) for a client email about their car accident.

Tone: warm, empathetic, professional. No legal jargon. Written as if you personally reviewed the police report.

Client first name: ${input.clientFirstName}
Date of accident: ${input.accidentDate}
Officer's description: ${input.officerNotes}

Write ONLY the paragraph — no greeting, no sign-off, no quotes around it.`;

export function parseJsonResponse(text: string): ExtractionResult {
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error("Failed to extract JSON from AI response");
  }
  return JSON.parse(jsonMatch[0]) as ExtractionResult;
}
