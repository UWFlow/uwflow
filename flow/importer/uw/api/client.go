package api

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"strconv"
	"time"

	"flow/common/env"
)

const ApiTimeout = time.Second * 10

const (
	BaseUrlv3 = "https://openapi.data.uwaterloo.ca/v3"
)

// Retry configuration for 429 responses.
const (
	maxRetries     = 5
	retryBaseDelay = time.Second
	retryMaxDelay  = 60 * time.Second
)

type Client struct {
	ctx    context.Context
	client *http.Client
	keyv3  string
}

func NewClient(ctx context.Context, env *env.Environment) *Client {
	return &Client{
		ctx: ctx,
		client: &http.Client{
			Timeout: ApiTimeout,
		},
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

// retryDelay returns the duration to wait before the next retry attempt.
// It honours the Retry-After response header when present, otherwise uses
// exponential backoff (base * 2^attempt) with up to 20% random jitter to
// spread retries if multiple calls hit the limit simultaneously.
func retryDelay(res *http.Response) time.Duration {
	if res != nil {
		if val := res.Header.Get("Retry-After"); val != "" {
			if secs, err := strconv.Atoi(val); err == nil && secs > 0 {
				return time.Duration(secs) * time.Second
			}
		}
	}
	// Wait long enough for the 60-second rate limit window to reset.
	return retryMaxDelay + time.Second
}

// Issue a GET to a given UWAPIv3 endpoint and decode the response into dst
func (api *Client) Getv3(endpoint string, dst any) error {
	url := fmt.Sprintf("%s/%s", BaseUrlv3, endpoint)
	log.Printf("GET [v3] %s", url)

	for attempt := 0; attempt <= maxRetries; attempt++ {
		// We do not need to add .WithTimeout here: client.Timeout is respected
		req, err := http.NewRequestWithContext(api.ctx, "GET", url, nil)
		if err != nil {
			return fmt.Errorf("failed to set up request: %w", err)
		}

		req.Header.Add("X-Api-Key", api.keyv3)
		res, err := api.do(req)

		// Non-429 errors (including other 4xx/5xx) fail immediately.
		if err != nil && (res == nil || res.StatusCode != http.StatusTooManyRequests) {
			if res != nil && res.Body != nil {
				res.Body.Close()
			}
			return fmt.Errorf("http request failed: %w", err)
		}

		if err == nil {
			// Success — decode and return.
			decErr := json.NewDecoder(res.Body).Decode(dst)
			res.Body.Close()
			if decErr != nil {
				return fmt.Errorf("failed to parse JSON: %w", decErr)
			}
			return nil
		}

		// HTTP 429: rate limited.
		if attempt == maxRetries {
			return fmt.Errorf("http request failed after %d retries: %w", maxRetries, err)
		}

		wait := retryDelay(res)
		log.Printf("WARNING: rate limited by UW API (429), retrying in %v (attempt %d/%d): %s",
			wait.Round(time.Millisecond), attempt+1, maxRetries, url)

		if res != nil && res.Body != nil {
			res.Body.Close()
		}

		select {
		case <-api.ctx.Done():
			return fmt.Errorf("context cancelled while waiting to retry: %w", api.ctx.Err())
		case <-time.After(wait):
		}
	}

	return fmt.Errorf("http request failed: exceeded max retries")
}
