package serde

import (
	"errors"
	"fmt"
	"net/http"
	"strconv"
	"strings"
	"time"

	"flow/api/env"

	"github.com/golang-jwt/jwt/v5"
)

// Hasura roles this API mints tokens for.
const (
	// The role every ordinary session runs as: full read/write over the rows
	// belonging to x-hasura-user-id.
	UserRole = "user"
	// The role an admin's impersonation session runs as. Its Hasura
	// permissions mirror UserRole's select permissions exactly and grant no
	// insert/update/delete, so an impersonated session can look at everything
	// the user sees but cannot write anything to their account.
	ImpersonatedUserRole = "impersonated_user"
)

type HasuraClaims struct {
	AllowedRoles []string `json:"x-hasura-allowed-roles"`
	DefaultRole  string   `json:"x-hasura-default-role"`
	UserId       string   `json:"x-hasura-user-id"`
}

type CombinedClaims struct {
	Hasura HasuraClaims `json:"https://hasura.io/jwt/claims"`
	// Set only on impersonation tokens: the id of the admin acting as the
	// user named in Hasura.UserId. Hasura ignores this claim; it exists so the
	// API can tell an impersonation session apart from a real one, attribute
	// it to a person, and hand the admin their own identity back on exit.
	Impersonator int `json:"imp,omitempty"`
	jwt.RegisteredClaims
}

// Impersonating reports whether these claims describe an impersonation
// session rather than a user's own login.
func (c *CombinedClaims) Impersonating() bool {
	return c.Impersonator != 0
}

// UserId is the id of the account the token acts on: the logged-in user
// normally, or the impersonation target during an impersonation session.
func (c *CombinedClaims) UserId() (int, error) {
	userId, err := strconv.Atoi(c.Hasura.UserId)
	if err != nil {
		return 0, fmt.Errorf("invalid user id: %w", err)
	}
	return userId, nil
}

const ExpirationPeriod = 24 * time.Hour

// Impersonation tokens live far shorter than ordinary sessions. An admin
// looking at someone's account is doing a bounded piece of support work, and a
// leaked or forgotten impersonation token should stop working the same day.
const ImpersonationExpirationPeriod = 1 * time.Hour

func signClaims(claims CombinedClaims) (string, error) {
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	jwtString, err := token.SignedString(env.Global.JwtKey)
	if err != nil {
		return "", err
	}
	return jwtString, nil
}

func NewSignedJwt(userId int) (string, error) {
	now := time.Now()

	claims := CombinedClaims{
		RegisteredClaims: jwt.RegisteredClaims{
			IssuedAt:  jwt.NewNumericDate(now),
			NotBefore: jwt.NewNumericDate(now),
			ExpiresAt: jwt.NewNumericDate(now.Add(ExpirationPeriod)),
		},
		Hasura: HasuraClaims{
			AllowedRoles: []string{UserRole},
			DefaultRole:  UserRole,
			UserId:       strconv.Itoa(userId),
		},
	}

	return signClaims(claims)
}

// NewImpersonationJwt mints a token that acts as targetUserId but is restricted
// to the read-only ImpersonatedUserRole and attributed to adminUserId.
//
// ImpersonatedUserRole is the *only* allowed role on the token: Hasura lets a
// client pick any role from x-hasura-allowed-roles via the x-hasura-role
// header, so listing "user" here — even as a non-default — would let the
// session simply ask for write access and get it.
func NewImpersonationJwt(targetUserId int, adminUserId int) (string, error) {
	now := time.Now()

	claims := CombinedClaims{
		RegisteredClaims: jwt.RegisteredClaims{
			IssuedAt:  jwt.NewNumericDate(now),
			NotBefore: jwt.NewNumericDate(now),
			ExpiresAt: jwt.NewNumericDate(now.Add(ImpersonationExpirationPeriod)),
		},
		Hasura: HasuraClaims{
			AllowedRoles: []string{ImpersonatedUserRole},
			DefaultRole:  ImpersonatedUserRole,
			UserId:       strconv.Itoa(targetUserId),
		},
		Impersonator: adminUserId,
	}

	return signClaims(claims)
}

func globalKey(t *jwt.Token) (interface{}, error) {
	return env.Global.JwtKey, nil
}

// ClaimsFromRequest verifies the request's bearer token and returns its claims.
func ClaimsFromRequest(request *http.Request) (*CombinedClaims, error) {
	var tokenString string

	if authStrings, ok := request.Header["Authorization"]; ok {
		tokenString = strings.TrimPrefix(authStrings[0], "Bearer ")
	} else {
		return nil, fmt.Errorf("no authorization header")
	}

	token, err := jwt.ParseWithClaims(tokenString, new(CombinedClaims), globalKey)
	if err != nil {
		if errors.Is(err, jwt.ErrTokenExpired) {
			return nil, WithEnum(ExpiredJwt, fmt.Errorf("expired token"))
		}
		if errors.Is(err, jwt.ErrTokenMalformed) {
			return nil, fmt.Errorf("malformed token: %w", err)
		}
		return nil, fmt.Errorf("invalid token: %w", err)
	}

	// This will work because ParseWithClaims encountered no error
	return token.Claims.(*CombinedClaims), nil
}

func UserIdFromRequest(request *http.Request) (int, error) {
	claims, err := ClaimsFromRequest(request)
	if err != nil {
		return 0, err
	}

	return claims.UserId()
}
