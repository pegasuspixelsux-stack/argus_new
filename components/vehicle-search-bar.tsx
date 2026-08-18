"use client";

import { useState } from "react";
import { Search } from "lucide-react";

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

const CURRENT_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: 16 }, (_, i) => String(CURRENT_YEAR + 1 - i));

const MAKES = [
  "Toyota",
  "Honda",
  "Ford",
  "Chevrolet",
  "Hyundai",
  "Nissan",
  "BMW",
  "Mercedes-Benz",
  "Volkswagen",
  "Jeep",
  "Kia",
  "Mazda",
];

const YEAR_ITEMS: Record<string, string> = Object.fromEntries(YEARS.map((y) => [y, y]));
const MAKE_ITEMS: Record<string, string> = Object.fromEntries(MAKES.map((m) => [m, m]));

const PRICE_RANGES = [
  { value: "0-10000", label: "Menos de $10.000" },
  { value: "10000-20000", label: "$10.000 – $20.000" },
  { value: "20000-30000", label: "$20.000 – $30.000" },
  { value: "30000-50000", label: "$30.000 – $50.000" },
  { value: "50000-", label: "Más de $50.000" },
];

export function VehicleSearchBar() {
  const [year, setYear] = useState("");
  const [make, setMake] = useState("");
  const [model, setModel] = useState("");
  const [price, setPrice] = useState("");

  function handleSearch() {
    const params = new URLSearchParams();
    if (year) params.set("year", year);
    if (make) params.set("make", make);
    if (model.trim()) params.set("model", model.trim());
    if (price) params.set("price", price);

    const inventory = document.getElementById("inventory");
    if (inventory) {
      const url = params.toString() ? `#inventory?${params.toString()}` : "#inventory";
      window.history.replaceState(null, "", url);
      inventory.scrollIntoView({ behavior: "smooth", block: "start" });
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
              className="grid grid-cols-2 items-end gap-4 lg:grid-cols-[1fr_1fr_1fr_1fr_auto]"
            >
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="search-year">Año</Label>
                <Select
                  items={YEAR_ITEMS}
                  value={year}
                  onValueChange={(value) => value && setYear(value)}
                >
                  <SelectTrigger id="search-year" className="w-full">
                    <SelectValue placeholder="Cualquier año" />
                  </SelectTrigger>
                  <SelectContent>
                    {YEARS.map((y) => (
                      <SelectItem key={y} value={y}>
                        {y}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="search-make">Marca</Label>
                <Select
                  items={MAKE_ITEMS}
                  value={make}
                  onValueChange={(value) => value && setMake(value)}
                >
                  <SelectTrigger id="search-make" className="w-full">
                    <SelectValue placeholder="Cualquier marca" />
                  </SelectTrigger>
                  <SelectContent>
                    {MAKES.map((m) => (
                      <SelectItem key={m} value={m}>
                        {m}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="search-model">Modelo</Label>
                <Input
                  id="search-model"
                  value={model}
                  onChange={(event) => setModel(event.target.value)}
                  placeholder="Cualquier modelo"
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
