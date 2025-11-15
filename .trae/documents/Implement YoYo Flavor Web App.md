## PRD Summary (Updated)
- Bilingual SPA with public pages and secured admin (`YoyoPRD.md:28–52`).
- Requirement update: premium, visually rich UI to attract/retain visitors; deploy on Vercel free plan.

## Technical Decisions
- UI Library: Material-UI (MUI) + custom design system (tokens, themes) for consistent, high-quality visuals; Framer Motion for animations.
- Styling: MUI theme + CSS variables (brand palette) and utility classes for key actions (`YoyoPRD.md:98–103`).
- Routing & i18n: React Router with `/en` and `/zh`; dictionary-based translations (`YoyoPRD.md:57,65`).
- State & Data: React Context (locale/admin key) + React Query for data fetching/caching.
- Persistence (Vercel-friendly): `@vercel/blob` for JSON data and images (write persistence across serverless invocations), abstracted via a data access layer to keep future Prisma migration simple.

## Elevated UI/UX Design
- Home: immersive hero (animated gradient, subtle parallax, micro-interaction CTA), business hours in a glass-card grid; responsive illustrations.
- Menu: rich item cards (elevation, hover reveal, badges), smooth filter transitions, incremental search, skeleton loaders.
- Gallery: masonry grid with lazy-loading, lightbox viewer, motion-based entrance.
- Blog: editorial layout with hero images, readable typography, related posts, pagination.
- Reviews: stacked cards with star animations, photo thumbnails, expandable comments, progressive image loading.
- Flavor Quiz: playful stepper with persona illustrations, dynamic progress, animated results; WhatsApp share.
- Contact: branded map embed, smart validation, animated success states; one-tap call/WhatsApp.
- Theme: dark/light modes; accessible contrast; custom iconography.

## Data Models
- JSON collections: contacts, menu, posts, reviews, likes, comments, settings (`YoyoPRD.md:79–92`).
- Stored in `@vercel/blob`; provide local file fallback for dev.

## Implementation Phases
### Phase 0: Foundations
- App scaffold, router with localized namespaces; global theme and tokens.
- i18n dictionaries; locale switcher and persistence.
- Data layer: blob client utilities, React Query setup, validation schemas.

### Phase 1: Public Pages + Motion
- Build all public pages with premium UI components and motion patterns.
- Implement menu filters/search/likes with cached updates and optimistic UI.
- Integrate gallery lightbox and lazy-loading.

### Phase 2: Flavor Quiz
- Multi-step flow, persona mapping to menu recommendations, animated results; WhatsApp share.

### Phase 3: Admin Dashboard
- Encrypted admin key unlock; contacts management; settings (logo/banner); blog CRUD; review moderation.
- Image uploads via `@vercel/blob` with size/type checks.

### Phase 4: APIs & Persistence
- Serverless endpoints for all models (read/write); concurrency-safe writes to blob.
- Abstraction layer to enable future Prisma migration with minimal changes.

### Phase 5: i18n, Accessibility, SEO
- Localized routes and content; aria, keyboard nav, contrast.
- Route-level metadata, JSON-LD business schema, OGP images; localized sitemaps.

### Phase 6: Testing & Deployment
- Unit/integration tests; accessibility checks (axe) and motion performance budgets.
- CI; deploy to Vercel (free plan) with serverless functions and blob storage.

## Acceptance Criteria (Measurable)
- Lighthouse: Performance ≥ 90, Accessibility ≥ 95, Best Practices ≥ 90, SEO ≥ 90 (mobile on Vercel free).
- CLS < 0.1, LCP ≤ 2.5s on home/menu pages.
- Bilingual routes work; dictionary coverage ≥ 95% of strings.
- Menu: filter/search with ≤ 150ms perceived response; likes persist.
- Quiz: completes with recommendations; WhatsApp share opens with prefilled text.
- Contact form: validated, persisted, clear success/error feedback.
- Admin: unlock by encrypted key; CRUD operations succeed; images upload and render.
- SEO metadata + JSON-LD present; localized sitemap served.

## Risks & Mitigations
- Serverless persistence: use `@vercel/blob` (or Vercel KV for counters) to avoid ephemeral FS.
- Media storage costs/performance: compress images and enforce size caps; lazy-load and responsive srcsets.
- Motion vs performance: limit heavy animations; prefer transform/opacity; use reduced-motion respects OS setting.

## Deliverables
- Source code, tests, i18n dictionaries, data access layer, serverless functions, deployment configuration.
- Design tokens/theme and motion guidelines.

## Timeline (Indicative)
- Week 1: Foundations + premium public UI (home/menu/gallery/blog/reviews/contact).
- Week 2: Flavor quiz + persistence + image handling; SEO/i18n polishing.
- Week 3: Admin dashboard + testing + performance/accessibility targets + Vercel deployment.

## Assumptions
- Choose MUI + Framer Motion; persistence via `@vercel/blob`; deploy on Vercel free.
- Local dev can use filesystem; production uses blob.

Please confirm this updated plan (premium UI + Vercel) so I can proceed with implementation.