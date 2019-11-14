package api

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"time"

	"flow/worker/importer/uw/env"
	"go.uber.org/zap"
)

const (
	ApiTimeout = time.Second * 10
	BaseUrlv2  = "https://api.uwaterloo.ca/v2"
	BaseUrlv3  = "https://openapi.data.uwaterloo.ca/v3"
)

type Api struct {
	ctx    context.Context
	client *http.Client
	logger *zap.Logger
	keyv2  string
	keyv3  string
}

func New(ctx context.Context, env *env.Environment, logger *zap.Logger) *Api {
	return &Api{
		ctx: ctx,
		client: &http.Client{
			Timeout: ApiTimeout,
		},
		logger: logger,
		keyv2:  env.UWApiKeyv2,
		keyv3:  env.UWApiKeyv3,
	}
}

func (api *Api) do(req *http.Request) (*http.Response, error) {
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
func (api *Api) Getv2(endpoint string, dst interface{}) error {
	// Avoid logging API key by templating twice
	clearUrl := fmt.Sprintf("%s/%s.json", BaseUrlv2, endpoint)
	api.logger.Info("v2 GET", zap.String("url", clearUrl))

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
func (api *Api) Getv3(endpoint string, dst interface{}) error {
	url := fmt.Sprintf("%s/%s", BaseUrlv3, endpoint)
	api.logger.Info("v3 GET", zap.String("url", url))

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
