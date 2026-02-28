import Anthropic from "@anthropic-ai/sdk";

function getAnthropic() {
  return new Anthropic();
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

const EXTRACTION_PROMPT = `You are extracting data from a NYC police accident report (MV-104AN form).
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

export async function extractFromPdf(
  pdfBase64: string
): Promise<ExtractionResult> {
  const response = await getAnthropic().messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 4096,
    messages: [
      {
        role: "user",
        content: [
          {
            type: "document",
            source: {
              type: "base64",
              media_type: "application/pdf",
              data: pdfBase64,
            },
          },
          {
            type: "text",
            text: EXTRACTION_PROMPT,
          },
        ],
      },
    ],
  });

  const text =
    response.content[0].type === "text" ? response.content[0].text : "";

  // Parse JSON from response — handle potential markdown wrapping
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error("Failed to extract JSON from Claude response");
  }

  return JSON.parse(jsonMatch[0]) as ExtractionResult;
}
