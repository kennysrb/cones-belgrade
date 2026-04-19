import { NextResponse } from "next/server";
import { rsvpSchema } from "@/lib/validation/rsvp";

export const runtime = "nodejs";

export async function POST(request: Request) {
  let data: unknown;
  try {
    data = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = rsvpSchema.safeParse(data);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 422 }
    );
  }

  const endpoint = process.env.RSVP_WEBHOOK_URL;
  if (endpoint) {
    await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(parsed.data),
    }).catch(() => null);
  } else {
    console.log("[RSVP]", parsed.data);
  }

  return NextResponse.json({ ok: true });
}
