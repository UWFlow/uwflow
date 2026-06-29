package admin

import (
	"strings"
	"testing"
)

func TestDecodeAndValidateMultiTermPayload(t *testing.T) {
	body := `[
  {
    "term_code": 1265,
    "term_name": "Spring 2026",
    "data": [
      {
        "course_code": "acc610",
        "course_id": 7,
        "instructor": "Lisa Pynenburg",
        "scraped_at": "2026-06-16 08:47 PM"
      },
      {
        "course_code": "acc610",
        "course_id": 7,
        "instructor": "Lisa Pynenburg",
        "scraped_at": "2026-06-17 08:47 PM"
      }
    ]
  },
  {
    "term_code": 1261,
    "term_name": "Winter 2026",
    "data": [
      {
        "course_code": "acc606",
        "course_id": 3,
        "instructor": "Wayne Chang",
        "scraped_at": "2026-06-16 08:47 PM"
      }
    ]
  }
]`

	payload, details, err := decodeAndValidate(strings.NewReader(body))
	if err != nil {
		t.Fatalf("decodeAndValidate returned error: %v", err)
	}
	if len(details) != 0 {
		t.Fatalf("validation details = %#v, want none", details)
	}
	if payload.recordsReceived != 3 {
		t.Fatalf("records received = %d, want 3", payload.recordsReceived)
	}
	if len(payload.records) != 2 {
		t.Fatalf("unique records = %d, want 2", len(payload.records))
	}
	if len(payload.terms) != 2 {
		t.Fatalf("terms = %d, want 2", len(payload.terms))
	}
	if got := payload.records[0].scrapedAt.Format(scrapedAtLayout); got != "2026-06-17 08:47 PM" {
		t.Fatalf("duplicate retained scraped_at %q, want latest value", got)
	}
}

func TestDecodeAndValidateCollectsFieldErrors(t *testing.T) {
	body := `[
  {
    "term_name": " ",
    "data": [
      {
        "course_code": "ACC 610",
        "instructor": " ",
        "scraped_at": "2026-13-16 08:47 PM"
      }
    ]
  }
]`

	_, details, err := decodeAndValidate(strings.NewReader(body))
	if err != nil {
		t.Fatalf("decodeAndValidate returned error: %v", err)
	}

	wantPaths := map[string]bool{
		"$[0].term_code":           false,
		"$[0].term_name":           false,
		"$[0].data[0].course_code": false,
		"$[0].data[0].course_id":   false,
		"$[0].data[0].instructor":  false,
		"$[0].data[0].scraped_at":  false,
	}
	for _, detail := range details {
		if _, ok := wantPaths[detail.Path]; ok {
			wantPaths[detail.Path] = true
		}
	}
	for path, found := range wantPaths {
		if !found {
			t.Errorf("missing validation error for %s; got %#v", path, details)
		}
	}
}

func TestDecodeAndValidateRejectsInvalidJSONShapes(t *testing.T) {
	tests := []struct {
		name string
		body string
		want string
	}{
		{name: "top-level object", body: `{}`, want: "cannot unmarshal object"},
		{name: "top-level null", body: `null`, want: "top-level value must be an array"},
		{
			name: "unknown field",
			body: `[{"term_code":1265,"term_name":"Spring 2026","data":[],"extra":true}]`,
			want: "unknown field",
		},
		{name: "multiple values", body: `[] []`, want: "exactly one JSON value"},
	}

	for _, test := range tests {
		t.Run(test.name, func(t *testing.T) {
			_, _, err := decodeAndValidate(strings.NewReader(test.body))
			if err == nil || !strings.Contains(err.Error(), test.want) {
				t.Fatalf("error = %v, want substring %q", err, test.want)
			}
		})
	}
}

func TestDecodeAndValidateRejectsConflictingCourseCodes(t *testing.T) {
	body := `[
  {
    "term_code": 1265,
    "term_name": "Spring 2026",
    "data": [
      {"course_code":"acc610","course_id":7,"instructor":"One Prof","scraped_at":"2026-06-16 08:47 PM"},
      {"course_code":"cs135","course_id":7,"instructor":"Other Prof","scraped_at":"2026-06-16 08:47 PM"}
    ]
  }
]`

	_, details, err := decodeAndValidate(strings.NewReader(body))
	if err != nil {
		t.Fatalf("decodeAndValidate returned error: %v", err)
	}
	if len(details) != 1 || details[0].Path != "$[0].data[1].course_code" {
		t.Fatalf("validation details = %#v, want conflicting course code", details)
	}
}

func TestDecodeAndValidateAcceptsEmptyArray(t *testing.T) {
	payload, details, err := decodeAndValidate(strings.NewReader(`[]`))
	if err != nil || len(details) != 0 || len(payload.records) != 0 {
		t.Fatalf("empty array result = (%#v, %#v, %v), want valid no-op", payload, details, err)
	}
}
