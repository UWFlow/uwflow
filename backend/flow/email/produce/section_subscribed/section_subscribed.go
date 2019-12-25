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
WITH existing_course_sub AS (
  SELECT DISTINCT cs.course_id
  FROM queue.section_subscribed ss
    JOIN course_section cs on cs.id = ss.section_id
  WHERE ss.seen_at IS NOT NULL
)
SELECT u.email, u.first_name, c.code
FROM queue.section_subscribed ss
  INNER JOIN "user" u
          ON u.id = ss.user_id
  INNER JOIN course_section cs
          ON cs.id = ss.section_id
  INNER JOIN course c
          ON c.id = cs.course_id
   LEFT JOIN existing_course_sub ex
          ON ex.course_id = cs.course_id
WHERE ss.seen_at IS NULL
  AND ex.course_id IS NULL
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
		err = rows.Scan(&item.UserEmail, &item.UserName, &item.CourseCode)
		if err != nil {
			return fmt.Errorf("reading section_subscribed row: %w", err)
		}

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
