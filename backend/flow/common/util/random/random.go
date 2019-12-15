package random

import "crypto/rand"

// Bytes returns securely generated random bytes.
// It will return an error if the system's secure random
// number generator fails to function correctly, in which
// case the caller should not continue.
func Bytes(n int) ([]byte, error) {
	b := make([]byte, n)
	_, err := rand.Read(b)
	// Note that err == nil only if we read len(b) bytes.
	if err != nil {
		return nil, err
	}
	return b, nil
}

const (
	uppercase  = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ"
	allLetters = uppercase + "abcdefghijklmnopqrstuvwxyz"
)
const (
	lenUppercase  = len(uppercase)
	lenAllLetters = len(allLetters)
)

type Alphabet int

const (
	Uppercase Alphabet = iota
	AllLetters
)

// String returns a securely generated random string.
// It will return an error if the system's secure random
// number generator fails to function correctly, in which
// case the caller should not continue.
func String(n int, alphabet Alphabet) (string, error) {
	bytes, err := Bytes(n)
	if err != nil {
		return "", err
	}
	if alphabet == AllLetters {
		for i, b := range bytes {
			bytes[i] = allLetters[b%byte(lenAllLetters)]
		}
	} else {
		for i, b := range bytes {
			bytes[i] = uppercase[b%byte(lenUppercase)]
		}
	}
	return string(bytes), nil
}
