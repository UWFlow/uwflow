package auth

import (
	"encoding/json"
	"fmt"
	"net/http"

	"flow/api/serde"
	"flow/common/db"
)

type googleUserInfo struct {
	GoogleId   string  `json:"id"`
	Email      string  `json:"email"`
	FirstName  string  `json:"given_name"`
	LastName   string  `json:"family_name"`
	PictureUrl *string `json:"picture"`
}

const googleApiUrl = "https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=%s"

func getGoogleUserInfo(accessToken string) (*googleUserInfo, error) {
	url := fmt.Sprintf(googleApiUrl, accessToken)
	response, err := http.Get(url)
	if err != nil {
		return nil, fmt.Errorf("calling google api: %w", err)
	}
	if response.StatusCode >= 400 {
		return nil, fmt.Errorf("calling google api: status: %d", response.StatusCode)
	}
	defer response.Body.Close()

	var res googleUserInfo
	json.NewDecoder(response.Body).Decode(&res)
	return &res, nil
}

const insertUserGoogleQuery = `
INSERT INTO secret.user_google(user_id, google_id) VALUES ($1, $2)
`

func registerGoogle(tx *db.Tx, googleUser *googleUserInfo) (*authResponse, error) {
	user := userInfo{
		FirstName: googleUser.FirstName, LastName: googleUser.LastName, Email: googleUser.Email,
		JoinSource: "google", PictureUrl: googleUser.PictureUrl,
	}
	response, err := InsertUser(tx, &user)
	if err != nil {
		return nil, err
	}

	_, err = tx.Exec(insertUserGoogleQuery, response.UserId, googleUser.GoogleId)
	if err != nil {
		return nil, fmt.Errorf("writing user_google: %w", err)
	}

	return response, nil
}

const selectGoogleUserQuery = `
SELECT u.id, u.secret_id
FROM secret.user_google ug
JOIN "user" u
  ON u.id = ug.user_id
WHERE ug.google_id = $1
`

func loginGoogle(tx *db.Tx, accessToken string) (*authResponse, error) {
	googleUser, err := getGoogleUserInfo(accessToken)
	if err != nil {
		return nil, serde.WithStatus(http.StatusUnauthorized, fmt.Errorf("getting user info: %w", err))
	}

	var email string
	var response = new(authResponse)
	row := tx.QueryRow(selectGoogleUserQuery, googleUser.GoogleId)
	err = row.Scan(&response.UserId, &response.SecretId, &email)

	if err == nil {
		response.Token, err = serde.NewSignedJwt(response.UserId)
		if err != nil {
			return nil, fmt.Errorf("signing jwt: %w", err)
		}
		return response, nil
	}

	response, err = registerGoogle(tx, googleUser)
	if err != nil {
		return nil, fmt.Errorf("registering fb user: %w", err)
	}

	return response, nil
}

type googleLoginRequest struct {
	AccessToken string `json:"access_token"`
}

func LoginGoogle(tx *db.Tx, r *http.Request) (interface{}, error) {
	var body googleLoginRequest
	err := json.NewDecoder(r.Body).Decode(&body)
	if err != nil {
		return nil, serde.WithStatus(http.StatusBadRequest, fmt.Errorf("malformed JSON: %w", err))
	}

	if body.AccessToken == "" {
		return nil, serde.WithStatus(http.StatusBadRequest, fmt.Errorf("no access token"))
	}

	return loginGoogle(tx, body.AccessToken)
}
