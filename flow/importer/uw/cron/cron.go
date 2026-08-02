// Package cron reads the importer's crontab so scheduling information has a
// single source of truth shared between the cron daemon that runs the jobs and
// Sentry Cron monitoring, which must know the same schedule to detect missed
// runs.
package cron

import (
	"bufio"
	"fmt"
	"os"
	"strings"
)

// DefaultCrontabPath is where the importer's crontab is installed in the
// container (see Dockerfile). Overridable via CRONTAB_PATH, mainly for tests.
const DefaultCrontabPath = "/etc/cron.d/crontab"

// Path returns the crontab path to read, honouring the CRONTAB_PATH override.
func Path() string {
	if p := os.Getenv("CRONTAB_PATH"); p != "" {
		return p
	}
	return DefaultCrontabPath
}

// ScheduleForAction parses the crontab and returns the cron schedule (the five
// leading time fields) of the entry that runs the given importer action, e.g.
// "hourly" -> "20 6 * * *". An entry matches when its command invokes the uw
// binary with action as the next argument (e.g. "/app/uw hourly").
func ScheduleForAction(action string) (string, error) {
	path := Path()
	file, err := os.Open(path)
	if err != nil {
		return "", fmt.Errorf("opening crontab %s: %w", path, err)
	}
	defer file.Close()

	scanner := bufio.NewScanner(file)
	for scanner.Scan() {
		fields := strings.Fields(scanner.Text())
		// Need 5 schedule fields, the binary, and the action argument; skip
		// blank lines and comments.
		if len(fields) < 7 || strings.HasPrefix(fields[0], "#") {
			continue
		}
		command := fields[5:]
		for i, tok := range command {
			isUwBinary := tok == "uw" || strings.HasSuffix(tok, "/uw")
			if isUwBinary && i+1 < len(command) && command[i+1] == action {
				return strings.Join(fields[:5], " "), nil
			}
		}
	}
	if err := scanner.Err(); err != nil {
		return "", fmt.Errorf("reading crontab %s: %w", path, err)
	}
	return "", fmt.Errorf("no crontab entry found for action %q", action)
}
