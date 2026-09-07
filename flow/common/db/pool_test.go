package db

import (
	"context"
	"flow/common/env"
	"testing"
)

func TestDatabaseURLPreservesTLSAndPoolLimit(t *testing.T) {
	conn, err := ConnectPool(context.Background(), &env.Environment{
		DatabaseURL:  "postgres://preview:password@ep-example.neon.tech/flow?sslmode=verify-full&pool_max_conns=5",
		PostgresHost: "legacy-host-must-not-be-used",
	})
	if err != nil {
		t.Fatal(err)
	}
	defer conn.pool.Close()
	config := conn.pool.Config()
	if config.MaxConns != 5 || config.ConnConfig.Host != "ep-example.neon.tech" {
		t.Fatal("DATABASE_URL must override legacy configuration and preserve the connection limit")
	}
	if config.ConnConfig.TLSConfig == nil || config.ConnConfig.TLSConfig.InsecureSkipVerify {
		t.Fatal("Neon connection must verify TLS")
	}
}

func TestLegacyDatabaseConfiguration(t *testing.T) {
	conn, err := ConnectPool(context.Background(), &env.Environment{
		PostgresUser: "flow", PostgresPassword: "local", PostgresHost: "localhost",
		PostgresPort: "5432", PostgresDatabase: "flow",
	})
	if err != nil {
		t.Fatal(err)
	}
	defer conn.pool.Close()
	if conn.pool.Config().ConnConfig.Host != "localhost" {
		t.Fatal("legacy configuration changed")
	}
}
