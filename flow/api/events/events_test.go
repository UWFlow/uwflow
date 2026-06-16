package events

import (
	"encoding/json"
	"testing"
	"time"
)

func TestValidateEvent(t *testing.T) {
	now := time.UnixMilli(1718500000000)

	base := func() inboundEvent {
		return inboundEvent{
			Name:      "course_view",
			TS:        1718500000000,
			AnonID:    "anon-uuid",
			SessionID: "sess-uuid",
			URL:       "/course/cs246",
			Referrer:  "/explore",
			Props:     json.RawMessage(`{"course_code":"cs246","dwell_ms":1234}`),
		}
	}

	t.Run("valid event passes", func(t *testing.T) {
		in := base()
		ev, ok := validateEvent(&in, now)
		if !ok {
			t.Fatal("expected valid event to pass")
		}
		if ev.Name != "course_view" {
			t.Fatalf("name mismatch: %q", ev.Name)
		}
		if ev.Props != `{"course_code":"cs246","dwell_ms":1234}` {
			t.Fatalf("props mismatch: %q", ev.Props)
		}
	})

	t.Run("rejects bad names", func(t *testing.T) {
		for _, bad := range []string{"", "CourseView", "course-view", "1course", "course view"} {
			in := base()
			in.Name = bad
			if _, ok := validateEvent(&in, now); ok {
				t.Fatalf("expected name %q to be rejected", bad)
			}
		}
	})

	t.Run("requires anonymous and session ids", func(t *testing.T) {
		in := base()
		in.AnonID = ""
		if _, ok := validateEvent(&in, now); ok {
			t.Fatal("expected missing anonymous_id to be rejected")
		}
		in = base()
		in.SessionID = ""
		if _, ok := validateEvent(&in, now); ok {
			t.Fatal("expected missing session_id to be rejected")
		}
	})

	t.Run("rejects oversized fields", func(t *testing.T) {
		in := base()
		in.AnonID = makeString(maxFieldLen + 1)
		if _, ok := validateEvent(&in, now); ok {
			t.Fatal("expected oversized anonymous_id to be rejected")
		}
	})

	t.Run("rejects non-scalar props", func(t *testing.T) {
		in := base()
		in.Props = json.RawMessage(`{"nested":{"a":1}}`)
		if _, ok := validateEvent(&in, now); ok {
			t.Fatal("expected nested props to be rejected")
		}
		in = base()
		in.Props = json.RawMessage(`{"arr":[1,2,3]}`)
		if _, ok := validateEvent(&in, now); ok {
			t.Fatal("expected array prop value to be rejected")
		}
	})

	t.Run("absent props becomes empty object", func(t *testing.T) {
		in := base()
		in.Props = nil
		ev, ok := validateEvent(&in, now)
		if !ok {
			t.Fatal("expected nil props to pass")
		}
		if ev.Props != "{}" {
			t.Fatalf("expected empty object, got %q", ev.Props)
		}
	})

	t.Run("bogus ts falls back to server time", func(t *testing.T) {
		in := base()
		in.TS = -5
		ev, ok := validateEvent(&in, now)
		if !ok {
			t.Fatal("expected event to pass with fallback ts")
		}
		if !ev.TS.Equal(now) {
			t.Fatalf("expected fallback to now, got %v", ev.TS)
		}
	})
}

func TestOriginAllowed(t *testing.T) {
	if !originAllowed("https://uwflow.com") {
		t.Fatal("expected uwflow.com to be allowed")
	}
	if originAllowed("https://evil.example") {
		t.Fatal("expected unknown origin to be rejected")
	}
}

func makeString(n int) string {
	b := make([]byte, n)
	for i := range b {
		b[i] = 'a'
	}
	return string(b)
}
