package parts

import (
	"io/ioutil"
	"path"
	"time"

	"flow/common/db"
	"flow/common/state"
	"flow/common/util"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

type MongoCourseReview struct {
	Comment     string     `bson:"comment"`
	Easiness    *float64   `bson:"easiness"`
	Interest    *float64   `bson:"interest"`
	Usefulness  *float64   `bson:"usefulness"`
	Privacy     int        `bson:"privacy"`
	CommentDate *time.Time `bson:"comment_date"`
	RatingDate  *time.Time `bson:"rating_change_date"`
}

func (r *MongoCourseReview) Empty() bool {
	return r.Comment == "" && r.Easiness == nil && r.Interest == nil && r.Usefulness == nil
}

type MongoProfReview struct {
	Comment     string     `bson:"comment"`
	Clarity     *float64   `bson:"clarity"`
	Passion     *float64   `bson:"passion"`
	Privacy     int        `bson:"privacy"`
	CommentDate *time.Time `bson:"comment_date"`
	RatingDate  *time.Time `bson:"rating_change_date"`
}

func (r *MongoProfReview) Empty() bool {
	return r.Comment == "" && r.Clarity == nil && r.Passion == nil
}

type MongoReview struct {
	Id           primitive.ObjectID `bson:"_id"`
	UserId       primitive.ObjectID `bson:"user_id"`
	CourseId     string             `bson:"course_id"`
	CourseReview MongoCourseReview  `bson:"course_review"`
	ProfId       *string            `bson:"professor_id"`
	ProfReview   MongoProfReview    `bson:"professor_review"`
	TermId       string             `bson:"term_id"`
	LevelId      *string            `bson:"program_year_id"`
}

// This is the only value of Privacy for which the review is public
const Public = 2

// Translate from binary to binned: (0 1) for liked or (0 1 2 3 4 5) for others.
// We typically want to make the translation "soft" by mapping
// to medium intensity ratings and not extremes (e.g. false -> 1, true -> 4).
func convertRating(value *float64, falseValue, trueValue int16) *int16 {
	if value == nil {
		return nil
	}
	switch *value {
	case 0.0:
		return &falseValue
	case 1.0:
		return &trueValue
	default:
		return nil // unreachable
	}
}

func sortedTimes(first *time.Time, second *time.Time) (*time.Time, *time.Time) {
	if first == nil {
		return second, second
	}
	if second == nil {
		return first, first
	}
	if (*first).Before(*second) {
		return first, second
	} else {
		return second, first
	}
}

func nilIfZero(value int) *int {
	if value == 0 {
		return nil
	} else {
		return &value
	}
}

func nilIfEmpty(value string) *string {
	if value == "" {
		return nil
	} else {
		return &value
	}
}

func readMongoReviews(rootPath string) []MongoReview {
	data, err := ioutil.ReadFile(path.Join(rootPath, "user_course.bson"))
	if err != nil {
		panic(err)
	}

	var reviews []MongoReview
	for len(data) > 0 {
		var r bson.Raw
		var m MongoReview
		bson.Unmarshal(data, &r)
		bson.Unmarshal(r, &m)
		reviews = append(reviews, m)
		data = data[len(r):]
	}
	return reviews
}

func ImportReviews(state *state.State, idMap *IdentifierMap) error {
	tx, err := state.Db.Begin()
	if err != nil {
		return err
	}
	defer tx.Rollback()

	idMap.CourseReview = make(map[primitive.ObjectID]int)
	idMap.ProfReview = make(map[primitive.ObjectID]int)
	reviews := readMongoReviews(state.Env.MongoDumpPath)

	var preparedCourseReviews [][]interface{}
	var preparedProfReviews [][]interface{}
	var preparedUserCourses [][]interface{}
	var preparedUserShortlists [][]interface{}

	courseReviewId, profReviewId := 1, 1
	for _, review := range reviews {
		courseId, courseFound := idMap.Course[review.CourseId]
		if !courseFound {
			continue
		}

		var profId int
		var profFound bool
		if review.ProfId != nil {
			profId, profFound = idMap.Prof[*(review.ProfId)]
		} else {
			profFound = false
		}

		if !review.CourseReview.Empty() {
			courseReview := &review.CourseReview
			created, updated := sortedTimes(courseReview.CommentDate, courseReview.RatingDate)
			preparedCourseReviews = append(
				preparedCourseReviews,
				[]interface{}{
					courseId,
					nilIfZero(profId),
					idMap.User[review.UserId],
					nilIfEmpty(courseReview.Comment),
					convertRating(courseReview.Easiness, 1, 4),
					convertRating(courseReview.Interest, 0, 1),
					convertRating(courseReview.Usefulness, 1, 4),
					courseReview.Privacy == Public,
					created,
					updated,
				},
			)
			idMap.CourseReview[review.Id] = courseReviewId
			courseReviewId += 1
		}

		if profFound && !review.ProfReview.Empty() {
			profReview := &review.ProfReview
			created, updated := sortedTimes(profReview.CommentDate, profReview.RatingDate)
			preparedProfReviews = append(
				preparedProfReviews,
				[]interface{}{
					courseId,
					profId,
					idMap.User[review.UserId],
					nilIfEmpty(profReview.Comment),
					convertRating(profReview.Clarity, 1, 4),
					convertRating(profReview.Passion, 1, 4),
					profReview.Privacy == Public,
					created,
					updated,
				},
			)
			idMap.ProfReview[review.Id] = profReviewId
			profReviewId += 1
		}

		if review.TermId == "9999_99" {
			preparedUserShortlists = append(
				preparedUserShortlists,
				[]interface{}{
					courseId,
					idMap.User[review.UserId],
				},
			)
		} else {
			termId, _ := util.TermYearMonthToId(review.TermId)
			preparedUserCourses = append(
				preparedUserCourses,
				[]interface{}{
					courseId,
					idMap.User[review.UserId],
					termId,
					review.LevelId,
				},
			)
		}
	}

	_, err = tx.CopyFrom(
		db.Identifier{"course_review"},
		[]string{
			"course_id", "prof_id", "user_id", "text", "easy", "liked", "useful",
			"public", "created_at", "updated_at",
		},
		preparedCourseReviews,
	)
	if err != nil {
		return err
	}
	_, err = tx.CopyFrom(
		db.Identifier{"prof_review"},
		[]string{
			"course_id", "prof_id", "user_id", "text", "clear", "engaging",
			"public", "created_at", "updated_at",
		},
		preparedProfReviews,
	)
	if err != nil {
		return err
	}
	_, err = tx.CopyFrom(
		db.Identifier{"user_course_taken"},
		[]string{"course_id", "user_id", "term", "level"},
		preparedUserCourses,
	)
	if err != nil {
		return err
	}
	_, err = tx.CopyFrom(
		db.Identifier{"user_shortlist"},
		[]string{"course_id", "user_id"},
		preparedUserShortlists,
	)
	if err != nil {
		return err
	}

	return tx.Commit()
}
