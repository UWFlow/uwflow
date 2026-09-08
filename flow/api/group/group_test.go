package group

import (
	"context"
	"errors"
	"net/http"
	"net/http/httptest"
	"os"
	"testing"

	apienv "flow/api/env"
	"flow/api/serde"
	"flow/common/db"
	commonenv "flow/common/env"

	"github.com/go-chi/chi/v5"
)

// Run with TEST_POSTGRES_HOST set to a disposable PostgreSQL instance using
// trust authentication, e.g. TEST_POSTGRES_HOST=127.0.0.1 go test ./api/group.
// All fixtures are temporary tables in a transaction that is rolled back.
func TestAcceptEmailInviteRecipient(t *testing.T) {
	host := os.Getenv("TEST_POSTGRES_HOST")
	if host == "" {
		t.Skip("set TEST_POSTGRES_HOST to run PostgreSQL integration tests")
	}
	conn, err := db.ConnectPool(context.Background(), &commonenv.Environment{
		PostgresHost: host, PostgresPort: "5432", PostgresUser: "postgres", PostgresDatabase: "postgres",
	})
	if err != nil {
		t.Fatal(err)
	}
	oldKey := apienv.Global.JwtKey
	apienv.Global.JwtKey = []byte("invite-regression-test-signing-key")
	t.Cleanup(func() { apienv.Global.JwtKey = oldKey })

	for _, pending := range []bool{false, true} {
		name := "new recipient"
		if pending {
			name = "pending recipient"
		}
		t.Run(name, func(t *testing.T) {
			tx, err := conn.Begin()
			if err != nil {
				t.Fatal(err)
			}
			defer tx.Rollback()
			_, err = tx.Exec(`
    CREATE TEMP TABLE "user" (id integer PRIMARY KEY, email text) ON COMMIT DROP;
    CREATE TEMP TABLE shared_group_invite (id integer PRIMARY KEY, group_id integer, invited_email text, secret_key text) ON COMMIT DROP;
    CREATE TEMP TABLE shared_group_member (group_id integer, user_id integer REFERENCES "user"(id), status text, PRIMARY KEY (group_id,user_id)) ON COMMIT DROP;
    INSERT INTO "user" VALUES (1,'owner@example.test'), (2,'Recipient@Example.Test'), (3,'other@example.test'), (4,NULL);
    INSERT INTO shared_group_member VALUES (9,1,'member');
    INSERT INTO shared_group_invite VALUES (1,9,'recipient@example.test','0123456789abcdef0123456789abcdef');
   `)
			if err != nil {
				t.Fatal(err)
			}
			if pending {
				if _, err = tx.Exec(`INSERT INTO shared_group_member VALUES (9,2,'pending')`); err != nil {
					t.Fatal(err)
				}
			}
			accept := func(userID int, secret string) (interface{}, error) {
				token, err := serde.NewSignedJwt(userID)
				if err != nil {
					t.Fatal(err)
				}
				r := httptest.NewRequest(http.MethodPost, "/group/invite/"+secret+"/accept", nil)
				r.Header.Set("Authorization", "Bearer "+token)
				route := chi.NewRouteContext()
				route.URLParams.Add("secret", secret)
				r = r.WithContext(context.WithValue(r.Context(), chi.RouteCtxKey, route))
				return AcceptEmailInvite(tx, r)
			}
			assertStatus := func(err error, want int) {
				t.Helper()
				var status interface{ Status() int }
				if !errors.As(err, &status) || status.Status() != want {
					t.Fatalf("want HTTP %d, got %v", want, err)
				}
			}
			// Neither an existing member nor another account may burn the link.
			for _, id := range []int{1, 3, 4} {
				_, err := accept(id, "0123456789abcdef0123456789abcdef")
				assertStatus(err, http.StatusForbidden)
			}
			var invites, unexpectedMembers int
			if err := tx.QueryRow(`SELECT count(*) FROM shared_group_invite`).Scan(&invites); err != nil {
				t.Fatal(err)
			}
			if err := tx.QueryRow(`SELECT count(*) FROM shared_group_member WHERE user_id IN (3,4)`).Scan(&unexpectedMembers); err != nil {
				t.Fatal(err)
			}
			if invites != 1 || unexpectedMembers != 0 {
				t.Fatalf("wrong account changed state: invites=%d, members=%d", invites, unexpectedMembers)
			}
			_, err = accept(2, "ffffffffffffffffffffffffffffffff")
			assertStatus(err, http.StatusNotFound)
			result, err := accept(2, "0123456789abcdef0123456789abcdef")
			if err != nil {
				t.Fatal(err)
			}
			if result.(map[string]interface{})["group_id"] != 9 {
				t.Fatalf("unexpected result: %v", result)
			}
			var status string
			if err := tx.QueryRow(`SELECT status FROM shared_group_member WHERE group_id=9 AND user_id=2`).Scan(&status); err != nil {
				t.Fatal(err)
			}
			if status != "member" {
				t.Fatalf("recipient status=%s", status)
			}
			if err := tx.QueryRow(`SELECT count(*) FROM shared_group_invite`).Scan(&invites); err != nil {
				t.Fatal(err)
			}
			if invites != 0 {
				t.Fatal("accepted invite was not consumed")
			}
			_, err = accept(2, "0123456789abcdef0123456789abcdef")
			assertStatus(err, http.StatusNotFound)
		})
	}
}
