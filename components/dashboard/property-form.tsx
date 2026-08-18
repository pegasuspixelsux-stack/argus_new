"use client";

import { useMemo, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Loader2, TriangleAlert } from "lucide-react";
import { toast } from "sonner";

import { createPropertyAction, updatePropertyAction } from "@/lib/actions/properties";
import { PROPERTY_TYPES } from "@/lib/property-labels";
import type { Property, PropertyInput, PropertyPhoto, PropertyType } from "@/types/property";
import { PhotoUploader } from "@/components/dashboard/photo-uploader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const STATUSES: { value: FormState["status"]; label: string }[] = [
  { value: "draft", label: "Borrador" },
  { value: "published", label: "Publicado" },
];

type NumericField =
  | "bedrooms"
  | "bathrooms"
  | "areaM2"
  | "lotAreaM2"
  | "parkingSpaces"
  | "priceDisplay"
  | "priceCompareAt";

const NUMERIC_FIELDS: NumericField[] = [
  "bedrooms",
  "bathrooms",
  "areaM2",
  "lotAreaM2",
  "parkingSpaces",
  "priceDisplay",
  "priceCompareAt",
];

interface FormState {
  title: string;
  propertyType: PropertyType | "";
  neighborhood: string;
  city: string;
  description: string;
  bedrooms: string;
  bathrooms: string;
  areaM2: string;
  lotAreaM2: string;
  yearBuilt: string;
  parkingSpaces: string;
  priceDisplay: string;
  priceCompareAt: string;
  status: "draft" | "published";
  photos: PropertyPhoto[];
}

function toFormState(property?: Property): FormState {
  if (!property) {
    return {
      title: "",
      propertyType: "",
      neighborhood: "",
      city: "",
      description: "",
      bedrooms: "",
      bathrooms: "",
      areaM2: "",
      lotAreaM2: "",
      yearBuilt: "",
      parkingSpaces: "",
      priceDisplay: "",
      priceCompareAt: "",
      status: "draft",
      photos: [],
    };
  }
  return {
    title: property.title,
    propertyType: property.propertyType,
    neighborhood: property.neighborhood,
    city: property.city,
    description: property.description,
    bedrooms: property.details.bedrooms != null ? String(property.details.bedrooms) : "",
    bathrooms: property.details.bathrooms != null ? String(property.details.bathrooms) : "",
    areaM2: property.details.areaM2 != null ? String(property.details.areaM2) : "",
    lotAreaM2: property.details.lotAreaM2 != null ? String(property.details.lotAreaM2) : "",
    yearBuilt: property.details.yearBuilt != null ? String(property.details.yearBuilt) : "",
    parkingSpaces:
      property.details.parkingSpaces != null ? String(property.details.parkingSpaces) : "",
    priceDisplay: property.priceDisplay != null ? String(property.priceDisplay) : "",
    priceCompareAt: property.priceCompareAt != null ? String(property.priceCompareAt) : "",
    status: property.status,
    photos: property.photos,
  };
}

function buildInput(form: FormState): PropertyInput {
  return {
    title: form.title.trim(),
    propertyType: (form.propertyType || "house") as PropertyType,
    neighborhood: form.neighborhood.trim(),
    city: form.city.trim(),
    description: form.description.trim(),
    details: {
      bedrooms: form.bedrooms.trim() ? Number(form.bedrooms) : null,
      bathrooms: form.bathrooms.trim() ? Number(form.bathrooms) : null,
      areaM2: form.areaM2.trim() ? Number(form.areaM2) : null,
      lotAreaM2: form.lotAreaM2.trim() ? Number(form.lotAreaM2) : null,
      yearBuilt: form.yearBuilt.trim() ? Number(form.yearBuilt) : null,
      parkingSpaces: form.parkingSpaces.trim() ? Number(form.parkingSpaces) : null,
    },
    photos: form.photos,
    priceDisplay: form.priceDisplay.trim() ? Number(form.priceDisplay) : null,
    priceCompareAt: form.priceCompareAt.trim() ? Number(form.priceCompareAt) : null,
    status: form.status,
  };
}

function validate(form: FormState): Record<string, string> {
  const errors: Record<string, string> = {};
  if (!form.title.trim()) errors.title = "El título es obligatorio.";
  if (!form.propertyType) errors.propertyType = "Selecciona un tipo de propiedad.";

  for (const field of NUMERIC_FIELDS) {
    const value = form[field];
    if (value.trim() && Number.isNaN(Number(value))) {
      errors[field] = "Debe ser un número.";
    }
  }

  if (form.yearBuilt.trim()) {
    const year = Number(form.yearBuilt);
    if (Number.isNaN(year) || year < 1800 || year > 2100) {
      errors.yearBuilt = "Ingresa un año válido.";
    }
  }

  return errors;
}

interface PropertyFormProps {
  mode: "create" | "edit";
  property?: Property;
}

export function PropertyForm({ mode, property }: PropertyFormProps) {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(() => toFormState(property));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Stable per-mount folder for photo uploads on a not-yet-created property.
  const draftId = useMemo(() => crypto.randomUUID(), []);
  const storageFolder = `properties/${property?.id ?? draftId}`;

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitError(null);

    const validationErrors = validate(form);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) {
      toast.error("Revisa los campos marcados.");
      return;
    }

    setSubmitting(true);
    try {
      const input = buildInput(form);
      if (mode === "create") {
        await createPropertyAction(input);
        toast.success("Propiedad creada.");
      } else if (property) {
        await updatePropertyAction(property.id, input);
        toast.success("Propiedad actualizada.");
      }
      router.push("/dashboard/properties");
      router.refresh();
    } catch {
      setSubmitError("Algo salió mal al guardar la propiedad. Inténtalo de nuevo.");
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      {submitError ? (
        <Alert variant="destructive">
          <TriangleAlert />
          <AlertDescription>{submitError}</AlertDescription>
        </Alert>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>Datos básicos</CardTitle>
          <CardDescription>La identidad principal de esta publicación.</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-2 sm:col-span-2">
            <Label htmlFor="title">Título</Label>
            <Input
              id="title"
              value={form.title}
              onChange={(e) => update("title", e.target.value)}
              placeholder="Casa moderna con jardín en Carrasco"
              aria-invalid={Boolean(errors.title)}
            />
            {errors.title ? <p className="text-xs text-destructive">{errors.title}</p> : null}
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="propertyType">Tipo de propiedad</Label>
            <Select
              items={PROPERTY_TYPES}
              value={form.propertyType}
              onValueChange={(value) => update("propertyType", value as PropertyType)}
            >
              <SelectTrigger
                id="propertyType"
                className="w-full"
                aria-invalid={Boolean(errors.propertyType)}
              >
                <SelectValue placeholder="Selecciona el tipo" />
              </SelectTrigger>
              <SelectContent>
                {PROPERTY_TYPES.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.propertyType ? (
              <p className="text-xs text-destructive">{errors.propertyType}</p>
            ) : null}
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="status">Estado</Label>
            <Select
              items={STATUSES}
              value={form.status}
              onValueChange={(value) => update("status", value as FormState["status"])}
            >
              <SelectTrigger id="status" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STATUSES.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="neighborhood">Barrio</Label>
            <Input
              id="neighborhood"
              value={form.neighborhood}
              onChange={(e) => update("neighborhood", e.target.value)}
              placeholder="Carrasco"
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="city">Ciudad</Label>
            <Input
              id="city"
              value={form.city}
              onChange={(e) => update("city", e.target.value)}
              placeholder="Montevideo"
            />
          </div>

          <div className="flex flex-col gap-2 sm:col-span-2">
            <Label htmlFor="description">Descripción</Label>
            <Textarea
              id="description"
              value={form.description}
              onChange={(e) => update("description", e.target.value)}
              placeholder="Propiedad luminosa, bien ubicada y con historial claro..."
              rows={5}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Detalles</CardTitle>
          <CardDescription>Datos que los compradores usan para comparar propiedades.</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="flex flex-col gap-2">
            <Label htmlFor="bedrooms">Dormitorios</Label>
            <Input
              id="bedrooms"
              inputMode="numeric"
              value={form.bedrooms}
              onChange={(e) => update("bedrooms", e.target.value)}
              placeholder="3"
              aria-invalid={Boolean(errors.bedrooms)}
            />
            {errors.bedrooms ? <p className="text-xs text-destructive">{errors.bedrooms}</p> : null}
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="bathrooms">Baños</Label>
            <Input
              id="bathrooms"
              inputMode="numeric"
              value={form.bathrooms}
              onChange={(e) => update("bathrooms", e.target.value)}
              placeholder="2"
              aria-invalid={Boolean(errors.bathrooms)}
            />
            {errors.bathrooms ? <p className="text-xs text-destructive">{errors.bathrooms}</p> : null}
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="parkingSpaces">Cocheras</Label>
            <Input
              id="parkingSpaces"
              inputMode="numeric"
              value={form.parkingSpaces}
              onChange={(e) => update("parkingSpaces", e.target.value)}
              placeholder="1"
              aria-invalid={Boolean(errors.parkingSpaces)}
            />
            {errors.parkingSpaces ? (
              <p className="text-xs text-destructive">{errors.parkingSpaces}</p>
            ) : null}
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="areaM2">Superficie (m²)</Label>
            <Input
              id="areaM2"
              inputMode="decimal"
              value={form.areaM2}
              onChange={(e) => update("areaM2", e.target.value)}
              placeholder="120"
              aria-invalid={Boolean(errors.areaM2)}
            />
            {errors.areaM2 ? <p className="text-xs text-destructive">{errors.areaM2}</p> : null}
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="lotAreaM2">Superficie del terreno (m²)</Label>
            <Input
              id="lotAreaM2"
              inputMode="decimal"
              value={form.lotAreaM2}
              onChange={(e) => update("lotAreaM2", e.target.value)}
              placeholder="300"
              aria-invalid={Boolean(errors.lotAreaM2)}
            />
            {errors.lotAreaM2 ? <p className="text-xs text-destructive">{errors.lotAreaM2}</p> : null}
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="yearBuilt">Año de construcción</Label>
            <Input
              id="yearBuilt"
              inputMode="numeric"
              value={form.yearBuilt}
              onChange={(e) => update("yearBuilt", e.target.value)}
              placeholder="2015"
              aria-invalid={Boolean(errors.yearBuilt)}
            />
            {errors.yearBuilt ? <p className="text-xs text-destructive">{errors.yearBuilt}</p> : null}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Precio</CardTitle>
          <CardDescription>
            El precio principal se muestra grande como precio destacado; el
            precio regular aparece tachado al lado.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-2">
            <Label htmlFor="priceDisplay">Precio destacado</Label>
            <div className="relative">
              <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-muted-foreground">
                $
              </span>
              <Input
                id="priceDisplay"
                inputMode="decimal"
                value={form.priceDisplay}
                onChange={(e) => update("priceDisplay", e.target.value)}
                placeholder="185.000"
                className="pl-6 text-lg font-semibold"
                aria-invalid={Boolean(errors.priceDisplay)}
              />
            </div>
            {errors.priceDisplay ? (
              <p className="text-xs text-destructive">{errors.priceDisplay}</p>
            ) : null}
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="priceCompareAt">Precio regular</Label>
            <div className="relative">
              <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-muted-foreground">
                $
              </span>
              <Input
                id="priceCompareAt"
                inputMode="decimal"
                value={form.priceCompareAt}
                onChange={(e) => update("priceCompareAt", e.target.value)}
                placeholder="199.000"
                className="pl-6"
                aria-invalid={Boolean(errors.priceCompareAt)}
              />
            </div>
            {errors.priceCompareAt ? (
              <p className="text-xs text-destructive">{errors.priceCompareAt}</p>
            ) : null}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Fotos</CardTitle>
          <CardDescription>Sube todas las fotos que quieras.</CardDescription>
        </CardHeader>
        <CardContent>
          <PhotoUploader
            photos={form.photos}
            onChange={(photos) => update("photos", photos)}
            storageFolder={storageFolder}
          />
        </CardContent>
      </Card>

      <div className="flex items-center justify-end gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/dashboard/properties")}
          disabled={submitting}
        >
          Cancelar
        </Button>
        <Button type="submit" disabled={submitting}>
          {submitting ? <Loader2 className="animate-spin" /> : null}
          {mode === "create" ? "Crear propiedad" : "Guardar cambios"}
        </Button>
      </div>
    </form>
  );
}
