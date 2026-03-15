package env

import (
	"log"

	"flow/common/env"
)

var Global env.Environment

func Init() {
	if err := env.Get(&Global); err != nil {
		log.Fatalf("Error: %s", err)
	}
}
