package state

import (
	"fmt"
	"os"
	"reflect"
	"strconv"

	"github.com/jackc/pgx"
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
	FbAppID          string `from:"FB_APP_ID"`
	FbAppSecret      string `from:"FB_APP_SECRET"`
	GmailUser        string `from:"GMAIL_USER"`
	GmailAppPassword string `from:"GMAIL_APP_PASSWORD"`
}

// State is the collection of all conceptually "global" data in the API.
//
// Why is this useful?
// - Globals are tracked in one place and not scattered around packages.
// - Can mock database/environment for testing.
//
// Note that the same State object is shared between many goroutines.
// As such, it must only contain thread-safe entities.
// - Environment is read-only after initialization, thus trivially thread-safe
// - pgx.Conn is documented to be thread-safe (uses connection pooling)
type State struct {
	Env  *Environment
	Conn *pgx.Conn
}

// To avoid mind-numbing boilerplate, use reflection.
// This is expectedly slow; fortunately, we only need to run this once.
func GetEnvironment() (*Environment, error) {
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
			return nil, fmt.Errorf("Environment variable %s is not set", envKey)
		}
	}
	return env, nil
}

func ConnectToDatabase(env *Environment) (*pgx.Conn, error) {
	port, err := strconv.Atoi(env.PostgresPort)
	if err != nil {
		return nil, err
	}

	config := pgx.ConnConfig{
		Database: env.PostgresDatabase,
		Host:     env.PostgresHost,
		Password: env.PostgresPassword,
		Port:     uint16(port),
		User:     env.PostgresUser,
	}
	return pgx.Connect(config)
}

func Initialize() (*State, error) {
	env, err := GetEnvironment()
	if err != nil {
		return nil, err
	}
	conn, err := ConnectToDatabase(env)
	if err != nil {
		return nil, err
	}
	return &State{
		Conn: conn,
		Env:  env,
	}, nil
}
