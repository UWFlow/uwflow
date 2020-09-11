// Package stmp is a thin net/smtp wrapper handling authentication.
package smtp

import (
	"bytes"
	"encoding/base64"
	"fmt"
	"log"
	"net/smtp"

	"flow/common/env"
	"flow/email/format"
)

var creds struct {
	Server string `from:"SMTP_SERVER"`
	Port   string `from:"SMTP_PORT"`
	User   string `from:"SMTP_USER"`
	Pass   string `from:"SMTP_PASSWORD"`
}

var (
	auth smtp.Auth

	from string
	host string
)

func init() {
	if err := env.Get(&creds); err != nil {
		log.Fatal(err)
	}

	from = fmt.Sprintf("UW Flow <%s>", creds.User)
	host = fmt.Sprintf("%s:%s", creds.Server, creds.Port)
	auth = smtp.PlainAuth("", creds.User, creds.Pass, creds.Server)
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
	writeASCIIHeader(buf, "From", from)
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

	err := smtp.SendMail(host, auth, creds.User, []string{msg.To}, buf.Bytes())
	if err != nil {
		return fmt.Errorf("sending %q to %s: %w", msg.Subject, msg.To, err)
	}

	log.Printf("sent %q to %s", msg.Subject, msg.To)
	return nil
}
