// Package stmp is a thin net/smtp wrapper handling authentication.
package smtp

import (
	"bytes"
	"encoding/base64"
	"fmt"
	"log"
	"net/smtp"
	"os"

	"flow/email/format"
)

var (
	from string
	pass string

	fromLong string

	auth smtp.Auth
)

func init() {
	var ok bool

	if from, ok = os.LookupEnv("MAIL_USER"); !ok {
		log.Fatal("Environment variable not found: MAIL_USER")
	}
	if pass, ok = os.LookupEnv("MAIL_PASSWORD"); !ok {
		log.Fatal("Environment variable not found: MAIL_PASSWORD")
	}

	fromLong = fmt.Sprintf("UW Flow <%s>", from)
	auth = smtp.PlainAuth("", from, pass, "smtp-relay.sendinblue.com")
}

func writeASCIIHeader(buf *bytes.Buffer, key, value string) {
	buf.WriteString(key)
	buf.WriteString(": ")
	buf.WriteString(value)
	buf.WriteString("\r\n")
}

func writeUTF8Header(buf *bytes.Buffer, key, value string) {
	buf.WriteString(key)
	buf.WriteString(": =?utf-8?B?")

	enc := base64.NewEncoder(base64.URLEncoding, buf)
	enc.Write([]byte(value))
	enc.Close()

	buf.WriteString("?=\r\n")
}

func writeSMTPHeaders(buf *bytes.Buffer, msg format.Message) {
	writeASCIIHeader(buf, "From", fromLong)
	writeASCIIHeader(buf, "To", msg.To)
	writeUTF8Header(buf, "Subject", msg.Subject)
	writeASCIIHeader(buf, "MIME-version", "1.0")
	writeASCIIHeader(buf, "Content-Type", `text/html;charset="utf-8"`)
	buf.WriteString("\r\n")
}

func Send(msg format.Message) error {
	var buf bytes.Buffer

	writeSMTPHeaders(&buf, msg)
	buf.Write(msg.Body)

	err := smtp.SendMail("smtp-relay.sendinblue.com:587", auth, from, []string{msg.To}, buf.Bytes())
	if err != nil {
		return fmt.Errorf("sending %q to %s: %w", msg.Subject, msg.To, err)
	}

	log.Printf("sent %q to %s", msg.Subject, msg.To)
	return nil
}
