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
    const client = getClient();

    // Upload the PDF as a file first
    const pdfBuffer = Buffer.from(pdfBase64, "base64");
    const file = await client.files.create({
      file: new File([pdfBuffer], "report.pdf", { type: "application/pdf" }),
      purpose: "assistants",
    });

    // Use the Responses API which supports PDF files natively
    const response = await client.responses.create({
      model: "gpt-4o",
      input: [
        {
          role: "user",
          content: [
            {
              type: "input_file",
              file_id: file.id,
            },
            {
              type: "input_text",
              text: EXTRACTION_PROMPT,
            },
          ],
        },
      ],
    });

    // Extract text from response output
    // Use `any` to avoid complex OpenAI SDK union type conflicts
    const outputItems = response.output as any[];
    const text = outputItems
      .filter((item) => item.type === "message")
      .flatMap((item) => item.content)
      .filter((c: any) => c.type === "output_text")
      .map((c: any) => c.text)
      .join("");

    // Clean up uploaded file
    await client.files.delete(file.id).catch(() => {});

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
