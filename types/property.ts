export type PropertyStatus = "draft" | "published";

export type PropertyType = "condo" | "house" | "single-family" | "land";

export type ListingType = "sale" | "rent";

export interface PropertyPhoto {
  url: string;
  path: string;
}

export interface PropertyDetails {
  bedrooms: number | null;
  bathrooms: number | null;
  areaM2: number | null;
  lotAreaM2: number | null;
  yearBuilt: number | null;
  parkingSpaces: number | null;
}

export interface Property {
  id: string;
  title: string;
  propertyType: PropertyType;
  listingType: ListingType;
  neighborhood: string;
  city: string;
  description: string;
  details: PropertyDetails;
  photos: PropertyPhoto[];
  /** Marks this property for the homepage's "Propiedades Destacadas" section. */
  featured: boolean;
  /** Large, primary display price shown to buyers. */
  priceDisplay: number | null;
  /** Regular / "compare at" price, shown struck through next to the display price. */
  priceCompareAt: number | null;
  status: PropertyStatus;
  createdAt: string;
  updatedAt: string;
}

/** Shape produced by the property form before it is persisted. */
export type PropertyInput = Omit<Property, "id" | "createdAt" | "updatedAt">;

export interface PropertyLead {
  id: string;
  propertyId: string;
  propertyTitle: string;
  name: string;
  email: string;
  message: string;
  createdAt: string;
}
