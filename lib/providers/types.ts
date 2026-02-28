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
  is_pedestrian: boolean;
  is_bicyclist: boolean;
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
Extract ALL of the following fields. Return valid JSON only — no markdown, no explanation.

IMPORTANT:
- Extract ALL people/names from the report (Vehicle 1, Vehicle 2, pedestrians, cyclists)
- Vehicle 2 may be a PEDESTRIAN or BICYCLIST — check the checkboxes at the top of the form
- If pedestrian/bicyclist, vehicle info (plate, make, year) will be empty — use empty strings
- The "Sex" field uses M or F
- For accident_date, use MM/DD/YYYY format
- For borough, use one of: Bronx, Kings, New York, Queens, Richmond
- Include a "confidence" object with 0-100 scores for key fields

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
    "is_pedestrian": false,
    "is_bicyclist": false
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
    "is_pedestrian": false,
    "is_bicyclist": false
  },
  "officer_notes": "",
  "all_persons_involved": [
    {"name": "LAST, FIRST", "age": 0, "sex": "M"}
  ],
  "confidence": {
    "accident_date": 99,
    "accident_location": 90,
    "vehicle_1_name": 95,
    "vehicle_2_name": 95,
    "no_injured": 95,
    "officer_notes": 85,
    "plate_number": 90
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
