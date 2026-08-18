import "server-only";

import { FieldValue, Timestamp } from "firebase-admin/firestore";

import { getAdminDb } from "@/lib/firebase/admin";

const COLLECTION = "tradeInLeads";

export interface CreateTradeInLeadInput {
  year: string;
  make: string;
  model: string;
  mileage: string;
  condition: string;
  name: string;
  email: string;
  phone: string;
  notes: string;
}

export interface TradeInLead extends CreateTradeInLeadInput {
  id: string;
  createdAt: string;
}

export async function createTradeInLead(input: CreateTradeInLeadInput): Promise<void> {
  await getAdminDb()
    .collection(COLLECTION)
    .add({
      ...input,
      createdAt: FieldValue.serverTimestamp(),
    });
}

export async function listTradeInLeads(): Promise<TradeInLead[]> {
  const snapshot = await getAdminDb().collection(COLLECTION).orderBy("createdAt", "desc").get();
  return snapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      year: data.year ?? "",
      make: data.make ?? "",
      model: data.model ?? "",
      mileage: data.mileage ?? "",
      condition: data.condition ?? "",
      name: data.name ?? "",
      email: data.email ?? "",
      phone: data.phone ?? "",
      notes: data.notes ?? "",
      createdAt:
        data.createdAt instanceof Timestamp
          ? data.createdAt.toDate().toISOString()
          : new Date().toISOString(),
    };
  });
}
