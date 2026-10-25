package main

import (
	"context"
	"fmt"
	"log"
	"strings"
	"time"

	"github.com/anthropics/anthropic-sdk-go"
	"github.com/slack-go/slack"
	"github.com/slack-go/slack/slackevents"
	"github.com/slack-go/slack/socketmode"
)

const (
	// One Slack question, including every Claude and database round trip.
	answerTimeout = 5 * time.Minute
	// Slack rejects message text longer than 40,000 characters.
	maxSlackText = 39_000
	// Reaction shown on the question while the bot works on it.
	workingReaction = "eyes"
)

type bot struct {
	api       *slack.Client
	socket    *socketmode.Client
	agent     *agent
	botUserID string
}

func newBot(ctx context.Context, botToken, appToken string, agent *agent) (*bot, error) {
	api := slack.New(botToken, slack.OptionAppLevelToken(appToken))
	auth, err := api.AuthTestContext(ctx)
	if err != nil {
		return nil, fmt.Errorf("slack auth: %w", err)
	}
	log.Printf("connected to Slack workspace %s as %s", auth.Team, auth.User)
	return &bot{api: api, socket: socketmode.New(api), agent: agent, botUserID: auth.UserID}, nil
}

// run receives events over Socket Mode until ctx is cancelled.
func (b *bot) run(ctx context.Context) error {
	go func() {
		for event := range b.socket.Events {
			switch event.Type {
			case socketmode.EventTypeConnected:
				log.Print("socket mode connected")
			case socketmode.EventTypeEventsAPI:
				// Ack first: Slack redelivers events not acknowledged within 3 seconds.
				b.socket.Ack(*event.Request)
				if apiEvent, ok := event.Data.(slackevents.EventsAPIEvent); ok {
					b.dispatch(ctx, apiEvent.InnerEvent.Data)
				}
			}
		}
	}()
	return b.socket.RunContext(ctx)
}

func (b *bot) dispatch(ctx context.Context, inner interface{}) {
	switch ev := inner.(type) {
	case *slackevents.AppMentionEvent:
		if ev.BotID != "" {
			return
		}
		go b.handle(ctx, ev.Channel, ev.TimeStamp, threadRoot(ev.ThreadTimeStamp, ev.TimeStamp))
	case *slackevents.MessageEvent:
		// Direct messages need no mention. Skip edits, joins, and our own posts.
		if ev.ChannelType != "im" || ev.SubType != "" || ev.BotID != "" || ev.User == b.botUserID {
			return
		}
		go b.handle(ctx, ev.Channel, ev.TimeStamp, threadRoot(ev.ThreadTimeStamp, ev.TimeStamp))
	}
}

func threadRoot(threadTs, ts string) string {
	if threadTs != "" {
		return threadTs
	}
	return ts
}

// handle answers the message at ts, replying in the thread rooted at threadTs.
func (b *bot) handle(parent context.Context, channel, ts, threadTs string) {
	ctx, cancel := context.WithTimeout(parent, answerTimeout)
	defer cancel()

	item := slack.NewRefToMessage(channel, ts)
	if err := b.api.AddReactionContext(ctx, workingReaction, item); err != nil {
		log.Printf("adding reaction: %v", err)
	}
	defer b.api.RemoveReactionContext(context.WithoutCancel(ctx), workingReaction, item)

	reply, err := b.reply(ctx, channel, threadTs)
	if err != nil {
		log.Printf("answering %s/%s: %v", channel, ts, err)
		reply = "Sorry, something went wrong while answering. The error is in the slackbot logs."
	}
	if len(reply) > maxSlackText {
		reply = reply[:maxSlackText] + "\n_(truncated)_"
	}
	if _, _, err := b.api.PostMessageContext(
		ctx, channel, slack.MsgOptionText(reply, false), slack.MsgOptionTS(threadTs),
	); err != nil {
		log.Printf("posting reply to %s/%s: %v", channel, ts, err)
	}
}

func (b *bot) reply(ctx context.Context, channel, threadTs string) (string, error) {
	var thread []slack.Message
	params := &slack.GetConversationRepliesParameters{ChannelID: channel, Timestamp: threadTs, Limit: 200}
	for {
		page, hasMore, cursor, err := b.api.GetConversationRepliesContext(ctx, params)
		if err != nil {
			return "", fmt.Errorf("reading thread: %w", err)
		}
		thread = append(thread, page...)
		if !hasMore {
			break
		}
		params.Cursor = cursor
	}

	messages := threadToMessages(thread, b.botUserID)
	if len(messages) == 0 {
		return "Ask me a question about UWFlow's data.", nil
	}
	return b.agent.answer(ctx, messages)
}

// threadToMessages turns a Slack thread into a conversation: the bot's own
// posts become assistant turns and everyone else's become user turns, labelled
// with the author so Claude can tell people apart. Consecutive posts from the
// same side are merged, and the conversation starts at the first user post.
func threadToMessages(thread []slack.Message, botUserID string) []anthropic.BetaMessageParam {
	mention := "<@" + botUserID + ">"
	var messages []anthropic.BetaMessageParam
	var role anthropic.BetaMessageParamRole
	var pending []string

	flush := func() {
		if len(pending) == 0 {
			return
		}
		block := anthropic.NewBetaTextBlock(strings.Join(pending, "\n\n"))
		messages = append(messages, anthropic.BetaMessageParam{
			Role:    role,
			Content: []anthropic.BetaContentBlockParamUnion{block},
		})
		pending = nil
	}

	for _, msg := range thread {
		text := strings.TrimSpace(strings.ReplaceAll(msg.Text, mention, ""))
		if text == "" {
			continue
		}
		next := anthropic.BetaMessageParamRoleUser
		if msg.User == botUserID {
			next = anthropic.BetaMessageParamRoleAssistant
		} else {
			text = fmt.Sprintf("<@%s>: %s", msg.User, text)
		}
		if next == anthropic.BetaMessageParamRoleAssistant && len(messages) == 0 && len(pending) == 0 {
			continue
		}
		if next != role {
			flush()
			role = next
		}
		pending = append(pending, text)
	}
	flush()

	// The API requires the conversation to end on a user turn.
	for len(messages) > 0 && messages[len(messages)-1].Role != anthropic.BetaMessageParamRoleUser {
		messages = messages[:len(messages)-1]
	}
	return messages
}
