package section_vacated

import (
	"flow/common/db"
	"flow/email/common"
	"flow/email/produce"
	"fmt"
	"strings"
)

type queueItem struct {
	UserEmail    string
	UserName     string
	CourseCode   string
	CourseURL    string
	SectionName  string
	SectionNames []string
}

const selectQuery = `
SELECT u.email, u.first_name, c.code, sv.section_names
FROM queue.section_vacated sv
  JOIN "user" u ON u.id = sv.user_id
  JOIN course c on c.id = sv.course_id
WHERE sv.seen_at is NULL
`

const updateQuery = `UPDATE queue.section_vacated SET seen_at = NOW() WHERE seen_at is NULL`

func Produce(tx *db.Tx, mch chan *common.MailItem) error {
	var item queueItem

	rows, err := tx.Query(selectQuery)
	if err != nil {
		return fmt.Errorf("fetching from section_vacated: %w", err)
	}
	defer rows.Close()

	for rows.Next() {
		err = rows.Scan(
			&item.UserEmail, &item.UserName,
			&item.CourseCode, &item.SectionNames,
		)
		if err != nil {
			return fmt.Errorf("reading section_vacated row: %w", err)
		}

		item.SectionName = item.SectionNames[0]
		item.CourseURL = fmt.Sprintf("https://uwflow.com/course/%s", item.CourseCode)
		item.CourseCode = strings.ToUpper(item.CourseCode)

		var htmlTemplate string
		if len(item.SectionNames) == 1 {
			htmlTemplate = produce.VacatedSingleSectionTemplate
		} else {
			htmlTemplate = produce.VacatedMultipleSectionsTemplate
		}

		emailItem, err := produce.FormatWithTemplate(
			item.UserEmail, fmt.Sprintf("Enrolment updates in %s", item.CourseCode), htmlTemplate, item,
		)
		if err != nil {
			return fmt.Errorf("formatting section_vacated MailItem: %w", err)
		}
		mch <- emailItem
	}

	_, err = tx.Exec(updateQuery)
	if err != nil {
		return fmt.Errorf("writing back to section_vacated: %w", err)
	}
	return nil
}
