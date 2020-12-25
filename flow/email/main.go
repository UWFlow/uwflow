// email is a mail sending service.
// It connects to a Postgres database, listens for 'queue' notifications,
// generates HTML documents from unseen items from tables in the 'queue' schema,
// and sends them as SMTP messages via the Google SMTP service.
package main

import (
	"context"
	"log"
)

func main() {
	ctx := context.Background()

	pool, err := connect(ctx)
	if err != nil {
		log.Fatal(err)
	}
	defer pool.Close()

	if err := listen(ctx, pool); err != nil {
		log.Print(err)
	}
}
