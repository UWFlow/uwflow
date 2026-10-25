package auth

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"time"
)

var oauthClient = &http.Client{Timeout: 5 * time.Second}

func fetchOAuthUser(ctx context.Context, endpoint, token string, result interface{}) error {
	req, err := http.NewRequestWithContext(ctx, http.MethodGet, endpoint, nil)
	if err != nil {
		return fmt.Errorf("creating provider request: %w", err)
	}
	req.Header.Set("Authorization", "Bearer "+token)
	response, err := oauthClient.Do(req)
	if err != nil {
		return fmt.Errorf("calling identity provider: %w", err)
	}
	defer response.Body.Close()
	if response.StatusCode < 200 || response.StatusCode >= 300 {
		return fmt.Errorf("identity provider returned HTTP %d", response.StatusCode)
	}
	if err := json.NewDecoder(io.LimitReader(response.Body, 1<<20)).Decode(result); err != nil {
		return fmt.Errorf("decoding identity provider response: %w", err)
	}
	return nil
}
