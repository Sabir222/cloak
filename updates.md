# Upgrade Plan

## Phase 1 — Safe minor/patch bumps (no breaking changes)

| Package                | Current    | Target                  |
| ---------------------- | ---------- | ----------------------- |
| `drizzle-orm`          | `^0.43.1`  | `^0.45.2`               |
| `drizzle-kit`          | `^0.31.1`  | `^0.31.10`              |
| `tailwindcss`          | `4.1.7`    | `4.3.1`                 |
| `@tailwindcss/postcss` | `4.1.7`    | `4.3.1`                 |
| `radix-ui`             | `^1.4.2`   | `^1.6.0`                |
| `react` / `react-dom`  | `19.1.0`   | `19.2.7`                |
| `@types/react`         | `^19.1.4`  | `^19.2.17`              |
| `@types/react-dom`     | `^19.1.5`  | `^19.2.3`               |
| `jose`                 | `^6.0.11`  | `^6.2.3`                |
| `swr`                  | `^2.3.3`   | `^2.4.1`                |
| `postcss`              | `^8.5.3`   | `^8.5.15`               |
| `bcryptjs`             | `^3.0.2`   | `^3.0.3`                |
| `autoprefixer`         | `^10.4.21` | `^10.5.0`               |
| `tailwind-merge`       | `^3.3.0`   | `^3.6.0`                |
| `tw-animate-css`       | `^1.3.0`   | `^1.4.0`                |
| `clsx`                 | `^2.1.1`   | (already latest semver) |

## Phase 2 — Next.js

| Package | Current            | Target        | Risk   |
| ------- | ------------------ | ------------- | ------ |
| `next`  | `15.6.0-canary.59` | `15.x` stable | Medium |

- Pin to latest stable `15.x` release (not canary)
- Remove `experimental.clientSegmentCache: true` from `next.config.ts` — likely removed/changed in stable
- Test that middleware, server actions, and routes still work

## Phase 3 — Stripe ✅

| Package  | Current   | Target    | Risk   |
| -------- | --------- | --------- | ------ |
| `stripe` | `^18.1.0` | `^22.2.2` | Medium |

- 4 major versions behind. Check Stripe migration guides for:
  - `payment_method_types` array → might need updating
  - `expand` behavior changes
  - `subscription.items.data[0]?.plan` → may need `.price` instead
- The API version in `stripe.ts` is pinned to `2025-04-30.basil` — verify it's still supported

### Completed

- Upgraded `stripe` from `18.1.0` → `22.2.2`.
- Updated pinned `apiVersion` in `lib/payments/stripe.ts` from `'2025-04-30.basil'` → `'2026-05-27.dahlia'` (the version shipped with stripe-node v22).
- Replaced deprecated `subscription.items.data[0]?.plan` with `.price` in `handleSubscriptionChange` (`lib/payments/stripe.ts`). The `plan` field is no longer reliably populated under the new API version.
- Fixed a pre-existing bug: the webhook handler cast `plan.product` (a string ID, since the event subscription is not expanded) to `Stripe.Product` and read `.name`, which returned `undefined`. Now retrieves the product by ID to get the real name.
- `payment_method_types: ['card']` and `expand` calls verified compatible — no changes needed.
- `tsc --noEmit` and `next build` both pass.

## Phase 4 — lucide-react ✅

| Package        | Current    | Target    | Risk   |
| -------------- | ---------- | --------- | ------ |
| `lucide-react` | `^0.511.0` | `^1.21.0` | Medium |

- Major bump from 0.x to 1.x. Some icon names may have changed or been removed
- Check all `lucide-react` imports in components: `Check`, `Loader2`, `PlusCircle`
- Verify no icon renames needed

### Completed

- Upgraded `lucide-react` from `0.511.0` → `1.21.0`.
- Only one breaking change: the `Github` brand icon was removed in v1 (brand icons were moved out of lucide). All other icons used in the codebase (`Check`, `Loader2`, `PlusCircle`, `CircleIcon`, `ChevronRightIcon`, etc.) are still exported unchanged.
- Replaced the two `Github` usages in `components/landing/navbar.tsx` with a local `GithubIcon` SVG component (preserves the GitHub mark).

## Phase 5 — zod ✅

| Package | Current   | Target   | Risk |
| ------- | --------- | -------- | ---- |
| `zod`   | `^3.24.4` | `^4.4.3` | High |

- v4 is a significant rewrite with breaking API changes:
  - `.safeParse()` return format changed
  - `z.object({}).strict()` is now default
  - Error message format changed (`.errors[0].message` path may differ)
  - Some methods may be renamed or removed
- Update all validation logic in `app/(login)/actions.ts` and `lib/auth/middleware.ts`

### Completed

- Upgraded `zod` from `3.24.4` → `4.4.3`.
- `ZodError` no longer has an `.errors` array — renamed to `.issues`. Updated both `validatedAction` and `validatedActionWithUser` in `lib/auth/middleware.ts` to use `result.error.issues[0].message`.
- `.safeParse()` return format (`{ success, data, error }`) is unchanged in v4 — no other action changes needed.
- `z.object({}).strict()` being default in v4 did not affect us — the action schemas use plain `z.object({...})` and all form submissions are controlled, so unknown-key rejection isn't an issue.
- Schemas in `app/(login)/actions.ts` (`signInSchema`, `signUpSchema`, `updatePasswordSchema`, `deleteAccountSchema`, `updateAccountSchema`, `removeTeamMemberSchema`, `inviteTeamMemberSchema`) all use standard APIs that are compatible with v4.

## Phase 6 — TypeScript ✅

| Package      | Current  | Target   | Risk   |
| ------------ | -------- | -------- | ------ |
| `typescript` | `^5.8.3` | `^6.0.3` | Medium |

- TS 6 has stricter checks. Expect errors around:
  - `any` usage in `ActionState` type (`lib/auth/middleware.ts:9`)
  - Unused variables
  - Stricter type narrowing
- Run `tsc --noEmit` after upgrading and fix all errors

### Completed

- Upgraded `typescript` from `5.8.3` → `6.0.3`.
- Removed deprecated `baseUrl: "."` from `tsconfig.json` (TS 6 flags it; `paths` now resolves relative to the tsconfig directory without it). Kept the `next` plugin and `paths` mapping.
- Added `globals.d.ts` with an ambient `*.css` module declaration — TS 6 now requires explicit declarations for side-effect CSS imports (`import './globals.css'` in `app/layout.tsx`), which Next.js previously handled via its types.
- The `any` usage in `ActionState` (`lib/auth/middleware.ts:9`) compiled without error under TS 6 strict mode (it's an index signature, not a standalone `any`), so no change was needed there.
- No unused-variable or type-narrowing errors surfaced.

## Phase 7 — Cleanup ✅

- **Duplicated CSS variables** in `app/globals.css`: HSL colors defined twice (once via `@theme`, once in raw `:root`/`.dark`). Deduplicate to one source.
- **SWR promise fallback** in `app/layout.tsx:34-36`: Currently passes bare unresolved Promises. Should either await them or restructure to avoid unhandled rejections.
- **`label.tsx` unused htmlFor**: The `Label` component may pass unnecessary `htmlFor` attributes (shadcn convention change).
- **`server-only`** package in `dependencies`: Verify it's actually imported somewhere or remove if unused.

### Completed

- **Deduplicated `app/globals.css`**: removed the duplicate bare `:root`/`.dark` blocks (lines 172-229, already-HSL values) and the redundant `@theme inline` block (lines 235-264). The remaining `@theme` + `@layer base { :root {…} .dark {…} }` pair is the single source of truth, using shadcn v4's triple-value convention (`--background: 0 0% 100%`) wrapped by `hsl(var(--*))` in `@theme`.
- **SWR promise fallback**: extracted the `<SWRConfig>` into a new client component `components/swr-provider.tsx` so the `onError` handler can cross the Server→Client boundary. `app/layout.tsx` (a Server Component) now passes `fallback` (with the unresolved `getUser()`/`getTeamForUser()` promises) as a prop to `<SWRProvider>`. The global `onError` logs rejections instead of letting them surface as unhandled promise rejections.
- **`label.tsx` `htmlFor`**: inspected all 11 `htmlFor` usages — every one pairs with an `<Input id="…">`, so they're correct and necessary for accessibility. The `Label` component itself doesn't force `htmlFor`; no change needed.
- **`server-only`**: confirmed it is not imported anywhere in the codebase. Removed from `dependencies` via `pnpm remove server-only`.

## Phase 8 — Tests

- Add `vitest` with `@testing-library/react`
- Set up test coverage for:
  - Auth flow (sign-in, sign-up, session validation)
  - Middleware (protected routes, session sliding)
  - Stripe integration (checkout, webhook handling)
  - Database queries (getUser, getTeamForUser)
