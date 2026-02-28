import Anthropic from "@anthropic-ai/sdk";
import {
  type AIProvider,
  type ExtractionResult,
  type DraftInput,
  EXTRACTION_PROMPT,
  DRAFT_PROMPT,
  parseJsonResponse,
} from "./types";

function getClient() {
  return new Anthropic();
}

export const anthropicProvider: AIProvider = {
  async extractFromPdf(pdfBase64: string): Promise<ExtractionResult> {
    const response = await getClient().messages.create({
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
    return parseJsonResponse(text);
  },

  async draftParagraph(input: DraftInput): Promise<string> {
    const response = await getClient().messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 512,
      messages: [
        {
          role: "user",
          content: DRAFT_PROMPT(input),
        },
      ],
    });

    return response.content[0].type === "text"
      ? response.content[0].text
      : "";
  },
};
