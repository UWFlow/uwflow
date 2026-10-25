package parse

import (
	"flow/api/parse/transcript"

	"github.com/getsentry/sentry-go"
)

// Stages at which a transcript can fail to import, used to group reports.
const (
	stageParse = "parse"
	stageEmpty = "empty"
)

// reportTranscriptFailure sends a redacted copy of a transcript the parser
// could not handle, so the parser can be fixed against real layouts.
// Run transcript.Parse on the attached text to reproduce the failure.
//
// Redaction happens here, before anything leaves the server.
// The event is built on a fresh scope, so it carries no user, request,
// request id, tags, or breadcrumbs from the upload that triggered it.
// The parse error is not sent either: its message can quote the input.
func reportTranscriptFailure(client *sentry.Client, text, stage string) {
	if client == nil {
		return
	}
	hub := sentry.NewHub(client, sentry.NewScope())
	scope := hub.Scope()
	scope.SetTag("transcript_stage", stage)
	scope.SetFingerprint([]string{"transcript-failure", stage})
	scope.AddAttachment(&sentry.Attachment{
		Filename:    "transcript-redacted.txt",
		ContentType: "text/plain",
		Payload:     []byte(transcript.Redact(text)),
	})
	hub.CaptureMessage("Transcript failed to import at stage: " + stage)
}
