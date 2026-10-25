package transcript

import (
	"bytes"
	"image"
	"image/png"
	"os"
	"path/filepath"
	"strings"
	"testing"

	"flow/api/parse/pdf"
)

func TestRedactPDFFixtures(t *testing.T) {
	// Identifiers printed in the fixtures, as they appear in the PDF text.
	tests := []struct {
		name        string
		identifiers []string
	}{
		{"simple", []string{"Shynkevych", "Dmytro", "20705374", "657358545"}},
		{"transfer", []string{"Zhang", "Edwin", "Antong", "20718692", "932368640"}},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			original, err := os.ReadFile("testdata/transcript-" + tt.name + ".pdf")
			if err != nil {
				t.Fatalf("reading pdf: %v", err)
			}
			redacted, err := RedactPDF(original)
			if err != nil {
				t.Fatalf("redacting: %v", err)
			}

			for _, id := range tt.identifiers {
				if bytes.Contains(redacted, []byte(id)) {
					t.Errorf("redacted bytes contain %q", id)
				}
			}

			in, err := pdf.Open(original)
			if err != nil {
				t.Fatalf("opening original: %v", err)
			}
			defer in.Close()
			out, err := pdf.Open(redacted)
			if err != nil {
				t.Fatalf("opening redacted: %v", err)
			}
			defer out.Close()

			if in.PageCount() != out.PageCount() {
				t.Fatalf("page count %d, want %d", out.PageCount(), in.PageCount())
			}
			for i := 0; i < out.PageCount(); i++ {
				page, err := out.Page(i)
				if err != nil {
					t.Fatalf("reading redacted page %d: %v", i, err)
				}
				if len(page.Words) != 0 {
					t.Errorf("redacted page %d has a text layer: %v", i, page.Words[:1])
				}

				// Every identifier's box on the original must be black.
				original, err := in.Page(i)
				if err != nil {
					t.Fatalf("reading original page %d: %v", i, err)
				}
				img, err := out.Render(i, redactionDPI)
				if err != nil {
					t.Fatalf("rendering redacted page %d: %v", i, err)
				}
				for _, word := range original.Words {
					if !containsToken(tt.identifiers, word.Text) {
						continue
					}
					if !allDark(img, wordRect(word).pixels(redactionDPI)) {
						t.Errorf("page %d: %q is not blacked out", i, word.Text)
					}
				}

				// Set REDACTED_PNG_DIR to look at the output.
				if dir := os.Getenv("REDACTED_PNG_DIR"); dir != "" {
					writePNG(t, filepath.Join(dir, tt.name+"-"+string(rune('0'+i))+".png"), img)
				}
			}
		})
	}
}

func containsToken(identifiers []string, word string) bool {
	for _, id := range identifiers {
		if normalizeToken(word) == strings.ToLower(id) {
			return true
		}
	}
	return false
}

// allDark allows for JPEG noise at the edges of the box.
func allDark(img *image.Gray, r image.Rectangle) bool {
	r = r.Inset(1).Intersect(img.Bounds())
	for y := r.Min.Y; y < r.Max.Y; y++ {
		for x := r.Min.X; x < r.Max.X; x++ {
			if img.GrayAt(x, y).Y > 40 {
				return false
			}
		}
	}
	return true
}

func writePNG(t *testing.T, path string, img image.Image) {
	f, err := os.Create(path)
	if err != nil {
		t.Fatalf("creating %s: %v", path, err)
	}
	defer f.Close()
	if err := png.Encode(f, img); err != nil {
		t.Fatalf("writing %s: %v", path, err)
	}
}

func word(text string, x, y float64) pdf.Word {
	return pdf.Word{Text: text, X: x, Y: y, W: float64(len(text)) * 5, H: 10}
}

func TestRedactionBoxes(t *testing.T) {
	header := []pdf.Word{
		word("Name:", 10, 100), word("Doe,", 60, 100), word("Jane", 90, 100),
		word("Student", 10, 112), word("ID:", 50, 112), word("20000001", 70, 112),
		word("CS", 10, 200), word("145", 40, 200), word("97", 300, 200),
	}

	tests := []struct {
		name    string
		pages   [][]pdf.Word
		wantErr string
	}{
		{"header only", [][]pdf.Word{header}, ""},
		{"no text", [][]pdf.Word{header, nil}, "no text"},
		{"no name line", [][]pdf.Word{header[3:]}, "no name line"},
		{
			"name in a comment",
			[][]pdf.Word{append(header[:len(header):len(header)], word("Jane", 50, 400))},
			"outside redacted area",
		},
		{
			"student number on a page without a header",
			[][]pdf.Word{header, {word("Note:", 10, 50), word("20000001", 60, 50)}},
			"outside redacted area",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			pages := make([]*pdf.Page, len(tt.pages))
			for i, words := range tt.pages {
				pages[i] = &pdf.Page{Width: 612, Height: 792, Words: words}
			}
			boxes, err := redactionBoxes(pages)
			if tt.wantErr != "" {
				if err == nil || !strings.Contains(err.Error(), tt.wantErr) {
					t.Fatalf("got error %v, want %q", err, tt.wantErr)
				}
				return
			}
			if err != nil {
				t.Fatalf("unexpected error: %v", err)
			}
			for _, w := range header {
				covered := coveredBy(wordRect(w), boxes[0])
				wantCovered := w.Text == "Doe," || w.Text == "Jane" || w.Text == "20000001"
				if covered != wantCovered {
					t.Errorf("%q covered = %v, want %v", w.Text, covered, wantCovered)
				}
			}
		})
	}
}
