# projects-website — Operational Knowledge

## When to Use
Load this skill for any work in `castrojo/projects-website` — Go backend, Astro frontend, data files, tests.

## When NOT to Use
For cross-site architecture, layout rules, keyboard shortcuts, or SiteSwitcher spec → also load `~/src/skills/cncf-dev/SKILL.md` and `~/src/skills/cncf-layout/SKILL.md`.

---

## What This Repo Is

CNCF Projects discovery site. Visualizes all 245 CNCF projects (graduated, incubating, sandbox, archived)
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

| Feature | Status | File |
|---------|--------|------|
| 5 tabs (everyone/graduated/incubating/sandbox/archived) | ✅ Done | `src/lib/tabs.ts` |
| Hero grid — 8 cards × 4 tab sets | ✅ Done | `src/lib/heroes.ts`, `index.astro` |
| Archived tab — living timeline (year-grouped, date-sorted) | ✅ Done | `src/lib/archived-timeline.ts` |
| All 14 keyboard shortcuts | ✅ Done | `src/lib/keyboard.ts` |
| Sidebar stats box + category filter dropdown | ✅ Done | `ProjectsLayout.astro` |
| MiniSearch full-text search (fuzzy 0.2, prefix, boost) | ✅ Done | `src/lib/search.ts` |
| SiteSwitcher, ThemeToggle, KeyboardHelp, InfoBox, KubeConBanner | ✅ Done | respective .astro files |
| Staff support section (6 groups) | ✅ Done | `src/data/staff-support.json` |
| Confetti on regular + hero cards | ✅ Done | `index.astro` |
| DevStats + Slack links in project cards | ✅ Done | `src/lib/project-renderer.ts` |
| CSS variables for maturity colors | ✅ Done | `src/styles/variables.css` |
| Timeline styles in cards.css | ✅ Done | `src/styles/cards.css` |
| RSS feed at /feed.xml | ✅ Done | `src/pages/feed.xml.ts` |
| Go backend with ETag caching, diff detection | ✅ Done | `projects-go/` |

## Remaining Gaps

- [ ] **summary/use_case field not displayed** — `full.json` has `summary.use_case` per project. Add to Go model + TS interface + display in card.

## Landscape MCP Server

Use `cncf-landscape` MCP for AI agent queries — do NOT fetch full.json manually.
- `query_projects` — filter by maturity, name, date ranges
- `get_project_details` — single project lookup

## Testing Rules — TDD Required (Non-Negotiable)

**Tests MUST be written before implementation. Always.**

### Mandatory commit gate — ALL must pass before `git commit`

- `just test` passes (unit tests)
- `just test-e2e` passes (E2E — requires `just serve` running in another terminal)
- Every new feature has at least one test verified **RED** before implementation

**If you cannot run the tests, the task is BLOCKED — not done.**

### The mandatory TDD workflow for any renderer or component change:

1. **Baseline**: Run `just test` — confirm all tests green before touching anything
2. **Write tests first**: For EVERY FIELD the component should render, write a test that verifies it — not just class names or element existence — the actual content
3. **Run `just test` → new tests MUST FAIL** (red is correct; proves the tests are real)
4. **Implement** the change
5. **Run `just test` → ALL tests MUST PASS** (green)
6. Never commit code written before its tests. Never commit when tests are red.

### What counts as a "richness test":

| ❌ BAD — structure only | ✅ GOOD — richness |
|---|---|
| `expect(html).toContain('changelog-event-card')` | `expect(html).toContain('stat-item')` |
| `expect(html).toContain('Kubernetes')` | `expect(html).toContain('110.0k')` (stars value) |
| `expect(html).toContain('accepted')` | `expect(html).toContain('href="https://github.com/...')` |

### Cross-renderer contract rule:

If renderer B wraps renderer A (e.g. `changelog-renderer` calls `renderCard`), **B's tests MUST
include all fields that A's tests cover**. This prevents silent stripping when refactoring.

### Required tests by feature

#### Header stability (tests/e2e/header.spec.ts)

Any change to `layout.css` or the layout Astro file MUST keep these passing:
- `.site-title` computed `white-space === 'nowrap'` — title must NEVER wrap to two lines
- CNCF logo is exactly `42×42`
- `header-left` is exactly 240px wide

**Post-mortem (2026-03-16):** An agent removed `white-space: nowrap` from `.site-title` and "CNCF Projects" wrapped in production. No test caught it.

#### Pinned/featured card

Any pinned section MUST have E2E tests that verify: visible on correct tab, hidden on ALL other tabs, contains expected content.

**Post-mortem (2026-03-16):** Agent shipped `feat: pinned LWCN newsletter card` with zero tests.

#### Post-mortem: LWCN richness regression (2026-03-16)

A changelog implementation replaced `renderCard()` with `renderChangelogEvent()` that stripped ALL rich fields. Tests passed because they only checked class names and project name.

**Rule: if your tests would pass on an empty `<div>Kubernetes</div>`, they are insufficient.**

## Branch + Commit

```bash
git add . && git commit -m "feat: description

Assisted-by: Claude Sonnet 4.6 via GitHub Copilot
Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>"
git push
```

Branch is `master`. Push directly (castrojo-owned, no fork workflow).
