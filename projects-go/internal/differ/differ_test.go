package differ

import (
	"encoding/json"
	"testing"

	"github.com/castrojo/projects-website/projects-go/internal/models"
)

func marshalProjects(t *testing.T, projects []models.SafeProject) []byte {
	t.Helper()
	b, err := json.Marshal(projects)
	if err != nil {
		t.Fatalf("marshal projects: %v", err)
	}
	return b
}

func TestDiff_NoChanges(t *testing.T) {
	cases := []struct {
		name     string
		projects []models.SafeProject
	}{
		{
			name:     "empty state",
			projects: []models.SafeProject{},
		},
		{
			name: "single project unchanged",
			projects: []models.SafeProject{
				{Name: "Kubernetes", Slug: "kubernetes", Maturity: "graduated", AcceptedDate: "2016-03-10"},
			},
		},
		{
			name: "multiple projects unchanged",
			projects: []models.SafeProject{
				{Name: "Prometheus", Slug: "prometheus", Maturity: "graduated"},
				{Name: "Argo", Slug: "argo", Maturity: "graduated"},
			},
		},
	}

	for _, tc := range cases {
		t.Run(tc.name, func(t *testing.T) {
			prev := marshalProjects(t, tc.projects)
			events, _ := Diff(prev, tc.projects)
			if len(events) != 0 {
				t.Errorf("expected 0 events, got %d: %+v", len(events), events)
			}
		})
	}
}

func TestDiff_ProjectAdded(t *testing.T) {
	cases := []struct {
		name     string
		curr     models.SafeProject
		wantType string
	}{
		{
			name:     "new graduated project",
			curr:     models.SafeProject{Name: "Kubernetes", Slug: "kubernetes", Maturity: "graduated"},
			wantType: "accepted",
		},
		{
			name:     "new sandbox project",
			curr:     models.SafeProject{Name: "Argo", Slug: "argo", Maturity: "sandbox"},
			wantType: "accepted",
		},
	}

	for _, tc := range cases {
		t.Run(tc.name, func(t *testing.T) {
			events, _ := Diff([]byte("[]"), []models.SafeProject{tc.curr})
			if len(events) != 1 {
				t.Fatalf("expected 1 event, got %d", len(events))
			}
			if events[0].Type != tc.wantType {
				t.Errorf("event type = %q, want %q", events[0].Type, tc.wantType)
			}
			if events[0].ProjectSlug != tc.curr.Slug {
				t.Errorf("slug = %q, want %q", events[0].ProjectSlug, tc.curr.Slug)
			}
			if events[0].ID == "" {
				t.Error("event ID must not be empty")
			}
		})
	}
}

func TestDiff_ProjectRemoved(t *testing.T) {
	cases := []struct {
		name string
		prev models.SafeProject
	}{
		{
			name: "graduated project removed",
			prev: models.SafeProject{Name: "Kubernetes", Slug: "kubernetes", Maturity: "graduated"},
		},
		{
			name: "sandbox project removed",
			prev: models.SafeProject{Name: "Argo", Slug: "argo", Maturity: "sandbox"},
		},
	}

	for _, tc := range cases {
		t.Run(tc.name, func(t *testing.T) {
			prevJSON := marshalProjects(t, []models.SafeProject{tc.prev})
			events, _ := Diff(prevJSON, []models.SafeProject{})
			if len(events) != 1 {
				t.Fatalf("expected 1 event, got %d", len(events))
			}
			if events[0].Type != "removed" {
				t.Errorf("event type = %q, want %q", events[0].Type, "removed")
			}
			if events[0].ProjectSlug != tc.prev.Slug {
				t.Errorf("slug = %q, want %q", events[0].ProjectSlug, tc.prev.Slug)
			}
		})
	}
}

func TestDiff_MaturityChanged(t *testing.T) {
	cases := []struct {
		name        string
		prev        models.SafeProject
		curr        models.SafeProject
		wantType    string
		wantOldMat  string
		wantNewMat  string
	}{
		{
			name:       "sandbox to incubating",
			prev:       models.SafeProject{Name: "Argo", Slug: "argo", Maturity: "sandbox"},
			curr:       models.SafeProject{Name: "Argo", Slug: "argo", Maturity: "incubating"},
			wantType:   "promoted",
			wantOldMat: "sandbox",
			wantNewMat: "incubating",
		},
		{
			name:       "incubating to graduated",
			prev:       models.SafeProject{Name: "Prometheus", Slug: "prometheus", Maturity: "incubating"},
			curr:       models.SafeProject{Name: "Prometheus", Slug: "prometheus", Maturity: "graduated"},
			wantType:   "promoted",
			wantOldMat: "incubating",
			wantNewMat: "graduated",
		},
		{
			name:       "graduated to archived",
			prev:       models.SafeProject{Name: "OldProject", Slug: "oldproject", Maturity: "graduated"},
			curr:       models.SafeProject{Name: "OldProject", Slug: "oldproject", Maturity: "archived"},
			wantType:   "archived",
			wantOldMat: "graduated",
			wantNewMat: "archived",
		},
	}

	for _, tc := range cases {
		t.Run(tc.name, func(t *testing.T) {
			prevJSON := marshalProjects(t, []models.SafeProject{tc.prev})
			events, _ := Diff(prevJSON, []models.SafeProject{tc.curr})
			if len(events) != 1 {
				t.Fatalf("expected 1 event, got %d: %+v", len(events), events)
			}
			e := events[0]
			if e.Type != tc.wantType {
				t.Errorf("type = %q, want %q", e.Type, tc.wantType)
			}
			if e.OldMaturity != tc.wantOldMat {
				t.Errorf("oldMaturity = %q, want %q", e.OldMaturity, tc.wantOldMat)
			}
			if e.Maturity != tc.wantNewMat {
				t.Errorf("maturity = %q, want %q", e.Maturity, tc.wantNewMat)
			}
		})
	}
}
