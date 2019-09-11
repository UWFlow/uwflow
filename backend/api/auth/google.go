package auth

import (
	"context"
	"encoding/json"
	"errors"
	"net/http"
	"os"

	"github.com/AyushK1/uwflow2.0/backend/api/serde"
	"github.com/AyushK1/uwflow2.0/backend/api/state"
	"github.com/dgrijalva/jwt-go"
	"google.golang.org/api/oauth2/v2"
)

type googleIDTokenClaims struct {
	// Following fields are provided only if user allows access to profile
	Name    string `json:"name"`
	Picture string `json:"picture"`
	jwt.StandardClaims
}

type googleAuthLoginRequest struct {
	IDToken string `json:"id_token"`
}

func verifyGoogleIDToken(idToken string) (*oauth2.Tokeninfo, error) {
	ctx := context.Background()
	oauth2Service, err := oauth2.NewService(ctx)
	if err != nil {
		return nil, err
	}
	tokenInfoCall := oauth2Service.Tokeninfo()
	// sets the id_token parameter before making call
	tokenInfoCall.IdToken(idToken)
	// makes call to https://www.googleapis.com/oauth2/v2/tokeninfo
	tokenInfo, err := tokenInfoCall.Do()
	if err != nil {
		return nil, err
	}
	return tokenInfo, nil
}

func registerGoogleUser(state *state.State, googleID string, idToken string) (int, error) {
	// assuming that we have already validated the idToken (jwt),
	// we can safely extract the desired jwt claims from the token
	token, _, err := new(jwt.Parser).ParseUnverified(idToken, &googleIDTokenClaims{})
	if err != nil {
		return 0, errors.New("Invalid id token")
	}
	tokenClaims, ok := token.Claims.(*googleIDTokenClaims)
	if !ok {
		return 0, errors.New("Invalid id token")
	}

	var userID int
	err = state.Conn.QueryRow(
		"INSERT INTO \"user\"(full_name, picture_url) VALUES ($1, $2) RETURNING id",
		tokenClaims.Name, tokenClaims.Picture,
	).Scan(&userID)
	if err != nil {
		return 0, err
	}
	state.Conn.Exec(
		"INSERT INTO secret.user_google(user_id, google_id) VALUES ($1, $2)",
		userID, googleID,
	)
	return userID, nil
}

func AuthenticateGoogleUser(state *state.State, w http.ResponseWriter, r *http.Request) {
	body := googleAuthLoginRequest{}
	err := json.NewDecoder(r.Body).Decode(&body)
	if err != nil {
		serde.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	if body.IDToken == "" {
		serde.Error(w, "Expected {id_token}", http.StatusBadRequest)
		return
	}

	// Validate Google id token using Google API
	tokenInfo, err := verifyGoogleIDToken(body.IDToken)
	if err != nil {
		serde.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// tokenInfo provides the user's unique Google id as UserId
	// so we can check if the Google id already exists
	var userID int
	err = state.Conn.QueryRow(
		"SELECT user_id FROM secret.user_google WHERE google_id = $1",
		tokenInfo.UserId).Scan(&userID)
	if err != nil {
		serde.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// If the Google id is new, we must register the user
	if userID == 0 {
		// the raw id token needs to be parsed here since tokenInfo does not
		// provide required profile info including name and profile pic url
		userID, err = registerGoogleUser(state, tokenInfo.UserId, body.IDToken)
		if err != nil {
			serde.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
	}

	json.NewEncoder(w).Encode(serde.MakeAndSignHasuraJWT(userID, []byte(os.Getenv("HASURA_GRAPHQL_JWT_KEY"))))
}
