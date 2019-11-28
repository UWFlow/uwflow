package util

import "reflect"

func Fields(dbEntity interface{}) []string {
	tp := reflect.TypeOf(dbEntity)

	switch tp.Kind() {
	case reflect.Array, reflect.Ptr, reflect.Slice:
		tp = tp.Elem()
	}

	fields := make([]string, tp.NumField())
	for i := 0; i < tp.NumField(); i++ {
		fields[i] = CamelToSnakeCase(tp.Field(i).Name)
	}

	return fields
}

func AsSlice(dbEntity interface{}) []interface{} {
	v := reflect.ValueOf(dbEntity)

	fields := make([]interface{}, v.NumField())
	for i := 0; i < v.NumField(); i++ {
		fields[i] = v.Field(i).Interface()
	}

	return fields
}
