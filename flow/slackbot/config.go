package main

import (
	"context"
	"encoding/json"
	"fmt"
	"os"
	"reflect"

	"github.com/aws/aws-sdk-go-v2/aws"
	awsconfig "github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/service/secretsmanager"
)

// config holds everything the bot needs to start. Each field is read from the
// environment variable named by its json tag; when SLACKBOT_SECRET_ID is set,
// keys in that Secrets Manager secret (a JSON object) take precedence.
type config struct {
	SlackBotToken   string `json:"SLACK_BOT_TOKEN"`
	SlackAppToken   string `json:"SLACK_APP_TOKEN"`
	AnthropicApiKey string `json:"ANTHROPIC_API_KEY"`

	// The bot connects as its own read-only role, never the shared superuser
	// from POSTGRES_USER. See role.sql.
	PostgresUser     string `json:"SLACKBOT_POSTGRES_USER"`
	PostgresPassword string `json:"SLACKBOT_POSTGRES_PASSWORD"`

	PostgresHost     string `json:"POSTGRES_HOST"`
	PostgresPort     string `json:"POSTGRES_PORT"`
	PostgresDatabase string `json:"POSTGRES_DB"`
}

func loadConfig(ctx context.Context) (*config, error) {
	cfg := &config{}
	fields := reflect.ValueOf(cfg).Elem()
	for i := 0; i < fields.NumField(); i++ {
		key := fields.Type().Field(i).Tag.Get("json")
		fields.Field(i).SetString(os.Getenv(key))
	}

	if secretID := os.Getenv("SLACKBOT_SECRET_ID"); secretID != "" {
		secret, err := fetchSecret(ctx, secretID)
		if err != nil {
			return nil, err
		}
		// Unmarshal only overwrites keys present in the secret.
		if err := json.Unmarshal([]byte(secret), cfg); err != nil {
			return nil, fmt.Errorf("secret %s is not a JSON object of strings: %w", secretID, err)
		}
	}

	for i := 0; i < fields.NumField(); i++ {
		if fields.Field(i).String() == "" {
			return nil, fmt.Errorf("%s is not set", fields.Type().Field(i).Tag.Get("json"))
		}
	}
	return cfg, nil
}

// fetchSecret reads a secret using the default AWS credential chain, which on
// EC2 is the instance role.
func fetchSecret(ctx context.Context, secretID string) (string, error) {
	awsCfg, err := awsconfig.LoadDefaultConfig(ctx)
	if err != nil {
		return "", fmt.Errorf("loading AWS config: %w", err)
	}
	out, err := secretsmanager.NewFromConfig(awsCfg).GetSecretValue(ctx, &secretsmanager.GetSecretValueInput{
		SecretId: aws.String(secretID),
	})
	if err != nil {
		return "", fmt.Errorf("reading secret %s: %w", secretID, err)
	}
	return aws.ToString(out.SecretString), nil
}
