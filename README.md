# ProMentor (monorepo)

Full-stack monorepo: Nest API (`apps/api`), Vite/React shell (`apps/shell`), and shared `packages/*`. Turborepo orchestrates tasks; pnpm manages workspaces.

## Prerequisites

- Open the **repository root** in your editor so TypeScript and ESLint resolve workspaces correctly (the repo includes a root `tsconfig.json` and `.vscode/settings.json` with `eslint.workingDirectories: auto`).
- Node.js: use the version in `.nvmrc` (aligned with `engines` in the root `package.json`).
- pnpm 9 or newer. Enabling [Corepack](https://nodejs.org/api/corepack.html) keeps the pnpm version in sync with the repo.

## First-time setup

```bash
nvm use
corepack enable
pnpm install
```

## Commands (run from the repository root)

**Development**

- `pnpm dev` — start **all** app dev servers (shell + API) through Turbo (after building workspace library dependencies where required).
- `pnpm dev:web` — only the Vite shell.
- `pnpm dev:api` — only the Nest API (`nest start --watch`).

**Production**

- `pnpm build` — production build for all packages that define a build script (including `@promentor/types` and `@promentor/ui-kit` into `dist/`).

**Publishing shared packages to npm**

`@promentor/types` and `@promentor/ui-kit` are versioned libraries built with [tsup](https://tsup.egoist.dev/). They ship `dist/` only (`files` in each `package.json`).

1. Create the npm scope (once): an org or user scope `@promentor` must exist on [npmjs.com](https://www.npmjs.com/) (or change the package names to your scope).
2. Log in: `npm login` (or use a granular access token in CI).
3. Bump `version` in `packages/types/package.json` and/or `packages/ui-kit/package.json`.
4. From the repo root, after a successful `pnpm build`:

```bash
pnpm --filter @promentor/types publish --no-git-checks
pnpm --filter @promentor/ui-kit publish --no-git-checks
```

Use `--access public` for scoped public packages if your defaults differ. For a **private** registry, set `publishConfig.registry` and `publishConfig.access` in each package and configure `.npmrc` with auth.

Consumers outside this monorepo install semver versions (e.g. `"@promentor/ui-kit": "^0.1.0"`). Inside the monorepo, keep `workspace:*` until you intentionally pin to a published version.

**Peers for `@promentor/ui-kit`:** apps must install `react`, `react-dom`, `@mui/material`, `@emotion/react`, and `@emotion/styled` (see `apps/shell` for an example).

**Quality**

- `pnpm lint` — ESLint in packages that expose a `lint` script.
- `pnpm typecheck` — `tsc --noEmit` across packages that define a `typecheck` script (via Turbo).
- `pnpm format` — apply Prettier to the repo.
- `pnpm format:check` — verify formatting without writing files.

## Git hooks (Husky)

After `pnpm install`, Husky wires Git hooks from `.husky/`.

**pre-commit** runs [lint-staged](https://github.com/lint-staged/lint-staged): ESLint with `--fix` and Prettier on staged files only (faster than linting the whole tree).

Shared ESLint rules live in `packages/eslint-config`; the repo root `eslint.config.mjs` re-exports that config so every package can run `eslint .` without a local copy.

Run `pnpm typecheck` locally or in CI when you want a full TypeScript check (it is not part of the Git hook).

In CI (or before opening a PR), run `pnpm lint`, `pnpm typecheck`, and `pnpm format:check` so the whole repo stays consistent.

## Environment

- **Shell:** copy the root `.env.example` to `apps/shell/.env`. Browser-visible variables must use the `VITE_` prefix (e.g. `VITE_API_URL=http://localhost:3000`).
- **API:** copy `apps/api/.env.example` to `apps/api/.env` if you need a non-default `PORT`. Do not commit `.env` files.

## Repository layout

**apps**

- `api` — NestJS HTTP API (default `GET /health`, CORS enabled for local dev). Add Prisma/Postgres/WebSockets here as the backend grows.
- `shell` — Vite + React + TypeScript host (microfrontend shell). Uses Tailwind with MUI through `@promentor/ui-kit`.

**packages**

- `tsconfig` — shared TypeScript bases (`base`, `react-vite`).
- `eslint-config` — shared ESLint flat config; Prettier-compatible rule set.
- `types` — shared TypeScript types for the frontend.
- `ui-kit` — MUI theme, `AppThemeProvider`, and re-exports of selected MUI components.

**Styling note.** Tailwind preflight is disabled in `apps/shell/tailwind.config.ts` so it does not fight MUI `CssBaseline`. Tailwind `content` includes `packages/ui-kit/src` so classes used in the UI kit are generated.

## Adding another app under `apps`

1. Add `@promentor/ui-kit` and `@promentor/types` if you need them.
2. Extend the shared preset with a relative path (from `apps/your-app`, use `"extends": "../../packages/tsconfig/react-vite.json"` for Vite + React).
3. Add `eslint` as a devDependency and scripts `"lint": "eslint ."` and `"typecheck": "tsc --noEmit"` (ESLint resolves the root `eslint.config.mjs` automatically).
4. Register the new app in `pnpm-workspace.yaml` if you use a new folder pattern.
