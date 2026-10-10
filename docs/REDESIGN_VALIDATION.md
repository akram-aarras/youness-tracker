# Redesign finalization — 2026-10-10

The existing redesign was continued in place. No design-system replacement, reset, commit, deployment, or production-data change was performed.

## Existing work preserved

- Premium light/dark design tokens, desktop sidebar, tablet navigation, mobile bottom navigation, search, preferences, and backups.
- Dashboard and billing ledger, subscriber directory, support board, team management, technician workspace, login/owner setup, and receipt workflows.
- Shared native dialogs, toast feedback, lazy modals, loading/error/not-found pages, responsive tables/cards, and French/English/Arabic support.
- The last dashboard metric changes, including Enter/Space activation and the 320px label treatment.

## Finished in this session

- Prevented Ctrl/Cmd+K from switching the workspace behind an open modal.
- Moved search focus into a post-commit effect so the shortcut remains reliable when directory rendering spans frames.
- Added local loading boundaries to lazy modals. The root loading fallback had hidden their triggers before Dialog could remember focus; Escape now restores focus correctly.
- Kept metric cards within their columns when numbers grow; allowed table actions to wrap.
- Corrected shifted mobile ticket-list field labels and localized its statuses and filters.
- Localized the subscriber edit form, ticket categories, billing month selector/status text, and close controls; corrected RTL category alignment.
- Fixed low-contrast ticket badges, editor hover states, and hardware-tab headings in light mode.
- Associated the recurring-rate checkbox with its visible, translated label and exposed registration-tab/technician selection states.
- Cleared unused values and missing memo dependencies, including the dashboard language dependency.
- Replaced explicit `any` types in `store.tsx`/`supabase.ts` with nullable database-row contracts and a typed realtime boundary. LocalStorage restoration now runs in a cancellable callback after mount, before persistence is enabled.
- Preserved hard navigation at auth boundaries while clearing the relative-navigation lint warnings.
- Promoted the prior workflow checks into reusable scripts with fresh local sessions, pinned Playwright/axe dev dependencies, and failing accessibility assertions.
- Removed 78 reviewed, untracked root `.tmp-*` QA files. Current evidence is retained in ignored `.qa-artifacts/`; the user’s `env.local`, assets, application files, and tests were preserved.

The initial application-source lint errors were pre-existing: five in `store.tsx` and ten in `supabase.ts`. Temporary generation scripts accounted for additional root-level errors. All application and QA code now passes strict lint without suppressing rules. Supabase's emitted JavaScript is identical to HEAD, and all 15 exported store helpers outside StoreProvider are unchanged after normalizing line endings; billing/date/receipt calculations and reminder helpers were preserved.

## Reproduction

```sh
npm ci
npm run typecheck
npm run build
npm run lint -- --max-warnings 0
npm run start -- --port 3001
```

In another terminal, with the production server running:

```sh
npm run test:e2e
npm run test:responsive
npm run test:forms
npm audit --omit=dev
```

QA only accepts localhost targets. Use `QA_BASE_URL` for a different local port and `QA_CHROMIUM_PATH` for a browser executable. It discovers installed Playwright Chromium on Windows; otherwise install Chromium with `npx playwright-core install chromium`. Synthetic subscriber/payment/ticket data lives only in isolated browser contexts. Browser Supabase traffic is blocked. These checks exercise the local auth fallback; they are not a live Supabase integration test.

## Final evidence

| Check | Result |
| --- | --- |
| TypeScript (`npm run typecheck`) | Passed |
| Production build (`npm run build`) | Passed; all routes compiled and nine static pages generated |
| ESLint with `--max-warnings 0` | Passed; zero errors and warnings |
| Existing workflow suite | 28 workflow checks passed; zero page errors and 11 axe scans with no violations |
| Keyboard/authentication suite | 7 grouped checks passed: metric Enter/Space, Ctrl/Cmd+K, modal isolation, Tab/Shift+Tab trapping, Escape/focus restoration, empty states, setup validation, role redirects, assigned-ticket isolation, and anonymous redirects |
| Responsive suite | 672 states passed; 168 axe scans with no violations |
| Additional billing/hardware form tabs | 192 states passed; 48 axe scans with no violations |
| Production dependency audit | Zero reported vulnerabilities |
| Printed receipt PDF | One A4 page; print screenshot visually reviewed |
| Git diff hygiene | Passed |

Responsive coverage uses **320, 375, 430, 768, 1024, 1280, 1440, and 1920px** in French, English, and Arabic, with both light and dark themes. The combined responsive/form suites cover 864 states and 216 accessibility scans; the workflow suite adds 11 scans. Screenshots and JSON reports are under `.qa-artifacts/`. Mobile metric cards, billing, dialogs, ticket lists, Arabic RTL/dark forms, desktop dashboard, and print receipt screenshots were visually reviewed. The zoom check is a 200% reflow equivalent, not an actual browser zoom setting.

No unit-test runner existed in package.json. The existing browser scripts were retained as reusable tests. Automated accessibility results apply to the scanned states and are not a complete manual WCAG certification. Chromium was tested; Firefox, Safari, real mobile keyboards, and live multi-device Supabase synchronization were not tested.

## Deployment assessment

The UI redesign is complete and validated in the tested states. **An unconditional production deployment sign-off is not justified.** These issues pre-date the redesign:

1. **Authentication must be hardened before production use.** `src/lib/auth.ts` base64-encodes sessions without a signature, and route protection trusts the decoded role. `src/app/api/auth/login/route.ts` also accepts a client-supplied `customUsers` directory in the local fallback. The browser workflows validate behavior, not the security of that model. This finalization did not replace authentication or alter the existing account logic.
2. **Live Supabase configuration, Auth/RLS, and synchronization remain unverified.** The existing file is named `env.local`; Next.js expects `.env.local` or deployment environment variables. It was preserved without activating a connection to live data.
3. **Development dependency audit:** five high-severity entries in the ESLint → fast-glob → micromatch → braces chain. The suggested automatic fix changes the Next ESLint config to an incompatible older major, so it was not applied. The production-only audit is clean.
4. **Framework deprecation:** the existing `src/middleware.ts` convention still emits the Next.js recommendation to migrate to `proxy`. The build passes; migration was left outside this UI finalization.

Review auth and verify the intended backend/environment before deploying. No deployment was attempted.
