import "server-only";

import {
  cert,
  getApps,
  initializeApp,
  type App,
  type Credential,
} from "firebase-admin/app";
import { getAuth, type Auth } from "firebase-admin/auth";
import { getFirestore, type Firestore } from "firebase-admin/firestore";
import { getStorage, type Storage } from "firebase-admin/storage";

import { isFirebaseAdminConfigured } from "./config";

let adminApp: App | undefined;

/**
 * Different provisioning paths (pasting into .env.local by hand, a Vercel
 * dashboard field, `vercel env pull`, a marketplace integration) escape the
 * PEM private key's newlines differently — some keep them literal, some
 * double-escape, some leave real newlines intact. Rather than guess, try
 * each normalization and use the first one `cert()` actually accepts.
 */
function candidatePrivateKeys(raw: string): string[] {
  const unquoted = raw.replace(/^['"]|['"]$/g, "");
  const candidates = new Set<string>([
    raw,
    unquoted,
    unquoted.replace(/\\n/g, "\n"),
    unquoted.replace(/\\\\n/g, "\n"),
  ]);
  return [...candidates];
}

function buildCredential(): Credential {
  const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
  const rawPrivateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY ?? "";

  let lastError: unknown;
  for (const privateKey of candidatePrivateKeys(rawPrivateKey)) {
    try {
      return cert({ projectId, clientEmail, privateKey });
    } catch (err) {
      lastError = err;
    }
  }
  throw new Error(
    "Firebase Admin private key could not be parsed. Re-copy FIREBASE_ADMIN_PRIVATE_KEY from the service account JSON's \"private_key\" field.",
    { cause: lastError }
  );
}

function ensureAdminApp(): App {
  if (!isFirebaseAdminConfigured()) {
    throw new Error(
      "Firebase Admin is not configured. Set FIREBASE_ADMIN_PROJECT_ID, FIREBASE_ADMIN_CLIENT_EMAIL, and FIREBASE_ADMIN_PRIVATE_KEY in .env.local."
    );
  }
  if (!adminApp) {
    adminApp =
      getApps()[0] ??
      initializeApp({
        credential: buildCredential(),
        storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      });
  }
  return adminApp;
}

export function getAdminAuth(): Auth {
  return getAuth(ensureAdminApp());
}

export function getAdminDb(): Firestore {
  return getFirestore(ensureAdminApp());
}

export function getAdminStorage(): Storage {
  return getStorage(ensureAdminApp());
}
