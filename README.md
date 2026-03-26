# ProMentor

Monorepo: **Nest** (`apps/api`), **Vite/React shell** (`apps/shell`), shared **`packages/*`**. **pnpm** workspaces + **Turborepo**.

## Setup

Requirements: open the **repo root** in the editor, **Node 20+** (see `engines` in root `package.json`), **pnpm 9+** ([Corepack](https://nodejs.org/api/corepack.html) recommended).

```bash
nvm use && corepack enable && pnpm install
```

## Commands

- `pnpm dev` — shell + API (libraries build first when needed).
- `pnpm dev:web` / `pnpm dev:api` — only shell or only API.
- `pnpm build` — all packages that define `build`.
- `pnpm --filter @promentorapp/ui-kit storybook` — run Storybook locally for `ui-kit` (default: `http://localhost:6006`).
- `pnpm --filter @promentorapp/ui-kit build-storybook` — static Storybook build.
- `pnpm lint` · `pnpm typecheck` · `pnpm format` / `pnpm format:check`

**pre-commit:** lint-staged (ESLint + Prettier on staged files).

**CI:** [GitHub Actions](.github/workflows/ci.yml) on push and pull requests to `main` and `dev`: `pnpm format:check`, `lint`, `typecheck`, `build`.

**CD:** shell — [`vercel.json`](vercel.json); API — [`railway.toml`](railway.toml).

### Deploy hosts

- Shell (Vercel): [https://promentor-alpha.vercel.app](https://promentor-alpha.vercel.app)
- API (Railway): [https://promentor-production.up.railway.app](https://promentor-production.up.railway.app)

## Env

- Shell: `.env.example` → `apps/shell/.env` (`VITE_*` for browser).
- API: `apps/api/.env.example` → `apps/api/.env` (e.g. `PORT`). Do not commit `.env`.

## Layout

- `apps/api` — Nest API (`GET /health`, CORS for local dev).
- `apps/shell` — host app (Tailwind + MUI via `@promentorapp/ui-kit`). FSD-style folders under `src/`.
- `packages/types` · `packages/ui-kit` — published as **`@promentorapp/types`** / **`@promentorapp/ui-kit`**.
- `packages/tsconfig` · `packages/eslint-config` — shared config (workspace only).

Tailwind **preflight is off** in the shell so it does not clash with MUI **`CssBaseline`**.

## npm packages `@promentorapp`

**Published:** `@promentorapp/types`, `@promentorapp/ui-kit` ([npm](https://www.npmjs.com/)).

- **In this repo:** `"@promentorapp/types": "workspace:*"` (and same for `ui-kit`).
- **Elsewhere:** `pnpm add @promentorapp/types @promentorapp/ui-kit` (pin versions, e.g. `^0.1.0`).
- **`ui-kit` peers:** `react`, `react-dom`, `@mui/material`, `@emotion/react`, `@emotion/styled` — copy ranges from `apps/shell/package.json`.

**Publish a new version:** bump `version` in `packages/types` and/or `packages/ui-kit`, then:

```bash
pnpm build
pnpm --filter @promentorapp/types publish --access public --no-git-checks
pnpm --filter @promentorapp/ui-kit publish --access public --no-git-checks
```

## New app under `apps`

Copy `apps/shell` patterns: `package.json`, `tsconfig` → `extends` `../../packages/tsconfig/react-vite.json`, `eslint` + scripts `lint` / `typecheck`. Must stay under `apps/*` for the workspace.
