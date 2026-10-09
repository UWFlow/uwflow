package search

import (
	"context"
	"encoding/json"
	"errors"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
	"time"

	"github.com/google/go-cmp/cmp"
)

type fakeEmbedder struct {
	vector []float32
	calls  []string
}

func (f *fakeEmbedder) Embed(_ context.Context, inputs []string) ([][]float32, error) {
	f.calls = append(f.calls, inputs...)
	return [][]float32{f.vector}, nil
}

var testEntries = []entry{
	{id: 1, code: "cs135", name: "Designing Functional Programs", vector: []float32{1, 0}},
	{id: 2, code: "psych101", name: "Introductory Psychology", vector: []float32{0, 1}},
	{id: 3, code: "cs136", name: "Elementary Algorithm Design", vector: []float32{0.8, 0.6}},
}

// loadedIndex returns an index whose entries are fresh, so Handle never
// touches the database.
func loadedIndex(embedder Embedder) *Index {
	return &Index{
		embedder: embedder,
		entries:  testEntries,
		loadedAt: time.Now(),
		cache:    make(map[string][]float32),
	}
}

func TestRank(t *testing.T) {
	got := rank(testEntries, []float32{1, 0}, 5, 0.5)
	want := []Result{
		{Id: 1, Code: "cs135", Name: "Designing Functional Programs", Score: 1},
		{Id: 3, Code: "cs136", Name: "Elementary Algorithm Design", Score: 0.8},
	}
	if diff := cmp.Diff(want, got); diff != "" {
		t.Errorf("rank() mismatch (-want +got):\n%s", diff)
	}

	if got := rank(testEntries, []float32{1, 0}, 1, 0); len(got) != 1 || got[0].Id != 1 {
		t.Errorf("rank() with limit 1 = %+v", got)
	}
}

func TestHandle(t *testing.T) {
	tests := []struct {
		name     string
		query    string
		embedder Embedder
		wantIds  []int
		wantErr  bool
	}{
		{"ranks by similarity", "functional+programming", &fakeEmbedder{vector: []float32{0, 1}}, []int{2, 3}, false},
		{"disabled without embedder", "anything", nil, []int{}, false},
		{"rejects empty query", "+++", &fakeEmbedder{}, nil, true},
		{"rejects long query", strings.Repeat("a", maxQueryLength+1), &fakeEmbedder{}, nil, true},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			ix := loadedIndex(tt.embedder)
			w := httptest.NewRecorder()
			r := httptest.NewRequest(http.MethodGet, "/search/semantic?q="+tt.query, nil)

			err := ix.Handle(nil, w, r)
			if tt.wantErr {
				var status interface{ Status() int }
				if !errors.As(err, &status) || status.Status() != http.StatusBadRequest {
					t.Fatalf("Handle() error = %v, want 400", err)
				}
				return
			}
			if err != nil {
				t.Fatal(err)
			}

			var resp response
			if err := json.NewDecoder(w.Body).Decode(&resp); err != nil {
				t.Fatal(err)
			}
			ids := []int{}
			for _, c := range resp.Courses {
				ids = append(ids, c.Id)
			}
			if diff := cmp.Diff(tt.wantIds, ids); diff != "" {
				t.Errorf("result ids mismatch (-want +got):\n%s", diff)
			}
		})
	}
}

func TestHandleCachesNormalizedQueries(t *testing.T) {
	embedder := &fakeEmbedder{vector: []float32{1, 0}}
	ix := loadedIndex(embedder)

	for _, q := range []string{"Intro+Psych", "intro++psych"} {
		r := httptest.NewRequest(http.MethodGet, "/search/semantic?q="+q, nil)
		if err := ix.Handle(nil, httptest.NewRecorder(), r); err != nil {
			t.Fatal(err)
		}
	}
	if diff := cmp.Diff([]string{"intro psych"}, embedder.calls); diff != "" {
		t.Errorf("embedder calls mismatch (-want +got):\n%s", diff)
	}
}
