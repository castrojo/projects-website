# syntax=docker/dockerfile:1
ARG SKIP_GO_SYNC=false

FROM cgr.dev/chainguard/go:latest AS go-builder
ARG SKIP_GO_SYNC=false
WORKDIR /build
COPY projects-go/ ./projects-go/
RUN cd projects-go && go build -o projects cmd/projects/main.go
RUN mkdir -p src/data
COPY src/data/ ./src/data/
RUN if [ "${SKIP_GO_SYNC}" != "true" ]; then cd projects-go && ./projects; fi
RUN mkdir -p public/data && \
    cp src/data/projects.json public/data/projects.json 2>/dev/null || true && \
    cp src/data/changelog.json public/data/changelog.json 2>/dev/null || true

FROM cgr.dev/chainguard/node:latest-dev AS site-builder
USER root
WORKDIR /build
COPY package.json package-lock.json ./
RUN npm ci
COPY src/ ./src/
COPY public/ ./public/
COPY astro.config.mjs tsconfig.json ./
COPY --from=go-builder /build/src/data/ ./src/data/
COPY --from=go-builder /build/public/data/ ./public/data/
RUN npm run build

FROM cgr.dev/chainguard/nginx:latest
COPY --from=site-builder /build/dist/ /usr/share/nginx/html/projects-website/
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 8080
