package middleware

import (
	"fmt"
	"net"
	"net/http"
	"net/url"
	"time"

	"github.com/redis/go-redis/v9"
	"golang.org/x/time/rate"
)

// Rate limiter using Redis for distributed rate limiting
var redisClient *redis.Client

func InitRedis(host, port string) {
	redisClient = redis.NewClient(&redis.Options{
		Addr: fmt.Sprintf("%s:%s", host, port),
	})
}

func GetRedisClient() *redis.Client {
	return redisClient
}
func RateLimitMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		ip, _, err := net.SplitHostPort(r.RemoteAddr)
		if err != nil {
			ip = r.RemoteAddr
		}

		key := fmt.Sprintf("rate_limit:%s", ip)
		count, err := redisClient.Incr(r.Context(), key).Result()
		if err != nil {
			// If Redis fails, allow request (fail open)
			next.ServeHTTP(w, r)
			return
		}

		if count == 1 {
			redisClient.Expire(r.Context(), key, time.Minute)
		}

		if count > 5 {
			http.Error(w, "Too many requests", http.StatusTooManyRequests)
			return
		}

		next.ServeHTTP(w, r)
	})
}

// GetLimiter returns a rate limiter for the given IP
func GetLimiter(ip string) *rate.Limiter {
	mu.Lock()
	defer mu.Unlock()

	limiter, exists := limiters[ip]
	if !exists {
		limiter = rate.NewLimiter(rateLimit, burst)
		limiters[ip] = limiter
	}

	return limiter
}

// RateLimitMiddleware applies rate limiting based on IP
func RateLimitMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		ip, _, err := net.SplitHostPort(r.RemoteAddr)
		if err != nil {
			ip = r.RemoteAddr
		}

		limiter := GetLimiter(ip)
		if !limiter.Allow() {
			http.Error(w, "Too many requests", http.StatusTooManyRequests)
			return
		}

		next.ServeHTTP(w, r)
	})
}

// CORS middleware for localhost environments
func CorsLocalhostMiddleware() func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			// Extract the host from the origin URL
			if parsedURL, err := url.Parse(r.Header.Get("Origin")); err == nil {
				host, _, err := net.SplitHostPort(parsedURL.Host)
				if err != nil {
					// If SplitHostPort fails, use the original host (no port present)
					host = parsedURL.Host
				}
				if host == "localhost" {
					w.Header().Set("Access-Control-Allow-Origin", r.Header.Get("Origin"))
					w.Header().Set("Access-Control-Allow-Methods", "POST, GET, OPTIONS, DELETE")
					w.Header().Set("Access-Control-Allow-Headers", "Accept, Authorization, Content-Type, X-CSRF-Token")
					w.Header().Set("Access-Control-Allow-Credentials", "true")
				}
			}

			// Stop here for a Preflighted OPTIONS request.
			if r.Method == "OPTIONS" {
				w.WriteHeader(http.StatusOK)
				return
			}

			next.ServeHTTP(w, r)
		})
	}
}

// CorsProductionMiddleware allows CORS for the specified domain in production
func CorsProductionMiddleware(allowedOrigin string) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			origin := r.Header.Get("Origin")
			if origin == "https://"+allowedOrigin || origin == "http://"+allowedOrigin {
				w.Header().Set("Access-Control-Allow-Origin", origin)
				w.Header().Set("Access-Control-Allow-Methods", "POST, GET, OPTIONS, DELETE")
				w.Header().Set("Access-Control-Allow-Headers", "Accept, Authorization, Content-Type, X-CSRF-Token")
				w.Header().Set("Access-Control-Allow-Credentials", "true")
			}

			if r.Method == "OPTIONS" {
				w.WriteHeader(http.StatusOK)
				return
			}

			next.ServeHTTP(w, r)
		})
	}
}
