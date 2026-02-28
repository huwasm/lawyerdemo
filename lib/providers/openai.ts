import OpenAI from "openai";
import {
  type AIProvider,
  type ExtractionResult,
  type DraftInput,
  EXTRACTION_PROMPT,
  DRAFT_PROMPT,
  parseJsonResponse,
} from "./types";

function getClient() {
  return new OpenAI();
}

export const openaiProvider: AIProvider = {
  async extractFromPdf(pdfBase64: string): Promise<ExtractionResult> {
    const response = await getClient().chat.completions.create({
      model: "gpt-4o",
      max_tokens: 4096,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image_url",
              image_url: {
                url: `data:application/pdf;base64,${pdfBase64}`,
                detail: "high",
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

    const text = response.choices[0]?.message?.content || "";
    return parseJsonResponse(text);
  },

  async draftParagraph(input: DraftInput): Promise<string> {
    const response = await getClient().chat.completions.create({
      model: "gpt-4o",
      max_tokens: 512,
      messages: [
        {
          role: "user",
          content: DRAFT_PROMPT(input),
        },
      ],
    });

    return response.choices[0]?.message?.content || "";
  },
};
