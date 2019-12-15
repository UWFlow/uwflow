package produce

import (
	"bytes"
	"flow/common/db"
	"flow/common/util"
	"fmt"
	"text/template"
)

type resetQueueItem struct {
	UserEmail  string
	UserName   string
	SecretCode string
}

func formatWithTemplate(to string, subject string, htmlTemplate string, data interface{}) (*util.MailItem, error) {
	var emailBody bytes.Buffer
	emailBody.Write([]byte("MIME-version: 1.0\nContent-Type: text/html;charset=\"UTF-8\";\n"))

	t, err := template.New("email").Parse(htmlTemplate)
	if err != nil {
		return nil, err
	}
	t.Execute(&emailBody, data)
	return &util.MailItem{
		To:      to,
		Subject: subject,
		Body:    emailBody.String(),
	}, nil
}

const resetSelectQuery = `
SELECT user_email, user_name, secret_code
FROM queue.password_reset
WHERE NOT seen
`

const resetUpdateQuery = `UPDATE queue.password_reset SET seen = TRUE, seen_at = NOW() WHERE NOT seen`

func ResetProduce(tx *db.Tx, mch chan util.MailItem) error {
	var item resetQueueItem

	rows, err := tx.Query(resetSelectQuery)
	if err != nil {
		return fmt.Errorf("fetching from password_reset: %w", err)
	}
	defer rows.Close()

	for rows.Next() {
		err = rows.Scan(&item.UserEmail, &item.UserName, &item.SecretCode)
		if err != nil {
			return fmt.Errorf("reading password_reset row: %w", err)
		}
		mailItem, err := formatWithTemplate(
			item.UserEmail, "Verify your email with UW Flow", ResetTemplate, item)
		if err != nil {
			return fmt.Errorf("formatting password_reset email template: %w", err)
		}
		mch <- *mailItem
	}

	_, err = tx.Exec(resetUpdateQuery)
	if err != nil {
		return fmt.Errorf("writing back to password_reset: %w", err)
	}
	return nil
}
