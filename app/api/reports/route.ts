import { NextRequest, NextResponse } from "next/server";
import { supabase, TABLES } from "@/lib/supabase";

// GET /api/reports — list recent reports
// GET /api/reports?id=xxx — fetch single report with extracted_json
export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("id");

  if (id) {
    // Fetch single report
    const { data, error } = await supabase
      .from(TABLES.INTAKE_REPORTS)
      .select("id, filename, created_at, extracted_json, ai_provider, extraction_ms, status, matter_id, client_name")
      .eq("id", id)
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }
    return NextResponse.json({ success: true, report: data });
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
