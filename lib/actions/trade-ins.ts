"use server";

import { createTradeInLead } from "@/lib/data/trade-ins";

export interface SubmitTradeInInput {
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

export interface SubmitTradeInResult {
  ok: boolean;
  error?: string;
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function submitTradeInAction(
  input: SubmitTradeInInput
): Promise<SubmitTradeInResult> {
  const year = input.year.trim();
  const make = input.make.trim();
  const model = input.model.trim();
  const name = input.name.trim();
  const email = input.email.trim();

  if (!year || !make || !model || !name || !email) {
    return { ok: false, error: "Completa los campos obligatorios." };
  }
  if (!EMAIL_PATTERN.test(email)) {
    return { ok: false, error: "Ingresa un correo electrónico válido." };
  }
  const yearNumber = Number(year);
  if (!Number.isInteger(yearNumber) || yearNumber < 1900 || yearNumber > 2100) {
    return { ok: false, error: "Ingresa un año válido." };
  }

  try {
    await createTradeInLead({
      year,
      make,
      model,
      mileage: input.mileage.trim(),
      condition: input.condition,
      name,
      email,
      phone: input.phone.trim(),
      notes: input.notes.trim(),
    });
    return { ok: true };
  } catch {
    return { ok: false, error: "No pudimos enviar tu solicitud. Inténtalo de nuevo en un momento." };
  }
}
