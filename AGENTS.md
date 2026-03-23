> ⛔ Never open upstream PRs. Full rules: `cat ~/src/skills/workflow/SKILL.md`

# castrojo/projects-website

CNCF Projects discovery site — 245 graduated/incubating/sandbox/archived projects.
Live: `https://castrojo.github.io/projects-website/` | Branch: `master`

## Skills

```bash
cat skills/SKILL.md                        # repo operational knowledge
cat ~/src/skills/cncf-dev/SKILL.md         # cross-site architecture, layout, SiteSwitcher
cat ~/src/skills/cncf-layout/SKILL.md      # header spec, CSS rules
cat ~/src/skills/cncf-testing/SKILL.md     # test pyramid, Playwright patterns
```

## Quick Start

```bash
just serve        # build container → run on :8081 → open browser
just sync-dev     # Go sync + Astro hot-reload (fast UI iteration)
just test         # npx vitest run
just test-e2e     # npx playwright test
```

## Critical Rules

- **TDD required** — tests must be RED before implementing; `just test` must pass before commit
- **Richness tests only** — never test class names; test actual content values (stars count, URLs, colors)
- **Cross-renderer contract** — if renderer B wraps renderer A, B's tests must cover all of A's fields
- **Logic in .ts** — never put business logic directly in .astro files
- **Landscape MCP** — use `cncf-landscape` MCP for project data; never fetch full.json manually

## Work Queue

```bash
gh issue list --repo castrojo/projects-website --label copilot-ready --state open
```

## Session End

```bash
supermemory(mode="add", type="conversation", scope="project", content="[WHAT]...[WHY]...[FIX]...[NEXT]...")
```
