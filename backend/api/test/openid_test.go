package test

import (
	"bytes"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/AyushK1/uwflow2.0/backend/api/auth"
	"github.com/AyushK1/uwflow2.0/backend/api/state"
)

var w = httptest.NewRecorder()

func TestFbNoToken(t *testing.T) {
	state, err := state.Initialize()
	ts := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		auth.AuthenticateFbUser(state, w, r)
	}))
	defer ts.Close()
	res, err := http.Get(ts.URL)
	if err != nil {
		t.Fatalf(err.Error())
	}
	if res.StatusCode != 400 {
		t.Fatalf("Expected 400 error, got %d", res.StatusCode)
	}
}

func TestFbInvalidToken(t *testing.T) {
	state, err := state.Initialize()
	ts := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		auth.AuthenticateFbUser(state, w, r)
	}))
	defer ts.Close()

	jsonStr := []byte(`{"access_token":"blahblahInvalidTokenblah"}`)
	req, err := http.NewRequest("POST", ts.URL, bytes.NewBuffer(jsonStr))
	req.Header.Set("Content-Type", "application/json")

	client := &http.Client{}
	res, err := client.Do(req)
	if err != nil {
		t.Fatalf(err.Error())
	}
	if res.StatusCode != 500 {
		t.Fatalf("Expected 500 error, got %d", res.StatusCode)
	}
}

func TestGoogleNoToken(t *testing.T) {
	state, err := state.Initialize()
	ts := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		auth.AuthenticateGoogleUser(state, w, r)
	}))
	defer ts.Close()
	res, err := http.Get(ts.URL)
	if err != nil {
		t.Fatalf(err.Error())
	}
	if res.StatusCode != 400 {
		t.Fatalf("Expected 400 error, got %d", res.StatusCode)
	}
}

func TestGoogleInvalidToken(t *testing.T) {
	state, err := state.Initialize()
	ts := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		auth.AuthenticateGoogleUser(state, w, r)
	}))
	defer ts.Close()

	jsonStr := []byte(`{"id_token":"blahblahInvalidTokenblah"}`)
	req, err := http.NewRequest("POST", ts.URL, bytes.NewBuffer(jsonStr))
	req.Header.Set("Content-Type", "application/json")

	client := &http.Client{}
	res, err := client.Do(req)
	if err != nil {
		t.Fatalf(err.Error())
	}
	if res.StatusCode != 500 {
		t.Fatalf("Expected 500 error, got %d", res.StatusCode)
	}
}
