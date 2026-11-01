import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import {
  decideAccess,
  signInPath,
  type AccessRow,
} from "@/lib/auth/access";
import { passesDatabaseCheck } from "@/lib/public-route-checks";
import { resolvePublicRoute } from "@/lib/public-routes";
import type { Database } from "@/lib/supabase/database.types";

// Guards every /portal request and keeps the session fresh. Server actions and
// route handlers repeat the check themselves (lib/auth/session.ts): Next's docs warn
// that proxy coverage can silently change when code moves.

const openPaths = [signInPath, "/portal/auth/"];

function protect(response: NextResponse) {
  response.headers.set("Cache-Control", "no-store, max-age=0");
  response.headers.set("X-Robots-Tag", "noindex, nofollow");
  response.headers.set("Content-Security-Policy", "frame-ancestors 'none'");
  return response;
}

/** Dynamic public routes render a shell first, so a bad URL must stop here. */
async function publicResponse(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;
  const decision = resolvePublicRoute(pathname, searchParams);
  // No route lives here, so Next answers with app/not-found.tsx and a real 404.
  const notFound = () =>
    NextResponse.rewrite(new URL("/page-not-found", request.url));

  if (decision.action === "notFound") return notFound();
  if (decision.check && !(await passesDatabaseCheck(decision.check))) {
    return notFound();
  }

  return decision.action === "rewrite"
    ? NextResponse.rewrite(new URL(decision.path, request.url))
    : NextResponse.next();
}

export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  if (!pathname.startsWith("/portal")) return publicResponse(request);

  let response = NextResponse.next({ request });

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookieOptions: {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
      },
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  function redirectTo(path: string) {
    const redirect = NextResponse.redirect(new URL(path, request.url));
    response.cookies
      .getAll()
      .forEach((cookie) => redirect.cookies.set(cookie));
    return protect(redirect);
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  const isOpen = openPaths.some((path) => pathname.startsWith(path));

  if (!user) {
    if (isOpen) return protect(response);
    const next = encodeURIComponent(pathname + search);
    return redirectTo(`${signInPath}?next=${next}`);
  }

  const { data } = await supabase.rpc("my_staff_access").maybeSingle();
  const state = decideAccess(data as AccessRow);

  if (state === "disabled") {
    await supabase.auth.signOut();
    return redirectTo(`${signInPath}?blocked=1`);
  }

  if (state === "no_access") {
    return pathname === "/portal/no-access"
      ? protect(response)
      : redirectTo("/portal/no-access");
  }

  if (state === "two_step") {
    const allowed =
      pathname === "/portal/two-step" ||
      pathname === "/portal/set-password" ||
      pathname.startsWith("/portal/auth/");
    return allowed ? protect(response) : redirectTo("/portal/two-step");
  }

  if (
    pathname === signInPath ||
    pathname === "/portal/two-step" ||
    pathname === "/portal/no-access"
  ) {
    return redirectTo("/portal");
  }

  // Streaming sends the 200 first, so a page can't return a real 404 itself. RLS
  // answers for this person, so "not yours" and "missing" look the same.
  const leadId = pathname.match(/^\/portal\/leads\/([^/]+)$/)?.[1];
  if (leadId) {
    const { data: lead } = /^[0-9a-f-]{36}$/i.test(leadId)
      ? await supabase.from("leads").select("id").eq("id", leadId).maybeSingle()
      : { data: null };

    if (!lead) {
      const notFound = NextResponse.rewrite(new URL("/portal/missing", request.url));
      response.cookies.getAll().forEach((cookie) => notFound.cookies.set(cookie));
      return protect(notFound);
    }
  }

  return protect(response);
}

export const config = {
  // Everything but assets, so an unknown URL always gets the real 404 page.
  matcher: ["/((?!_next/|api/|brand/|.*\\.).*)"],
};
