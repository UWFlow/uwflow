package sub

import (
	"bytes"
	"fmt"
	"html/template"
	"net/smtp"

	"flow/common/state"
)

func SendAutomatedEmail(state *state.State, to []string, subject string, htmlTemplate string, data interface{}) error {
	var emailBody bytes.Buffer
	header := "MIME-version: 1.0\nContent-Type: text/html;charset=\"UTF-8\";\n"
	emailBody.Write([]byte(header))

	t, err := template.New("email").Parse(htmlTemplate)
	if err != nil {
		return fmt.Errorf("failed to format email to %w", to[0])
	}
	t.Execute(&emailBody, data)

	// Set up authentication information for Gmail server
	from := state.Env.GmailUser
	auth := smtp.PlainAuth("", from, state.Env.GmailAppPassword, "smtp.gmail.com")
	msg := []byte(fmt.Sprintf("To: %s\r\n", to[0]) +
		fmt.Sprintf("Subject: %s\r\n", subject) +
		fmt.Sprintf("%s\r\n", emailBody.String()))
	err = smtp.SendMail("smtp.gmail.com:587", auth, from, to, msg)
	if err != nil {
		return fmt.Errorf("failed to send email to %w", to[0])
	}
	return nil
}
