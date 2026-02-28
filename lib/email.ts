import Anthropic from "@anthropic-ai/sdk";
import { Resend } from "resend";
import { getCalendlyLink } from "./calendly";

function getAnthropic() {
  return new Anthropic();
}
function getResend() {
  return new Resend(process.env.RESEND_API_KEY);
}

const ATTORNEY_NAME = process.env.ATTORNEY_NAME || "Andrew Richards";

interface EmailDraftInput {
  clientFirstName: string;
  accidentDate: string;
  officerNotes: string;
  accidentMonth: number; // 1-12
}

async function draftPersonalParagraph(
  input: EmailDraftInput
): Promise<string> {
  const response = await getAnthropic().messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 512,
    messages: [
      {
        role: "user",
        content: `You are Andrew Richards, a personal injury attorney. Write ONE paragraph (3-4 sentences) for a client email about their car accident.

Tone: warm, empathetic, professional. No legal jargon. Written as if you personally reviewed the police report.

Client first name: ${input.clientFirstName}
Date of accident: ${input.accidentDate}
Officer's description: ${input.officerNotes}

Write ONLY the paragraph — no greeting, no sign-off, no quotes around it.`,
      },
    ],
  });

  return response.content[0].type === "text" ? response.content[0].text : "";
}

function formatDate(dateStr: string): string {
  // Handle MM/DD/YYYY format
  const parts = dateStr.split("/");
  if (parts.length === 3) {
    const date = new Date(
      parseInt(parts[2]),
      parseInt(parts[0]) - 1,
      parseInt(parts[1])
    );
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }
  return dateStr;
}

interface SendEmailInput {
  clientFirstName: string;
  clientEmail: string;
  accidentDate: string;
  officerNotes: string;
  accidentMonth: number;
  retainerPdf: Buffer;
  retainerFilename: string;
}

export async function sendClientEmail(input: SendEmailInput) {
  const personalParagraph = await draftPersonalParagraph({
    clientFirstName: input.clientFirstName,
    accidentDate: input.accidentDate,
    officerNotes: input.officerNotes,
    accidentMonth: input.accidentMonth,
  });

  const calendlyLink = getCalendlyLink(input.accidentMonth);
  const formattedDate = formatDate(input.accidentDate);

  const htmlBody = `
<p>Hello ${input.clientFirstName},</p>

<p>I hope you're doing well. I wanted to follow up regarding your car accident on ${formattedDate}. I know dealing with the aftermath of a crash is stressful, and I want to make sure we move things forward as smoothly as possible for you.</p>

<p>${personalParagraph}</p>

<p>Attached is your Retainer Agreement, which sets the foundation for our partnership. It details the specific legal services we will provide and the mutual responsibilities needed to move your claim forward effectively. Please take a moment to review it before we meet.</p>

<p>When you're ready, you can book an appointment with us using this link: <a href="${calendlyLink}">${calendlyLink}</a>.<br>
At that meeting, we'll go through the agreement in detail and discuss next steps.</p>

<p>${ATTORNEY_NAME}</p>
  `.trim();

  const result = await getResend().emails.send({
    from: `${ATTORNEY_NAME} <onboarding@resend.dev>`,
    to: input.clientEmail,
    subject: "Retainer Agreement for Your Review – Richards & Law",
    html: htmlBody,
    attachments: [
      {
        filename: input.retainerFilename,
        content: input.retainerPdf.toString("base64"),
      },
    ],
  });

  return result;
}
