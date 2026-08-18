# Real Estate Pivot (Data Model + Homepage) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace every car-dealership concept in the "Argus" (formerly "Dealio") Next.js/Firebase app with its real estate equivalent — data model, dashboard CRUD, lead capture, and homepage — while keeping the existing design system and architecture untouched.

**Architecture:** Strangler-fig migration. New `Property`-domain files are created alongside the old `Vehicle`-domain files; consumers are cut over one vertical slice at a time (dashboard CRUD → public detail page + leads → homepage listings → homepage copy → financing → trade-in/cleanup), so the app builds successfully after every task. Old vehicle-only files are deleted only once nothing imports them anymore.

**Tech Stack:** Next.js 16 (App Router), TypeScript, Firebase (Firestore + Storage + Auth via `firebase-admin`/`firebase` client SDK), Tailwind, shadcn/ui-style components in `components/ui/`, `sonner` for toasts, `lucide-react` icons.

**Spec:** `docs/superpowers/specs/2026-08-17-real-estate-pivot-design.md`

## Global Constraints

- Language stays Spanish (`es-UY`); currency stays USD via `new Intl.NumberFormat("es-UY", { style: "currency", currency: "USD", maximumFractionDigits: 0 })` — reuse this exact formatter wherever a price is displayed.
- Brand is "Argus" (replaces "Dealio" everywhere: wordmark, page titles, footer copyright/tagline, contact email `hello@argus.app`).
- **No automated test framework exists in this repo** (no test files, no test script in `package.json`) — per the approved spec, verification for every task is `npm run build`, `npm run lint`, and the manual smoke checks in Task 9. Do not add a test framework as part of this plan.
- Property size fields use square meters (m²).
- Sale listings only — no rental/lease concept.
- Firebase project is already linked: `argus-new-e1c32` (`.firebaserc`, `firebase.json`, `.env.local` already point at it). Firestore collection renames `vehicles` → `properties`; `firestore.rules`/`storage.rules` must be redeployed after editing: `firebase deploy --only firestore:rules,storage --project argus-new-e1c32`.
- Trade-in feature is removed entirely (`trade-in-section.tsx`, `trade-in-form.tsx`, `lib/data/trade-ins.ts`, `lib/actions/trade-ins.ts`, `tradeInLeads` Firestore collection/rules).
- Financing section is kept, repurposed into a mortgage/down-payment simulator — same amortization formula, term options in years (15/20/25/30) instead of months.
- Follow existing conventions exactly: `"use client"` / `"use server"` directives, `@/` path aliases, existing `components/ui/*` imports, existing `Select` `items` prop convention — an array of `{ value, label }` passed directly in dashboard forms (per `vehicle-form.tsx`), a `Record<string,string>` built via `Object.fromEntries` in public search/filter bars (per `vehicle-search-bar.tsx`/`inventory-view.tsx`).
- Windows/PowerShell environment — git commands shown use forward-slash paths and work the same in the Bash tool already used in this session.

---

## Task 1: Property domain foundation (types, shared labels, data, actions)

Purely additive — nothing imports these files yet, so this task changes zero existing behavior.

**Files:**
- Create: `types/property.ts`
- Create: `lib/property-labels.ts`
- Create: `lib/data/properties.ts`
- Create: `lib/actions/properties.ts`

**Interfaces:**
- Produces: `Property`, `PropertyInput`, `PropertyPhoto`, `PropertyDetails`, `PropertyStatus`, `PropertyType`, `PropertyLead` (all from `types/property.ts`); `PROPERTY_TYPE_LABELS: Record<PropertyType,string>`, `PROPERTY_TYPES: {value,label}[]`, `BEDROOM_OPTIONS: {value,label}[]`, `PRICE_RANGES: {value,label}[]`, `parsePriceRange(value: string): {min,max}` (from `lib/property-labels.ts`); `listProperties(): Promise<Property[]>`, `getProperty(id): Promise<Property|null>`, `getPublishedProperty(id)`, `listPublishedProperties(max=4)`, `tryGetPublishedProperty(id): Promise<{property, error}>`, `createProperty(input): Promise<string>`, `updateProperty(id, input): Promise<void>`, `deleteProperty(id): Promise<void>` (from `lib/data/properties.ts`); `createPropertyAction(input): Promise<{id}>`, `updatePropertyAction(id, input): Promise<void>`, `deletePropertyAction(id): Promise<void>` (from `lib/actions/properties.ts`).

- [ ] **Step 1: Create `types/property.ts`**

```ts
export type PropertyStatus = "draft" | "published";

export type PropertyType = "condo" | "house" | "single-family" | "land";

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
  neighborhood: string;
  city: string;
  description: string;
  details: PropertyDetails;
  photos: PropertyPhoto[];
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
```

- [ ] **Step 2: Create `lib/property-labels.ts`**

```ts
import type { PropertyType } from "@/types/property";

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

export const BEDROOM_OPTIONS = [
  { value: "1", label: "1 dormitorio" },
  { value: "2", label: "2 dormitorios" },
  { value: "3", label: "3 dormitorios" },
  { value: "4", label: "4 dormitorios" },
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
```

- [ ] **Step 3: Create `lib/data/properties.ts`**

```ts
import "server-only";

import { FieldValue, Timestamp } from "firebase-admin/firestore";

import { getAdminDb } from "@/lib/firebase/admin";
import type { Property, PropertyInput } from "@/types/property";

const COLLECTION = "properties";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function toProperty(id: string, data: any): Property {
  const toIso = (value: unknown) =>
    value instanceof Timestamp ? value.toDate().toISOString() : new Date().toISOString();

  return {
    id,
    title: data.title ?? "",
    propertyType: data.propertyType ?? "house",
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
```

- [ ] **Step 4: Create `lib/actions/properties.ts`**

```ts
"use server";

import { revalidatePath } from "next/cache";

import { requireSession } from "@/lib/auth/session";
import { createProperty, deleteProperty, updateProperty } from "@/lib/data/properties";
import type { PropertyInput } from "@/types/property";

export async function createPropertyAction(input: PropertyInput): Promise<{ id: string }> {
  await requireSession();
  const id = await createProperty(input);
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/properties");
  revalidatePath(`/properties/${id}`);
  return { id };
}

export async function updatePropertyAction(id: string, input: PropertyInput): Promise<void> {
  await requireSession();
  await updateProperty(id, input);
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/properties");
  revalidatePath(`/dashboard/properties/${id}/edit`);
  revalidatePath(`/properties/${id}`);
}

export async function deletePropertyAction(id: string): Promise<void> {
  await requireSession();
  await deleteProperty(id);
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/properties");
}
```

- [ ] **Step 5: Verify the build**

Run: `npm run build`
Expected: succeeds (these files are additive; nothing imports them yet).

Run: `npm run lint`
Expected: no errors.

- [ ] **Step 6: Commit**

```bash
git add types/property.ts lib/property-labels.ts lib/data/properties.ts lib/actions/properties.ts
git commit -m "feat: add property domain types, data layer, and actions

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

## Task 2: Brand rename — Dealio → Argus

Chrome-only change, independent of the property/vehicle domain rename.

**Files:**
- Modify: `components/logo.tsx`
- Modify: `components/site-footer.tsx`
- Modify: `components/contact-section.tsx`
- Modify: `app/layout.tsx`
- Modify: `package.json`

**Interfaces:** none (presentational text only).

- [ ] **Step 1: Rename the wordmark in `components/logo.tsx`**

Change line 35 from:
```tsx
      <span className={cn("text-base text-foreground", textClassName)}>Dealio</span>
```
to:
```tsx
      <span className={cn("text-base text-foreground", textClassName)}>Argus</span>
```

- [ ] **Step 2: Update `components/site-footer.tsx`**

Change the tagline paragraph:
```tsx
            <p className="max-w-xs text-sm text-white/60">
              Compra, venta y financiación de vehículos, todo en un mismo
              lugar.
            </p>
```
to:
```tsx
            <p className="max-w-xs text-sm text-white/60">
              Compra, venta y financiación de propiedades, todo en un mismo
              lugar.
            </p>
```

Change the mail social link:
```tsx
  { label: "Correo", href: "mailto:hello@dealio.app", icon: Mail },
```
to:
```tsx
  { label: "Correo", href: "mailto:hello@argus.app", icon: Mail },
```

Change the copyright line:
```tsx
          <p>&copy; {new Date().getFullYear()} Dealio. Todos los derechos reservados.</p>
```
to:
```tsx
          <p>&copy; {new Date().getFullYear()} Argus. Todos los derechos reservados.</p>
```

- [ ] **Step 3: Update the contact email in `components/contact-section.tsx`**

Change:
```tsx
  { icon: Mail, label: "Correo", value: "hello@dealio.app", href: "mailto:hello@dealio.app" },
```
to:
```tsx
  { icon: Mail, label: "Correo", value: "hello@argus.app", href: "mailto:hello@argus.app" },
```

- [ ] **Step 4: Update `app/layout.tsx` metadata**

Change:
```tsx
export const metadata: Metadata = {
  title: "Dealio — Compra, venta y financiación de vehículos",
  description:
    "Encuentra tu próximo vehículo en Dealio: stock actualizado, financiación y tasación de tu usado en Uruguay.",
};
```
to:
```tsx
export const metadata: Metadata = {
  title: "Argus — Compra, venta y financiación de propiedades",
  description:
    "Encuentra tu próxima propiedad en Argus: catálogo actualizado, financiación hipotecaria y atención personalizada en Uruguay.",
};
```

- [ ] **Step 5: Rename the package in `package.json`**

Change:
```json
  "name": "dealio_new",
```
to:
```json
  "name": "argus_new",
```

- [ ] **Step 6: Verify the build**

Run: `npm run build`
Expected: succeeds.

Run: `npm run lint`
Expected: no errors.

- [ ] **Step 7: Commit**

```bash
git add components/logo.tsx components/site-footer.tsx components/contact-section.tsx app/layout.tsx package.json
git commit -m "rebrand: Dealio -> Argus across chrome, metadata, and contact info

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

## Task 3: Dashboard property management cutover

Replaces the vehicle CRUD dashboard surface with the property equivalent.

**Files:**
- Modify: `components/dashboard/status-badge.tsx`
- Modify: `components/dashboard/photo-uploader.tsx`
- Create: `components/dashboard/property-form.tsx`
- Create: `components/dashboard/property-table.tsx`
- Modify: `components/dashboard/dashboard-nav-items.ts`
- Create: `app/dashboard/properties/page.tsx`
- Create: `app/dashboard/properties/new/page.tsx`
- Create: `app/dashboard/properties/[id]/edit/page.tsx`
- Delete: `components/dashboard/vehicle-form.tsx`
- Delete: `components/dashboard/vehicle-table.tsx`
- Delete: `app/dashboard/vehicles/page.tsx`
- Delete: `app/dashboard/vehicles/new/page.tsx`
- Delete: `app/dashboard/vehicles/[id]/edit/page.tsx`

**Interfaces:**
- Consumes: `Property`, `PropertyInput`, `PropertyPhoto`, `PropertyStatus`, `PropertyType` (Task 1's `types/property.ts`); `PROPERTY_TYPES` (Task 1's `lib/property-labels.ts`); `createPropertyAction`, `updatePropertyAction`, `deletePropertyAction` (Task 1's `lib/actions/properties.ts`); `listProperties`, `getProperty` (Task 1's `lib/data/properties.ts`).
- Produces: `PropertyForm({ mode, property })`, `PropertyTable({ properties })`, `StatusBadge({ status }: { status: PropertyStatus })` — the same component names later tasks (none, this is a leaf UI slice) would reference if they needed to.

- [ ] **Step 1: Modify `components/dashboard/status-badge.tsx`**

```tsx
import { Badge } from "@/components/ui/badge";
import type { PropertyStatus } from "@/types/property";

export function StatusBadge({ status }: { status: PropertyStatus }) {
  if (status === "published") {
    return (
      <Badge className="border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-400">
        Publicado
      </Badge>
    );
  }
  return <Badge variant="secondary">Borrador</Badge>;
}
```

- [ ] **Step 2: Modify `components/dashboard/photo-uploader.tsx`**

Change the type import:
```tsx
import type { VehiclePhoto } from "@/types/vehicle";
```
to:
```tsx
import type { PropertyPhoto } from "@/types/property";
```

Replace every occurrence of `VehiclePhoto` in this file with `PropertyPhoto` (the `UploadingItem` interface is unaffected; only the `photos`/`onChange` prop types and the `handleRemove`/`handleMakeCover` parameter types use it).

Update the doc comment above `storageFolder`:
```tsx
  /** Storage folder these photos live under, e.g. `vehicles/<id>`. */
```
to:
```tsx
  /** Storage folder these photos live under, e.g. `properties/<id>`. */
```

Update the helper caption at the bottom of the component:
```tsx
        La primera foto se usa como portada en todos lados donde se muestra el
        vehículo. Pasa el mouse sobre una foto para usarla como portada o
        quitarla. Las fotos se redimensionan en tu navegador y tienen un
        límite de 5MB cada una.
```
to:
```tsx
        La primera foto se usa como portada en todos lados donde se muestra la
        propiedad. Pasa el mouse sobre una foto para usarla como portada o
        quitarla. Las fotos se redimensionan en tu navegador y tienen un
        límite de 5MB cada una.
```

- [ ] **Step 3: Create `components/dashboard/property-form.tsx`**

```tsx
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
```

- [ ] **Step 4: Create `components/dashboard/property-table.tsx`**

```tsx
"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MoreHorizontal, Pencil, ExternalLink, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { deletePropertyAction } from "@/lib/actions/properties";
import { PROPERTY_TYPE_LABELS } from "@/lib/property-labels";
import type { Property } from "@/types/property";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const currency = new Intl.NumberFormat("es-UY", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

export function PropertyTable({ properties }: { properties: Property[] }) {
  const router = useRouter();
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [isDeleting, startDeleteTransition] = useTransition();

  function handleDelete(id: string) {
    startDeleteTransition(async () => {
      try {
        await deletePropertyAction(id);
        toast.success("Propiedad eliminada.");
        router.refresh();
      } catch {
        toast.error("No pudimos eliminar la propiedad. Inténtalo de nuevo.");
      } finally {
        setPendingDeleteId(null);
      }
    });
  }

  if (properties.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed border-border py-16 text-center">
        <p className="font-medium text-foreground">Todavía no hay propiedades</p>
        <p className="text-sm text-muted-foreground">
          Agrega tu primera propiedad para empezar a armar tu catálogo.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-lg border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Propiedad</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Precio</TableHead>
              <TableHead>Actualizado</TableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {properties.map((property) => (
              <TableRow key={property.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-md bg-muted">
                      {property.photos[0] ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={property.photos[0].url}
                          alt=""
                          className="size-full object-cover"
                        />
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </div>
                    <div>
                      <Link
                        href={`/dashboard/properties/${property.id}/edit`}
                        className="font-medium text-foreground hover:underline"
                      >
                        {property.title}
                      </Link>
                      <p className="text-xs text-muted-foreground">
                        {PROPERTY_TYPE_LABELS[property.propertyType]}
                        {property.neighborhood ? ` · ${property.neighborhood}` : ""}
                      </p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <StatusBadge status={property.status} />
                </TableCell>
                <TableCell className="text-sm text-foreground">
                  {property.priceDisplay != null ? currency.format(property.priceDisplay) : "—"}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {new Date(property.updatedAt).toLocaleDateString("es-UY")}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger
                      render={<Button variant="ghost" size="icon-sm" />}
                    >
                      <MoreHorizontal />
                      <span className="sr-only">Acciones</span>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        render={<Link href={`/dashboard/properties/${property.id}/edit`} />}
                      >
                        <Pencil />
                        Editar
                      </DropdownMenuItem>
                      {property.status === "published" ? (
                        <DropdownMenuItem
                          render={<Link href={`/properties/${property.id}`} target="_blank" />}
                        >
                          <ExternalLink />
                          Ver página pública
                        </DropdownMenuItem>
                      ) : null}
                      <DropdownMenuItem
                        variant="destructive"
                        onClick={() => setPendingDeleteId(property.id)}
                      >
                        <Trash2 />
                        Eliminar
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <AlertDialog
        open={pendingDeleteId !== null}
        onOpenChange={(open) => !open && setPendingDeleteId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar esta propiedad?</AlertDialogTitle>
            <AlertDialogDescription>
              Esto elimina de forma permanente la publicación y sus fotos de
              tu catálogo. Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => pendingDeleteId && handleDelete(pendingDeleteId)}
              disabled={isDeleting}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              {isDeleting ? <Loader2 className="animate-spin" /> : null}
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
```

- [ ] **Step 5: Modify `components/dashboard/dashboard-nav-items.ts`**

```ts
import { Building2, Inbox, LayoutDashboard, Users } from "lucide-react";

export const MAIN_NAV_ITEMS = [
  {
    label: "Inicio",
    href: "/dashboard",
    icon: LayoutDashboard,
    match: (path: string) => path === "/dashboard",
  },
  {
    label: "Propiedades",
    href: "/dashboard/properties",
    icon: Building2,
    match: (path: string) => path.startsWith("/dashboard/properties"),
  },
  {
    label: "Leads",
    href: "/dashboard/leads",
    icon: Inbox,
    match: (path: string) => path.startsWith("/dashboard/leads"),
  },
  {
    label: "Usuarios",
    href: "/dashboard/users",
    icon: Users,
    match: (path: string) => path.startsWith("/dashboard/users"),
  },
];
```

- [ ] **Step 6: Create `app/dashboard/properties/page.tsx`**

```tsx
import Link from "next/link";
import type { Metadata } from "next";
import { Plus, TriangleAlert } from "lucide-react";

import { listProperties } from "@/lib/data/properties";
import { PropertyTable } from "@/components/dashboard/property-table";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export const metadata: Metadata = { title: "Propiedades — Argus" };
export const dynamic = "force-dynamic";

export default async function PropertiesPage() {
  let properties: Awaited<ReturnType<typeof listProperties>> = [];
  let loadError: string | null = null;

  try {
    properties = await listProperties();
  } catch {
    loadError = "No pudimos cargar tu catálogo de propiedades. Recarga la página.";
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Catálogo de propiedades
          </h1>
          <p className="text-sm text-muted-foreground">
            {properties.length} propiedad{properties.length === 1 ? "" : "es"} en tu
            catálogo
          </p>
        </div>
        <Button nativeButton={false} render={<Link href="/dashboard/properties/new" />}>
          <Plus />
          Agregar propiedad
        </Button>
      </div>

      {loadError ? (
        <Alert variant="destructive">
          <TriangleAlert />
          <AlertTitle>Algo salió mal</AlertTitle>
          <AlertDescription>{loadError}</AlertDescription>
        </Alert>
      ) : (
        <PropertyTable properties={properties} />
      )}
    </div>
  );
}
```

- [ ] **Step 7: Create `app/dashboard/properties/new/page.tsx`**

```tsx
import type { Metadata } from "next";

import { PropertyForm } from "@/components/dashboard/property-form";

export const metadata: Metadata = { title: "Agregar propiedad — Argus" };

export default function NewPropertyPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Agregar propiedad
        </h1>
        <p className="text-sm text-muted-foreground">
          Completa los datos y publica cuando esté lista para salir en vivo.
        </p>
      </div>
      <PropertyForm mode="create" />
    </div>
  );
}
```

- [ ] **Step 8: Create `app/dashboard/properties/[id]/edit/page.tsx`**

```tsx
import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { getProperty } from "@/lib/data/properties";
import { PropertyForm } from "@/components/dashboard/property-form";

export const metadata: Metadata = { title: "Editar propiedad — Argus" };

export default async function EditPropertyPage({
  params,
}: PageProps<"/dashboard/properties/[id]/edit">) {
  const { id } = await params;
  const property = await getProperty(id);
  if (!property) notFound();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          {property.title}
        </h1>
        <p className="text-sm text-muted-foreground">Actualiza los datos de esta publicación.</p>
      </div>
      <PropertyForm mode="edit" property={property} />
    </div>
  );
}
```

- [ ] **Step 9: Delete the old vehicle dashboard files**

```bash
git rm components/dashboard/vehicle-form.tsx components/dashboard/vehicle-table.tsx
git rm app/dashboard/vehicles/page.tsx app/dashboard/vehicles/new/page.tsx "app/dashboard/vehicles/[id]/edit/page.tsx"
```

(These are now fully superseded — nothing links to `/dashboard/vehicles` anymore after this task; `lib/data/vehicles.ts`/`lib/actions/vehicles.ts` are left in place since `app/dashboard/page.tsx` and the public inventory pages still use them until Task 4/5/8.)

- [ ] **Step 10: Verify the build**

Run: `npm run build`
Expected: succeeds — `app/dashboard/vehicles/**` is gone, `app/dashboard/properties/**` compiles, `app/dashboard/page.tsx` and `app/inventory/page.tsx`/`app/vehicles/[id]/page.tsx` still compile unchanged against the still-present `lib/data/vehicles.ts`.

Run: `npm run lint`
Expected: no errors.

- [ ] **Step 11: Commit**

```bash
git add -A
git commit -m "feat: cut dashboard property CRUD over from vehicles

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

## Task 4: Public property page, lead capture, and dashboard leads/overview cutover

Renames the `Lead` entity's fields from vehicle to property terms and migrates every consumer of it in one pass (the public lead form, the public property detail page, the dashboard leads list, and the dashboard overview page) so nothing is left with a stale `vehicleId`/`vehicleTitle` reference.

**Files:**
- Modify: `lib/data/leads.ts`
- Modify: `lib/actions/leads.ts`
- Create: `components/property/lead-form.tsx`
- Create: `components/property/photo-gallery.tsx`
- Create: `components/property/price-display.tsx`
- Create: `components/property/whatsapp-button.tsx`
- Create: `app/properties/[id]/page.tsx`
- Modify: `components/dashboard/leads-view.tsx`
- Modify: `app/dashboard/leads/page.tsx`
- Modify: `app/dashboard/page.tsx`
- Delete: `components/vehicle/lead-form.tsx`, `components/vehicle/photo-gallery.tsx`, `components/vehicle/price-display.tsx`, `components/vehicle/whatsapp-button.tsx`
- Delete: `app/vehicles/[id]/page.tsx`

**Interfaces:**
- Consumes: `Property`, `PropertyPhoto` (Task 1's `types/property.ts`); `tryGetPublishedProperty` (Task 1's `lib/data/properties.ts`); `PROPERTY_TYPE_LABELS` (Task 1's `lib/property-labels.ts`); `listProperties` (used already by `app/dashboard/page.tsx` after this task).
- Produces: `LeadForm({ propertyId, propertyTitle })`, `PhotoGallery({ photos, title })`, `PriceDisplay({ priceDisplay, priceCompareAt })`, `WhatsAppButton({ phoneNumber, propertyTitle, propertyUrl })` in `components/property/*`; `Lead` / `CreateLeadInput` with `propertyId`/`propertyTitle` fields (was `vehicleId`/`vehicleTitle`) from `lib/data/leads.ts`; `submitLeadAction({ propertyId, propertyTitle, name, email, message })` from `lib/actions/leads.ts`.

- [ ] **Step 1: Modify `lib/data/leads.ts`**

```ts
import "server-only";

import { FieldValue, Timestamp } from "firebase-admin/firestore";

import { getAdminDb } from "@/lib/firebase/admin";

const COLLECTION = "leads";

export interface CreateLeadInput {
  propertyId: string;
  propertyTitle: string;
  name: string;
  email: string;
  message: string;
}

export interface Lead extends CreateLeadInput {
  id: string;
  createdAt: string;
}

export async function createLead(input: CreateLeadInput): Promise<void> {
  await getAdminDb()
    .collection(COLLECTION)
    .add({
      ...input,
      createdAt: FieldValue.serverTimestamp(),
    });
}

export async function listLeads(): Promise<Lead[]> {
  const snapshot = await getAdminDb().collection(COLLECTION).orderBy("createdAt", "desc").get();
  return snapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      propertyId: data.propertyId ?? "",
      propertyTitle: data.propertyTitle ?? "",
      name: data.name ?? "",
      email: data.email ?? "",
      message: data.message ?? "",
      createdAt:
        data.createdAt instanceof Timestamp
          ? data.createdAt.toDate().toISOString()
          : new Date().toISOString(),
    };
  });
}
```

- [ ] **Step 2: Modify `lib/actions/leads.ts`**

```ts
"use server";

import { createLead } from "@/lib/data/leads";

export interface SubmitLeadInput {
  propertyId: string;
  propertyTitle: string;
  name: string;
  email: string;
  message: string;
}

export interface SubmitLeadResult {
  ok: boolean;
  error?: string;
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function submitLeadAction(input: SubmitLeadInput): Promise<SubmitLeadResult> {
  const name = input.name.trim();
  const email = input.email.trim();
  const message = input.message.trim();

  if (!name || !email || !message) {
    return { ok: false, error: "Completa todos los campos." };
  }
  if (!EMAIL_PATTERN.test(email)) {
    return { ok: false, error: "Ingresa un correo electrónico válido." };
  }

  try {
    await createLead({
      propertyId: input.propertyId,
      propertyTitle: input.propertyTitle,
      name,
      email,
      message,
    });
    return { ok: true };
  } catch {
    return { ok: false, error: "No pudimos enviar tu mensaje. Inténtalo de nuevo en un momento." };
  }
}
```

- [ ] **Step 3: Create `components/property/lead-form.tsx`**

```tsx
"use client";

import { useState, type FormEvent } from "react";
import { CircleCheck, Loader2, TriangleAlert } from "lucide-react";

import { submitLeadAction } from "@/lib/actions/leads";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";

export function LeadForm({
  propertyId,
  propertyTitle,
}: {
  propertyId: string;
  propertyTitle: string;
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState(`Estoy interesado/a en ${propertyTitle}. ¿Sigue disponible?`);
  const [status, setStatus] = useState<"idle" | "loading" | "sent">("idle");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setStatus("loading");

    const result = await submitLeadAction({ propertyId, propertyTitle, name, email, message });
    if (result.ok) {
      setStatus("sent");
    } else {
      setError(result.error ?? "Algo salió mal. Inténtalo de nuevo.");
      setStatus("idle");
    }
  }

  if (status === "sent") {
    return (
      <Alert className="border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-300">
        <CircleCheck />
        <AlertDescription>
          ¡Gracias{name ? `, ${name.split(" ")[0]}` : ""}! Recibimos tu
          mensaje y te responderemos a la brevedad.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      {error ? (
        <Alert variant="destructive">
          <TriangleAlert />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="lead-name">Nombre</Label>
        <Input
          id="lead-name"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Juan Pérez"
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="lead-email">Correo electrónico</Label>
        <Input
          id="lead-email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="juan@example.com"
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="lead-message">Mensaje</Label>
        <Textarea
          id="lead-message"
          required
          rows={4}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
      </div>
      <Button type="submit" disabled={status === "loading"} className="w-full">
        {status === "loading" ? <Loader2 className="animate-spin" /> : null}
        Enviar mensaje
      </Button>
    </form>
  );
}
```

- [ ] **Step 4: Create `components/property/photo-gallery.tsx`**

```tsx
"use client";

import { useState } from "react";
import { Building2 } from "lucide-react";

import type { PropertyPhoto } from "@/types/property";
import { cn } from "@/lib/utils";

export function PhotoGallery({ photos, title }: { photos: PropertyPhoto[]; title: string }) {
  const [activeIndex, setActiveIndex] = useState(0);

  if (photos.length === 0) {
    return (
      <div className="flex aspect-video w-full items-center justify-center rounded-xl border border-border bg-muted text-muted-foreground">
        <Building2 className="size-10" />
      </div>
    );
  }

  const active = photos[Math.min(activeIndex, photos.length - 1)];

  return (
    <div className="flex flex-col gap-3">
      <div className="aspect-video w-full overflow-hidden rounded-xl border border-border bg-muted">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={active.url} alt={title} className="size-full object-cover" />
      </div>
      {photos.length > 1 ? (
        <div className="grid grid-cols-5 gap-2 sm:grid-cols-6">
          {photos.map((photo, index) => (
            <button
              key={photo.path}
              type="button"
              onClick={() => setActiveIndex(index)}
              className={cn(
                "aspect-square overflow-hidden rounded-md border-2 transition-colors",
                index === activeIndex ? "border-primary" : "border-transparent"
              )}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={photo.url}
                alt=""
                className="size-full object-cover"
              />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
```

- [ ] **Step 5: Create `components/property/price-display.tsx`**

```tsx
const currency = new Intl.NumberFormat("es-UY", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

export function PriceDisplay({
  priceDisplay,
  priceCompareAt,
}: {
  priceDisplay: number | null;
  priceCompareAt: number | null;
}) {
  const showCompareAt =
    priceCompareAt != null && priceDisplay != null && priceCompareAt > priceDisplay;

  return (
    <div className="flex flex-col gap-1">
      <div className="flex flex-wrap items-baseline gap-2">
        <span className="text-4xl font-semibold tracking-tight text-foreground">
          {priceDisplay != null ? currency.format(priceDisplay) : "Precio a consultar"}
        </span>
        {showCompareAt ? (
          <span className="text-lg text-muted-foreground line-through">
            {currency.format(priceCompareAt!)}
          </span>
        ) : null}
      </div>
      {showCompareAt ? (
        <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
          Ahorras {currency.format(priceCompareAt! - priceDisplay!)}
        </span>
      ) : null}
    </div>
  );
}
```

- [ ] **Step 6: Create `components/property/whatsapp-button.tsx`**

```tsx
import { MessageCircle } from "lucide-react";

import { Button } from "@/components/ui/button";

function buildWhatsAppMessage(propertyTitle: string, propertyUrl: string) {
  return `¡Hola! Estoy interesado/a en ${propertyTitle}. ¿Me cuentas más? ${propertyUrl}`;
}

export function WhatsAppButton({
  phoneNumber,
  propertyTitle,
  propertyUrl,
}: {
  phoneNumber: string | undefined;
  propertyTitle: string;
  propertyUrl: string;
}) {
  if (!phoneNumber) {
    return (
      <div className="flex flex-col gap-1">
        <Button type="button" disabled className="w-full bg-[#25D366] text-white">
          <MessageCircle />
          Chatear por WhatsApp
        </Button>
        <p className="text-xs text-muted-foreground">
          El contacto por WhatsApp todavía no está configurado.
        </p>
      </div>
    );
  }

  const message = buildWhatsAppMessage(propertyTitle, propertyUrl);
  const href = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;

  return (
    <Button
      nativeButton={false}
      render={<a href={href} target="_blank" rel="noopener noreferrer" />}
      className="w-full bg-[#25D366] text-white hover:bg-[#1ebe5b]"
    >
      <MessageCircle />
      Chatear por WhatsApp
    </Button>
  );
}
```

- [ ] **Step 7: Create `app/properties/[id]/page.tsx`**

```tsx
import type { Metadata } from "next";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { Bath, BedDouble, Home, Ruler, TriangleAlert } from "lucide-react";

import { tryGetPublishedProperty } from "@/lib/data/properties";
import { PROPERTY_TYPE_LABELS } from "@/lib/property-labels";
import { PhotoGallery } from "@/components/property/photo-gallery";
import { PriceDisplay } from "@/components/property/price-display";
import { LeadForm } from "@/components/property/lead-form";
import { WhatsAppButton } from "@/components/property/whatsapp-button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

async function getAbsoluteUrl(pathname: string) {
  const headerList = await headers();
  const host = headerList.get("host") ?? "localhost:3000";
  const protocol = host.startsWith("localhost") ? "http" : "https";
  return `${protocol}://${host}${pathname}`;
}

export async function generateMetadata(
  { params }: PageProps<"/properties/[id]">
): Promise<Metadata> {
  const { id } = await params;
  const { property } = await tryGetPublishedProperty(id);
  if (!property) return { title: "Propiedad no encontrada — Argus" };

  return {
    title: `${property.title} — Argus`,
    description: property.description || `Ver los detalles de ${property.title}.`,
  };
}

export default async function PublicPropertyPage({ params }: PageProps<"/properties/[id]">) {
  const { id } = await params;
  const { property, error } = await tryGetPublishedProperty(id);

  if (error) {
    return (
      <div className="mx-auto max-w-xl px-4 py-24 sm:px-6 lg:px-8">
        <Alert variant="destructive">
          <TriangleAlert />
          <AlertTitle>Esta página no está disponible en este momento</AlertTitle>
          <AlertDescription>
            No pudimos cargar esta propiedad. Inténtalo de nuevo en unos minutos.
          </AlertDescription>
        </Alert>
      </div>
    );
  }
  if (!property) notFound();

  const propertyUrl = await getAbsoluteUrl(`/properties/${property.id}`);
  const whatsappNumber = process.env.NEXT_PUBLIC_SALES_WHATSAPP_NUMBER;

  const specs = [
    { icon: Home, label: "Tipo", value: PROPERTY_TYPE_LABELS[property.propertyType] },
    {
      icon: BedDouble,
      label: "Dormitorios",
      value: property.details.bedrooms != null ? String(property.details.bedrooms) : null,
    },
    {
      icon: Bath,
      label: "Baños",
      value: property.details.bathrooms != null ? String(property.details.bathrooms) : null,
    },
    {
      icon: Ruler,
      label: "Superficie",
      value:
        property.details.areaM2 != null
          ? `${property.details.areaM2.toLocaleString("es-UY")} m²`
          : null,
    },
  ].filter((spec) => spec.value);

  const hasAdditionalDetails =
    property.details.lotAreaM2 != null ||
    property.details.yearBuilt != null ||
    property.details.parkingSpaces != null;

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-3">
        <div className="flex flex-col gap-8 lg:col-span-2">
          <PhotoGallery photos={property.photos} title={property.title} />

          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-foreground">
              {property.title}
            </h1>
            {property.neighborhood || property.city ? (
              <p className="mt-1 text-muted-foreground">
                {[property.neighborhood, property.city].filter(Boolean).join(", ")}
              </p>
            ) : null}
          </div>

          {specs.length > 0 ? (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              {specs.map((spec) => (
                <div
                  key={spec.label}
                  className="flex flex-col gap-1.5 rounded-lg border border-border bg-card p-4"
                >
                  <spec.icon className="size-4 text-muted-foreground" />
                  <span className="text-sm font-medium text-foreground">{spec.value}</span>
                  <span className="text-xs text-muted-foreground">{spec.label}</span>
                </div>
              ))}
            </div>
          ) : null}

          {property.description ? (
            <div>
              <h2 className="mb-2 text-lg font-semibold text-foreground">Descripción</h2>
              <p className="whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
                {property.description}
              </p>
            </div>
          ) : null}

          {hasAdditionalDetails && (
            <div>
              <h2 className="mb-2 text-lg font-semibold text-foreground">
                Detalles adicionales
              </h2>
              <dl className="grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
                {property.details.lotAreaM2 != null ? (
                  <div className="flex justify-between border-b border-border/60 py-1.5">
                    <dt className="text-muted-foreground">Superficie del terreno</dt>
                    <dd className="font-medium text-foreground">
                      {property.details.lotAreaM2.toLocaleString("es-UY")} m²
                    </dd>
                  </div>
                ) : null}
                {property.details.yearBuilt != null ? (
                  <div className="flex justify-between border-b border-border/60 py-1.5">
                    <dt className="text-muted-foreground">Año de construcción</dt>
                    <dd className="font-medium text-foreground">{property.details.yearBuilt}</dd>
                  </div>
                ) : null}
                {property.details.parkingSpaces != null ? (
                  <div className="flex justify-between border-b border-border/60 py-1.5">
                    <dt className="text-muted-foreground">Cocheras</dt>
                    <dd className="font-medium text-foreground">{property.details.parkingSpaces}</dd>
                  </div>
                ) : null}
              </dl>
            </div>
          )}
        </div>

        <aside className="lg:sticky lg:top-6 lg:self-start">
          <Card>
            <CardHeader>
              <PriceDisplay
                priceDisplay={property.priceDisplay}
                priceCompareAt={property.priceCompareAt}
              />
            </CardHeader>
            <CardContent className="flex flex-col gap-5">
              <WhatsAppButton
                phoneNumber={whatsappNumber}
                propertyTitle={property.title}
                propertyUrl={propertyUrl}
              />

              <Separator />

              <div>
                <CardTitle className="mb-3 text-base">Consultá por esta propiedad</CardTitle>
                <LeadForm propertyId={property.id} propertyTitle={property.title} />
              </div>
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  );
}
```

- [ ] **Step 8: Rewrite `components/dashboard/leads-view.tsx`** (drops the trade-in tab; the trade-in *feature* is deleted in Task 8, but nothing here references it anymore after this step)

```tsx
"use client";

import { useState } from "react";

import type { Lead } from "@/lib/data/leads";
import type { ContactMessage } from "@/lib/data/contact";
import { cn } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const dateFormatter = new Intl.DateTimeFormat("es-UY", {
  dateStyle: "medium",
  timeStyle: "short",
});

type Tab = "properties" | "contact";

export function LeadsView({
  leads,
  contactMessages,
}: {
  leads: Lead[];
  contactMessages: ContactMessage[];
}) {
  const [tab, setTab] = useState<Tab>("properties");

  const tabs: { id: Tab; label: string; count: number }[] = [
    { id: "properties", label: "Consultas de propiedades", count: leads.length },
    { id: "contact", label: "Contacto", count: contactMessages.length },
  ];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-1 rounded-lg border border-border bg-card p-1">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={cn(
              "flex-1 rounded-md px-3 py-1.5 text-sm font-medium whitespace-nowrap transition-colors",
              tab === t.id
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            {t.label} ({t.count})
          </button>
        ))}
      </div>

      {tab === "properties" ? (
        leads.length === 0 ? (
          <EmptyState message="Todavía no hay consultas sobre propiedades." />
        ) : (
          <div className="rounded-lg border border-border bg-card">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Propiedad</TableHead>
                  <TableHead>Contacto</TableHead>
                  <TableHead>Mensaje</TableHead>
                  <TableHead>Fecha</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {leads.map((lead) => (
                  <TableRow key={lead.id}>
                    <TableCell className="font-medium text-foreground">
                      {lead.propertyTitle}
                    </TableCell>
                    <TableCell>
                      <p className="text-foreground">{lead.name}</p>
                      <p className="text-xs text-muted-foreground">{lead.email}</p>
                    </TableCell>
                    <TableCell className="max-w-xs truncate text-muted-foreground" title={lead.message}>
                      {lead.message}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {dateFormatter.format(new Date(lead.createdAt))}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )
      ) : null}

      {tab === "contact" ? (
        contactMessages.length === 0 ? (
          <EmptyState message="Todavía no hay mensajes de contacto." />
        ) : (
          <div className="rounded-lg border border-border bg-card">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Contacto</TableHead>
                  <TableHead>Mensaje</TableHead>
                  <TableHead>Fecha</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {contactMessages.map((message) => (
                  <TableRow key={message.id}>
                    <TableCell>
                      <p className="font-medium text-foreground">{message.name}</p>
                      <p className="text-xs text-muted-foreground">{message.email}</p>
                    </TableCell>
                    <TableCell className="max-w-md truncate text-muted-foreground" title={message.message}>
                      {message.message}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {dateFormatter.format(new Date(message.createdAt))}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )
      ) : null}
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed border-border py-16 text-center">
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  );
}
```

- [ ] **Step 9: Rewrite `app/dashboard/leads/page.tsx`**

```tsx
import type { Metadata } from "next";
import { TriangleAlert } from "lucide-react";

import { listLeads } from "@/lib/data/leads";
import { listContactMessages } from "@/lib/data/contact";
import { LeadsView } from "@/components/dashboard/leads-view";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export const metadata: Metadata = { title: "Leads — Argus" };
export const dynamic = "force-dynamic";

export default async function LeadsPage() {
  let leads: Awaited<ReturnType<typeof listLeads>> = [];
  let contactMessages: Awaited<ReturnType<typeof listContactMessages>> = [];
  let loadError = false;

  try {
    [leads, contactMessages] = await Promise.all([listLeads(), listContactMessages()]);
  } catch {
    loadError = true;
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Leads</h1>
        <p className="text-sm text-muted-foreground">
          Consultas de propiedades y mensajes de contacto.
        </p>
      </div>

      {loadError ? (
        <Alert variant="destructive">
          <TriangleAlert />
          <AlertTitle>Algo salió mal</AlertTitle>
          <AlertDescription>No pudimos cargar los leads. Recarga la página.</AlertDescription>
        </Alert>
      ) : (
        <LeadsView leads={leads} contactMessages={contactMessages} />
      )}
    </div>
  );
}
```

- [ ] **Step 10: Rewrite `app/dashboard/page.tsx`** (switches from `listVehicles`/`listTradeInLeads` to `listProperties`, drops the trade-in unified-lead source; `lib/data/trade-ins.ts` itself is deleted later in Task 8, this just stops importing it)

```tsx
import Link from "next/link";
import type { Metadata } from "next";
import { Building2, CheckCircle2, Inbox, Users } from "lucide-react";

import { listProperties } from "@/lib/data/properties";
import { listAppUsers } from "@/lib/data/users";
import { listLeads, type Lead } from "@/lib/data/leads";
import { listContactMessages, type ContactMessage } from "@/lib/data/contact";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = { title: "Panel — Argus" };
export const dynamic = "force-dynamic";

const dateFormatter = new Intl.DateTimeFormat("es-UY", { dateStyle: "medium" });

function settled<T>(result: PromiseSettledResult<T[]>): T[] {
  return result.status === "fulfilled" ? result.value : [];
}

type LeadKind = "property" | "contact";

interface UnifiedLead {
  id: string;
  kind: LeadKind;
  title: string;
  name: string;
  createdAt: string;
}

const KIND_LABELS: Record<LeadKind, string> = {
  property: "Propiedad",
  contact: "Contacto",
};

function toUnifiedLeads(leads: Lead[], contactMessages: ContactMessage[]): UnifiedLead[] {
  const unified: UnifiedLead[] = [
    ...leads.map((lead) => ({
      id: lead.id,
      kind: "property" as const,
      title: lead.propertyTitle,
      name: lead.name,
      createdAt: lead.createdAt,
    })),
    ...contactMessages.map((message) => ({
      id: message.id,
      kind: "contact" as const,
      title: "Mensaje de contacto",
      name: message.name,
      createdAt: message.createdAt,
    })),
  ];
  return unified.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export default async function DashboardHomePage() {
  const [propertiesResult, usersResult, leadsResult, contactResult] = await Promise.allSettled([
    listProperties(),
    listAppUsers(),
    listLeads(),
    listContactMessages(),
  ]);

  const properties = settled(propertiesResult);
  const users = settled(usersResult);
  const leads = settled(leadsResult);
  const contactMessages = settled(contactResult);

  const publishedCount = properties.filter((p) => p.status === "published").length;
  const activeUsersCount = users.filter((u) => !u.disabled).length;
  const totalLeadsCount = leads.length + contactMessages.length;

  const kpis = [
    { label: "Propiedades en catálogo", value: properties.length, icon: Building2 },
    { label: "Publicadas", value: publishedCount, icon: CheckCircle2 },
    { label: "Leads totales", value: totalLeadsCount, icon: Inbox },
    { label: "Usuarios activos", value: activeUsersCount, icon: Users },
  ];

  const recentProperties = properties.slice(0, 5);
  const recentLeads = toUnifiedLeads(leads, contactMessages).slice(0, 5);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Resumen</h1>
        <p className="text-sm text-muted-foreground">
          Un vistazo general a tu catálogo y tus leads.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {kpis.map((kpi) => (
          <Card key={kpi.label}>
            <CardContent className="flex items-center gap-3">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <kpi.icon className="size-5" />
              </div>
              <div>
                <p className="text-2xl font-semibold tracking-tight text-foreground">
                  {kpi.value}
                </p>
                <p className="text-xs text-muted-foreground">{kpi.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Últimas propiedades</CardTitle>
              <Link href="/dashboard/properties" className="text-sm text-primary hover:underline">
                Ver todas
              </Link>
            </div>
          </CardHeader>
          <CardContent className="flex flex-col divide-y divide-border">
            {recentProperties.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">
                Todavía no hay propiedades
              </p>
            ) : (
              recentProperties.map((property) => (
                <Link
                  key={property.id}
                  href={`/dashboard/properties/${property.id}/edit`}
                  className="-mx-2 flex items-center justify-between gap-3 rounded-md px-2 py-3 transition-colors hover:bg-muted/50"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-md bg-muted">
                      {property.photos[0] ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={property.photos[0].url}
                          alt=""
                          className="size-full object-cover"
                        />
                      ) : (
                        <Building2 className="size-4 text-muted-foreground" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-foreground">
                        {property.title}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {dateFormatter.format(new Date(property.updatedAt))}
                      </p>
                    </div>
                  </div>
                  <StatusBadge status={property.status} />
                </Link>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Últimos leads</CardTitle>
              <Link href="/dashboard/leads" className="text-sm text-primary hover:underline">
                Ver todos
              </Link>
            </div>
          </CardHeader>
          <CardContent className="flex flex-col divide-y divide-border">
            {recentLeads.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">
                Todavía no hay leads
              </p>
            ) : (
              recentLeads.map((lead) => (
                <div key={`${lead.kind}-${lead.id}`} className="flex items-center justify-between gap-3 py-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-foreground">{lead.name}</p>
                    <p className="truncate text-xs text-muted-foreground">{lead.title}</p>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-1">
                    <Badge variant="outline">{KIND_LABELS[lead.kind]}</Badge>
                    <span className="text-xs text-muted-foreground">
                      {dateFormatter.format(new Date(lead.createdAt))}
                    </span>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
```

- [ ] **Step 11: Delete the old vehicle detail page and lead-capture components**

```bash
git rm -r components/vehicle
git rm -r "app/vehicles"
```

- [ ] **Step 12: Verify the build**

Run: `npm run build`
Expected: succeeds. At this point `app/vehicles/**`, `components/vehicle/**` are gone; `app/dashboard/page.tsx` and `app/dashboard/leads/page.tsx` no longer reference `lib/data/trade-ins.ts` or `vehicleTitle`. `lib/data/vehicles.ts`/`lib/actions/vehicles.ts`/`lib/data/trade-ins.ts`/`lib/actions/trade-ins.ts`/`types/vehicle.ts` still exist as dead code (only `app/inventory/page.tsx`, `components/featured-vehicles.tsx`, and `components/trade-in-section.tsx`/`trade-in-form.tsx` still import them) until Tasks 5 and 8.

Run: `npm run lint`
Expected: no errors.

- [ ] **Step 13: Commit**

```bash
git add -A
git commit -m "feat: cut public property page and lead capture over from vehicles

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

## Task 5: Homepage listings, search bar, cards, and routes cutover

**Files:**
- Create: `components/property-card.tsx`
- Create: `components/property-search-bar.tsx`
- Create: `components/featured-properties.tsx`
- Create: `components/listings/listings-view.tsx`
- Create: `app/listings/page.tsx`
- Modify: `components/site-header.tsx`
- Modify: `app/page.tsx`
- Delete: `components/vehicle-card.tsx`, `components/vehicle-search-bar.tsx`, `components/featured-vehicles.tsx`
- Delete: `components/inventory/inventory-view.tsx`
- Delete: `app/inventory/page.tsx`

**Interfaces:**
- Consumes: `Property` (Task 1); `PROPERTY_TYPE_LABELS`, `PROPERTY_TYPES`, `BEDROOM_OPTIONS`, `PRICE_RANGES`, `parsePriceRange` (Task 1's `lib/property-labels.ts`); `listPublishedProperties` (Task 1's `lib/data/properties.ts`).
- Produces: `PropertyCard({ property, layout })`, `PropertySearchBar()`, `FeaturedPropertiesSection()`, `ListingsView({ properties })` — consumed by `app/page.tsx` and `app/listings/page.tsx` in this same task.

- [ ] **Step 1: Create `components/property-card.tsx`**

```tsx
import Link from "next/link";
import { Building2 } from "lucide-react";

import type { Property } from "@/types/property";
import { PROPERTY_TYPE_LABELS } from "@/lib/property-labels";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";

const currency = new Intl.NumberFormat("es-UY", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

function summaryLine(property: Property): string {
  if (property.propertyType === "land") {
    return property.details.lotAreaM2 != null
      ? `${property.details.lotAreaM2.toLocaleString("es-UY")} m² de terreno`
      : "Superficie a consultar";
  }
  const parts: string[] = [];
  if (property.details.bedrooms != null) parts.push(`${property.details.bedrooms} dorm.`);
  if (property.details.bathrooms != null) parts.push(`${property.details.bathrooms} baños`);
  if (property.details.areaM2 != null) {
    parts.push(`${property.details.areaM2.toLocaleString("es-UY")} m²`);
  }
  return parts.length > 0 ? parts.join(" · ") : "Detalles a consultar";
}

export function PropertyCard({
  property,
  layout = "vertical",
}: {
  property: Property;
  layout?: "vertical" | "horizontal";
}) {
  const horizontal = layout === "horizontal";

  return (
    <Link href={`/properties/${property.id}`} className="group block">
      <Card
        className={cn(
          "gap-0 overflow-hidden py-0 ring-border/60 transition-shadow group-hover:shadow-md",
          horizontal && "flex-row"
        )}
      >
        <div
          className={cn(
            "shrink-0 overflow-hidden bg-muted",
            horizontal ? "aspect-square w-2/5" : "aspect-4/3 w-full"
          )}
        >
          {property.photos[0] ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={property.photos[0].url}
              alt={property.title}
              className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="flex size-full items-center justify-center text-muted-foreground">
              <Building2 className="size-8" />
            </div>
          )}
        </div>
        <CardContent
          className={cn(
            "flex min-w-0 flex-1 flex-col gap-1 p-4",
            horizontal && "justify-center"
          )}
        >
          <p className="text-xs font-medium uppercase tracking-wide text-primary">
            {PROPERTY_TYPE_LABELS[property.propertyType]}
          </p>
          <h3 className="truncate font-medium text-foreground">{property.title}</h3>
          <p className="text-sm text-muted-foreground">{summaryLine(property)}</p>
          <p className="mt-1 font-semibold text-foreground">
            {property.priceDisplay != null
              ? currency.format(property.priceDisplay)
              : "Precio a consultar"}
          </p>
        </CardContent>
      </Card>
    </Link>
  );
}
```

- [ ] **Step 2: Create `components/property-search-bar.tsx`**

```tsx
"use client";

import { useState } from "react";
import { Search } from "lucide-react";

import { BEDROOM_OPTIONS, PRICE_RANGES, PROPERTY_TYPES } from "@/lib/property-labels";
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

const PROPERTY_TYPE_ITEMS: Record<string, string> = Object.fromEntries(
  PROPERTY_TYPES.map((option) => [option.value, option.label])
);
const BEDROOM_ITEMS: Record<string, string> = Object.fromEntries(
  BEDROOM_OPTIONS.map((option) => [option.value, option.label])
);

export function PropertySearchBar() {
  const [propertyType, setPropertyType] = useState("");
  const [bedrooms, setBedrooms] = useState("");
  const [neighborhood, setNeighborhood] = useState("");
  const [price, setPrice] = useState("");

  function handleSearch() {
    const params = new URLSearchParams();
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
              className="grid grid-cols-2 items-end gap-4 lg:grid-cols-[1fr_1fr_1fr_1fr_auto]"
            >
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
```

- [ ] **Step 3: Create `components/featured-properties.tsx`**

```tsx
import { listPublishedProperties } from "@/lib/data/properties";
import { PropertyCard } from "@/components/property-card";
import { ScrollReveal } from "@/components/scroll-reveal";

export async function FeaturedPropertiesSection() {
  let properties: Awaited<ReturnType<typeof listPublishedProperties>> = [];
  try {
    properties = await listPublishedProperties(4);
  } catch {
    // Keep the marketing page usable even if Firestore is unreachable.
    return null;
  }

  if (properties.length === 0) return null;

  return (
    <section id="listings" className="border-b border-border/60 bg-muted/40 py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <ScrollReveal className="mx-auto max-w-2xl text-center">
          <h2 className="text-balance text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            Propiedades Destacadas
          </h2>
          <p className="mt-4 text-balance text-muted-foreground">
            Un vistazo a lo que tenemos disponible, actualizado a medida que
            entran nuevas propiedades.
          </p>
        </ScrollReveal>

        <ScrollReveal
          delay={0.1}
          className="mt-12 flex snap-x snap-mandatory gap-4 overflow-x-auto -mx-4 px-4 pb-4 sm:mx-0 sm:grid sm:snap-none sm:grid-cols-2 sm:gap-6 sm:overflow-visible sm:px-0 sm:pb-0 lg:grid-cols-4"
        >
          {properties.map((property) => (
            <div key={property.id} className="w-3/4 shrink-0 snap-start sm:w-auto">
              <PropertyCard property={property} />
            </div>
          ))}
        </ScrollReveal>
      </div>
    </section>
  );
}
```

- [ ] **Step 4: Create `components/listings/listings-view.tsx`**

```tsx
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
```

- [ ] **Step 5: Create `app/listings/page.tsx`**

```tsx
import type { Metadata } from "next";
import { TriangleAlert } from "lucide-react";

import { listPublishedProperties } from "@/lib/data/properties";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { ListingsView } from "@/components/listings/listings-view";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export const metadata: Metadata = {
  title: "Propiedades disponibles — Argus",
  description:
    "Explora todas las propiedades disponibles en Argus y filtra por tipo, dormitorios, zona y precio.",
};

export default async function ListingsPage() {
  let properties: Awaited<ReturnType<typeof listPublishedProperties>> = [];
  let loadError = false;
  try {
    properties = await listPublishedProperties(12);
  } catch {
    loadError = true;
  }

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <SiteHeader />
      <main className="flex-1 pt-24 pb-20 sm:pt-28">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-balance text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              Propiedades disponibles
            </h1>
            <p className="mt-2 text-muted-foreground">
              Filtra por tipo, dormitorios, zona y precio para encontrar tu próxima propiedad.
            </p>
          </div>

          {loadError ? (
            <Alert variant="destructive">
              <TriangleAlert />
              <AlertTitle>Algo salió mal</AlertTitle>
              <AlertDescription>
                No pudimos cargar las propiedades disponibles. Recarga la página.
              </AlertDescription>
            </Alert>
          ) : (
            <ListingsView properties={properties} />
          )}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
```

- [ ] **Step 6: Modify `components/site-header.tsx`**

Change:
```tsx
const NAV_LINKS = [
  { label: "Inventario", href: "/inventory" },
  { label: "Ventajas", href: "#features" },
  { label: "Financiación", href: "#financing" },
  { label: "Nosotros", href: "#about" },
  { label: "Contacto", href: "#contact" },
];
```
to:
```tsx
const NAV_LINKS = [
  { label: "Propiedades", href: "/listings" },
  { label: "Ventajas", href: "#features" },
  { label: "Financiación", href: "#financing" },
  { label: "Nosotros", href: "#about" },
  { label: "Contacto", href: "#contact" },
];
```

- [ ] **Step 7: Modify `app/page.tsx`** (swap vehicle imports for property ones; `TradeInSection` stays for now — it's removed in Task 8)

```tsx
import { SiteHeader } from "@/components/site-header";
import { HeroSection } from "@/components/hero-section";
import { PropertySearchBar } from "@/components/property-search-bar";
import { FeaturedPropertiesSection } from "@/components/featured-properties";
import { FeaturesSection } from "@/components/features-section";
import { DealerHighlightSection } from "@/components/dealer-highlight-section";
import { AboutSection } from "@/components/about-section";
import { FinancingPartnersTicker } from "@/components/financing-partners-ticker";
import { FinancingSection } from "@/components/financing-section";
import { TradeInSection } from "@/components/trade-in-section";
import { ContactSection } from "@/components/contact-section";
import { SiteFooter } from "@/components/site-footer";

export default function Home() {
  return (
    <div className="flex min-h-full flex-1 flex-col">
      <SiteHeader />
      <main className="flex-1">
        <HeroSection />
        <PropertySearchBar />
        <FeaturedPropertiesSection />
        <FeaturesSection />
        <DealerHighlightSection />
        <AboutSection />
        <FinancingPartnersTicker />
        <FinancingSection />
        <TradeInSection />
        <ContactSection />
      </main>
      <SiteFooter />
    </div>
  );
}
```

- [ ] **Step 8: Delete the old vehicle listings/search files**

```bash
git rm components/vehicle-card.tsx components/vehicle-search-bar.tsx components/featured-vehicles.tsx
git rm -r components/inventory
git rm -r app/inventory
```

- [ ] **Step 9: Verify the build**

Run: `npm run build`
Expected: succeeds. `app/inventory/**`, `components/inventory/**`, `components/vehicle-card.tsx`, `components/vehicle-search-bar.tsx`, `components/featured-vehicles.tsx` are gone; `app/page.tsx` and `app/listings/page.tsx` compile against the new property components. `lib/data/vehicles.ts`/`lib/actions/vehicles.ts`/`types/vehicle.ts` are now fully unused (nothing imports them) but still present — deleted in Task 8. `components/trade-in-section.tsx`/`trade-in-form.tsx`/`lib/data/trade-ins.ts`/`lib/actions/trade-ins.ts` are still wired into `app/page.tsx` and untouched.

Run: `npm run lint`
Expected: no errors.

- [ ] **Step 10: Commit**

```bash
git add -A
git commit -m "feat: cut homepage listings, search, and cards over from vehicles

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

## Task 6: Homepage narrative copy (hero, features, agency-highlight, about)

Content-only changes — no type or routing coupling.

**Files:**
- Modify: `components/hero-section.tsx`
- Modify: `components/features-section.tsx`
- Modify: `components/dealer-highlight-section.tsx`
- Modify: `components/about-section.tsx`

**Interfaces:** none.

- [ ] **Step 1: Modify `components/hero-section.tsx`**

Change the headline constant:
```tsx
const HEADLINE = "Encuentra tu próximo vehículo sin complicaciones";
```
to:
```tsx
const HEADLINE = "Encuentra tu próximo hogar sin complicaciones";
```

Change the background image:
```tsx
        <img
          src="/images/modern car dealership.png"
          alt=""
          className="size-full object-cover object-center"
        />
```
to:
```tsx
        <img
          src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=2000&auto=format&fit=crop"
          alt=""
          className="size-full object-cover object-center"
        />
```
(Placeholder stock photo — swap for real photography whenever it's ready, per the spec's explicit deferral of asset sourcing.)

Change the badge text:
```tsx
            Stock actualizado todas las semanas
```
to:
```tsx
            Nuevas propiedades cada semana
```

Change the body paragraph:
```tsx
            En Dealio compras con precios claros, vehículos revisados y
            financiación flexible — todo desde un mismo lugar.
```
to:
```tsx
            En Argus compras con precios claros, propiedades verificadas y
            financiación flexible — todo desde un mismo lugar.
```

Change the primary CTA:
```tsx
            <Button size="lg" className="w-full sm:w-auto">
              Ver stock disponible
              <ArrowRight />
            </Button>
```
to:
```tsx
            <Button size="lg" className="w-full sm:w-auto">
              Explorar propiedades
              <ArrowRight />
            </Button>
```

- [ ] **Step 2: Modify `components/features-section.tsx`**

Replace the `FEATURES` array:
```tsx
const FEATURES: Feature[] = [
  {
    icon: BadgeCheck,
    title: "Todos los vehículos revisados",
    description:
      "Cada auto de nuestro stock pasa una inspección de múltiples puntos antes de publicarse, así lo que ves es lo que hay.",
  },
  {
    icon: HandCoins,
    title: "Precios claros, sin sorpresas",
    description:
      "Sin costos ocultos ni sorpresas de último momento — el precio que ves es el que pagas, más financiación flexible.",
  },
  {
    icon: Wrench,
    title: "Te acompañamos después de la venta",
    description:
      "Desde el papeleo hasta tu próximo trade-in, nuestro equipo sigue ahí mucho después de que te llevas el auto.",
  },
];
```
with:
```tsx
const FEATURES: Feature[] = [
  {
    icon: BadgeCheck,
    title: "Todas las propiedades verificadas",
    description:
      "Cada propiedad de nuestro catálogo pasa una verificación de documentación y estado antes de publicarse, así lo que ves es lo que hay.",
  },
  {
    icon: HandCoins,
    title: "Precios claros, sin sorpresas",
    description:
      "Sin costos ocultos ni sorpresas de último momento — el precio que ves es el que negocias, más financiación hipotecaria flexible.",
  },
  {
    icon: Handshake,
    title: "Te acompañamos hasta el cierre",
    description:
      "Desde la documentación hasta la escritura, nuestro equipo sigue ahí mucho después de mostrarte la propiedad.",
  },
];
```

Update the icon import:
```tsx
import { BadgeCheck, HandCoins, Wrench } from "lucide-react";
```
to:
```tsx
import { BadgeCheck, HandCoins, Handshake } from "lucide-react";
```

Change the section heading/subtext:
```tsx
          <h2 className="text-balance text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            Por qué comprarnos a nosotros
          </h2>
          <p className="mt-4 text-balance text-muted-foreground">
            Precios claros, vehículos revisados y un equipo que trata cada
            venta como si importara — porque importa.
          </p>
```
to:
```tsx
          <h2 className="text-balance text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            Por qué elegirnos
          </h2>
          <p className="mt-4 text-balance text-muted-foreground">
            Precios claros, propiedades verificadas y un equipo que trata
            cada operación como si importara — porque importa.
          </p>
```

- [ ] **Step 3: Modify `components/dealer-highlight-section.tsx`**

Replace the `POINTS` array:
```tsx
const POINTS = [
  "Inspección mecánica de múltiples puntos en cada vehículo",
  "Documentación y kilometraje verificados antes de publicarlo",
  "Limpieza y detailing completo antes de la entrega",
];
```
with:
```tsx
const POINTS = [
  "Verificación de escritura y documentación antes de publicar",
  "Relevamiento del estado general de la propiedad",
  "Sesión de fotos profesional antes de la publicación",
];
```

Change the heading and body:
```tsx
          <h2 className="mt-3 text-balance text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            Cada auto pasa por una revisión a fondo antes de salir a la venta
          </h2>
          <p className="mt-4 text-balance text-muted-foreground">
            No subimos un auto a la vitrina sin revisarlo de arriba a abajo.
            Mecánica, papeles y estética quedan en orden antes de que lo veas,
            así compras con la tranquilidad de saber qué te estás llevando.
          </p>
```
to:
```tsx
          <h2 className="mt-3 text-balance text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            Cada propiedad pasa por una revisión a fondo antes de publicarse
          </h2>
          <p className="mt-4 text-balance text-muted-foreground">
            No publicamos una propiedad sin revisarla de arriba a abajo.
            Documentación, estado edilicio y fotos profesionales quedan en
            orden antes de que la veas, así compras con la tranquilidad de
            saber qué estás adquiriendo.
          </p>
```

Change the CTA and its target anchor:
```tsx
          <Button className="mt-8" nativeButton={false} render={<Link href="#inventory" />}>
            Ver stock disponible
          </Button>
```
to:
```tsx
          <Button className="mt-8" nativeButton={false} render={<Link href="#listings" />}>
            Ver propiedades disponibles
          </Button>
```

Change the image and its alt text:
```tsx
          <img
            src="https://images.unsplash.com/photo-1552519507-da3b142c6e3d?q=80&w=1200&auto=format&fit=crop"
            alt="Vehículo revisado y listo para la venta"
            className="aspect-square w-full object-cover"
          />
```
to:
```tsx
          <img
            src="https://images.unsplash.com/photo-1568605114967-8130f3a36994?q=80&w=1200&auto=format&fit=crop"
            alt="Propiedad revisada y lista para la venta"
            className="aspect-square w-full object-cover"
          />
```
(Placeholder stock photo — swap for real photography whenever it's ready.)

- [ ] **Step 4: Modify `components/about-section.tsx`**

Replace the `STATS` array:
```tsx
const STATS = [
  { value: "10 mil+", label: "Vehículos entregados" },
  { value: "4.8★", label: "Valoración promedio" },
  { value: "48 h", label: "Tiempo de respuesta" },
];
```
with:
```tsx
const STATS = [
  { value: "500+", label: "Propiedades vendidas" },
  { value: "4.8★", label: "Valoración promedio" },
  { value: "48 h", label: "Tiempo de respuesta" },
];
```

Change the photo alt text:
```tsx
              alt="Un integrante del equipo de Dealio"
```
to:
```tsx
              alt="Un integrante del equipo de Argus"
```

Change the heading and body:
```tsx
          <h2 className="mt-3 text-balance text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            Gente que entiende de autos, no solo de ventas
          </h2>
          <p className="mt-4 text-balance text-muted-foreground">
            Somos un equipo chico que revisa cada vehículo antes de
            ofrecerlo, negocia con precios claros y sigue disponible mucho
            después de que te llevas el auto. Comprar un usado no tiene por
            qué ser complicado.
          </p>
```
to:
```tsx
          <h2 className="mt-3 text-balance text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            Gente que entiende de propiedades, no solo de ventas
          </h2>
          <p className="mt-4 text-balance text-muted-foreground">
            Somos un equipo chico que revisa cada propiedad antes de
            publicarla, negocia con precios claros y sigue disponible mucho
            después de firmar. Comprar o vender una propiedad no tiene por
            qué ser complicado.
          </p>
```

- [ ] **Step 5: Verify the build**

Run: `npm run build`
Expected: succeeds.

Run: `npm run lint`
Expected: no errors.

- [ ] **Step 6: Commit**

```bash
git add components/hero-section.tsx components/features-section.tsx components/dealer-highlight-section.tsx components/about-section.tsx
git commit -m "content: rewrite homepage hero/features/highlight/about copy for real estate

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

## Task 7: Mortgage simulator (financing repurpose)

**Files:**
- Modify: `components/financing-calculator.tsx`
- Modify: `components/financing-section.tsx`
- Modify: `components/financing-partners-ticker.tsx`

**Interfaces:** none — `FinancingCalculator`/`FinancingSection`/`FinancingPartnersTicker` keep their existing names and no-prop signatures.

- [ ] **Step 1: Modify `components/financing-calculator.tsx`**

Change the terms from months to years:
```tsx
const TERMS = [36, 48, 60, 72, 84];
const TERM_ITEMS = TERMS.map((months) => ({ value: String(months), label: `${months} meses` }));
```
to:
```tsx
const TERMS_YEARS = [15, 20, 25, 30];
const TERM_ITEMS = TERMS_YEARS.map((years) => ({ value: String(years), label: `${years} años` }));
```

Change the default state and the monthly-payment call to convert years to months:
```tsx
export function FinancingCalculator() {
  const [price, setPrice] = useState("28000");
  const [downPayment, setDownPayment] = useState("3000");
  const [apr, setApr] = useState("6.5");
  const [term, setTerm] = useState("60");

  const monthlyPayment = useMemo(() => {
    const principal = Math.max(0, toNumber(price) - toNumber(downPayment));
    return calculateMonthlyPayment(principal, toNumber(apr), Number(term));
  }, [price, downPayment, apr, term]);
```
to:
```tsx
export function FinancingCalculator() {
  const [price, setPrice] = useState("120000");
  const [downPayment, setDownPayment] = useState("20000");
  const [apr, setApr] = useState("8.5");
  const [term, setTerm] = useState("30");

  const monthlyPayment = useMemo(() => {
    const principal = Math.max(0, toNumber(price) - toNumber(downPayment));
    return calculateMonthlyPayment(principal, toNumber(apr), Number(term) * 12);
  }, [price, downPayment, apr, term]);
```

Change the card title and field labels:
```tsx
          <CardTitle className="text-lg">Calculadora de cuotas</CardTitle>
```
to:
```tsx
          <CardTitle className="text-lg">Calculadora de crédito hipotecario</CardTitle>
```

```tsx
            <Label htmlFor="calc-price">Precio del vehículo</Label>
```
to:
```tsx
            <Label htmlFor="calc-price">Precio de la propiedad</Label>
```

```tsx
            <Label htmlFor="calc-down">Anticipo</Label>
```
to:
```tsx
            <Label htmlFor="calc-down">Cuota inicial</Label>
```

```tsx
            <Label htmlFor="calc-term">Plazo del préstamo</Label>
```
stays as-is — the label already generalizes fine to years.

- [ ] **Step 2: Modify `components/financing-section.tsx`**

Change the eyebrow label:
```tsx
            Financiación
```
stays the same (section id `financing` also stays), but change the heading/body/points:
```tsx
          <h2 className="mt-3 text-balance text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            Calcula cuánto te podría costar
          </h2>
          <p className="mt-4 text-balance text-muted-foreground">
            Obtén una estimación rápida de tu cuota mensual antes de pisar el
            lote. Ajusta el precio, el anticipo, la tasa y el plazo para
            encontrar lo que se adapta a tu presupuesto.
          </p>
```
to:
```tsx
          <h2 className="mt-3 text-balance text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            Calcula cuánto te podría costar
          </h2>
          <p className="mt-4 text-balance text-muted-foreground">
            Obtén una estimación rápida de tu cuota mensual antes de visitar
            la propiedad. Ajusta el precio, la cuota inicial, la tasa y el
            plazo para encontrar lo que se adapta a tu presupuesto.
          </p>
```

Replace the `POINTS` array:
```tsx
const POINTS = [
  "Plazos flexibles de 36 a 84 meses",
  "Simular no afecta tu historial crediticio",
  "Solicita financiación real cuando encuentres tu vehículo",
];
```
with:
```tsx
const POINTS = [
  "Plazos flexibles de 15 a 30 años",
  "Simular no afecta tu historial crediticio",
  "Solicita financiación real cuando encuentres tu próxima propiedad",
];
```

- [ ] **Step 3: Modify `components/financing-partners-ticker.tsx`**

Change the caption:
```tsx
        <p className="mb-6 text-center text-xs font-bold uppercase tracking-widest text-muted-foreground">
          Financiación disponible a través de
        </p>
```
to:
```tsx
        <p className="mb-6 text-center text-xs font-bold uppercase tracking-widest text-muted-foreground">
          Créditos hipotecarios disponibles a través de
        </p>
```
(`BANKS` list stays unchanged — the same banks offer mortgages too.)

- [ ] **Step 4: Verify the build**

Run: `npm run build`
Expected: succeeds.

Run: `npm run lint`
Expected: no errors.

- [ ] **Step 5: Commit**

```bash
git add components/financing-calculator.tsx components/financing-section.tsx components/financing-partners-ticker.tsx
git commit -m "content: repurpose financing calculator into a mortgage simulator

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

## Task 8: Remove trade-in feature, redeploy Firebase rules, delete legacy vehicle files

By this point nothing imports the vehicle/trade-in files anymore (confirmed by Tasks 3–5's build checks and Task 4's dashboard rewrite) — this task is pure deletion plus the Firestore/Storage rules cutover.

**Files:**
- Modify: `app/page.tsx`
- Modify: `firestore.rules`
- Modify: `storage.rules`
- Delete: `components/trade-in-section.tsx`, `components/trade-in-form.tsx`
- Delete: `lib/data/trade-ins.ts`, `lib/actions/trade-ins.ts`
- Delete: `lib/data/vehicles.ts`, `lib/actions/vehicles.ts`, `types/vehicle.ts`

**Interfaces:** none — pure deletion and rules text.

- [ ] **Step 1: Remove the trade-in section from `app/page.tsx`**

Remove the import:
```tsx
import { TradeInSection } from "@/components/trade-in-section";
```

Remove its usage in the JSX:
```tsx
        <FinancingSection />
        <TradeInSection />
        <ContactSection />
```
becomes:
```tsx
        <FinancingSection />
        <ContactSection />
```

- [ ] **Step 2: Delete the trade-in files**

```bash
git rm components/trade-in-section.tsx components/trade-in-form.tsx
git rm lib/data/trade-ins.ts lib/actions/trade-ins.ts
```

- [ ] **Step 3: Delete the legacy vehicle domain files**

```bash
git rm lib/data/vehicles.ts lib/actions/vehicles.ts types/vehicle.ts
```

- [ ] **Step 4: Modify `firestore.rules`**

```
rules_version = '2';

// All reads/writes from this app happen server-side through firebase-admin,
// which always bypasses these rules. They exist as a safety net in case a
// client ever talks to Firestore directly, and so `firebase deploy` has
// real rules instead of the 30-day test-mode default.
service cloud.firestore {
  match /databases/{database}/documents {
    match /properties/{propertyId} {
      // Published listings are readable by anyone; everything else requires
      // a signed-in (dashboard) user.
      allow get: if resource.data.status == 'published' || request.auth != null;
      allow list: if request.auth != null;
      allow write: if request.auth != null;
    }

    match /leads/{leadId} {
      // Anyone can submit a lead from the public property page; only signed-in
      // users can read or manage the resulting list.
      allow create: if true;
      allow read, update, delete: if request.auth != null;
    }

    match /contactMessages/{messageId} {
      // Anyone can send a message from the homepage contact form; only
      // signed-in users can read or manage the resulting list.
      allow create: if true;
      allow read, update, delete: if request.auth != null;
    }

    match /settings/{docId} {
      // Dashboard-only reference data; no public access at all.
      allow read, write: if request.auth != null;
    }
  }
}
```

- [ ] **Step 5: Modify `storage.rules`**

```
rules_version = '2';

// Property photos are uploaded directly from the browser (dashboard) via the
// Firebase client SDK, so these rules are what actually protects uploads.
service firebase.storage {
  match /b/{bucket}/o {
    match /properties/{propertyId}/{fileName} {
      allow read: if true;
      allow write: if request.auth != null
        && request.resource.size < 5 * 1024 * 1024
        && request.resource.contentType.matches('image/.*');
    }
  }
}
```

- [ ] **Step 6: Verify the build**

Run: `npm run build`
Expected: succeeds with zero references to `Vehicle`/`vehicle` types or trade-in files remaining.

Run: `npm run lint`
Expected: no errors.

- [ ] **Step 7: Redeploy Firestore and Storage rules to the linked project**

Run: `firebase deploy --only firestore:rules,storage --project argus-new-e1c32`
Expected: `Deploy complete!` — same command pattern already used earlier in this project to link the Firebase project.

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "chore: remove trade-in feature and legacy vehicle files; redeploy rules

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

## Task 9: Final verification pass

**Files:** none (verification only).

**Interfaces:** none.

- [ ] **Step 1: Grep for leftover car-domain references**

Run: `grep -riE "vehicle|dealio|trade-in|tradein" --include="*.ts" --include="*.tsx" -r app components lib types`
Expected: no matches (a match here means a Task above missed a spot — go back and fix it before continuing).

- [ ] **Step 2: Full production build**

Run: `npm run build`
Expected: succeeds cleanly, no type errors, no missing-module errors.

- [ ] **Step 3: Full lint pass**

Run: `npm run lint`
Expected: no errors or warnings.

- [ ] **Step 4: Manual smoke test**

Run: `npm run dev`, then in a browser:
1. Load `/` — hero, search bar, "Propiedades Destacadas" (if any published properties exist), features, agency-highlight, about, financing/mortgage simulator, contact, and footer all render with real-estate copy and no "Dealio"/vehicle text visible.
2. Load `/listings` — filters (type, dormitorios, zona, precio) render and, once at least one property exists, filtering narrows the grid correctly.
3. Sign in to `/dashboard` (requires the Authentication + Admin SDK setup already flagged as outstanding in the spec) → `/dashboard/properties` → create a property with photos → verify it appears in the table → publish it.
4. Visit the published property's public page at `/properties/<id>` → verify specs, price, WhatsApp button, and the lead form render.
5. Submit the lead form → confirm it shows up under `/dashboard/leads` → "Consultas de propiedades".
6. Edit the property from `/dashboard/properties/<id>/edit`, change a field, save, and confirm the change reflects on the public page after a refresh.
7. Delete the test property from the dashboard and confirm it disappears from `/listings`.

- [ ] **Step 5: Record completion**

No commit needed for this task (verification only) unless a fix was required in Step 1 — in that case, amend the relevant earlier task's commit or add a small follow-up commit describing the fix.
