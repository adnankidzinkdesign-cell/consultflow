import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { authCookieOptions } from "@/lib/supabase/auth-cookie-options";

const PUBLIC_PATHS = ["/unauthorized"];

function isPublicPath(pathname: string) {
  return PUBLIC_PATHS.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`)
  );
}

/**
 * Refreshes kidzink-auth's shared session cookie on every request and
 * redirects unauthenticated users to kidzink-auth's own /login. This is
 * defense in depth alongside the server-side check in
 * app/(app)/layout.tsx — the layout check (plus each server action's own
 * checks) is what actually gates data access now, not RLS; this just
 * avoids rendering protected pages at all for a signed-out visitor.
 *
 * Reads kidzink-auth's project (see lib/supabase/auth-server.ts), not
 * consultflow's own — consultflow no longer runs its own sign-in flow.
 */
export async function updateSession(request: NextRequest) {
  const supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_AUTH_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_AUTH_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookieOptions: authCookieOptions(),
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  if (!user && !isPublicPath(pathname)) {
    const kidzinkAuthUrl = process.env.NEXT_PUBLIC_KIDZINK_AUTH_URL!;
    const url = new URL("/login", kidzinkAuthUrl);
    url.searchParams.set("next", request.nextUrl.toString());
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
