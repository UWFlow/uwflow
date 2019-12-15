package produce

import (
	"flow/common/db"
	"flow/common/util"
	"fmt"
	"strings"
)

type subscribedQueueItem struct {
	UserEmail  string
	UserName   string
	CourseCode string
	CourseURL  string
}

const subscribedSelectQuery = `
SELECT user_email, user_name, course_code
FROM queue.section_subscribed
WHERE NOT seen
`

const subscribedUpdateQuery = `UPDATE queue.section_subscribed SET seen = TRUE WHERE NOT seen`

func SubscribedProduce(tx *db.Tx, mch chan util.MailItem) error {
	var item subscribedQueueItem

	rows, err := tx.Query(subscribedSelectQuery)
	if err != nil {
		return fmt.Errorf("fetching from section_subscribed: %w", err)
	}
	defer rows.Close()

	for rows.Next() {
		err = rows.Scan(&item.UserEmail, &item.UserName, &item.CourseCode)
		if err != nil {
			return fmt.Errorf("reading section_subscribed row: %w", err)
		}
		item.CourseURL = fmt.Sprintf("https://uwflow.com/course/%s", item.CourseCode)
		item.CourseCode = strings.ToUpper(item.CourseCode)
		mailItem, err := formatWithTemplate(
			item.UserEmail,
			fmt.Sprintf("You’re all set to receive notifications for %s", item.CourseCode),
			SubscribedTemplate, item)
		if err != nil {
			return fmt.Errorf("formatting section_subscribed email: %w", err)
		}
		mch <- *mailItem
	}

	_, err = tx.Exec(subscribedUpdateQuery)
	if err != nil {
		return fmt.Errorf("writing back to section_subscribed: %w", err)
	}
	return nil
}
