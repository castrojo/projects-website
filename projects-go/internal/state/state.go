package state

import (
	"encoding/json"
	"os"
	"path/filepath"
)

type State struct {
	ETag string `json:"etag"`
}

const cacheDir = "../.sync-cache"

func LoadState() State {
	data, err := os.ReadFile(filepath.Join(cacheDir, "state.json"))
	if err != nil {
		return State{}
	}
	var s State
	_ = json.Unmarshal(data, &s)
	return s
}

func SaveState(s State) error {
	if err := os.MkdirAll(cacheDir, 0755); err != nil {
		return err
	}
	data, err := json.MarshalIndent(s, "", "  ")
	if err != nil {
		return err
	}
	return os.WriteFile(filepath.Join(cacheDir, "state.json"), data, 0644)
}

func LoadPreviousProjects() ([]byte, error) {
	return os.ReadFile(filepath.Join(cacheDir, "previous_projects.json"))
}

func SavePreviousProjects(data []byte) error {
	if err := os.MkdirAll(cacheDir, 0755); err != nil {
		return err
	}
	return os.WriteFile(filepath.Join(cacheDir, "previous_projects.json"), data, 0644)
}
