package search

import (
	"context"
	"errors"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"github.com/google/go-cmp/cmp"

	"flow/common/db"
)

func TestReadChatStream(t *testing.T) {
	tests := []struct {
		name    string
		stream  string
		want    []string
		wantErr bool
	}{
		{
			name: "collects content and skips other chunks",
			stream: `data: {"choices":[{"delta":{"role":"assistant"}}]}

data: {"choices":[{"delta":{"content":"CS 116"}}]}

: keep-alive
data: {"choices":[]}
data: {"choices":[{"delta":{"content":" is easy."}}]}

data: [DONE]
`,
			want: []string{"CS 116", " is easy."},
		},
		{
			name:    "truncated stream is an error",
			stream:  "data: {\"choices\":[{\"delta\":{\"content\":\"CS\"}}]}\n",
			want:    []string{"CS"},
			wantErr: true,
		},
		{
			name:    "malformed chunk is an error",
			stream:  "data: {not json\n",
			wantErr: true,
		},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			var got []string
			err := readChatStream(strings.NewReader(tt.stream), func(delta string) error {
				got = append(got, delta)
				return nil
			})
			if (err != nil) != tt.wantErr {
				t.Fatalf("readChatStream() error = %v, wantErr %v", err, tt.wantErr)
			}
			if diff := cmp.Diff(tt.want, got); diff != "" {
				t.Errorf("deltas mismatch (-want +got):\n%s", diff)
			}
		})
	}
}

func TestSelectForSummaryFavoursRatedCourses(t *testing.T) {
	contexts := []courseContext{
		{code: "CS 798", similarity: 0.62, ratings: 0},
		{code: "CS 116", similarity: 0.55, ratings: 400},
		{code: "CS 489", similarity: 0.61, ratings: 3},
	}
	got := selectForSummary(contexts, 2)
	codes := []string{got[0].code, got[1].code}
	if diff := cmp.Diff([]string{"CS 116", "CS 489"}, codes); diff != "" {
		t.Errorf("selected codes mismatch (-want +got):\n%s", diff)
	}
	if contexts[0].code != "CS 798" {
		t.Error("selectForSummary reordered its input")
	}
}

func TestTruncate(t *testing.T) {
	tests := []struct {
		in   string
		n    int
		want string
	}{
		{"short", 10, "short"},
		{"  lots \n of\tspace ", 20, "lots of space"},
		{"héllo wörld", 6, "héllo…"},
	}
	for _, tt := range tests {
		if got := truncate(tt.in, tt.n); got != tt.want {
			t.Errorf("truncate(%q, %d) = %q, want %q", tt.in, tt.n, got, tt.want)
		}
	}
}

type fakeStreamer struct {
	deltas []string
	err    error
	calls  int
}

func (f *fakeStreamer) Stream(_ context.Context, _, _ string, onDelta func(string) error) error {
	f.calls++
	for _, d := range f.deltas {
		if err := onDelta(d); err != nil {
			return err
		}
	}
	return f.err
}

func summaryIndex(streamer Streamer) *Index {
	ix := loadedIndex(&fakeEmbedder{vector: []float32{1, 0}})
	ix.streamer = streamer
	ix.loadContext = func(_ context.Context, _ *db.Conn, matches []Result) ([]courseContext, error) {
		contexts := make([]courseContext, len(matches))
		for i, m := range matches {
			contexts[i] = courseContext{code: strings.ToUpper(m.Code), name: m.Name, similarity: m.Score}
		}
		return contexts, nil
	}
	return ix
}

func requestSummary(ix *Index, query string) (*httptest.ResponseRecorder, error) {
	w := httptest.NewRecorder()
	r := httptest.NewRequest(http.MethodGet, "/search/summary?q="+query, nil)
	return w, ix.HandleSummary(nil, w, r)
}

func TestHandleSummaryStreamsAndCaches(t *testing.T) {
	streamer := &fakeStreamer{deltas: []string{"Try ", "CS135."}}
	ix := summaryIndex(streamer)

	want := `event: courses
data: [{"code":"CS135","name":"Designing Functional Programs"},{"code":"CS136","name":"Elementary Algorithm Design"}]

event: delta
data: "Try "

event: delta
data: "CS135."

event: done
data: null

`
	w, err := requestSummary(ix, "functional+programming")
	if err != nil {
		t.Fatal(err)
	}
	if got := w.Header().Get("Content-Type"); got != "text/event-stream" {
		t.Errorf("Content-Type = %q", got)
	}
	if diff := cmp.Diff(want, w.Body.String()); diff != "" {
		t.Errorf("stream mismatch (-want +got):\n%s", diff)
	}

	w, err = requestSummary(ix, "Functional++Programming")
	if err != nil {
		t.Fatal(err)
	}
	if streamer.calls != 1 {
		t.Errorf("streamer called %d times, want 1 (second request cached)", streamer.calls)
	}
	if !strings.Contains(w.Body.String(), `data: "Try CS135."`) {
		t.Errorf("cached stream = %q", w.Body.String())
	}
}

func TestHandleSummaryReportsStreamFailure(t *testing.T) {
	streamer := &fakeStreamer{deltas: []string{"Partial"}, err: errors.New("boom")}
	ix := summaryIndex(streamer)

	w, err := requestSummary(ix, "functional")
	if err != nil {
		t.Fatal(err)
	}
	if !strings.HasSuffix(w.Body.String(), "event: error\ndata: null\n\n") {
		t.Errorf("stream = %q, want trailing error event", w.Body.String())
	}

	// Failed summaries are not cached.
	streamer.err = nil
	if _, err := requestSummary(ix, "functional"); err != nil {
		t.Fatal(err)
	}
	if streamer.calls != 2 {
		t.Errorf("streamer called %d times, want 2", streamer.calls)
	}
}

func TestHandleSummaryRejections(t *testing.T) {
	statusOf := func(err error) int {
		var status interface{ Status() int }
		if errors.As(err, &status) {
			return status.Status()
		}
		return 0
	}

	disabled := loadedIndex(nil)
	if _, err := requestSummary(disabled, "anything"); statusOf(err) != http.StatusNotFound {
		t.Errorf("disabled: error = %v, want 404", err)
	}

	busy := summaryIndex(&fakeStreamer{})
	for i := 0; i < maxConcurrentSummaries; i++ {
		busy.summarySlots <- struct{}{}
	}
	if _, err := requestSummary(busy, "anything"); statusOf(err) != http.StatusTooManyRequests {
		t.Errorf("busy: error = %v, want 429", err)
	}
}
