import "server-only";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { isFirebaseAdminConfigured } from "@/lib/firebase/config";
import { getAdminAuth } from "@/lib/firebase/admin";

export const SESSION_COOKIE = "session";
/** Matches the maxAge used for the Firebase session cookie itself. */
export const SESSION_MAX_AGE_MS = 14 * 24 * 60 * 60 * 1000; // 14 days

export interface Session {
  uid: string;
  email: string | null;
}

/** Reads and verifies the current session cookie. Returns null if absent or invalid. */
export async function getSession(): Promise<Session | null> {
  if (!isFirebaseAdminConfigured()) return null;

  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(SESSION_COOKIE)?.value;
  if (!sessionCookie) return null;

  try {
    const decoded = await getAdminAuth().verifySessionCookie(sessionCookie, true);
    return { uid: decoded.uid, email: decoded.email ?? null };
  } catch {
    return null;
  }
}

/**
 * Defense-in-depth auth check for pages and Server Functions.
 * Proxy already gates `/dashboard/*`, but per Next.js guidance a matcher
 * change can silently remove that coverage, so every server-side entry
 * point that touches property data re-checks the session itself.
 */
export async function requireSession(): Promise<Session> {
  const session = await getSession();
  if (!session) redirect("/login");
  return session;
}
