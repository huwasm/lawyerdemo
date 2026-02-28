const CLIO_BASE_URL = process.env.CLIO_BASE_URL || "https://app.clio.com";
const CLIO_ACCESS_TOKEN = process.env.CLIO_ACCESS_TOKEN || "";

async function clioFetch(path: string, options: RequestInit = {}) {
  const res = await fetch(`${CLIO_BASE_URL}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${CLIO_ACCESS_TOKEN}`,
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Clio API ${res.status}: ${body}`);
  }

  // Download endpoints return binary
  const contentType = res.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    return res.json();
  }
  return res;
}

// --- Matters ---

export interface ClioMatter {
  id: number;
  client: { id: number; name: string };
  status: string;
  display_number?: string;
  description?: string;
}

export async function getOpenMatters(): Promise<ClioMatter[]> {
  const data = await clioFetch(
    "/api/v4/matters?fields=id,client,status,display_number,description&status=open&limit=200"
  );
  return data.data || [];
}

export async function getMatter(matterId: number): Promise<ClioMatter> {
  const data = await clioFetch(
    `/api/v4/matters/${matterId}?fields=id,client,status,display_number,description`
  );
  return data.data;
}

// --- Custom Fields ---

export interface CustomFieldUpdate {
  custom_field: { id: number };
  value: string | number;
}

export async function updateMatterCustomFields(
  matterId: number,
  fields: CustomFieldUpdate[]
) {
  return clioFetch(`/api/v4/matters/${matterId}`, {
    method: "PATCH",
    body: JSON.stringify({
      data: { custom_field_values: fields },
    }),
  });
}

// --- Contact ---

export async function getContact(contactId: number) {
  const data = await clioFetch(
    `/api/v4/contacts/${contactId}?fields=id,name,first_name,last_name,email_addresses`
  );
  return data.data;
}

// --- Document Automation ---

export async function generateRetainer(matterId: number, filename: string) {
  const templateId = parseInt(process.env.CLIO_TEMPLATE_ID || "0");
  return clioFetch("/api/v4/document_automations", {
    method: "POST",
    body: JSON.stringify({
      data: {
        document_template: { id: templateId },
        matter: { id: matterId },
        filename,
        formats: ["pdf"],
      },
    }),
  });
}

// --- Documents ---

export async function getMatterDocuments(matterId: number) {
  const data = await clioFetch(
    `/api/v4/documents?fields=id,name,latest_document_version&matter_id=${matterId}`
  );
  return data.data || [];
}

export async function downloadDocument(
  documentId: number
): Promise<Buffer | null> {
  // First get the version ID
  const docData = await clioFetch(
    `/api/v4/documents/${documentId}?fields=id,name,latest_document_version`
  );

  const versionId = docData.data?.latest_document_version?.id;
  if (!versionId) return null;

  // Download the actual file
  const res = await clioFetch(
    `/api/v4/document_versions/${versionId}/download`
  );

  if (res instanceof Response) {
    const arrayBuffer = await res.arrayBuffer();
    return Buffer.from(arrayBuffer);
  }

  return null;
}

// --- Calendar ---

export async function createCalendarEntry(
  matterId: number,
  clientName: string,
  statuteDate: string
) {
  const calendarId = parseInt(process.env.CLIO_CALENDAR_ID || "0");

  return clioFetch("/api/v4/calendar_entries", {
    method: "POST",
    body: JSON.stringify({
      data: {
        summary: `Statute of Limitations - ${clientName}`,
        all_day: true,
        start_at: `${statuteDate}T09:00:00+00:00`,
        end_at: `${statuteDate}T17:00:00+00:00`,
        calendar_owner: { id: calendarId },
        matter: { id: matterId },
      },
    }),
  });
}
