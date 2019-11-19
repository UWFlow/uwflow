package sub

import (
	"fmt"
	"net/smtp"

	"github.com/AyushK1/uwflow2.0/backend/api/state"
)

func SendAutomatedEmail(state *state.State, to []string, subject string, body string) error {
	// Set up authentication information for Gmail server
	from := state.Env.GmailUser
	auth := smtp.PlainAuth("", from, state.Env.GmailAppPassword, "smtp.gmail.com")
	msg := []byte(fmt.Sprintf("To: %s\r\n", to[0]) +
		fmt.Sprintf("Subject: %s\r\n", subject) +
		"\r\n" +
		fmt.Sprintf("%s\r\n", body))
	err := smtp.SendMail("smtp.gmail.com:587", auth, from, to, msg)
	if err != nil {
		return fmt.Errorf("failed to send email to %w", to[0])
	}
	return nil
}
