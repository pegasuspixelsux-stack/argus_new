"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";

import type { Property } from "@/types/property";
import {
  BEDROOM_OPTIONS,
  parsePriceRange,
  PRICE_RANGES,
  PROPERTY_TYPES,
} from "@/lib/property-labels";
import { PropertyCard } from "@/components/property-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const PROPERTY_TYPE_ITEMS: Record<string, string> = Object.fromEntries(
  PROPERTY_TYPES.map((option) => [option.value, option.label])
);
const BEDROOM_ITEMS: Record<string, string> = Object.fromEntries(
  BEDROOM_OPTIONS.map((option) => [option.value, option.label])
);

export function ListingsView({ properties }: { properties: Property[] }) {
  const [propertyType, setPropertyType] = useState("");
  const [bedrooms, setBedrooms] = useState("");
  const [neighborhood, setNeighborhood] = useState("");
  const [price, setPrice] = useState("");

  const filtered = useMemo(() => {
    return properties.filter((property) => {
      if (propertyType && property.propertyType !== propertyType) return false;
      if (bedrooms) {
        const min = Number(bedrooms);
        if (property.details.bedrooms == null || property.details.bedrooms < min) return false;
      }
      if (
        neighborhood.trim() &&
        !property.neighborhood.toLowerCase().includes(neighborhood.trim().toLowerCase())
      ) {
        return false;
      }
      if (price) {
        const { min, max } = parsePriceRange(price);
        const propertyPrice = property.priceDisplay;
        if (propertyPrice == null || propertyPrice < min || propertyPrice > max) return false;
      }
      return true;
    });
  }, [properties, propertyType, bedrooms, neighborhood, price]);

  function clearFilters() {
    setPropertyType("");
    setBedrooms("");
    setNeighborhood("");
    setPrice("");
  }

  const hasActiveFilters = Boolean(propertyType || bedrooms || neighborhood || price);

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-[260px_1fr]">
      <aside className="lg:sticky lg:top-24 lg:self-start">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Filtros</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="filter-property-type">Tipo de propiedad</Label>
              <Select
                items={PROPERTY_TYPE_ITEMS}
                value={propertyType}
                onValueChange={(value) => setPropertyType(value ?? "")}
              >
                <SelectTrigger id="filter-property-type" className="w-full">
                  <SelectValue placeholder="Cualquier tipo" />
                </SelectTrigger>
                <SelectContent>
                  {PROPERTY_TYPES.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="filter-bedrooms">Dormitorios</Label>
              <Select
                items={BEDROOM_ITEMS}
                value={bedrooms}
                onValueChange={(value) => setBedrooms(value ?? "")}
              >
                <SelectTrigger id="filter-bedrooms" className="w-full">
                  <SelectValue placeholder="Cualquier cantidad" />
                </SelectTrigger>
                <SelectContent>
                  {BEDROOM_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="filter-neighborhood">Barrio o zona</Label>
              <Input
                id="filter-neighborhood"
                value={neighborhood}
                onChange={(event) => setNeighborhood(event.target.value)}
                placeholder="Cualquier zona"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="filter-price">Precio</Label>
              <Select items={PRICE_RANGES} value={price} onValueChange={(value) => setPrice(value ?? "")}>
                <SelectTrigger id="filter-price" className="w-full">
                  <SelectValue placeholder="Cualquier precio" />
                </SelectTrigger>
                <SelectContent>
                  {PRICE_RANGES.map((range) => (
                    <SelectItem key={range.value} value={range.value}>
                      {range.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {hasActiveFilters ? (
              <Button type="button" variant="outline" size="sm" onClick={clearFilters}>
                Limpiar filtros
              </Button>
            ) : null}
          </CardContent>
        </Card>
      </aside>

      <div>
        {filtered.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((property) => (
              <PropertyCard key={property.id} property={property} layout="horizontal" />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed border-border py-24 text-center">
            <Search className="size-6 text-muted-foreground" />
            <p className="font-medium text-foreground">No encontramos propiedades con esos filtros</p>
            <p className="text-sm text-muted-foreground">Prueba ajustar o limpiar los filtros.</p>
          </div>
        )}
      </div>
    </div>
  );
}
