// uwapiv3 imports course and schedule data from Waterloo OpenData API v3.
// This API is documented at https://openapi.data.uwaterloo.ca/api-docs.
package main

import (
	"context"
	"fmt"
	"os"
	"strings"

	"flow/importer/uwapiv3/api"
	"flow/importer/uwapiv3/parts/terms"

	"github.com/jackc/pgx/v4/pgxpool"
)

func act(ctx context.Context, client *api.Client, db *pgxpool.Pool, action string, targets []string) error {
	t := terms.NewImporter(ctx, client, db)
	return t.Import()
}

func main() {
	if len(os.Args) != 3 {
		fmt.Fprintf(os.Stderr, "Usage: uwapiv3 (import|vacuum) TARGET[,TARGET...]")
		os.Exit(1)
	}

	ctx := context.Background()

	db, err := connect(ctx)
	if err != nil {
		panic(err)
	}
	defer db.Close()

	client, err := api.NewClient(ctx)
	if err != nil {
		panic(err)
	}

	action := os.Args[1]
	targets := strings.Split(os.Args[2], ",")
	if err := act(ctx, client, db, action, targets); err != nil {
		panic(err)
	}
}
