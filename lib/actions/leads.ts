"use server";

import { createLead } from "@/lib/data/leads";

export interface SubmitLeadInput {
  propertyId: string;
  propertyTitle: string;
  name: string;
  email: string;
  message: string;
}

export interface SubmitLeadResult {
  ok: boolean;
  error?: string;
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function submitLeadAction(input: SubmitLeadInput): Promise<SubmitLeadResult> {
  const name = input.name.trim();
  const email = input.email.trim();
  const message = input.message.trim();

  if (!name || !email || !message) {
    return { ok: false, error: "Completa todos los campos." };
  }
  if (!EMAIL_PATTERN.test(email)) {
    return { ok: false, error: "Ingresa un correo electrónico válido." };
  }

  try {
    await createLead({
      propertyId: input.propertyId,
      propertyTitle: input.propertyTitle,
      name,
      email,
      message,
    });
    return { ok: true };
  } catch {
    return { ok: false, error: "No pudimos enviar tu mensaje. Inténtalo de nuevo en un momento." };
  }
}
