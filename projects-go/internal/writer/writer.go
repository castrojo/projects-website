package writer

import (
	"encoding/json"
	"os"
	"path/filepath"
	"sort"

	"github.com/castrojo/projects-website/projects-go/internal/models"
)

const dataDir = "../src/data"

func WriteProjects(projects []models.SafeProject, updatedAt map[string]string) error {
	if err := os.MkdirAll(dataDir, 0755); err != nil {
		return err
	}
	for i, p := range projects {
		if ts, ok := updatedAt[p.Slug]; ok && ts != "" {
			projects[i].UpdatedAt = ts
		} else if p.UpdatedAt == "" {
			projects[i].UpdatedAt = models.LatestMilestoneDate(p)
		}
	}
	sort.Slice(projects, func(i, j int) bool {
		return models.LatestMilestoneDate(projects[i]) > models.LatestMilestoneDate(projects[j])
	})

	data, err := json.MarshalIndent(projects, "", "  ")
	if err != nil {
		return err
	}
	return os.WriteFile(filepath.Join(dataDir, "projects.json"), data, 0644)
}

func WriteChangelog(newEvents []models.Event, existingPath string) error {
	if err := os.MkdirAll(dataDir, 0755); err != nil {
		return err
	}
	var existing []models.Event
	if data, err := os.ReadFile(existingPath); err == nil {
		_ = json.Unmarshal(data, &existing)
	}

	all := append(newEvents, existing...)
	sort.Slice(all, func(i, j int) bool {
		return all[i].Timestamp > all[j].Timestamp
	})

	data, err := json.MarshalIndent(all, "", "  ")
	if err != nil {
		return err
	}
	return os.WriteFile(filepath.Join(dataDir, "changelog.json"), data, 0644)
}
