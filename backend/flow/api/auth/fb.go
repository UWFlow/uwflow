package auth

import (
	"encoding/json"
	"fmt"
	"net/http"
	"strings"

	"flow/api/serde"
	"flow/common/db"
	"flow/common/state"
)

type fbAuthLoginRequest struct {
	AccessToken string `json:"access_token"`
}

type fbAppTokenResponse struct {
	AppToken string `json:"access_token"`
}

type fbVerifyAccessTokenResponse struct {
	Data struct {
		IsValid bool   `json:"is_valid"`
		UserID  string `json:"user_id"`
	} `json:"data"`
}

// Fetches specified user fields from fb Graph API
// Requires user access token and permission to access profile info
// user fields: https://developers.facebook.com/docs/graph-api/reference/user/
func GetFbUserInfo(fbID string, accessToken string, fields []string) (map[string]interface{}, error) {
	url := fmt.Sprintf(
		"https://graph.facebook.com/%s?fields=%s&access_token=%s",
		fbID, strings.Join(fields, ","), accessToken,
	)
	response, err := http.Get(url)
	if err != nil {
		return map[string]interface{}{}, fmt.Errorf("fetching user info from fb graph API: %v", err)
	}
	defer response.Body.Close()
	var body interface{}
	json.NewDecoder(response.Body).Decode(&body)
	return body.(map[string]interface{}), nil
}

// Fetches the fb app specific token
func GetFbAppToken(fbAppId string, fbAppSecret string) (string, error) {
	url := fmt.Sprintf(
		"https://graph.facebook.com/oauth/access_token?client_id=%s&client_secret=%s&grant_type=client_credentials",
		fbAppId, fbAppSecret,
	)
	response, err := http.Get(url)
	if err != nil {
		return "", fmt.Errorf("fetching fb app token: %v", err)
	}
	defer response.Body.Close()
	body := fbAppTokenResponse{}
	err = json.NewDecoder(response.Body).Decode(&body)
	if err != nil {
		return "", fmt.Errorf("decoding fb app token: %v", err)
	}
	return body.AppToken, nil
}

// Verifies integrity of fb access token and returns user fb id on success
func verifyFbAccessToken(accessToken string, appToken string) (string, error) {
	url := fmt.Sprintf(
		"https://graph.facebook.com/debug_token?input_token=%s&access_token=%s",
		accessToken, appToken,
	)
	response, err := http.Get(url)
	if err != nil {
		return "", fmt.Errorf("querying fb access token validity over https: %v", err)
	}
	defer response.Body.Close()
	body := fbVerifyAccessTokenResponse{}
	err = json.NewDecoder(response.Body).Decode(&body)
	if err != nil {
		return "", fmt.Errorf("decoding fb API response: %v", err)
	}
	// "is_valid" field is false in API response if verification fails
	if !body.Data.IsValid {
		return "", fmt.Errorf("checking fb token validity: invalid access token")
	}
	return body.Data.UserID, nil
}

// Registration for new fb user
func registerFbUser(conn *db.Conn, accessToken string, fbID string) (int, error) {
	// gets user's name from fb graph API
	fields := []string{"name", "email"}
	userInfo, err := GetFbUserInfo(fbID, accessToken, fields)
	if err != nil {
		return 0, fmt.Errorf("fetch fb user info over graph API: %v", err)
	}
	// fb user could have invalid email field
	// https://developers.facebook.com/docs/graph-api/reference/user/
	if _, ok := userInfo["email"]; !ok {
		return 0, fmt.Errorf("checking fb user email in API response: invalid fb account email")
	}

	// forms user profile pic url
	profilePicURL := fmt.Sprintf(
		"https://graph.facebook.com/%s/picture?type=large", fbID,
	)

	// insert into "user" table
	var userID int
	err = conn.QueryRow(
		`INSERT INTO "user"(full_name, picture_url, email, join_source) VALUES ($1, $2, $3, $4) RETURNING id`,
		userInfo["name"].(string), profilePicURL, userInfo["email"].(string), "facebook",
	).Scan(&userID)
	if err != nil {
		return 0, fmt.Errorf("inserting new fb user info into db: %v", err)
	}
	// insert into user_fb table
	_, err = conn.Exec(
		"INSERT INTO secret.user_fb(user_id, fb_id) VALUES ($1, $2)",
		userID, fbID,
	)
	if err != nil {
		return 0, fmt.Errorf("inserting (flow_id, fb_id) pair into db: %v", err)
	}
	return userID, nil
}

func authenticateFbUser(state *state.State, r *http.Request) (*AuthResponse, error, int) {
	// parse access token from request body
	body := fbAuthLoginRequest{}
	err := json.NewDecoder(r.Body).Decode(&body)
	if err != nil {
		return nil, serde.WithEnum("facebook_auth_bad_request", fmt.Errorf("decoding fb auth request: %v", err)), http.StatusBadRequest
	}
	if body.AccessToken == "" {
		return nil, serde.WithEnum("facebook_auth_bad_request", fmt.Errorf("decoding fb auth request: expected access_token")), http.StatusBadRequest
	}

	// fetch fb app specific token
	appToken, err := GetFbAppToken(state.Env.FbAppId, state.Env.FbAppSecret)
	if err != nil {
		return nil, serde.WithEnum("facebook_auth", fmt.Errorf("fetching fb app token: %v", err)), http.StatusInternalServerError
	}

	// verify the received access token
	fbID, err := verifyFbAccessToken(body.AccessToken, appToken)
	if err != nil {
		return nil, serde.WithEnum("facebook_auth", fmt.Errorf("verifying fb access token: %v", err)), http.StatusUnauthorized
	}

	// check if fb user already exists
	var userID int
	state.Db.QueryRow(
		"SELECT user_id FROM secret.user_fb WHERE fb_id = $1",
		fbID,
	).Scan(&userID)

	// register new user if doesn't exist in db
	if userID == 0 {
		userID, err = registerFbUser(state.Db, body.AccessToken, fbID)
		if err != nil {
			return nil, serde.WithEnum("facebook_auth", fmt.Errorf("registering fb user: %v", err)), http.StatusInternalServerError
		}
	}

	// return Hasura JWT
	jwt := &AuthResponse{
		Token: serde.MakeAndSignHasuraJWT(userID, state.Env.JwtKey),
		ID:    userID,
	}
	return jwt, nil, http.StatusOK
}

func AuthenticateFbUser(state *state.State, w http.ResponseWriter, r *http.Request) {
	response, err, status := authenticateFbUser(state, r)
	if err != nil {
		serde.Error(w, err, status)
	}
	json.NewEncoder(w).Encode(response)
}
