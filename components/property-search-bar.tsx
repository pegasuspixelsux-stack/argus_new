"use client";

import { useState } from "react";
import { Search } from "lucide-react";

import { BEDROOM_OPTIONS, LISTING_TYPES, PRICE_RANGES, PROPERTY_TYPES } from "@/lib/property-labels";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollReveal } from "@/components/scroll-reveal";
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

const LISTING_TYPE_ITEMS: Record<string, string> = Object.fromEntries(
  LISTING_TYPES.map((option) => [option.value, option.label])
);
const PROPERTY_TYPE_ITEMS: Record<string, string> = Object.fromEntries(
  PROPERTY_TYPES.map((option) => [option.value, option.label])
);
const BEDROOM_ITEMS: Record<string, string> = Object.fromEntries(
  BEDROOM_OPTIONS.map((option) => [option.value, option.label])
);

export function PropertySearchBar() {
  const [listingType, setListingType] = useState("");
  const [propertyType, setPropertyType] = useState("");
  const [bedrooms, setBedrooms] = useState("");
  const [neighborhood, setNeighborhood] = useState("");
  const [price, setPrice] = useState("");

  function handleSearch() {
    const params = new URLSearchParams();
    if (listingType) params.set("listingType", listingType);
    if (propertyType) params.set("propertyType", propertyType);
    if (bedrooms) params.set("bedrooms", bedrooms);
    if (neighborhood.trim()) params.set("neighborhood", neighborhood.trim());
    if (price) params.set("price", price);

    const listings = document.getElementById("listings");
    if (listings) {
      const url = params.toString() ? `#listings?${params.toString()}` : "#listings";
      window.history.replaceState(null, "", url);
      listings.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  return (
    <section className="relative z-10 -mt-8 px-4 sm:-mt-10 sm:px-6 lg:px-8">
      <ScrollReveal>
        <Card className="mx-auto max-w-6xl shadow-lg ring-border/60">
          <CardContent>
            <form
              onSubmit={(event) => {
                event.preventDefault();
                handleSearch();
              }}
              className="grid grid-cols-2 items-end gap-4 lg:grid-cols-[1fr_1fr_1fr_1fr_1fr_auto]"
            >
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="search-listing-type">Operación</Label>
                <Select
                  items={LISTING_TYPE_ITEMS}
                  value={listingType}
                  onValueChange={(value) => value && setListingType(value)}
                >
                  <SelectTrigger id="search-listing-type" className="w-full">
                    <SelectValue placeholder="Comprar o alquilar" />
                  </SelectTrigger>
                  <SelectContent>
                    {LISTING_TYPES.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="search-property-type">Tipo de propiedad</Label>
                <Select
                  items={PROPERTY_TYPE_ITEMS}
                  value={propertyType}
                  onValueChange={(value) => value && setPropertyType(value)}
                >
                  <SelectTrigger id="search-property-type" className="w-full">
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
                <Label htmlFor="search-bedrooms">Dormitorios</Label>
                <Select
                  items={BEDROOM_ITEMS}
                  value={bedrooms}
                  onValueChange={(value) => value && setBedrooms(value)}
                >
                  <SelectTrigger id="search-bedrooms" className="w-full">
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
                <Label htmlFor="search-neighborhood">Barrio o zona</Label>
                <Input
                  id="search-neighborhood"
                  value={neighborhood}
                  onChange={(event) => setNeighborhood(event.target.value)}
                  placeholder="Cualquier zona"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="search-price">Precio</Label>
                <Select
                  items={PRICE_RANGES}
                  value={price}
                  onValueChange={(value) => value && setPrice(value)}
                >
                  <SelectTrigger id="search-price" className="w-full">
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

              <Button type="submit" size="lg" className="col-span-2 w-full lg:col-span-1 lg:w-auto">
                <Search />
                Buscar
              </Button>
            </form>
          </CardContent>
        </Card>
      </ScrollReveal>
    </section>
  );
}
