package enricher

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"path/filepath"
	"strings"
	"time"

	"github.com/castrojo/projects-website/projects-go/internal/models"
)

const staleTTL = 90 * 24 * time.Hour

// GitHubExtra holds cached fork data for a single repo.
type GitHubExtra struct {
	Forks     int       `json:"forks"`
	FetchedAt time.Time `json:"fetched_at"`
}

type githubRepoResponse struct {
	ForksCount int `json:"forks_count"`
}

// LoadCache reads the extras cache from disk. Returns an empty map if the file
// does not exist.
func LoadCache(path string) (map[string]GitHubExtra, error) {
	cache := make(map[string]GitHubExtra)
	data, err := os.ReadFile(path)
	if os.IsNotExist(err) {
		return cache, nil
	}
	if err != nil {
		return cache, err
	}
	if err := json.Unmarshal(data, &cache); err != nil {
		return cache, err
	}
	return cache, nil
}

// SaveCache writes the extras cache to disk, creating parent directories as
// needed.
func SaveCache(path string, cache map[string]GitHubExtra) error {
	if err := os.MkdirAll(filepath.Dir(path), 0o755); err != nil {
		return err
	}
	data, err := json.MarshalIndent(cache, "", "  ")
	if err != nil {
		return err
	}
	return os.WriteFile(path, data, 0o644)
}

// repoPath extracts "owner/repo" from a GitHub URL. Returns "" for non-GitHub
// URLs or malformed ones.
func repoPath(repoURL string) string {
	trimmed := strings.TrimPrefix(repoURL, "https://github.com/")
	if trimmed == repoURL {
		// Not a github.com URL
		return ""
	}
	// Remove trailing slash or .git
	trimmed = strings.TrimSuffix(strings.TrimSuffix(trimmed, "/"), ".git")
	parts := strings.SplitN(trimmed, "/", 3)
	if len(parts) < 2 || parts[0] == "" || parts[1] == "" {
		return ""
	}
	return parts[0] + "/" + parts[1]
}

// fetchForks calls the GitHub REST API for the given "owner/repo" path and
// returns the forks count.
func fetchForks(ownerRepo, token string) (int, error) {
	url := "https://api.github.com/repos/" + ownerRepo
	req, err := http.NewRequest(http.MethodGet, url, nil)
	if err != nil {
		return 0, err
	}
	req.Header.Set("Authorization", "Bearer "+token)
	req.Header.Set("Accept", "application/vnd.github+json")
	req.Header.Set("X-GitHub-Api-Version", "2022-11-28")
	req.Header.Set("User-Agent", "castrojo/projects-website")

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return 0, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return 0, fmt.Errorf("GitHub API returned %d for %s", resp.StatusCode, ownerRepo)
	}

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return 0, err
	}

	var gr githubRepoResponse
	if err := json.Unmarshal(body, &gr); err != nil {
		return 0, err
	}
	return gr.ForksCount, nil
}

// EnrichForks fills in Forks on each project using the cache and (optionally)
// live GitHub API calls.
//
// Behaviour:
//  1. If p.Forks > 0 already (from full.json), skip entirely.
//  2. Apply any cached value — fresh or stale — as a fallback baseline.
//  3. If the cache entry is stale (or missing) AND token != "", make a live API
//     call, update the cache, and overwrite the value on the project.
//  4. At most 50 API calls are made per invocation.
//
// Returns the number of API calls made.
func EnrichForks(projects []models.SafeProject, cache map[string]GitHubExtra, token string) int {
	now := time.Now()
	calls := 0
	const maxCalls = 50

	for i := range projects {
		p := &projects[i]

		if p.Forks > 0 {
			// Already populated from full.json — nothing to do.
			continue
		}

		repo := repoPath(p.RepoURL)
		if repo == "" {
			continue
		}

		extra, cached := cache[p.RepoURL]

		// Apply whatever we have in cache as a baseline (even if stale).
		if cached && extra.Forks > 0 {
			p.Forks = extra.Forks
		}

		fresh := cached && now.Sub(extra.FetchedAt) < staleTTL
		if fresh {
			continue
		}

		// Entry is stale or missing — try a live fetch if we have a token.
		if token == "" || calls >= maxCalls {
			continue
		}

		forks, err := fetchForks(repo, token)
		if err != nil {
			// Non-fatal: keep whatever baseline we applied above.
			continue
		}

		p.Forks = forks
		cache[p.RepoURL] = GitHubExtra{Forks: forks, FetchedAt: now}
		calls++
	}

	return calls
}
