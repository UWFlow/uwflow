package auth

import (
	"encoding/json"
	"fmt"
	"net/http"

	"flow/api/serde"
	"flow/common/db"
)

type fbUserInfo struct {
	FbId      string `json:"id"`
	FirstName string `json:"first_name"`
	LastName  string `json:"last_name"`
	// Users who have not verified email with facebook
	// will not have it available in the graph api response
	Email *string `json:"email"`
}

const (
	baseFacebookUrl    = "https://graph.facebook.com"
	facebookUserUrl    = baseFacebookUrl + "/me?fields=first_name,last_name,email&access_token=%s"
	facebookPictureUrl = baseFacebookUrl + "/%s/picture?type=large"
)

func getFacebookUserInfo(accessToken string) (*fbUserInfo, error) {
	url := fmt.Sprintf(facebookUserUrl, accessToken)
	response, err := http.Get(url)
	if err != nil {
		return nil, fmt.Errorf("calling graph api: %w", err)
	}
	if response.StatusCode >= 400 {
		return nil, fmt.Errorf("calling graph api: status: %d", response.StatusCode)
	}
	defer response.Body.Close()

	var fbUser fbUserInfo
	json.NewDecoder(response.Body).Decode(&fbUser)
	return &fbUser, nil
}

const insertUserFbQuery = `
INSERT INTO secret.user_fb(user_id, fb_id) VALUES ($1, $2)
`

func registerFacebook(tx *db.Tx, fbUser *fbUserInfo) (*authResponse, error) {
	pictureUrl := fmt.Sprintf(facebookPictureUrl, fbUser.FbId)
	user := userInfo{
		FirstName: fbUser.FirstName, LastName: fbUser.LastName,
		JoinSource: "facebook", Email: fbUser.Email, PictureUrl: &pictureUrl,
	}

	response, err := InsertUser(tx, &user)
	if err != nil {
		return nil, err
	}

	_, err = tx.Exec(insertUserFbQuery, response.UserId, fbUser.FbId)
	if err != nil {
		return nil, fmt.Errorf("inserting user_fb: %w", err)
	}

	return response, nil
}

const selectFbUserQuery = `
SELECT u.id, u.email
FROM secret.user_fb uf
  JOIN "user" u ON u.id = uf.user_id
WHERE uf.fb_id = $1
`

const updateFbEmailQuery = `
UPDATE "user" SET email = $2 WHERE id = $1
`

func loginFacebook(tx *db.Tx, accessToken string) (*authResponse, error) {
	fbUser, err := getFacebookUserInfo(accessToken)
	if err != nil {
		return nil, serde.WithStatus(http.StatusUnauthorized, fmt.Errorf("getting user info: %w", err))
	}

	var email *string
	var response = new(authResponse)
	err = tx.QueryRow(selectFbUserQuery, fbUser.FbId).Scan(&response.UserId, &response.SecretId, &email)

	// User was found
	if err == nil {
		if email == nil {
			_, err = tx.Exec(updateFbEmailQuery, response.UserId, fbUser.Email)
		}
		response.Token, err = serde.NewSignedJwt(response.UserId)
		if err != nil {
			return nil, fmt.Errorf("signing jwt: %w", err)
		}
		return response, nil
	}

	response, err = registerFacebook(tx, fbUser)
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
