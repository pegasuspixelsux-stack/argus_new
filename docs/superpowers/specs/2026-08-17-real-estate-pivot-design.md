# Real Estate Pivot — Data Model & Homepage (Design)

Status: approved by user, pending implementation plan.
Scope: **Steps 1 & 3 only** from the original request (data model/inventory
refactor + homepage section overhaul). Step 2's deeper dashboard/lead-flow
work (e.g. viewing-booking scheduling) and Step 4 (git history reset) are
explicitly out of scope for this spec and will get their own brainstorm/plan
later.

## Background

"Argus" (working repo `argus_new`, previously branded "Dealio" in the UI) is
a Next.js + Firebase (Firestore/Storage/Auth) car-dealership platform: public
marketing homepage, a public inventory/detail flow, and an authenticated
dashboard for CRUD + lead management. We are pivoting the same design system,
lead-capture architecture, and dashboard shell to a real estate listings
platform, replacing every vehicle-specific concept with a property-listing
equivalent.

## Decisions (confirmed with user)

- **Language/locale:** stays Spanish (`es-UY`), USD pricing, same tone/voice.
- **Brand name:** "Argus" (replaces "Dealio" everywhere — logo, footer,
  metadata, page titles, contact email).
- **Trade-in section:** removed entirely (no real estate equivalent kept).
- **Financing section:** kept, repurposed into a mortgage/down-payment
  simulator (same calculator UI/formula, relabeled).
- **Units:** square meters (m²), matching the Spanish/Uruguay locale.
- **Listing type:** sale only — no rental/lease concept. Flagged as a
  possible future addition, not built now.
- **Data model:** approved as drafted below, no address field added (title +
  neighborhood + city is enough for this pass).

## Data model

Replaces `types/vehicle.ts` with `types/property.ts`:

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
  areaM2: number | null;      // built/interior square meters
  lotAreaM2: number | null;   // parcel size — relevant for Land/House
  yearBuilt: number | null;
  parkingSpaces: number | null;
}

export interface Property {
  id: string;
  title: string;              // replaces make/model/year as the headline
  propertyType: PropertyType;
  neighborhood: string;       // replaces make
  city: string;                // replaces model, roughly
  description: string;
  details: PropertyDetails;
  photos: PropertyPhoto[];
  priceDisplay: number | null;
  priceCompareAt: number | null;
  status: PropertyStatus;
  createdAt: string;
  updatedAt: string;
}

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

Fields with no real estate equivalent (`vin`, `exteriorColor`,
`interiorColor`, `transmission`, `fuelType`, `mileage`) are dropped, not
renamed. `bodyType` becomes `propertyType` (enum instead of free text, to
drive the search/filter UI). `make`/`model`/`year` collapse into
`title` + `neighborhood` + `city` rather than a forced 1:1 rename, since cars
have a rigid make/model taxonomy and properties don't.

## Firebase project

Backing infra moves to a **new, dedicated Firebase project**
(`argus-new-e1c32`, display name "argus-new") instead of reusing the old
`dealio-new-7319f` project — same clean-slate spirit as the Step 4 git
reset, applied to the backend. No data migration — all existing data is car
inventory being discarded anyway. Status as of linking (2026-08-17):

- `.firebaserc` and `firebase.json` retargeted to `argus-new-e1c32`. Done.
- `.env.local` `NEXT_PUBLIC_FIREBASE_*` updated to the new project's web app
  config. Done.
- `firestore.rules`, `firestore.indexes.json`, `storage.rules` deployed to
  `argus-new-e1c32` (still the car-domain rules for now — they'll be
  redeployed with the `vehicles`→`properties` rename once that code change
  lands). Done.
- Default Storage bucket already existed on the project — no manual console
  step was needed there.
- **Firebase Authentication is not yet initialized on this project**
  (`CONFIGURATION_NOT_FOUND` — there's no API path to enable it headlessly).
  User must visit Console → Authentication → Get started → enable
  Email/Password sign-in, then add the first dashboard user. Blocks dashboard
  login until done.
- **Admin SDK service account key not yet generated** — `.env.local`'s
  `FIREBASE_ADMIN_CLIENT_EMAIL`/`FIREBASE_ADMIN_PRIVATE_KEY` are cleared
  (old project's key removed, not reused). User must generate one via
  Console → Project settings → Service accounts → Generate new private key,
  for `argus-new-e1c32`. Blocks all server-side Firestore/Storage/session
  access until done — `isFirebaseAdminConfigured()` fails closed in the
  meantime rather than crashing.
- Not yet done: Vercel project env vars (production/preview) still point at
  the old project — needs `vercel env` updates before deploying, out of
  scope until an actual deploy is requested.

## Firestore

- Collection `vehicles` → `properties`. Same document shape mapping as
  `toVehicle()` today, rewritten as `toProperty()` with the new fields
  (nullable numeric fields default to `null`, `propertyType` unioned same as
  `status`).
- Collection `leads` unchanged in name; stored fields rename
  `vehicleId/vehicleTitle` → `propertyId/propertyTitle`.
- Collection `tradeInLeads` and its rules block: **deleted** (trade-in
  removed).
- `contactMessages` and `settings` rules: unchanged.
- `firestore.rules`: `match /vehicles/{vehicleId}` → `match
  /properties/{propertyId}`, same allow-rules (published readable by anyone,
  everything else requires signed-in dashboard user; all real reads/writes
  go through firebase-admin server-side anyway, so this is a safety-net
  rename, not a behavior change).
- Storage path convention `vehicles/{id}` (used by the photo uploader) →
  `properties/{id}`.

## File & route renames

Mechanical propagation of the type rename through its direct consumers —
this is not new dashboard functionality, just keeping the app compiling
under the new domain vocabulary.

| Current | New |
|---|---|
| `types/vehicle.ts` | `types/property.ts` |
| `lib/data/vehicles.ts` | `lib/data/properties.ts` |
| `lib/actions/vehicles.ts` | `lib/actions/properties.ts` |
| `lib/data/leads.ts` / `lib/actions/leads.ts` | kept, fields renamed |
| `lib/data/trade-ins.ts` / `lib/actions/trade-ins.ts` | deleted |
| `components/vehicle-card.tsx` | `components/property-card.tsx` |
| `components/vehicle-search-bar.tsx` | `components/property-search-bar.tsx` |
| `components/featured-vehicles.tsx` | `components/featured-properties.tsx` |
| `components/vehicle/lead-form.tsx` | `components/property/lead-form.tsx` |
| `components/vehicle/photo-gallery.tsx` | `components/property/photo-gallery.tsx` |
| `components/vehicle/price-display.tsx` | `components/property/price-display.tsx` |
| `components/vehicle/whatsapp-button.tsx` | `components/property/whatsapp-button.tsx` |
| `components/inventory/inventory-view.tsx` | `components/listings/listings-view.tsx` |
| `components/dashboard/vehicle-form.tsx` | `components/dashboard/property-form.tsx` |
| `components/dashboard/vehicle-table.tsx` | `components/dashboard/property-table.tsx` |
| `components/dashboard/dashboard-nav-items.ts` | "Vehículos" → "Propiedades", icon `Car` → `Building2` |
| `components/trade-in-section.tsx`, `components/trade-in-form.tsx` | deleted |
| `components/financing-calculator.tsx`, `components/financing-section.tsx` | kept, relabeled (mortgage/down-payment simulator) |
| `components/financing-partners-ticker.tsx` | kept, relabeled as lender/bank partner ticker |
| `app/vehicles/[id]/page.tsx` | `app/properties/[id]/page.tsx` |
| `app/inventory/page.tsx` | `app/listings/page.tsx` |
| `app/dashboard/vehicles/page.tsx`, `vehicles/new/page.tsx`, `vehicles/[id]/edit/page.tsx` | `app/dashboard/properties/...` (same structure) |

Untouched: `components/ui/*`, `components/auth/*`, `lib/firebase/*`,
`lib/data/settings.ts`, `lib/data/users.ts`, `app/dashboard/settings`,
`app/dashboard/users`, `app/login`, dashboard chrome (nav shell, mobile nav,
sign-out button, status badge), `components/scroll-reveal.tsx` and the other
currently-uncommitted WIP edits already in the working tree (unrelated to
this pivot — preserved as-is, built on top of).

## Brand rename

"Dealio" → "Argus" in: `components/logo.tsx` wordmark,
`components/site-footer.tsx` (copyright line, tagline, contact email
`hello@dealio.app` → `hello@argus.app`), `app/layout.tsx` metadata, and every
page-level `<title>`/`generateMetadata` string (`app/vehicles/[id]/page.tsx`
→ `app/properties/[id]/page.tsx`, `app/inventory/page.tsx` →
`app/listings/page.tsx`, dashboard pages).

## Homepage, section by section

- **Hero** (`components/hero-section.tsx`): headline → "Encuentra tu próximo
  hogar sin complicaciones"; badge "Stock actualizado todas las semanas" →
  "Nuevas propiedades cada semana"; body copy drops "vehículos revisados" for
  "propiedades verificadas, financiación flexible"; primary CTA "Ver stock
  disponible" → "Explorar propiedades"; background image swapped for a
  real-estate photo (placeholder path, user supplies final asset).
- **Search bar** (`property-search-bar.tsx`, mirrored in
  `listings-view.tsx` filters): Property Type (Condo/House/Single Family
  Home/Land) replaces Make; Bedrooms replaces Year; Location/Neighborhood
  (free text) replaces Model; Price Range kept as-is (same UI, same
  ranges).
- **Featured listings** (`featured-properties.tsx` / `property-card.tsx`):
  heading "Unidades Seleccionadas" → "Propiedades Destacadas"; card shows
  bedrooms · bathrooms · m² instead of km; fallback icon `Car` → `Building2`.
- **Features section**: 3 value-prop cards rewritten — verified listings
  (title/condition checked), transparent pricing, support through closing —
  same 3-card layout, same icons where they still make sense.
- **Dealer-highlight → Agency-highlight**: "cada auto revisado" → "cada
  propiedad verificada" (deed/title checked, condition assessed, photos
  professionally shot); CTA still links to the listings anchor.
- **About**: "Gente que entiende de autos, no solo de ventas" → "Gente que
  entiende de propiedades, no solo de ventas"; stats swap to properties
  sold / avg. rating / response time.
- **Financing → Mortgage simulator**: heading "Financiación" kept as a
  section id but relabeled "Simulá tu crédito hipotecario"; calculator
  fields relabeled (price → property price, term in years instead of
  36-84 months) but the amortization math is unchanged.
- **Financing partners ticker**: relabeled as bank/lender partner logos.
- **Trade-in section**: removed from `app/page.tsx`, its nav anchor
  (`#trade-in`) dropped from header/footer links.
- **Contact & footer**: copy and link labels swapped (`Inventario` →
  `Propiedades`), `Financiación` link kept, trade-in link removed, footer
  tagline rewritten, copyright brand swapped.

## Out of scope (explicitly deferred)

- Step 2 deep dashboard/lead work: booking-a-viewing scheduling UI, any
  lead-status workflow beyond the mechanical field rename already covered
  above.
- Step 4: disconnecting/reinitializing git history and reconnecting to a new
  GitHub repo.
- Rentals/lease listing type.
- Real photography/background imagery sourcing (placeholders only).
- Any changes to auth, settings, or user management.

## Testing / verification

- `npm run build` (or `next build`) after the rename to catch broken
  imports/types across the renamed files.
- `npm run lint` for the new component/file names.
- Manual smoke check of: homepage renders all sections, `/listings` filters
  work, `/properties/[id]` renders with a seeded property doc, dashboard
  `/dashboard/properties` CRUD flow (create → publish → edit → delete),
  lead form submission on a property detail page appears in
  `/dashboard/leads`.
- No automated test suite currently exists in the repo (confirmed via file
  listing) — verification here is build/lint/manual, matching existing
  project conventions.
