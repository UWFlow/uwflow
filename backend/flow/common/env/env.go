package env

import (
	"fmt"
	"os"
	"reflect"
)

// Variables from the OS environment are pulled in and stored here.
// Field types must be either `string` or `[]byte`:
// os.Getenv returns `string`, which can only be trivially cast to `[]byte`.
type Environment struct {
	ApiPort string `from:"API_PORT"`

	FbAppID     string `from:"FB_APP_ID"`
	FbAppSecret string `from:"FB_APP_SECRET"`

	GmailUser        string `from:"GMAIL_USER"`
	GmailAppPassword string `from:"GMAIL_APP_PASSWORD"`

	JwtKey []byte `from:"HASURA_GRAPHQL_JWT_KEY"`

	MongoDumpPath string `from:"MONGO_DUMP_PATH"`

	PostgresDatabase string `from:"POSTGRES_DB"`
	PostgresHost     string `from:"POSTGRES_HOST"`
	PostgresPassword string `from:"POSTGRES_PASSWORD"`
	PostgresPort     string `from:"POSTGRES_PORT"`
	PostgresUser     string `from:"POSTGRES_USER"`

	UWApiKeyv2 string `from:"UW_API_KEY_V2"`
	UWApiKeyv3 string `from:"UW_API_KEY_V3"`
}

// To avoid mind-numbing boilerplate, use reflection.
// This is expectedly slow; fortunately, we only need to run this once.
func Get() (*Environment, error) {
	env := &Environment{}
	envReflect := reflect.Indirect(reflect.ValueOf(env))
	envType := envReflect.Type()

	for i := 0; i < envType.NumField(); i++ {
		envKey := envType.Field(i).Tag.Get("from")
		value, exists := os.LookupEnv(envKey)
		if exists {
			// Potentially cast to []byte if necessary. Why not have everything be a string?
			// If a variable is conceptually a []byte, we expect to have to cast it everywhere.
			// Better to do it once.
			fieldType := envType.Field(i).Type
			convertedValue := reflect.ValueOf(value).Convert(fieldType)
			envReflect.Field(i).Set(convertedValue)
		} else {
			return nil, fmt.Errorf("environment variable %s is not set", envKey)
		}
	}
	return env, nil
}
