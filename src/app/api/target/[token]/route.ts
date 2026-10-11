import { NextResponse } from "next/server";
import { config } from "@/lib/config";
import { getRemainingMs } from "@/lib/links";

export const dynamic = "force-dynamic";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;
  const remainingMs = await getRemainingMs(token);

  if (remainingMs <= 0) {
    return NextResponse.json({ error: "expired" }, { status: 410 });
  }

  return NextResponse.json({
    url: config.targetUrl,
    remainingMs,
  });
}
