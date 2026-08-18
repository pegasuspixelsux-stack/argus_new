"use client";

import { useMemo, useState } from "react";
import { Calculator } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const TERMS = [36, 48, 60, 72, 84];
const TERM_ITEMS = TERMS.map((months) => ({ value: String(months), label: `${months} meses` }));

const currency = new Intl.NumberFormat("es-UY", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

function toNumber(value: string): number {
  const parsed = Number(value.replace(/,/g, ""));
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : 0;
}

/** Standard amortizing-loan monthly payment formula. */
function calculateMonthlyPayment(principal: number, aprPercent: number, termMonths: number): number {
  if (principal <= 0 || termMonths <= 0) return 0;
  const monthlyRate = aprPercent / 100 / 12;
  if (monthlyRate === 0) return principal / termMonths;

  const factor = Math.pow(1 + monthlyRate, termMonths);
  return (principal * monthlyRate * factor) / (factor - 1);
}

export function FinancingCalculator() {
  const [price, setPrice] = useState("28000");
  const [downPayment, setDownPayment] = useState("3000");
  const [apr, setApr] = useState("6.5");
  const [term, setTerm] = useState("60");

  const monthlyPayment = useMemo(() => {
    const principal = Math.max(0, toNumber(price) - toNumber(downPayment));
    return calculateMonthlyPayment(principal, toNumber(apr), Number(term));
  }, [price, downPayment, apr, term]);

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center gap-2.5">
          <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Calculator className="size-4.5" />
          </div>
          <CardTitle className="text-lg">Calculadora de cuotas</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-5">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-2">
            <Label htmlFor="calc-price">Precio del vehículo</Label>
            <div className="relative">
              <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-muted-foreground">
                $
              </span>
              <Input
                id="calc-price"
                inputMode="decimal"
                value={price}
                onChange={(event) => setPrice(event.target.value)}
                className="pl-6"
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="calc-down">Anticipo</Label>
            <div className="relative">
              <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-muted-foreground">
                $
              </span>
              <Input
                id="calc-down"
                inputMode="decimal"
                value={downPayment}
                onChange={(event) => setDownPayment(event.target.value)}
                className="pl-6"
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="calc-apr">Tasa de interés anual</Label>
            <div className="relative">
              <Input
                id="calc-apr"
                inputMode="decimal"
                value={apr}
                onChange={(event) => setApr(event.target.value)}
                className="pr-7"
              />
              <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-muted-foreground">
                %
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="calc-term">Plazo del préstamo</Label>
            <Select
              items={TERM_ITEMS}
              value={term}
              onValueChange={(value) => value && setTerm(value)}
            >
              <SelectTrigger id="calc-term" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TERM_ITEMS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex flex-col items-center gap-1 rounded-xl bg-muted/60 py-6 text-center">
          <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Cuota mensual estimada
          </span>
          <span className="text-4xl font-semibold tracking-tight text-foreground">
            {currency.format(Math.round(monthlyPayment))}
            <span className="text-base font-normal text-muted-foreground">/mes</span>
          </span>
        </div>

        <p className="text-xs text-muted-foreground">
          Estimación a modo ilustrativo. La tasa y la cuota reales dependen de
          la aprobación crediticia y las condiciones del prestamista.
        </p>
      </CardContent>
    </Card>
  );
}
