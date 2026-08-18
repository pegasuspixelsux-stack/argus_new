import "server-only";

import { FieldValue, Timestamp } from "firebase-admin/firestore";

import { getAdminDb } from "@/lib/firebase/admin";
import { LISTING_TYPES, PROPERTY_TYPES } from "@/lib/property-labels";
import type { Property, PropertyInput } from "@/types/property";

const COLLECTION = "properties";
const VALID_PROPERTY_TYPES = new Set(PROPERTY_TYPES.map((t) => t.value));
const VALID_LISTING_TYPES = new Set(LISTING_TYPES.map((t) => t.value));

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function toProperty(id: string, data: any): Property {
  const toIso = (value: unknown) =>
    value instanceof Timestamp ? value.toDate().toISOString() : new Date().toISOString();

  return {
    id,
    title: data.title ?? "",
    propertyType: VALID_PROPERTY_TYPES.has(data.propertyType) ? data.propertyType : "house",
    listingType: VALID_LISTING_TYPES.has(data.listingType) ? data.listingType : "sale",
    neighborhood: data.neighborhood ?? "",
    city: data.city ?? "",
    description: data.description ?? "",
    details: {
      bedrooms: data.details?.bedrooms ?? null,
      bathrooms: data.details?.bathrooms ?? null,
      areaM2: data.details?.areaM2 ?? null,
      lotAreaM2: data.details?.lotAreaM2 ?? null,
      yearBuilt: data.details?.yearBuilt ?? null,
      parkingSpaces: data.details?.parkingSpaces ?? null,
    },
    photos: Array.isArray(data.photos) ? data.photos : [],
    priceDisplay: data.priceDisplay ?? null,
    priceCompareAt: data.priceCompareAt ?? null,
    status: data.status === "published" ? "published" : "draft",
    createdAt: toIso(data.createdAt),
    updatedAt: toIso(data.updatedAt),
  };
}

export async function listProperties(): Promise<Property[]> {
  const snapshot = await getAdminDb()
    .collection(COLLECTION)
    .orderBy("updatedAt", "desc")
    .get();
  return snapshot.docs.map((doc) => toProperty(doc.id, doc.data()));
}

export async function getProperty(id: string): Promise<Property | null> {
  const doc = await getAdminDb().collection(COLLECTION).doc(id).get();
  if (!doc.exists) return null;
  return toProperty(doc.id, doc.data());
}

export async function getPublishedProperty(id: string): Promise<Property | null> {
  const property = await getProperty(id);
  if (!property || property.status !== "published") return null;
  return property;
}

/** Most recently updated published properties, for marketing surfaces like the homepage. */
export async function listPublishedProperties(max = 4): Promise<Property[]> {
  const properties = await listProperties();
  return properties.filter((property) => property.status === "published").slice(0, max);
}

/**
 * Same as `getPublishedProperty`, but never throws — used by the public page
 * so a Firestore/config outage renders a friendly message instead of an
 * unhandled server error.
 */
export async function tryGetPublishedProperty(
  id: string
): Promise<{ property: Property | null; error: boolean }> {
  try {
    return { property: await getPublishedProperty(id), error: false };
  } catch {
    return { property: null, error: true };
  }
}

export async function createProperty(input: PropertyInput): Promise<string> {
  const doc = await getAdminDb()
    .collection(COLLECTION)
    .add({
      ...input,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });
  return doc.id;
}

export async function updateProperty(id: string, input: PropertyInput): Promise<void> {
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

export async function deleteProperty(id: string): Promise<void> {
  await getAdminDb().collection(COLLECTION).doc(id).delete();
}
