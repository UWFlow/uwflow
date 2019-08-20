package serde

import (
	"strconv"
	"time"

	"github.com/dgrijalva/jwt-go"
)

type HasuraClaims struct {
	AllowedRoles []string `json:"x-hasura-allowed-roles"`
	DefaultRole  string   `json:"x-hasura-default-role"`
	UserId       string   `json:"x-hasura-user-id"`
}

func MakeAndSignHasuraJWT(userId int, secret []byte) string {
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"iat": int(time.Now().Unix()),
		"https://hasura.io/jwt/claims": HasuraClaims{
			[]string{"user"},
			"user",
			strconv.Itoa(userId),
		},
	})
	jwtString, err := token.SignedString(secret)
	if err != nil {
		panic(err)
	}
	return jwtString
}
