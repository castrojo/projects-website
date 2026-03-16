package writer

import (
	"encoding/json"
	"os"
	"path/filepath"
	"strings"
	"testing"

	"github.com/castrojo/projects-website/projects-go/internal/models"
)

// chdirTemp changes the process working directory to a subdirectory of
// t.TempDir() so that the hardcoded "../src/data" path lands inside the
// temp tree. The original directory is restored via t.Cleanup.
func chdirTemp(t *testing.T) string {
	t.Helper()
	tmp := t.TempDir()
	sub := filepath.Join(tmp, "workdir")
	if err := os.MkdirAll(sub, 0755); err != nil {
		t.Fatalf("MkdirAll workdir: %v", err)
	}
	orig, err := os.Getwd()
	if err != nil {
		t.Fatalf("Getwd: %v", err)
	}
	if err := os.Chdir(sub); err != nil {
		t.Fatalf("Chdir: %v", err)
	}
	t.Cleanup(func() { os.Chdir(orig) })
	// "../src/data" relative to sub == filepath.Join(tmp, "src", "data")
	return tmp
}

func TestWriteProjects_ProducesValidJSON(t *testing.T) {
	tmp := chdirTemp(t)

	projects := []models.SafeProject{
		{Name: "Kubernetes", Slug: "kubernetes", Maturity: "graduated", GraduatedDate: "2018-03-06"},
		{Name: "Prometheus", Slug: "prometheus", Maturity: "graduated", GraduatedDate: "2018-08-09"},
	}

	if err := WriteProjects(projects, nil); err != nil {
		t.Fatalf("WriteProjects: %v", err)
	}

	outPath := filepath.Join(tmp, "src", "data", "projects.json")
	data, err := os.ReadFile(outPath)
	if err != nil {
		t.Fatalf("ReadFile: %v", err)
	}

	var result []models.SafeProject
	if err := json.Unmarshal(data, &result); err != nil {
		t.Errorf("output is not valid JSON: %v", err)
	}
	if len(result) != 2 {
		t.Errorf("expected 2 projects in output, got %d", len(result))
	}
	raw := string(data)
	if !strings.Contains(raw, "kubernetes") {
		t.Error("output JSON does not contain 'kubernetes'")
	}
}

func TestWriteProjects_SortsByLatestMilestone(t *testing.T) {
	tmp := chdirTemp(t)

	projects := []models.SafeProject{
		{Name: "Older", Slug: "older", Maturity: "graduated", GraduatedDate: "2016-01-01"},
		{Name: "Newer", Slug: "newer", Maturity: "graduated", GraduatedDate: "2023-06-15"},
	}

	if err := WriteProjects(projects, nil); err != nil {
		t.Fatalf("WriteProjects: %v", err)
	}

	data, err := os.ReadFile(filepath.Join(tmp, "src", "data", "projects.json"))
	if err != nil {
		t.Fatalf("ReadFile: %v", err)
	}

	var result []models.SafeProject
	if err := json.Unmarshal(data, &result); err != nil {
		t.Fatalf("invalid JSON: %v", err)
	}
	if len(result) < 2 {
		t.Fatalf("expected at least 2 results, got %d", len(result))
	}
	if result[0].Slug != "newer" {
		t.Errorf("first project = %q, want %q (should be sorted newest first)", result[0].Slug, "newer")
	}
}

func TestWriteChangelog_MergesWithExisting(t *testing.T) {
	tmp := chdirTemp(t)

	existing := []models.Event{
		{ID: "old-id", Type: "accepted", ProjectName: "OldProject", ProjectSlug: "oldproject",
			Maturity: "sandbox", Timestamp: "2020-01-01T00:00:00Z", Description: "old"},
	}
	existingData, err := json.Marshal(existing)
	if err != nil {
		t.Fatalf("marshal existing: %v", err)
	}
	existingPath := filepath.Join(tmp, "existing-changelog.json")
	if err := os.WriteFile(existingPath, existingData, 0644); err != nil {
		t.Fatalf("WriteFile existing: %v", err)
	}

	newEvents := []models.Event{
		{ID: "new-id", Type: "accepted", ProjectName: "NewProject", ProjectSlug: "newproject",
			Maturity: "graduated", Timestamp: "2024-01-01T00:00:00Z", Description: "new"},
	}

	if err := WriteChangelog(newEvents, existingPath); err != nil {
		t.Fatalf("WriteChangelog: %v", err)
	}

	data, err := os.ReadFile(filepath.Join(tmp, "src", "data", "changelog.json"))
	if err != nil {
		t.Fatalf("ReadFile changelog: %v", err)
	}

	var result []models.Event
	if err := json.Unmarshal(data, &result); err != nil {
		t.Errorf("output is not valid JSON: %v", err)
	}
	if len(result) != 2 {
		t.Errorf("expected 2 merged events, got %d", len(result))
	}
	// newest first
	if result[0].ProjectSlug != "newproject" {
		t.Errorf("first event slug = %q, want %q (should be newest first)", result[0].ProjectSlug, "newproject")
	}
}
