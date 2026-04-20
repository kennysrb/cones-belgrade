import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";

export const runtime = "nodejs";

const KNOWN_TAGS = new Set([
  "siteSettings",
  "news",
  "event",
  "practice",
  "sponsor",
]);

export async function POST(request: Request) {
  const secret = request.headers.get("x-revalidate-secret");
  if (!process.env.SANITY_REVALIDATE_SECRET || secret !== process.env.SANITY_REVALIDATE_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { tag?: string; slug?: string; _type?: string } = {};
  try {
    body = await request.json();
  } catch {}

  const tag = body.tag ?? body._type;
  if (tag && KNOWN_TAGS.has(tag)) {
    revalidateTag(tag);
  }
  if (body.slug) {
    revalidateTag(`news:${body.slug}`);
  }
  return NextResponse.json({ revalidated: true, tag, slug: body.slug ?? null });
}
