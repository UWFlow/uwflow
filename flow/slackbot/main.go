// slackbot answers questions about UWFlow's data in Slack.
// It receives mentions and direct messages over Socket Mode, passes the thread
// to Claude, and lets Claude inspect the schema and run read-only SQL against
// Postgres as a dedicated low-privilege role.
package main

import (
	"context"
	"fmt"
	"log"
	"os/signal"
	"syscall"

	"flow/common/db"
	"flow/common/env"
)

func main() {
	ctx, stop := signal.NotifyContext(context.Background(), syscall.SIGINT, syscall.SIGTERM)
	defer stop()

	cfg, err := loadConfig(ctx)
	if err != nil {
		log.Fatal(err)
	}

	conn, err := db.ConnectPool(ctx, &env.Environment{
		PostgresUser:     cfg.PostgresUser,
		PostgresPassword: cfg.PostgresPassword,
		PostgresHost:     cfg.PostgresHost,
		PostgresPort:     cfg.PostgresPort,
		PostgresDatabase: cfg.PostgresDatabase,
	})
	if err != nil {
		log.Fatal(err)
	}
	if err := checkRole(conn); err != nil {
		log.Fatal(err)
	}

	b, err := newBot(ctx, cfg.SlackBotToken, cfg.SlackAppToken, newAgent(cfg.AnthropicApiKey, conn))
	if err != nil {
		log.Fatal(err)
	}
	if err := b.run(ctx); err != nil && ctx.Err() == nil {
		log.Fatal(err)
	}
}

// checkRole refuses to start as a role that can bypass the read-only grants.
func checkRole(conn *db.Conn) error {
	var user string
	var super, bypassRLS bool
	err := conn.QueryRow(
		"SELECT rolname, rolsuper, rolbypassrls FROM pg_roles WHERE rolname = current_user",
	).Scan(&user, &super, &bypassRLS)
	if err != nil {
		return fmt.Errorf("checking database role: %w", err)
	}
	if super || bypassRLS {
		return fmt.Errorf("database role %s is privileged; connect as the read-only role from role.sql", user)
	}
	log.Printf("connected to Postgres as %s", user)
	return nil
}
