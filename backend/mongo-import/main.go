package main

import (
	"fmt"
	"log"
	"os"

	"github.com/AyushK1/uwflow2.0/backend/mongo-import/parts"
	"github.com/jackc/pgx"
)

type ImportFunction func(*pgx.Conn, string, *parts.IdentifierMap) error

func Connect() (*pgx.Conn, error) {
	config := pgx.ConnConfig{
		Database: os.Getenv("POSTGRES_DB"),
		Password: os.Getenv("POSTGRES_PASSWORD"),
		User:     os.Getenv("POSTGRES_USER"),
	}
	return pgx.Connect(config)
}

func Run(rootPath string) {
	conn, err := Connect()
	defer conn.Close()
	if err != nil {
		log.Fatal("Failed to open database connection: %v", err)
	}

	idMap := &parts.IdentifierMap{}
	operations := []ImportFunction{
		parts.ImportCourses,
		parts.ImportCourseRequisites,
		parts.ImportProfs,
		parts.ImportSections,
		parts.ImportUsers,
		parts.ImportReviews,
	}
	for _, operation := range operations {
		err = operation(conn, rootPath, idMap)
		if err != nil {
			log.Fatalf("Import failed: %v", err)
		}
	}
}

func main() {
	args := os.Args
	if len(args) == 2 {
		Run(args[1])
	} else {
		fmt.Println("Usage: main.go MONGO_DUMP_PATH")
	}
}
