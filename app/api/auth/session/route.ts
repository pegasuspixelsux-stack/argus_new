import { NextResponse } from "next/server";

import { getAdminAuth } from "@/lib/firebase/admin";
import { isFirebaseAdminConfigured } from "@/lib/firebase/config";
import { SESSION_COOKIE, SESSION_MAX_AGE_MS } from "@/lib/auth/session";

export async function POST(request: Request) {
  if (!isFirebaseAdminConfigured()) {
    return NextResponse.json(
      {
        error:
          "Firebase Admin is not configured on the server. Add FIREBASE_ADMIN_* values to .env.local.",
      },
      { status: 503 }
    );
  }

  const body = await request.json().catch(() => null);
  const idToken = body?.idToken;
  if (!idToken || typeof idToken !== "string") {
    return NextResponse.json({ error: "Missing idToken." }, { status: 400 });
  }

  try {
    // checkRevoked ensures the token is still valid before we mint a long-lived cookie.
    await getAdminAuth().verifyIdToken(idToken, true);
    const sessionCookie = await getAdminAuth().createSessionCookie(idToken, {
      expiresIn: SESSION_MAX_AGE_MS,
    });

    const response = NextResponse.json({ ok: true });
    response.cookies.set(SESSION_COOKIE, sessionCookie, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: SESSION_MAX_AGE_MS / 1000,
    });
    return response;
  } catch {
    return NextResponse.json({ error: "Could not verify credentials." }, { status: 401 });
  }
}
