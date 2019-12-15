package produce

import (
	"flow/common/db"
	"flow/common/util"
	"fmt"
)

type vacatedQueueItem struct {
	UserEmail    string
	UserName     string
	CourseCode   string
	SectionNames []string
}

func format(item vacatedQueueItem) util.MailItem {
	return util.MailItem{
		To:      item.UserEmail,
		Subject: "UW Flow: Sections Vacated",
		Body: fmt.Sprintf(
			"Dear %s, course: %s, sections: %v",
			item.UserName, item.CourseCode, item.SectionNames,
		),
	}
}

const vacatedSelectQuery = `
SELECT user_email, user_name, course_code, section_names
FROM queue.section_vacated
WHERE NOT seen
`

const vacatedUpdateQuery = `UPDATE queue.section_vacated SET seen = TRUE WHERE NOT seen`

func VacatedProduce(tx *db.Tx, mch chan util.MailItem) error {
	var item vacatedQueueItem

	rows, err := tx.Query(vacatedSelectQuery)
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
		mch <- format(item)
	}

	_, err = tx.Exec(vacatedUpdateQuery)
	if err != nil {
		return fmt.Errorf("writing back to section_vacated: %w", err)
	}
	return nil
}
