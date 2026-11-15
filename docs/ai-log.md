# AI Log

| Tool    | Prompt | Output Used | Output Rejected | Verification | Commit |
|---------|--------|--------------|------------------|---------------|--------|
| ChatGPT | "In plain language, explain Next.js, TypeScript, Tailwind CSS, and the App Router..." | Structural framing of Next.js; concise "why" summary | N/A (informational, not code) | Manually compared to Gemini's response | — |
| Gemini  | Same prompt | Performance framing of Next.js; 4-point "why" breakdown incl. scalability | N/A (informational, not code) | Manually compared to ChatGPT's response | — |
| Gemini (AI Studio - App Shell Architect) | "I need to build the initial app shell for a Next.js project called neighborhood-listing-platform..." | Terminal commands (create-next-app flags) and file/folder plan with accessibility notes | Initial attempt used "my-app" as target dir instead of current directory; corrected manually | Ran commands locally, confirmed dev server started and page rendered | — |


## Exam: Services & Booking Subsystem (branch `exam/services-booking-eval`)

| Step / Tool | Prompt Summary | Model Output Used | Model Output Rejected & Rationale | Verification Method | Associated Git Commit |
| :--- | :--- | :--- | :--- | :--- | :--- |
| Claude, Part 1 | Asked for branch, .gitignore, and ai-log setup steps for the exam | Branch-from-main commands, .gitignore check commands, exam table header | First ai-log command used `cat >` and overwrote the existing log from earlier labs; rejected and restored with `git restore`, then switched to appending | Ran `git check-ignore -v`, `git ls-files \| grep -i env`, `git log --all -- .env`; `git status` showed only expected changes | c2a292b |
| Claude, Part 2 (migration + RLS) | Asked for a services persistence migration with row-level security for providers, clients, and admins | Tables, policies, `is_admin()` helper, default-draft status, no self-approval path for providers | First migration had policies but no GRANTs; first test run failed with `permission denied for table bookings`. Rejected and added least-privilege grants | Impersonated anon, provider, client, admin, and service_role in the Supabase SQL editor; recorded 26 expected-vs-actual checks in `docs/security-audit.md` | 6f1b13d, 50a9e6b |
| Claude, Part 2 (test script) | Asked for a SQL test script to exercise the authorization matrix | Role-impersonation pattern (`set local role` with JWT claims) and test cases | First script aborted partway on the bookings read; rejected and rewrote so each test runs independently | Re-ran the full matrix; all 26 checks matched expected results | bfe99c3 |
| Claude, Part 2 (data contract + API) | Asked for the services data contract, server-only Supabase client, and API route | Types, `getServiceClient()` in `src/lib/supabaseServer.ts` (service key kept server-side, no `NEXT_PUBLIC_` prefix), `/api/services` route | | `npm run build` compiled and passed TypeScript; `/api/services` listed as a dynamic route | 50a9e6b |
| Claude, Part 2 (UI) | Asked for a ServiceCard component, responsive grid, and services page | `ServiceCard.tsx`, `ServiceGrid.tsx`, `app/services/page.tsx` | | `npm run build` passed; `/services` listed as a dynamic route | b2bcd4c |
| Claude, Part 2 (docs) | Asked for requirements and the security audit document | `docs/requirements.md` and `docs/security-audit.md` | Earlier paste attempts into nano stacked text on top of the existing audit file; rejected, emptied the file, and re-saved it from a finished file | `wc -l` showed 34 and 48 lines; `head -3` confirmed the audit header | 40f3d6f |
