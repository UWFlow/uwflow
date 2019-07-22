package parts

import (
	"io/ioutil"
	"path"

	"github.com/jackc/pgx"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"gopkg.in/cheggaaa/pb.v1"

	"github.com/AyushK1/uwflow2.0/backend/mongo-import/convert"
)

type MongoCourseReview struct {
	Comment    string   `bson:"comment"`
	Easiness   *float64 `bson:"easiness"`
	Interest   *float64 `bson:"interest"`
	Usefulness *float64 `bson:"usefulness"`
}

func (r *MongoCourseReview) Empty() bool {
	return r.Comment == "" && r.Easiness == nil && r.Interest == nil && r.Usefulness == nil
}

type MongoProfReview struct {
	Comment string   `bson:"comment"`
	Clarity *float64 `bson:"clarity"`
	Passion *float64 `bson:"passion"`
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

func convertRating(value *float64) interface{} {
	if value == nil {
		return nil
	}
	// Translate from binary to multi-bin (0 1 2 3 4 5)
	// Make translation "soft": map to medium intensity ratings and not extremes
	switch *value {
	case 0.0:
		return 1
	case 1.0:
		return 4
	default:
		return -1 // unreachable
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

func ImportReviews(db *pgx.Conn, rootPath string, idMap *IdentifierMap) error {
	tx, err := db.Begin()
	if err != nil {
		return err
	}
	defer tx.Rollback()

	_, err = tx.Exec("TRUNCATE course_review CASCADE")
	if err != nil {
		return err
	}
	_, err = tx.Exec("TRUNCATE prof_review CASCADE")
	if err != nil {
		return err
	}
	idMap.CourseReview = make(map[primitive.ObjectID]int)
	idMap.ProfReview = make(map[primitive.ObjectID]int)
	reviews := readMongoReviews(rootPath)

	preparedCourseReviews := make([][]interface{}, 0, len(reviews))
	preparedProfReviews := make([][]interface{}, 0, len(reviews))
  preparedUserCourses := make([][]interface{}, 0, len(reviews))

	bar := pb.StartNew(len(reviews))
	courseReviewId, profReviewId := 1, 1
	for _, review := range reviews {
		bar.Increment()

		courseId, courseFound := idMap.Course[review.CourseId]
		var profId int
		var profFound bool
		if review.ProfId != nil {
			profId, profFound = idMap.Prof[*(review.ProfId)]
		} else {
			profFound = false
		}

		if courseFound && !review.CourseReview.Empty() {
			preparedCourseReviews = append(
				preparedCourseReviews,
				[]interface{}{
					courseReviewId,
					courseId,
					nilIfZero(profId),
					idMap.User[review.UserId],
					nilIfEmpty(review.CourseReview.Comment),
					convertRating(review.CourseReview.Easiness),
					convertRating(review.CourseReview.Interest),
					convertRating(review.CourseReview.Usefulness),
				},
			)
			idMap.CourseReview[review.Id] = courseReviewId
			courseReviewId += 1
		}

		if courseFound && profFound && !review.ProfReview.Empty() {
			preparedProfReviews = append(
				preparedProfReviews,
				[]interface{}{
					profReviewId,
					courseId,
					profId,
					idMap.User[review.UserId],
					nilIfEmpty(review.ProfReview.Comment),
					convertRating(review.ProfReview.Clarity),
					convertRating(review.ProfReview.Passion),
				},
			)
			idMap.ProfReview[review.Id] = profReviewId
			profReviewId += 1
		}

    if courseFound {
      termId, _ := convert.MongoToPostgresTerm(review.TermId)
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
		pgx.Identifier{"course_review"},
		[]string{"id", "course_id", "prof_id", "user_id", "text", "easy", "liked", "useful"},
		pgx.CopyFromRows(preparedCourseReviews),
	)
	if err != nil {
		return err
	}
	_, err = tx.CopyFrom(
		pgx.Identifier{"prof_review"},
		[]string{"id", "course_id", "prof_id", "user_id", "text", "clear", "engaging"},
		pgx.CopyFromRows(preparedProfReviews),
	)
	if err != nil {
		return err
	}
  _, err = tx.CopyFrom(
    pgx.Identifier{"user_course_taken"},
    []string{"course_id", "user_id", "term", "level"},
    pgx.CopyFromRows(preparedUserCourses),
  )
	if err != nil {
		return err
	}
	err = tx.Commit()
	if err != nil {
		return err
	}
	bar.FinishPrint("Importing course reviews finished")
	return nil
}
