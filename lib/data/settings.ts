import "server-only";

import { getAdminDb } from "@/lib/firebase/admin";

const COLLECTION = "settings";
const DOC_ID = "general";

export interface DealerSettings {
  dealerName: string;
  contactEmail: string;
  contactPhone: string;
  whatsappNumber: string;
  address: string;
  businessHours: string;
}

const DEFAULT_SETTINGS: DealerSettings = {
  dealerName: "Argus",
  contactEmail: "hello@argus.app",
  contactPhone: "+598 2900 1234",
  whatsappNumber: "",
  address: "Av. 18 de Julio 1200, Montevideo",
  businessHours: "Lun. a sáb., 9 a 19 h",
};

export async function getDealerSettings(): Promise<DealerSettings> {
  const doc = await getAdminDb().collection(COLLECTION).doc(DOC_ID).get();
  if (!doc.exists) return DEFAULT_SETTINGS;

  const data = doc.data() ?? {};
  return {
    dealerName: data.dealerName || DEFAULT_SETTINGS.dealerName,
    contactEmail: data.contactEmail || DEFAULT_SETTINGS.contactEmail,
    contactPhone: data.contactPhone || DEFAULT_SETTINGS.contactPhone,
    whatsappNumber: data.whatsappNumber || DEFAULT_SETTINGS.whatsappNumber,
    address: data.address || DEFAULT_SETTINGS.address,
    businessHours: data.businessHours || DEFAULT_SETTINGS.businessHours,
  };
}

export async function updateDealerSettings(input: DealerSettings): Promise<void> {
  await getAdminDb().collection(COLLECTION).doc(DOC_ID).set(input, { merge: true });
}
