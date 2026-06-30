package admin

import "testing"

func TestParseUpload(t *testing.T) {
	payload := []byte(`[
		{"term_code": 1265, "data": [
			{"course_code": "CS 135", "instructor": " Jane   Doe, "},
			{"course_code": "cs135", "instructor": "Jane Doe"},
			{"course_code": "MATH 137", "instructor": ""}
		]},
		{"term_code": 1269, "data": [
			{"course_code": "STAT 230", "instructor": "John Smith"}
		]}
	]`)

	got, err := parseUpload(payload)
	if err != nil {
		t.Fatalf("parseUpload returned error: %v", err)
	}

	if got.RowsReceived != 4 {
		t.Fatalf("RowsReceived = %d, want 4", got.RowsReceived)
	}
	// Empty instructor dropped, duplicate CS 135/Jane Doe collapsed -> 2 rows.
	if len(got.TermIDs) != 2 {
		t.Fatalf("rows = %d, want 2", len(got.TermIDs))
	}
	if got.CourseCodes[0] != "cs135" || got.ProfCodes[0] != "jane_doe" || got.ProfNames[0] != "Jane Doe" || got.TermIDs[0] != 1265 {
		t.Fatalf("row 0 = %s/%s/%s/%d", got.CourseCodes[0], got.ProfCodes[0], got.ProfNames[0], got.TermIDs[0])
	}
	if got.CourseCodes[1] != "stat230" || got.ProfCodes[1] != "john_smith" || got.TermIDs[1] != 1269 {
		t.Fatalf("row 1 = %s/%s/%d", got.CourseCodes[1], got.ProfCodes[1], got.TermIDs[1])
	}
}
