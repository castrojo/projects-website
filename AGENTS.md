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

## Gap Checklist

Items not yet verified or implemented vs original design:

- [ ] Sidebar category filter using landscape categories (Provisioning, Runtime, etc.)
- [ ] Stats box: total GitHub stars field summed and displayed
- [ ] Confetti fireFountain() on regular project card click (not just heroes)
- [ ] CSS variables: `--color-graduated`, `--color-incubating` etc. in variables.css
- [ ] timeline.css as separate file in src/styles/ (not inline)
- [ ] Project card: DevStats + Slack action links rendered in card HTML
- [ ] Summary field (full.json summary.use_case) displayed somewhere in card/hero

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
