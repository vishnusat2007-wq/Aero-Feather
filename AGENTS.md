<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Cursor Cloud specific instructions

- **Install**: `npm ci` (runs during environment builds via `.cursor/environment.json`).
- **Dev server**: `npm run dev` — available in the `dev` terminal on port 3000.
- **Build**: `npm run build` — verify production builds before opening PRs.
- **Lint**: `npm run lint`.
- No secrets or external services are required for the default scaffold.
