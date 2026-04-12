package api

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"log"
	"net/http"
	"strconv"
	"sync"
	"time"

	"flow/common/env"
)

const ApiTimeout = time.Second * 10
const ApiMinInterval = 300 * time.Millisecond
const ApiMaxInterval = 10 * time.Second
const ApiSuccessStep = 50 * time.Millisecond
const ApiMaxAttempts = 8
const ApiRetryDelay = 2 * time.Second

const (
	BaseUrlv3 = "https://openapi.data.uwaterloo.ca/v3"
)

type Client struct {
	ctx             context.Context
	client          *http.Client
	keyv3           string
	mu              sync.Mutex
	nextAt          time.Time
	currentInterval time.Duration
}

type HTTPStatusError struct {
	StatusCode int
	Status     string
}

func (err *HTTPStatusError) Error() string {
	return fmt.Sprintf("server responded with bad status: %s", err.Status)
}

func NewClient(ctx context.Context, env *env.Environment) *Client {
	return &Client{
		ctx: ctx,
		client: &http.Client{
			Timeout: ApiTimeout,
		},
		keyv3:           env.UWApiKeyv3,
		currentInterval: ApiMinInterval,
	}
}

func (api *Client) waitForTurn() error {
	api.mu.Lock()
	now := time.Now()
	wait := time.Duration(0)
	if now.Before(api.nextAt) {
		wait = api.nextAt.Sub(now)
		now = api.nextAt
	}
	api.nextAt = now.Add(api.currentInterval)
	api.mu.Unlock()

	return sleepContext(api.ctx, wait)
}

func sleepContext(ctx context.Context, wait time.Duration) error {
	if wait <= 0 {
		return nil
	}

	timer := time.NewTimer(wait)
	defer timer.Stop()

	select {
	case <-ctx.Done():
		return ctx.Err()
	case <-timer.C:
		return nil
	}
}

func shouldRetry(status int) bool {
	return status == http.StatusTooManyRequests || status >= http.StatusInternalServerError
}

func retryDelay(header string, attempt int) time.Duration {
	if seconds, err := strconv.Atoi(header); err == nil && seconds > 0 {
		return time.Duration(seconds) * time.Second
	}

	if retryAt, err := http.ParseTime(header); err == nil {
		if wait := time.Until(retryAt); wait > 0 {
			return wait
		}
	}

	return time.Duration(attempt) * ApiRetryDelay
}

func (api *Client) noteSuccess() {
	api.mu.Lock()
	defer api.mu.Unlock()

	if api.currentInterval <= ApiMinInterval {
		api.currentInterval = ApiMinInterval
		return
	}

	api.currentInterval -= ApiSuccessStep
	if api.currentInterval < ApiMinInterval {
		api.currentInterval = ApiMinInterval
	}
}

func (api *Client) noteBackpressure(wait time.Duration) {
	api.mu.Lock()
	defer api.mu.Unlock()

	nextInterval := api.currentInterval * 2
	if nextInterval < wait {
		nextInterval = wait
	}
	if nextInterval < ApiMinInterval {
		nextInterval = ApiMinInterval
	}
	if nextInterval > ApiMaxInterval {
		nextInterval = ApiMaxInterval
	}
	api.currentInterval = nextInterval
	api.nextAt = time.Now().Add(wait)
}

func (api *Client) do(req *http.Request) (*http.Response, error) {
	var lastErr error

	for attempt := 1; attempt <= ApiMaxAttempts; attempt++ {
		if err := api.waitForTurn(); err != nil {
			return nil, fmt.Errorf("request pacing interrupted: %w", err)
		}

		res, err := api.client.Do(req.Clone(api.ctx))
		if err != nil {
			lastErr = fmt.Errorf("failed to send data: %w", err)
			if attempt == ApiMaxAttempts {
				return nil, lastErr
			}

			wait := retryDelay("", attempt)
			log.Printf("UW API request failed on attempt %d/%d, retrying in %s: %v", attempt, ApiMaxAttempts, wait, err)
			if sleepErr := sleepContext(api.ctx, wait); sleepErr != nil {
				return nil, fmt.Errorf("retry interrupted: %w", sleepErr)
			}
			continue
		}

		if res.StatusCode < 400 {
			api.noteSuccess()
			return res, nil
		}

		lastErr = &HTTPStatusError{
			StatusCode: res.StatusCode,
			Status:     res.Status,
		}
		if !shouldRetry(res.StatusCode) || attempt == ApiMaxAttempts {
			res.Body.Close()
			return res, lastErr
		}

		wait := retryDelay(res.Header.Get("Retry-After"), attempt)
		api.noteBackpressure(wait)
		log.Printf("UW API returned %s on attempt %d/%d, retrying in %s", res.Status, attempt, ApiMaxAttempts, wait)
		res.Body.Close()
		if sleepErr := sleepContext(api.ctx, wait); sleepErr != nil {
			return nil, fmt.Errorf("retry interrupted: %w", sleepErr)
		}
	}

	return nil, lastErr
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

func IsNotFound(err error) bool {
	var statusErr *HTTPStatusError
	return errors.As(err, &statusErr) && statusErr.StatusCode == http.StatusNotFound
}
