# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.

## FlowDesk Application

### Purpose
Premium desktop-style productivity application (Whisperflow-inspired command center). Dark, minimal, enterprise-grade UI.

### Tech
- Frontend: React + Vite + Framer Motion + Recharts + Tailwind CSS
- Backend: Express 5 + Drizzle ORM + PostgreSQL
- Design: Inter font, charcoal/indigo dark theme

### Features
- **Loading Screen**: Particle canvas + animated logo reveal + custom progress bar
- **Dashboard**: Live stats, animated area chart (14-day executions), activity feed
- **Command Center**: CRUD for automation commands, live execution with feedback
- **History**: Paginated timeline with status filters and summary stats
- **Settings**: Theme, shortcuts, system integration, privacy controls
- **Command Palette**: Global Cmd+K overlay for fast navigation + command execution
- **Sidebar**: Collapsible with active indicator animations

### DB Tables
- `commands` — automation commands with execution tracking
- `history` — execution log with status/trigger/timing
- `settings` — user preferences (single row)
- `shortcuts` — keyboard shortcuts with enable/disable

### Routes
- `/api/dashboard/stats` — stat cards data
- `/api/dashboard/activity` — recent activity feed
- `/api/dashboard/chart-data` — 14-day chart data
- `/api/commands` — CRUD
- `/api/commands/:id/execute` — run a command
- `/api/history` — paginated log
- `/api/history/summary` — aggregated counts
- `/api/settings` — get/update settings
- `/api/settings/shortcuts` — keyboard shortcut management
