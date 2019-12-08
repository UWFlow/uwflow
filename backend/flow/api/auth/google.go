package auth

import (
	"encoding/json"
	"fmt"
	"net/http"

	"flow/api/serde"
	"flow/common/state"

	"github.com/dgrijalva/jwt-go"
)

type googleIDTokenClaims struct {
	// Following fields are provided only if user allows access to profile
	Name       string `json:"name"`
	PictureUrl string `json:"picture"`
	Email      string `json:"email"`
	jwt.StandardClaims
}

type googleAuthLoginRequest struct {
	IDToken string `json:"id_token"`
}

type googleVerifyTokenResponse struct {
	GoogleID *string `json:"user_id"`
}

func verifyGoogleIDToken(idToken string) (string, error) {
	// use Google API to verify provided id token
	url := fmt.Sprintf(
		"https://www.googleapis.com/oauth2/v2/tokeninfo?id_token=%s",
		idToken,
	)
	response, err := http.Get(url)
	if err != nil {
		return "", fmt.Errorf("verifying google id token: %w", err.Error())
	}

	// attempt to extract "user_id" from Google API response
	defer response.Body.Close()
	body := googleVerifyTokenResponse{}
	err = json.NewDecoder(response.Body).Decode(&body)
	if err != nil {
		return "", fmt.Errorf("verifying google id token: %w", err.Error())
	}
	// response will only contain "error_description"
	// field if verification fails
	if body.GoogleID == nil {
		return "", fmt.Errorf("verifying google id token: invalid id token")
	}
	// otherwise return the "user_id"
	return *body.GoogleID, nil
}

func registerGoogleUser(state *state.State, googleID string, idToken string) (int, error) {
	// assuming that we have already validated the idToken (jwt),
	// we can safely extract the desired jwt claims from the token
	token, _, err := new(jwt.Parser).ParseUnverified(idToken, &googleIDTokenClaims{})
	if err != nil {
		return 0, fmt.Errorf("parsing jwt: invalid id token")
	}
	tokenClaims, ok := token.Claims.(*googleIDTokenClaims)
	if !ok {
		return 0, fmt.Errorf("fetching token claims: invalid id token")
	}

	var userID int
	err = state.Db.QueryRow(
		`INSERT INTO "user"(full_name, picture_url, email, join_source) VALUES ($1, $2, $3, $4) RETURNING id`,
		tokenClaims.Name, tokenClaims.PictureUrl, tokenClaims.Email, "google",
	).Scan(&userID)
	if err != nil {
		return 0, fmt.Errorf("registering new google user: %w", err.Error())
	}
	_, err = state.Db.Exec(
		"INSERT INTO secret.user_google(user_id, google_id) VALUES ($1, $2)",
		userID, googleID,
	)
	if err != nil {
		return 0, fmt.Errorf("registering new google user: %w", err.Error())
	}
	return userID, nil
}

func AuthenticateGoogleUser(state *state.State, w http.ResponseWriter, r *http.Request) {
	body := googleAuthLoginRequest{}
	err := json.NewDecoder(r.Body).Decode(&body)
	if err != nil {
		serde.Error(w, serde.WithEnum("google", err), http.StatusBadRequest)
		return
	}
	if body.IDToken == "" {
		serde.Error(w, serde.WithEnum("google", fmt.Errorf("expected id_token in request")), http.StatusBadRequest)
		return
	}

	// Validate Google id token using Google API
	// tokenInfo, err := verifyGoogleIDToken(body.IDToken)
	googleID, err := verifyGoogleIDToken(body.IDToken)
	if err != nil {
		serde.Error(w, serde.WithEnum("google", err), http.StatusUnauthorized)
		return
	}

	// tokenInfo provides the user's unique Google id as UserId
	// so we can check if the Google id already exists
	var userID int
	state.Db.QueryRow(
		"SELECT user_id FROM secret.user_google WHERE google_id = $1",
		googleID,
	).Scan(&userID)

	// If the Google id is new, we must register the user
	if userID == 0 {
		// the raw id token needs to be parsed here since tokenInfo does not
		// provide required profile info including name and profile pic url
		userID, err = registerGoogleUser(state, googleID, body.IDToken)
		if err != nil {
			serde.Error(w, serde.WithEnum("google", err), http.StatusInternalServerError)
			return
		}
	}

	encoder := json.NewEncoder(w)
	jwt := AuthResponse{
		Token: serde.MakeAndSignHasuraJWT(userID, state.Env.JwtKey),
		ID:    userID,
	}
	encoder.Encode(jwt)
}
