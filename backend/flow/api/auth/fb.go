package auth

import (
	"encoding/json"
	"fmt"
	"net/http"

	"flow/api/serde"
	"flow/common/db"
)

type fbAuthLoginRequest struct {
	AccessToken string `json:"access_token"`
}

type fbUserInfo struct {
	FbId  string `json:"id"`
	Name  string `json:"name"`
	Email string `json:"email"`
}

const baseFacebookUrl = "https://graph.facebook.com"

func getFbUserInfo(accessToken string) (*fbUserInfo, error) {
	url := fmt.Sprintf("%s/me?fields=name,email&access_token=%s", baseFacebookUrl, accessToken)
	response, err := http.Get(url)
	if err != nil {
		return nil, fmt.Errorf("calling fb graph api: %w", err)
	}
	defer response.Body.Close()

	var res fbUserInfo
	json.NewDecoder(response.Body).Decode(&res)
	return &res, nil
}

func registerFbUser(tx *db.Tx, userInfo *fbUserInfo) (*AuthResponse, error) {
	if userInfo.Email == "" {
		return nil, serde.WithEnum(serde.NoFacebookEmail, fmt.Errorf("no email"))
	}

	profilePicUrl := fmt.Sprintf("%s/%s/picture?type=large", baseFacebookUrl, userInfo.FbId)

	response, err := InsertUser(tx, userInfo.Name, userInfo.Email, "facebook", &profilePicUrl)
	if err != nil {
		return nil, serde.WithEnum(serde.EmailTaken, fmt.Errorf("inserting user: %w", err))
	}

	_, err = tx.Exec(
		"INSERT INTO secret.user_fb(user_id, fb_id) VALUES ($1, $2)",
		response.UserId, userInfo.FbId,
	)
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

const updateFbEmailQuery = `UPDATE "user" SET email = $2 WHERE id = $1`

func LoginFacebook(tx *db.Tx, r *http.Request) (interface{}, error) {
	var body fbAuthLoginRequest
	err := json.NewDecoder(r.Body).Decode(&body)
	if err != nil {
		return nil, serde.WithStatus(http.StatusBadRequest, fmt.Errorf("malformed JSON: %w", err))
	}

	if body.AccessToken == "" {
		return nil, serde.WithStatus(
			http.StatusBadRequest,
			serde.WithEnum(serde.ConstraintViolation, fmt.Errorf("no access token")),
		)
	}

	userInfo, err := getFbUserInfo(body.AccessToken)
	if err != nil {
		return nil, serde.WithStatus(http.StatusUnauthorized, fmt.Errorf("getting fb user info: %w", err))
	}

	var email string
	var response = &AuthResponse{}
	tx.QueryRow(selectFbUserQuery, userInfo.FbId).Scan(&response.UserId, &response.SecretId, &email)

	if response.UserId != 0 {
		if email == "" {
			_, err = tx.Exec(updateFbEmailQuery, response.UserId, email)
		}
		response.Token = serde.MakeAndSignHasuraJWT(response.UserId)
		return response, nil
	}

	response, err = registerFbUser(tx, userInfo)
	if err != nil {
		return nil, fmt.Errorf("registering fb user: %w", err)
	}
	return response, nil
}
