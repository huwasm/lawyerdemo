import { getAI } from "./ai";

export type { ExtractionResult, VehicleInfo } from "./providers/types";

export async function extractFromPdf(pdfBase64: string) {
  return getAI().extractFromPdf(pdfBase64);
}
