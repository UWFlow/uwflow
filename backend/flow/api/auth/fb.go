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
		return map[string]interface{}{}, fmt.Errorf("fetching user info from fb graph API: %w", err.Error())
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
		return "", fmt.Errorf("fetching fb app token: %w", err.Error())
	}
	defer response.Body.Close()
	body := fbAppTokenResponse{}
	err = json.NewDecoder(response.Body).Decode(&body)
	if err != nil {
		return "", fmt.Errorf("fetching fb app token: %w", err.Error())
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
		return "", fmt.Errorf("verifying fb access token: %w", err.Error())
	}
	defer response.Body.Close()
	body := fbVerifyAccessTokenResponse{}
	err = json.NewDecoder(response.Body).Decode(&body)
	if err != nil {
		return "", fmt.Errorf("verifying fb access token: %w", err.Error())
	}
	// "is_valid" field is false in API response if verification fails
	if !body.Data.IsValid {
		return "", fmt.Errorf("verifying fb access token: invalid access token")
	}
	return body.Data.UserID, nil
}

// Registration for new fb user
func registerFbUser(conn *db.Conn, accessToken string, fbID string) (int, error) {
	// gets user's name from fb graph API
	fields := []string{"name", "email"}
	userInfo, err := GetFbUserInfo(fbID, accessToken, fields)
	if err != nil {
		return 0, fmt.Errorf("registering new fb user: %w", err.Error())
	}
	// fb user could have invalid email field
	// https://developers.facebook.com/docs/graph-api/reference/user/
	if _, ok := userInfo["email"]; !ok {
		return 0, fmt.Errorf("registering new fb user: invalid fb account email")
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
		return 0, fmt.Errorf("registering new fb user: %w", err.Error())
	}
	// insert into user_fb table
	_, err = conn.Exec(
		"INSERT INTO secret.user_fb(user_id, fb_id) VALUES ($1, $2)",
		userID, fbID,
	)
	if err != nil {
		return 0, fmt.Errorf("registering new fb user: %w", err.Error())
	}
	return userID, nil
}

func AuthenticateFbUser(state *state.State, w http.ResponseWriter, r *http.Request) {
	// parse access token from request body
	body := fbAuthLoginRequest{}
	err := json.NewDecoder(r.Body).Decode(&body)
	if err != nil {
		serde.Error(w, serde.WithEnum("fb", err), http.StatusBadRequest)
		return
	}
	if body.AccessToken == "" {
		serde.Error(w, serde.WithEnum("fb", fmt.Errorf("expected access token in request")), http.StatusBadRequest)
		return
	}

	// fetch fb app specific token
	appToken, err := GetFbAppToken(state.Env.FbAppId, state.Env.FbAppSecret)
	if err != nil {
		serde.Error(w, serde.WithEnum("fb", err), http.StatusInternalServerError)
		return
	}

	// verify the received access token
	fbID, err := verifyFbAccessToken(body.AccessToken, appToken)
	if err != nil {
		serde.Error(w, serde.WithEnum("fb", err), http.StatusUnauthorized)
		return
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
			serde.Error(w, serde.WithEnum("fb", err), http.StatusInternalServerError)
			return
		}
	}

	// return Hasura JWT
	encoder := json.NewEncoder(w)
	jwt := AuthResponse{
		Token: serde.MakeAndSignHasuraJWT(userID, state.Env.JwtKey),
		ID:    userID,
	}
	encoder.Encode(jwt)
}
