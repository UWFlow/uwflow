package auth

import (
	"encoding/json"
	"io/ioutil"
	"net/http"

	"github.com/AyushK1/uwflow2.0/backend/api/db"
	"github.com/AyushK1/uwflow2.0/backend/api/serde"

	"golang.org/x/crypto/bcrypt"
)

type EmailAuthRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

type EmailAuthRecord struct {
	Id       int    `db:"id"`
	Email    string `db:"email"`
	Password []byte `db:"password"`
}

// This is the string "password", hashed
// If no email is found, we try to match against this,
// thereby faithfully emulating a legitimate bcrypt delay
const fakeHash = "$2b$12$.6SjO/j0qspENIWCnVAk..34gBq5TGG1FtBsnfMRCzsrKg3Tm7XsG"

func authenticate(email string, password []byte) (int, error) {
	target := EmailAuthRecord{Password: []byte(fakeHash)}
	dbErr := db.Handle.Get(&target,
		"SELECT id, password FROM secret.user_email WHERE email = $1",
		email)
	// Always attempt auth to prevent enumeration of valid emails
	authErr := bcrypt.CompareHashAndPassword(target.Password, password)
	if dbErr != nil {
		return target.Id, dbErr
	} else {
		return target.Id, authErr
	}
}

func AuthenticateEmail(w http.ResponseWriter, r *http.Request) {
	rawBody, err := ioutil.ReadAll(r.Body)
	if err != nil {
		panic(err)
	}

	body := EmailAuthRequest{}
	err = json.Unmarshal(rawBody, &body)
	if err != nil {
		serde.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	if body.Email == "" || body.Password == "" {
		serde.Error(w, "Expected {email, password}", http.StatusBadRequest)
		return
	}

	id, err := authenticate(body.Email, []byte(body.Password))
	if err != nil {
		serde.Error(w, "Invalid credentials", http.StatusUnauthorized)
		return
	}

	json.NewEncoder(w).Encode(MakeHasuraJWT(id))
}
