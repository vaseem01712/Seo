import { NextRequest, NextResponse } from "next/server";
import { runAudit, normalizeUrl } from "@/lib/crawler";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const rawUrl = String(body.url || "").trim();
    const maxPages = Number(body.maxPages) || 10;

    if (!rawUrl) {
      return NextResponse.json({ error: "A URL is required." }, { status: 400 });
    }

    let normalized: string;
    try {
      normalized = normalizeUrl(rawUrl);
    } catch {
      return NextResponse.json({ error: "That doesn't look like a valid URL." }, { status: 400 });
    }

    const result = await runAudit(normalized, maxPages);
    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "The audit failed unexpectedly." },
      { status: 500 }
    );
  }
}
