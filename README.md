# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some Oxlint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the Oxlint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and Oxlint's TypeScript related rules in your project.


## Routes

The site is a single-page app with a small History API router (`src/router.jsx`), so the host must serve `index.html`
for every path (a rewrite/fallback rule), otherwise a reload or shared link on `/consultations` returns 404.
`npm run dev` and `npm run preview` already do this.

| Route | Page |
|---|---|
| `/` | Homepage |
| `/consultations` | Choose a professional category, search |
| `/specialties`, `/super-specialties`, `/paramedical`, `/pet-care`, `/dentists` | Provider directory for a category |
| `/{category}/{specialty}` e.g. `/specialties/dermatology` | Provider listing for one specialty |
| `/providers/{slug}` | Provider profile and availability |
| `/lab-tests`, `/lab-tests/{slug}` | Lab tests and health packages, test details with PIN check (e.g. `/lab-tests/complete-blood-count-cbc`) |
| `/book/{provider}` | Book an online consultation: date and time, patient details, review |
| `/dashboard` | Signed-in patient home. Signed out, it asks the visitor to log in first |

All data for these pages goes through `src/data.js`. Nothing there is connected to a backend yet: it returns
clearly labelled illustrative entries (`DEMO = true`) and reports availability and PIN serviceability as "not connected".
The top of that file lists the `?demo=` switches for previewing the error, slot and serviceability states.

There are no web accounts yet. `src/auth.js` is the one place that answers "is someone signed in?": today the only session is the
`?demo=signedin` preview, which shows the signed-in layout (header avatar, dashboard) without any account data. The backend already
has patient OTP endpoints (`/auth/patient/otp/request` and `/verify`); a web login would replace `read()` in `src/auth.js`.
