package format

import (
	"html/template"
	"log"
)

const prologue = `<html>
<head>
	<title></title>
	<link href="https://svc.webspellchecker.net/spellcheck31/lf/scayt3/ckscayt/css/wsc.css" rel="stylesheet" type="text/css" />
</head>
<body aria-readonly="false" style="cursor: auto;">
<table align="center" border="0" cellpadding="1" cellspacing="1" style="width:250px">
	<tbody>
		<tr>
			<td><a href="#"><img src="https://uwflow.com/title.png" style="width:100%" /></a></td>
		</tr>
	</tbody>
</table>
<table align="center" border="0" cellpadding="1" cellspacing="1" style="width:600px">
	<tbody>
		<tr>
			<td><span style="font-size:14px;font-family:arial,helvetica,sans-serif;">`

const epilogue = `</span></td>
		</tr>
	</tbody>
</table>
</body>
</html>`

const resetText = `
				Hi {{.UserName}},<br /><br />
				Your one-time reset code is {{.SecretKey}}. Follow the instructions back on Flow and we will have you course-surfing in no time!<br /><br />
				Cheers,<br />
				UW Flow
`

const subscribedText = `
				Hi {{.UserName}},<br /><br />
				You subscribed to one or more sections in {{.CourseCode}}.<br /><br />
				We’ll notify you when a spot opens in a section you subscribed to.<br /><br />
				If you’d like to unsubscribe, navigate to {{.CourseURL}}, sign in, and click the blue bell icon on sections you don’t want to hear about.<br /><br />
				Cheers,<br />
				UW Flow
`

const oneVacatedText = `
				Hi {{.UserName}},<br /><br />
				{{index .SectionNames 0}} in {{.CourseCode}} has open seats!<br /><br />
				Take a look at {{.CourseURL}}<br /><br />
				Cheers,<br />
				UW Flow
`

var manyVacatedText = `
				Hi {{.UserName}},

				The following sections in {{.CourseCode}} have open seats:
				{{block "list" .SectionNames}}{{range .}}{{print " - " . "\n"}}{{end}}{{end}}
				Take a look at {{.CourseURL}}

				Cheers,
				UW Flow
`

var (
	resetTemplate       = template.New("reset")
	subscribedTemplate  = template.New("subscribed")
	oneVacatedTemplate  = template.New("one_vacated")
	manyVacatedTemplate = template.New("many_vacated")
)

func init() {
	if _, err := resetTemplate.Parse(prologue + resetText + epilogue); err != nil {
		log.Fatalf("Error: parse reset template: %v", err)
	}
	if _, err := subscribedTemplate.Parse(prologue + subscribedText + epilogue); err != nil {
		log.Fatalf("Error: parse subscribed template: %v", err)
	}
	if _, err := oneVacatedTemplate.Parse(prologue + oneVacatedText + epilogue); err != nil {
		log.Fatalf("Error: parse one-vacated template: %v", err)
	}
	if _, err := manyVacatedTemplate.Parse(prologue + manyVacatedText + epilogue); err != nil {
		log.Fatalf("Error: parse many-vacated template: %v", err)
	}
}
