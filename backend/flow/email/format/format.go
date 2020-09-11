// Package format contains queue table row definitions
// and routines for converting said rows to mail messages.
package format

import (
	"bytes"
	"html/template"
)

// Message implements QueueItem.
func (item *ResetItem) Message() (Message, error) {
	var (
		buf bytes.Buffer
		msg Message
	)

	if err := resetTemplate.Execute(&buf, item); err != nil {
		return msg, err
	}

	msg = Message{
		Body:    buf.Bytes(),
		Subject: "Reset your password on UW Flow",
		To:      item.Email,
	}
	return msg, nil
}

// Message implements QueueItem.
func (item *SubscribedItem) Message() (Message, error) {
	var (
		buf bytes.Buffer
		msg Message
	)

	if err := subscribedTemplate.Execute(&buf, item); err != nil {
		return msg, err
	}

	msg = Message{
		Body:    buf.Bytes(),
		Subject: "You’re all set to receive notifications for " + item.CourseCode,
		To:      item.Email,
	}
	return msg, nil
}

// Message implements QueueItem.
func (item *VacatedItem) Message() (Message, error) {
	var (
		buf bytes.Buffer
		msg Message
	)

	var tmpl *template.Template
	if len(item.SectionNames) == 1 {
		tmpl = oneVacatedTemplate
	} else {
		tmpl = manyVacatedTemplate
	}
	if err := tmpl.Execute(&buf, item); err != nil {
		return msg, err
	}

	msg = Message{
		Body:    buf.Bytes(),
		Subject: "Enrolment updates in " + item.CourseCode,
		To:      item.Email,
	}
	return msg, nil
}
