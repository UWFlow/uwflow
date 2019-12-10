package serde

import (
	"encoding/json"
	"fmt"
	"net/http"

	"flow/common/db"
)

type DirectHandlerFunc func(*db.Conn, http.ResponseWriter, *http.Request) error

func WithDbDirect(conn *db.Conn, handler DirectHandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		err := handler(conn, w, r)
		if err != nil {
			Error(w, r, err)
		}
	}
}

type ResponseHandlerFunc func(*db.Tx, *http.Request) (interface{}, error)

func WithDbResponse(conn *db.Conn, handler ResponseHandlerFunc) http.HandlerFunc {
	inner := func(r *http.Request) (interface{}, error) {
		tx, err := conn.BeginWithContext(r.Context())
		if err != nil {
			return nil, fmt.Errorf("opening transaction: %w", err)
		}
		defer tx.Rollback()

		resp, err := handler(tx, r)
		if err != nil {
			return nil, err
		}

		err = tx.Commit()
		if err != nil {
			return nil, fmt.Errorf("committing: %w", err)
		}

		return resp, nil
	}

	return func(w http.ResponseWriter, r *http.Request) {
		resp, err := inner(r)
		if err != nil {
			Error(w, r, err)
		} else if resp != nil {
			json.NewEncoder(w).Encode(resp)
		}
	}
}

type NoResponseHandlerFunc func(*db.Tx, *http.Request) error

func WithDbNoResponse(conn *db.Conn, handler NoResponseHandlerFunc) http.HandlerFunc {
	inner := func(r *http.Request) error {
		tx, err := conn.BeginWithContext(r.Context())
		if err != nil {
			return fmt.Errorf("opening transaction: %w", err)
		}
		defer tx.Rollback()

		err = handler(tx, r)
		if err != nil {
			return err
		}

		err = tx.Commit()
		if err != nil {
			return fmt.Errorf("committing: %w", err)
		}

		return nil
	}

	return func(w http.ResponseWriter, r *http.Request) {
		err := inner(r)
		if err != nil {
			Error(w, r, err)
		} else {
			w.WriteHeader(http.StatusOK)
		}
	}
}
