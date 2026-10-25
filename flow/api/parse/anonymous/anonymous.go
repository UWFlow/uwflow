// Package anonymous collects course grades from uploaded transcripts
// in a form that cannot be associated back to the student who uploaded them.
//
// A complete transcript is a fingerprint: UWFlow already stores which courses
// each user took in which term, so even a nameless copy of a transcript could be
// joined back to its owner. Stripping identifiers is therefore not enough.
// Instead, each graded course becomes an independent record, and:
//
//  1. Only (course code, term, grade bucket) is kept. The student number,
//     name, program, level, and every other transcript field are discarded.
//     Records from one transcript share no identifier, so they cannot be
//     regrouped into that transcript.
//  2. Grades are coarsened into six buckets: below 50, 50s, 60s, 70s, 80s, 90+.
//  3. Each bucket is then replaced by randomized response (local differential
//     privacy, epsilon = ln 5): with probability 1/2 the true bucket is kept,
//     otherwise one of the other five is reported uniformly at random. Even an
//     attacker who knows a student is the only UWFlow user to have taken a
//     course in a term learns only a noisy bucket, which is wrong half the time.
//  4. Records are held in memory until uploads from at least MinBatchSize
//     distinct transcripts are pooled, then shuffled with crypto/rand and
//     written together. Write time, row order, and transaction ids therefore
//     narrow a record down to a set of at least MinBatchSize uploaders.
//  5. The table has no user id, no primary key, and no timestamps,
//     and it is not tracked by Hasura, so it is not exposed over GraphQL.
//
// Aggregate counts are unbiased after correcting for the noise:
// if n records of a course offering report bucket b o times,
// the estimated true count is (o - n/10) / 0.4.
package anonymous

import (
	"crypto/rand"
	"fmt"
	"log"
	"math/big"
	"strconv"
	"sync"

	"flow/api/parse/transcript"
	"flow/common/db"
)

// MinBatchSize is the number of distinct transcripts pooled before any of
// their records are written. Smaller pools would make write timing a tighter
// link between an upload and its records.
const MinBatchSize = 10

// Buckets are identified by their lower bound. The 90 bucket includes 100.
var buckets = []int{0, 50, 60, 70, 80, 90}

type Record struct {
	CourseCode  string
	TermId      int
	GradeBucket int
}

// Intn returns a uniformly random integer in [0, n).
// It is injected so tests can be deterministic.
type Intn func(n int) int

// CryptoIntn draws from crypto/rand. A predictable generator would let an
// attacker who learns its seed undo the randomized response, so production
// code must never use math/rand here.
func CryptoIntn(n int) int {
	v, err := rand.Int(rand.Reader, big.NewInt(int64(n)))
	if err != nil {
		// crypto/rand only fails if the OS entropy source is broken.
		panic(fmt.Sprintf("crypto/rand: %v", err))
	}
	return int(v.Int64())
}

func bucketIndex(grade string) (int, bool) {
	mark, err := strconv.Atoi(grade)
	if err != nil || mark < 0 || mark > 100 {
		// Non-numeric grades like CR, NCR, INC, or WD carry no mark.
		return 0, false
	}
	if mark < 50 {
		return 0, true
	}
	return min(mark/10-4, len(buckets)-1), true
}

// randomize keeps the true bucket with probability 1/2 and otherwise reports
// one of the other buckets uniformly at random.
func randomize(index int, intn Intn) int {
	others := len(buckets) - 1
	r := intn(2 * others)
	if r < others {
		return index
	}
	r -= others
	if r >= index {
		r++
	}
	return r
}

// isComplete reports whether every course in a term has a final grade.
// Terms in progress are skipped so they can be contributed once graded.
func isComplete(term transcript.TermSummary) bool {
	for _, grade := range term.Grades {
		if grade == "" {
			return false
		}
	}
	return len(term.Grades) > 0
}

// Records extracts anonymized records for complete terms after afterTermId,
// so that re-uploading a transcript does not contribute the same term twice.
// It also returns the latest term contributed, or afterTermId if none were.
func Records(summary *transcript.Summary, afterTermId int, intn Intn) ([]Record, int) {
	var records []Record
	lastTermId := afterTermId
	for _, term := range summary.TermSummaries {
		if term.TermId <= afterTermId || !isComplete(term) {
			continue
		}
		lastTermId = max(lastTermId, term.TermId)
		for i, grade := range term.Grades {
			index, ok := bucketIndex(grade)
			if !ok {
				continue
			}
			records = append(records, Record{
				CourseCode:  term.Courses[i],
				TermId:      term.TermId,
				GradeBucket: buckets[randomize(index, intn)],
			})
		}
	}
	return records, lastTermId
}

// Pool accumulates records until MinBatchSize transcripts have contributed.
// It is safe for concurrent use. Pooled records are lost if the process exits,
// which is preferable to persisting them anywhere they could be linked.
type Pool struct {
	mu          sync.Mutex
	records     []Record
	transcripts int
	intn        Intn
}

func NewPool(intn Intn) *Pool {
	return &Pool{intn: intn}
}

// Add pools one transcript's records. Once MinBatchSize transcripts are pooled,
// it empties the pool and returns its records in random order.
func (p *Pool) Add(records []Record) []Record {
	if len(records) == 0 {
		return nil
	}

	p.mu.Lock()
	defer p.mu.Unlock()

	p.records = append(p.records, records...)
	p.transcripts++
	if p.transcripts < MinBatchSize {
		return nil
	}

	batch := p.records
	p.records = nil
	p.transcripts = 0

	// Fisher-Yates shuffle so row order reveals nothing about upload order.
	for i := len(batch) - 1; i > 0; i-- {
		j := p.intn(i + 1)
		batch[i], batch[j] = batch[j], batch[i]
	}
	return batch
}

// Records whose course is unknown are dropped, which also discards garbage
// from malformed transcripts. ORDER BY preserves the shuffled order.
const insertRecordsQuery = `
INSERT INTO anonymous_course_grade(course_code, term_id, grade_bucket)
SELECT r.code, r.term_id, r.bucket
FROM unnest($1::text[], $2::int[], $3::int[]) WITH ORDINALITY AS r(code, term_id, bucket, ord)
WHERE EXISTS (SELECT 1 FROM course WHERE code = r.code)
ORDER BY r.ord
`

func insertRecords(tx *db.Tx, batch []Record) error {
	codes := make([]string, len(batch))
	termIds := make([]int32, len(batch))
	gradeBuckets := make([]int32, len(batch))
	for i, record := range batch {
		codes[i] = record.CourseCode
		termIds[i] = int32(record.TermId)
		gradeBuckets[i] = int32(record.GradeBucket)
	}
	_, err := tx.Exec(insertRecordsQuery, codes, termIds, gradeBuckets)
	return err
}

// Flush writes a batch in its own transaction, separate from any uploader's
// request, so that a failure here never fails a transcript import.
// The write is deliberately not logged with any per-upload detail.
func Flush(conn *db.Conn, batch []Record) {
	tx, err := conn.Begin()
	if err != nil {
		log.Printf("Anonymous grade flush: begin: %v", err)
		return
	}
	defer tx.Rollback()

	if err := insertRecords(tx, batch); err != nil {
		log.Printf("Anonymous grade flush: insert: %v", err)
		return
	}
	if err := tx.Commit(); err != nil {
		log.Printf("Anonymous grade flush: commit: %v", err)
	}
}
