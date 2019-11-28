package parts

import (
	"io/ioutil"
	"path"
	"time"

	"flow/common/db"
	"flow/common/state"
	"flow/common/util"
	"flow/importer/mongo/data"
	"flow/importer/mongo/log"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

// This is the only value of Privacy for which the review is public
const Public int = 2

type MongoCourseReview struct {
	Comment         string     `bson:"comment"`
	Easiness        *float64   `bson:"easiness"`
	Interest        *float64   `bson:"interest"`
	Usefulness      *float64   `bson:"usefulness"`
	Privacy         int        `bson:"privacy"`
	NumVotedHelpful int        `bson:"num_voted_helpful"`
	CommentDate     *time.Time `bson:"comment_date"`
	RatingDate      *time.Time `bson:"rating_change_date"`
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
	ProfId       string             `bson:"professor_id"`
	ProfReview   MongoProfReview    `bson:"professor_review"`
	TermId       string             `bson:"term_id"`
	LevelId      *string            `bson:"program_year_id"`
}

func (r *MongoReview) Empty() bool {
	return r.CourseReview.Empty() && r.ProfReview.Empty()
}

// Translate from binary to binned: (0 1) for liked or (0 1 2 3 4 5) for others.
// We typically want to make the translation "soft" by mapping
// to medium intensity ratings and not extremes (e.g. false -> 1, true -> 4).
func rescaledRating(value *float64, falseValue, trueValue int16) *int16 {
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
	log.StartImport(state.Log, "review")
	log.StartImport(state.Log, "course_review_upvote")
	log.StartImport(state.Log, "user_course_taken")
	log.StartImport(state.Log, "user_shortlist")

	tx, err := state.Db.Begin()
	if err != nil {
		return err
	}
	defer tx.Rollback()

	idMap.Review = make(map[primitive.ObjectID]int)
	mongoReviews := readMongoReviews(state.Env.MongoDumpPath)
	// Unfortunately, we did not enforce uniqueness in 1.0
	seenCourseAndUser := make(map[IntPair]bool)

	var preparedReviews [][]interface{}
	var preparedUserCourses [][]interface{}
	var preparedCourseUpvotes [][]interface{}
	var preparedUserShortlists [][]interface{}

	var review data.Review
	reviewId := 1
	for _, mongoReview := range mongoReviews {
		courseId, courseFound := idMap.Course[mongoReview.CourseId]
		if !courseFound {
			continue
		}

		profId := idMap.Prof[mongoReview.ProfId]
		userId := idMap.User[mongoReview.UserId]
		seen := seenCourseAndUser[IntPair{courseId, userId}]

		if !seen && !mongoReview.Empty() {
			courseReview := &mongoReview.CourseReview
			profReview := &mongoReview.ProfReview

			courseCreated, courseUpdated := sortedTimes(
				courseReview.CommentDate,
				courseReview.RatingDate,
			)
			profCreated, profUpdated := sortedTimes(
				profReview.CommentDate,
				profReview.RatingDate,
			)
			created, _ := sortedTimes(courseCreated, profCreated)
			_, updated := sortedTimes(courseUpdated, profUpdated)

			seenCourseAndUser[IntPair{courseId, userId}] = true
			idMap.Review[mongoReview.Id] = reviewId

			review = data.Review{
				CourseId:      courseId,
				ProfId:        util.NilIfZero(profId),
				UserId:        userId,
				Liked:         rescaledRating(courseReview.Interest, 0, 1),
				CourseEasy:    rescaledRating(courseReview.Easiness, 1, 4),
				CourseUseful:  rescaledRating(courseReview.Usefulness, 1, 4),
				CourseComment: util.NilIfEmpty(courseReview.Comment),
				ProfClear:     rescaledRating(profReview.Clarity, 1, 4),
				ProfEngaging:  rescaledRating(profReview.Passion, 1, 4),
				ProfComment:   util.NilIfEmpty(profReview.Comment),
				Public:        courseReview.Privacy == Public,
				CreatedAt:     created,
				UpdatedAt:     updated,
			}
			preparedReviews = append(preparedReviews, util.AsSlice(review))

			for i := 0; i < courseReview.NumVotedHelpful; i++ {
				preparedCourseUpvotes = append(preparedCourseUpvotes, []interface{}{reviewId, nil})
			}

			reviewId += 1
		}

		if mongoReview.TermId == "9999_99" {
			preparedUserShortlists = append(
				preparedUserShortlists,
				[]interface{}{
					courseId,
					userId,
				},
			)
		} else {
			termId, _ := util.TermYearMonthToId(mongoReview.TermId)
			preparedUserCourses = append(
				preparedUserCourses,
				[]interface{}{
					courseId,
					userId,
					termId,
					mongoReview.LevelId,
				},
			)
		}
	}

	takenCount, err := tx.CopyFrom(
		db.Identifier{"user_course_taken"},
		[]string{"course_id", "user_id", "term_id", "level"},
		preparedUserCourses,
	)
	if err != nil {
		return err
	}
	log.EndImport(state.Log, "user_course_taken", takenCount)

	shortlistCount, err := tx.CopyFrom(
		db.Identifier{"user_shortlist"},
		[]string{"course_id", "user_id"},
		preparedUserShortlists,
	)
	if err != nil {
		return err
	}
	log.EndImport(state.Log, "user_shortlist", shortlistCount)

	reviewCount, err := tx.CopyFrom(
		db.Identifier{"review"},
		util.Fields(review),
		preparedReviews,
	)
	if err != nil {
		return err
	}
	log.EndImport(state.Log, "review", reviewCount)

	courseUpvoteCount, err := tx.CopyFrom(
		db.Identifier{"course_review_upvote"},
		[]string{"review_id", "user_id"},
		preparedCourseUpvotes,
	)
	if err != nil {
		return err
	}
	log.EndImport(state.Log, "course_review_upvote", courseUpvoteCount)

	return tx.Commit()
}
