import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getSessionProfile } from "@/lib/auth/getSessionProfile";

/**
 * Generates a short-lived signed URL for a checklist document and redirects
 * to it. Documents are never served from a public bucket URL — this is the
 * only way to reach one, and the signed URL expires quickly (60s), so it's
 * only useful for the immediate click-through, not to bookmark/share.
 *
 * `path` is validated against the actual DB row rather than trusted
 * verbatim from the URL, so a caller can't request an arbitrary storage
 * object just by knowing/guessing a path.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; path: string[] }> }
) {
  const profile = await getSessionProfile();
  if (!profile) {
    const url = new URL("/login", process.env.NEXT_PUBLIC_KIDZINK_AUTH_URL!);
    url.searchParams.set("next", request.url);
    return NextResponse.redirect(url);
  }

  const { id: consultantId, path } = await params;
  const requestedPath = path.join("/");

  const supabase = await createClient();
  const { data: item } = await supabase
    .from("consultant_checklist_items")
    .select("document_path")
    .eq("consultant_id", consultantId)
    .eq("document_path", requestedPath)
    .single();

  if (!item?.document_path) {
    return NextResponse.json({ error: "Document not found." }, { status: 404 });
  }

  const { data: signed, error } = await supabase.storage
    .from("consultant-docs")
    .createSignedUrl(item.document_path, 60);

  if (error || !signed) {
    return NextResponse.json(
      { error: "Could not generate download link." },
      { status: 500 }
    );
  }

  return NextResponse.redirect(signed.signedUrl);
}
