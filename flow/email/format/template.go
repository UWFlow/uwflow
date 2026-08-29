package format

import (
	"embed"
	"html/template"
	"log"
)

// Message bodies live in templates/ so they can be restyled and edited without
// touching Go. Each defines a "content" block that layout.html wraps in the
// Flow header and footer.
//
// invite.html greets nobody by name: an invite may be the first time we mail
// an address, so there is no account to read a first name from.
//
//go:embed templates/*.html
var templateFS embed.FS

var (
	resetTemplate       = parseTemplate("reset")
	subscribedTemplate  = parseTemplate("subscribed")
	inviteTemplate      = parseTemplate("invite")
	oneVacatedTemplate  = parseTemplate("one_vacated")
	manyVacatedTemplate = parseTemplate("many_vacated")
)

// parseTemplate builds the named body into the shared layout. A template that
// does not parse is a mistake in the tree, not a runtime condition, so it is
// fatal here rather than an error every Message call would have to carry.
func parseTemplate(name string) *template.Template {
	t, err := template.ParseFS(templateFS, "templates/layout.html", "templates/"+name+".html")
	if err != nil {
		log.Fatalf("Error: parse %s template: %v", name, err)
	}
	return t
}
