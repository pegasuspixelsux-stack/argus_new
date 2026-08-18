import "server-only";

import { FieldValue, Timestamp } from "firebase-admin/firestore";

import { getAdminDb } from "@/lib/firebase/admin";

const COLLECTION = "contactMessages";

export interface CreateContactMessageInput {
  name: string;
  email: string;
  message: string;
}

export interface ContactMessage extends CreateContactMessageInput {
  id: string;
  createdAt: string;
}

export async function createContactMessage(input: CreateContactMessageInput): Promise<void> {
  await getAdminDb()
    .collection(COLLECTION)
    .add({
      ...input,
      createdAt: FieldValue.serverTimestamp(),
    });
}

export async function listContactMessages(): Promise<ContactMessage[]> {
  const snapshot = await getAdminDb().collection(COLLECTION).orderBy("createdAt", "desc").get();
  return snapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      name: data.name ?? "",
      email: data.email ?? "",
      message: data.message ?? "",
      createdAt:
        data.createdAt instanceof Timestamp
          ? data.createdAt.toDate().toISOString()
          : new Date().toISOString(),
    };
  });
}
