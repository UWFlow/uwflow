package db

// Result of a database operation
type Result struct {
  // Rows that were first added to the database during this operation
  Inserted int
  // Rows that were present and got updated
  Updated int
  // Rows that were present and did not merit an update
  Untouched int
  // Rows that were found inadmissible:
  // broken invariants, missing join dependencies etc.
  Rejected int
}
