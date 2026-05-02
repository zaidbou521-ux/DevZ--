# DevZ (Dyad) — Replit Setup

## Overview

DevZ is a local, open-source AI development platform built as an **Electron desktop application**. In the Replit environment, the React/Vite renderer is served as a standalone web app (without the Electron main process).

## Architecture

- **Original**: Electron desktop app with a React/Vite renderer communicating via IPC
- **Replit**: Vite renderer served as a web app; Electron IPC is unavailable (handled gracefully)
- **Framework**: React 19 + Vite + TanStack Router + Jotai + TailwindCSS v4
- **Database**: SQLite via better-sqlite3 (Electron main process only)
- **Language**: TypeScript

## Key Files

- `vite.web.config.mts` — Custom Vite config for standalone web serving (port 5000, host 0.0.0.0)
- `vite.renderer.config.mts` — Original Electron renderer Vite config
- `vite.main.config.mts` — Electron main process Vite config
- `forge.config.ts` — Electron Forge configuration for building/packaging
- `src/renderer.tsx` — React app entry point
- `src/router.ts` — TanStack Router setup
- `src/ipc/` — IPC contracts and clients (gracefully handles missing window.electron)
- `src/ipc/contracts/core.ts` — IPC client generators

## Running

- **Dev (web)**: `npm run dev:web` → serves on port 5000
- **Dev (Electron)**: `npm run dev` → requires Electron (not available in Replit)

## Notes

- `window.electron` / IPC renderer is not available in web mode; all IPC calls log errors gracefully
- Node.js 24 is required (engine-strict=true in .npmrc)
- The app UI renders fully; backend features (AI chat, file system access, etc.) require Electron
