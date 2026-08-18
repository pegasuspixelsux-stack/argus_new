import type { ListingType, PropertyType } from "@/types/property";

export const PROPERTY_TYPE_LABELS: Record<PropertyType, string> = {
  condo: "Apartamento",
  house: "Casa",
  "single-family": "Casa unifamiliar",
  land: "Terreno",
};

export const PROPERTY_TYPES: { value: PropertyType; label: string }[] = [
  { value: "condo", label: PROPERTY_TYPE_LABELS.condo },
  { value: "house", label: PROPERTY_TYPE_LABELS.house },
  { value: "single-family", label: PROPERTY_TYPE_LABELS["single-family"] },
  { value: "land", label: PROPERTY_TYPE_LABELS.land },
];

export const LISTING_TYPE_LABELS: Record<ListingType, string> = {
  sale: "Venta",
  rent: "Alquiler",
};

export const LISTING_TYPES: { value: ListingType; label: string }[] = [
  { value: "sale", label: LISTING_TYPE_LABELS.sale },
  { value: "rent", label: LISTING_TYPE_LABELS.rent },
];

export const BEDROOM_OPTIONS = [
  { value: "1", label: "1+ dormitorio" },
  { value: "2", label: "2+ dormitorios" },
  { value: "3", label: "3+ dormitorios" },
  { value: "4", label: "4+ dormitorios" },
  { value: "5", label: "5+ dormitorios" },
];

// Property prices run much higher than the car-dealer ranges these replace.
export const PRICE_RANGES = [
  { value: "0-50000", label: "Menos de $50.000" },
  { value: "50000-100000", label: "$50.000 – $100.000" },
  { value: "100000-200000", label: "$100.000 – $200.000" },
  { value: "200000-400000", label: "$200.000 – $400.000" },
  { value: "400000-", label: "Más de $400.000" },
];

export function parsePriceRange(value: string): { min: number; max: number } {
  const [minRaw, maxRaw] = value.split("-");
  const min = Number(minRaw) || 0;
  const max = maxRaw ? Number(maxRaw) : Infinity;
  return { min, max };
}
