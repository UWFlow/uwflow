package events

import (
	"sync"
	"time"

	"golang.org/x/time/rate"
)

// ipRateLimiter is a small in-memory per-IP token-bucket limiter. It is a thin
// map of client IP -> *rate.Limiter with a background sweep that evicts idle
// entries so the map can't grow unbounded under a spray of unique IPs.
type ipRateLimiter struct {
	mu       sync.Mutex
	limiters map[string]*ipEntry
	rate     rate.Limit
	burst    int
}

type ipEntry struct {
	limiter  *rate.Limiter
	lastSeen time.Time
}

// newIPRateLimiter allows `perSecond` events per IP with a bucket of `burst`.
func newIPRateLimiter(perSecond float64, burst int) *ipRateLimiter {
	l := &ipRateLimiter{
		limiters: make(map[string]*ipEntry),
		rate:     rate.Limit(perSecond),
		burst:    burst,
	}
	go l.cleanupLoop()
	return l
}

// Allow reports whether a request from ip may proceed, consuming a token.
func (l *ipRateLimiter) Allow(ip string) bool {
	l.mu.Lock()
	defer l.mu.Unlock()

	e, ok := l.limiters[ip]
	if !ok {
		e = &ipEntry{limiter: rate.NewLimiter(l.rate, l.burst)}
		l.limiters[ip] = e
	}
	e.lastSeen = time.Now()
	return e.limiter.Allow()
}

// cleanupLoop evicts entries unused for a while, bounding memory.
func (l *ipRateLimiter) cleanupLoop() {
	ticker := time.NewTicker(10 * time.Minute)
	defer ticker.Stop()
	for range ticker.C {
		cutoff := time.Now().Add(-15 * time.Minute)
		l.mu.Lock()
		for ip, e := range l.limiters {
			if e.lastSeen.Before(cutoff) {
				delete(l.limiters, ip)
			}
		}
		l.mu.Unlock()
	}
}
