package serde

import (
	"fmt"
	"net/http"
	"strconv"
	"strings"
	"time"

	"flow/api/env"

	"github.com/dgrijalva/jwt-go"
)

type HasuraClaims struct {
	AllowedRoles []string `json:"x-hasura-allowed-roles"`
	DefaultRole  string   `json:"x-hasura-default-role"`
	UserId       string   `json:"x-hasura-user-id"`
}

type CombinedClaims struct {
	Hasura HasuraClaims `json:"https://hasura.io/jwt/claims"`
	jwt.StandardClaims
}

const ExpirationPeriod = 24 * time.Hour

func NewSignedJwt(userId int) (string, error) {
	now := time.Now()

	claims := CombinedClaims{
		StandardClaims: jwt.StandardClaims{
			IssuedAt:  now.Unix(),
			NotBefore: now.Unix(),
			ExpiresAt: now.Add(ExpirationPeriod).Unix(),
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
	var tokenString string

	if authStrings, ok := request.Header["Authorization"]; ok {
		tokenString = strings.TrimPrefix(authStrings[0], "Bearer ")
	} else {
		return 0, fmt.Errorf("no authorization header")
	}

	token, err := jwt.ParseWithClaims(tokenString, new(CombinedClaims), globalKey)
	if err != nil {
		if vErr, ok := err.(*jwt.ValidationError); ok {
			if vErr.Errors&jwt.ValidationErrorExpired != 0 {
				return 0, WithEnum(ExpiredJwt, fmt.Errorf("expired token"))
			}
			return 0, fmt.Errorf("invalid token: %w", vErr)
		}
		return 0, fmt.Errorf("malformed token: %w", err)
	}

	// This will work because ParseWithClaims encountered no error
	claims := token.Claims.(*CombinedClaims)
	userId, err := strconv.Atoi(claims.Hasura.UserId)
	if err != nil {
		return 0, fmt.Errorf("invalid user id: %w", err)
	}

	return userId, nil
}
