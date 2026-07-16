# Riftbound Counter

A face-to-face score counter for the [Riftbound](https://riftbound.leagueoflegends.com/) TCG, built as an installable mobile PWA. One phone sits in the middle of the table — the opposing seat is rotated 180° so both players read their own score the right way up.

**Live:** https://khairimeske.cloud/riftbound

<!-- Extracted from the `dashboard-react` Games feature of the Personal_AI_Project monorepo into its own deployable app. -->

## What it does

- **Points, the Riftbound way** — Hold and Conquer both score +1; first to the win threshold takes the game (8 for 1v1, 11 for 2v2, settable 1–30 for custom).
- **Modes** — 1v1, 2v2, or custom: up to 6 players as a free-for-all or in teams of 2–3, with per-seat colors.
- **Per-seat counters** — an XP tracker and named buff cards (each with its own value), both toggleable per seat.
- **Match clock** — starts automatically on the opening toss; pause/resume from the control bar.
- **Toss & flip** — the first tap picks who goes first; afterwards the same button is a plain heads/tails flip for card effects.
- **Match history** — every reset logs the game locally (last 30).
- **Screen wake lock** — the table won't dim mid-game.

Everything is device-local (`localStorage`). There is no backend, no account, and no network call after the first load.

## Layouts

| Seats | Layout |
|---|---|
| 2 | Face-to-face, control bar between them. Rotates to side-by-side in landscape. |
| 3+ | A 2-column grid; an odd last seat takes the full bottom row. |

## Development

```bash
npm install
npm run dev        # http://localhost:5183/riftbound/
```

The app is served from the `/riftbound/` subpath, so the dev server, `vite preview` and production all share one base — set by `base` in `vite.config.ts`, which also feeds the router basename, the PWA scope and the manifest.

To host it at a domain root instead, build with `BASE_PATH=/`:

```bash
BASE_PATH=/ npm run build
```

### Gates

```bash
npx tsc -b      # typecheck
npm test        # vitest — pure scoring/clock logic
npm run lint    # eslint
npm run build   # tsc -b && vite build
```

CI runs all four on every push to `main` before deploying.

### Other scripts

```bash
npm run icons   # regenerate the PWA PNG set from public/icons/*.svg
npm run format  # prettier
```

## Layout of the code

```
src/
├── features/games/
│   ├── riftbound.ts            # pure scoring/clock logic (the tested part)
│   ├── riftbound.test.ts
│   ├── themes.ts               # seat color themes
│   ├── GamesPage.tsx           # hub: games + match history tabs
│   ├── RiftboundSetupPage.tsx  # mode, seats, colors, counters
│   └── RiftboundCounterPage.tsx# the full-screen table
├── stores/
│   ├── useRiftbound.ts         # match state + history (persisted)
│   └── usePreferences.ts       # haptics, reduce motion
├── components/                 # ConfettiBurst + shadcn-style ui primitives
├── layout/AppShell.tsx         # header/back chrome (the table renders outside it)
└── lib/                        # cn(), haptics
```

Game rules live in `riftbound.ts` as pure functions and are the only thing under test; the components are presentation over that plus the Zustand store.

## Deployment

Static build, served by the existing `khairimeske-web` nginx container from a subfolder of the portfolio's web root (`/opt/khairimeske-web/dist/riftbound`). No new container or DNS record.

Push to `main` → GitHub Actions typechecks, tests, lints, builds, and ships `dist/` over tar-over-ssh. nginx serves it immediately; no restart.

### One-time setup

1. **Repo secret** — add `VPS_SSH_PRIVATE_KEY` (Settings → Secrets and variables → Actions) with the same deploy key the other two repos use.
2. **nginx** — paste the blocks from [`deploy/nginx-riftbound.conf`](deploy/nginx-riftbound.conf) into `/opt/khairimeske-web/nginx.conf` on the VPS, then reload:
   ```bash
   docker exec khairimeske-web nginx -t && docker exec khairimeske-web nginx -s reload
   ```

The portfolio's own deploy extracts into the same web root without deleting, so the two apps coexist — but the nginx blocks above must survive any future rewrite of that config.

## License

MIT — see [LICENSE](LICENSE).

Riftbound and League of Legends are trademarks of Riot Games, Inc. This is an unofficial fan-made tool, not affiliated with or endorsed by Riot Games.
