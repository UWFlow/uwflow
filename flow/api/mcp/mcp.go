// Package mcp serves a read-only Model Context Protocol endpoint over the
// data a logged-out visitor sees on uwflow.com. Each tool sends the
// frontend's own GraphQL query to Hasura and applies the same filtering,
// sorting and wording as the page it mirrors.
package mcp

import (
	"context"
	"errors"
	"fmt"
	"log"
	"net/http"
	"time"

	"flow/common/env"

	"github.com/getsentry/sentry-go"
	mcpsdk "github.com/modelcontextprotocol/go-sdk/mcp"
)

const instructions = `UW Flow is the University of Waterloo's course and professor review site.
These tools return what its pages show. Look up a course with get_course by code
(e.g. "CS 341"); when you only have words or a professor's name, search first with
search_courses or search_profs. Requisites are UW's published text: do not tell a
student they are eligible for a course. Cite the url field so the student can check.`

// Handler serves the endpoint, reading Hasura's port from the environment.
// Hasura runs beside the API under the compose service name "hasura", the
// same address nginx uses.
func Handler() http.Handler {
	var config struct {
		HasuraPort string `from:"HASURA_PORT"`
	}
	if err := env.Get(&config); err != nil {
		log.Fatalf("Error: %s", err)
	}
	client, err := newHasuraClient(
		"http://hasura:"+config.HasuraPort+"/v1/graphql",
		&http.Client{Timeout: 5 * time.Second},
	)
	if err != nil {
		log.Fatalf("Error: %s", err)
	}
	return newHandler(client, time.Now)
}

func newHandler(q querier, now func() time.Time) http.Handler {
	server := mcpsdk.NewServer(&mcpsdk.Implementation{
		Name:       "uwflow",
		Title:      "UW Flow",
		Version:    "1.0.0",
		WebsiteURL: "https://uwflow.com",
	}, &mcpsdk.ServerOptions{Instructions: instructions})
	registerTools(server, &tools{q: q, now: now})

	handler := mcpsdk.NewStreamableHTTPHandler(
		func(*http.Request) *mcpsdk.Server { return server },
		&mcpsdk.StreamableHTTPOptions{Stateless: true, JSONResponse: true},
	)

	// The spec requires a 403 for a browser request from another origin.
	// nginx forwards with "Host: api", so the site's own origin is trusted
	// explicitly. Clients that send no Origin (servers, desktop apps) pass.
	protection := http.NewCrossOriginProtection()
	if err := protection.AddTrustedOrigin("https://uwflow.com"); err != nil {
		panic(err)
	}
	return protection.Handler(handler)
}

func readOnly() *mcpsdk.ToolAnnotations {
	closed := false
	return &mcpsdk.ToolAnnotations{ReadOnlyHint: true, IdempotentHint: true, OpenWorldHint: &closed}
}

func registerTools(server *mcpsdk.Server, t *tools) {
	mcpsdk.AddTool(server, &mcpsdk.Tool{
		Name:        "search_courses",
		Title:       "Search courses",
		Description: "Search UW courses by code, name or professor, with the filters and sorting of uwflow.com/explore.",
		Annotations: readOnly(),
	}, safe(t.searchCourses))
	mcpsdk.AddTool(server, &mcpsdk.Tool{
		Name:        "search_profs",
		Title:       "Search professors",
		Description: "Search UW professors by name or course, with the filters and sorting of uwflow.com/explore. Returns codes for get_prof.",
		Annotations: readOnly(),
	}, safe(t.searchProfs))
	mcpsdk.AddTool(server, &mcpsdk.Tool{
		Name:        "get_course",
		Title:       "Course details",
		Description: "A course's description, ratings, requisites, the courses it leads to and who teaches it, as on its uwflow.com course page.",
		Annotations: readOnly(),
	}, safe(t.getCourse))
	mcpsdk.AddTool(server, &mcpsdk.Tool{
		Name:        "get_course_schedule",
		Title:       "Course schedule",
		Description: "A course's sections for one term: enrollment, meeting times and days, as in the schedule table on its uwflow.com page.",
		Annotations: readOnly(),
	}, safe(t.getCourseSchedule))
	mcpsdk.AddTool(server, &mcpsdk.Tool{
		Name:        "get_course_reviews",
		Title:       "Course reviews",
		Description: "Student reviews of a course, or of the professors who taught it, sorted and filtered as on its uwflow.com page.",
		Annotations: readOnly(),
	}, safe(t.getCourseReviews))
	mcpsdk.AddTool(server, &mcpsdk.Tool{
		Name:        "get_prof",
		Title:       "Professor details",
		Description: "A professor's ratings, courses taught and student reviews grouped by course, as on their uwflow.com page.",
		Annotations: readOnly(),
	}, safe(t.getProf))
}

// safe keeps internal failures out of tool output, as serde.Error does for
// 5xx errors: the model gets a stable message, the log and Sentry get the
// detail. Only userError messages, written for the model, pass through.
func safe[In, Out any](h mcpsdk.ToolHandlerFor[In, Out]) mcpsdk.ToolHandlerFor[In, Out] {
	return func(ctx context.Context, req *mcpsdk.CallToolRequest, in In) (*mcpsdk.CallToolResult, Out, error) {
		result, out, err := h(ctx, req, in)
		var forUser userError
		if err == nil || errors.As(err, &forUser) {
			return result, out, err
		}
		log.Printf("Error in mcp %s: %s", req.Params.Name, err)
		sentry.CaptureException(fmt.Errorf("mcp %s: %w", req.Params.Name, err))
		var zero Out
		return nil, zero, errors.New("UW Flow data is unavailable right now; try again shortly")
	}
}
