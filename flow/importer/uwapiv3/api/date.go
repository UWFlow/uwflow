package api

import (
	"encoding/json"
	"time"
)

// dateLayout is the layout of dates used by the UW API.
//
// This is *almost* ISO8601, but ever so slightly off (no timezone)
// Unfortunately, this forces us to reify the parsing process.
const dateLayout = "2006-01-02T15:04:05"

type Date struct {
	Value time.Time
	Valid bool
}

func (d *Date) UnmarshalJSON(data []byte) error {
	var (
		err error
		s   string
	)

	if err = json.Unmarshal(data, &s); err != nil {
		return err
	}

	if s == "" {
		return nil
	}

	if d.Value, err = time.Parse(dateLayout, s); err != nil {
		return err
	}

	d.Valid = true
	return nil
}
