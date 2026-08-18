import "server-only";

import { FieldValue, Timestamp } from "firebase-admin/firestore";

import { getAdminDb } from "@/lib/firebase/admin";
import type { Vehicle, VehicleInput } from "@/types/vehicle";

const COLLECTION = "vehicles";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function toVehicle(id: string, data: any): Vehicle {
  const toIso = (value: unknown) =>
    value instanceof Timestamp ? value.toDate().toISOString() : new Date().toISOString();

  return {
    id,
    make: data.make ?? "",
    model: data.model ?? "",
    year: data.year ?? new Date().getFullYear(),
    description: data.description ?? "",
    specs: {
      mileage: data.specs?.mileage ?? null,
      transmission: data.specs?.transmission ?? null,
      fuelType: data.specs?.fuelType ?? null,
      exteriorColor: data.specs?.exteriorColor ?? "",
      interiorColor: data.specs?.interiorColor ?? "",
      bodyType: data.specs?.bodyType ?? "",
      vin: data.specs?.vin ?? "",
    },
    photos: Array.isArray(data.photos) ? data.photos : [],
    priceDisplay: data.priceDisplay ?? null,
    priceCompareAt: data.priceCompareAt ?? null,
    status: data.status === "published" ? "published" : "draft",
    createdAt: toIso(data.createdAt),
    updatedAt: toIso(data.updatedAt),
  };
}

export async function listVehicles(): Promise<Vehicle[]> {
  const snapshot = await getAdminDb()
    .collection(COLLECTION)
    .orderBy("updatedAt", "desc")
    .get();
  return snapshot.docs.map((doc) => toVehicle(doc.id, doc.data()));
}

export async function getVehicle(id: string): Promise<Vehicle | null> {
  const doc = await getAdminDb().collection(COLLECTION).doc(id).get();
  if (!doc.exists) return null;
  return toVehicle(doc.id, doc.data());
}

export async function getPublishedVehicle(id: string): Promise<Vehicle | null> {
  const vehicle = await getVehicle(id);
  if (!vehicle || vehicle.status !== "published") return null;
  return vehicle;
}

/** Most recently updated published vehicles, for marketing surfaces like the homepage. */
export async function listPublishedVehicles(max = 4): Promise<Vehicle[]> {
  const vehicles = await listVehicles();
  return vehicles.filter((vehicle) => vehicle.status === "published").slice(0, max);
}

/**
 * Same as `getPublishedVehicle`, but never throws — used by the public page
 * so a Firestore/config outage renders a friendly message instead of an
 * unhandled server error.
 */
export async function tryGetPublishedVehicle(
  id: string
): Promise<{ vehicle: Vehicle | null; error: boolean }> {
  try {
    return { vehicle: await getPublishedVehicle(id), error: false };
  } catch {
    return { vehicle: null, error: true };
  }
}

export async function createVehicle(input: VehicleInput): Promise<string> {
  const doc = await getAdminDb()
    .collection(COLLECTION)
    .add({
      ...input,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });
  return doc.id;
}

export async function updateVehicle(id: string, input: VehicleInput): Promise<void> {
  await getAdminDb()
    .collection(COLLECTION)
    .doc(id)
    .set(
      {
        ...input,
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true }
    );
}

export async function deleteVehicle(id: string): Promise<void> {
  await getAdminDb().collection(COLLECTION).doc(id).delete();
}
