package auth

import "testing"

func TestIsAllowedSignupEmail(t *testing.T) {
	for _, tc := range []struct {
		email   *string
		allowed bool
	}{
		{strPtr("j2smith@uwaterloo.ca"), true},
		{strPtr("  J2Smith@UWaterloo.CA "), true},
		{strPtr("someone@gmail.com"), false},
		{strPtr("someone@uwaterloo.ca.evil.com"), false},
		{strPtr("someone@notuwaterloo.ca"), false},
		{strPtr("uwaterloo.ca"), false},
		{strPtr(""), false},
		{nil, false},
	} {
		if got := isAllowedSignupEmail(tc.email); got != tc.allowed {
			t.Errorf("isAllowedSignupEmail(%v) = %v, want %v", deref(tc.email), got, tc.allowed)
		}
	}
}

func strPtr(s string) *string { return &s }

func deref(s *string) string {
	if s == nil {
		return "<nil>"
	}
	return *s
}
