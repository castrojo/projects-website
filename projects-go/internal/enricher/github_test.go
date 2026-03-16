package enricher

import (
	"os"
	"path/filepath"
	"testing"
	"time"

	"github.com/castrojo/projects-website/projects-go/internal/models"
)

func TestLoadCacheEmpty(t *testing.T) {
	cache, err := LoadCache("/nonexistent/path/github_extras.json")
	if err != nil {
		t.Fatalf("expected no error for missing file, got: %v", err)
	}
	if len(cache) != 0 {
		t.Fatalf("expected empty cache, got %d entries", len(cache))
	}
}

func TestSaveAndLoadCache(t *testing.T) {
	dir := t.TempDir()
	path := filepath.Join(dir, ".sync-cache", "github_extras.json")

	now := time.Now().UTC().Truncate(time.Second)
	original := map[string]GitHubExtra{
		"https://github.com/kubernetes/kubernetes": {Forks: 42, FetchedAt: now},
	}

	if err := SaveCache(path, original); err != nil {
		t.Fatalf("SaveCache: %v", err)
	}

	if _, err := os.Stat(path); err != nil {
		t.Fatalf("expected file to exist: %v", err)
	}

	loaded, err := LoadCache(path)
	if err != nil {
		t.Fatalf("LoadCache: %v", err)
	}

	entry, ok := loaded["https://github.com/kubernetes/kubernetes"]
	if !ok {
		t.Fatal("expected entry for kubernetes/kubernetes")
	}
	if entry.Forks != 42 {
		t.Errorf("expected Forks=42, got %d", entry.Forks)
	}
	if !entry.FetchedAt.Equal(now) {
		t.Errorf("expected FetchedAt=%v, got %v", now, entry.FetchedAt)
	}
}

func TestEnrichForks_NoToken(t *testing.T) {
	now := time.Now()
	cache := map[string]GitHubExtra{
		"https://github.com/prometheus/prometheus": {Forks: 99, FetchedAt: now},
	}
	projects := []models.SafeProject{
		{Name: "Prometheus", RepoURL: "https://github.com/prometheus/prometheus"},
	}

	calls := EnrichForks(projects, cache, "")
	if calls != 0 {
		t.Errorf("expected 0 API calls with empty token, got %d", calls)
	}
	// Cached value should be applied even without a token.
	if projects[0].Forks != 99 {
		t.Errorf("expected Forks=99 from cache, got %d", projects[0].Forks)
	}
}

func TestEnrichForks_CacheHit(t *testing.T) {
	// p.Forks already populated — should be skipped entirely, cache ignored.
	cache := map[string]GitHubExtra{
		"https://github.com/kubernetes/kubernetes": {Forks: 9999, FetchedAt: time.Now()},
	}
	projects := []models.SafeProject{
		{Name: "Kubernetes", RepoURL: "https://github.com/kubernetes/kubernetes", Forks: 55000},
	}

	calls := EnrichForks(projects, cache, "token-abc")
	if calls != 0 {
		t.Errorf("expected 0 API calls when Forks already set, got %d", calls)
	}
	if projects[0].Forks != 55000 {
		t.Errorf("expected Forks unchanged at 55000, got %d", projects[0].Forks)
	}
}

func TestEnrichForks_StaleNoToken(t *testing.T) {
	// Stale entry (>90 days), but no token → apply stale value, no API call.
	staleTime := time.Now().Add(-(91 * 24 * time.Hour))
	cache := map[string]GitHubExtra{
		"https://github.com/containerd/containerd": {Forks: 123, FetchedAt: staleTime},
	}
	projects := []models.SafeProject{
		{Name: "containerd", RepoURL: "https://github.com/containerd/containerd"},
	}

	calls := EnrichForks(projects, cache, "")
	if calls != 0 {
		t.Errorf("expected 0 API calls (no token), got %d", calls)
	}
	if projects[0].Forks != 123 {
		t.Errorf("expected stale Forks=123 applied as fallback, got %d", projects[0].Forks)
	}
}
