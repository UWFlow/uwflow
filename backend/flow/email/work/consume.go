package work

import (
	"bytes"
	"flow/api/env"
	"flow/email/common"
	"fmt"
	"log"
	"net/smtp"
)

func consumeEmailItems(mch chan *common.MailItem, ech chan error) {
	var err error
	var item *common.MailItem

	for {
		item = <-mch
		err = send(*item)
		if err != nil {
			ech <- err
		}
	}
}

func writeHeader(buf *bytes.Buffer, key, value string) {
	(*buf).WriteString(key)
	(*buf).WriteString(": ")
	(*buf).WriteString(value)
	(*buf).WriteString("\r\n")
}

func send(item common.MailItem) error {
	// Set up authentication information for Gmail server
	from := env.Global.GmailUser
	auth := smtp.PlainAuth("", from, env.Global.GmailAppPassword, "smtp.gmail.com")

	var buf bytes.Buffer
	writeHeader(&buf, "To", item.To)
	writeHeader(&buf, "Subject", item.Subject)
	buf.Write([]byte("MIME-version: 1.0;\nContent-Type: text/html;charset=\"UTF-8\";\n"))
	buf.WriteString(item.Body)

	err := smtp.SendMail("smtp.gmail.com:587", auth, from, []string{item.To}, buf.Bytes())
	if err != nil {
		return fmt.Errorf("failed to send email to %w", item.To)
	}

	log.Printf("%+v", item)
	return nil
}
