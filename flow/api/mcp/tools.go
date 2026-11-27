package mcp

import (
	"context"
	"fmt"
	"strings"
	"time"

	mcpsdk "github.com/modelcontextprotocol/go-sdk/mcp"
)

// tools holds the dependencies of the tool handlers below.
type tools struct {
	q   querier
	now func() time.Time
}

// userError is a message meant for the model: bad input or missing data.
// Any other error is an internal failure, which safe hides.
type userError struct{ msg string }

func (e userError) Error() string { return e.msg }

func userErr(format string, args ...any) error { return userError{fmt.Sprintf(format, args...)} }

func clamp(v, def, max int) int {
	if v <= 0 {
		return def
	}
	if v > max {
		return max
	}
	return v
}

type searchCoursesIn struct {
	Query            string `json:"query,omitempty" jsonschema:"words to search course codes, names and professors for; empty lists every course"`
	CodeOnly         bool   `json:"code_only,omitempty" jsonschema:"treat query as a subject code (e.g. CS) and list all its courses, like the site's Explore all CS courses link"`
	Levels           []int  `json:"levels,omitempty" jsonschema:"course levels to include: 1 for 1XX, 2, 3, 4, and 5 for 5XX and above; empty includes all"`
	MinRatings       int    `json:"min_ratings,omitempty" jsonschema:"minimum number of ratings; the site offers 0, 1, 5, 10, 20, 50, 75, 100, 200, 500"`
	ThisTerm         bool   `json:"this_term,omitempty" jsonschema:"only courses offered in the current term"`
	NextTerm         bool   `json:"next_term,omitempty" jsonschema:"only courses offered next term; with this_term, both must hold"`
	HasRoom          bool   `json:"has_room,omitempty" jsonschema:"only courses with a section that has seats in the chosen term; needs this_term or next_term, as on the website"`
	HasOnlineSection bool   `json:"has_online_section,omitempty" jsonschema:"only courses with an online section in the chosen term; needs this_term or next_term, as on the website"`
	Sort             string `json:"sort,omitempty" jsonschema:"one of ratings (number of ratings, default), liked, easy, useful, code, name"`
	Reverse          bool   `json:"reverse,omitempty" jsonschema:"reverse the order; default is highest first for numbers and A to Z for text"`
	Limit            int    `json:"limit,omitempty" jsonschema:"results to return, default 75, at most 100"`
	Offset           int    `json:"offset,omitempty" jsonschema:"results to skip, for paging"`
}

type courseResult struct {
	Code       string   `json:"code"`
	OtherCodes []string `json:"other_codes,omitempty" jsonschema:"other codes the course is listed under"`
	Name       string   `json:"name"`
	Ratings    int      `json:"ratings" jsonschema:"number of ratings"`
	Liked      string   `json:"liked"`
	Easy       string   `json:"easy"`
	Useful     string   `json:"useful"`
	Terms      []string `json:"terms_offered,omitempty"`
	URL        string   `json:"url"`
}

type searchCoursesOut struct {
	Total    int            `json:"total" jsonschema:"courses matching all filters"`
	Courses  []courseResult `json:"courses"`
	ThisTerm string         `json:"this_term"`
	NextTerm string         `json:"next_term"`
}

// searchCourses mirrors the Courses tab of /explore.
func (t *tools) searchCourses(ctx context.Context, _ *mcpsdk.CallToolRequest, in searchCoursesIn) (*mcpsdk.CallToolResult, searchCoursesOut, error) {
	if (in.HasRoom || in.HasOnlineSection) && !in.ThisTerm && !in.NextTerm {
		return nil, searchCoursesOut{}, userErr("has_room and has_online_section need this_term or next_term; the website only offers them once a term is chosen")
	}
	rows, _, err := fetchExplore(ctx, t.q, in.Query, in.CodeOnly)
	if err != nil {
		return nil, searchCoursesOut{}, err
	}
	now := t.now()
	filter := courseFilter{Levels: map[int]bool{}, MinRatings: in.MinRatings, ThisTerm: in.ThisTerm,
		NextTerm: in.NextTerm, HasRoom: in.HasRoom, HasOnlineSection: in.HasOnlineSection}
	if len(in.Levels) == 0 {
		in.Levels = []int{1, 2, 3, 4, 5}
	}
	for _, l := range in.Levels {
		filter.Levels[l] = true
	}

	type candidate struct {
		row   courseSearchRow
		code  string
		other []string
	}
	var kept []candidate
	for _, row := range rows {
		codes := append([]string{deref(row.Code)}, row.Aliases...)
		code := pickDisplayCode(codes, in.Query)
		if !filter.keep(row, code, now) {
			continue
		}
		var other []string
		for _, c := range codes {
			if c != code {
				other = append(other, formatCourseCode(c))
			}
		}
		kept = append(kept, candidate{row, code, other})
	}

	values := map[string]func(candidate) sortValue{
		"ratings": func(c candidate) sortValue { return intValue(c.row.Ratings) },
		"liked":   func(c candidate) sortValue { return numValue(c.row.Liked) },
		"easy":    func(c candidate) sortValue { return numValue(c.row.Easy) },
		"useful":  func(c candidate) sortValue { return numValue(c.row.Useful) },
		"code":    func(c candidate) sortValue { return textValue(c.code) },
		"name":    func(c candidate) sortValue { return textValue(deref(c.row.Name)) },
	}
	value, ok := values[strings.ToLower(in.Sort)]
	if in.Sort == "" {
		value, ok = values["ratings"], true
	}
	if !ok {
		return nil, searchCoursesOut{}, userErr("unknown sort %q: use ratings, liked, easy, useful, code or name", in.Sort)
	}
	sortRows(kept, value, in.Reverse)

	out := searchCoursesOut{Total: len(kept), Courses: []courseResult{},
		ThisTerm: termName(currentTerm(now)), NextTerm: termName(nextTerm(currentTerm(now)))}
	for _, c := range page(kept, in.Offset, clamp(in.Limit, 75, 100)) {
		res := courseResult{Code: formatCourseCode(c.code), OtherCodes: c.other, Name: deref(c.row.Name),
			Ratings: orZero(c.row.Ratings), Liked: percent(c.row.Liked), Easy: percent(c.row.Easy),
			Useful: percent(c.row.Useful), URL: courseURL(c.code)}
		for _, term := range c.row.Terms {
			res.Terms = append(res.Terms, termName(term))
		}
		out.Courses = append(out.Courses, res)
	}
	return nil, out, nil
}

type searchProfsIn struct {
	Query        string `json:"query,omitempty" jsonschema:"words to search professor names and the courses they teach; empty lists every professor"`
	MinRatings   int    `json:"min_ratings,omitempty" jsonschema:"minimum number of ratings; the site offers 0, 1, 5, 10, 20, 50, 75, 100, 200, 500"`
	CourseTaught string `json:"course_taught,omitempty" jsonschema:"only professors who teach this course code, e.g. CS 341"`
	Sort         string `json:"sort,omitempty" jsonschema:"one of ratings (number of ratings, default), liked, clear, engaging, name"`
	Reverse      bool   `json:"reverse,omitempty" jsonschema:"reverse the order; default is highest first for numbers and A to Z for text"`
	Limit        int    `json:"limit,omitempty" jsonschema:"results to return, default 75, at most 100"`
	Offset       int    `json:"offset,omitempty" jsonschema:"results to skip, for paging"`
}

type profResult struct {
	Name     string   `json:"name"`
	Code     string   `json:"code" jsonschema:"pass to get_prof"`
	Ratings  int      `json:"ratings" jsonschema:"number of ratings"`
	Liked    string   `json:"liked" jsonschema:"the site's professor score: 20% liked, 40% clear, 40% engaging"`
	Clear    string   `json:"clear"`
	Engaging string   `json:"engaging"`
	Courses  []string `json:"courses,omitempty"`
	URL      string   `json:"url"`
}

type searchProfsOut struct {
	Total int          `json:"total" jsonschema:"rows matching all filters; a professor listed under several names has one row per name, as on the website"`
	Profs []profResult `json:"profs"`
}

// searchProfs mirrors the Profs tab of /explore.
func (t *tools) searchProfs(ctx context.Context, _ *mcpsdk.CallToolRequest, in searchProfsIn) (*mcpsdk.CallToolResult, searchProfsOut, error) {
	_, rows, err := fetchExplore(ctx, t.q, in.Query, false)
	if err != nil {
		return nil, searchProfsOut{}, err
	}
	taught := normalizeCode(in.CourseTaught)

	type candidate struct {
		row  profSearchRow
		name string
		code string
	}
	var kept []candidate
	for _, row := range rows {
		names := []candidate{{row, deref(row.Name), deref(row.Code)}}
		for _, alias := range row.AliasLinks {
			names = append(names, candidate{row, alias.Name, deref(alias.Code)})
		}
		for _, c := range names {
			if c.code == "" || orZero(row.Ratings) < in.MinRatings {
				continue
			}
			if taught != "" && !containsString(row.CourseCodes, taught) {
				continue
			}
			kept = append(kept, c)
		}
	}

	values := map[string]func(candidate) sortValue{
		"ratings":  func(c candidate) sortValue { return intValue(c.row.Ratings) },
		"liked":    func(c candidate) sortValue { return numValue(c.row.Liked) },
		"clear":    func(c candidate) sortValue { return numValue(c.row.Clear) },
		"engaging": func(c candidate) sortValue { return numValue(c.row.Engaging) },
		"name":     func(c candidate) sortValue { return textValue(c.name) },
	}
	value, ok := values[strings.ToLower(in.Sort)]
	if in.Sort == "" {
		value, ok = values["ratings"], true
	}
	if !ok {
		return nil, searchProfsOut{}, userErr("unknown sort %q: use ratings, liked, clear, engaging or name", in.Sort)
	}
	sortRows(kept, value, in.Reverse)

	out := searchProfsOut{Total: len(kept), Profs: []profResult{}}
	for _, c := range page(kept, in.Offset, clamp(in.Limit, 75, 100)) {
		res := profResult{Name: c.name, Code: c.code, Ratings: orZero(c.row.Ratings), Liked: percent(c.row.Liked),
			Clear: percent(c.row.Clear), Engaging: percent(c.row.Engaging), URL: profURL(c.code)}
		for _, code := range c.row.CourseCodes {
			res.Courses = append(res.Courses, formatCourseCode(code))
		}
		out.Profs = append(out.Profs, res)
	}
	return nil, out, nil
}

type codeIn struct {
	Code string `json:"code" jsonschema:"course code such as CS 341 or cs341; old codes of renamed courses work too"`
}

type distribution struct {
	Rating int `json:"rating" jsonschema:"1 to 5"`
	Count  int `json:"count"`
}

type ratingsOut struct {
	Liked    string `json:"liked" jsonschema:"for a course, the share of ratings that liked it; for a professor, the site's score of 20% liked, 40% clear, 40% engaging"`
	Easy     string `json:"easy,omitempty"`
	Useful   string `json:"useful,omitempty"`
	Clear    string `json:"clear,omitempty"`
	Engaging string `json:"engaging,omitempty"`
	Ratings  int    `json:"ratings" jsonschema:"number of ratings"`
	Reviews  int    `json:"reviews" jsonschema:"number of written reviews"`
}

type linkedCourse struct {
	Code string `json:"code"`
	Name string `json:"name"`
	URL  string `json:"url"`
}

type teachingProf struct {
	Name    string `json:"name"`
	Code    string `json:"code"`
	Liked   string `json:"liked" jsonschema:"the site's professor score: 20% liked, 40% clear, 40% engaging"`
	Reviews int    `json:"reviews"`
	URL     string `json:"url"`
}

type getCourseOut struct {
	Code               string         `json:"code"`
	OtherCodes         []string       `json:"other_codes,omitempty"`
	Name               string         `json:"name"`
	Description        string         `json:"description,omitempty"`
	URL                string         `json:"url"`
	Ratings            ratingsOut     `json:"ratings"`
	EasyDistribution   []distribution `json:"easy_distribution"`
	UsefulDistribution []distribution `json:"useful_distribution"`
	Prerequisites      string         `json:"prerequisites" jsonschema:"UW's requisite text as published; not checked against a student's record"`
	Corequisites       string         `json:"corequisites"`
	Antirequisites     string         `json:"antirequisites"`
	LeadsTo            []linkedCourse `json:"leads_to" jsonschema:"courses that list this one as a prerequisite or corequisite"`
	ProfsTeaching      []teachingProf `json:"profs_teaching"`
	TermsOffered       []string       `json:"terms_offered" jsonschema:"terms with sections; use get_course_schedule for details"`
}

// fetchCourse mirrors CoursePage.tsx: look the code up as a course, then as
// an alias of a renamed course.
func (t *tools) fetchCourse(ctx context.Context, code string) (course, error) {
	normalized := normalizeCode(code)
	if normalized == "" {
		return course{}, userErr("code is required")
	}
	var data courseData
	if err := t.q.query(ctx, "course", map[string]any{"code": normalized}, &data); err != nil {
		return course{}, err
	}
	if len(data.Course) > 0 {
		return data.Course[0], nil
	}
	if len(data.CourseAlias) > 0 && data.CourseAlias[0].Course != nil {
		return *data.CourseAlias[0].Course, nil
	}
	return course{}, userErr("no course with code %s; try search_courses", formatCourseCode(normalized))
}

// distributionOf mirrors createOrderedBuckets (utils/Ratings.ts): counts
// for ratings 5 down to 1, zero where missing.
func distributionOf(buckets []bucket) []distribution {
	counts := map[int]int{}
	for _, b := range buckets {
		if b.Value != nil && b.Count != nil {
			counts[*b.Value] = *b.Count
		}
	}
	out := make([]distribution, 0, 5)
	for v := 4; v >= 0; v-- {
		out = append(out, distribution{Rating: v + 1, Count: counts[v]})
	}
	return out
}

func requisite(text *string, none string) string {
	if strings.TrimSpace(deref(text)) == "" {
		return none
	}
	return *text
}

// getCourse mirrors the header, requisites and profs of /course/:code.
func (t *tools) getCourse(ctx context.Context, _ *mcpsdk.CallToolRequest, in codeIn) (*mcpsdk.CallToolResult, getCourseOut, error) {
	c, err := t.fetchCourse(ctx, in.Code)
	if err != nil {
		return nil, getCourseOut{}, err
	}
	rating := c.Rating
	if rating == nil {
		rating = &ratingSummary{}
	}
	out := getCourseOut{
		Code:               formatCourseCode(c.Code),
		Name:               c.Name,
		Description:        deref(c.Description),
		URL:                courseURL(c.Code),
		Ratings:            ratingsOut{Liked: percent(rating.Liked), Easy: percent(rating.Easy), Useful: percent(rating.Useful), Ratings: orZero(rating.FilledCount), Reviews: orZero(rating.CommentCount)},
		EasyDistribution:   distributionOf(c.CourseEasyBuckets),
		UsefulDistribution: distributionOf(c.CourseUsefulBuckets),
		Prerequisites:      requisite(c.Prereqs, "No prerequisites"),
		Corequisites:       requisite(c.Coreqs, "No corequisites"),
		Antirequisites:     requisite(c.Antireqs, "No antirequisites"),
		LeadsTo:            []linkedCourse{},
		ProfsTeaching:      []teachingProf{},
		TermsOffered:       []string{},
	}
	for _, a := range c.Aliases {
		out.OtherCodes = append(out.OtherCodes, formatCourseCode(a.Code))
	}
	for _, p := range c.Postrequisites {
		if p.Postrequisite != nil {
			out.LeadsTo = append(out.LeadsTo, linkedCourse{formatCourseCode(p.Postrequisite.Code), p.Postrequisite.Name, courseURL(p.Postrequisite.Code)})
		}
	}
	for _, pt := range c.ProfsTeaching {
		p := pt.Prof
		if p == nil || deref(p.Code) == "" {
			continue
		}
		tp := teachingProf{Name: p.Name, Code: *p.Code, Liked: "N/A", URL: profURL(*p.Code)}
		if p.Rating != nil {
			tp.Liked, tp.Reviews = percent(p.Rating.Liked), orZero(p.Rating.CommentCount)
		}
		out.ProfsTeaching = append(out.ProfsTeaching, tp)
	}
	for _, term := range termsOffered(c.Sections) {
		out.TermsOffered = append(out.TermsOffered, termName(term))
	}
	return nil, out, nil
}

type scheduleIn struct {
	Code string `json:"code" jsonschema:"course code such as CS 341"`
	Term string `json:"term,omitempty" jsonschema:"term name like Winter 2027 or id like 1271; default is the term the website opens on"`
}

type scheduleOut struct {
	Code         string        `json:"code"`
	Name         string        `json:"name"`
	Term         string        `json:"term"`
	TermsOffered []string      `json:"terms_offered"`
	Sections     []sectionInfo `json:"sections"`
	URL          string        `json:"url"`
}

// getCourseSchedule mirrors the schedule table on the course page.
func (t *tools) getCourseSchedule(ctx context.Context, _ *mcpsdk.CallToolRequest, in scheduleIn) (*mcpsdk.CallToolResult, scheduleOut, error) {
	c, err := t.fetchCourse(ctx, in.Code)
	if err != nil {
		return nil, scheduleOut{}, err
	}
	terms := termsOffered(c.Sections)
	out := scheduleOut{Code: formatCourseCode(c.Code), Name: c.Name, TermsOffered: []string{}, Sections: []sectionInfo{}, URL: courseURL(c.Code)}
	for _, term := range terms {
		out.TermsOffered = append(out.TermsOffered, termName(term))
	}
	if len(terms) == 0 {
		return nil, out, userErr("%s has no scheduled sections", out.Code)
	}
	term := defaultTerm(terms, t.now())
	if in.Term != "" {
		if term, err = parseTerm(in.Term); err != nil {
			return nil, scheduleOut{}, err
		}
		if !contains(terms, term) {
			return nil, scheduleOut{}, userErr("%s has no sections in %s; offered: %s", out.Code, termName(term), strings.Join(out.TermsOffered, ", "))
		}
	}
	out.Term = termName(term)
	out.Sections = termSections(c.Sections, term)
	return nil, out, nil
}

type courseReviewsIn struct {
	Code      string `json:"code" jsonschema:"course code such as CS 341"`
	Tab       string `json:"tab,omitempty" jsonschema:"course (default): reviews of the course; professor: reviews of the professors who taught it, grouped by professor"`
	Sort      string `json:"sort,omitempty" jsonschema:"most_recent (default) or most_helpful"`
	Prof      string `json:"prof,omitempty" jsonschema:"only reviews involving this professor (name or code)"`
	Limit     int    `json:"limit,omitempty" jsonschema:"course tab: reviews to return, default 8 as on the website, at most 50; professor tab: reviews per professor, default 3"`
	Offset    int    `json:"offset,omitempty" jsonschema:"course tab: reviews to skip, for paging"`
	SortProfs string `json:"sort_profs,omitempty" jsonschema:"professor tab: most_reviews (default) or most_liked"`
}

type profReviewGroupOut struct {
	Name    string          `json:"name"`
	Code    string          `json:"code"`
	Liked   string          `json:"liked" jsonschema:"the site's professor score: 20% liked, 40% clear, 40% engaging"`
	Reviews int             `json:"reviews"`
	URL     string          `json:"url"`
	Shown   []profReviewOut `json:"shown_reviews"`
}

type courseReviewsOut struct {
	Code       string               `json:"code"`
	Name       string               `json:"name"`
	URL        string               `json:"url"`
	Total      *int                 `json:"total,omitempty" jsonschema:"course tab: reviews matching the filter"`
	Reviews    []courseReviewOut    `json:"reviews,omitempty"`
	Professors []profReviewGroupOut `json:"professors,omitempty"`
}

func matchesProf(p *profRef, want string) bool {
	if want == "" {
		return true
	}
	if p == nil {
		return false
	}
	want = strings.TrimSpace(want)
	return strings.EqualFold(p.Name, want) ||
		strings.EqualFold(deref(p.Code), strings.ReplaceAll(want, " ", "_"))
}

func sortChoice(s, def string, allowed ...string) (string, error) {
	if s == "" {
		return def, nil
	}
	for _, a := range allowed {
		if strings.EqualFold(s, a) {
			return a, nil
		}
	}
	return "", userErr("unknown option %q: use %s", s, strings.Join(allowed, " or "))
}

// getCourseReviews mirrors the reviews block on the course page.
func (t *tools) getCourseReviews(ctx context.Context, _ *mcpsdk.CallToolRequest, in courseReviewsIn) (*mcpsdk.CallToolResult, courseReviewsOut, error) {
	tab, err := sortChoice(in.Tab, "course", "course", "professor")
	if err != nil {
		return nil, courseReviewsOut{}, err
	}
	order, err := sortChoice(in.Sort, "most_recent", "most_recent", "most_helpful")
	if err != nil {
		return nil, courseReviewsOut{}, err
	}
	profOrder, err := sortChoice(in.SortProfs, "most_reviews", "most_reviews", "most_liked")
	if err != nil {
		return nil, courseReviewsOut{}, err
	}
	c, err := t.fetchCourse(ctx, in.Code)
	if err != nil {
		return nil, courseReviewsOut{}, err
	}
	var data reviewData
	if err := t.q.query(ctx, "course_reviews", map[string]any{"id": c.ID}, &data); err != nil {
		return nil, courseReviewsOut{}, err
	}
	out := courseReviewsOut{Code: formatCourseCode(c.Code), Name: c.Name, URL: courseURL(c.Code)}
	byTime := order == "most_recent"

	if tab == "course" {
		var picked []review
		for _, r := range data.Review {
			if deref(r.CourseComment) != "" && matchesProf(r.Prof, in.Prof) {
				picked = append(picked, r)
			}
		}
		sorted := withVotes(picked, courseVotes)
		sortReviews(sorted, byTime)
		total := len(sorted)
		out.Total = &total
		out.Reviews = []courseReviewOut{}
		for _, s := range page(sorted, in.Offset, clamp(in.Limit, courseReviewsShown, 50)) {
			out.Reviews = append(out.Reviews, toCourseReview(s))
		}
		return nil, out, nil
	}

	// Professor tab: grouped by prof id (the page groups by name, merging
	// namesakes), plus profs teaching the course with no reviews yet.
	groups := map[int]*reviewGroup{}
	var seen []int
	for _, r := range data.Review {
		if r.Prof == nil || deref(r.ProfComment) == "" {
			continue
		}
		g, ok := groups[r.Prof.ID]
		if !ok {
			g = &reviewGroup{id: r.Prof.ID, name: r.Prof.Name, code: deref(r.Prof.Code)}
			if r.Prof.Rating != nil {
				g.liked = r.Prof.Rating.Liked
			}
			groups[r.Prof.ID] = g
			seen = append(seen, r.Prof.ID)
		}
		g.reviews = append(g.reviews, withVotes([]review{r}, profVotes)...)
	}
	var list []reviewGroup
	seenCodes := map[string]bool{}
	for _, id := range seen {
		g := groups[id]
		if g.code == "" {
			continue // the page hides groups without a prof code
		}
		seenCodes[g.code] = true
		list = append(list, *g)
	}
	for _, pt := range c.ProfsTeaching {
		p := pt.Prof
		if p == nil || deref(p.Code) == "" || seenCodes[*p.Code] {
			continue
		}
		g := reviewGroup{id: p.ID, name: p.Name, code: *p.Code}
		if p.Rating != nil {
			g.liked, g.reviewCount = p.Rating.Liked, orZero(p.Rating.CommentCount)
		}
		list = append(list, g)
	}
	sortGroups(list, profOrder == "most_liked", func(g reviewGroup) string { return g.name })

	out.Professors = []profReviewGroupOut{}
	perProf := clamp(in.Limit, profReviewsShown, 50)
	for _, g := range list {
		if !matchesProf(&profRef{Name: g.name, Code: &g.code}, in.Prof) {
			continue
		}
		sortReviews(g.reviews, byTime)
		count := len(g.reviews)
		if count == 0 {
			count = g.reviewCount
		}
		group := profReviewGroupOut{Name: g.name, Code: g.code, Liked: percent(g.liked), Reviews: count, URL: profURL(g.code), Shown: []profReviewOut{}}
		for _, s := range page(g.reviews, 0, perProf) {
			group.Shown = append(group.Shown, toProfReview(s))
		}
		out.Professors = append(out.Professors, group)
	}
	return nil, out, nil
}

type getProfIn struct {
	Code        string `json:"code" jsonschema:"professor code from search_profs, e.g. jane_doe; a merged professor's old code works too"`
	Course      string `json:"course,omitempty" jsonschema:"only reviews from this course code"`
	Sort        string `json:"sort,omitempty" jsonschema:"most_recent (default) or most_helpful, within each course"`
	SortCourses string `json:"sort_courses,omitempty" jsonschema:"most_reviews (default) or most_liked"`
	PerCourse   int    `json:"per_course,omitempty" jsonschema:"reviews per course, default 3 as on the website, at most 50"`
}

type courseReviewGroupOut struct {
	Code    string          `json:"code"`
	Name    string          `json:"name"`
	Liked   string          `json:"liked" jsonschema:"the course's liked rating"`
	Reviews int             `json:"reviews"`
	URL     string          `json:"url"`
	Shown   []profReviewOut `json:"shown_reviews"`
}

type getProfOut struct {
	Name                 string                 `json:"name"`
	Code                 string                 `json:"code"`
	OtherNames           []string               `json:"other_names,omitempty"`
	URL                  string                 `json:"url"`
	Ratings              ratingsOut             `json:"ratings"`
	ClearDistribution    []distribution         `json:"clear_distribution"`
	EngagingDistribution []distribution         `json:"engaging_distribution"`
	CoursesTaught        []string               `json:"courses_taught"`
	ReviewsByCourse      []courseReviewGroupOut `json:"reviews_by_course"`
}

// getProf mirrors /professor/:code, header and reviews.
func (t *tools) getProf(ctx context.Context, _ *mcpsdk.CallToolRequest, in getProfIn) (*mcpsdk.CallToolResult, getProfOut, error) {
	order, err := sortChoice(in.Sort, "most_recent", "most_recent", "most_helpful")
	if err != nil {
		return nil, getProfOut{}, err
	}
	courseOrder, err := sortChoice(in.SortCourses, "most_reviews", "most_reviews", "most_liked")
	if err != nil {
		return nil, getProfOut{}, err
	}
	code := strings.ToLower(strings.TrimSpace(in.Code))
	if code == "" {
		return nil, getProfOut{}, userErr("code is required")
	}
	var data profData
	if err := t.q.query(ctx, "prof", map[string]any{"code": code}, &data); err != nil {
		return nil, getProfOut{}, err
	}
	if len(data.Prof) == 0 {
		return nil, getProfOut{}, userErr("no professor with code %s; find codes with search_profs", code)
	}
	p := data.Prof[0].prof
	if data.Prof[0].MergedIntoProf != nil {
		p = *data.Prof[0].MergedIntoProf
	}

	var reviews reviewData
	if err := t.q.query(ctx, "prof_reviews", map[string]any{"id": p.ID}, &reviews); err != nil {
		return nil, getProfOut{}, err
	}

	rating := p.Rating
	if rating == nil {
		rating = &ratingSummary{}
	}
	out := getProfOut{
		Name:                 p.Name,
		Code:                 p.Code,
		URL:                  profURL(p.Code),
		Ratings:              ratingsOut{Liked: percent(rating.Liked), Clear: percent(rating.Clear), Engaging: percent(rating.Engaging), Ratings: orZero(rating.FilledCount), Reviews: orZero(rating.CommentCount)},
		ClearDistribution:    distributionOf(p.ProfClearBuckets),
		EngagingDistribution: distributionOf(p.ProfEngagingBuckets),
		CoursesTaught:        []string{},
		ReviewsByCourse:      []courseReviewGroupOut{},
	}
	for _, a := range p.Aliases {
		out.OtherNames = append(out.OtherNames, a.Name)
	}
	for _, pc := range p.ProfCourses {
		if pc.Course != nil {
			out.CoursesTaught = append(out.CoursesTaught, formatCourseCode(pc.Course.Code))
		}
	}

	// Grouped by course id, as useProfReviews does.
	groups := map[int]*reviewGroup{}
	var ids []int
	for _, r := range reviews.Review {
		id, name, courseCode := -1, "", ""
		var liked *float64
		if r.Course != nil {
			id, name, courseCode = r.Course.ID, r.Course.Name, r.Course.Code
			if r.Course.Rating != nil {
				liked = r.Course.Rating.Liked
			}
		}
		g, ok := groups[id]
		if !ok {
			g = &reviewGroup{id: id, name: name, code: courseCode, liked: liked}
			groups[id] = g
			ids = append(ids, id)
		}
		g.reviews = append(g.reviews, withVotes([]review{r}, profVotes)...)
	}
	list := make([]reviewGroup, 0, len(ids))
	for _, id := range ids {
		list = append(list, *groups[id])
	}
	sortGroups(list, courseOrder == "most_liked", func(g reviewGroup) string { return g.code })

	want := normalizeCode(in.Course)
	perCourse := clamp(in.PerCourse, profReviewsShown, 50)
	for _, g := range list {
		if want != "" && g.code != want {
			continue
		}
		sortReviews(g.reviews, order == "most_recent")
		group := courseReviewGroupOut{Code: formatCourseCode(g.code), Name: g.name, Liked: percent(g.liked),
			Reviews: len(g.reviews), URL: courseURL(g.code), Shown: []profReviewOut{}}
		for _, s := range page(g.reviews, 0, perCourse) {
			group.Shown = append(group.Shown, toProfReview(s))
		}
		out.ReviewsByCourse = append(out.ReviewsByCourse, group)
	}
	return nil, out, nil
}
