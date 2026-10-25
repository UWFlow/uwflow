package parse

import (
	"context"
	"strings"
	"sync"
	"testing"
	"time"

	"github.com/getsentry/sentry-go"
)

type recordingTransport struct {
	mu     sync.Mutex
	events []*sentry.Event
}

func (t *recordingTransport) Configure(sentry.ClientOptions) {}
func (t *recordingTransport) SendEvent(event *sentry.Event) {
	t.mu.Lock()
	defer t.mu.Unlock()
	t.events = append(t.events, event)
}
func (t *recordingTransport) Flush(time.Duration) bool              { return true }
func (t *recordingTransport) FlushWithContext(context.Context) bool { return true }
func (t *recordingTransport) Close()                                {}

func TestReportTranscriptFailureIsRedactedAndUnlinked(t *testing.T) {
	transport := &recordingTransport{}
	client, err := sentry.NewClient(sentry.ClientOptions{Dsn: "https://key@sentry.invalid/1", Transport: transport})
	if err != nil {
		t.Fatalf("creating client: %v", err)
	}

	// Identifying data on the global scope must not leak into the report.
	sentry.CurrentHub().BindClient(client)
	sentry.ConfigureScope(func(scope *sentry.Scope) {
		scope.SetUser(sentry.User{ID: "42", Email: "student@uwaterloo.ca"})
		scope.SetTag("request_id", "abc")
		scope.AddBreadcrumb(&sentry.Breadcrumb{Message: "uploaded transcript"}, 10)
	})
	defer sentry.CurrentHub().BindClient(nil)

	text := "Name: Doe, Jane\nStudent ID: 20705374\n  Fall 2017\nCS   145   Designing   0.50   0.50   97\n"
	reportTranscriptFailure(sentry.CurrentHub().Client(), text, stageParse)

	if len(transport.events) != 1 {
		t.Fatalf("sent %d events, want 1", len(transport.events))
	}
	event := transport.events[0]
	if !event.User.IsEmpty() {
		t.Errorf("event has user %+v", event.User)
	}
	if event.Request != nil {
		t.Errorf("event has request %+v", event.Request)
	}
	if len(event.Breadcrumbs) != 0 {
		t.Errorf("event has breadcrumbs %+v", event.Breadcrumbs)
	}
	if len(event.Tags) != 1 || event.Tags["transcript_stage"] != stageParse {
		t.Errorf("event tags = %v, want only transcript_stage", event.Tags)
	}
	if len(event.Attachments) != 1 {
		t.Fatalf("event has %d attachments, want 1", len(event.Attachments))
	}
	payload := string(event.Attachments[0].Payload)
	for _, s := range []string{"Jane", "20705374", "Designing", "97", "0.50"} {
		if strings.Contains(payload, s) {
			t.Errorf("attachment contains %q:\n%s", s, payload)
		}
	}
	if !strings.Contains(payload, "CS  145") {
		t.Errorf("attachment lost course structure:\n%s", payload)
	}
}

func TestReportTranscriptFailureWithoutSentry(t *testing.T) {
	reportTranscriptFailure(nil, "Student ID: 1", stageParse)
}
