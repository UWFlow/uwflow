package produce

import (
	"bytes"
	"flow/email/common"
	"fmt"
	"html/template"
)

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

const ResetTemplate = `
<html>
<head>
	<title></title>
	<link href="https://svc.webspellchecker.net/spellcheck31/lf/scayt3/ckscayt/css/wsc.css" rel="stylesheet" type="text/css" />
</head>
<body aria-readonly="false" style="cursor: auto;">
<table align="center" border="0" cellpadding="1" cellspacing="1" style="width:75px">
	<tbody>
		<tr>
			<td><img src="https://drive.google.com/thumbnail?id=1YDOe56_8mQDFLGmDwXYl8IYq2MsicWO8"/></td>
		</tr>
	</tbody>
</table>
<table align="center" border="0" cellpadding="1" cellspacing="1" style="width:600px">
	<tbody>
		<tr>
			<td><span style="font-size:14px;font-family:arial,helvetica,sans-serif;">
				Hi {{.UserName}},<br /><br />
				Your one-time reset code is {{.SecretKey}}. Follow the instructions back on Flow and we will have you course-surfing in no time!<br /><br />
				Cheers,<br />
				UW Flow
			</span></td>
		</tr>
	</tbody>
</table>
</body>
</html>`

const SubscribedTemplate = `
<html>
<head>
	<title></title>
	<link href="https://svc.webspellchecker.net/spellcheck31/lf/scayt3/ckscayt/css/wsc.css" rel="stylesheet" type="text/css" />
</head>
<body aria-readonly="false" style="cursor: auto;">
<table align="center" border="0" cellpadding="1" cellspacing="1" style="width:75px">
	<tbody>
		<tr>
			<td><img src="https://drive.google.com/thumbnail?id=1YDOe56_8mQDFLGmDwXYl8IYq2MsicWO8"/></td>
		</tr>
	</tbody>
</table>
<table align="center" border="0" cellpadding="1" cellspacing="1" style="width:600px">
	<tbody>
		<tr>
			<td><span style="font-size:14px;font-family:arial,helvetica,sans-serif;">
				Hi {{.UserName}},<br /><br />
				You subscribed to one (or more) sections in {{.CourseCode}}.<br /><br />
				We’ll notify you when enrolment drops so that at least one seat is open in a section you subscribed to.<br /><br />
				If you’d like to unsubscribe, navigate to {{.CourseURL}}, sign in, and click the blue bell icon on sections you don’t want to hear about.<br /><br />
				Cheers,<br />
				UW Flow
			</span></td>
		</tr>
	</tbody>
</table>
</body>
</html>`

const VacatedSingleSectionTemplate = `
<html>
<head>
	<title></title>
	<link href="https://svc.webspellchecker.net/spellcheck31/lf/scayt3/ckscayt/css/wsc.css" rel="stylesheet" type="text/css" />
</head>
<body aria-readonly="false" style="cursor: auto;">
<table align="center" border="0" cellpadding="1" cellspacing="1" style="width:75px">
	<tbody>
		<tr>
			<td><img src="https://drive.google.com/thumbnail?id=1YDOe56_8mQDFLGmDwXYl8IYq2MsicWO8"/></td>
		</tr>
	</tbody>
</table>
<table align="center" border="0" cellpadding="1" cellspacing="1" style="width:600px">
	<tbody>
		<tr>
			<td><span style="font-size:14px;font-family:arial,helvetica,sans-serif;">
				Hi {{.UserName}},<br /><br />
				{{.SectionName}} in {{.CourseCode}} has open seats!<br /><br />
				Take a look at <a href="url">https://uwflow.com/course/{{.CourseCode}}</a><br /><br />
				Cheers,<br />
				UW Flow
			</span></td>
		</tr>
	</tbody>
</table>
</body>
</html>`

const VacatedMultipleSectionsTemplate = `
<html>
<head>
	<title></title>
	<link href="https://svc.webspellchecker.net/spellcheck31/lf/scayt3/ckscayt/css/wsc.css" rel="stylesheet" type="text/css" />
</head>
<body aria-readonly="false" style="cursor: auto;">
<table align="center" border="0" cellpadding="1" cellspacing="1" style="width:75px">
	<tbody>
		<tr>
			<td><img src="https://drive.google.com/thumbnail?id=1YDOe56_8mQDFLGmDwXYl8IYq2MsicWO8"/></td>
		</tr>
	</tbody>
</table>
<table align="center" border="0" cellpadding="1" cellspacing="1" style="width:600px">
	<tbody>
		<tr>
			<td><span style="font-size:14px;font-family:arial,helvetica,sans-serif;">
				Hi {{.UserName}},<br /><br />
				{{block "list" .SectionNames}}{{range .}}{{println "-" .}}{{end}}{{end}}<br />
				Take a look at <a href="url">https://uwflow.com/course/{{.CourseCode}}</a><br /><br />
				Cheers,<br />
				UW Flow
			</span></td>
		</tr>
	</tbody>
</table>
</body>
</html>`
