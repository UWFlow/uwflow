package section_vacated

import (
	"flow/common/db"
	"flow/email/common"
	"flow/email/produce"
	"flow/email/produce/password_reset"
	"fmt"
	"strings"
)

type queueItem struct {
	UserEmail    string
	UserName     string
	CourseCode   string
	SectionNames []string
}

type dataItem struct {
	UserEmail    string
	UserName     string
	CourseCode   string
	SectionName  string
	SectionsHTML string
}

func formatSingleSection(item queueItem, htmlTemplate string) (*common.MailItem, error) {
	data := dataItem{
		UserEmail:    item.UserEmail,
		UserName:     item.UserName,
		CourseCode:   strings.ToUpper(item.CourseCode),
		SectionName:  item.SectionNames[0],
		SectionsHTML: "",
	}

	emailItem, err := password_reset.FormatWithTemplate(
		data.UserEmail,
		fmt.Sprintf("Enrolment updates in %w", data.CourseCode),
		htmlTemplate, data)
	if err != nil {
		return nil, err
	}
	return emailItem, nil
}

func formatMultipleSections(item queueItem, htmlTemplate string) (*common.MailItem, error) {
	SectionsListHTML := "<ul>"
	for _, sectionName := range item.SectionNames {
		SectionsListHTML += fmt.Sprintf("<li>%w</li>", sectionName)
	}
	SectionsListHTML += "</ul>"
	data := dataItem{
		UserEmail:    item.UserEmail,
		UserName:     item.UserName,
		CourseCode:   strings.ToUpper(item.CourseCode),
		SectionName:  item.SectionNames[0],
		SectionsHTML: SectionsListHTML,
	}

	emailItem, err := password_reset.FormatWithTemplate(
		data.UserEmail,
		fmt.Sprintf("Enrolment updates in %w", data.CourseCode),
		htmlTemplate, data)
	if err != nil {
		return nil, err
	}
	return emailItem, nil
}

const selectQuery = `
SELECT u.email, u.full_name, c.code, sv.section_names
FROM queue.section_vacated sv
  JOIN "user" u ON u.id = sv.user_id
  JOIN course_section cs on cs.id = sv.section_id
  JOIN course c on c.id = cs.course_id
WHERE sv.seen_at is NULL
`

const updateQuery = `UPDATE queue.section_vacated SET seen_at = NOW() WHERE seen_at is NULL`

func Produce(tx *db.Tx, mch chan common.MailItem) error {
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
		var emailItem *common.MailItem
		if len(item.SectionNames) == 1 {
			emailItem, err = formatSingleSection(item, produce.VacatedSingleSectionTemplate)
		} else if len(item.SectionNames) > 1 {
			emailItem, err = formatMultipleSections(item, produce.VacatedMultipleSectionsTemplate)
		} else {
			return fmt.Errorf("no sections vacated ")
		}
		if err != nil {
			return fmt.Errorf("formatting section_vacated MailItem: %w", err)
		}
		mch <- *emailItem
	}

	_, err = tx.Exec(updateQuery)
	if err != nil {
		return fmt.Errorf("writing back to section_vacated: %w", err)
	}
	return nil
}
