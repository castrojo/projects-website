package fetcher

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"path/filepath"
	"strings"
	"time"

	"github.com/castrojo/projects-website/projects-go/internal/models"
	"github.com/google/uuid"
	"github.com/mmcdole/gofeed"
)

const (
	LWCNFeedURL   = "https://lwcn.dev/newsletter/feed.xml"
	LWCNLogoURL   = "https://lwcn.dev/images/logo.svg"
	lwcnStateFile = ".sync-cache/lwcn_state.json"
)

type lwcnState struct {
	ETag         string `json:"etag,omitempty"`
	LastModified string `json:"lastModified,omitempty"`
}

func loadLWCNState() lwcnState {
	data, err := os.ReadFile(lwcnStateFile)
	if err != nil {
		return lwcnState{}
	}
	var s lwcnState
	_ = json.Unmarshal(data, &s)
	return s
}

func saveLWCNState(s lwcnState) {
	_ = os.MkdirAll(filepath.Dir(lwcnStateFile), 0755)
	data, _ := json.MarshalIndent(s, "", "  ")
	_ = os.WriteFile(lwcnStateFile, data, 0644)
}

// buildProjectNameMap returns a lowercase-name → SafeProject lookup.
func buildProjectNameMap(projects []models.SafeProject) map[string]models.SafeProject {
	m := make(map[string]models.SafeProject, len(projects))
	for _, p := range projects {
		m[strings.ToLower(p.Name)] = p
	}
	return m
}

// matchProjects scans text for known CNCF project names and returns matches.
func matchProjects(text string, nameMap map[string]models.SafeProject) []models.MentionedProject {
	lower := strings.ToLower(text)
	seen := map[string]bool{}
	var results []models.MentionedProject
	for name, p := range nameMap {
		if seen[p.Slug] {
			continue
		}
		if strings.Contains(lower, name) {
			seen[p.Slug] = true
			results = append(results, models.MentionedProject{
				Name:     p.Name,
				Slug:     p.Slug,
				LogoURL:  p.LogoURL,
				Maturity: p.Maturity,
			})
		}
	}
	return results
}

// FetchLWCN fetches the LWCN newsletter RSS feed and returns newsletter events.
// Errors are non-fatal — callers should log and continue.
func FetchLWCN(projects []models.SafeProject) ([]models.Event, error) {
	state := loadLWCNState()

	req, err := http.NewRequest("GET", LWCNFeedURL, nil)
	if err != nil {
		return nil, fmt.Errorf("lwcn: build request: %w", err)
	}
	if state.ETag != "" {
		req.Header.Set("If-None-Match", state.ETag)
	}
	if state.LastModified != "" {
		req.Header.Set("If-Modified-Since", state.LastModified)
	}

	client := &http.Client{Timeout: 15 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		return nil, fmt.Errorf("lwcn: fetch: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode == http.StatusNotModified {
		log.Println("LWCN feed unchanged (304)")
		return nil, nil
	}
	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("lwcn: unexpected status %d", resp.StatusCode)
	}

	// Save ETag/Last-Modified only after a successful parse (see below).
	newState := lwcnState{
		ETag:         resp.Header.Get("ETag"),
		LastModified: resp.Header.Get("Last-Modified"),
	}

	// The lwcn.dev feed embeds HTML-escaped CDATA-like sequences in
	// <content:encoded> using &lt;![CDATA[...]]> (not real CDATA). The
	// trailing ]]> is unescaped text, which violates XML well-formedness.
	// Sanitize it before parsing so gofeed doesn't choke.
	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("lwcn: read body: %w", err)
	}
	body = bytes.ReplaceAll(body, []byte("]]>"), []byte("]]&gt;"))

	fp := gofeed.NewParser()
	feed, err := fp.Parse(bytes.NewReader(body))
	if err != nil {
		return nil, fmt.Errorf("lwcn: parse feed: %w", err)
	}

	// Persist state only on successful parse so a transient error doesn't
	// suppress the next fetch attempt.
	saveLWCNState(newState)

	nameMap := buildProjectNameMap(projects)
	var events []models.Event

	for _, item := range feed.Items {
		if item.Title == "" {
			continue
		}
		// Skip "Articles" variant entries — only ingest main weekly issues
		if strings.Contains(item.Title, "Articles") {
			continue
		}

		ts := ""
		if item.PublishedParsed != nil {
			ts = item.PublishedParsed.UTC().Format(time.RFC3339)
		}

		scanText := item.Title + " " + item.Description
		mentioned := matchProjects(scanText, nameMap)

		events = append(events, models.Event{
			ID:                uuid.New().String(),
			Type:              "newsletter",
			LogoURL:           LWCNLogoURL,
			Timestamp:         ts,
			Description:       item.Description,
			LWCNIssueURL:      item.Link,
			LWCNTitle:         item.Title,
			MentionedProjects: mentioned,
		})
	}

	return events, nil
}
