package password_reset

import (
	"bytes"
	"flow/common/db"
	"flow/email/common"
	"flow/email/produce"
	"fmt"
	"html/template"
)

type queueItem struct {
	UserEmail string
	UserName  string
	SecretKey string
}

func FormatWithTemplate(to string, subject string, htmlTemplate string, data interface{}) (*common.MailItem, error) {
	var emailBody bytes.Buffer
	t, err := template.New("email").Parse(htmlTemplate)
	if err != nil {
		return nil, fmt.Errorf("creating new html template: %w", err)
	}
	err = t.Execute(&emailBody, data)
	if err != nil {
		return nil, fmt.Errorf("loading data into html template: %w", err)
	}

	item := &common.MailItem{
		To:      to,
		Subject: subject,
		Body:    emailBody.String(),
	}
	return item, nil
}

const selectQuery = `
SELECT u.email, u.full_name, pr.secret_key
FROM queue.password_reset pr
  JOIN "user" u ON u.id = pr.user_id
WHERE pr.seen_at is NULL
`

const updateQuery = `UPDATE queue.password_reset SET seen_at = NOW() WHERE seen_at is NULL`

func Produce(tx *db.Tx, mch chan common.MailItem) error {
	var item queueItem

	rows, err := tx.Query(selectQuery)
	if err != nil {
		return fmt.Errorf("fetching from password_reset: %w", err)
	}
	defer rows.Close()

	for rows.Next() {
		err = rows.Scan(&item.UserEmail, &item.UserName, &item.SecretKey)
		if err != nil {
			return fmt.Errorf("reading password_reset row: %w", err)
		}
		mailItem, err := FormatWithTemplate(
			item.UserEmail, "Verify your email with UW Flow", produce.ResetTemplate, item)
		if err != nil {
			return fmt.Errorf("formatting password_reset email template: %w", err)
		}
		mch <- *mailItem
	}

	_, err = tx.Exec(updateQuery)
	if err != nil {
		return fmt.Errorf("writing back to password_reset: %w", err)
	}
	return nil
}
