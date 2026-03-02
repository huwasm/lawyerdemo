// ┌──────────────────────────────────────────────────────────────────────┐
// │ EU-CONFIG: Base URL and token are set via .env.local                │
// │ EU:  CLIO_BASE_URL=https://eu.app.clio.com                         │
// │ US:  CLIO_BASE_URL=https://app.clio.com  (the default fallback)    │
// │ See docs/EU_TO_US_MIGRATION.md for full switch checklist.          │
// └──────────────────────────────────────────────────────────────────────┘
const CLIO_BASE_URL = process.env.CLIO_BASE_URL || "https://app.clio.com";
const CLIO_ACCESS_TOKEN = process.env.CLIO_ACCESS_TOKEN || "";

function clog(fn: string, msg: string, data?: unknown) {
  if (data !== undefined) {
    console.log(`[Clio][${fn}]`, msg, typeof data === "string" ? data : JSON.stringify(data));
  } else {
    console.log(`[Clio][${fn}]`, msg);
  }
}

async function clioFetch(path: string, options: RequestInit = {}) {
  const method = (options.method || "GET").toUpperCase();
  clog("fetch", `${method} ${path}`);
  const startMs = Date.now();

  const res = await fetch(`${CLIO_BASE_URL}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${CLIO_ACCESS_TOKEN}`,
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  const elapsed = Date.now() - startMs;

  if (!res.ok) {
    const body = await res.text();
    clog("fetch", `FAILED ${res.status} in ${elapsed}ms: ${body.slice(0, 500)}`);
    throw new Error(`Clio API ${res.status}: ${body}`);
  }

  clog("fetch", `OK ${res.status} in ${elapsed}ms`);

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
  clog("getOpenMatters", "Fetching open matters...");
  const data = await clioFetch(
    "/api/v4/matters?fields=id,client,status,display_number,description&status=open&limit=200"
  );
  const matters = data.data || [];
  clog("getOpenMatters", `Found ${matters.length} open matters`);
  return matters;
}

export async function getMatter(matterId: number): Promise<ClioMatter> {
  clog("getMatter", `Fetching matter #${matterId}`);
  const data = await clioFetch(
    `/api/v4/matters/${matterId}?fields=id,client,status,display_number,description`
  );
  return data.data;
}

// --- Custom Fields ---

export interface CustomFieldUpdate {
  custom_field: { id: number };
  value: string | number;
  id?: number; // existing value ID — needed to update, not duplicate
}

export async function updateMatterCustomFields(
  matterId: number,
  fields: CustomFieldUpdate[]
) {
  clog("updateCustomFields", `Matter #${matterId}: updating ${fields.length} fields`);

  // Step 1: Get existing custom field values on this Matter
  const matterData = await clioFetch(
    `/api/v4/matters/${matterId}?fields=id,custom_field_values{id,custom_field}`
  );

  const existingValues: { id: number; custom_field: { id: number } }[] =
    matterData.data?.custom_field_values || [];

  clog("updateCustomFields", `Found ${existingValues.length} existing custom field values`);

  // Step 2: Build a map of custom_field_id → existing value ID
  const existingMap = new Map<number, number>();
  for (const ev of existingValues) {
    if (ev.custom_field?.id) {
      existingMap.set(ev.custom_field.id, ev.id);
    }
  }

  // Step 3: Merge — if field already has a value, include its ID to update (not create duplicate)
  const mergedFields = fields.map((f) => {
    const existingId = existingMap.get(f.custom_field.id);
    if (existingId) {
      return { ...f, id: existingId };
    }
    return f;
  });

  const updatedCount = mergedFields.filter((f) => f.id).length;
  const newCount = mergedFields.length - updatedCount;
  clog("updateCustomFields", `Merging: ${updatedCount} updates, ${newCount} new`);

  // Step 4: PATCH with merged fields
  const result = await clioFetch(`/api/v4/matters/${matterId}`, {
    method: "PATCH",
    body: JSON.stringify({
      data: { custom_field_values: mergedFields },
    }),
  });

  clog("updateCustomFields", "Custom fields saved successfully");
  return result;
}

// --- Contact ---

export async function getContact(contactId: number) {
  clog("getContact", `Fetching contact #${contactId}`);
  const data = await clioFetch(
    `/api/v4/contacts/${contactId}?fields=id,name,first_name,last_name,email_addresses`
  );
  return data.data;
}

// --- Document Automation ---

export async function generateRetainer(
  matterId: number,
  filename: string,
  templateId?: number
) {
  const tplId =
    templateId || parseInt(process.env.CLIO_TEMPLATE_ID || "0");
  clog("generateRetainer", `Template #${tplId}, Matter #${matterId}, filename: "${filename}"`);
  return clioFetch("/api/v4/document_automations", {
    method: "POST",
    body: JSON.stringify({
      data: {
        document_template: { id: tplId },
        matter: { id: matterId },
        filename,
        formats: ["pdf"],
      },
    }),
  });
}

// --- Documents ---

export async function getMatterDocuments(matterId: number) {
  clog("getMatterDocuments", `Listing documents for Matter #${matterId}`);
  const data = await clioFetch(
    `/api/v4/documents?fields=id,name,latest_document_version&matter_id=${matterId}`
  );
  const docs = data.data || [];
  clog("getMatterDocuments", `Found ${docs.length} documents`);
  return docs;
}

export async function downloadDocument(
  documentId: number
): Promise<Buffer | null> {
  clog("downloadDocument", `Downloading doc #${documentId}`);

  try {
    // ┌──────────────────────────────────────────────────────────────────┐
    // │ EU-WORKAROUND: Clio EU does NOT support the standard endpoint   │
    // │   GET /api/v4/document_versions/{versionId}/download            │
    // │ It returns 404 for all version IDs.                             │
    // │                                                                 │
    // │ Working endpoint on EU:                                         │
    // │   GET /api/v4/documents/{documentId}/download.json              │
    // │ Returns 303 → S3 presigned URL.                                 │
    // │                                                                 │
    // │ US-SWITCH: On US Clio, the standard /document_versions/{id}/    │
    // │   download endpoint may work. Test first. If it does, you can   │
    // │   revert to the simpler version. See docs/EU_TO_US_MIGRATION.md │
    // └──────────────────────────────────────────────────────────────────┘

    // Step 1: Request download — get 303 redirect to S3
    // Must use redirect:'manual' so we can strip the Auth header before following to S3
    const downloadUrl = `${CLIO_BASE_URL}/api/v4/documents/${documentId}/download.json`;
    clog("downloadDocument", `GET ${downloadUrl} (manual redirect)`);

    const redirectRes = await fetch(downloadUrl, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${CLIO_ACCESS_TOKEN}`,
      },
      redirect: "manual",
    });

    if (redirectRes.status !== 303) {
      const body = await redirectRes.text();
      clog("downloadDocument", `Expected 303 but got ${redirectRes.status}: ${body.slice(0, 300)}`);
      return null;
    }

    const s3Url = redirectRes.headers.get("location");
    if (!s3Url) {
      clog("downloadDocument", "303 response missing Location header");
      return null;
    }

    clog("downloadDocument", `Following redirect to S3 (${s3Url.slice(0, 80)}...)`);

    // Step 2: Download from S3 — NO Authorization header (S3 uses its own presigned URL auth)
    const s3Res = await fetch(s3Url);
    if (!s3Res.ok) {
      clog("downloadDocument", `S3 download failed: ${s3Res.status}`);
      return null;
    }

    const arrayBuffer = await s3Res.arrayBuffer();
    const buf = Buffer.from(arrayBuffer);
    clog("downloadDocument", `Downloaded ${buf.length} bytes`);
    return buf;
  } catch (err) {
    clog("downloadDocument", `FAILED: ${err instanceof Error ? err.message : String(err)}`);
    return null;
  }
}

// --- Calendar ---

export async function createCalendarEntry(
  matterId: number,
  clientName: string,
  statuteDate: string
) {
  const calendarId = parseInt(process.env.CLIO_CALENDAR_ID || "0");
  clog("createCalendarEntry", `Calendar #${calendarId}, Matter #${matterId}, date: ${statuteDate}, client: ${clientName}`);

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
