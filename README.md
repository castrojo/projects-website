# projects-website

CNCF Projects — indie cloud native. Discover graduated, incubating, sandbox, and archived CNCF projects.

Part of the Indie Cloud Native trilogy:
- [People](https://castrojo.github.io/people-website/) — CNCF community members
- [Projects](https://castrojo.github.io/projects-website/) — CNCF projects (this site)
- [End Users](https://castrojo.github.io/endusers-website/) — CNCF member organizations

Data source: [landscape.cncf.io/data/full.json](https://landscape.cncf.io/data/full.json) — updated daily.

## Development

Prerequisites: Go 1.22+, Node 20+, just, podman

```bash
just sync-dev   # fetch data + start Astro dev server
just serve      # build + run container on :8081
just test       # run unit tests
just test-go    # run Go tests
```

## Architecture

Go backend fetches full.json, filters CNCF projects, writes src/data/projects.json.
Astro SSG renders static HTML. Client-side TypeScript handles search + tab filtering.
No GitHub API tokens needed.

