package fetcher

import (
	"testing"

	"github.com/castrojo/projects-website/projects-go/internal/models"
)

func TestFilterAndConvert_OnlyCNCFProjects(t *testing.T) {
	dataset := models.FullDataset{
		Items: []models.FullItem{
			{Name: "Kubernetes", Maturity: "graduated"},
			{Name: "NotACNCFProject", Maturity: ""},
			{Name: "Prometheus", Maturity: "graduated"},
			{Name: "AlsoNotCNCF"},
		},
		GitHubData: map[string]models.GitHubItem{},
	}
	got := filterAndConvert(dataset)
	if len(got) != 2 {
		t.Errorf("expected 2 CNCF projects (non-empty maturity), got %d", len(got))
	}
}

func TestToSafeProject_BasicFields(t *testing.T) {
	item := models.FullItem{
		Name:     "TestProject",
		Maturity: "sandbox",
	}
	p := toSafeProject(item, nil)
	if p.Name != "TestProject" {
		t.Errorf("expected name TestProject, got %s", p.Name)
	}
	if p.Maturity != "sandbox" {
		t.Errorf("expected maturity sandbox, got %s", p.Maturity)
	}
	if p.Slug == "" {
		t.Error("expected non-empty slug")
	}
}

func TestToSafeProject_RepoURL(t *testing.T) {
	item := models.FullItem{
		Name:     "WithRepo",
		Maturity: "incubating",
		Repositories: []models.Repository{
			{URL: "https://github.com/example/project"},
		},
	}
	p := toSafeProject(item, nil)
	if p.RepoURL != "https://github.com/example/project" {
		t.Errorf("expected repo URL, got %q", p.RepoURL)
	}
}

func TestToSafeProject_Summary(t *testing.T) {
	item := models.FullItem{
		Name:     "WithSummary",
		Maturity: "graduated",
		Summary:  &models.ProjectSummary{UseCase: "orchestrates containers"},
	}
	p := toSafeProject(item, nil)
	if p.Summary != "orchestrates containers" {
		t.Errorf("expected summary, got %q", p.Summary)
	}
}
