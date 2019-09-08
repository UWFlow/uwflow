package state

import (
	"fmt"
	"os"
	"reflect"
	"strconv"

	"github.com/jackc/pgx"
)

type Environment struct {
	ApiPort string `from:"API_PORT"`

	JwtKey []byte `from:"HASURA_GRAPHQL_JWT_KEY"`

	PostgresDatabase string `from:"POSTGRES_DB"`
	PostgresHost     string `from:"POSTGRES_HOST"`
	PostgresPassword string `from:"POSTGRES_PASSWORD"`
	PostgresPort     string `from:"POSTGRES_PORT"`
	PostgresUser     string `from:"POSTGRES_USER"`
}

type State struct {
	Env  *Environment
	Conn *pgx.Conn
}

func GetEnvironment() (*Environment, error) {
	env := &Environment{}
	envReflect := reflect.Indirect(reflect.ValueOf(env))
	envType := envReflect.Type()

	for i := 0; i < envType.NumField(); i++ {
		envKey := envType.Field(i).Tag.Get("from")
		value, exists := os.LookupEnv(envKey)
		if exists {
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
