package mcp

import (
	"sort"
	"strings"
	"time"
)

// Ported from frontend/src/utils/Review.tsx, hooks/useCourseReviews.tsx,
// hooks/useProfReviews.tsx and the review components.

const (
	courseReviewsShown = 8 // MIN_REVIEWS_SHOWN_COURSE, constants/PageConstants.tsx
	profReviewsShown   = 3 // MIN_REVIEWS_SHOWN_PROF
)

type sortedReview struct {
	review  review
	upvotes int
	created time.Time
}

// sortReviews mirrors sortReviews for a logged-out visitor: by time with
// upvotes breaking ties, or by upvotes with time breaking ties.
func sortReviews(reviews []sortedReview, byTime bool) {
	sort.SliceStable(reviews, func(i, j int) bool {
		a, b := reviews[i], reviews[j]
		timeDiff := b.created.Sub(a.created)
		votesDiff := b.upvotes - a.upvotes
		switch {
		case timeDiff == 0:
			return votesDiff < 0
		case votesDiff == 0, byTime:
			return timeDiff < 0
		default:
			return votesDiff < 0
		}
	})
}

func withVotes(reviews []review, votes func(review) *upvotes) []sortedReview {
	out := make([]sortedReview, 0, len(reviews))
	for _, r := range reviews {
		s := sortedReview{review: r}
		if v := votes(r); v != nil {
			s.upvotes = v.UpvoteCount
		}
		s.created, _ = parseTimestamp(r.CreatedAt)
		out = append(out, s)
	}
	return out
}

func courseVotes(r review) *upvotes { return r.CourseReviewRating }
func profVotes(r review) *upvotes   { return r.ProfReviewRating }

type courseReviewOut struct {
	Comment  string `json:"comment"`
	Liked    *bool  `json:"liked,omitempty" jsonschema:"thumbs up (true) or down (false)"`
	Easy     *int   `json:"easy,omitempty" jsonschema:"1 to 5"`
	Useful   *int   `json:"useful,omitempty" jsonschema:"1 to 5"`
	Prof     string `json:"prof,omitempty" jsonschema:"who taught the reviewer"`
	ProfCode string `json:"prof_code,omitempty"`
	Author   string `json:"author"`
	Date     string `json:"date,omitempty" jsonschema:"YYYY-MM-DD; absent for reviews from before 2012, as on the website"`
	Upvotes  int    `json:"upvotes"`
}

type profReviewOut struct {
	Comment  string `json:"comment"`
	Clear    *int   `json:"clear,omitempty" jsonschema:"1 to 5"`
	Engaging *int   `json:"engaging,omitempty" jsonschema:"1 to 5"`
	Author   string `json:"author"`
	Date     string `json:"date,omitempty" jsonschema:"YYYY-MM-DD; absent for reviews from before 2012, as on the website"`
	Upvotes  int    `json:"upvotes"`
}

func likedBool(v *int) *bool {
	if v == nil {
		return nil
	}
	b := *v == 1
	return &b
}

func toCourseReview(s sortedReview) courseReviewOut {
	r := s.review
	out := courseReviewOut{
		Comment: deref(r.CourseComment),
		Liked:   likedBool(r.Liked),
		Easy:    scale(r.CourseEasy),
		Useful:  scale(r.CourseUseful),
		Author:  authorLine(r.Author),
		Date:    reviewDate(r.CreatedAt),
		Upvotes: s.upvotes,
	}
	if r.Prof != nil {
		out.Prof, out.ProfCode = r.Prof.Name, deref(r.Prof.Code)
	}
	return out
}

func toProfReview(s sortedReview) profReviewOut {
	r := s.review
	return profReviewOut{
		Comment:  deref(r.ProfComment),
		Clear:    scale(r.ProfClear),
		Engaging: scale(r.ProfEngaging),
		Author:   authorLine(r.Author),
		Date:     reviewDate(r.CreatedAt),
		Upvotes:  s.upvotes,
	}
}

// reviewGroup is one prof's reviews on a course page, or one course's
// reviews on a prof page.
type reviewGroup struct {
	id          int
	name        string
	code        string
	liked       *float64
	reviews     []sortedReview
	reviewCount int // shown when reviews is empty: a teaching prof with none here
}

// sortGroups mirrors sortByReviews and sortByLiked (utils/Review.tsx).
func sortGroups(groups []reviewGroup, byLiked bool, tieKey func(reviewGroup) string) {
	byReviews := func(a, b reviewGroup) bool {
		if len(a.reviews) != len(b.reviews) {
			return len(a.reviews) > len(b.reviews)
		}
		return strings.ToLower(tieKey(a)) < strings.ToLower(tieKey(b))
	}
	sort.SliceStable(groups, func(i, j int) bool {
		a, b := groups[i], groups[j]
		if !byLiked {
			return byReviews(a, b)
		}
		switch {
		case a.liked == nil && b.liked == nil, a.liked != nil && b.liked != nil && *a.liked == *b.liked:
			return byReviews(a, b)
		case a.liked == nil:
			return false
		case b.liked == nil:
			return true
		default:
			return *a.liked > *b.liked
		}
	})
}
