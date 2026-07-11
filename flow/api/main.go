package main

import (
	"context"
	"log"
	"net/http"
	"os"
	"time"
	_ "time/tzdata"

	"flow/api/auth"
	"flow/api/calendar"
	"flow/api/data"
	"flow/api/env"
	"flow/api/middleware"
	"flow/api/parse"
	"flow/api/serde"

	"flow/common/db"

	"github.com/getsentry/sentry-go"
	"github.com/go-chi/chi/v5"
	chi_middleware "github.com/go-chi/chi/v5/middleware"
)

func setupRouter(conn *db.Conn) *chi.Mux {
	router := chi.NewRouter()

	if env.Global.RunMode == "dev" {
		router.Use(middleware.CorsLocalhostMiddleware())
	}

	router.Use(
		// Responses are typically JSON, with the notable exception of webcal.
		// We set the most common type here and override it as necessary.
		chi_middleware.SetHeader("Content-Type", "application/json"),
		chi_middleware.Logger,
		chi_middleware.Recoverer,
		chi_middleware.RequestID,
		chi_middleware.Timeout(10*time.Second),
	)

	router.Post(
		"/auth/email/login",
		serde.WithDbResponse(conn, auth.LoginEmail, "email login"),
	)
	router.Post(
		"/auth/email/register",
		serde.WithDbResponse(conn, auth.RegisterEmail, "email register"),
	)
	router.Post(
		"/auth/facebook/login",
		serde.WithDbResponse(conn, auth.LoginFacebook, "facebook login"),
	)
	router.Post(
		"/auth/google/login",
		serde.WithDbResponse(conn, auth.LoginGoogle, "google login"),
	)

	router.Post(
		"/auth/refresh",
		serde.WithDbResponse(conn, auth.RefreshToken, "refresh jwt token"),
	)

	router.Post(
		"/auth/forgot-password/send-email",
		serde.WithDbNoResponse(conn, auth.SendEmail, "password reset initiation"),
	)
	router.Post(
		"/auth/forgot-password/verify",
		serde.WithDbNoResponse(conn, auth.VerifyKey, "password reset verification"),
	)
	router.Post(
		"/auth/forgot-password/reset",
		serde.WithDbNoResponse(conn, auth.ResetPassword, "password reset completion"),
	)

	router.Post(
		"/parse/transcript",
		serde.WithDbResponse(conn, parse.HandleTranscript, "transcript upload"),
	)
	router.Post(
		"/parse/schedule",
		serde.WithDbResponse(conn, parse.HandleSchedule, "schedule upload"),
	)

	router.Get(
		"/data/search",
		serde.WithDbResponse(conn, data.HandleSearch, "search data dump"),
	)

	router.Get(
		"/calendar/{secretId}.ics",
		serde.WithDbDirect(conn, calendar.HandleCalendar, "calendar generation"),
	)

	router.Delete(
		"/user",
		serde.WithDbDirect(conn, auth.DeleteAccount, "account deletion"),
	)

	return router
}

func main() {
	env.Init()

	if dsn := os.Getenv("SENTRY_DSN_API"); dsn != "" {
		err := sentry.Init(sentry.ClientOptions{
			Dsn:         dsn,
			Environment: env.Global.RunMode,
		})
		if err != nil {
			log.Printf("sentry.Init: %s", err)
		}
	}

	conn, err := db.ConnectPool(context.Background(), &env.Global)
	if err != nil {
		log.Fatalf("Error: %s", err)
	}

	router := setupRouter(conn)
	socket := ":" + env.Global.ApiPort

	err = http.ListenAndServe(socket, router)
	// The server is not expected to return: report this as a fatal event.
	// log.Fatalf calls os.Exit, which skips deferred calls, so flush here
	// synchronously rather than deferring it.
	sentry.CaptureException(err)
	sentry.Flush(2 * time.Second)
	log.Fatalf("Error: %s", err)
}
