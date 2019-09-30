package main

import (
	"context"
	"log"
	"os"

	"github.com/AyushK1/uwflow2.0/backend/uwapi-importer/parts/course"
	"github.com/AyushK1/uwflow2.0/backend/uwapi-importer/parts/exam"
	"github.com/AyushK1/uwflow2.0/backend/uwapi-importer/parts/section"
	"github.com/AyushK1/uwflow2.0/backend/uwapi-importer/parts/term"
	"github.com/AyushK1/uwflow2.0/backend/uwapi-importer/state"
)

type ImportFunc func(*state.State) error

func Run(importer ImportFunc) {
	// TODO: set sane time limit?
	ctx := context.Background()
	state, err := state.New(ctx)
	if err != nil {
		log.Fatalf("Initialization failed: %v\n", err)
	}
	err = importer(state)
	if err != nil {
		log.Fatalf("API import failed: %v\n", err)
	}
}

func main() {
	if len(os.Args) != 2 {
		log.Fatalf("Usage: %s ACTION", os.Args[0])
	}

	switch os.Args[1] {
	case "courses":
		Run(course.ImportAll)
	case "exams":
		Run(exam.ImportAll)
	case "sections":
		Run(section.ImportAll)
	case "terms":
		Run(term.ImportAll)
	default:
		log.Fatalf("Not an action: %s", os.Args[1])
	}
}
