package mcp

import (
	"context"
	"errors"
	"fmt"
	"testing"
	"time"

	mcpsdk "github.com/modelcontextprotocol/go-sdk/mcp"
)

func TestCache(t *testing.T) {
	clock := time.Date(2026, 11, 19, 12, 0, 0, 0, time.UTC)
	c := newCache(10)
	c.now = func() time.Time { return clock }

	c.put("a", []byte("1234"), time.Minute)
	if got, ok := c.get("a"); !ok || string(got) != "1234" {
		t.Fatalf("get(a) = %q, %v", got, ok)
	}

	clock = clock.Add(time.Minute)
	if _, ok := c.get("a"); ok {
		t.Error("entry should expire after its TTL")
	}

	// Expired entries are dropped first to make room.
	c.put("b", []byte("123456"), time.Hour)
	c.put("c", []byte("1234"), time.Hour)
	if c.size > 10 {
		t.Errorf("size %d exceeds the 10-byte budget", c.size)
	}
	if _, ok := c.get("c"); !ok {
		t.Error("newest entry should be cached")
	}

	// Still over budget: other live entries are evicted.
	c.put("d", []byte("12345678"), time.Hour)
	if c.size != 8 {
		t.Errorf("size = %d, want 8 (only d left)", c.size)
	}

	// Replacing a key does not count its old bytes twice.
	c.put("d", []byte("12"), time.Hour)
	if c.size != 2 {
		t.Errorf("size after replacing d = %d, want 2", c.size)
	}

	// Anything larger than the whole budget is not cached.
	c.put("huge", []byte("12345678901"), time.Hour)
	if _, ok := c.get("huge"); ok {
		t.Error("oversized entry should not be cached")
	}
}

func TestSafe(t *testing.T) {
	cases := []struct {
		name string
		err  error
		want string
	}{
		{"message for the model", userErr("no course with code %s", "ZZ 999"), "no course with code ZZ 999"},
		{"upstream failure", fmt.Errorf("%w: secret detail", errUpstream), "UW Flow data is unavailable right now; try again shortly"},
		{"any other error", errors.New("unexpected internal detail"), "UW Flow data is unavailable right now; try again shortly"},
	}
	for _, c := range cases {
		h := safe(func(context.Context, *mcpsdk.CallToolRequest, struct{}) (*mcpsdk.CallToolResult, struct{}, error) {
			return nil, struct{}{}, c.err
		})
		req := &mcpsdk.CallToolRequest{Params: &mcpsdk.CallToolParamsRaw{Name: "test"}}
		if _, _, err := h(context.Background(), req, struct{}{}); err == nil || err.Error() != c.want {
			t.Errorf("%s: error = %v, want %q", c.name, err, c.want)
		}
	}
}
