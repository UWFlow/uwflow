package parts

import (
  "encoding/json"
  "log"
  "fmt"

	"github.com/AyushK1/uwflow2.0/backend/uwapi-importer/client"
	"github.com/AyushK1/uwflow2.0/backend/uwapi-importer/util"
)

const (
  StartRecordId = 80
  EndRecordId = 60
)

type ImportantDateDetail struct {
  TermName string
  StartDate *string
  EndDate *string
}

type ImportantDate struct {
  Id int
  Details []ImportantDateDetail
}

func ImportantDates(client *client.ApiClient) error {
  res, err := client.Get("ImportantDates")
  if err != nil {
    return fmt.Errorf("http request failed: %v", err)
  }
  if res.StatusCode >= 400 {
    return fmt.Errorf("http request failed: %v", res.Status)
  }

  var records []ImportantDate
  err = json.NewDecoder(res.Body).Decode(&records)
  if err != nil {
    return fmt.Errorf("decoding response failed: %v", err)
  }

  var startDetails, endDetails []ImportantDateDetail
  for _, record := range records {
    if record.Id == StartRecordId {
      startDetails = record.Details
    } else if record.Id == EndRecordId {
      endDetails = record.Details
    }
  }

  if startDetails == nil {
    return fmt.Errorf("no term start record")
  }
  if endDetails == nil {
    return fmt.Errorf("no term end record")
  }

  termToEndDate := make(map[int]*string)
  for _, detail := range endDetails {
    termId, err := util.TermNameToId(detail.TermName)
    if err != nil {
      log.Printf(
        "API bug: invalid term name %q in endDate, but will continue\n",
        detail.TermName,
      )
      continue
    }
    termToEndDate[termId] = detail.StartDate
  }

  for _, detail := range startDetails {
    termId, err := util.TermNameToId(detail.TermName)
    if err != nil {
      log.Printf(
        "API bug: invalid term name %q in startDate, but will continue\n",
        detail.TermName,
      )
      continue
    }

    endDate, found := termToEndDate[termId]
    if !found {
      log.Printf(
        "API bug: unmatched term %q in startDate, but will continue\n",
        detail.TermName,
      )
      continue
    }

    _, err = client.Conn.Exec(
      `INSERT INTO term_date(term, start_date, end_date) VALUES ($1, $2, $3) `+
      `ON CONFLICT (term) DO UPDATE `+
      `SET start_date = EXCLUDED.start_date, end_date = EXCLUDED.end_date`,
      termId, detail.StartDate, endDate,
    )
    if err != nil {
      return fmt.Errorf("database write failed: %v", err)
    }
  }
  return nil
}
