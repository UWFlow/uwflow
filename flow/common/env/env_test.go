package env

import "testing"

func TestOptionalEnvironment(t *testing.T) {
	t.Setenv("ENV_TEST_REQUIRED", "present")
	type config struct {
		Required string `from:"ENV_TEST_REQUIRED"`
		Optional string `from:"ENV_TEST_OPTIONAL" optional:"true"`
	}
	var value config
	if err := Get(&value); err != nil || value.Required != "present" || value.Optional != "" {
		t.Fatalf("optional field should not break existing deployments: %+v, %v", value, err)
	}
	t.Setenv("ENV_TEST_OPTIONAL", "postgres://example/db?sslmode=verify-full")
	if err := Get(&value); err != nil || value.Optional == "" {
		t.Fatalf("optional field should be loaded when present: %v", err)
	}
}

func TestRequiredEnvironmentStillFails(t *testing.T) {
	var value struct {
		Missing string `from:"ENV_TEST_UNSET"`
	}
	if err := Get(&value); err == nil {
		t.Fatal("missing required configuration must fail")
	}
}
