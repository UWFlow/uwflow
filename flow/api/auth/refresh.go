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
	claims, err := serde.ClaimsFromRequest(r)
	if err != nil {
		return nil, serde.WithStatus(http.StatusUnauthorized, fmt.Errorf("extracting claims: %w", err))
	}

	userId, err := claims.UserId()
	if err != nil {
		return nil, serde.WithStatus(http.StatusUnauthorized, err)
	}

	// Refreshing an impersonation token must not quietly launder it into an
	// ordinary one. Minting the usual token here would hand the caller the
	// write-capable `user` role for an account that is not theirs, and drop the
	// `imp` claim that ties the session to an admin — turning a bounded,
	// audited, read-only session into an indistinguishable full login.
	//
	// Refuse instead of re-issuing: impersonation is deliberately capped at
	// ImpersonationExpirationPeriod, and renewing it on a timer would defeat
	// that cap. The admin can open a fresh session, which writes a new audit
	// row, as it should.
	if claims.Impersonating() {
		return nil, serde.WithStatus(http.StatusForbidden, serde.WithEnum(
			serde.ImpersonationForbidden,
			fmt.Errorf("impersonation sessions cannot be refreshed"),
		))
	}

	token, err := serde.NewSignedJwt(userId)
	if err != nil {
		return nil, err
	}

	return &refreshResponse{Token: token}, nil
}
