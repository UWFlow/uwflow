package util

type empty struct{}
type FallibleClosure func() error
type Semaphore chan empty

// At most this many concurrent goroutines at any time.
// TODO: we should be backing off gracefully if this is too high.
const RateLimit = 10

func runOne(f FallibleClosure, sema Semaphore, errors chan error) {
	// Block on acquiring semaphore while entering violates RateLimit
	sema <- empty{}
	errors <- f()
	// Release the semaphore on exit
	<-sema
}

func RunConcurrently(funcs []FallibleClosure) (int, int) {
	sema := make(Semaphore, RateLimit)
	errors := make(chan error, len(funcs))
	for _, f := range funcs {
		go runOne(f, sema, errors)
	}
	succeeded, failed, N := 0, 0, len(funcs)
	for succeeded+failed < N {
		err := <-errors
		if err != nil {
			failed++
		} else {
			succeeded++
		}
	}
	return succeeded, failed
}
