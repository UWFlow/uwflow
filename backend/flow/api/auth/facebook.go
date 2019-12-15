package auth

import (
	"encoding/json"
	"fmt"
	"net/http"

	"flow/api/serde"
	"flow/common/db"
)

type fbUserInfo struct {
	FbId  string `json:"id"`
	Name  string `json:"name"`
	Email string `json:"email"`
}

const baseFacebookUrl = "https://graph.facebook.com"

func getFacebookUserInfo(accessToken string) (*fbUserInfo, error) {
	url := fmt.Sprintf("%s/me?fields=name,email&access_token=%s", baseFacebookUrl, accessToken)
	response, err := http.Get(url)
	if err != nil {
		return nil, fmt.Errorf("calling graph api: %w", err)
	}
	if response.StatusCode >= 400 {
		return nil, fmt.Errorf("calling graph api: status: %d", response.StatusCode)
	}
	defer response.Body.Close()

	var res fbUserInfo
	json.NewDecoder(response.Body).Decode(&res)
	return &res, nil
}

const insertUserFbQuery = `
INSERT INTO secret.user_fb(user_id, fb_id) VALUES ($1, $2)
`

func registerFacebook(tx *db.Tx, userInfo *fbUserInfo) (*AuthResponse, error) {
	if userInfo.Email == "" {
		return nil, serde.WithEnum(serde.NoFacebookEmail, fmt.Errorf("no email"))
	}

	profilePicUrl := fmt.Sprintf("%s/%s/picture?type=large", baseFacebookUrl, userInfo.FbId)

	response, err := InsertUser(tx, userInfo.Name, userInfo.Email, "facebook", &profilePicUrl)
	if err != nil {
		return nil, err
	}

	_, err = tx.Exec(insertUserFbQuery, response.UserId, userInfo.FbId)
	if err != nil {
		return nil, fmt.Errorf("inserting user_fb: %w", err)
	}

	return response, nil
}

const selectFbUserQuery = `
SELECT u.id, u.secret_id, u.email
FROM secret.user_fb uf
  JOIN "user" u ON u.id = uf.user_id
WHERE uf.fb_id = $1
`

const updateFbEmailQuery = `
UPDATE "user" SET email = $2 WHERE id = $1
`

func loginFacebook(tx *db.Tx, accessToken string) (*AuthResponse, error) {
	userInfo, err := getFacebookUserInfo(accessToken)
	if err != nil {
		return nil, serde.WithStatus(http.StatusUnauthorized, fmt.Errorf("getting user info: %w", err))
	}

	var email string
	var response = &AuthResponse{}
	err = tx.QueryRow(selectFbUserQuery, userInfo.FbId).Scan(&response.UserId, &response.SecretId, &email)

	if err == nil {
		if email == "" {
			_, err = tx.Exec(updateFbEmailQuery, response.UserId, email)
		}
		response.Token, err = serde.NewSignedJwt(response.UserId)
		if err != nil {
			return nil, fmt.Errorf("signing jwt: %w", err)
		}
		return response, nil
	}

	response, err = registerFacebook(tx, userInfo)
	if err != nil {
		return nil, fmt.Errorf("registering fb user: %w", err)
	}

	return response, nil
}

type fbAuthLoginRequest struct {
	AccessToken string `json:"access_token"`
}

func LoginFacebook(tx *db.Tx, r *http.Request) (interface{}, error) {
	var body fbAuthLoginRequest
	err := json.NewDecoder(r.Body).Decode(&body)
	if err != nil {
		return nil, serde.WithStatus(http.StatusBadRequest, fmt.Errorf("malformed JSON: %w", err))
	}

	if body.AccessToken == "" {
		return nil, serde.WithStatus(http.StatusBadRequest, fmt.Errorf("no access token"))
	}

	return loginFacebook(tx, body.AccessToken)
}
