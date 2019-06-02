package db

import (
	"fmt"
	"os"

	"github.com/jmoiron/sqlx"
	_ "github.com/lib/pq"
)

var Handle *sqlx.DB

func Connect() {
	name := os.Getenv("POSTGRES_DB")
	host := os.Getenv("POSTGRES_HOST")
	pass := os.Getenv("POSTGRES_PASSWORD")
	port := os.Getenv("POSTGRES_PORT")
	user := os.Getenv("POSTGRES_USER")
	url := fmt.Sprintf("postgres://%s:%s@%s:%s/%s?sslmode=disable", user, pass, host, port, name)
	Handle = sqlx.MustConnect("postgres", url)
}
