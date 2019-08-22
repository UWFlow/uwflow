package serde

import (
	"os"
	"strconv"
	"time"

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

func MakeAndSignHasuraJWT(userId int, secret []byte) string {
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
	jwtString, err := token.SignedString(secret)
	if err != nil {
		panic(err)
	}
	return jwtString
}

func UserIdFromAuthToken(tokenString string) (int, error) {
	token, err := jwt.ParseWithClaims(
		tokenString,
		&CombinedClaims{},
		func(t *jwt.Token) (interface{}, error) {
			return []byte(os.Getenv("HASURA_GRAPHQL_JWT_KEY")), nil
		},
	)
	if claims, ok := token.Claims.(*CombinedClaims); ok && token.Valid {
		userId, err := strconv.Atoi(claims.Hasura.UserId)
		if err != nil {
			return 0, err
		} else {
			return userId, nil
		}
	} else {
		return 0, err
	}
}
