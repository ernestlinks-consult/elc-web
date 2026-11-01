import type { EmailOtpType } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";
import { signInPath } from "@/lib/auth/access";
import { createClient } from "@/lib/supabase/server";

// Landing page for emailed links. token_hash works on any device, unlike a code
// exchange that needs the browser which asked for the link.

const destinations: Partial<Record<EmailOtpType, string>> = {
  magiclink: "/portal",
  invite: "/portal/set-password",
};

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const destination = type ? destinations[type] : undefined;

  if (tokenHash && type && destination) {
    const supabase = await createClient();
    const { error } = await supabase.auth.verifyOtp({
      type,
      token_hash: tokenHash,
    });

    if (!error) {
      return NextResponse.redirect(new URL(destination, request.url));
    }
  }

  return NextResponse.redirect(
    new URL(`${signInPath}?expired=1`, request.url),
  );
}
