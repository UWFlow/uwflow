package main

import (
	"testing"
	"time"

	"github.com/anthropics/anthropic-sdk-go"
	"github.com/google/go-cmp/cmp"
	"github.com/jackc/pgx/v5/pgtype"
	"github.com/slack-go/slack"
)

func slackMessage(user, text string) slack.Message {
	return slack.Message{Msg: slack.Msg{User: user, Text: text}}
}

type turn struct {
	Role string
	Text string
}

func turns(messages []anthropic.BetaMessageParam) []turn {
	var out []turn
	for _, m := range messages {
		out = append(out, turn{Role: string(m.Role), Text: *m.Content[0].GetText()})
	}
	return out
}

func TestThreadToMessages(t *testing.T) {
	const bot = "UBOT"
	tests := []struct {
		name   string
		thread []slack.Message
		want   []turn
	}{
		{
			name:   "single mention",
			thread: []slack.Message{slackMessage("UA", "<@UBOT> how many courses?")},
			want:   []turn{{"user", "<@UA>: how many courses?"}},
		},
		{
			name: "follow-up after a reply",
			thread: []slack.Message{
				slackMessage("UA", "<@UBOT> how many courses?"),
				slackMessage(bot, "There are 7,000."),
				slackMessage("UA", "<@UBOT> and profs?"),
			},
			want: []turn{
				{"user", "<@UA>: how many courses?"},
				{"assistant", "There are 7,000."},
				{"user", "<@UA>: and profs?"},
			},
		},
		{
			name: "chatter between people is merged",
			thread: []slack.Message{
				slackMessage("UA", "is CS 135 popular?"),
				slackMessage("UB", "<@UBOT> check the reviews"),
			},
			want: []turn{{"user", "<@UA>: is CS 135 popular?\n\n<@UB>: check the reviews"}},
		},
		{
			name: "leading and trailing bot posts are dropped",
			thread: []slack.Message{
				slackMessage(bot, "Hi!"),
				slackMessage("UA", "<@UBOT> hello"),
				slackMessage(bot, "Hello."),
			},
			want: []turn{{"user", "<@UA>: hello"}},
		},
		{
			name:   "empty mention",
			thread: []slack.Message{slackMessage("UA", "<@UBOT>")},
			want:   nil,
		},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got := turns(threadToMessages(tt.thread, bot))
			if diff := cmp.Diff(tt.want, got); diff != "" {
				t.Errorf("threadToMessages() mismatch (-want +got):\n%s", diff)
			}
		})
	}
}

func TestFormatValue(t *testing.T) {
	var numeric pgtype.Numeric
	if err := numeric.Scan("3.75"); err != nil {
		t.Fatal(err)
	}
	tests := []struct {
		name  string
		value interface{}
		want  string
	}{
		{"null", nil, "NULL"},
		{"string with tab and newline", "a\tb\nc", `a\tb\nc`},
		{"integer", int64(42), "42"},
		{"time", time.Date(2026, 9, 1, 12, 0, 0, 0, time.UTC), "2026-09-01T12:00:00Z"},
		{"numeric", numeric, "3.75"},
		{"bytes", []byte{1, 2, 3}, "<3 bytes>"},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			if got := formatValue(tt.value); got != tt.want {
				t.Errorf("formatValue(%v) = %q, want %q", tt.value, got, tt.want)
			}
		})
	}
}

func TestSplitTableName(t *testing.T) {
	tests := []struct{ in, schema, name string }{
		{"course", "public", "course"},
		{"materialized.course_rating", "materialized", "course_rating"},
		{` "user" `, "public", "user"},
	}
	for _, tt := range tests {
		schema, name := splitTableName(tt.in)
		if schema != tt.schema || name != tt.name {
			t.Errorf("splitTableName(%q) = %q, %q; want %q, %q", tt.in, schema, name, tt.schema, tt.name)
		}
	}
}
