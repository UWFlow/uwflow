package mcp

import (
	"encoding/json"
	"strings"
)

// The parts of the frontend queries' responses (queries/) that the tools
// read. Nullable columns are pointers so that "no data" stays distinct from
// zero.

type ratingSummary struct {
	Liked        *float64 `json:"liked"`
	Easy         *float64 `json:"easy"`
	Useful       *float64 `json:"useful"`
	Clear        *float64 `json:"clear"`
	Engaging     *float64 `json:"engaging"`
	FilledCount  *int     `json:"filled_count"`
	CommentCount *int     `json:"comment_count"`
}

type bucket struct {
	Value *int `json:"value"`
	Count *int `json:"count"`
}

type profRef struct {
	ID     int            `json:"id"`
	Code   *string        `json:"code"`
	Name   string         `json:"name"`
	Rating *ratingSummary `json:"rating"`
}

type courseRef struct {
	ID     int            `json:"id"`
	Code   string         `json:"code"`
	Name   string         `json:"name"`
	Rating *ratingSummary `json:"rating"`
}

type meeting struct {
	Days         []string `json:"days"`
	StartDate    string   `json:"start_date"`
	EndDate      string   `json:"end_date"`
	StartSeconds *int     `json:"start_seconds"`
	EndSeconds   *int     `json:"end_seconds"`
	Location     *string  `json:"location"`
	Prof         *profRef `json:"prof"`
	IsClosed     bool     `json:"is_closed"`
	IsCancelled  bool     `json:"is_cancelled"`
	IsTba        bool     `json:"is_tba"`
}

type exam struct {
	Date         *string `json:"date"`
	Day          *string `json:"day"`
	StartSeconds *int    `json:"start_seconds"`
	EndSeconds   *int    `json:"end_seconds"`
	IsTba        bool    `json:"is_tba"`
	Location     *string `json:"location"`
}

type section struct {
	EnrollmentCapacity int       `json:"enrollment_capacity"`
	EnrollmentTotal    int       `json:"enrollment_total"`
	ClassNumber        int       `json:"class_number"`
	SectionName        string    `json:"section_name"`
	TermID             int       `json:"term_id"`
	UpdatedAt          string    `json:"updated_at"`
	Meetings           []meeting `json:"meetings"`
	Exams              []exam    `json:"exams"`
}

type course struct {
	ID          int     `json:"id"`
	Code        string  `json:"code"`
	Name        string  `json:"name"`
	Description *string `json:"description"`
	Aliases     []struct {
		Code string `json:"code"`
	} `json:"aliases"`
	ProfsTeaching []struct {
		Prof *profRef `json:"prof"`
	} `json:"profs_teaching"`
	Sections       []section `json:"sections"`
	Antireqs       *string   `json:"antireqs"`
	Prereqs        *string   `json:"prereqs"`
	Coreqs         *string   `json:"coreqs"`
	Postrequisites []struct {
		Postrequisite *courseRef `json:"postrequisite"`
	} `json:"postrequisites"`
	Rating              *ratingSummary `json:"rating"`
	CourseUsefulBuckets []bucket       `json:"course_useful_buckets"`
	CourseEasyBuckets   []bucket       `json:"course_easy_buckets"`
}

type courseData struct {
	Course      []course `json:"course"`
	CourseAlias []struct {
		Course *course `json:"course"`
	} `json:"course_alias"`
}

type upvotes struct {
	UpvoteCount int `json:"upvote_count"`
}

type author struct {
	FullName *string `json:"full_name"`
	Program  *string `json:"program"`
}

type review struct {
	ID                 int        `json:"id"`
	CreatedAt          string     `json:"created_at"`
	Liked              *int       `json:"liked"`
	CourseComment      *string    `json:"course_comment"`
	CourseEasy         *int       `json:"course_easy"`
	CourseUseful       *int       `json:"course_useful"`
	ProfEngaging       *int       `json:"prof_engaging"`
	ProfComment        *string    `json:"prof_comment"`
	ProfClear          *int       `json:"prof_clear"`
	Author             *author    `json:"author"`
	Course             *courseRef `json:"course"`
	Prof               *profRef   `json:"prof"`
	CourseReviewRating *upvotes   `json:"course_review_rating"`
	ProfReviewRating   *upvotes   `json:"prof_review_rating"`
}

type reviewData struct {
	Review []review `json:"review"`
}

type prof struct {
	ID      int    `json:"id"`
	Name    string `json:"name"`
	Code    string `json:"code"`
	Aliases []struct {
		Name string `json:"name"`
	} `json:"aliases"`
	ProfCourses []struct {
		Course *courseRef `json:"course"`
	} `json:"prof_courses"`
	Rating              *ratingSummary `json:"rating"`
	ProfEngagingBuckets []bucket       `json:"prof_engaging_buckets"`
	ProfClearBuckets    []bucket       `json:"prof_clear_buckets"`
}

type profData struct {
	Prof []struct {
		prof
		MergedIntoProf *prof `json:"merged_into_prof"`
	} `json:"prof"`
}

// pgArray accepts a JSON array or a Postgres array literal ("{a,b}"); the
// frontend's parseCodes handles both for search-index aliases.
type pgArray []string

func (a *pgArray) UnmarshalJSON(b []byte) error {
	var list []string
	if err := json.Unmarshal(b, &list); err == nil {
		*a = list
		return nil
	}
	var literal string
	if err := json.Unmarshal(b, &literal); err != nil {
		return err
	}
	*a = nil
	for _, part := range strings.Split(strings.NewReplacer("{", "", "}", "", `"`, "").Replace(literal), ",") {
		if part != "" {
			*a = append(*a, part)
		}
	}
	return nil
}

type courseSearchRow struct {
	Name                    *string  `json:"name"`
	Code                    *string  `json:"code"`
	Aliases                 pgArray  `json:"aliases"`
	Useful                  *float64 `json:"useful"`
	Terms                   []int    `json:"terms"`
	TermsWithSeats          []int    `json:"terms_with_seats"`
	TermsWithOnlineSections []int    `json:"terms_with_online_sections"`
	Ratings                 *int     `json:"ratings"`
	Liked                   *float64 `json:"liked"`
	Easy                    *float64 `json:"easy"`
}

type profSearchRow struct {
	Name        *string  `json:"name"`
	Code        *string  `json:"code"`
	Clear       *float64 `json:"clear"`
	CourseCodes pgArray  `json:"course_codes"`
	AliasLinks  []struct {
		Name string  `json:"name"`
		Code *string `json:"code"`
	} `json:"alias_links"`
	Engaging *float64 `json:"engaging"`
	Liked    *float64 `json:"liked"`
	Ratings  *int     `json:"ratings"`
}

// exploreData covers both EXPLORE_QUERY (search_*) and EXPLORE_ALL_QUERY
// (*_search_index); only one pair is set per response.
type exploreData struct {
	SearchCourses     []courseSearchRow `json:"search_courses"`
	SearchProfs       []profSearchRow   `json:"search_profs"`
	CourseSearchIndex []courseSearchRow `json:"course_search_index"`
	ProfSearchIndex   []profSearchRow   `json:"prof_search_index"`
}
