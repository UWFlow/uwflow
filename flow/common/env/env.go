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

	JwtKey []byte `from:"HASURA_GRAPHQL_JWT_KEY"`

	PostgresDatabase string `from:"POSTGRES_DB"`
	PostgresHost     string `from:"POSTGRES_HOST"`
	PostgresPassword string `from:"POSTGRES_PASSWORD"`
	PostgresPort     string `from:"POSTGRES_PORT"`
	PostgresUser     string `from:"POSTGRES_USER"`

	RunMode		string `from:"RUN_MODE"`

	UWApiKeyv3	string `from:"UW_API_KEY_V3"`
}

// To avoid mind-numbing boilerplate, use reflection.
// This is expectedly slow; fortunately, we only need to run this once.
func Get(env interface{}) error {
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
			return fmt.Errorf("environment variable %s is not set", envKey)
		}
	}

	return nil
}
