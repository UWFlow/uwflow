// Package embed computes text embeddings with the OpenAI embeddings API.
// It is shared by the importer, which embeds course documents, and the API,
// which embeds search queries. Both sides must use the same Model and
// Dimensions for their vectors to be comparable.
package embed

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"math"
	"net/http"
	"time"
)

const (
	Model      = "text-embedding-3-small"
	Dimensions = 512

	endpoint = "https://api.openai.com/v1/embeddings"
)

type Client struct {
	apiKey   string
	endpoint string
	http     *http.Client
}

func NewClient(apiKey string) *Client {
	return &Client{
		apiKey:   apiKey,
		endpoint: endpoint,
		http:     &http.Client{Timeout: 30 * time.Second},
	}
}

type request struct {
	Model      string   `json:"model"`
	Input      []string `json:"input"`
	Dimensions int      `json:"dimensions"`
}

type response struct {
	Data []struct {
		Index     int       `json:"index"`
		Embedding []float32 `json:"embedding"`
	} `json:"data"`
}

// Embed returns one unit-length vector per input, in input order.
func (c *Client) Embed(ctx context.Context, inputs []string) ([][]float32, error) {
	body, err := json.Marshal(request{Model: Model, Input: inputs, Dimensions: Dimensions})
	if err != nil {
		return nil, fmt.Errorf("encoding request: %w", err)
	}

	req, err := http.NewRequestWithContext(ctx, http.MethodPost, c.endpoint, bytes.NewReader(body))
	if err != nil {
		return nil, fmt.Errorf("building request: %w", err)
	}
	req.Header.Set("Authorization", "Bearer "+c.apiKey)
	req.Header.Set("Content-Type", "application/json")

	res, err := c.http.Do(req)
	if err != nil {
		return nil, fmt.Errorf("sending request: %w", err)
	}
	defer res.Body.Close()

	if res.StatusCode != http.StatusOK {
		detail, _ := io.ReadAll(io.LimitReader(res.Body, 1024))
		return nil, fmt.Errorf("embeddings API returned %d: %s", res.StatusCode, detail)
	}

	var decoded response
	if err := json.NewDecoder(res.Body).Decode(&decoded); err != nil {
		return nil, fmt.Errorf("decoding response: %w", err)
	}
	if len(decoded.Data) != len(inputs) {
		return nil, fmt.Errorf("expected %d embeddings, got %d", len(inputs), len(decoded.Data))
	}

	vectors := make([][]float32, len(inputs))
	for _, item := range decoded.Data {
		if item.Index < 0 || item.Index >= len(inputs) {
			return nil, fmt.Errorf("embedding index %d out of range", item.Index)
		}
		vectors[item.Index] = Normalize(item.Embedding)
	}
	return vectors, nil
}

// Normalize scales v to unit length in place so that a dot product between
// normalized vectors is their cosine similarity.
func Normalize(v []float32) []float32 {
	var sum float64
	for _, x := range v {
		sum += float64(x) * float64(x)
	}
	if sum == 0 {
		return v
	}
	norm := float32(math.Sqrt(sum))
	for i := range v {
		v[i] /= norm
	}
	return v
}

// Dot returns the dot product of two equal-length vectors.
func Dot(a, b []float32) float32 {
	var sum float32
	for i := range a {
		sum += a[i] * b[i]
	}
	return sum
}
