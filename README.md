# Coins Frontend

React/Vite frontend for Coins Store. The app includes a
public catalog, customer account flows, wallet and deposit screens, product
purchase flows, target coin requests, admin dashboards, and supervisor-protected
management pages.

## Tech Stack

- React 19
- Vite 6
- Tailwind CSS 4 via `@tailwindcss/vite`
- React Router 7
- Zustand for client state
- Axios for backend requests
- i18next / react-i18next for localization
- Framer Motion / Motion for animation
- Lucide React icons

## Project Structure

```text
Frontend/
  src/
    App.jsx                  Route tree and app providers
    main.jsx                 React entry point
    index.css                Global styles
    theme/tokens.css         Design tokens
    assets/                  Static brand and catalog assets
    components/              Shared UI, layout, auth, wallet, admin, product components
    context/                 Theme and language providers
    data/                    Mock data and local catalogs
    locales/                 App translation files
    pages/                   Public, customer, and admin pages
    services/                API provider switch, real API adapter, mock API adapter
    store/                   Zustand stores
    utils/                   Formatting, permissions, pricing, auth, URLs, validation
  public/
    locales/                 Public translation resources
    favicon assets
    _redirects               SPA fallback for static hosts
  scripts/
    generate-favicons.mjs
  package.json
  vite.config.js
```

## Prerequisites

- Node.js 18 or newer
- npm
- Backend API running locally or a deployed API URL if using real data

## Setup

Install dependencies:

```bash
npm install
```

Create a local environment file:

```bash
cp .env.example .env.local
```

On Windows PowerShell, use:

```powershell
Copy-Item .env.example .env.local
```

Recommended local development values:

```env
VITE_API_BASE_URL=http://localhost:5000/api
VITE_DATA_PROVIDER=real
VITE_ADMIN_WHATSAPP_NUMBER=01114132540
VITE_APP_ENV=development
VITE_APP_MODE=development
APP_URL=http://localhost:3000
GEMINI_API_KEY=your_gemini_api_key_here
```

Use `VITE_DATA_PROVIDER=mock` to run the UI without the backend. Use
`VITE_DATA_PROVIDER=real` to call the backend through `src/services/realApi.js`.

## Environment Variables

| Variable | Required | Description |
| --- | --- | --- |
| `VITE_API_BASE_URL` | Real API mode | Backend API URL, usually `http://localhost:5000/api` |
| `VITE_DATA_PROVIDER` | No | `mock` or `real`; defaults to `mock` in `src/services/client.js` |
| `VITE_ADMIN_WHATSAPP_NUMBER` | No | WhatsApp number used by floating/contact UI |
| `VITE_APP_ENV` | No | App environment label |
| `VITE_APP_MODE` | No | App mode label |
| `APP_URL` | No | Public frontend URL for links/callbacks |
| `GEMINI_API_KEY` | Optional | Only needed by features that call Gemini |

Environment file notes:

- `.env.local` overrides other env files and should stay uncommitted.
- `env.development` is present in this repo, but Vite only auto-loads files named
  `.env`, `.env.local`, `.env.development`, or `.env.development.local`.
- `.env.example` is the template for local setup.

## Running Locally

Start the frontend dev server:

```bash
npm run dev
```

The `dev` script runs Vite on port `3000` and binds to `0.0.0.0`:

```text
http://localhost:3000
```

Start the backend separately from `../Backend` when using real API mode:

```bash
npm run dev
```

Backend default URL:

```text
http://localhost:5000/api
```

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start Vite dev server on port 3000 |
| `npm run build` | Build production assets into `dist/` |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run TypeScript type checking with `tsc --noEmit` |
| `npm run generate:favicons` | Regenerate favicon assets |
| `npm run clean` | Remove `dist/` using `rm -rf`; this script expects a Unix-like shell |

## Main Routes

### Public

| Route | Page |
| --- | --- |
| `/` | Public catalog |
| `/catalog` | Public catalog |
| `/about-us` | About page |
| `/public-contact-us` | Public contact page |
| `/auth` | Auth page |
| `/login` | Auth page |
| `/email-verified` | Email verification result |

### Customer and Shared Authenticated Routes

These routes are guarded by `ProtectedRoute` and account status checks.

| Route | Page |
| --- | --- |
| `/dashboard` | User dashboard |
| `/orders` | Orders |
| `/orders/:orderId` | Order detail view |
| `/products` | Product catalog |
| `/products/:productId` | Product purchase |
| `/purchase/:productId` | Product purchase alias |
| `/wallet` | Wallet |
| `/wallet/add-balance` | Add balance |
| `/wallet/topups` | Top-up history |
| `/wallet/topup-history` | Top-up history alias |
| `/wallet/payment-details/:methodId` | Payment method details |
| `/settings` | Settings |
| `/account` | Account profile |
| `/account/security` | Account security |
| `/account-security` | Account security alias |
| `/contact-us` | Contact page |
| `/buy-target` | Target coin request |
| `/target-orders` | Target order history |
| `/created-by` | Customer-only created-by page |

### Admin and Supervisor Routes

Admin pages are protected by role and permission checks from `src/utils/permissions.js`.

| Route | Page |
| --- | --- |
| `/admin` | Redirects to the correct admin/supervisor landing page |
| `/admin/dashboard` | Admin dashboard |
| `/dashboard` | Supervisor dashboard fallback |
| `/admin/users` | User management |
| `/admin/users/:userId/transactions` | User transaction history |
| `/admin/groups` | Pricing groups |
| `/admin/products` | Product management |
| `/admin/wallet` | Wallet management |
| `/admin/payments` | Deposit/payment review |
| `/admin/payment-methods` | Payment method settings |
| `/admin/orders` | Order management |
| `/admin/user-transactions` | User transaction search |
| `/admin/supervisors` | Supervisor management |
| `/admin/supervisors/:supervisorId/monitoring` | Supervisor monitoring |
| `/admin/supervisor-monitoring` | Admin supervisor monitoring |
| `/admin/currencies` | Currency management |
| `/admin/suppliers` | Provider/supplier management |
| `/admin/target-requests` | Target request review |

## API Provider Modes

The app loads API methods through `src/services/client.js`.

- `VITE_DATA_PROVIDER=mock` loads `src/services/mockApi.js`.
- `VITE_DATA_PROVIDER=real` loads `src/services/realApi.js`.

The real adapter:

- Uses `VITE_API_BASE_URL`, defaulting to `http://localhost:5000/api`.
- Adds `Authorization: Bearer <token>` from the persisted Zustand auth store.
- Normalizes backend response shapes for the frontend stores.
- Handles multipart uploads through `FormData`.
- Attempts refresh-token handling through `/auth/refresh` when a refresh token
  exists, then falls back to logout on token failure.

## Authentication and Access

Auth state is stored under the `auth-storage` localStorage key. The app supports:

- Email/password login and registration
- Email verification status screens
- Pending/rejected account screens
- Google login flow when the backend is configured
- Email OTP two-factor verification
- Role-based customer/admin/supervisor routing
- Permission-based admin navigation and guards

## Localization and Theme

The app is wrapped with:

- `LanguageProvider` from `src/context/LanguageContext.jsx`
- `ThemeProvider` from `src/context/ThemeContext.jsx`
- `ToastProvider` from `src/components/ui/Toast.jsx`

Translation resources live in both:

- `src/locales`
- `public/locales`

## Building and Previewing

Create a production build:

```bash
npm run build
```

Preview the built app:

```bash
npm run preview
```

The static host must route all frontend paths back to `index.html`. The
`public/_redirects` file provides this fallback for hosts that support Netlify
style redirects.

## Troubleshooting

- If the app shows mock data while the backend is running, check
  `VITE_DATA_PROVIDER=real`.
- If requests go to the wrong server, check `VITE_API_BASE_URL`.
- If auth redirects loop, clear the browser's `auth-storage` localStorage key
  and log in again.
- If uploads fail in real API mode, do not manually set a `Content-Type` header
  for `FormData`; Axios must set the multipart boundary.
- If `npm run clean` fails on Windows PowerShell, remove `dist/` manually or run
  the command from Git Bash/WSL.

## Related Docs

- `../API_DOCS.md`
- `../Backend/README.md`
- `ENVIRONMENT_CONFIG.md`
- `ENVIRONMENT_SETUP.md`
- `TROUBLESHOOTING_PRODUCTS.md`
- `FINANCIAL_SNAPSHOT_SYSTEM.md`
