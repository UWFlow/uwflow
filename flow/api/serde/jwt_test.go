package serde

import (
	"net/http"
	"testing"
	"time"

	"flow/api/env"

	"github.com/golang-jwt/jwt/v5"
)

// The claims these tests assert on are the whole of the impersonation security
// boundary: Hasura decides what a session may do purely from the role and user
// id inside the token, so a regression here is not a cosmetic one.

func init() {
	env.Global.JwtKey = []byte("test-key-for-jwt-signing")
}

func requestWithToken(token string) *http.Request {
	r, _ := http.NewRequest("GET", "/", nil)
	r.Header.Set("Authorization", "Bearer "+token)
	return r
}

func TestNewSignedJwtIsNotImpersonating(t *testing.T) {
	token, err := NewSignedJwt(42)
	if err != nil {
		t.Fatalf("signing jwt: %s", err)
	}

	claims, err := ClaimsFromRequest(requestWithToken(token))
	if err != nil {
		t.Fatalf("parsing claims: %s", err)
	}

	if claims.Impersonating() {
		t.Error("an ordinary login token reports itself as an impersonation session")
	}
	if claims.Hasura.DefaultRole != UserRole {
		t.Errorf("default role = %q, want %q", claims.Hasura.DefaultRole, UserRole)
	}

	userId, err := claims.UserId()
	if err != nil {
		t.Fatalf("reading user id: %s", err)
	}
	if userId != 42 {
		t.Errorf("user id = %d, want 42", userId)
	}
}

func TestImpersonationJwtActsAsTargetUnderReadOnlyRole(t *testing.T) {
	token, err := NewImpersonationJwt(7, 99)
	if err != nil {
		t.Fatalf("signing impersonation jwt: %s", err)
	}

	claims, err := ClaimsFromRequest(requestWithToken(token))
	if err != nil {
		t.Fatalf("parsing claims: %s", err)
	}

	userId, err := claims.UserId()
	if err != nil {
		t.Fatalf("reading user id: %s", err)
	}
	// The token must act as the target, not the admin: this is what makes every
	// existing row-level Hasura filter resolve to the impersonated account.
	if userId != 7 {
		t.Errorf("user id = %d, want 7 (the impersonation target)", userId)
	}

	if !claims.Impersonating() {
		t.Error("impersonation token does not report itself as one")
	}
	if claims.Impersonator != 99 {
		t.Errorf("impersonator = %d, want 99 (the admin)", claims.Impersonator)
	}
	if claims.Hasura.DefaultRole != ImpersonatedUserRole {
		t.Errorf("default role = %q, want %q", claims.Hasura.DefaultRole, ImpersonatedUserRole)
	}
}

// Hasura lets a client select any role listed in x-hasura-allowed-roles by
// sending an x-hasura-role header. If "user" ever appears alongside
// "impersonated_user", an impersonation session can simply ask for write
// access and Hasura will grant it — the read-only guarantee would be a
// suggestion. This is the single most load-bearing assertion in the package.
func TestImpersonationJwtAllowsOnlyTheReadOnlyRole(t *testing.T) {
	token, err := NewImpersonationJwt(7, 99)
	if err != nil {
		t.Fatalf("signing impersonation jwt: %s", err)
	}

	claims, err := ClaimsFromRequest(requestWithToken(token))
	if err != nil {
		t.Fatalf("parsing claims: %s", err)
	}

	if len(claims.Hasura.AllowedRoles) != 1 {
		t.Fatalf("allowed roles = %v, want exactly one", claims.Hasura.AllowedRoles)
	}
	if claims.Hasura.AllowedRoles[0] != ImpersonatedUserRole {
		t.Errorf("allowed role = %q, want %q", claims.Hasura.AllowedRoles[0], ImpersonatedUserRole)
	}
}

func TestImpersonationJwtExpiresSoonerThanALogin(t *testing.T) {
	if ImpersonationExpirationPeriod >= ExpirationPeriod {
		t.Fatalf(
			"impersonation lifetime (%s) must be shorter than a login's (%s)",
			ImpersonationExpirationPeriod, ExpirationPeriod,
		)
	}

	token, err := NewImpersonationJwt(7, 99)
	if err != nil {
		t.Fatalf("signing impersonation jwt: %s", err)
	}

	claims, err := ClaimsFromRequest(requestWithToken(token))
	if err != nil {
		t.Fatalf("parsing claims: %s", err)
	}

	lifetime := claims.ExpiresAt.Sub(claims.IssuedAt.Time)
	if lifetime != ImpersonationExpirationPeriod {
		t.Errorf("lifetime = %s, want %s", lifetime, ImpersonationExpirationPeriod)
	}
}

func TestExpiredTokenIsRejected(t *testing.T) {
	// Signed the same way a real impersonation token is, but dated so that its
	// one-hour window has already closed.
	issuedAt := time.Now().Add(-2 * time.Hour)
	token, err := signClaims(CombinedClaims{
		RegisteredClaims: jwt.RegisteredClaims{
			IssuedAt:  jwt.NewNumericDate(issuedAt),
			NotBefore: jwt.NewNumericDate(issuedAt),
			ExpiresAt: jwt.NewNumericDate(issuedAt.Add(ImpersonationExpirationPeriod)),
		},
		Hasura: HasuraClaims{
			AllowedRoles: []string{ImpersonatedUserRole},
			DefaultRole:  ImpersonatedUserRole,
			UserId:       "7",
		},
		Impersonator: 99,
	})
	if err != nil {
		t.Fatalf("signing impersonation jwt: %s", err)
	}

	if _, err := ClaimsFromRequest(requestWithToken(token)); err == nil {
		t.Error("an expired token was accepted")
	}
}

func TestTokenSignedWithAnotherKeyIsRejected(t *testing.T) {
	token, err := NewImpersonationJwt(7, 99)
	if err != nil {
		t.Fatalf("signing impersonation jwt: %s", err)
	}

	original := env.Global.JwtKey
	defer func() { env.Global.JwtKey = original }()
	env.Global.JwtKey = []byte("a-completely-different-key")

	if _, err := ClaimsFromRequest(requestWithToken(token)); err == nil {
		t.Error("a token signed with a different key was accepted")
	}
}

func TestRequestWithoutAuthorizationHeaderIsRejected(t *testing.T) {
	r, _ := http.NewRequest("GET", "/", nil)
	if _, err := ClaimsFromRequest(r); err == nil {
		t.Error("a request with no Authorization header was accepted")
	}
}
