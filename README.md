# LaurelPilot

LaurelPilot is a no-external-API MVP for AI film festival discovery, deadline tracking, and submission intelligence. It runs as a static browser app with local seed data and localStorage-based submission tracking.

## Run Locally

Start the static preview server:

```powershell
.\scripts\start.ps1
```

Then open `http://localhost:4173`.

You can also run the server with npm:

```powershell
npm start
```

## Included

- Festival radar dashboard with filters, table/card view, and sorting.
- Festival detail experience with official rules, strategy notes, credibility signals, red flags, and submission checklist.
- Local submission tracker with status, film title, notes, CSV export, and summary metrics.
- Calendar links for Google, Outlook, Apple Calendar, and `.ics` export.
- No OpenAI, Stripe, scraper, or third-party API calls in this MVP.

## Test

```powershell
& "$env:USERPROFILE\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe" --test tests/*.test.mjs
```

Run the full local release gate:

```powershell
npm run ci
```

The CI gate checks JavaScript syntax, runs the test suite, and scans runtime files for accidental external API-call patterns. This app currently needs no API keys and no paid service credentials.

## GitHub

Push this project to a GitHub repository when you are ready to save the work remotely. The included GitHub Actions workflow runs `npm run ci` on pull requests and pushes to `main`, so broken syntax, failing tests, or accidental API-call patterns should be caught before deployment.

## Vercel

Import the GitHub repository into Vercel as a static project.

- Build command: `npm run ci`
- Output directory: `public`
- Environment variables: none required for this no-API MVP

Vercel will create preview deployments for branches and a production deployment for `main`. Do not add OpenAI, Stripe, Supabase, or scraper credentials yet; the current product is intentionally local-first and static.
