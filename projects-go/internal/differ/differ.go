package differ

import (
	"encoding/json"
	"fmt"
	"time"

	"github.com/castrojo/projects-website/projects-go/internal/models"
	"github.com/google/uuid"
)

type DiffableFields struct {
	Name           string
	Maturity       string
	Category       string
	Subcategory    string
	HomepageURL    string
	RepoURL        string
	AcceptedDate   string
	IncubatingDate string
	GraduatedDate  string
	ArchivedDate   string
}

func toDiffable(p models.SafeProject) DiffableFields {
	return DiffableFields{
		Name:           p.Name,
		Maturity:       p.Maturity,
		Category:       p.Category,
		Subcategory:    p.Subcategory,
		HomepageURL:    p.HomepageURL,
		RepoURL:        p.RepoURL,
		AcceptedDate:   p.AcceptedDate,
		IncubatingDate: p.IncubatingDate,
		GraduatedDate:  p.GraduatedDate,
		ArchivedDate:   p.ArchivedDate,
	}
}

func Diff(previousJSON []byte, current []models.SafeProject) ([]models.Event, map[string]string) {
	var previous []models.SafeProject
	if len(previousJSON) > 0 {
		_ = json.Unmarshal(previousJSON, &previous)
	}

	prevBySlug := make(map[string]models.SafeProject)
	for _, p := range previous {
		prevBySlug[p.Slug] = p
	}

	currBySlug := make(map[string]models.SafeProject)
	for _, p := range current {
		currBySlug[p.Slug] = p
	}

	now := time.Now().UTC().Format(time.RFC3339)
	var events []models.Event
	updatedAt := make(map[string]string)

	for slug, curr := range currBySlug {
		prev, existed := prevBySlug[slug]
		if !existed {
			events = append(events, models.Event{
				ID:          uuid.New().String(),
				Type:        "accepted",
				ProjectName: curr.Name,
				ProjectSlug: slug,
				LogoURL:     curr.LogoURL,
				Maturity:    curr.Maturity,
				Timestamp:   now,
				Description: fmt.Sprintf("%s joined the CNCF as a %s project", curr.Name, curr.Maturity),
			})
			updatedAt[slug] = now
			continue
		}

		currD := toDiffable(curr)
		prevD := toDiffable(prev)

		if currD.Maturity != prevD.Maturity {
			eventType := "promoted"
			if curr.Maturity == "archived" {
				eventType = "archived"
			}
			events = append(events, models.Event{
				ID:          uuid.New().String(),
				Type:        eventType,
				ProjectName: curr.Name,
				ProjectSlug: slug,
				LogoURL:     curr.LogoURL,
				Maturity:    curr.Maturity,
				OldMaturity: prev.Maturity,
				Timestamp:   now,
				Description: fmt.Sprintf("%s moved from %s to %s", curr.Name, prev.Maturity, curr.Maturity),
			})
			updatedAt[slug] = now
		} else if currD != prevD {
			events = append(events, models.Event{
				ID:          uuid.New().String(),
				Type:        "updated",
				ProjectName: curr.Name,
				ProjectSlug: slug,
				LogoURL:     curr.LogoURL,
				Maturity:    curr.Maturity,
				Timestamp:   now,
				Description: fmt.Sprintf("%s metadata was updated", curr.Name),
			})
			updatedAt[slug] = now
		} else {
			updatedAt[slug] = prev.UpdatedAt
		}
	}

	for slug, prev := range prevBySlug {
		if _, exists := currBySlug[slug]; !exists {
			events = append(events, models.Event{
				ID:          uuid.New().String(),
				Type:        "removed",
				ProjectName: prev.Name,
				ProjectSlug: slug,
				LogoURL:     prev.LogoURL,
				Maturity:    prev.Maturity,
				Timestamp:   now,
				Description: fmt.Sprintf("%s was removed from the CNCF landscape", prev.Name),
			})
		}
	}

	return events, updatedAt
}
