package client

import (
	"fmt"
	"log"
	"net/http"
	"os"
	"strconv"
	"time"

	"github.com/jackc/pgx"
)

const ApiTimeout = time.Second * 10
const BaseUrl = "https://openapi.data.uwaterloo.ca/v3"

type ApiClient struct {
	Conn   *pgx.Conn
	client *http.Client
	key    string
}

func mustGetenv(key string) string {
	val, found := os.LookupEnv(key)
	if !found {
		panic(fmt.Errorf("Environment variable not set: %s", key))
	}
	return val
}

func connectPostgres() (*pgx.Conn, error) {
	port := mustGetenv("POSTGRES_PORT")
	portNumber, err := strconv.Atoi(port)
	if err != nil {
		return nil, fmt.Errorf("invalid port: %v", err)
	}
	config := pgx.ConnConfig{
		Database: mustGetenv("POSTGRES_DB"),
		Host:     mustGetenv("POSTGRES_HOST"),
		Password: mustGetenv("POSTGRES_PASSWORD"),
		Port:     uint16(portNumber),
		User:     mustGetenv("POSTGRES_USER"),
	}
	return pgx.Connect(config)
}

func New() (*ApiClient, error) {
	conn, err := connectPostgres()
	if err != nil {
		return nil, err
	}

	return &ApiClient{
		Conn: conn,
		client: &http.Client{
			Timeout: ApiTimeout,
		},
		key: mustGetenv("UW_API_KEY"),
	}, nil
}

func (api *ApiClient) Get(endpoint string) (*http.Response, error) {
	url := fmt.Sprintf("%s/%s", BaseUrl, endpoint)
	req, err := http.NewRequest("GET", url, nil)
	if err != nil {
		return nil, err
	}

	req.Header.Add("X-Api-Key", api.key)
	log.Printf("GET %s\n", url)
	return api.client.Do(req)
}
