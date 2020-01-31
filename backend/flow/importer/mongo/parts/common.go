package parts

import (
	"flow/importer/mongo/data"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type IntPair struct {
	First  int
	Second int
}

// This is an IntPair with additional meaning of components.
// It is best to write it this way to not mix up the order,
// as its use crosses the file boundary.
type SectionKey struct {
	ClassNumber int
	TermId      int
}

type IdentifierMap struct {
	Course     map[string]int
	Prof       map[string]int
	ProfRename map[string]data.ProfRename
	User       map[primitive.ObjectID]int
	Review     map[primitive.ObjectID]int
	Section    map[SectionKey]int
}
