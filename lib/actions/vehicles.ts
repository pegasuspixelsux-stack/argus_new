"use server";

import { revalidatePath } from "next/cache";

import { requireSession } from "@/lib/auth/session";
import { createVehicle, deleteVehicle, updateVehicle } from "@/lib/data/vehicles";
import type { VehicleInput } from "@/types/vehicle";

export async function createVehicleAction(input: VehicleInput): Promise<{ id: string }> {
  await requireSession();
  const id = await createVehicle(input);
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/vehicles");
  revalidatePath(`/vehicles/${id}`);
  return { id };
}

export async function updateVehicleAction(id: string, input: VehicleInput): Promise<void> {
  await requireSession();
  await updateVehicle(id, input);
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/vehicles");
  revalidatePath(`/dashboard/vehicles/${id}/edit`);
  revalidatePath(`/vehicles/${id}`);
}

export async function deleteVehicleAction(id: string): Promise<void> {
  await requireSession();
  await deleteVehicle(id);
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/vehicles");
}
