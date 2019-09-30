package api

import (
	"context"
	"fmt"
	"net/http"
	"time"

	"github.com/AyushK1/uwflow2.0/backend/uwapi-importer/env"
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
		return nil, err
	}
	if res.StatusCode >= 400 {
		return res, fmt.Errorf("bad status: %v", res.Status)
	}
	return res, nil
}

func (api *Api) Getv2(endpoint string) (*http.Response, error) {
	clearUrl := fmt.Sprintf("%s/%s.json", BaseUrlv2, endpoint)
	api.logger.Info("v2 GET", zap.String("url", clearUrl))

	// ?dump=true is necessary for very large (>6MB) results
	url := fmt.Sprintf("%s?dump=true&key=%s", clearUrl, api.keyv2)
	req, err := http.NewRequestWithContext(api.ctx, "GET", url, nil)
	if err != nil {
		return nil, err
	}
	return api.do(req)
}

func (api *Api) Getv3(endpoint string) (*http.Response, error) {
	url := fmt.Sprintf("%s/%s", BaseUrlv3, endpoint)
	api.logger.Info("v3 GET", zap.String("url", url))
	// We do not need to add .WithTimeout here: client.Timeout is respected
	req, err := http.NewRequestWithContext(api.ctx, "GET", url, nil)
	if err != nil {
		return nil, err
	}
	req.Header.Add("X-Api-Key", api.keyv3)
	return api.do(req)
}
