// Package stmp is a thin net/smtp wrapper handling authentication.
package smtp

import (
	"fmt"
	"log"
	"net/smtp"
	"os"

	"flow/email/format"
)

var (
	from string
	pass string

	auth smtp.Auth
)

func init() {
	var ok bool

	if from, ok = os.LookupEnv("GMAIL_USER"); !ok {
		log.Fatal("Environment variable not found: GMAIL_USER")
	}
	if pass, ok = os.LookupEnv("GMAIL_APP_PASSWORD"); !ok {
		log.Fatal("Environment variable not found: GMAIL_APP_PASSWORD")
	}

	auth = smtp.PlainAuth("", from, pass, "smtp.gmail.com")
}

func Send(msg format.Message) error {
	err := smtp.SendMail("smtp.gmail.com:587", auth, from, []string{msg.To}, msg.Body)
	if err != nil {
		return fmt.Errorf("sending %q to %s: %w", msg.Subject, msg.To, err)
	}

	log.Printf("sent %q to %s", msg.Subject, msg.To)
	return nil
}
