import { NextRequest, NextResponse } from "next/server";
import { extractFromPdf } from "@/lib/extraction";
import { supabase, TABLES, BUCKETS } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  const startTime = Date.now();

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64 = buffer.toString("base64");

    // 1. Upload PDF to Supabase Storage
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const storagePath = `${timestamp}_${file.name}`;

    const { error: uploadError } = await supabase.storage
      .from(BUCKETS.INTAKE_PDFS)
      .upload(storagePath, buffer, {
        contentType: "application/pdf",
        upsert: false,
      });

    if (uploadError) {
      console.error("Storage upload error:", uploadError);
      // Continue anyway — extraction is more important than storage
    }

    // 2. AI Extraction
    const result = await extractFromPdf(base64);
    const extractionMs = Date.now() - startTime;

    // 3. Determine AI provider
    const aiProvider = process.env.AI_PROVIDER_OPENAI === "true" ? "openai" : "anthropic";

    // 4. Save to Supabase DB
    const { data: report, error: dbError } = await supabase
      .from(TABLES.INTAKE_REPORTS)
      .insert({
        filename: file.name,
        file_size_bytes: buffer.length,
        file_path: uploadError ? null : storagePath,
        extracted_json: result,
        ai_provider: aiProvider,
        extraction_ms: extractionMs,
        status: "draft",
      })
      .select("id")
      .single();

    if (dbError) {
      console.error("DB insert error:", dbError);
      // Continue — return extraction result even if DB fails
    }

    // 5. Log to audit trail
    if (report?.id) {
      await supabase.from(TABLES.AUDIT_LOG).insert({
        report_id: report.id,
        action: "extracted",
        success: true,
        duration_ms: extractionMs,
        detail: {
          ai_provider: aiProvider,
          filename: file.name,
          file_size_bytes: buffer.length,
        },
      });
    }

    return NextResponse.json({
      success: true,
      data: result,
      reportId: report?.id || null,
      extractionMs,
    });
  } catch (error) {
    console.error("Extraction error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Extraction failed" },
      { status: 500 }
    );
  }
}
