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

func MakeAndSignHasuraJWT(userId int) string {
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, CombinedClaims{
		StandardClaims: jwt.StandardClaims{
			IssuedAt: time.Now().Unix(),
		},
		Hasura: HasuraClaims{
			[]string{"user"},
			"user",
			strconv.Itoa(userId),
		},
	})
	jwtString, err := token.SignedString(env.Global.JwtKey)
	if err != nil {
		panic(err)
	}
	return jwtString
}

func UserIdFromRequest(request *http.Request) (int, error) {
	var tokenString string
	if authStrings, ok := request.Header["Authorization"]; ok {
		tokenString = strings.TrimPrefix(authStrings[0], "Bearer ")
	} else {
		return 0, fmt.Errorf("no authorization header")
	}

	token, err := jwt.ParseWithClaims(
		tokenString,
		&CombinedClaims{},
		func(t *jwt.Token) (interface{}, error) {
			return env.Global.JwtKey, nil
		},
	)
	if err != nil {
		return 0, fmt.Errorf("malformed token: %w", err)
	}

	if claims, ok := token.Claims.(*CombinedClaims); ok && token.Valid {
		userId, err := strconv.Atoi(claims.Hasura.UserId)
		if err != nil {
			return 0, fmt.Errorf("invalid user id: %w", err)
		} else {
			return userId, nil
		}
	} else {
		return 0, fmt.Errorf("invalid auth token: %w", err)
	}
}
