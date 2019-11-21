package util

import "time"

func IntToPointer(v int) *int {
	return &v
}

func StringToPointer(v string) *string {
	return &v
}

func TimeToPointer(v time.Time) *time.Time {
	return &v
}
