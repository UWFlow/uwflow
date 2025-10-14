package main

import (
	"context"
	"log"
	"net/http"
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

	"github.com/go-chi/chi/v5"
	chi_middleware "github.com/go-chi/chi/v5/middleware"
	"go.uber.org/zap"
)

func setupRouter(conn *db.Conn) *chi.Mux {
	router := chi.NewRouter()

	if env.Global.RunMode == "dev" {
		router.Use(middleware.CorsLocalhostMiddleware())
	} else {
		router.Use(middleware.CorsProductionMiddleware(env.Global.Domain))
	}

	router.Use(
		// Responses are typically JSON, with the notable exception of webcal.
		// We set the most common type here and override it as necessary.
		chi_middleware.SetHeader("Content-Type", "application/json"),
		chi_middleware.Logger,
		chi_middleware.Recoverer,
		chi_middleware.RequestID,
		chi_middleware.Timeout(10*time.Second),
		chi_middleware.Compress(5),
	)

	router.Post(
		"/auth/email/login",
		middleware.RateLimitMiddleware(serde.WithDbResponse(conn, auth.LoginEmail, "email login")),
	)
	router.Post(
		"/auth/email/register",
		middleware.RateLimitMiddleware(serde.WithDbResponse(conn, auth.RegisterEmail, "email register")),
	)
	router.Post(
		"/auth/facebook/login",
		middleware.RateLimitMiddleware(serde.WithDbResponse(conn, auth.LoginFacebook, "facebook login")),
	)
	router.Post(
		"/auth/google/login",
		middleware.RateLimitMiddleware(serde.WithDbResponse(conn, auth.LoginGoogle, "google login")),
	)

	router.Post(
		"/auth/refresh",
		middleware.RateLimitMiddleware(serde.WithDbResponse(conn, auth.RefreshToken, "refresh jwt token")),
	)

	router.Post(
		"/auth/forgot-password/send-email",
		middleware.RateLimitMiddleware(serde.WithDbNoResponse(conn, auth.SendEmail, "password reset initiation")),
	)
	router.Post(
		"/auth/forgot-password/verify",
		middleware.RateLimitMiddleware(serde.WithDbNoResponse(conn, auth.VerifyKey, "password reset verification")),
	)
	router.Post(
		"/auth/forgot-password/reset",
		middleware.RateLimitMiddleware(serde.WithDbNoResponse(conn, auth.ResetPassword, "password reset completion")),
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
	logger, _ := zap.NewProduction()
	defer logger.Sync()

	middleware.InitRedis(env.Global.Redis.Host, env.Global.Redis.Port)
	data.InitRedis(middleware.GetRedisClient())

	conn, err := db.ConnectPool(context.Background(), &env.Global)
	if err != nil {
		logger.Fatal("Error connecting to DB", zap.Error(err))
	}

	router := setupRouter(conn)
	socket := ":" + env.Global.ApiPort

	err = http.ListenAndServe(socket, router)
	log.Fatalf("Error: %s", err)
}
