# Editorial homepage redesign — design spec

**Date:** 2026-08-18
**Status:** Approved, pending implementation plan

## Goal

Reposition Argus's public marketing site (homepage, listings page, property
detail, footer) from a "boutique real estate portal" tone to an editorial,
ultra-luxury tone — comparable to a high-end lifestyle magazine (Architectural
Digest / Robb Report) rather than a listings portal. This is a content, layout,
and typography change. It does **not** touch data models, the dashboard, auth,
or Storage/Firestore — those are out of scope.

## Non-goals / explicit exclusions

- The `/dashboard` admin UI is untouched — stays as-is, functional, plain tone.
- No literal price filtering. "No property reads as entry-level" is a *tone*
  instruction only — real listings and their real prices keep showing exactly
  as loaded from Firestore, regardless of value.
- Property card specs (dorm./baños/m²) stay as real structured data pulled
  from `property.details` — only their typographic presentation changes
  (small caps, thin separators, more spacing). No per-property hand-written
  prose replaces them, since that data differs per listing and isn't
  something a template rewrite can author.
- No new dependencies. The CSS marquee for testimonials uses plain CSS
  `@keyframes`, not a new animation library (motion/react is already a
  dependency and unnecessary for a simple infinite scroll).

## New homepage section order (`app/page.tsx`)

1. **Hero** (`hero-section.tsx`) — full width, unchanged structure
2. **Mini Introduction** (`who-we-are-section.tsx`) — `max-w-[960px]`,
   2-column: heading left, body text right
3. **Propiedades Destacadas** (`featured-properties.tsx` /
   `property/featured-carousel.tsx`) — contained to `max-w-[960px]` (was
   full-bleed viewport width)
4. **Sobre Nosotros / Editorial Expansion** (`about-section.tsx`, narrative
   half only) — `max-w-[960px]`, 2-column: heading left, body text right
   (same rhythm as section 2)
5. **Testimoniales** (`testimonials-section.tsx`, **new**) — full-width CSS
   marquee ticker
6. **Nuestro Equipo** (`team-section.tsx`, **new — extracted from
   `about-section.tsx`**) — `max-w-[960px]`, grid of leadership cards
7. **Contacto** (`contact-section.tsx`) — `max-w-[960px]`, 2-column
   (institutional info left, existing `ContactForm` right); absorbs the
   invitation copy from `advisory-cta-section.tsx`
8. **Footer** (`site-footer.tsx`) — unchanged structure, tagline copy updated

**Removed from the homepage:** `features-section.tsx` ("Por qué elegirnos"),
`dealer-highlight-section.tsx` ("Nuestro proceso"), `stats-section.tsx`
(500+/4.8★/48h counters), `advisory-cta-section.tsx`. Their component files
are deleted (confirmed with user — nothing left unused/dead).

## Section-by-section content

### 1. Hero (`hero-section.tsx`)
- Eyebrow: "Consultoría patrimonial en Punta del Este"
- Headline (`HEADLINE` const): "Privilegio y estrategia en Punta del Este"
- Subhead: "Asesoramos a un perfil exigente en la adquisición, gestión y
  valorización de activos inmobiliarios de excepción en la península y su
  entorno."
- Buttons: "Solicite una consulta privada" (→ `#contact`) · "Explorar el
  portafolio" (→ `#listings`)

### 2. Mini Introduction (`who-we-are-section.tsx`)
2-column, heading left / text right, `max-w-[960px]`. Final copy (supplied
by user, supersedes earlier draft):
- Eyebrow: "Silencio, Estilo y Exclusividad"
- Heading (left column): "El Activo Atlántico"
- Body (right column): "La península y sus extensiones costeras exigen un
  criterio que trasciende el corretaje convencional. Argus opera como una
  consultoría patrimonial boutique, donde cada transacción responde a una
  curaduría rigurosa y a un profundo dominio del mercado de alta gama en
  Punta del Este." Keep the `#about` in-page anchor link, pointing at
  section 4 below.

### 3. Propiedades Destacadas (`featured-properties.tsx` +
`property/featured-carousel.tsx`)
- Wrap in `max-w-[960px]` container (`featured-properties.tsx`'s `<section>`).
- Inside `featured-carousel.tsx`: remove the viewport-edge-to-edge treatment;
  the `aspect-video` image and its overlay (heading, property info, prev/next
  controls, dot indicators) all live inside the 960px box instead of the
  image spanning full width with text aligned to `max-w-6xl`.
- Section heading overlay copy: "Propiedades Destacadas" → "Arquitectura de
  una Selección Inigualable"
- Subtitle stays functional/short (the overlay has limited space and already
  shows a `line-clamp-2` per-property description below it): "Una selección
  de residencias y activos elegidos por nuestro equipo."
- **Separate from the template code**: the user supplied a full example
  listing description in the new editorial voice ("Activo Residencial —
  Playa Brava": "Una residencia frente al Atlántico no es meramente un
  espacio habitable..." plus three labeled points — Planta y Dimensión,
  Privacidad y Confort, Infraestructura Residencial). Per the non-goals
  above, per-property description text is real Firestore data entered via
  the dashboard, not something the homepage template hardcodes — so this
  doesn't get wired into `featured-carousel.tsx` code. It's a strong
  reference for the *tone* a demo listing's description should have. As an
  optional follow-up (separate from this plan), we can update one seed/demo
  property's `description` field in Firestore via the dashboard to this
  text so the carousel shows it live — flag if you want that done too.

### 4. Sobre Nosotros / Editorial Expansion (`about-section.tsx`, narrative
half — team grid extracted out, see section 6)
2-column, heading left / text right, `max-w-[960px]`, `id="about"`:
Final copy (supplied by user, supersedes earlier draft):
- Eyebrow: "Criterio y Patrimonio"
- Heading (left): "La adquisición o desinversión de propiedades de valor
  elevado requiere un rigor técnico indiscutible" (or, if that reads too
  long for an `h2` at this size, split eyebrow/heading differently during
  implementation — the two paragraphs below must both appear regardless)
- Body (right), absorbing the retired sections' key ideas as flowing prose
  instead of a 3-pillar list:
  "En Argus no intermediamos transacciones; gestionamos activos con
  absoluta confidencialidad y una perspectiva estratégica orientada a la
  preservación del valor. Cada propiedad integrada en nuestra cartera es
  sometida a una exhaustiva auditoría legal, dominial y estructural antes
  de su presentación. Sin improvisaciones, sin intermediarios superfluos.
  Garantizamos que el marco normativo y la materialidad del activo cumplan
  con las expectativas de inversores y compradores que reconocen la
  excelencia."
- Keep the existing photo block from the current `about-section.tsx` (the
  large image above/beside the intro) — reposition as needed for the new
  2-column layout; it doesn't need to change images.

### 5. Testimoniales (`testimonials-section.tsx`, new)
- Full-width CSS marquee: a single row of quote cards, duplicated once in the
  DOM and animated with `@keyframes` `translateX(0 → -50%)` on an infinite
  loop, so the loop point is invisible. Pause via
  `@media (prefers-reduced-motion: reduce)` (set `animation-play-state:
  paused` or disable the animation entirely) for accessibility.
- Content: fictional client quotes with invented name + a discreet
  descriptor, matching the same clearly-placeholder convention already used
  for the team and property photos. First two supplied by user (final,
  verbatim); two more added in matching voice/register purely to give the
  marquee enough content to loop without feeling repetitive in one viewport
  — swap or trim these two if you'd rather ship with only the original pair:
  1. "La discreción y la precisión técnica con la que Argus gestionó
     nuestra adquisición en la costa superaron cualquier estándar previo en
     el mercado regional." — Inversor Privado, Zúrich / Punta del Este
  2. "Un servicio que entiende de tiempos, valor y patrimonio sin los
     artificios de la intermediación tradicional." — Propietario, La Barra
  3. *(added)* "Cada etapa del proceso se manejó con una reserva que rara
     vez se encuentra en el mercado inmobiliario." — Familia residente,
     José Ignacio
  4. *(added)* "No hubo una sola gestión que no estuviera respaldada por
     un criterio técnico sólido." — Inversor institucional
- Typography: quotes set in `font-heading` (Fraunces) italic, generous
  letter/line spacing, on a contrasting full-bleed background band (e.g.
  `bg-foreground text-background` or similar — pick during implementation to
  fit the palette).

### 6. Nuestro Equipo (`team-section.tsx`, new — extracted from
`about-section.tsx`)
`max-w-[960px]`, grid (2–4 columns depending on viewport, same responsive
breakpoints as the current team grid):
- Eyebrow/heading (supplied by user): "Dirección y Liderazgo Patrimonial",
  with intro line "El valor de una firma reside en la solvencia de quienes
  la conducen. Nuestro equipo asiste de forma directa y reservada en cada
  etapa del proceso."
- Cards: same 4 existing people (Martina Ferreira, Lucas Bianchi, Sofía
  Ramírez, Diego Otero), circular avatars unchanged in shape, but the photos
  get a `grayscale` CSS filter applied for the "dramatic B&W editorial
  portrait" treatment described in the brief (no real studio photography
  available, so this is a treatment on the existing curated stock photos,
  not a claim of real studio portraits).
- Role labels (supplied by user, supersedes earlier draft):
  - Martina Ferreira: "Dirección de Operaciones y Activos" (was "Asesora
    senior")
  - Lucas Bianchi: "Estrategia de Inversión y Finanzas Inmobiliarias" (was
    "Especialista en inversiones")
  - Sofía Ramírez: "Gestión Patrimonial y Alquileres Exclusivos" (was
    "Alquileres y gestión")
  - Diego Otero: "Fundador y Director Ejecutivo" (was "Fundador y asesor")
- Email/phone stay as-is per person, presented soberly (unchanged from
  current markup — small icon + text).
- Contact links (email/phone icons) stay as-is, presented soberly (already
  understated — small icon + text, no change needed there beyond inheriting
  the new square-corner/typography system already in place).

### 7. Contacto (`contact-section.tsx` + `contact-form.tsx`)
- Container: `max-w-6xl` → `max-w-[960px]`.
- Heading (supplied by user): "Solicitud de Consulta Privada"
- Intro paragraph, replacing the current body text and absorbing
  `advisory-cta-section.tsx`'s invitation: "Para iniciar un proceso de
  adquisición, tasación o auditoría de activos, por favor establezca
  contacto directo con nuestra oficina de representación. Un asesor senior
  se comunicará con usted bajo rigurosa confidencialidad."
- Left column relabeled "Coordenadas Institucionales" — `CONTACT_ITEMS`
  values stay factual/unchanged (Montevideo address, email, phone, hours);
  only the column's own heading changes, not the data.
- Right column relabeled "Formulario de Acceso Privado" — this is
  `contact-form.tsx`'s `CardTitle` (currently "Envíanos un mensaje").
  **Field labels only** (no schema change — `SubmitLeadInput` already has
  exactly `name`, `email`, `message`, matching the wireframe's three
  fields):
  - "Nombre" → "Nombre Completo"
  - "Correo electrónico" → "Correo Electrónico" (unchanged)
  - "¿En qué te podemos ayudar?" (textarea label) → "Propósito de Inversión
    / Activo", placeholder updated to something like "Ej.: adquisición en
    Playa Brava, tasación de cartera, auditoría de un activo..."
  - Submit button: "Enviar mensaje" → "Enviar Solicitud"
  - Success message tone lightly adjusted to match register (keep the
    dynamic first-name interpolation, just formalize the wording)
- `advisory-cta-section.tsx` is deleted; its import and JSX usage removed
  from `app/page.tsx`.

### 8. Footer (`site-footer.tsx`)
- Tagline: "Compra, venta y financiación de propiedades, todo en un mismo
  lugar." → "Asesoramiento patrimonial y curaduría inmobiliaria en Punta del
  Este." (also fixes a stale reference to "financiación," a feature already
  removed in an earlier commit — f05edf1).
- No structural changes.

## Listings page (`app/listings/page.tsx`)
- `<h1>`: "Propiedades disponibles" → "El Portafolio"
- Subhead: "Filtra por tipo, dormitorios, zona y precio para encontrar tu
  próxima propiedad." → "Una selección curada de residencias y activos en
  Punta del Este y su entorno."
- `metadata.title` / `metadata.description` updated to match.
- Filter controls and property grid: unchanged functionally (still show real
  bed/bath/area/price data — only the page's framing copy changes).

## Typography

- `app/layout.tsx`: add Fraunces via `next/font/google`, exposed as a CSS
  variable (e.g. `--font-fraunces`).
- `app/globals.css`: `--font-heading: var(--font-sans)` →
  `--font-heading: var(--font-fraunces), Georgia, "Times New Roman", serif;`
  (the `--font-heading` token already exists in `@theme inline` and
  auto-generates a `font-heading` Tailwind utility — no new Tailwind config
  needed).
- Apply `font-heading` to headline (`h1`/`h2`/`h3`) elements in the sections
  listed above (2 through 7, plus the listings page H1). Do **not** apply it
  globally/to the dashboard — those headings keep the default sans sitewide
  because nothing there currently references `font-heading`.

## Files touched

**New:**
- `components/testimonials-section.tsx`
- `components/team-section.tsx`

**Modified:**
- `app/page.tsx` (section order + imports)
- `app/layout.tsx` (Fraunces font)
- `app/globals.css` (`--font-heading`)
- `app/listings/page.tsx` (copy)
- `components/hero-section.tsx`
- `components/who-we-are-section.tsx`
- `components/about-section.tsx` (narrative half only — team grid extracted)
- `components/featured-properties.tsx`
- `components/property/featured-carousel.tsx`
- `components/contact-section.tsx`
- `components/contact-form.tsx` (field/button label copy only)
- `components/site-footer.tsx`

**Deleted:**
- `components/features-section.tsx`
- `components/dealer-highlight-section.tsx`
- `components/stats-section.tsx`
- `components/advisory-cta-section.tsx`

## Testing / verification

No automated test suite exists in this repo (confirmed earlier — no
vitest/jest config). Verification is manual, via local dev server +
browser screenshot review of each section (as done for the prior square-
corners and boxed-section changes), plus `tsc --noEmit` before each deploy.

## Rollout

Same pattern as prior changes in this session: feature branch → commit →
push → (user reviews/asks for merge) → fast-forward merge to `main` →
`vercel --prod` after explicit confirmation.
