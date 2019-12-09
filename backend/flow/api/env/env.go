package env

import (
	"fmt"
	"log"
	"os"
	"reflect"
)

type Environment struct {
	ApiPort string `from:"API_PORT"`

	FbAppId     string `from:"FB_APP_ID"`
	FbAppSecret string `from:"FB_APP_SECRET"`

	GmailUser        string `from:"GMAIL_USER"`
	GmailAppPassword string `from:"GMAIL_APP_PASSWORD"`

	JwtKey []byte `from:"HASURA_GRAPHQL_JWT_KEY"`

	PostgresDatabase string `from:"POSTGRES_DB"`
	PostgresHost     string `from:"POSTGRES_HOST"`
	PostgresPassword string `from:"POSTGRES_PASSWORD"`
	PostgresPort     string `from:"POSTGRES_PORT"`
	PostgresUser     string `from:"POSTGRES_USER"`
}

// Get writes environment variables from the OS environment
// into corresponding fields of the struct pointed to by envPtr.
//
// The variable to field mapping is determined by the `from` tag.
//
// Each field must have type []byte or string.
func Get(envPtr interface{}) error {
	envStruct := reflect.Indirect(reflect.ValueOf(envPtr))
	envType := envStruct.Type()

	for i := 0; i < envType.NumField(); i++ {
		key := envType.Field(i).Tag.Get("from")
		value, ok := os.LookupEnv(key)
		if !ok {
			return fmt.Errorf("environment variable %s is not set", key)
		}
		// Cast to []byte if necessary. Why not have everything be a string?
		// Some variables (like encryption keys) are mostly used as []byte,
		// which would necessitate casting at each site of use.
		fieldType := envType.Field(i).Type
		convertedValue := reflect.ValueOf(value).Convert(fieldType)
		envStruct.Field(i).Set(convertedValue)
	}
	return nil
}

var Global Environment

func init() {
	err := Get(&Global)
	if err != nil {
		log.Fatal("Error: %s", err)
	}
}
