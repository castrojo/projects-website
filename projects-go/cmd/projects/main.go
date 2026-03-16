package main

import (
	"encoding/json"
	"fmt"
	"log"
	"os"

	"github.com/castrojo/projects-website/projects-go/internal/differ"
	"github.com/castrojo/projects-website/projects-go/internal/enricher"
	"github.com/castrojo/projects-website/projects-go/internal/fetcher"
	"github.com/castrojo/projects-website/projects-go/internal/state"
	"github.com/castrojo/projects-website/projects-go/internal/writer"
)

func main() {
	s := state.LoadState()

	fmt.Println("Fetching landscape.cncf.io/data/full.json...")
	result, err := fetcher.FetchProjects(s.ETag)
	if err != nil {
		log.Fatalf("fetch error: %v", err)
	}

	if !result.Modified {
		fmt.Println("No changes (ETag matched). Loading previous data...")
		prevData, err := state.LoadPreviousProjects()
		if err != nil {
			log.Fatalf("no previous data and no changes: %v", err)
		}
		var projects []interface{}
		if err := json.Unmarshal(prevData, &projects); err != nil {
			log.Fatalf("invalid previous data: %v", err)
		}
		fmt.Printf("Loaded %d projects from cache\n", len(projects))
		return
	}

	fmt.Printf("Fetched %d CNCF projects\n", len(result.Projects))

	githubExtrasPath := ".sync-cache/github_extras.json"
	extrasCache, _ := enricher.LoadCache(githubExtrasPath)
	token := os.Getenv("GITHUB_TOKEN")
	apiCalls := enricher.EnrichForks(result.Projects, extrasCache, token)
	if apiCalls > 0 {
		fmt.Printf("Enriched forks for %d projects via GitHub API\n", apiCalls)
		_ = enricher.SaveCache(githubExtrasPath, extrasCache)
	}

	prevData, _ := state.LoadPreviousProjects()
	events, updatedAt := differ.Diff(prevData, result.Projects)
	fmt.Printf("Detected %d changelog events\n", len(events))

	changelogPath := "../src/data/changelog.json"
	if err := writer.WriteChangelog(events, changelogPath); err != nil {
		log.Fatalf("writing changelog: %v", err)
	}

	// Fetch LWCN newsletter events (non-fatal)
	fmt.Println("Fetching LWCN newsletter feed...")
	lwcnEvents, lwcnErr := fetcher.FetchLWCN(result.Projects)
	if lwcnErr != nil {
		log.Printf("LWCN fetch warning (non-fatal): %v", lwcnErr)
	} else if len(lwcnEvents) > 0 {
		fmt.Printf("Fetched %d LWCN newsletter events\n", len(lwcnEvents))
		if err := writer.WriteChangelog(lwcnEvents, changelogPath); err != nil {
			log.Printf("LWCN changelog write warning (non-fatal): %v", err)
		}
	} else {
		fmt.Println("LWCN feed unchanged or no new events")
	}

	if err := writer.WriteProjects(result.Projects, updatedAt); err != nil {
		log.Fatalf("writing projects: %v", err)
	}

	data, _ := json.MarshalIndent(result.Projects, "", "  ")
	if err := state.SavePreviousProjects(data); err != nil {
		log.Fatalf("saving previous: %v", err)
	}
	if err := state.SaveState(state.State{ETag: result.ETag}); err != nil {
		log.Fatalf("saving state: %v", err)
	}

	graduated, incubating, sandbox, archived := 0, 0, 0, 0
	for _, p := range result.Projects {
		switch p.Maturity {
		case "graduated":
			graduated++
		case "incubating":
			incubating++
		case "sandbox":
			sandbox++
		case "archived":
			archived++
		}
	}
	fmt.Printf("Breakdown: %d graduated, %d incubating, %d sandbox, %d archived\n",
		graduated, incubating, sandbox, archived)

	_, _ = fmt.Fprintf(os.Stderr, "projects-website: wrote %d projects, %d events\n",
		len(result.Projects), len(events))
}
