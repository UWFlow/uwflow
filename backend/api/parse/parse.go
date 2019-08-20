package parse

import (
  "bytes"
  "fmt"
  "net/http"

	"github.com/AyushK1/uwflow2.0/backend/api/serde"
  "github.com/AyushK1/uwflow2.0/backend/api/parse/transcript"
)

func HandleTranscript(w http.ResponseWriter, r *http.Request) {
  file, header, err := r.FormFile("file")
  if err != nil {
		serde.Error(w, "expected form/multipart: {file}", http.StatusBadRequest)
		return
  }

  fileContents := new(bytes.Buffer)
  fileContents.Grow(int(header.Size))
  fileContents.ReadFrom(file)
  text, err := PdfToText(fileContents.Bytes())
  if err != nil {
    serde.Error(w, "failed to convert transcript: " + err.Error(), http.StatusBadRequest)
  }

  result, err := transcript.Parse(text)
  if err != nil {
    serde.Error(w, "failed to parse transcript: " + err.Error(), http.StatusBadRequest)
  }

  fmt.Printf("%v\n", result)
}
