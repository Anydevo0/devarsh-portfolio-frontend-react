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
