import type { EmailOtpType } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

const emailOtpTypes = new Set<string>([
  "signup",
  "invite",
  "magiclink",
  "recovery",
  "email_change",
  "email",
]);

function getSafeNextPath(next: string | null) {
  if (!next || !next.startsWith("/") || next.startsWith("//")) {
    return "/login";
  }

  return next;
}

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const nextPath = getSafeNextPath(searchParams.get("next"));
  const supabase = await createClient();

  const code = searchParams.get("code");
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type");

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      if (nextPath === "/login") {
        await supabase.auth.signOut();
      }

      return NextResponse.redirect(new URL(nextPath, request.nextUrl.origin));
    }
  }

  if (tokenHash && type && emailOtpTypes.has(type)) {
    const { error } = await supabase.auth.verifyOtp({
      type: type as EmailOtpType,
      token_hash: tokenHash,
    });

    if (!error) {
      if (nextPath === "/login") {
        await supabase.auth.signOut();
      }

      return NextResponse.redirect(new URL(nextPath, request.nextUrl.origin));
    }
  }

  return NextResponse.redirect(new URL("/login", request.nextUrl.origin));
}
