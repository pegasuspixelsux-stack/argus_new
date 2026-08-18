"use server";

import { requireSession } from "@/lib/auth/session";
import { updateDealerSettings, type DealerSettings } from "@/lib/data/settings";

export interface UpdateSettingsResult {
  ok: boolean;
  error?: string;
}

export async function updateSettingsAction(input: DealerSettings): Promise<UpdateSettingsResult> {
  await requireSession();

  if (!input.dealerName.trim()) {
    return { ok: false, error: "El nombre del concesionario es obligatorio." };
  }

  try {
    await updateDealerSettings(input);
    return { ok: true };
  } catch {
    return { ok: false, error: "No pudimos guardar la configuración. Inténtalo de nuevo." };
  }
}
