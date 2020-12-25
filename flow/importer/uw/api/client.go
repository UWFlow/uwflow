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

const ApiTimeout = time.Second * 10

const (
	BaseUrlv2 = "https://api.uwaterloo.ca/v2"
	BaseUrlv3 = "https://openapi.data.uwaterloo.ca/v3"
)

type Client struct {
	ctx    context.Context
	client *http.Client
	keyv2  string
	keyv3  string
}

func NewClient(ctx context.Context, env *env.Environment) *Client {
	return &Client{
		ctx: ctx,
		client: &http.Client{
			Timeout: ApiTimeout,
		},
		keyv2: env.UWApiKeyv2,
		keyv3: env.UWApiKeyv3,
	}
}

func (api *Client) do(req *http.Request) (*http.Response, error) {
	res, err := api.client.Do(req)
	if err != nil {
		return nil, fmt.Errorf("failed to send data: %w", err)
	}
	if res.StatusCode >= 400 {
		return res, fmt.Errorf("server responded with bad status: %v", res.Status)
	}
	return res, nil
}

type Apiv2Response struct {
	Data interface{} `json:"data"`
}

// Issue a GET to a given UWAPIv2 endpoint and decode the response into dst
func (api *Client) Getv2(endpoint string, dst interface{}) error {
	// Avoid logging API key by templating twice
	clearUrl := fmt.Sprintf("%s/%s.json", BaseUrlv2, endpoint)
	log.Printf("GET [v2] %s", clearUrl)

	// ?dump=true is necessary for very large (>6MB) results
	url := fmt.Sprintf("%s?dump=true&key=%s", clearUrl, api.keyv2)
	// We do not need to add .WithTimeout here: client.Timeout is respected
	req, err := http.NewRequestWithContext(api.ctx, "GET", url, nil)
	if err != nil {
		return fmt.Errorf("failed to set up request: %w", err)
	}

	res, err := api.do(req)
	if err != nil {
		return fmt.Errorf("http request failed: %w", err)
	}
	defer res.Body.Close()

	container := Apiv2Response{Data: dst}
	err = json.NewDecoder(res.Body).Decode(&container)
	if err != nil {
		return fmt.Errorf("failed to parse JSON: %w", err)
	}
	return nil
}

// Issue a GET to a given UWAPIv3 endpoint and decode the response into dst
func (api *Client) Getv3(endpoint string, dst interface{}) error {
	url := fmt.Sprintf("%s/%s", BaseUrlv3, endpoint)
	log.Printf("GET [v3] %s", url)

	// We do not need to add .WithTimeout here: client.Timeout is respected
	req, err := http.NewRequestWithContext(api.ctx, "GET", url, nil)
	if err != nil {
		return fmt.Errorf("failed to set up request: %w", err)
	}

	req.Header.Add("X-Api-Key", api.keyv3)
	res, err := api.do(req)
	if err != nil {
		return fmt.Errorf("http request failed: %w", err)
	}
	defer res.Body.Close()

	err = json.NewDecoder(res.Body).Decode(dst)
	if err != nil {
		return fmt.Errorf("failed to parse JSON: %w", err)
	}
	return nil
}
