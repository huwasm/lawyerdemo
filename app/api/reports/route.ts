import { NextRequest, NextResponse } from "next/server";
import { supabase, TABLES, BUCKETS } from "@/lib/supabase";

// GET /api/reports — list recent reports
// GET /api/reports?id=xxx — fetch single report with extracted_json + PDF URL
export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("id");

  if (id) {
    // Fetch single report
    const { data, error } = await supabase
      .from(TABLES.INTAKE_REPORTS)
      .select("id, filename, created_at, extracted_json, ai_provider, extraction_ms, status, matter_id, client_name, file_path")
      .eq("id", id)
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }

    // Generate signed URL for the PDF if file_path exists
    let pdfUrl: string | null = null;
    if (data.file_path) {
      const { data: signedData } = await supabase.storage
        .from(BUCKETS.INTAKE_PDFS)
        .createSignedUrl(data.file_path, 3600); // 1 hour expiry
      if (signedData?.signedUrl) {
        pdfUrl = signedData.signedUrl;
      }
    }

    return NextResponse.json({ success: true, report: data, pdfUrl });
  }

  // List recent reports (last 50)
  const { data, error } = await supabase
    .from(TABLES.INTAKE_REPORTS)
    .select("id, filename, created_at, ai_provider, status, extraction_ms")
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, reports: data });
}
