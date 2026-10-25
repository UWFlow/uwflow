package anonymous

import (
	"math"
	"math/rand"
	"testing"

	"flow/api/parse/transcript"

	"github.com/google/go-cmp/cmp"
)

// keepAll always draws 0, so randomize keeps the true bucket
// and the shuffle in Pool.Add is a fixed permutation.
func keepAll(n int) int { return 0 }

func seeded(seed int64) Intn {
	return rand.New(rand.NewSource(seed)).Intn
}

func TestBucketIndex(t *testing.T) {
	tests := []struct {
		grade string
		want  int
		ok    bool
	}{
		{"0", 0, true},
		{"49", 0, true},
		{"50", 1, true},
		{"69", 2, true},
		{"79", 3, true},
		{"80", 4, true},
		{"90", 5, true},
		{"100", 5, true},
		{"101", 0, false},
		{"-1", 0, false},
		{"CR", 0, false},
		{"NCR", 0, false},
		{"", 0, false},
	}
	for _, tt := range tests {
		got, ok := bucketIndex(tt.grade)
		if got != tt.want || ok != tt.ok {
			t.Errorf("bucketIndex(%q) = %d, %v; want %d, %v", tt.grade, got, ok, tt.want, tt.ok)
		}
	}
}

func TestRandomizeDistribution(t *testing.T) {
	const trials = 600000
	intn := seeded(1)
	counts := make([]int, len(buckets))
	for i := 0; i < trials; i++ {
		counts[randomize(2, intn)]++
	}
	for index, count := range counts {
		want := 0.1
		if index == 2 {
			want = 0.5
		}
		if got := float64(count) / trials; math.Abs(got-want) > 0.005 {
			t.Errorf("bucket %d reported with frequency %.4f, want %.1f", index, got, want)
		}
	}
}

func TestRecordsDebiasedCounts(t *testing.T) {
	// 1000 students with true buckets split 700 in the 90s and 300 in the 80s.
	intn := seeded(2)
	observed := map[int]int{}
	for i := 0; i < 1000; i++ {
		grade := "95"
		if i < 300 {
			grade = "85"
		}
		summary := &transcript.Summary{TermSummaries: []transcript.TermSummary{
			{TermId: 1199, Courses: []string{"cs135"}, Grades: []string{grade}},
		}}
		records, _ := Records(summary, 0, intn)
		observed[records[0].GradeBucket]++
	}
	estimate := func(bucket int) float64 { return (float64(observed[bucket]) - 100) / 0.4 }
	if got := estimate(90); math.Abs(got-700) > 60 {
		t.Errorf("estimated 90s count %.0f, want about 700", got)
	}
	if got := estimate(80); math.Abs(got-300) > 60 {
		t.Errorf("estimated 80s count %.0f, want about 300", got)
	}
}

func TestRecords(t *testing.T) {
	summary := &transcript.Summary{
		StudentNumber: 20705374,
		ProgramName:   "Computer Science",
		TermSummaries: []transcript.TermSummary{
			{TermId: 1179, Level: "1A", Courses: []string{"cs145", "math145"}, Grades: []string{"97", "48"}},
			{TermId: 1185, Level: "2A", Courses: []string{"coop1", "pd11"}, Grades: []string{"CR", "CR"}},
			{TermId: 1189, Level: "2A", Courses: []string{"cs241e", "pd1"}, Grades: []string{"81", "CR"}},
			{TermId: 1195, Level: "2B", Courses: []string{"cs240e", "cs370"}, Grades: []string{"", ""}},
		},
	}

	tests := []struct {
		name        string
		afterTermId int
		want        []Record
		wantLast    int
	}{
		{
			name:        "first upload skips ungraded courses and the term in progress",
			afterTermId: 0,
			want: []Record{
				{CourseCode: "cs145", TermId: 1179, GradeBucket: 90},
				{CourseCode: "math145", TermId: 1179, GradeBucket: 0},
				{CourseCode: "cs241e", TermId: 1189, GradeBucket: 80},
			},
			wantLast: 1189,
		},
		{
			name:        "re-upload only contributes new terms",
			afterTermId: 1185,
			want:        []Record{{CourseCode: "cs241e", TermId: 1189, GradeBucket: 80}},
			wantLast:    1189,
		},
		{
			name:        "nothing new",
			afterTermId: 1189,
			want:        nil,
			wantLast:    1189,
		},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got, last := Records(summary, tt.afterTermId, keepAll)
			if diff := cmp.Diff(tt.want, got); diff != "" {
				t.Errorf("records mismatch (-want +got):\n%s", diff)
			}
			if last != tt.wantLast {
				t.Errorf("last term = %d, want %d", last, tt.wantLast)
			}
		})
	}
}

func TestPoolWaitsForMinBatchSize(t *testing.T) {
	pool := NewPool(seeded(3))
	var want []Record
	for i := 0; i < MinBatchSize-1; i++ {
		record := Record{CourseCode: "cs135", TermId: 1199 + i, GradeBucket: 90}
		want = append(want, record)
		if batch := pool.Add([]Record{record}); batch != nil {
			t.Fatalf("flushed after %d transcripts, want %d", i+1, MinBatchSize)
		}
	}
	if batch := pool.Add(nil); batch != nil {
		t.Fatalf("empty contribution counted towards the batch")
	}

	last := Record{CourseCode: "cs136", TermId: 1201, GradeBucket: 80}
	want = append(want, last)
	batch := pool.Add([]Record{last})
	if len(batch) != MinBatchSize {
		t.Fatalf("flushed %d records, want %d", len(batch), MinBatchSize)
	}
	if cmp.Equal(want, batch) {
		t.Errorf("batch kept upload order; want shuffled")
	}
	sortRecords := cmp.Transformer("sort", func(in []Record) map[Record]int {
		out := map[Record]int{}
		for _, r := range in {
			out[r]++
		}
		return out
	})
	if diff := cmp.Diff(want, batch, sortRecords); diff != "" {
		t.Errorf("batch contents mismatch (-want +got):\n%s", diff)
	}

	if batch := pool.Add([]Record{last}); batch != nil {
		t.Errorf("pool was not emptied after flushing")
	}
}
