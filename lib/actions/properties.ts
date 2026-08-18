"use server";

import { revalidatePath } from "next/cache";

import { requireSession } from "@/lib/auth/session";
import { createProperty, deleteProperty, updateProperty } from "@/lib/data/properties";
import type { PropertyInput } from "@/types/property";

export async function createPropertyAction(input: PropertyInput): Promise<{ id: string }> {
  await requireSession();
  const id = await createProperty(input);
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/properties");
  revalidatePath(`/properties/${id}`);
  revalidatePath("/");
  revalidatePath("/listings");
  return { id };
}

export async function updatePropertyAction(id: string, input: PropertyInput): Promise<void> {
  await requireSession();
  await updateProperty(id, input);
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/properties");
  revalidatePath(`/dashboard/properties/${id}/edit`);
  revalidatePath(`/properties/${id}`);
  revalidatePath("/");
  revalidatePath("/listings");
}

export async function deletePropertyAction(id: string): Promise<void> {
  await requireSession();
  await deleteProperty(id);
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/properties");
  revalidatePath("/");
  revalidatePath("/listings");
}
