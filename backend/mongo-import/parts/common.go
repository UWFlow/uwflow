package parts

import "go.mongodb.org/mongo-driver/bson/primitive"

type IdentifierMap struct {
  Course map[string]int
  Prof map[string]int
  User map[primitive.ObjectID]int
  CourseReview map[primitive.ObjectID]int
  ProfReview map[primitive.ObjectID]int
}

