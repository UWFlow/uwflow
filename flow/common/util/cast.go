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

func NilIfZero(value int) *int {
	if value == 0 {
		return nil
	} else {
		return &value
	}
}

func NilIfEmpty(value string) *string {
	if value == "" {
		return nil
	} else {
		return &value
	}
}

func ZeroIfNil(ptr *int) int {
	if ptr == nil {
		return 0
	} else {
		return *ptr
	}
}

func EmptyIfNil(ptr *string) string {
	if ptr == nil {
		return ""
	} else {
		return *ptr
	}
}
