package auth

import (
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"os"
	"strings"

	"github.com/AyushK1/uwflow2.0/backend/api/serde"
	"github.com/AyushK1/uwflow2.0/backend/api/state"
)

type fbAuthLoginRequest struct {
	AccessToken string `json:"access_token"`
}

type fbAppTokenResponse struct {
	AppToken string `json:"access_token"`
}

type fbVerifyAccessTokenResponse struct {
	Data map[string]interface{} `json:"data"`
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
		return map[string]interface{}{}, err
	}
	defer response.Body.Close()
	var body interface{}
	json.NewDecoder(response.Body).Decode(&body)
	return body.(map[string]interface{}), nil
}

// Fetches the fb app specific token
func GetFbAppToken() (string, error) {
	url := fmt.Sprintf(
		"https://graph.facebook.com/oauth/access_token?client_id=%s&client_secret=%s&grant_type=client_credentials",
		os.Getenv("FB_APP_ID"), os.Getenv("FB_APP_SECRET"),
	)
	response, err := http.Get(url)
	if err != nil {
		return "", err
	}
	defer response.Body.Close()
	body := fbAppTokenResponse{}
	err = json.NewDecoder(response.Body).Decode(&body)
	if err != nil {
		return "", err
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
		return "", err
	}
	defer response.Body.Close()
	body := fbVerifyAccessTokenResponse{}
	err = json.NewDecoder(response.Body).Decode(&body)
	if err != nil {
		return "", err
	}
	// "is_valid" field is false in API response if verification fails
	if !body.Data["is_valid"].(bool) {
		return "", errors.New("Invalid access token")
	}
	return body.Data["user_id"].(string), nil
}

// Registration for new fb user
func registerFbUser(state *state.State, accessToken string, fbID string) (int, error) {
	// gets user's name from fb graph API
	fields := []string{"name"}
	userInfo, err := GetFbUserInfo(fbID, accessToken, fields)
	if err != nil {
		return 0, err
	}
	// forms user profile pic url
	profilePicURL := fmt.Sprintf(
		"https://graph.facebook.com/%s/picture?type=large", fbID,
	)

	// insert into "user" table
	var userID int
	err = state.Conn.QueryRow(
		"INSERT INTO \"user\"(full_name, picture_url) VALUES ($1, $2) RETURNING id",
		userInfo["name"].(string), profilePicURL,
	).Scan(&userID)
	if err != nil {
		return 0, err
	}
	// insert into user_fb table
	state.Conn.Exec(
		"INSERT INTO secret.user_fb(user_id, fb_id) VALUES ($1, $2)",
		userID, fbID,
	)
	return userID, nil
}

func AuthenticateFbUser(state *state.State, w http.ResponseWriter, r *http.Request) {
	// parse access token from request body
	body := fbAuthLoginRequest{}
	err := json.NewDecoder(r.Body).Decode(&body)
	if err != nil {
		serde.Error(w, "Expected non-empty body", http.StatusBadRequest)
		return
	}
	if body.AccessToken == "" {
		serde.Error(w, "Expected {access_token}", http.StatusBadRequest)
		return
	}

	// fetch fb app specific token
	appToken, err := GetFbAppToken()
	if err != nil {
		serde.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// verify the received access token
	fbID, err := verifyFbAccessToken(body.AccessToken, appToken)
	if err != nil {
		serde.Error(w, "Invalid Facebook access token provided", http.StatusInternalServerError)
		return
	}

	// check if fb user already exists
	var userID int
	state.Conn.QueryRow(
		"SELECT user_id FROM secret.user_fb WHERE fb_id LIKE $1",
		fbID).Scan(&userID)

	// register new user if doesn't exist in db
	if userID == 0 {
		userID, err = registerFbUser(state, body.AccessToken, fbID)
		if err != nil {
			serde.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
	}

	// return Hasura JWT
	json.NewEncoder(w).Encode(serde.MakeAndSignHasuraJWT(userID, []byte(os.Getenv("HASURA_GRAPHQL_JWT_KEY"))))
}
