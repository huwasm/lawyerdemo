import { NextRequest, NextResponse } from "next/server";
import {
  updateMatterCustomFields,
  generateRetainer,
  createCalendarEntry,
  getMatterDocuments,
  downloadDocument,
  type CustomFieldUpdate,
} from "@/lib/clio";
import { sendClientEmail } from "@/lib/email";

interface ApproveRequest {
  matterId: number;
  clientFirstName: string;
  clientLastName: string;
  clientEmail: string;
  clientGender: string;
  accidentDate: string; // MM/DD/YYYY
  reportReviewedDate: string; // MM/DD/YYYY — used for Calendly link selection
  accidentLocation: string;
  defendantName: string;
  registrationPlate: string;
  noInjured: number;
  officerNotes: string;
  statuteDate: string; // YYYY-MM-DD
}

function formatDateForClio(dateStr: string): string {
  // Convert MM/DD/YYYY to YYYY-MM-DD
  const parts = dateStr.split("/");
  if (parts.length === 3) {
    return `${parts[2]}-${parts[0].padStart(2, "0")}-${parts[1].padStart(2, "0")}`;
  }
  return dateStr;
}

function log(step: number, msg: string, data?: unknown) {
  const prefix = `[Approve][Step ${step}]`;
  if (data !== undefined) {
    console.log(prefix, msg, JSON.stringify(data, null, 2));
  } else {
    console.log(prefix, msg);
  }
}

export async function POST(req: NextRequest) {
  const startTime = Date.now();
  try {
    const body: ApproveRequest = await req.json();
    const clientFullName = `${body.clientFirstName} ${body.clientLastName}`;
    const steps: { step: string; status: string; detail?: string }[] = [];

    log(0, `Starting approve pipeline for Matter #${body.matterId}`, {
      client: clientFullName,
      email: body.clientEmail,
      accidentDate: body.accidentDate,
      statuteDate: body.statuteDate,
    });

    // Step 1: Update custom fields on Matter
    const fieldMap: Record<string, string | number> = {
      CLIO_FIELD_ACCIDENT_DATE: formatDateForClio(body.accidentDate),
      CLIO_FIELD_ACCIDENT_LOCATION: body.accidentLocation,
      CLIO_FIELD_DEFENDANT_NAME: body.defendantName,
      CLIO_FIELD_CLIENT_GENDER: body.clientGender === "M" ? "Male" : "Female",
      CLIO_FIELD_PRONOUN_POSSESSIVE: body.clientGender === "M" ? "his" : "her",
      CLIO_FIELD_PRONOUN_SUBJECT: body.clientGender === "M" ? "he" : "she",
      CLIO_FIELD_REGISTRATION_PLATE: body.registrationPlate || "N/A",
      CLIO_FIELD_NUMBER_INJURED: body.noInjured,
      CLIO_FIELD_ACCIDENT_DESCRIPTION: body.officerNotes,
      CLIO_FIELD_STATUTE_DATE: body.statuteDate,
    };

    const customFields: CustomFieldUpdate[] = [];
    for (const [envKey, value] of Object.entries(fieldMap)) {
      const fieldId = parseInt(process.env[envKey] || "0");
      if (fieldId > 0) {
        customFields.push({ custom_field: { id: fieldId }, value });
      }
    }

    if (customFields.length > 0) {
      log(1, `Updating ${customFields.length} custom fields on Matter #${body.matterId}`);
      await updateMatterCustomFields(body.matterId, customFields);
      log(1, "Custom fields updated successfully");
    } else {
      log(1, "WARNING: No custom field IDs configured in env");
    }
    steps.push({ step: "Update custom fields", status: "done" });

    // Step 2: Generate retainer agreement (select template by injury status)
    const retainerFilename = `Retainer_Agreement_${body.clientLastName}`;
    const templateId =
      body.noInjured > 0
        ? parseInt(process.env.CLIO_TEMPLATE_ID_INJURED || process.env.CLIO_TEMPLATE_ID || "0")
        : parseInt(process.env.CLIO_TEMPLATE_ID_PROPERTY || process.env.CLIO_TEMPLATE_ID || "0");
    log(2, `Generating retainer: "${retainerFilename}" using template #${templateId} (injured=${body.noInjured > 0 ? "yes" : "no"})`)
    await generateRetainer(body.matterId, retainerFilename, templateId);
    log(2, "Retainer generation triggered");
    steps.push({ step: "Generate retainer", status: "done" });

    // Step 3: Create calendar entry (Statute of Limitations)
    log(3, `Creating SOL calendar entry: ${body.statuteDate} on calendar #${process.env.CLIO_CALENDAR_ID}`);
    await createCalendarEntry(body.matterId, clientFullName, body.statuteDate);
    log(3, "Calendar entry created");
    steps.push({ step: "Create calendar entry", status: "done" });

    // Step 4: Download retainer PDF from Clio (non-fatal — pipeline continues if download fails)
    let retainerPdf: Buffer | null = null;
    try {
      // Retry up to 3 times with increasing wait — Clio needs time to generate the document
      const maxRetries = 3;
      for (let attempt = 1; attempt <= maxRetries; attempt++) {
        const waitSec = attempt === 1 ? 4 : 5;
        log(4, `Attempt ${attempt}/${maxRetries}: waiting ${waitSec}s for Clio document generation...`);
        await new Promise((resolve) => setTimeout(resolve, waitSec * 1000));

        const docs = await getMatterDocuments(body.matterId);
        // Sort by ID descending so newest document is first (avoids picking stale old retainers)
        docs.sort((a: { id: number }, b: { id: number }) => b.id - a.id);
        log(4, `Found ${docs.length} documents on Matter #${body.matterId}`, docs.map((d: { id: number; name: string }) => ({ id: d.id, name: d.name })));

        const retainerDoc = docs.find(
          (d: { name: string }) =>
            d.name.toLowerCase().includes("retainer") ||
            d.name.toLowerCase().includes(body.clientLastName.toLowerCase())
        );

        if (retainerDoc) {
          log(4, `Downloading retainer doc #${retainerDoc.id}: "${retainerDoc.name}"`);
          retainerPdf = await downloadDocument(retainerDoc.id);
          if (retainerPdf) {
            log(4, `Downloaded PDF: ${retainerPdf.length} bytes`);
            break; // success — stop retrying
          }
          log(4, `Download returned null on attempt ${attempt}`);
        } else {
          log(4, `Attempt ${attempt}: No retainer document found matching name filter yet`);
        }

        if (attempt < maxRetries) {
          log(4, `Will retry...`);
        }
      }
    } catch (downloadError) {
      log(4, `WARNING: Download failed (non-fatal): ${downloadError instanceof Error ? downloadError.message : String(downloadError)}`);
    }
    steps.push({
      step: "Download retainer PDF",
      status: retainerPdf ? "done" : "skipped",
      detail: retainerPdf ? undefined : "Could not download — email sent without attachment",
    });

    // Step 5: Send email to client — use reviewed date month for Calendly (fallback to accident date)
    const calendlyDateParts = (body.reportReviewedDate || body.accidentDate).split("/");
    const accidentMonth = parseInt(calendlyDateParts[0]) || new Date().getMonth() + 1;
    const calendlyType = accidentMonth >= 3 && accidentMonth <= 8 ? "office (Mar-Aug)" : "virtual (Sep-Feb)";
    log(5, `Sending email to ${body.clientEmail}, Calendly: ${calendlyType}, PDF attached: ${!!retainerPdf}`);

    const emailResult = await sendClientEmail({
      clientFirstName: body.clientFirstName,
      clientEmail: body.clientEmail.trim(),
      accidentDate: body.accidentDate,
      officerNotes: body.officerNotes,
      accidentMonth,
      retainerPdf: retainerPdf || null,
      retainerFilename: `${retainerFilename}.pdf`,
    });
    log(5, "Email sent", emailResult);
    steps.push({ step: "Send email", status: "done" });

    const totalMs = Date.now() - startTime;
    log(0, `Pipeline complete in ${totalMs}ms`);

    return NextResponse.json({
      success: true,
      steps,
      summary: {
        matter: body.matterId,
        client: clientFullName,
        email: body.clientEmail,
        statuteDate: body.statuteDate,
      },
    });
  } catch (error) {
    const totalMs = Date.now() - startTime;
    console.error(`[Approve] FAILED after ${totalMs}ms:`, error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Approval failed" },
      { status: 500 }
    );
  }
}
