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

type HasuraClaims struct {
	AllowedRoles []string `json:"x-hasura-allowed-roles"`
	DefaultRole  string   `json:"x-hasura-default-role"`
	UserId       string   `json:"x-hasura-user-id"`
}

type CombinedClaims struct {
	Hasura HasuraClaims `json:"https://hasura.io/jwt/claims"`
	jwt.RegisteredClaims
}

const ExpirationPeriod = 24 * time.Hour

func NewSignedJwt(userId int) (string, error) {
	now := time.Now()

	claims := CombinedClaims{
		RegisteredClaims: jwt.RegisteredClaims{
			IssuedAt:  jwt.NewNumericDate(now),
			NotBefore: jwt.NewNumericDate(now),
			ExpiresAt: jwt.NewNumericDate(now.Add(ExpirationPeriod)),
		},
		Hasura: HasuraClaims{
			AllowedRoles: []string{"user"},
			DefaultRole:  "user",
			UserId:       strconv.Itoa(userId),
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	jwtString, err := token.SignedString(env.Global.JwtKey)

	if err != nil {
		return "", err
	}

	return jwtString, nil
}

func globalKey(t *jwt.Token) (interface{}, error) {
	return env.Global.JwtKey, nil
}

func UserIdFromRequest(request *http.Request) (int, error) {
	auth := strings.Fields(request.Header.Get("Authorization"))
	if len(auth) != 2 || !strings.EqualFold(auth[0], "Bearer") {
		return 0, fmt.Errorf("expected bearer authorization")
	}
	token, err := jwt.ParseWithClaims(auth[1], new(CombinedClaims), globalKey,
		jwt.WithValidMethods([]string{"HS256"}), jwt.WithExpirationRequired())
	if err != nil {
		if errors.Is(err, jwt.ErrTokenExpired) {
			return 0, WithEnum(ExpiredJwt, fmt.Errorf("expired token"))
		}
		if errors.Is(err, jwt.ErrTokenMalformed) {
			return 0, fmt.Errorf("malformed token: %w", err)
		}
		return 0, fmt.Errorf("invalid token: %w", err)
	}

	// This will work because ParseWithClaims encountered no error
	claims := token.Claims.(*CombinedClaims)
	userId, err := strconv.Atoi(claims.Hasura.UserId)
	if err != nil {
		return 0, fmt.Errorf("invalid user id: %w", err)
	}

	if userId <= 0 {
		return 0, fmt.Errorf("invalid user id")
	}
	return userId, nil
}
