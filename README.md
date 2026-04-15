# Admin portal

Separate React admin UI for digital account opening (not the corporate portal).

Stack: **React 18**, **TypeScript**, **Vite**, **React Router**, **Axios**.

## Prerequisites

- Node.js 20+ (or current LTS) and npm

## Setup

```bash
cp .env.example .env
npm install
```

Adjust `VITE_API_BASE_URL` in `.env` if your admin API is hosted elsewhere.

## npm scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start Vite dev server (hot reload) |
| `npm run build` | Typecheck and production build to `dist/` |
| `npm run preview` | Serve the production build locally |
| `npm run lint` | Run ESLint |

## Routes

| Path | Page |
|------|------|
| `/login` | Login (stub) |
| `/dashboard` | Dashboard |
| `/clients` | Clients |
| `/clients/new` | New client |
| `/employees` | Employees |
| `/aml` | AML |
| `/config` | Configuration |
| `/audit` | Audit |
| `/admin-users` | Admin users |

`/` redirects to `/dashboard`.

## API client

`src/api/client.ts` exports `apiClient` — Axios instance with `baseURL` from `VITE_API_BASE_URL`, defaulting to `/api/v1/admin` when the variable is unset.
