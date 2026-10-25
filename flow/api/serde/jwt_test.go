package serde

import (
	"flow/api/env"
	"github.com/golang-jwt/jwt/v5"
	"net/http/httptest"
	"testing"
	"time"
)

func TestUserIdFromRequest(t *testing.T) {
	old := env.Global.JwtKey
	env.Global.JwtKey = []byte("test-signing-key-not-used-outside-tests")
	defer func() { env.Global.JwtKey = old }()
	for _, tc := range []struct {
		name, id, scheme string
		method           jwt.SigningMethod
		expiry           *jwt.NumericDate
		valid            bool
	}{
		{"valid", "42", "Bearer ", jwt.SigningMethodHS256, jwt.NewNumericDate(time.Now().Add(time.Hour)), true},
		{"missing expiry", "42", "Bearer ", jwt.SigningMethodHS256, nil, false},
		{"expired", "42", "Bearer ", jwt.SigningMethodHS256, jwt.NewNumericDate(time.Now().Add(-time.Hour)), false},
		{"wrong algorithm", "42", "Bearer ", jwt.SigningMethodHS384, jwt.NewNumericDate(time.Now().Add(time.Hour)), false},
		{"raw token", "42", "", jwt.SigningMethodHS256, jwt.NewNumericDate(time.Now().Add(time.Hour)), false},
		{"invalid identity", "0", "Bearer ", jwt.SigningMethodHS256, jwt.NewNumericDate(time.Now().Add(time.Hour)), false},
	} {
		t.Run(tc.name, func(t *testing.T) {
			claims := CombinedClaims{Hasura: HasuraClaims{UserId: tc.id}, RegisteredClaims: jwt.RegisteredClaims{ExpiresAt: tc.expiry}}
			token, err := jwt.NewWithClaims(tc.method, claims).SignedString(env.Global.JwtKey)
			if err != nil {
				t.Fatal(err)
			}
			r := httptest.NewRequest("GET", "/", nil)
			r.Header.Set("Authorization", tc.scheme+token)
			id, err := UserIdFromRequest(r)
			if (err == nil) != tc.valid || (tc.valid && id != 42) {
				t.Fatalf("id=%d err=%v", id, err)
			}
		})
	}
	r := httptest.NewRequest("GET", "/", nil)
	r.Header["Authorization"] = []string{}
	if _, err := UserIdFromRequest(r); err == nil {
		t.Fatal("accepted empty authorization")
	}
}
