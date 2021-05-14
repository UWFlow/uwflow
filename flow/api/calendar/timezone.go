package calendar

import (
	"log"
	"time"
)

var UniversityLocation *time.Location

func init() {
	var err error
	UniversityLocation, err = time.LoadLocation("Canada/Eastern")
	if err != nil {
		log.Fatalf("Error: %s", err)
	}
}
