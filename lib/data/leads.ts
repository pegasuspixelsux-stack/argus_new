import "server-only";

import { FieldValue, Timestamp } from "firebase-admin/firestore";

import { getAdminDb } from "@/lib/firebase/admin";

const COLLECTION = "leads";

export interface CreateLeadInput {
  vehicleId: string;
  vehicleTitle: string;
  name: string;
  email: string;
  message: string;
}

export interface Lead extends CreateLeadInput {
  id: string;
  createdAt: string;
}

export async function createLead(input: CreateLeadInput): Promise<void> {
  await getAdminDb()
    .collection(COLLECTION)
    .add({
      ...input,
      createdAt: FieldValue.serverTimestamp(),
    });
}

export async function listLeads(): Promise<Lead[]> {
  const snapshot = await getAdminDb().collection(COLLECTION).orderBy("createdAt", "desc").get();
  return snapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      vehicleId: data.vehicleId ?? "",
      vehicleTitle: data.vehicleTitle ?? "",
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
