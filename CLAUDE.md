# CLAUDE.md

We're build the app described in @SPEC.md. Read that file for general architectural tasks or to double-check the exact database structure, tech stack or application architecture.

Keep your replies extremely concise and focus on conveying the key information. No unnecessary fluff, no long code snippets.

Whenever working with third-party library or something similar, you MUST look up the official documentation to ensure that you are're working with the up-to-date information.
Use the DocsExplorer subagent for efficient documentation lookup.

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
bun dev        # Start development server at http://localhost:3000
bun run build      # Production build
bun run start      # Start production server
bun lint       # Run ESLint
```

## Stack

- **Next.js 16** with App Router (TypeScript)
- **Tailwind CSS v4** for styling
- **better-auth** for authentication
- **Tiptap** for rich text editing
- **Zod** for schema validation
- **SQLite** via `DB_PATH` env var (default: `data/app.db`)

## Environment

Copy `.env.example` to `.env.local`. Required variables:

- `BETTER_AUTH_SECRET` — must be 32+ characters
- `DB_PATH` — path to SQLite database file
