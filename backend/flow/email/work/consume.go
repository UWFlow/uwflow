package work

import (
	"flow/api/env"
	"flow/common/util"
	"fmt"
	"log"
	"net/smtp"
)

func consumeEmailItems(mch chan util.MailItem, ech chan error) {
	var err error
	var item util.MailItem

	for {
		item = <-mch
		err = send(item)
		if err != nil {
			ech <- err
		}
	}
}

func send(item util.MailItem) error {
	// Set up authentication information for Gmail server
	from := env.Global.GmailUser
	auth := smtp.PlainAuth("", from, env.Global.GmailAppPassword, "smtp.gmail.com")
	msg := []byte(fmt.Sprintf("To: %s\r\n", item.To) +
		fmt.Sprintf("Subject: %s\r\n", item.Subject) +
		fmt.Sprintf("%s\r\n", item.Body))
	err := smtp.SendMail("smtp.gmail.com:587", auth, from, []string{item.To}, msg)
	if err != nil {
		return fmt.Errorf("failed to send email to %w", item.To)
	}

	log.Printf("%+v", item)
	return nil
}
