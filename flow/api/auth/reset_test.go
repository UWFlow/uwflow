package auth

import (
	"context"
	"os"
	"strings"
	"testing"
	"time"

	"flow/common/db"
	commonenv "flow/common/env"
	"golang.org/x/crypto/bcrypt"
)

// These fixtures require an empty disposable database; all DDL is rolled back.
func TestPasswordResetTokenLifecycle(t *testing.T) {
	host := os.Getenv("TEST_POSTGRES_HOST")
	if host == "" {
		t.Skip("set TEST_POSTGRES_HOST to run PostgreSQL integration tests")
	}
	conn, err := db.ConnectPool(context.Background(), &commonenv.Environment{PostgresHost: host, PostgresPort: "5432", PostgresUser: "postgres", PostgresDatabase: "postgres"})
	if err != nil {
		t.Fatal(err)
	}
	tx, err := conn.Begin()
	if err != nil {
		t.Fatal(err)
	}
	defer tx.Rollback()
	_, err = tx.Exec(`CREATE SCHEMA queue; CREATE SCHEMA secret;
 CREATE TABLE secret.user_email (user_id integer PRIMARY KEY,email text,password_hash bytea);
 CREATE TABLE queue.password_reset (user_id integer PRIMARY KEY,secret_key text CHECK(length(secret_key)=32),expiry timestamptz,created_at timestamptz,seen_at timestamptz);
 INSERT INTO secret.user_email VALUES(1,'reset@example.com',NULL);`)
	if err != nil {
		t.Fatal(err)
	}
	if err := sendEmail(tx, "reset@example.com"); err != nil {
		t.Fatal(err)
	}
	var key string
	if err := tx.QueryRow(`SELECT secret_key FROM queue.password_reset`).Scan(&key); err != nil {
		t.Fatal(err)
	}
	if len(key) != 32 {
		t.Fatalf("short reset token: length %d", len(key))
	}
	if err := resetPassword(tx, key, "new-password-for-test"); err != nil {
		t.Fatal(err)
	}
	var hash []byte
	if err := tx.QueryRow(`SELECT password_hash FROM secret.user_email WHERE user_id=1`).Scan(&hash); err != nil {
		t.Fatal(err)
	}
	if err := bcrypt.CompareHashAndPassword(hash, []byte("new-password-for-test")); err != nil {
		t.Fatal(err)
	}
	if err := resetPassword(tx, key, "replayed-password"); err == nil || strings.Contains(err.Error(), key) {
		t.Fatalf("replay allowed or token logged: %v", err)
	}
	if _, err := tx.Exec(`INSERT INTO queue.password_reset(user_id,secret_key,expiry) VALUES(1,$1,$2)`, key, time.Now().Add(-time.Hour)); err != nil {
		t.Fatal(err)
	}
	if err := resetPassword(tx, key, "expired-password"); err == nil {
		t.Fatal("expired reset accepted")
	}
}
