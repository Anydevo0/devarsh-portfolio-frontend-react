# devarsh-portfolio-frontend-react

React + TypeScript frontend for my personal portfolio site — projects, blog, contact form,
and an AI chat widget, plus an admin panel for managing the content. The home page hero
renders an interactive 3D workstation scene.

Backend: [devarsh-portfolio-backend-FastAPI](https://github.com/Anydevo0/devarsh-portfolio-backend-FastAPI)

## Tech stack

- React 19 + TypeScript
- Vite (build tool + dev server)
- Tailwind CSS v4
- React Router, TanStack Query
- React Hook Form + Zod
- three.js with React Three Fiber (hero scene), Motion (animation)
- Vitest + Testing Library

## Prerequisites

- Node.js 20+ and npm
- The backend running locally at `http://localhost:8000` (see its README)

## Getting started

```bash
git clone git@github.com:Anydevo0/devarsh-portfolio-frontend-react.git
cd devarsh-portfolio-frontend-react

npm install
cp .env.example .env     # Windows: copy .env.example .env
npm run dev
```

The app runs at **http://localhost:5173/devarsh-portfolio-frontend-react/**
(the subpath comes from the GitHub Pages base path in `vite.config.ts`).

## Environment variables

Copy `.env.example` to `.env`. Only one variable is needed:

| Variable | Description | Local value |
|---|---|---|
| `VITE_API_BASE_URL` | Base URL of the backend API | `http://localhost:8000/api/v1` |

For production builds Vite reads `.env.production` instead of `.env`, so that file must
point at the deployed backend URL.

## Scripts

```bash
npm run dev         # start the dev server
npm run build       # type-check and build to dist/
npm run preview     # preview the production build
npm run test        # run the test suite
npm run lint        # lint
npm run typecheck   # type-check only
npm run format      # format with Prettier
npm run deploy      # build and publish dist/ to GitHub Pages
```

## Project structure

```
src/
  admin/        # admin panel (protected routes, CRUD pages, admin API client)
  components/   # UI components grouped by section
    three/      # the hero's 3D scene
  pages/        # route-level pages
  hooks/        # data-fetching and UI hooks
  lib/          # API client, query client, helpers
  data/         # static site content
  styles/       # Tailwind theme and global styles
  types/        # shared TypeScript types
```

`@/` is a path alias for `src/`.
