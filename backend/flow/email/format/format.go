// Package format contains queue table row definitions
// and routines for converting said rows to mail messages.
package format

import (
	"bytes"
	"html/template"
)

func writeHeader(buf *bytes.Buffer, key, value string) {
	buf.WriteString(key)
	buf.WriteString(": ")
	buf.WriteString(value)
	buf.WriteString("\r\n")
}

func writeSMTPHeaders(buf *bytes.Buffer, to, subject string) {
	writeHeader(buf, "To", to)
	writeHeader(buf, "Subject", subject)
	writeHeader(buf, "MIME-version", "1.0")
	writeHeader(buf, "Content-Type", `text/html;charset="utf-8"`)
	buf.WriteString("\r\n")
}

// Message implements QueueItem.
func (item *ResetItem) Message() (Message, error) {
	var (
		buf bytes.Buffer
		msg Message
	)

	const subject = "Reset your password on UW Flow"
	writeSMTPHeaders(&buf, item.Email, subject)

	if err := resetTemplate.Execute(&buf, item); err != nil {
		return msg, err
	}

	msg = Message{
		Body:    buf.Bytes(),
		Subject: subject,
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

	subject := "You’re all set to receive notifications for " + item.CourseCode
	writeSMTPHeaders(&buf, item.Email, subject)

	if err := subscribedTemplate.Execute(&buf, item); err != nil {
		return msg, err
	}

	msg = Message{
		Body:    buf.Bytes(),
		Subject: subject,
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

	subject := "Enrolment updates in " + item.CourseCode
	writeSMTPHeaders(&buf, item.Email, subject)

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
		Subject: subject,
		To:      item.Email,
	}
	return msg, nil
}
