package client

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"os"
	"time"

	"github.com/jackc/pgx/v4"
)

const ApiTimeout = time.Second * 10
const ConnectTimeout = time.Second * 5
const BaseUrl = "https://openapi.data.uwaterloo.ca/v3"

type ApiClient struct {
	Context context.Context
	Conn    *pgx.Conn
	client  *http.Client
	key     string
}

func mustGetenv(key string) string {
	val, found := os.LookupEnv(key)
	if !found {
		panic(fmt.Errorf("Environment variable not set: %s", key))
	}
	return val
}

func connectPostgres(ctx context.Context) (*pgx.Conn, error) {
	database := mustGetenv("POSTGRES_DB")
	host := mustGetenv("POSTGRES_HOST")
	password := mustGetenv("POSTGRES_PASSWORD")
	port := mustGetenv("POSTGRES_PORT")
	user := mustGetenv("POSTGRES_USER")

	uri := fmt.Sprintf(
		"postgres://%s:%s@%s:%s/%s?sslmode=disable",
		user, password, host, port, database,
	)
	connectCtx, cancel := context.WithTimeout(ctx, ConnectTimeout)
	defer cancel()
	return pgx.Connect(connectCtx, uri)
}

func New(ctx context.Context) (*ApiClient, error) {
	conn, err := connectPostgres(ctx)
	if err != nil {
		return nil, err
	}

	return &ApiClient{
		Conn:    conn,
		Context: ctx,
		client: &http.Client{
			Timeout: ApiTimeout,
		},
		key: mustGetenv("UW_API_KEY"),
	}, nil
}

func (api *ApiClient) Get(endpoint string) (*http.Response, error) {
	url := fmt.Sprintf("%s/%s", BaseUrl, endpoint)
	// We do not need to add .WithTimeout here: client.Timeout is respected
	req, err := http.NewRequestWithContext(api.Context, "GET", url, nil)
	if err != nil {
		return nil, err
	}

	req.Header.Add("X-Api-Key", api.key)
	log.Printf("GET %s\n", url)
	return api.client.Do(req)
}
