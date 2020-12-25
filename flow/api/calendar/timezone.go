package calendar

import (
	"log"
	"time"
)

var UniversityLocation *time.Location

func init() {
	var err error
	// Toronto is the canonical location for the zone containing UW
	UniversityLocation, err = time.LoadLocation("America/Toronto")
	if err != nil {
		log.Fatalf("Error: %s", err)
	}
}
