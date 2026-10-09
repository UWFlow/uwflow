package embed

import (
	"context"
	"math"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/google/go-cmp/cmp"
)

func TestEmbedOrdersByIndexAndNormalizes(t *testing.T) {
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if got := r.Header.Get("Authorization"); got != "Bearer key" {
			t.Errorf("Authorization = %q", got)
		}
		// Respond out of order to check that results follow input order.
		w.Write([]byte(`{"data":[
			{"index":1,"embedding":[0,2]},
			{"index":0,"embedding":[3,4]}
		]}`))
	}))
	defer server.Close()

	client := NewClient("key")
	client.endpoint = server.URL

	got, err := client.Embed(context.Background(), []string{"a", "b"})
	if err != nil {
		t.Fatal(err)
	}
	want := [][]float32{{0.6, 0.8}, {0, 1}}
	if diff := cmp.Diff(want, got); diff != "" {
		t.Errorf("Embed() mismatch (-want +got):\n%s", diff)
	}
}

func TestEmbedReportsAPIErrors(t *testing.T) {
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		http.Error(w, `{"error":"bad key"}`, http.StatusUnauthorized)
	}))
	defer server.Close()

	client := NewClient("key")
	client.endpoint = server.URL

	if _, err := client.Embed(context.Background(), []string{"a"}); err == nil {
		t.Fatal("Embed() succeeded, want error")
	}
}

func TestNormalize(t *testing.T) {
	tests := []struct {
		name string
		in   []float32
		want []float32
	}{
		{"scales", []float32{3, 4}, []float32{0.6, 0.8}},
		{"zero vector is unchanged", []float32{0, 0}, []float32{0, 0}},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got := Normalize(tt.in)
			for i := range got {
				if math.Abs(float64(got[i]-tt.want[i])) > 1e-6 {
					t.Fatalf("Normalize() = %v, want %v", got, tt.want)
				}
			}
		})
	}
}
