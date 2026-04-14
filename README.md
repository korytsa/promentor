# ProMentor

Monorepo: **Nest** (`apps/api`), **Vite/React shell** (`apps/shell`), shared **`packages/*`**. **pnpm** workspaces + **Turborepo**.

## Repositories

- [promentor](https://github.com/korytsa/promentor)
- [promentor-chat](https://github.com/korytsa/promentor-chat)
- [promentor-coaching](https://github.com/Webprojon/promentor-coaching)

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

## Microfrontend local check

### 1) Run remotes

For stable federation checks (close to production), run remotes with dedicated scripts:

```bash
# in promentor-chat
pnpm mf:serve

# in promentor-coaching
pnpm mf:serve
```

`mf:serve` runs `build + preview` under the hood and serves `assets/remoteEntry.js` on fixed ports.
`pnpm dev` is fine for working on the remote app itself, but for shell federation integration checks use `mf:serve`.

### 2) Run host

```bash
# in promentor
pnpm dev:web
```

### 3) Check endpoints and routes

- `http://localhost:4174/assets/remoteEntry.js`
- `http://localhost:4175/assets/remoteEntry.js`
- shell routes: `/chat`, `/teams`, `/boards`, `/workout-plans`, `/explore-teams`, `/mentors`, `/suggestion`

### Remote contract (do not break without host update)

- Chat remote: `name: "chatApp"`, exposed module: `./ChatPage`, import path in shell: `chatApp/ChatPage`.
- Coaching remote: `name: "coachingApp"`, exposed modules: `./TeamsPage`, `./BoardsPage`, `./WorkoutPlansPage`, `./ExploreTeamsPage`, `./MentorsPage`, `./SuggestionPage`.
- Exposed modules must keep default export as React components.
- `react` and `react-dom` versions must stay compatible between host and remotes.

### Theme contract for remotes

- Source of truth is `document.documentElement`:
  - `data-theme="light|dark"`
  - `dark` class (for Tailwind `darkMode: "class"`).
- Theme mode persistence key: `promentor-theme-mode`.
- `@promentorapp/ui-kit` `AppThemeProvider` sets DOM theme attributes and shared CSS variables (`--pm-*`) on `<html>`.
- Remote apps should consume `--pm-*` tokens (`var(--pm-...)`) and should not own an independent global theme state when mounted inside shell.

### Deploy hosts

- Shell (Vercel): [https://promentor-alpha.vercel.app](https://promentor-alpha.vercel.app)
- API (Railway): [https://promentor-production.up.railway.app](https://promentor-production.up.railway.app)

**Module federation remotes (production):**

- Chat: [promentor-chat.vercel.app](https://promentor-chat.vercel.app) → `remoteEntry` at `https://promentor-chat.vercel.app/assets/remoteEntry.js`
- Coaching: [promentor-coaching.vercel.app](https://promentor-coaching.vercel.app) → `https://promentor-coaching.vercel.app/assets/remoteEntry.js`

The shell Vite build reads `VITE_CHAT_REMOTE_URL` and `VITE_COACHING_REMOTE_URL`. They are set in [`vercel.json`](vercel.json) for the shell deployment so the host loads these remotes by default. Override in the Vercel project **Environment Variables** if needed.

## Env

- Shell: `.env.example` → `apps/shell/.env` (`VITE_*` for browser).
- API: `apps/api/.env.example` → `apps/api/.env` (e.g. `PORT`). Do not commit `.env`.

## Layout

- `apps/api` — Nest API (`GET /health`, CORS for local dev).
- `apps/shell` — host app (Tailwind + MUI via `@promentorapp/ui-kit`). FSD-style folders under `src/`.
- `packages/types` · `packages/ui-kit` — published as **`@promentorapp/types`** / **`@promentorapp/ui-kit`**.
- `packages/tsconfig` · `packages/eslint-config` — shared config (workspace only).

Tailwind **preflight is on** in the shell; global reset and base styles come from Tailwind + MUI **`CssBaseline`**.

## npm packages `@promentorapp`

**Published:** `@promentorapp/types`, `@promentorapp/ui-kit` ([npm](https://www.npmjs.com/)).

- **In this repo:** `"@promentorapp/types": "workspace:*"` (and same for `ui-kit`).
- **Elsewhere:** `pnpm add @promentorapp/types @promentorapp/ui-kit` (pin versions, e.g. `^0.1.1`).
- **`ui-kit` peers:** `react`, `react-dom`, `@mui/material`, `@emotion/react`, `@emotion/styled` — copy ranges from `apps/shell/package.json`.

**Publish a new version:** bump `version` in `packages/types` and/or `packages/ui-kit`, then:

```bash
pnpm build
pnpm --filter @promentorapp/types publish --access public --no-git-checks
pnpm --filter @promentorapp/ui-kit publish --access public --no-git-checks
```

## New app under `apps`

Copy `apps/shell` patterns: `package.json`, `tsconfig` → `extends` `../../packages/tsconfig/react-vite.json`, `eslint` + scripts `lint` / `typecheck`. Must stay under `apps/*` for the workspace.
