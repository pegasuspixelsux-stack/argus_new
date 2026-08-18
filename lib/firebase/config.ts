export const firebaseClientConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

/** True once every required client-side Firebase value is present. */
export const isFirebaseClientConfigured = Boolean(
  firebaseClientConfig.apiKey &&
    firebaseClientConfig.authDomain &&
    firebaseClientConfig.projectId &&
    firebaseClientConfig.storageBucket &&
    firebaseClientConfig.appId
);

/**
 * True once the server-side (admin) Firebase credentials are present.
 *
 * Evaluated fresh on every call rather than cached as a module-level
 * constant — serverless functions can reuse a warm instance across many
 * requests, and if this were computed once at module load it could freeze
 * in a "not configured" state for that instance's whole lifetime if env
 * vars weren't fully attached at the exact moment it first evaluated.
 */
export function isFirebaseAdminConfigured(): boolean {
  return Boolean(
    process.env.FIREBASE_ADMIN_PROJECT_ID &&
      process.env.FIREBASE_ADMIN_CLIENT_EMAIL &&
      process.env.FIREBASE_ADMIN_PRIVATE_KEY
  );
}
