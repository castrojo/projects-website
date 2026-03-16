set shell := ["bash", "-euo", "pipefail", "-c"]

default:
    just --list

serve:
    just container-build
    podman rm -f projects-website 2>/dev/null || true
    podman run -d --name projects-website -p 8081:8080 ghcr.io/castrojo/projects-website:local
    xdg-open http://localhost:8081/projects-website/

build:
    npm ci
    cd projects-go && go build -o projects cmd/projects/main.go && ./projects
    mkdir -p public/data
    cp src/data/projects.json public/data/projects.json
    cp src/data/changelog.json public/data/changelog.json
    npm run build

container-build:
    podman build -t ghcr.io/castrojo/projects-website:local -f Containerfile .

stop:
    podman rm -f projects-website 2>/dev/null || true

sync:
    cd projects-go && go build -o projects cmd/projects/main.go && ./projects

dev:
    npx astro dev --port 4322 --host

sync-dev:
    just sync
    just dev

test:
    npx vitest run

test-e2e:
    npx playwright test

test-go:
    cd projects-go && go test ./...
