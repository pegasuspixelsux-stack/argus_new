export type VehicleStatus = "draft" | "published";

export type Transmission = "automatic" | "manual" | "cvt" | "dual-clutch";

export type FuelType = "gasoline" | "diesel" | "hybrid" | "electric" | "plug-in-hybrid";

export interface VehiclePhoto {
  url: string;
  path: string;
}

export interface VehicleSpecs {
  mileage: number | null;
  transmission: Transmission | null;
  fuelType: FuelType | null;
  exteriorColor: string;
  interiorColor: string;
  bodyType: string;
  vin: string;
}

export interface Vehicle {
  id: string;
  make: string;
  model: string;
  year: number;
  description: string;
  specs: VehicleSpecs;
  photos: VehiclePhoto[];
  /** Large, primary display price shown to buyers. */
  priceDisplay: number | null;
  /** Regular / "compare at" price, shown struck through next to the display price. */
  priceCompareAt: number | null;
  status: VehicleStatus;
  createdAt: string;
  updatedAt: string;
}

/** Shape produced by the vehicle form before it is persisted. */
export type VehicleInput = Omit<Vehicle, "id" | "createdAt" | "updatedAt">;

export interface VehicleLead {
  id: string;
  vehicleId: string;
  vehicleTitle: string;
  name: string;
  email: string;
  message: string;
  createdAt: string;
}
