package auth

import (
	"encoding/json"
	"fmt"
	"net/http"

	"flow/api/serde"
	"flow/api/env"
	"flow/common/db"
)

const BaseFacebookUrl = "https://graph.facebook.com/"

type fbAuthLoginRequest struct {
	AccessToken string `json:"access_token"`
}

type fbAppTokenResponse struct {
	AppToken string `json:"access_token"`
}

type fbUserInfo struct {
  Id   string `json:"id"`
  Name string `json:"name"`
  Email string `json:"name"`
}

type fbUserInfoResponse struct {
  Data fbUserInfo `json:"data"`
}

// Fetches name and email from FB Graph API. Requires user access token and permission to access profile info.
// user fields: https://developers.facebook.com/docs/graph-api/reference/user/
func getFbUserInfo(accessToken string) (*fbUserInfo, error) {
	url := fmt.Sprintf("%s/me?fields=name,email&access_token=%s", BaseFacebookUrl, accessToken)
	response, err := http.Get(url)
	if err != nil {
		return nil, fmt.Errorf("fetching user info from fb graph API: %w", err)
	}
	defer response.Body.Close()

	var res fbUserInfoResponse
	json.NewDecoder(response.Body).Decode(&res)
	return &res.Data, nil
}

func registerFbUser(tx *db.Tx, userInfo *fbUserInfo) (*AuthResponse, error) {
	if userInfo.Email == "" {
		return nil, serde.WithEnum(serde.NoFacebookEmail, fmt.Errorf("no email"))
	}

	profilePicUrl := fmt.Sprintf("https://graph.facebook.com/%s/picture?type=large", userInfo.Id)

  response, err := InsertUser(tx, userInfo.Name, userInfo.Email, "facebook", &profilePicUrl)
	if err != nil {
		return nil, fmt.Errorf("inserting user: %w", err)
	}

	_, err = tx.Exec(
		"INSERT INTO secret.user_fb(user_id, fb_id) VALUES ($1, $2)",
		response.UserId, userInfo.Id,
	)
	if err != nil {
		return nil, fmt.Errorf("inserting user_fb: %w", err)
	}

	return response, nil
}

func LoginFacebook(tx *db.Tx, r *http.Request) (interface{}, error) {
	var body fbAuthLoginRequest
	err := json.NewDecoder(r.Body).Decode(&body)
	if err != nil {
		return nil, serde.WithStatus(http.StatusBadRequest, fmt.Errorf("malformed JSON: %w", err))
	}
	if body.AccessToken == "" {
		return nil, serde.WithStatus(http.StatusBadRequest, fmt.Errorf("no access_token"))
	}

	userInfo, err := getFbUserInfo(fmt.Sprintf("%s|%s", env.Global.FbAppId, env.Global.FbAppSecret))

  var response = &AuthResponse{}
	tx.QueryRow(
    "SELECT u.id, u.secret_id " +
    "FROM secret.user_fb " +
    "JOIN user u ON u.id = uf.user_id " +
    "WHERE uf.fb_id = $1",
    userInfo.Id,
  ).Scan(&response.UserId, &response.SecretId)

	if response.UserId != 0 {
    response.Token = serde.MakeAndSignHasuraJWT(response.UserId)
    return response, nil
  }

  response, err = registerFbUser(tx, userInfo)
  if err != nil {
    return nil, fmt.Errorf("registering fb user: %w", err)
  }
  return response, nil
}
