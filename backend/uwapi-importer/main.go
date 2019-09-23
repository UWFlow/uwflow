package main

import (
	"context"
	"log"

	"github.com/AyushK1/uwflow2.0/backend/uwapi-importer/client"
	"github.com/AyushK1/uwflow2.0/backend/uwapi-importer/parts"
)

func main() {
	// TODO: set sane time limit?
	ctx := context.Background()
	apiClient, err := client.New(ctx)
	if err != nil {
		log.Fatalf("API client creation failed: %v\n", err)
	}
	err = parts.ImportantDates(apiClient)
	if err != nil {
		log.Fatalf("UW API import failed: %v\n", err)
	}
}
