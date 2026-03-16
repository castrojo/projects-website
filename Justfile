set shell := ["bash", "-euo", "pipefail", "-c"]

default:
    just --list

# Build locally and preview in browser — always fresh, Ctrl+C to stop
serve:
    npm run build
    xdg-open http://localhost:4322/projects-website/
    npx astro preview --port 4322

# Astro-only local build (uses existing synced data)
build:
    npm run build

# Full container build (Go sync + Astro + nginx image)
container-build:
    podman build -t ghcr.io/castrojo/projects-website:local -f Containerfile .

# Stop the running container
stop:
    podman rm -f projects-website 2>/dev/null || true

# Go backend sync only (re-fetch data from landscape.cncf.io)
sync:
    cd projects-go && go build -o projects cmd/projects/main.go && ./projects
    mkdir -p public/data
    cp src/data/projects.json public/data/projects.json
    cp src/data/changelog.json public/data/changelog.json

# Astro hot-reload dev server (fastest UI iteration, no build step)
dev:
    npx astro dev --port 4322 --host

# Sync data then hot-reload dev
sync-dev:
    just sync
    just dev

# Run unit tests
test:
    npx vitest run

# Run E2E tests (builds + previews automatically via playwright config)
test-e2e:
    npx playwright test

# Run Go backend tests
test-go:
    cd projects-go && go test ./...
