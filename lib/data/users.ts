import "server-only";

import { getAdminAuth } from "@/lib/firebase/admin";

export interface AppUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  disabled: boolean;
  createdAt: string | null;
  lastSignInAt: string | null;
}

export async function listAppUsers(): Promise<AppUser[]> {
  const result = await getAdminAuth().listUsers(1000);
  return result.users
    .map((user) => ({
      uid: user.uid,
      email: user.email ?? null,
      displayName: user.displayName ?? null,
      disabled: user.disabled,
      createdAt: user.metadata.creationTime ?? null,
      lastSignInAt: user.metadata.lastSignInTime ?? null,
    }))
    .sort((a, b) => (b.createdAt ?? "").localeCompare(a.createdAt ?? ""));
}
