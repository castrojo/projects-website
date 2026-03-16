# projects-website — Agent Guide

**First action**: Load the shared skill, then check the gap checklist.

```
/skills cncf-dev
```

## What This Repo Is

CNCF Projects discovery site — third of the Indie Cloud Native trilogy.
Visualizes all 245 CNCF projects (graduated, incubating, sandbox, archived)
from `landscape.cncf.io/data/full.json`. No API tokens needed.

- **Repo**: `castrojo/projects-website` (branch: `master`)
- **Live**: `https://castrojo.github.io/projects-website/`
- **Container**: `ghcr.io/castrojo/projects-website`

## Quick Start

```bash
just serve        # build container → run on :8081 → open browser
just sync-dev     # Go sync + Astro hot-reload (fast UI iteration)
just build        # full production build to dist/
just sync         # Go backend only (regenerate projects.json)
just test         # npx vitest run
just test-e2e     # npx playwright test
```

## Architecture

```
Go backend (projects-go/) → projects.json + changelog.json
Astro SSG → static shell + copies JSON to public/data/
Browser → fetch projects.json → single renderCard() renders all cards
```

Key files:
- `projects-go/internal/fetcher/landscape.go` — fetches full.json, filters maturity
- `src/lib/project-renderer.ts` — THE single renderCard() function
- `src/lib/heroes.ts` — djb2 hero rotation, selectHeroSets()
- `src/lib/archived-timeline.ts` — living timeline for archived tab
- `src/pages/index.astro` — thin shell + hero grid + staff row + card container
- `src/data/staff-support.json` — committed (not gitignored)
- `src/styles/` — variables.css, cards.css, layout.css

## Verified Feature Inventory (as of 2026-03-16)

All features verified against source code. No guessing.

| Feature | Status | File |
|---------|--------|------|
| 5 tabs (everyone/graduated/incubating/sandbox/archived) | ✅ Done | `src/lib/tabs.ts` |
| Hero grid — 8 cards × 4 tab sets (everyone/graduated/incubating/sandbox) | ✅ Done | `src/lib/heroes.ts`, `index.astro` |
| Archived tab — living timeline (year-grouped, date-sorted) | ✅ Done | `src/lib/archived-timeline.ts`, `src/styles/cards.css` |
| All 14 keyboard shortcuts (/ s ? t 1-5 j k h Space Tab [ ] o Esc) | ✅ Done | `src/lib/keyboard.ts` |
| Sidebar stats box (total, graduated, incubating, sandbox, archived, stars) | ✅ Done | `ProjectsLayout.astro` |
| Sidebar category filter dropdown | ✅ Done | `ProjectsLayout.astro` |
| MiniSearch full-text search (fuzzy 0.2, prefix, boost) | ✅ Done | `src/lib/search.ts` |
| SiteSwitcher (People / Projects / End Users pills) | ✅ Done | `SiteSwitcher.astro` |
| ThemeToggle (dark/light, localStorage) | ✅ Done | `ThemeToggle.astro` |
| KeyboardHelp modal | ✅ Done | `KeyboardHelp.astro` |
| InfoBox sidebar | ✅ Done | `InfoBox.astro` |
| KubeConBanner (auto-rotate 8s) | ✅ Done | `KubeConBanner.astro` |
| Staff support section (ambassadors, kubestronauts, maintainers, toc, tab, gb) | ✅ Done | `src/data/staff-support.json` |
| Confetti on regular project cards (fireFountain) | ✅ Done | `index.astro` line ~182 |
| Confetti on hero cards (fireHearts) | ✅ Done | `index.astro` |
| DevStats + Slack links in project cards | ✅ Done | `src/lib/project-renderer.ts` lines 100-101 |
| CSS variables for maturity colors (`--color-graduated` etc.) | ✅ Done | `src/styles/variables.css` |
| Timeline styles in cards.css (not separate file) | ✅ Done | `src/styles/cards.css` lines 268-330 |
| Rotating slogans (5 slogans, 12s interval) | ✅ Done | `ProjectsLayout.astro` |
| `kbd-live-region` aria-live region | ✅ Done | `ProjectsLayout.astro` |
| Site nav order: `[`=People, `]`=EndUsers | ✅ Done | `index.astro` lines 303-304 |
| RSS feed at /feed.xml (100 most recent changelog events) | ✅ Done | `src/pages/feed.xml.ts` |
| Go backend with ETag caching, diff detection | ✅ Done | `projects-go/` |

## Remaining Gaps

- [ ] **Summary/use_case field not displayed** — `full.json` has `summary.use_case` per project. The `SafeProject` struct may not include it. Add to Go model + TS interface + display in card (below description) or hero tooltip.

## Resolved (was in old checklist)

All other items from the original checklist have been implemented and verified.

## Skills

- Load `/skills cncf-dev` for full architecture spec, gap checklists, card designs, CSS rules
- Landscape data queries: use `cncf-landscape` MCP server (`query_projects`, `get_project_details`)

## Landscape MCP Server

When you need to look up CNCF project data as an AI agent, use the MCP server:
- `query_projects` — filter by maturity, name, date ranges
- `get_project_details` — single project lookup
- DO NOT fetch `https://landscape.cncf.io/data/full.json` manually

The Go backend fetches full.json directly (richer fields than MCP). The MCP server
is for AI agent queries only.

## Testing Rules

- Run `npx playwright test` before and after any change
- Visual layout tests in `tests/e2e/visual-layout.spec.ts` check computed CSS
- Element-existence tests alone are insufficient — CSS can be broken while tests pass
- Run E2E tests sequentially when running all 3 sites (port conflicts)

## Branch + Commit

```bash
git add . && git commit -m "feat: description

Assisted-by: Claude Sonnet 4.6 via GitHub Copilot
Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>"
git push
```

Branch is `master`. Push directly (castrojo-owned, no fork workflow).
