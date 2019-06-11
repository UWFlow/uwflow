package auth

type HasuraClaims struct {
	AllowedRoles []string `json:"x-hasura-allowed-roles"`
	DefaultRole  string   `json:"x-hasura-default-role"`
	UserId       int      `json:"x-hasura-user-id"`
}

type HasuraJWT struct {
	Claims HasuraClaims `json:"https://hasura.io/jwt/claims"`
}

func MakeHasuraJWT(userId int) HasuraJWT {
	return HasuraJWT{HasuraClaims{[]string{"user"}, "user", userId}}
}
