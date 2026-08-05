# portfolio-frontend

React + TypeScript + Tailwind CSS v4 frontend for the portfolio site, built against
`../portfolio-backend`. See `../REQUIREMENTS.md` for the full spec and
`~/.claude/plans/fluttering-beaming-gosling.md` for the implementation plan this repo follows.

## Local development

```bash
npm install
npm run dev   # http://localhost:5173/portfolio-frontend/ (base path matches vite.config.ts)
```

Requires `portfolio-backend` running locally (see its own README) — `VITE_API_BASE_URL` in
`.env` points at it.

## Design system

The public site and the admin panel deliberately use two separate palettes, both declared in
one Tailwind v4 `@theme` block in `src/styles/index.css`:

- **Public** — `void` / `abyss` / `panel` / `edge` are four graded depths from near-black to the
  border tint, so elevation is expressed by surface value rather than drop shadows. Three accents
  sit on one cool axis: `pulse` (blue, actions), `beam` (cyan, emphasis), `halo` (violet,
  atmosphere). `live` and `alert` are reserved for state and never used decoratively.
- **Admin** — `ink` / `paper` / `wire` / `line` / `mute`, untouched by the public redesign. The
  admin panel is a tool, not a showpiece, and keeping the palettes separate means a change to the
  marketing site can never make the editor unreadable.

Shared utility classes (also in `index.css`): `.glass` is the only card treatment; `.glass-panel`
is its opaque variant for surfaces floating over arbitrary content (the chat panel); `.scrim-x` /
`.scrim-y` guarantee the hero text's contrast over the 3D scene; `.sheen`, `.shimmer` and
`.grain` are the motion/texture layer.

Sections are composed from `src/components/layout/Section.tsx`, which owns the shared vertical
rhythm and renders the eyebrow as an API route (`GET /projects`, `POST /contact`). The method is
real: everything that presents information is a GET, and the contact form — the one place a
visitor writes something — is the only POST.

## The hero's 3D scene

`src/components/three/` renders a workstation with a software engineer at it, behind the hero's
text column.

- **No 3D asset files.** The workstation, the figure and the room are built from three.js
  primitives, and every texture — including the scrolling code on the monitor — is drawn onto a
  canvas at runtime. Nothing is downloaded, so the scene's asset payload is zero bytes and the
  resolution scales with the device tier.
- **Lazy-loaded.** `DeveloperScene.tsx` is the default export behind a `React.lazy` boundary, so
  three.js lands in its own chunk (~240 KB gzipped) that no other route pays for.
- **Never renders where it can't.** A WebGL capability check gates the mount, an error boundary
  catches driver-level failures, and both fall back to a CSS poster occupying the same box.
- **Costs nothing when idle.** The render loop is `frameloop="demand"` — not merely paused —
  whenever the hero is off-screen or the visitor prefers reduced motion.
- **Scroll and pointer never re-render React.** `lib/useSceneInput.ts` writes scroll and cursor
  position into a ref; the loop inside the canvas reads it once per frame and damps toward it.
  Because it tracks absolute scroll position rather than accumulated delta, scrolling back up
  unwinds the rotation along exactly the path it came.
- **Quality tiers.** `useSceneQuality.ts` picks from viewport width and core count, driving
  texture resolution, geometry segment counts, antialiasing, DPR, and whether optional details
  (chair casters, hair tufts, mug steam) are built at all.

## Animation

`motion` is loaded through `LazyMotion` with the `domAnimation` feature set, mounted once in
`Layout.tsx`. Every animated component therefore uses `m.*`, never `motion.*` — importing
`motion.div` anywhere pulls the full feature bundle into the main chunk. `strict` mode on the
provider turns that mistake into a runtime error rather than a silent bundle regression.

## Known accepted risk: `brace-expansion` audit finding (dev-only, ESLint toolchain)

`npm audit` reports a high-severity `brace-expansion` DoS advisory (unbounded expansion length)
pulled in transitively by `eslint` core and `eslint-plugin-jsx-a11y` via an old `minimatch@3.1.5`.
**Deliberately not overridden** — tested forcing the patched `brace-expansion@5.x` via npm
`overrides` and it broke ESLint outright (`minimatch@3.1.5` isn't API-compatible with
`brace-expansion`'s 5.x rewrite; there's no patched release on the 1.x/3.x line this dependency
chain needs). Accepted because: this is a dev-only lint tool matching glob patterns against our
own local file paths (`eslint.config.js`'s `files`/`ignores`) — there's no untrusted external
input reaching the vulnerable code path in how this project actually uses it. Revisit if
`eslint-plugin-jsx-a11y` or ESLint's own dependencies ship a compatible fix upstream.

## Manual pre-deploy checklist

No CI/CD for this project (by design — see `REQUIREMENTS.md` §8). Current state: 23 test files /
66 tests passing, `lint`/`typecheck` clean.

```bash
npm run test
npm run lint
npm run typecheck
npm run build
npm run deploy   # gh-pages -d dist
```

**Content that still needs your real values before deploy** — these are deliberate placeholders
(marked `TODO(devarsh)` in source), not bugs:

- `src/components/hero/Hero.tsx` — role/title, headline, value proposition
- `src/components/skills/SkillsSection.tsx` — real skill categories
- `src/components/experience/ExperienceTimeline.tsx` — real work history
- `src/lib/siteInfo.ts` — `GITHUB_URL` and `CONTACT_EMAIL` (`LINKEDIN_URL` is already real)

**Environment for production**: `.env` (local dev only) points `VITE_API_BASE_URL` at
`localhost:8000`. Vite does **not** use this file for `npm run build` — it reads
`.env.production` instead, which doesn't exist yet. Create it with the real deployed backend
URL before the first production build, or the deployed static site will silently try to call
`localhost` from every visitor's browser:

```bash
# .env.production
VITE_API_BASE_URL=https://<your-koyeb-backend>.koyeb.app/api/v1
```

**Before the first real deploy**: update `GH_PAGES_BASE` in `vite.config.ts` (currently
`/portfolio-frontend/`, a placeholder) to match the actual GitHub repo name, and update
`portfolio-backend`'s `CORS_ALLOWED_ORIGINS` to include the deployed `https://<username>.github.io`
origin (see Phase 12 deploy-coordination note).
