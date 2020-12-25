package api

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"time"

	"flow/common/env"
)

const apiTimeout = time.Second * 10

const baseUrl = "https://openapi.data.uwaterloo.ca/v3"

type Client struct {
	ctx    context.Context
	client *http.Client
	key    string
}

func NewClient(ctx context.Context) (*Client, error) {
	var secrets struct {
		Key string `from:"UW_API_KEY"`
	}

	if err := env.Get(&secrets); err != nil {
		return nil, err
	}

	c := &Client{
		ctx: ctx,
		client: &http.Client{
			Timeout: apiTimeout,
		},
		key: secrets.Key,
	}
	return c, nil
}

func (api *Client) do(req *http.Request) (*http.Response, error) {
	res, err := api.client.Do(req)
	if err != nil {
		return nil, fmt.Errorf("performing request: %w", err)
	}
	if res.StatusCode >= 400 {
		return res, fmt.Errorf("bad status in response: %v", res.Status)
	}
	return res, nil
}

func (api *Client) get(endpoint string, dst interface{}) error {
	url := fmt.Sprintf("%s/%s", baseUrl, endpoint)
	log.Printf("GET %s", url)

	// We do not need to add .WithTimeout here: client.Timeout is respected
	req, err := http.NewRequestWithContext(api.ctx, "GET", url, nil)
	if err != nil {
		return fmt.Errorf("setting up request: %w", err)
	}

	req.Header.Add("X-Api-Key", api.key)
	res, err := api.do(req)
	if err != nil {
		return err
	}
	defer res.Body.Close()

	err = json.NewDecoder(res.Body).Decode(dst)
	if err != nil {
		return fmt.Errorf("parsing json: %w", err)
	}
	return nil
}
