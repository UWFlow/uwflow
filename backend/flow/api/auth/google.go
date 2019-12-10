package auth

import (
	"encoding/json"
	"fmt"
	"net/http"

	"flow/api/serde"
	"flow/common/db"

	"github.com/dgrijalva/jwt-go"
)

type googleTokenClaims struct {
	// Following fields are provided only if user allows access to profile
	Name       string `json:"name"`
	PictureUrl string `json:"picture"`
	Email      string `json:"email"`
	jwt.StandardClaims
}

type googleLoginRequest struct {
	IdToken string `json:"id_token"`
}

type googleVerifyTokenResponse struct {
	GoogleId *string `json:"user_id"`
}

func verifyGoogleIdToken(idToken string) (string, error) {
	url := fmt.Sprintf(
		"https://www.googleapis.com/oauth2/v2/tokeninfo?id_token=%s",
		idToken,
	)

	response, err := http.Get(url)
	if err != nil {
		return "", fmt.Errorf("sending https request: %w", err)
	}
	defer response.Body.Close()

	var body googleVerifyTokenResponse
	err = json.NewDecoder(response.Body).Decode(&body)
	if err != nil {
		return "", fmt.Errorf("malformed JSON: %w", err)
	}
	// response will only contain "error_description"
	// field if verification fails
	if body.GoogleId == nil {
		return "", fmt.Errorf("invalid id token")
	}
	// otherwise return the "user_id"
	return *body.GoogleId, nil
}

func registerGoogle(tx *db.Tx, googleId string, idToken string) (*AuthResponse, error) {
	// assuming that we have already validated the idToken (jwt),
	// we can safely extract the desired jwt claims from the token
	token, _, err := new(jwt.Parser).ParseUnverified(idToken, &googleTokenClaims{})
	if err != nil {
		return nil, fmt.Errorf("parsing jwt: invalid id token")
	}
	tokenClaims, ok := token.Claims.(*googleTokenClaims)
	if !ok {
		return nil, fmt.Errorf("fetching token claims: invalid id token")
	}

	response, err := InsertUser(
		tx, tokenClaims.Name, tokenClaims.Email, "google", &tokenClaims.PictureUrl,
	)
	if err != nil {
		return nil, fmt.Errorf("writing user: %w", err)
	}

	_, err = tx.Exec(
		"INSERT INTO secret.user_google(user_id, google_id) VALUES ($1, $2)",
		response.UserId, googleId,
	)
	if err != nil {
		return nil, fmt.Errorf("writing user_google: %w", err)
	}

	return response, nil
}

func LoginGoogle(tx *db.Tx, r *http.Request) (interface{}, error) {
	var body googleLoginRequest
	err := json.NewDecoder(r.Body).Decode(&body)
	if err != nil {
		return nil, serde.WithStatus(http.StatusBadRequest, fmt.Errorf("malformed JSON: %w", err))
	}
	defer r.Body.Close()

	if body.IdToken == "" {
		return nil, serde.WithStatus(http.StatusBadRequest, fmt.Errorf("missing id token"))
	}

	// Validate Google id token using Google API
	googleId, err := verifyGoogleIdToken(body.IdToken)
	if err != nil {
		return nil, serde.WithStatus(
			http.StatusBadRequest,
			fmt.Errorf("verifying token: %w", err),
		)
	}

	// tokenInfo provides the user's unique Google id as UserId
	// so we can check if the Google id already exists
	var (
		secretId string
		userId   int
	)
	tx.QueryRow(
		`SELECT u.id, u.secret_id `+
			`FROM secret.user_google ug `+
			`JOIN "user" u ON u.id = ug.user_id `+
			`WHERE ug.google_id = $1`,
		googleId,
	).Scan(&userId, &secretId)

	// If the Google id is new, we must register the user
	if userId != 0 {
		return &AuthResponse{SecretId: secretId, UserId: userId, Token: serde.MakeAndSignHasuraJWT(userId)}, nil
	}
	// the raw id token needs to be parsed here since tokenInfo does not
	// provide required profile info including name and profile pic url
	res, err := registerGoogle(tx, googleId, body.IdToken)
	if err != nil {
		return nil, fmt.Errorf("registering: %w", err)
	}

	return res, nil
}
