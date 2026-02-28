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

export async function POST(req: NextRequest) {
  try {
    const body: ApproveRequest = await req.json();
    const clientFullName = `${body.clientFirstName} ${body.clientLastName}`;
    const steps: { step: string; status: string; detail?: string }[] = [];

    // Step 1: Update custom fields on Matter
    const fieldMap: Record<string, string | number> = {
      CLIO_FIELD_ACCIDENT_DATE: formatDateForClio(body.accidentDate),
      CLIO_FIELD_ACCIDENT_LOCATION: body.accidentLocation,
      CLIO_FIELD_DEFENDANT_NAME: body.defendantName,
      CLIO_FIELD_CLIENT_GENDER: body.clientGender === "M" ? "Male" : "Female",
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
      await updateMatterCustomFields(body.matterId, customFields);
    }
    steps.push({ step: "Update custom fields", status: "done" });

    // Step 2: Generate retainer agreement
    const retainerFilename = `Retainer_Agreement_${body.clientLastName}`;
    await generateRetainer(body.matterId, retainerFilename);
    steps.push({ step: "Generate retainer", status: "done" });

    // Step 3: Create calendar entry (Statute of Limitations)
    await createCalendarEntry(body.matterId, clientFullName, body.statuteDate);
    steps.push({ step: "Create calendar entry", status: "done" });

    // Step 4: Download retainer PDF from Clio
    // Wait a moment for document generation to complete
    await new Promise((resolve) => setTimeout(resolve, 3000));

    let retainerPdf: Buffer | null = null;
    const docs = await getMatterDocuments(body.matterId);
    const retainerDoc = docs.find(
      (d: { name: string }) =>
        d.name.toLowerCase().includes("retainer") ||
        d.name.toLowerCase().includes(body.clientLastName.toLowerCase())
    );

    if (retainerDoc) {
      retainerPdf = await downloadDocument(retainerDoc.id);
    }
    steps.push({
      step: "Download retainer PDF",
      status: retainerPdf ? "done" : "skipped",
      detail: retainerPdf ? undefined : "Could not download — email sent without attachment",
    });

    // Step 5: Send email to client
    const accidentDateParts = body.accidentDate.split("/");
    const accidentMonth = parseInt(accidentDateParts[0]) || new Date().getMonth() + 1;

    await sendClientEmail({
      clientFirstName: body.clientFirstName,
      clientEmail: body.clientEmail,
      accidentDate: body.accidentDate,
      officerNotes: body.officerNotes,
      accidentMonth,
      retainerPdf: retainerPdf || Buffer.from(""),
      retainerFilename: `${retainerFilename}.pdf`,
    });
    steps.push({ step: "Send email", status: "done" });

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
    console.error("Approve error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Approval failed" },
      { status: 500 }
    );
  }
}
