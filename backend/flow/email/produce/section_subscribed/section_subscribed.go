package section_subscribed

import (
	"flow/common/db"
	"flow/email/common"
	"flow/email/produce"
	"fmt"
	"strings"
)

type queueItem struct {
	UserEmail  string
	UserName   string
	CourseCode string
	CourseURL  string
}

const selectQuery = `
SELECT u.email, u.first_name, c.code, u.id, c.id
FROM queue.section_subscribed ss
  JOIN "user" u on u.id = ss.user_id
  JOIN course_section cs on cs.id = ss.section_id
  JOIN course c on c.id = cs.course_id
WHERE ss.seen_at is NULL
`

const selectExistsQuery = `
SELECT EXISTS(
SELECT FROM queue.section_subscribed ss 
  JOIN course_section cs on cs.id = ss.section_id
WHERE ss.seen_at IS NOT NULL
AND ss.user_id = $1
AND cs.course_id = $2)
`

const updateQuery = `UPDATE queue.section_subscribed SET seen_at = NOW() WHERE seen_at is NULL`

func Produce(tx *db.Tx, mch chan *common.MailItem) error {
	var item queueItem

	rows, err := tx.Query(selectQuery)
	if err != nil {
		return fmt.Errorf("fetching from section_subscribed: %w", err)
	}
	defer rows.Close()

	for rows.Next() {
		var user_id, course_id int
		err = rows.Scan(&item.UserEmail, &item.UserName, &item.CourseCode, &user_id, &course_id)
		if err != nil {
			return fmt.Errorf("reading section_subscribed row: %w", err)
		}

		// Only send email if user is not already subscribed to another section of current course
		// var subExists bool
		// err = tx.QueryRow(selectExistsQuery, user_id, course_id).Scan(&subExists)
		// if err != nil {
		// 	return fmt.Errorf("checking for existing course section subscription: %w", err)
		// }
		// if subExists {
		// 	continue
		// }

		item.CourseURL = fmt.Sprintf("https://uwflow.com/course/%s", item.CourseCode)
		item.CourseCode = strings.ToUpper(item.CourseCode)
		mailItem, err := produce.FormatWithTemplate(
			item.UserEmail,
			fmt.Sprintf("You’re all set to receive notifications for %s", item.CourseCode),
			produce.SubscribedTemplate,
			item,
		)
		if err != nil {
			return fmt.Errorf("formatting section_subscribed email: %w", err)
		}
		mch <- mailItem
	}

	_, err = tx.Exec(updateQuery)
	if err != nil {
		return fmt.Errorf("writing back to section_subscribed: %w", err)
	}
	return nil
}
