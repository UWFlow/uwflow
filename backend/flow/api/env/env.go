package env

import (
  "log"

  "flow/common/env"
)

var Global *env.Environment

func init() {
  var err error

	Global, err = env.Get()

	if err != nil {
		log.Fatal("Error: %s", err)
	}
}
