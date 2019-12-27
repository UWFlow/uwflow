package auth

import (
	"fmt"
	"net/http"

	"flow/api/serde"
	"flow/common/db"
)

type refreshResponse struct {
	Token string `json:"token"`
}

func RefreshToken(tx *db.Tx, r *http.Request) (interface{}, error) {
	userId, err := serde.UserIdFromRequest(r)
	if err != nil {
		return nil, serde.WithStatus(http.StatusUnauthorized, fmt.Errorf("extracting user id: %w", err))
	}

	token, err := serde.NewSignedJwt(userId)
	if err != nil {
		return nil, err
	}

	return &refreshResponse{Token: token}, nil
}
