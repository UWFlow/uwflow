package test

import (
	"bytes"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/AyushK1/uwflow2.0/backend/api/auth"
	"github.com/AyushK1/uwflow2.0/backend/api/state"
)

func TestSendEmailInvalidEmail(t *testing.T) {
	state, _ := state.Initialize()
	ts := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		auth.SendEmail(state, w, r)
	}))
	defer ts.Close()

	jsonStr := []byte(`{"email":"invalid"}`)
	req, err := http.NewRequest("POST", ts.URL, bytes.NewBuffer(jsonStr))
	req.Header.Set("Content-Type", "application/json")

	client := &http.Client{}
	res, err := client.Do(req)
	if err != nil {
		t.Fatal(err.Error())
	}
	if res.StatusCode != 400 {
		t.Fatalf("Expected 400 error, got %d", res.StatusCode)
	}
}

func TestVerifyResetCodeInvalid(t *testing.T) {
	state, _ := state.Initialize()
	ts := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		auth.VerifyResetCode(state, w, r)
	}))
	defer ts.Close()

	req, err := http.NewRequest("POST", ts.URL+"?key=BlAhBlaH", bytes.NewBuffer([]byte("")))
	req.Header.Set("Content-Type", "application/json")

	client := &http.Client{}
	res, err := client.Do(req)
	if err != nil {
		t.Fatal(err.Error())
	}
	if res.StatusCode != 403 {
		t.Fatalf("Expected 403 error, got %d", res.StatusCode)
	}
}

func TestResetPasswordInvalidCode(t *testing.T) {
	state, _ := state.Initialize()
	ts := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		auth.ResetPassword(state, w, r)
	}))
	defer ts.Close()

	jsonStr := []byte(`{"key":"invalid", "password":"blah"}`)
	req, err := http.NewRequest("POST", ts.URL, bytes.NewBuffer(jsonStr))
	req.Header.Set("Content-Type", "application/json")

	client := &http.Client{}
	res, err := client.Do(req)
	if err != nil {
		t.Fatal(err.Error())
	}
	if res.StatusCode != 400 {
		t.Fatalf("Expected 400 error, got %d", res.StatusCode)
	}
}
