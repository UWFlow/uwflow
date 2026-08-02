package test

import (
	"os"
	"path/filepath"
	"testing"

	"flow/importer/uw/cron"
)

// sampleCrontab mirrors the format of flow/importer/uw/crontab.
const sampleCrontab = `# Redirect stdout and stderr to Docker stdout/stderr respectively
# Times are in UTC

# Fetch important updates once daily at 06:20 UTC
20 6 * * * /app/uw hourly >/proc/1/fd/1 2>/proc/1/fd/2
# Vacuum daily at 00:30 EST = 05:30 UTC
30 05 * * * /app/uw vacuum >/proc/1/fd/1 2>/proc/1/fd/2
`

func writeCrontab(t *testing.T, content string) {
	t.Helper()
	path := filepath.Join(t.TempDir(), "crontab")
	if err := os.WriteFile(path, []byte(content), 0o644); err != nil {
		t.Fatalf("writing temp crontab: %v", err)
	}
	t.Setenv("CRONTAB_PATH", path)
}

func TestScheduleForAction(t *testing.T) {
	writeCrontab(t, sampleCrontab)

	cases := map[string]string{
		"hourly": "20 6 * * *",
		"vacuum": "30 05 * * *",
	}
	for action, want := range cases {
		got, err := cron.ScheduleForAction(action)
		if err != nil {
			t.Errorf("ScheduleForAction(%q) returned error: %v", action, err)
			continue
		}
		if got != want {
			t.Errorf("ScheduleForAction(%q) = %q, want %q", action, got, want)
		}
	}
}

func TestScheduleForActionNotFound(t *testing.T) {
	writeCrontab(t, sampleCrontab)

	if _, err := cron.ScheduleForAction("courses"); err == nil {
		t.Error("ScheduleForAction(\"courses\") expected error for unscheduled action, got nil")
	}
}

func TestScheduleForActionMissingFile(t *testing.T) {
	t.Setenv("CRONTAB_PATH", filepath.Join(t.TempDir(), "does-not-exist"))

	if _, err := cron.ScheduleForAction("hourly"); err == nil {
		t.Error("ScheduleForAction with missing crontab expected error, got nil")
	}
}
