import { NextResponse, type NextRequest } from "next/server";

import { isFirebaseAdminConfigured } from "@/lib/firebase/config";
import { getAdminAuth } from "@/lib/firebase/admin";
import { SESSION_COOKIE } from "@/lib/auth/session";

// Proxy defaults to the Node.js runtime in Next.js 16, so it's safe to call
// firebase-admin directly here instead of doing a cookie-presence-only check.
export async function proxy(request: NextRequest) {
  const sessionCookie = request.cookies.get(SESSION_COOKIE)?.value;
  const loginUrl = new URL("/login", request.url);
  loginUrl.searchParams.set("from", request.nextUrl.pathname);

  if (!sessionCookie) {
    return NextResponse.redirect(loginUrl);
  }

  // Without admin credentials configured yet, no session cookie could ever have
  // been minted (see /api/auth/session), so this branch only guards against a
  // stray/forged cookie value.
  if (!isFirebaseAdminConfigured()) {
    return NextResponse.redirect(loginUrl);
  }

  try {
    await getAdminAuth().verifySessionCookie(sessionCookie);
  } catch {
    const response = NextResponse.redirect(loginUrl);
    response.cookies.delete(SESSION_COOKIE);
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
