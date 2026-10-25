package main

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"strings"

	"flow/common/db"

	"github.com/anthropics/anthropic-sdk-go"
	"github.com/anthropics/anthropic-sdk-go/option"
	"github.com/anthropics/anthropic-sdk-go/shared/constant"
)

const (
	model     = "claude-opus-5-5"
	maxTokens = 16000
	// A question that needs more round trips than this is cut off.
	maxToolTurns = 20
)

const systemPrompt = `You answer questions about UWFlow, the University of Waterloo course and professor review site, in the UWFlow team's Slack. You have read-only access to its production Postgres database through the tools below.

Work from the data: look up the schema before writing SQL, prefer aggregates over dumping rows, and say which query an answer came from when the number matters. If a question cannot be answered from the tables you can see, say so rather than guessing.

Some tables and columns, such as account emails and login secrets, are deliberately not visible to you. Do not try to work around missing permissions.

Your reply is posted as a Slack message, so use Slack mrkdwn: *bold*, _italic_, ` + "`code`" + `, triple-backtick code blocks, and bullet lists. Slack does not render Markdown headings or tables; put tabular results in a code block. Keep replies short enough to read in a thread.`

type agent struct {
	client anthropic.Client
	conn   *db.Conn
	tools  []anthropic.BetaToolUnionParam
}

func newAgent(apiKey string, conn *db.Conn) *agent {
	return &agent{
		client: anthropic.NewClient(option.WithAPIKey(apiKey)),
		conn:   conn,
		tools:  toolDefinitions(),
	}
}

func toolDefinitions() []anthropic.BetaToolUnionParam {
	tools := []anthropic.BetaToolParam{
		{
			Name:        "list_tables",
			Description: anthropic.String("List the tables, views, and materialized views you can read, with their schema and comment."),
			InputSchema: anthropic.BetaToolInputSchemaParam{Properties: map[string]any{}},
		},
		{
			Name:        "describe_table",
			Description: anthropic.String("List the readable columns of one table or view with their types, nullability, and comments."),
			InputSchema: anthropic.BetaToolInputSchemaParam{
				Properties: map[string]any{
					"table": map[string]any{
						"type":        "string",
						"description": `Table name, optionally schema-qualified, e.g. "course" or "materialized.course_rating".`,
					},
				},
				Required: []string{"table"},
			},
		},
		{
			Name: "run_query",
			Description: anthropic.String(fmt.Sprintf(
				"Run one read-only SQL SELECT statement against Postgres 15 and return tab-separated rows. "+
					"Results are capped at %d rows and statements time out after %s.",
				maxRows, statementTimeout,
			)),
			InputSchema: anthropic.BetaToolInputSchemaParam{
				Properties: map[string]any{
					"sql": map[string]any{"type": "string", "description": "A single SELECT (or WITH ... SELECT) statement."},
				},
				Required: []string{"sql"},
			},
		},
	}
	union := make([]anthropic.BetaToolUnionParam, len(tools))
	for i := range tools {
		union[i] = anthropic.BetaToolUnionParam{OfTool: &tools[i]}
	}
	return union
}

// answer runs the tool loop for one Slack turn and returns the reply text.
func (a *agent) answer(ctx context.Context, messages []anthropic.BetaMessageParam) (string, error) {
	for turn := 0; turn < maxToolTurns; turn++ {
		resp, err := a.client.Beta.Messages.New(ctx, anthropic.BetaMessageNewParams{
			Model:     model,
			MaxTokens: maxTokens,
			// The system breakpoint caches tools and system prompt for every
			// question; the top-level one moves with the end of the conversation
			// so each tool round trip reuses the previous one's prefix.
			System: []anthropic.BetaTextBlockParam{{
				Text:         systemPrompt,
				CacheControl: anthropic.NewBetaCacheControlEphemeralParam(),
			}},
			CacheControl: anthropic.NewBetaCacheControlEphemeralParam(),
			Tools:        a.tools,
			Messages:     messages,
			OutputConfig: anthropic.BetaOutputConfigParam{
				Effort: anthropic.BetaOutputConfigEffortMedium,
			},
			// A refused request is retried on a fallback model chosen by the API.
			Fallbacks: anthropic.BetaFallbacksParamUnion{OfDefault: constant.ValueOf[constant.Default]()},
			Betas:     []anthropic.AnthropicBeta{anthropic.AnthropicBetaServerSideFallback2026_07_01},
		})
		if err != nil {
			return "", err
		}
		log.Printf(
			"claude turn %d: stop=%s in=%d cache_read=%d out=%d",
			turn, resp.StopReason, resp.Usage.InputTokens, resp.Usage.CacheReadInputTokens, resp.Usage.OutputTokens,
		)

		switch resp.StopReason {
		case anthropic.BetaStopReasonRefusal:
			return "Sorry, I can't help with that one.", nil
		case anthropic.BetaStopReasonToolUse:
			// Handled below.
		default:
			reply := replyText(resp)
			if resp.StopReason == anthropic.BetaStopReasonMaxTokens {
				reply += "\n_(reply cut off at the length limit)_"
			}
			return reply, nil
		}

		messages = append(messages, resp.ToParam())
		var results []anthropic.BetaContentBlockParamUnion
		for _, block := range resp.Content {
			if use, ok := block.AsAny().(anthropic.BetaToolUseBlock); ok {
				output, isError := a.runTool(ctx, use.Name, use.JSON.Input.Raw())
				results = append(results, anthropic.NewBetaToolResultBlock(use.ID, output, isError))
			}
		}
		messages = append(messages, anthropic.NewBetaUserMessage(results...))
	}
	return "I stopped after too many queries without reaching an answer. Try a narrower question.", nil
}

func replyText(resp *anthropic.BetaMessage) string {
	var parts []string
	for _, block := range resp.Content {
		if text, ok := block.AsAny().(anthropic.BetaTextBlock); ok {
			parts = append(parts, text.Text)
		}
	}
	return strings.TrimSpace(strings.Join(parts, "\n\n"))
}

// runTool executes one tool call. Errors go back to the model as tool results
// so it can correct its SQL.
func (a *agent) runTool(ctx context.Context, name, rawInput string) (string, bool) {
	var input struct {
		Table string `json:"table"`
		SQL   string `json:"sql"`
	}
	if err := json.Unmarshal([]byte(rawInput), &input); err != nil {
		return fmt.Sprintf("invalid tool input: %v", err), true
	}

	var output string
	var err error
	switch name {
	case "list_tables":
		output, err = readOnlyQuery(ctx, a.conn, listTablesQuery)
	case "describe_table":
		if input.Table == "" {
			return "table is required", true
		}
		schema, table := splitTableName(input.Table)
		output, err = readOnlyQuery(ctx, a.conn, describeTableQuery, schema, table)
	case "run_query":
		if strings.TrimSpace(input.SQL) == "" {
			return "sql is required", true
		}
		log.Printf("run_query: %s", input.SQL)
		output, err = readOnlyQuery(ctx, a.conn, input.SQL)
	default:
		return fmt.Sprintf("unknown tool %q", name), true
	}
	if err != nil {
		return err.Error(), true
	}
	return output, false
}
