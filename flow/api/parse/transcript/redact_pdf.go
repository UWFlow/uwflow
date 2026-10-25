package transcript

import (
	"fmt"
	"image"
	"image/color"
	"image/draw"
	"math"
	"sort"
	"strings"
	"unicode"

	"flow/api/parse/pdf"
)

// Lines starting with these labels have their values blacked out.
var redactedLabels = [][]string{
	{"Name:"},
	{"Student", "ID:"},
	{"Ontario", "Education", "Nbr:"},
}

const (
	// redactionDPI is high enough for grades and course codes to stay legible.
	redactionDPI = 150
	// redactionPadding is how far, in points, boxes extend past the words.
	redactionPadding = 2
	// maxRedactedPages bounds the work done for a single upload.
	maxRedactedPages = 20
)

// RedactPDF returns a copy of a transcript PDF with the student's name,
// student ID and Ontario Education Number blacked out.
//
// Every page is rendered to an image and the boxes are painted onto the
// pixels, so the copy has no text layer, metadata, or hidden content under
// the boxes: nothing from the original survives except what is visible.
//
// It fails closed. It returns an error rather than a copy when it cannot be
// sure the identifiers are gone: when a page has no text (it may be a scan),
// when no name line is found, or when any word matching the name or an
// identifier appears outside a box anywhere in the document.
func RedactPDF(data []byte) ([]byte, error) {
	doc, err := pdf.Open(data)
	if err != nil {
		return nil, err
	}
	defer doc.Close()

	pageCount := doc.PageCount()
	if pageCount == 0 || pageCount > maxRedactedPages {
		return nil, fmt.Errorf("unexpected page count %d", pageCount)
	}

	pages := make([]*pdf.Page, pageCount)
	for i := range pages {
		if pages[i], err = doc.Page(i); err != nil {
			return nil, err
		}
	}
	boxes, err := redactionBoxes(pages)
	if err != nil {
		return nil, err
	}

	images := make([]*image.Gray, pageCount)
	for i := range pages {
		img, err := doc.Render(i, redactionDPI)
		if err != nil {
			return nil, err
		}
		for _, box := range boxes[i] {
			draw.Draw(img, box.pixels(redactionDPI), image.NewUniform(color.Black), image.Point{}, draw.Src)
		}
		images[i] = img
	}
	return pdf.FromImages(images, redactionDPI)
}

// redactionBoxes returns, for each page, the boxes to black out.
// It returns an error if it cannot account for every identifier.
func redactionBoxes(pages []*pdf.Page) ([][]rect, error) {
	boxes := make([][]rect, len(pages))
	sensitive := make(map[string]bool)
	foundName := false
	for i, page := range pages {
		if len(page.Words) == 0 {
			return nil, fmt.Errorf("page %d has no text", i)
		}
		for _, line := range groupLines(page.Words) {
			values, label := labelValues(line)
			if values == nil {
				continue
			}
			if label == 0 {
				foundName = true
			}
			boxes[i] = append(boxes[i], boundingRect(values).pad(redactionPadding))
			for _, word := range values {
				if token := normalizeToken(word.Text); token != "" {
					sensitive[token] = true
				}
			}
		}
	}
	if !foundName {
		return nil, fmt.Errorf("no name line found")
	}

	// A name or number printed anywhere else, such as in a comment,
	// must also have been covered.
	for i, page := range pages {
		for _, word := range page.Words {
			if sensitive[normalizeToken(word.Text)] && !coveredBy(wordRect(word), boxes[i]) {
				return nil, fmt.Errorf("identifier outside redacted area on page %d", i)
			}
		}
	}
	return boxes, nil
}

// rect is a box in points from the top left of the page.
type rect struct {
	x0, y0, x1, y1 float64
}

func wordRect(w pdf.Word) rect {
	return rect{w.X, w.Y, w.X + w.W, w.Y + w.H}
}

func (r rect) pad(by float64) rect {
	return rect{r.x0 - by, r.y0 - by, r.x1 + by, r.y1 + by}
}

// pixels rounds outwards, so the painted area is never smaller than r.
func (r rect) pixels(dpi float64) image.Rectangle {
	scale := dpi / 72
	return image.Rect(
		int(math.Floor(r.x0*scale)), int(math.Floor(r.y0*scale)),
		int(math.Ceil(r.x1*scale)), int(math.Ceil(r.y1*scale)),
	)
}

func (r rect) contains(o rect) bool {
	return r.x0 <= o.x0 && r.y0 <= o.y0 && o.x1 <= r.x1 && o.y1 <= r.y1
}

func coveredBy(r rect, boxes []rect) bool {
	for _, box := range boxes {
		if box.contains(r) {
			return true
		}
	}
	return false
}

func boundingRect(words []pdf.Word) rect {
	r := wordRect(words[0])
	for _, w := range words[1:] {
		wr := wordRect(w)
		r = rect{math.Min(r.x0, wr.x0), math.Min(r.y0, wr.y0), math.Max(r.x1, wr.x1), math.Max(r.y1, wr.y1)}
	}
	return r
}

// groupLines groups words whose vertical centres fall within each other's
// boxes, then orders each line left to right.
func groupLines(words []pdf.Word) [][]pdf.Word {
	sorted := append([]pdf.Word(nil), words...)
	sort.SliceStable(sorted, func(i, j int) bool { return sorted[i].Y < sorted[j].Y })

	var lines [][]pdf.Word
	for _, word := range sorted {
		centre := word.Y + word.H/2
		if n := len(lines); n > 0 {
			first := lines[n-1][0]
			if centre >= first.Y && centre <= first.Y+first.H {
				lines[n-1] = append(lines[n-1], word)
				continue
			}
		}
		lines = append(lines, []pdf.Word{word})
	}
	for _, line := range lines {
		sort.SliceStable(line, func(i, j int) bool { return line[i].X < line[j].X })
	}
	return lines
}

// labelValues returns the words after a redacted label at the start of line,
// and the index of that label in redactedLabels. It returns nil if the line
// does not start with a redacted label or has nothing after it.
func labelValues(line []pdf.Word) ([]pdf.Word, int) {
	for i, label := range redactedLabels {
		if len(line) <= len(label) {
			continue
		}
		matches := true
		for j, part := range label {
			if line[j].Text != part {
				matches = false
				break
			}
		}
		if matches {
			return line[len(label):], i
		}
	}
	return nil, -1
}

// normalizeToken lowercases a word and strips punctuation such as the comma
// in "Doe, Jane". Tokens shorter than two characters are ignored.
func normalizeToken(word string) string {
	token := strings.ToLower(strings.TrimFunc(word, func(r rune) bool {
		return !unicode.IsLetter(r) && !unicode.IsDigit(r)
	}))
	if len([]rune(token)) < 2 {
		return ""
	}
	return token
}
