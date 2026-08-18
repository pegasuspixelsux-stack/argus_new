"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";

import type { Vehicle } from "@/types/vehicle";
import { VehicleCard } from "@/components/vehicle-card";
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

const PRICE_RANGES = [
  { value: "0-10000", label: "Menos de $10.000" },
  { value: "10000-20000", label: "$10.000 – $20.000" },
  { value: "20000-30000", label: "$20.000 – $30.000" },
  { value: "30000-50000", label: "$30.000 – $50.000" },
  { value: "50000-", label: "Más de $50.000" },
];

function parsePriceRange(value: string): { min: number; max: number } {
  const [minRaw, maxRaw] = value.split("-");
  const min = Number(minRaw) || 0;
  const max = maxRaw ? Number(maxRaw) : Infinity;
  return { min, max };
}

export function InventoryView({ vehicles }: { vehicles: Vehicle[] }) {
  const [year, setYear] = useState("");
  const [make, setMake] = useState("");
  const [model, setModel] = useState("");
  const [price, setPrice] = useState("");

  const years = useMemo(
    () => Array.from(new Set(vehicles.map((v) => String(v.year)))).sort((a, b) => Number(b) - Number(a)),
    [vehicles]
  );
  const makes = useMemo(
    () => Array.from(new Set(vehicles.map((v) => v.make))).sort((a, b) => a.localeCompare(b)),
    [vehicles]
  );

  const yearItems = useMemo(() => Object.fromEntries(years.map((y) => [y, y])), [years]);
  const makeItems = useMemo(() => Object.fromEntries(makes.map((m) => [m, m])), [makes]);

  const filtered = useMemo(() => {
    return vehicles.filter((vehicle) => {
      if (year && String(vehicle.year) !== year) return false;
      if (make && vehicle.make !== make) return false;
      if (model.trim() && !vehicle.model.toLowerCase().includes(model.trim().toLowerCase())) return false;
      if (price) {
        const { min, max } = parsePriceRange(price);
        const vehiclePrice = vehicle.priceDisplay;
        if (vehiclePrice == null || vehiclePrice < min || vehiclePrice > max) return false;
      }
      return true;
    });
  }, [vehicles, year, make, model, price]);

  function clearFilters() {
    setYear("");
    setMake("");
    setModel("");
    setPrice("");
  }

  const hasActiveFilters = Boolean(year || make || model || price);

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-[260px_1fr]">
      <aside className="lg:sticky lg:top-24 lg:self-start">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Filtros</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="filter-year">Año</Label>
              <Select items={yearItems} value={year} onValueChange={(value) => setYear(value ?? "")}>
                <SelectTrigger id="filter-year" className="w-full">
                  <SelectValue placeholder="Cualquier año" />
                </SelectTrigger>
                <SelectContent>
                  {years.map((y) => (
                    <SelectItem key={y} value={y}>
                      {y}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="filter-make">Marca</Label>
              <Select items={makeItems} value={make} onValueChange={(value) => setMake(value ?? "")}>
                <SelectTrigger id="filter-make" className="w-full">
                  <SelectValue placeholder="Cualquier marca" />
                </SelectTrigger>
                <SelectContent>
                  {makes.map((m) => (
                    <SelectItem key={m} value={m}>
                      {m}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="filter-model">Modelo</Label>
              <Input
                id="filter-model"
                value={model}
                onChange={(event) => setModel(event.target.value)}
                placeholder="Cualquier modelo"
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
            {filtered.map((vehicle) => (
              <VehicleCard key={vehicle.id} vehicle={vehicle} layout="horizontal" />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed border-border py-24 text-center">
            <Search className="size-6 text-muted-foreground" />
            <p className="font-medium text-foreground">No encontramos vehículos con esos filtros</p>
            <p className="text-sm text-muted-foreground">Prueba ajustar o limpiar los filtros.</p>
          </div>
        )}
      </div>
    </div>
  );
}
