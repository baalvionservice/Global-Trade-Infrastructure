# `src/app/(public)/` — Public & Onboarding Surface

The crawlable, unauthenticated marketing site plus the institutional onboarding wizards. Wrapped by `layout.tsx` in the `InstitutionalHeader` / `InstitutionalFooter` shell.

## Routes

| Route | File | Purpose |
|-------|------|---------|
| `/` | `page.tsx` → `_components/home-client.tsx` | Home — Global Trade OS hero + value proposition. Server component owns SEO + `SoftwareApplication` JSON-LD. |
| `/platform` | `platform/` | Platform overview. |
| `/banks`, `/governments`, `/enterprises`, `/logistics` | audience folders | Audience solution pages (shared `_components/solution/solution-page.tsx`). |
| `/pricing`, `/about`, `/contact` | folders | Pricing, company, contact. |
| `/privacy`, `/terms` | folders | Legal. |
| `/onboard` | `onboard/page.tsx` | Onboarding entry / department picker. |
| `/onboard/[department]` | `onboard/[department]/page.tsx` | Config-driven institutional wizard. |
| `/onboard/buyer`, `/onboard/seller` | folders | Buyer/seller onboarding tracks. |
| `/access/request`, `/access/pending` | `access/` | Access request + pending states. |

## Onboarding (`onboard/`)

- **`_lib/department-configs.ts`** — data-driven definitions per persona (banking/customs/logistics/enterprise): each declares steps, fields, document uploads, and compliance-screening checks. Add a persona by adding a config, not code.
- **`_components/department-wizard.tsx`** — the shared `<DepartmentWizard>` that renders any config: form/docs steps → an animated compliance-screening pass → a "submitted for review" terminal state. Submits via `@/services/onboarding-service` to the governance review queue. **Never grants client-side access** — real access comes from a backend session after review.
- **`_components/wizard-stepper.tsx`** — step progress indicator.

## Conventions

- Pages are server components that export `pageMetadata(...)` from `@/lib/seo` and render interactive client subtrees.
- Every public route here is listed in `app/sitemap.ts` / `app/robots.ts` allow lists; keep them in sync.
