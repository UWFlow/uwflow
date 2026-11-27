package mcp

import (
	"context"
	"regexp"
	"sort"
	"strings"
	"time"
)

// Ported from frontend/src/pages/explorePage/ExplorePage.tsx and
// SearchResults.tsx. Filters and sorting run on the rows the query returns,
// exactly where the page runs them.

const maxSearchTerms = 10 // MAX_SEARCH_TERMS, constants/Search.tsx

var searchPunctuation = regexp.MustCompile("[`~!@#$%^&*()_|+\\-=?;:'\",.<>{}\\[\\]\\\\/]")

// processRawQuery mirrors the page's function of the same name. The site
// sends code-only text raw, where % and _ act as ILIKE wildcards; those two
// are removed here.
func processRawQuery(query string, codeOnly bool) string {
	if query == "" {
		return ""
	}
	if codeOnly {
		return strings.NewReplacer("%", "", "_", "").Replace(query)
	}
	cleaned := searchPunctuation.ReplaceAllString(strings.Replace(strings.ToLower(query), "-", " ", 1), "")
	var terms []string
	for _, term := range strings.Split(cleaned, " ") {
		term = strings.TrimSpace(term)
		if term == "" {
			continue
		}
		terms = append(terms, term+":*")
		if len(terms) == maxSearchTerms {
			break
		}
	}
	return strings.Join(terms, " & ")
}

// fetchExplore sends EXPLORE_QUERY, or EXPLORE_ALL_QUERY when the processed
// query is empty. The site picks the query from the processed text but its
// result handling from the raw text, which crashes on punctuation-only
// input; here both follow the processed text.
func fetchExplore(ctx context.Context, q querier, query string, codeOnly bool) ([]courseSearchRow, []profSearchRow, error) {
	processed := processRawQuery(query, codeOnly)
	var data exploreData
	if processed == "" {
		if err := q.query(ctx, "explore_all", nil, &data); err != nil {
			return nil, nil, err
		}
		return data.CourseSearchIndex, data.ProfSearchIndex, nil
	}
	vars := map[string]any{"query": processed, "code_only": codeOnly}
	if err := q.query(ctx, "explore", vars, &data); err != nil {
		return nil, nil, err
	}
	return data.SearchCourses, data.SearchProfs, nil
}

// pickDisplayCode mirrors the page: show the code (or alias) the user typed.
func pickDisplayCode(codes []string, query string) string {
	searched := strings.ToLower(strings.Join(strings.Fields(query), ""))
	if searched == "" {
		return codes[0]
	}
	for _, code := range codes {
		if strings.HasPrefix(code, searched) {
			return code
		}
	}
	for _, code := range codes {
		if strings.HasPrefix(searched, code[:subjectEnd(code)]) {
			return code
		}
	}
	return codes[0]
}

// subjectEnd is the index of the first digit, matching code.replace(/\d+.*$/, ”).
func subjectEnd(code string) int {
	for i := 0; i < len(code); i++ {
		if isDigit(code[i]) {
			return i
		}
	}
	return len(code)
}

// matchesLevel mirrors the page's level regex, a letter followed by the
// level digit anywhere in the code, except that 5XX+ also covers 9XX
// (the page's [5-8] hides 900-level courses despite its "5XX+" label).
func matchesLevel(code string, levels map[int]bool) bool {
	for i := 1; i < len(code); i++ {
		if !isDigit(code[i]) || !(isLetter(code[i-1]) || code[i-1] == '|') {
			continue
		}
		d := int(code[i] - '0')
		if d >= 5 {
			d = 5
		}
		if levels[d] {
			return true
		}
	}
	return false
}

func contains(list []int, v int) bool {
	for _, x := range list {
		if x == v {
			return true
		}
	}
	return false
}

func orZero(v *int) int {
	if v == nil {
		return 0
	}
	return *v
}

type courseFilter struct {
	Levels           map[int]bool
	MinRatings       int
	ThisTerm         bool
	NextTerm         bool
	HasRoom          bool
	HasOnlineSection bool
}

// keep mirrors filteredCourses in SearchResults.tsx.
func (f courseFilter) keep(row courseSearchRow, code string, now time.Time) bool {
	current := currentTerm(now)
	next := nextTerm(current)
	required := 0
	switch {
	case f.ThisTerm:
		required = current
	case f.NextTerm:
		required = next
	}
	inRequired := func(terms []int) bool { return required == 0 || contains(terms, required) }
	return matchesLevel(code, f.Levels) &&
		orZero(row.Ratings) >= f.MinRatings &&
		(!f.ThisTerm || contains(row.Terms, current)) &&
		(!f.NextTerm || contains(row.Terms, next)) &&
		(!f.HasRoom || inRequired(row.TermsWithSeats)) &&
		(!f.HasOnlineSection || inRequired(row.TermsWithOnlineSections))
}

// sortValue holds a row's value for the chosen column; nil sorts last.
type sortValue struct {
	num  *float64
	text *string
}

func numValue(v *float64) sortValue { return sortValue{num: v} }
func intValue(v *int) sortValue {
	if v == nil {
		return sortValue{}
	}
	f := float64(*v)
	return sortValue{num: &f}
}
func textValue(s string) sortValue { return sortValue{text: &s} }

// less mirrors compare() in SearchResults.tsx with desc=false, the state a
// first click on a column header leaves: numbers high to low, text A to Z,
// missing values last. reverse gives the second click.
func less(a, b sortValue, reverse bool) bool {
	aNil := a.num == nil && a.text == nil
	bNil := b.num == nil && b.text == nil
	if aNil || bNil {
		return !aNil && bNil
	}
	if a.text != nil && b.text != nil {
		x, y := strings.ToLower(*a.text), strings.ToLower(*b.text)
		if reverse {
			return x > y
		}
		return x < y
	}
	if reverse {
		return *a.num < *b.num
	}
	return *a.num > *b.num
}

func sortRows[T any](rows []T, value func(T) sortValue, reverse bool) {
	sort.SliceStable(rows, func(i, j int) bool { return less(value(rows[i]), value(rows[j]), reverse) })
}

func page[T any](rows []T, offset, limit int) []T {
	if offset >= len(rows) {
		return []T{}
	}
	end := offset + limit
	if end > len(rows) {
		end = len(rows)
	}
	return rows[offset:end]
}
