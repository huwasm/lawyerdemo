import { Resend } from "resend";
import { getCalendlyLink } from "./calendly";
import { getAI } from "./ai";

function getResend() {
  return new Resend(process.env.RESEND_API_KEY);
}

const ATTORNEY_NAME = process.env.ATTORNEY_NAME || "Andrew Richards";

function elog(msg: string, data?: unknown) {
  if (data !== undefined) {
    console.log(`[Email]`, msg, typeof data === "string" ? data : JSON.stringify(data));
  } else {
    console.log(`[Email]`, msg);
  }
}

interface EmailDraftInput {
  clientFirstName: string;
  accidentDate: string;
  officerNotes: string;
  accidentMonth: number; // 1-12
}

async function draftPersonalParagraph(
  input: EmailDraftInput
): Promise<string> {
  elog(`Drafting AI paragraph for ${input.clientFirstName}, accident: ${input.accidentDate}`);
  const startMs = Date.now();
  const paragraph = await getAI().draftParagraph({
    clientFirstName: input.clientFirstName,
    accidentDate: input.accidentDate,
    officerNotes: input.officerNotes,
  });
  const elapsed = Date.now() - startMs;
  elog(`AI paragraph drafted in ${elapsed}ms (${paragraph.length} chars)`);
  return paragraph;
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
  elog(`Preparing email to ${input.clientEmail}`);

  const personalParagraph = await draftPersonalParagraph({
    clientFirstName: input.clientFirstName,
    accidentDate: input.accidentDate,
    officerNotes: input.officerNotes,
    accidentMonth: input.accidentMonth,
  });

  const calendlyLink = getCalendlyLink(input.accidentMonth);
  const calendlyType = input.accidentMonth >= 3 && input.accidentMonth <= 8 ? "office" : "virtual";
  elog(`Calendly link: ${calendlyType} → ${calendlyLink}`);

  const formattedDate = formatDate(input.accidentDate);
  elog(`PDF attachment: "${input.retainerFilename}" (${input.retainerPdf.length} bytes)`);

  const htmlBody = `
<p>Hello ${input.clientFirstName},</p>

<p>I hope you're doing well. I wanted to follow up regarding your car accident on ${formattedDate}. I know dealing with the aftermath of a crash is stressful, and I want to make sure we move things forward as smoothly as possible for you.</p>

<p>${personalParagraph}</p>

<p>Attached is your Retainer Agreement, which sets the foundation for our partnership. It details the specific legal services we will provide and the mutual responsibilities needed to move your claim forward effectively. Please take a moment to review it before we meet.</p>

<p>When you're ready, you can book an appointment with us using this link: <a href="${calendlyLink}">${calendlyLink}</a>.<br>
At that meeting, we'll go through the agreement in detail and discuss next steps.</p>

<p>${ATTORNEY_NAME}</p>
  `.trim();

  elog(`Sending via Resend: from="${ATTORNEY_NAME}", to="${input.clientEmail}", subject="Retainer Agreement for Your Review – Richards & Law"`);
  const startMs = Date.now();

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

  const elapsed = Date.now() - startMs;
  elog(`Resend responded in ${elapsed}ms`, result);

  return result;
}
