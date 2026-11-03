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
