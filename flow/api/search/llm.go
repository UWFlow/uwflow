package search

import (
	"bufio"
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"strings"
)

const (
	// Measured at ~0.5s to first token with reasoning disabled; gpt-5-mini
	// at its lowest effort took ~1.2s.
	summaryModel     = "gpt-5.4-mini"
	summaryReasoning = "none"
	chatEndpoint     = "https://api.openai.com/v1/chat/completions"
)

// Streamer generates text for a prompt, calling onDelta with each fragment
// as it arrives.
type Streamer interface {
	Stream(ctx context.Context, system, user string, onDelta func(string) error) error
}

type chatClient struct {
	apiKey   string
	endpoint string
	http     *http.Client
}

func newChatClient(apiKey string) *chatClient {
	// No client timeout: streams are bounded by the request context.
	return &chatClient{apiKey: apiKey, endpoint: chatEndpoint, http: &http.Client{}}
}

type chatMessage struct {
	Role    string `json:"role"`
	Content string `json:"content"`
}

type chatRequest struct {
	Model               string        `json:"model"`
	Messages            []chatMessage `json:"messages"`
	Stream              bool          `json:"stream"`
	ReasoningEffort     string        `json:"reasoning_effort"`
	MaxCompletionTokens int           `json:"max_completion_tokens"`
}

type chatChunk struct {
	Choices []struct {
		Delta struct {
			Content string `json:"content"`
		} `json:"delta"`
	} `json:"choices"`
}

func (c *chatClient) Stream(ctx context.Context, system, user string, onDelta func(string) error) error {
	body, err := json.Marshal(chatRequest{
		Model: summaryModel,
		Messages: []chatMessage{
			{Role: "system", Content: system},
			{Role: "user", Content: user},
		},
		Stream:              true,
		ReasoningEffort:     summaryReasoning,
		MaxCompletionTokens: maxSummaryTokens,
	})
	if err != nil {
		return fmt.Errorf("encoding request: %w", err)
	}

	req, err := http.NewRequestWithContext(ctx, http.MethodPost, c.endpoint, bytes.NewReader(body))
	if err != nil {
		return fmt.Errorf("building request: %w", err)
	}
	req.Header.Set("Authorization", "Bearer "+c.apiKey)
	req.Header.Set("Content-Type", "application/json")

	res, err := c.http.Do(req)
	if err != nil {
		return fmt.Errorf("sending request: %w", err)
	}
	defer res.Body.Close()

	if res.StatusCode != http.StatusOK {
		detail, _ := io.ReadAll(io.LimitReader(res.Body, 1024))
		return fmt.Errorf("chat API returned %d: %s", res.StatusCode, detail)
	}
	return readChatStream(res.Body, onDelta)
}

// readChatStream decodes OpenAI's server-sent chunks until [DONE].
func readChatStream(r io.Reader, onDelta func(string) error) error {
	scanner := bufio.NewScanner(r)
	for scanner.Scan() {
		data, ok := strings.CutPrefix(scanner.Text(), "data: ")
		if !ok {
			continue
		}
		if data == "[DONE]" {
			return nil
		}

		var chunk chatChunk
		if err := json.Unmarshal([]byte(data), &chunk); err != nil {
			return fmt.Errorf("decoding chunk: %w", err)
		}
		if len(chunk.Choices) == 0 || chunk.Choices[0].Delta.Content == "" {
			continue
		}
		if err := onDelta(chunk.Choices[0].Delta.Content); err != nil {
			return err
		}
	}
	if err := scanner.Err(); err != nil {
		return fmt.Errorf("reading stream: %w", err)
	}
	return fmt.Errorf("stream ended without [DONE]")
}
