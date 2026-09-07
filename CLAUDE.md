@AGENTS.md

# PartySpace — project rules

Full product spec: `PROJECT_SPEC (1).md` in the repo root. Read it before
starting any phase. **Build in the phases it defines, in order. Stop after
each phase and wait for review before starting the next one** — this is an
explicit instruction from the spec, not a suggestion.

## Where things stand

- **Phase 0 (Foundation) is done.** Next.js 15 (pinned, see below) + TS
  strict, Tailwind v4, shadcn/ui (`base-nova` style, Base UI primitives —
  see note below), full Prisma schema, Auth.js v5 (Credentials, email +
  password), role-based middleware, three dashboard shells, minimal night
  home page, registration/login/verify-email flow with a *temporary*
  console-logged "email" (see Notifications below).
- **Phase 1 (Registration and KYC) is done.** Role-specific KYC forms
  (`/kyc`), private document storage, admin KYC queue with approve/reject
  (`/admin/kyc`), real Profile pages (`/owner/profile`, `/host/profile`),
  audit logging, `assertKycApproved`/`canSubmitKyc` rules
  (`src/lib/rules/kyc.ts`). See "KYC (Phase 1)" below before touching it.
- Everything from Phase 2 onward (listings, notification engine,
  discovery, request flow, payments, admin completeness) is **not built
  yet**. Do not assume any of those models are wired up beyond the Prisma
  schema itself.
- **One thing built ahead of its phase, by explicit client request:**
  admin-managed hero background media (`/admin/hero`, `HeroMedia` model).
  The spec's Phase 4 plan was a photo crossfade of real listings — this
  generalizes that to admin-uploaded video or images, built now instead of
  in Phase 4 because the client asked for it directly. See "Hero
  background media" below before touching it.

## Site-wide additions beyond the spec (client-directed)

- **Party-club theme everywhere**, including dashboards/KYC/payment
  surfaces — see "Theme system" below.
- **Lenis smooth scroll** (`src/components/smooth-scroll-provider.tsx`),
  wrapping the whole app in the root layout. Skipped entirely under
  `prefers-reduced-motion` (falls back to native scrolling, not a
  degraded experience). If a future page needs raw, unsmoothed scroll
  (e.g. a data table with internal scroll, a map), test it under Lenis
  before assuming it just works — Lenis intercepts wheel/touch scroll
  app-wide by default.
- **Gmail SMTP** for real email delivery — see "Notifications" below.

## Hero background media (`/admin/hero`)

- `HeroMedia` (Prisma) — `type` (IMAGE/VIDEO), `url`, `sortOrder`,
  `isActive`. Files save to **local disk** at `public/uploads/hero/`
  (`src/lib/hero-media-storage.ts`), not S3 — same stopgap pattern as
  `src/lib/mail.ts`. `public/uploads/` is gitignored. This does not survive
  most redeploys (ephemeral filesystems) — swap `hero-media-storage.ts`'s
  two functions for S3 puts/deletes once real S3 presigned-upload infra
  exists (still not built — see "KYC" below, it hit the same gap);
  nothing else needs to change (same url-in, url-out shape).
- **Files added to `public/` after the server process starts don't get
  served by `next start` — confirmed empirically, not a guess.** A
  brand-new file 404s even on a direct request, with the file genuinely
  present on disk, until the server restarts. This is why hero media (and
  KYC documents, below) are served through route handlers that
  `readFile()` fresh on every request, never through a literal `public/`
  path. If you're tempted to write a new upload feature straight to
  `public/` and link it with a plain `<img src="/...">`, don't — it will
  work in `next dev` and then quietly 404 in production. `next/image`
  can't be used on these URLs either, for the same reason (its local
  optimizer expects a real `public/`-relative path) — use plain
  `<img>`/`<video>` with an eslint-disable comment explaining why, as done
  in `hero-background-media.tsx` and `admin/kyc/[id]/page.tsx`.
- Home page (`src/app/page.tsx`) fetches `isActive` media ordered by
  `sortOrder` and passes it to `PartyBackdrop`. Zero items → falls back to
  the ambient `PartyLights` canvas. One item → loops (video: native loop;
  image: continuous breathing zoom). Two or more → crossfading,
  auto-advancing (6s), swipeable slideshow with a Ken Burns zoom per slide,
  built in `src/components/party/hero-background-media.tsx` using
  `motion`'s drag gesture (not a carousel library).
- `next.config.ts` raises `experimental.serverActions.bodySizeLimit` to
  60mb for this — the default 1MB blocks any real image/video upload
  through a server action. If a future feature needs an even larger body,
  raise this further rather than routing around server actions.
- Admin mutations here write to `AuditLog` (entity `"HeroMedia"`), same as
  every other admin mutation in the spec.

## KYC (Phase 1, `/kyc`, `/admin/kyc`, `/{owner,host}/profile`)

- Documents (`idFile`, `selfieFile`, owner-only `ownershipFile`) save to
  **`private-uploads/kyc/<userId>/`** — a directory at the project root,
  outside `public/` entirely, gitignored. There is no static route to it
  by construction; the only way to read a file is
  `src/app/api/kyc-files/[...path]/route.ts`, which re-checks the session
  on every request (must be the document's own owner or an admin) before
  reading it. This is the local-disk stand-in for "S3 private ACL +
  presigned URLs" — swap `src/lib/kyc-file-storage.ts`'s functions for S3
  puts/gets/deletes later; the route handler's auth check moves over
  unchanged (S3 presigned URLs would need the same per-request
  owner-or-admin check when *minting* the URL, not serving it, but the
  logic is identical).
- The full ID number is validated client-submitted, reduced to
  `idLastFour` inside `src/app/kyc/actions.ts`, and never stored or logged
  anywhere else — re-read that function before changing it. No Aadhaar:
  `src/lib/validations/kyc.ts` rejects any 12-digit number.
- `src/lib/rules/kyc.ts` — `assertKycApproved(userId, action)` (the gate
  spec section 10 item 4 asks for; not called from anywhere yet since
  listings/requests aren't built) and `canSubmitKyc(status)` (drives
  whether `/kyc` shows the form or a status card — `NOT_SUBMITTED` and
  `REJECTED` can (re)submit, `PENDING`/`APPROVED` cannot).
- **No unit tests yet**, despite spec section 10 explicitly asking for
  tested rule functions in `src/lib/rules/`. Deliberately deferred under
  time pressure, not forgotten — `assertKycApproved`/`canSubmitKyc` are
  pure enough to test easily once a test runner is set up. Worth doing
  before Phase 2 adds more rule functions on top.
- KYC decisions (approve/reject) update both `KycProfile.status` and
  `User.kycStatus` in the same transaction — they're two separate fields
  in the schema with no DB-level sync, so any new code path that changes
  one must change the other or dashboards/gates will disagree with each
  other.

## Version pins — do not casually upgrade

- **Next.js is pinned to 15.5.23** (`next@15`), not the latest 16.x that
  `create-next-app@latest` installs today. The spec requires Next 15
  specifically. If you re-run any scaffolding tool, re-pin afterward.
- **Prisma is pinned to 6.19.3.** Prisma 7 removed `datasource.url` from
  `schema.prisma` in favor of `prisma.config.ts` + driver adapters — a
  bigger migration than this project needs right now. We use the classic
  `url = env("DATABASE_URL")` pattern. `prisma.config.ts` exists only to
  point at the seed script and load `.env` via `dotenv` (Prisma's new CLI
  config mode stops auto-loading `.env` otherwise).
- Both pins carry `npm overrides` for `postcss`/`sharp` to close known CVEs
  in Next 15's bundled versions without bumping Next's major version. Keep
  those overrides whenever `package.json` changes.
- **`nodemailer` is pinned to 9.0.5+ everywhere, including inside
  `next-auth`'s dependency tree**, via a scoped override:
  `overrides: { "next-auth": { "nodemailer": "9.0.5" } }`. nodemailer
  <=9.0.0 has a real SSRF/arbitrary-file-read CVE, but `next-auth`'s
  optional peer range (for its unused Email provider) only accepts
  `^7.0.7 || ^8.0.5` — without the scoped override, npm nests a second
  `@auth/core` inside `next-auth/node_modules` to resolve the conflict.
  That second copy is invisible to `src/types/next-auth.d.ts`'s
  `declare module "@auth/core/jwt"` augmentation (TypeScript resolves a
  bare specifier in a `.d.ts` the same way an import from that file's own
  location would — `src/types/` never sees into `next-auth`'s nested
  `node_modules`), so `token.role`/`token.kycStatus`/etc. silently go back
  to typing as `unknown` throughout `src/lib/auth/`. If that happens again
  after touching dependencies: `find node_modules -path "*@auth/core"`
  should show exactly **one** hit — more than one means the override broke.

## shadcn/ui uses Base UI, not Radix

The current shadcn CLI (`style: base-nova`) generates components on top of
`@base-ui/react`, not `@radix-ui/react-*`. This means:
- There is no classic `Form`/`FormField`/`FormControl` component. Use
  `Field`, `FieldLabel`, `FieldError`, `FieldDescription` from
  `@/components/ui/field` instead, paired directly with
  `react-hook-form`'s `register`/`formState.errors` (or plain
  `useActionState` + native `<form action={...}>` for simple forms — see
  the register/login pages for the pattern). `FieldError` takes an
  `errors={[{ message }]}` array.
- Radix-flavored snippets from memory/docs (`@radix-ui/react-*` imports,
  `asChild`, Radix's `data-state` attributes) will not match this
  codebase. Check the actual component file in `src/components/ui/`
  before assuming an API.

## Theme system: app-wide night, by explicit client request

PROJECT_SPEC.md section 7 designs a night/day split — marketing surfaces
dark and atmospheric, dashboards/KYC/payment screens sober "paper-white,
fintech-grade" specifically to build trust on screens asking for ID
documents and card payments. **The client explicitly overrode this** and
asked for the party-club night theme everywhere, dashboards included —
asked once, confirmed twice (AskUserQuestion), so this is a deliberate,
recorded decision, not a drift from the spec. `:root` in `globals.css`
still defines the day palette (`.night` overrides it), so reverting any
given surface to day is just deleting a class if that decision ever
changes — nothing about the token architecture is destroyed by this.

- Every top-level route wrapper carries `className="night"` — home, auth
  pages, `/terms`, and `DashboardShell` (so `/host`, `/owner`, `/admin` and
  everything under them). If you add a new top-level page, give it `night`
  too unless told otherwise.
- Raw brand colors (`--night`, `--glow`, `--plum-lit`, `--paper`, `--mist`,
  `--ink`, `--plum`, `--plum-lift`, `--verified`, `--danger`) are always
  available as Tailwind utilities (`bg-night`, `text-glow`, `bg-verified`,
  `text-danger-brand`, …) regardless of surface.
- `--verified` (green) is reserved for genuinely verified status only —
  never decorative.
- shadcn's built-in `dark:` variant classes are repointed (via
  `@custom-variant dark`) to fire inside `.night` instead of `.dark`, so
  the dark-mode polish already baked into generated components (input
  opacity, etc.) applies for free. There is no `.dark` class anywhere in
  this app.
- Since KYC/payment screens are no longer sober by design, compensate with
  clarity, not restraint: keep form labels, error states and money amounts
  high-contrast and unambiguous even inside the glass/glow treatment. Fun
  chrome, serious legibility — don't let the theme make a rejection reason
  or a price hard to read.

### Party UI kit (`src/components/party/`)

- **`PartyBackdrop`** (`party-backdrop.tsx`) — drop into any night surface's
  root: ambient canvas lights + vignette. Takes `density="vivid"`
  (marketing/entry pages) or `density="calm"` (dashboards — same brand
  presence, fewer/dimmer particles so it doesn't fight with actual work).
  Defined in `party-lights.tsx`'s `DENSITY_PRESETS` if a third tier is ever
  needed.
- **`GlowCard`** (`glow-card.tsx`) — the standard card everywhere now:
  glassmorphic, mouse-driven 3D tilt (via `motion`/`useMotionValue`) and a
  cursor-following radial glow. Manually checks
  `prefers-reduced-motion` itself (tilt is driven by raw mouse events, not
  a `motion` `animate` prop, so the app-wide `MotionConfig` doesn't cover
  it) — don't strip that check.
- **`FadeIn`** (`fade-in.tsx`) — standard entrance animation (fade + rise).
  Relies on the root layout's `<MotionConfig reducedMotion="user">` for
  reduced-motion handling, so it doesn't need its own check.
- Root layout wraps everything in `MotionConfig reducedMotion="user"` —
  any *new* `motion.div` using `animate`/`whileHover`/etc. gets reduced-motion
  handling for free. Only manually-driven motion values (like `GlowCard`'s
  tilt) need an explicit check.

## Gotchas found the hard way in Phase 0 (browser-tested, not just built)

Phase 0 was verified with an actual headless-browser run of register → both
roles' dashboards → sign out → wrong-password login → admin login, in both
`next dev` and a real `next build && next start`. Production surfaced three
bugs `next dev` hid completely — don't trust dev-mode-only testing on this
codebase:

- **CSP nonce + static rendering don't mix.** `src/middleware.ts` mints a
  fresh nonce every request. Any route Next.js prerenders once at build
  time (shown as `○` in the build output) bakes in a nonce that can never
  match a later request's CSP header, so literally every script on that
  page gets blocked in production — dev mode never prerenders, so this is
  invisible until `next build`. Fix in place: `src/app/layout.tsx` awaits
  `headers()`, which forces every route under it to render dynamically
  (`ƒ` in the build output). **If you ever see `○` next to an authenticated
  or interactive route in `next build` output, something regressed this —
  check `next build` output, not just `next dev`, before calling a page done.**
- **`trustHost: true` is required in `auth.config.ts`.** Without it,
  Auth.js rejects every request in production with `UntrustedHost` — it
  only auto-trusts the host on Vercel, and this app runs on plain
  `next start`. Dev mode doesn't enforce this check, so it's invisible
  until production.
- **Base UI's `Menu.GroupLabel` (shadcn's `DropdownMenuLabel`) throws at
  runtime** ("MenuGroupContext is missing") unless wrapped in
  `DropdownMenuGroup` — unlike Radix, it's not optional standalone usage.
- **Base UI's `Button` needs `nativeButton={false}` whenever `render` points
  at something that isn't a real `<button>`** (e.g. `render={<Link .../>}`),
  or it logs a console error every render and (depending on what else is on
  the page) can trip Next's dev overlay into blocking all interaction.
- **CSP host-source wildcards only replace a single leading label** —
  `https://*.s3.*.amazonaws.com` is invalid CSP syntax (silently dropped by
  the browser, not just a lint nit) even though the equivalent pattern in
  `next.config.ts`'s `images.remotePatterns` is valid there. `middleware.ts`
  builds the S3 origin as an exact hostname from `AWS_S3_BUCKET`/`AWS_REGION`
  instead of trying to wildcard it — do the same for any other exact-known
  origin added later.

## Security baseline (already in place, extend — don't bypass)

- `src/lib/env.ts` — every env var is Zod-validated at boot. Add new vars
  here, never read `process.env.X` directly in app code.
- `src/lib/rate-limit.ts` — in-memory fixed-window limiter
  (`checkRateLimit`, `RATE_LIMITS`). Single-instance only; if this ever
  runs on more than one Node process, swap the store for Redis behind the
  same signature. Every new mutation that the spec calls out for rate
  limiting (OTP, login, registration, party-request creation — section 11)
  must call this.
- `src/lib/auth/auth.config.ts` is edge-safe (no Prisma, no bcrypt) —
  imported by `auth-edge.ts` for `src/middleware.ts` only.
  `src/lib/auth/auth.ts` has the real Credentials provider and is Node-only
  (Server Components, Server Actions, the `/api/auth/[...nextauth]` route).
  **Never import `@/lib/auth/auth` from middleware** — it pulls in
  `@prisma/client`, which breaks the edge bundle.
- `src/middleware.ts` sets a per-request CSP with a nonce
  (`strict-dynamic`) and gates `/host`, `/owner`, `/admin` by session role.
  Extend `ROLE_ROUTES` there for any new role-gated top-level path, don't
  add ad hoc auth checks in individual pages as the only guard (pages
  should still defensively check too, per the layouts already written).
- `canRevealContact()` (Phase 5/6, not built yet) must be the single gate
  for owner contact info everywhere, per spec section 2 — including inside
  email templates, not just page responses.
- Passwords: bcryptjs, cost 12, via `src/lib/password.ts`. Never compare
  passwords manually.
- No Aadhaar anywhere, ever (legal requirement, not a preference) — ID
  fields are `idType` (enum, DRIVING_LICENCE/PASSPORT/VOTER_ID only) +
  `idLastFour` in the DB; full documents live in private S3, presigned
  URLs only, admins only.

## Notifications (temporary stopgap — read before touching auth flows)

`src/lib/mail.ts` (`sendEmail`) sends real email via Gmail SMTP
(`GMAIL_USER`/`GMAIL_APP_PASSWORD` in `.env`). It exists solely so
registration/verification actually delivers before Phase 3 builds the real
`notify()` pipeline (SES + React Email + InAppNotification +
NotificationLog, per spec section 5). Gmail SMTP has a ~500/day limit and
isn't a production answer. When Phase 3 lands, every call site of
`sendEmail` must move to `notify()`, and `mail.ts` should be deleted —
don't let it become permanent infrastructure.

## SEO & performance conventions

- Every route sets real `metadata` (title/description) — see
  `src/app/layout.tsx` for the title template. No page ships with the
  default Next.js placeholder title.
- `robots.ts` / `sitemap.ts` only ever list pages that actually exist.
  Add a URL the same PR you build the page, not before.
- Fonts are self-hosted via `next/font/google` (Geist Sans/Mono, Bricolage
  Grotesque for headings ≥20px) — already zero-CLS, zero third-party font
  requests. Keep it that way; don't add a `<link>` to Google Fonts.
- Images: always `next/image`, never a bare `<img>`. It lazy-loads by
  default — only the single largest above-the-fold image on a page (e.g.
  the home hero once Phase 4 builds it) should get `priority`. `next.config.ts`
  already restricts remote images to the S3 pattern and prefers avif/webp.
- Non-critical client-only UI (toasts, and anything similarly not needed
  for first paint — maps, charts, rich pickers, the admin data-viz in
  Phase 7) should be loaded with `next/dynamic(..., { ssr: false })`. See
  `src/app/layout.tsx`'s `Toaster` import for the pattern.

## Local dev

- `docker-compose.yml` runs MySQL 8 on host port **3308** (3306 was taken
  by another local service) — `docker compose up -d`.
- `npm run db:migrate` / `npm run db:seed` / `npm run db:studio`.
- Seed creates a dev-only admin: `admin@partyspace.local` /
  `AdminDev123!` (only when `NODE_ENV !== "production"` — see
  `prisma/seed.ts`). Owner/host accounts are created through `/register`.
- Copy `.env.example` to `.env` and fill in real AWS/Razorpay/MSG91
  credentials when those phases need them; placeholders are fine until
  then since nothing calls those APIs yet.

