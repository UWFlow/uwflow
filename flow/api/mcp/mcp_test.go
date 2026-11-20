package mcp

import (
	"context"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"os"
	"regexp"
	"strings"
	"sync"
	"testing"
	"time"

	"github.com/google/go-cmp/cmp"
	mcpsdk "github.com/modelcontextprotocol/go-sdk/mcp"
)

// fakeHasura answers the frontend's queries from testdata/, keyed by
// operation name, and counts calls so tests can check caching.
type fakeHasura struct {
	t     *testing.T
	mu    sync.Mutex
	calls map[string]int
}

var operationName = regexp.MustCompile(`query (\w+)`)

func readFixture(t *testing.T, name string) json.RawMessage {
	t.Helper()
	b, err := os.ReadFile("testdata/" + name)
	if err != nil {
		t.Fatal(err)
	}
	return b
}

func (f *fakeHasura) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	var req struct {
		Query     string         `json:"query"`
		Variables map[string]any `json:"variables"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	if r.Header.Get("Authorization") != "" || r.Header.Get("X-Hasura-Admin-Secret") != "" {
		f.t.Error("requests must carry no credentials")
	}
	op := operationName.FindStringSubmatch(req.Query)[1]
	f.mu.Lock()
	f.calls[op]++
	f.mu.Unlock()

	var data any
	switch op {
	case "getCourse":
		course := readFixture(f.t, "course.json")
		switch req.Variables["code"] {
		case "cs341":
			data = map[string]any{"course": []any{course}, "course_alias": []any{}}
		case "cs341old":
			data = map[string]any{"course": []any{}, "course_alias": []any{map[string]any{"course": course}}}
		case "boom":
			w.WriteHeader(http.StatusInternalServerError)
			w.Write([]byte(`{"errors":[{"message":"secret internal detail"}]}`))
			return
		default:
			data = map[string]any{"course": []any{}, "course_alias": []any{}}
		}
	case "courseReviews":
		data = map[string]any{"review": readFixture(f.t, "course_reviews.json")}
	case "getProf":
		p := readFixture(f.t, "prof.json")
		switch req.Variables["code"] {
		case "jane_doe":
			data = map[string]any{"prof": []any{p}}
		case "old_jane":
			data = map[string]any{"prof": []any{map[string]any{
				"id": 99, "name": "Old Jane", "code": "old_jane", "aliases": []any{}, "prof_courses": []any{},
				"rating": nil, "prof_engaging_buckets": []any{}, "prof_clear_buckets": []any{}, "merged_into_prof": p,
			}}}
		default:
			data = map[string]any{"prof": []any{}}
		}
	case "profReviews":
		if req.Variables["id"] != float64(7) {
			f.t.Errorf("profReviews for id %v, want the kept prof 7", req.Variables["id"])
		}
		data = map[string]any{"review": readFixture(f.t, "prof_reviews.json")}
	case "explore", "exploreAll":
		var rows struct {
			Courses json.RawMessage `json:"courses"`
			Profs   json.RawMessage `json:"profs"`
		}
		json.Unmarshal(readFixture(f.t, "explore.json"), &rows)
		if op == "explore" {
			data = map[string]any{"search_courses": rows.Courses, "search_profs": rows.Profs}
		} else {
			data = map[string]any{"course_search_index": rows.Courses, "prof_search_index": rows.Profs}
		}
	default:
		f.t.Errorf("unexpected operation %q", op)
	}
	json.NewEncoder(w).Encode(map[string]any{"data": data})
}

func (f *fakeHasura) count(op string) int {
	f.mu.Lock()
	defer f.mu.Unlock()
	return f.calls[op]
}

// Fall 2026; the next term is Winter 2027.
var testNow = time.Date(2026, 11, 19, 12, 0, 0, 0, waterloo)

func newTestServer(t *testing.T) (*httptest.Server, *fakeHasura) {
	t.Helper()
	fake := &fakeHasura{t: t, calls: map[string]int{}}
	hasura := httptest.NewServer(fake)
	t.Cleanup(hasura.Close)
	client, err := newHasuraClient(hasura.URL, hasura.Client())
	if err != nil {
		t.Fatal(err)
	}
	server := httptest.NewServer(newHandler(client, func() time.Time { return testNow }))
	t.Cleanup(server.Close)
	return server, fake
}

func connect(t *testing.T, url, protocolVersion string) *mcpsdk.ClientSession {
	t.Helper()
	client := mcpsdk.NewClient(&mcpsdk.Implementation{Name: "test", Version: "1"}, nil)
	session, err := client.Connect(context.Background(), &mcpsdk.StreamableClientTransport{Endpoint: url},
		&mcpsdk.ClientSessionOptions{ProtocolVersion: protocolVersion})
	if err != nil {
		t.Fatalf("connect (%s): %v", protocolVersion, err)
	}
	t.Cleanup(func() { session.Close() })
	return session
}

// call runs a tool and decodes its structured output into out, or returns
// the error text when the tool reports one.
func call(t *testing.T, s *mcpsdk.ClientSession, name string, args map[string]any, out any) string {
	t.Helper()
	res, err := s.CallTool(context.Background(), &mcpsdk.CallToolParams{Name: name, Arguments: args})
	if err != nil {
		t.Fatalf("%s: %v", name, err)
	}
	if res.IsError {
		var text []string
		for _, c := range res.Content {
			if tc, ok := c.(*mcpsdk.TextContent); ok {
				text = append(text, tc.Text)
			}
		}
		return strings.Join(text, " ")
	}
	b, err := json.Marshal(res.StructuredContent)
	if err != nil {
		t.Fatal(err)
	}
	if err := json.Unmarshal(b, out); err != nil {
		t.Fatalf("%s: decoding %s: %v", name, b, err)
	}
	return ""
}

func TestToolsListBothProtocolVersions(t *testing.T) {
	server, _ := newTestServer(t)
	want := []string{"get_course", "get_course_reviews", "get_course_schedule", "get_prof", "search_courses", "search_profs"}
	for _, version := range []string{"2026-07-28", "2025-11-25"} {
		s := connect(t, server.URL, version)
		res, err := s.ListTools(context.Background(), nil)
		if err != nil {
			t.Fatalf("%s: %v", version, err)
		}
		var names []string
		for _, tool := range res.Tools {
			names = append(names, tool.Name)
			if tool.Annotations == nil || !tool.Annotations.ReadOnlyHint {
				t.Errorf("%s: %s must be marked read-only", version, tool.Name)
			}
		}
		if diff := cmp.Diff(want, names, cmpSorted); diff != "" {
			t.Errorf("%s: tools (-want +got):\n%s", version, diff)
		}
		// The same call must work on both versions.
		var out getCourseOut
		if msg := call(t, s, "get_course", map[string]any{"code": "CS 341"}, &out); msg != "" || out.Code != "CS 341" {
			t.Errorf("%s: get_course = %q, %+v", version, msg, out.Code)
		}
	}
}

var cmpSorted = cmp.Transformer("sort", func(in []string) []string {
	out := append([]string(nil), in...)
	for i := range out {
		for j := i + 1; j < len(out); j++ {
			if out[j] < out[i] {
				out[i], out[j] = out[j], out[i]
			}
		}
	}
	return out
})

func TestGetCourse(t *testing.T) {
	server, fake := newTestServer(t)
	s := connect(t, server.URL, "")

	var out getCourseOut
	if msg := call(t, s, "get_course", map[string]any{"code": "CS 341"}, &out); msg != "" {
		t.Fatal(msg)
	}
	want := getCourseOut{
		Code:               "CS 341",
		OtherCodes:         []string{"CS 341OLD"},
		Name:               "Algorithms",
		Description:        "The study of efficient algorithms and effective algorithm design techniques.",
		URL:                "https://uwflow.com/course/cs341",
		Ratings:            ratingsOut{Liked: "87%", Easy: "52%", Useful: "97%", Ratings: 772, Reviews: 109},
		EasyDistribution:   []distribution{{5, 0}, {4, 0}, {3, 300}, {2, 0}, {1, 20}},
		UsefulDistribution: []distribution{{5, 500}, {4, 200}, {3, 0}, {2, 0}, {1, 0}},
		Prerequisites:      "CS240 or CS240E; MATH239 or MATH249",
		Corequisites:       "No corequisites",
		Antirequisites:     "CS 240E",
		LeadsTo:            []linkedCourse{{"CS 466", "Algorithm Design and Analysis", "https://uwflow.com/course/cs466"}},
		ProfsTeaching: []teachingProf{
			{Name: "Jane Doe", Code: "jane_doe", Liked: "90%", Reviews: 2, URL: "https://uwflow.com/professor/jane_doe"},
			{Name: "Sam Lee", Code: "sam_lee", Liked: "N/A", Reviews: 4, URL: "https://uwflow.com/professor/sam_lee"},
		},
		TermsOffered: []string{"Winter 2027", "Fall 2026"},
	}
	if diff := cmp.Diff(want, out); diff != "" {
		t.Errorf("get_course (-want +got):\n%s", diff)
	}

	// A renamed course's old code resolves through course_alias.
	var alias getCourseOut
	if msg := call(t, s, "get_course", map[string]any{"code": "cs341old"}, &alias); msg != "" || alias.Code != "CS 341" {
		t.Errorf("alias lookup = %q, %q", msg, alias.Code)
	}

	if msg := call(t, s, "get_course", map[string]any{"code": "ZZ 999"}, &out); !strings.Contains(msg, "no course with code ZZ 999") {
		t.Errorf("missing course message = %q", msg)
	}

	// A repeat lookup is served from the cache.
	call(t, s, "get_course", map[string]any{"code": "cs341"}, &out)
	if got := fake.count("getCourse"); got != 3 {
		t.Errorf("getCourse reached Hasura %d times, want 3 (cs341 once, cs341old, zz999)", got)
	}
}

func TestUpstreamFailureIsNotLeaked(t *testing.T) {
	server, _ := newTestServer(t)
	s := connect(t, server.URL, "")
	msg := call(t, s, "get_course", map[string]any{"code": "boom"}, &getCourseOut{})
	if msg != "UW Flow data is unavailable right now; try again shortly" {
		t.Errorf("message = %q", msg)
	}
}

func TestGetCourseSchedule(t *testing.T) {
	server, _ := newTestServer(t)
	s := connect(t, server.URL, "")

	var out scheduleOut
	if msg := call(t, s, "get_course_schedule", map[string]any{"code": "cs341"}, &out); msg != "" {
		t.Fatal(msg)
	}
	if out.Term != "Winter 2027" {
		t.Errorf("default term = %q, want Winter 2027 (starts within two months)", out.Term)
	}
	want := []sectionInfo{
		{Section: "LEC 001", ClassNumber: 5001, Enrolled: 90, Capacity: 90, Full: true, UpdatedAt: "2026-11-19T10:00:00+00:00",
			Meetings: []meetingGroup{{Time: "8:30 AM - 9:50 AM", Instructor: "Jane Doe", ProfCode: "jane_doe",
				Dates: []dateRange{{Days: []string{"T", "Th"}, StartDate: "2027-01-05", EndDate: "2027-04-05"}}}}},
		// Only the tutorial's own meeting is cancelled; the lecture is not.
		{Section: "TUT 101", ClassNumber: 5002, Enrolled: 12, Capacity: 40, UpdatedAt: "2026-11-19T10:00:00+00:00",
			Meetings: []meetingGroup{{Time: "10:30 AM - 11:20 AM", Cancelled: true,
				Dates: []dateRange{{Days: []string{"F"}, StartDate: "2027-01-05", EndDate: "2027-04-05"}}}}},
	}
	if diff := cmp.Diff(want, out.Sections); diff != "" {
		t.Errorf("sections (-want +got):\n%s", diff)
	}

	var fall scheduleOut
	if msg := call(t, s, "get_course_schedule", map[string]any{"code": "cs341", "term": "F26"}, &fall); msg != "" || fall.Term != "Fall 2026" || len(fall.Sections) != 1 {
		t.Errorf("fall = %q, %q, %d sections", msg, fall.Term, len(fall.Sections))
	}
	if msg := call(t, s, "get_course_schedule", map[string]any{"code": "cs341", "term": "Spring 2027"}, &fall); !strings.Contains(msg, "no sections in Spring 2027") {
		t.Errorf("unoffered term message = %q", msg)
	}
}

func TestGetCourseReviews(t *testing.T) {
	server, _ := newTestServer(t)
	s := connect(t, server.URL, "")

	var out courseReviewsOut
	if msg := call(t, s, "get_course_reviews", map[string]any{"code": "cs341"}, &out); msg != "" {
		t.Fatal(msg)
	}
	no, yes := false, true
	want := []courseReviewOut{
		{Comment: "Exam was hard.", Liked: &no, Easy: ptr(2), Useful: ptr(5), Prof: "Jane Doe", ProfCode: "jane_doe",
			Author: "Software Engineering student", Date: "2026-10-05", Upvotes: 1},
		{Comment: "Great course.", Liked: &yes, Easy: ptr(4), Useful: ptr(5), Prof: "Sam Lee", ProfCode: "sam_lee",
			Author: "Jane Student, Computer Science student", Date: "2026-09-27", Upvotes: 9},
	}
	if out.Total == nil || *out.Total != 2 {
		t.Errorf("total = %v, want 2 (reviews without a course comment are excluded)", out.Total)
	}
	if diff := cmp.Diff(want, out.Reviews); diff != "" {
		t.Errorf("most recent (-want +got):\n%s", diff)
	}

	call(t, s, "get_course_reviews", map[string]any{"code": "cs341", "sort": "most_helpful"}, &out)
	if len(out.Reviews) != 2 || out.Reviews[0].Upvotes != 9 {
		t.Errorf("most helpful should put the 9-vote review first: %+v", out.Reviews)
	}

	call(t, s, "get_course_reviews", map[string]any{"code": "cs341", "prof": "sam lee"}, &out)
	if out.Total == nil || *out.Total != 1 || out.Reviews[0].Prof != "Sam Lee" {
		t.Errorf("prof filter: %+v", out.Reviews)
	}

	var profs courseReviewsOut
	if msg := call(t, s, "get_course_reviews", map[string]any{"code": "cs341", "tab": "professor"}, &profs); msg != "" {
		t.Fatal(msg)
	}
	wantProfs := []profReviewGroupOut{
		{Name: "Jane Doe", Code: "jane_doe", Liked: "90%", Reviews: 2, URL: "https://uwflow.com/professor/jane_doe", Shown: []profReviewOut{
			{Comment: "Clear lectures.", Clear: ptr(5), Engaging: ptr(4), Author: "Software Engineering student", Date: "2026-10-05", Upvotes: 0},
			{Comment: "Old prof review.", Clear: ptr(1), Engaging: ptr(2), Author: "A student", Date: "", Upvotes: 3},
		}},
		// Teaching the course, no prof reviews here: listed with its overall count.
		{Name: "Sam Lee", Code: "sam_lee", Liked: "N/A", Reviews: 4, URL: "https://uwflow.com/professor/sam_lee", Shown: []profReviewOut{}},
	}
	if diff := cmp.Diff(wantProfs, profs.Professors); diff != "" {
		t.Errorf("professor tab (-want +got):\n%s", diff)
	}
	if profs.Total != nil {
		t.Errorf("professor tab should carry no course-tab total, got %d", *profs.Total)
	}

	if msg := call(t, s, "get_course_reviews", map[string]any{"code": "cs341", "sort": "best"}, &out); !strings.Contains(msg, "unknown option") {
		t.Errorf("bad sort message = %q", msg)
	}
}

func TestGetProf(t *testing.T) {
	server, _ := newTestServer(t)
	s := connect(t, server.URL, "")

	var out getProfOut
	if msg := call(t, s, "get_prof", map[string]any{"code": "jane_doe"}, &out); msg != "" {
		t.Fatal(msg)
	}
	if out.Name != "Jane Doe" || out.Ratings.Clear != "75%" || out.Ratings.Engaging != "50%" || out.Ratings.Ratings != 40 {
		t.Errorf("header: %+v", out)
	}
	if diff := cmp.Diff([]string{"CS 341", "CS 240"}, out.CoursesTaught); diff != "" {
		t.Errorf("courses taught (-want +got):\n%s", diff)
	}
	var codes []string
	for _, g := range out.ReviewsByCourse {
		codes = append(codes, g.Code)
	}
	if diff := cmp.Diff([]string{"CS 341", "CS 240"}, codes); diff != "" {
		t.Errorf("most reviews first (-want +got):\n%s", diff)
	}
	if got := out.ReviewsByCourse[0].Shown[0].Comment; got != "Fine in CS 341." {
		t.Errorf("most recent first, got %q", got)
	}
	if got := out.ReviewsByCourse[1].Shown[0].Author; got != "Alex Kim" {
		t.Errorf("public review without program: author = %q", got)
	}

	call(t, s, "get_prof", map[string]any{"code": "jane_doe", "sort": "most_helpful", "course": "CS 341"}, &out)
	if len(out.ReviewsByCourse) != 1 || out.ReviewsByCourse[0].Shown[0].Upvotes != 5 {
		t.Errorf("course filter and most helpful: %+v", out.ReviewsByCourse)
	}

	// A merged prof's old code lands on the kept prof (the fake checks that
	// reviews are fetched for id 7).
	var merged getProfOut
	if msg := call(t, s, "get_prof", map[string]any{"code": "old_jane"}, &merged); msg != "" || merged.Code != "jane_doe" {
		t.Errorf("merged prof = %q, %q", msg, merged.Code)
	}
}

func TestSearchCourses(t *testing.T) {
	server, fake := newTestServer(t)
	s := connect(t, server.URL, "")

	codes := func(out searchCoursesOut) []string {
		var c []string
		for _, r := range out.Courses {
			c = append(c, r.Code)
		}
		return c
	}

	var out searchCoursesOut
	if msg := call(t, s, "search_courses", map[string]any{"query": "algorithms"}, &out); msg != "" {
		t.Fatal(msg)
	}
	if diff := cmp.Diff([]string{"CS 341", "ECE 250", "CS 966"}, codes(out)); diff != "" {
		t.Errorf("default: most ratings first (-want +got):\n%s", diff)
	}
	if out.ThisTerm != "Fall 2026" || out.NextTerm != "Winter 2027" {
		t.Errorf("terms = %q, %q", out.ThisTerm, out.NextTerm)
	}

	call(t, s, "search_courses", map[string]any{"query": "algorithms", "levels": []int{5}}, &out)
	if diff := cmp.Diff([]string{"CS 966"}, codes(out)); diff != "" {
		t.Errorf("5XX+ includes 9XX (-want +got):\n%s", diff)
	}

	call(t, s, "search_courses", map[string]any{"query": "algorithms", "next_term": true, "has_room": true}, &out)
	if diff := cmp.Diff([]string{"ECE 250"}, codes(out)); diff != "" {
		t.Errorf("room next term (-want +got):\n%s", diff)
	}

	call(t, s, "search_courses", map[string]any{"query": "algorithms", "sort": "liked"}, &out)
	if diff := cmp.Diff([]string{"CS 341", "ECE 250", "CS 966"}, codes(out)); diff != "" {
		t.Errorf("liked, nulls last (-want +got):\n%s", diff)
	}

	call(t, s, "search_courses", map[string]any{"query": "msci"}, &out)
	if out.Courses[1].Code != "MSCI 250" || out.Courses[1].OtherCodes[0] != "ECE 250" {
		t.Errorf("display code follows the query: %+v", out.Courses[1])
	}

	if msg := call(t, s, "search_courses", map[string]any{"has_room": true}, &out); !strings.Contains(msg, "need this_term or next_term") {
		t.Errorf("has_room without a term = %q", msg)
	}

	// Empty and punctuation-only queries both load the whole index.
	call(t, s, "search_courses", map[string]any{}, &out)
	call(t, s, "search_courses", map[string]any{"query": "?!"}, &out)
	if out.Total != 3 || fake.count("exploreAll") != 1 {
		t.Errorf("explore-all: total %d, Hasura calls %d (want 3, 1 thanks to the cache)", out.Total, fake.count("exploreAll"))
	}
}

func TestSearchProfs(t *testing.T) {
	server, _ := newTestServer(t)
	s := connect(t, server.URL, "")

	var out searchProfsOut
	if msg := call(t, s, "search_profs", map[string]any{"query": "doe"}, &out); msg != "" {
		t.Fatal(msg)
	}
	var codes []string
	for _, p := range out.Profs {
		codes = append(codes, p.Code)
	}
	// One row per name, aliases included; the prof without a code is dropped.
	if diff := cmp.Diff([]string{"jane_doe", "jane_d_doe", "sam_lee"}, codes); diff != "" {
		t.Errorf("rows (-want +got):\n%s", diff)
	}

	call(t, s, "search_profs", map[string]any{"query": "doe", "course_taught": "CS 240"}, &out)
	if out.Total != 2 {
		t.Errorf("course_taught CS 240: total %d, want 2", out.Total)
	}
}

func TestHTTPBehaviour(t *testing.T) {
	server, _ := newTestServer(t)

	post := func(header http.Header) int {
		body := `{"jsonrpc":"2.0","id":1,"method":"tools/list","params":{}}`
		req, _ := http.NewRequest(http.MethodPost, server.URL, strings.NewReader(body))
		req.Header.Set("Content-Type", "application/json")
		req.Header.Set("Accept", "application/json, text/event-stream")
		req.Header.Set("MCP-Protocol-Version", "2025-11-25")
		for k, v := range header {
			req.Header[k] = v
		}
		if host := header.Get("Host"); host != "" {
			req.Host = host
		}
		resp, err := http.DefaultClient.Do(req)
		if err != nil {
			t.Fatal(err)
		}
		resp.Body.Close()
		return resp.StatusCode
	}

	if got := post(nil); got != http.StatusOK {
		t.Errorf("plain POST = %d, want 200", got)
	}
	cross := http.Header{"Origin": {"https://evil.example"}, "Sec-Fetch-Site": {"cross-site"}}
	if got := post(cross); got != http.StatusForbidden {
		t.Errorf("cross-site POST = %d, want 403", got)
	}
	// Behind nginx the API sees "Host: api", which never matches the site's
	// Origin; here the test server's host doesn't either, so this passes only
	// because uwflow.com is trusted. (Sending "Host: api" itself would trip
	// the SDK's DNS-rebinding guard, which applies only to loopback
	// connections; nginx reaches the API over the Docker network.)
	own := http.Header{"Origin": {"https://uwflow.com"}}
	if got := post(own); got != http.StatusOK {
		t.Errorf("uwflow.com POST = %d, want 200", got)
	}
	if got := post(http.Header{"Origin": {"https://example.com"}}); got != http.StatusForbidden {
		t.Errorf("POST from an untrusted origin without Sec-Fetch-Site = %d, want 403", got)
	}

	resp, err := http.Get(server.URL)
	if err != nil {
		t.Fatal(err)
	}
	resp.Body.Close()
	if resp.StatusCode != http.StatusMethodNotAllowed {
		t.Errorf("GET = %d, want 405 (stateless: no SSE stream)", resp.StatusCode)
	}
}
