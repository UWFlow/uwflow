package auth

import (
	"encoding/json"
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
	return body.Data["user_id"].(string), nil
}

func registerFbUser(state *state.State, accessToken string, fbID string) (int, error) {
	fields := []string{"name"}
	userInfo, err := GetFbUserInfo(fbID, accessToken, fields)
	if err != nil {
		return 0, err
	}
	profilePicURL := fmt.Sprintf(
		"https://graph.facebook.com/%s/picture?type=large", fbID,
	)

	var userID int
	err = state.Conn.QueryRow(
		"INSERT INTO \"user\"(full_name, picture_url) VALUES ($1, $2) RETURNING id",
		userInfo["name"].(string), profilePicURL,
	).Scan(&userID)
	if err != nil {
		return 0, err
	}
	state.Conn.Exec(
		"INSERT INTO secret.user_fb(user_id, fb_id) VALUES ($1, $2)",
		userID, fbID,
	)
	return userID, nil
}

func AuthenticateFbUser(state *state.State, w http.ResponseWriter, r *http.Request) {
	body := fbAuthLoginRequest{}
	err := json.NewDecoder(r.Body).Decode(&body)
	if err != nil {
		serde.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	if body.AccessToken == "" {
		serde.Error(w, "Expected {access_token}", http.StatusBadRequest)
		return
	}

	appToken, err := GetFbAppToken()
	if err != nil {
		serde.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	fbID, err := verifyFbAccessToken(body.AccessToken, appToken)
	if err != nil {
		serde.Error(w, "Invalid Facebook access token provided", http.StatusInternalServerError)
	}

	var userID int
	state.Conn.QueryRow("SELECT user_id FROM secret.user_fb WHERE fb_id LIKE $1", fbID).Scan(&userID)
	// if err != nil {
	// 	serde.Error(w, err.Error(), http.StatusInternalServerError)
	// 	return
	// }

	if userID == 0 {
		userID, err = registerFbUser(state, body.AccessToken, fbID)
		if err != nil {
			serde.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
	}

	json.NewEncoder(w).Encode(serde.MakeAndSignHasuraJWT(userID, []byte(os.Getenv("HASURA_GRAPHQL_JWT_KEY"))))
}
