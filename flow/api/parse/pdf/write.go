package pdf

import (
	"bytes"
	"fmt"
	"image"
	"image/jpeg"
)

// FromImages writes a PDF with one page per image, each drawn at dpi.
// The result has no text layer and no metadata: only the pixels given.
func FromImages(pages []*image.Gray, dpi float64) ([]byte, error) {
	var out bytes.Buffer
	var offsets []int
	// Objects are numbered from 1: catalog, page tree, then for each page
	// the page itself, its content stream, and its image.
	object := func(body string, stream []byte) {
		offsets = append(offsets, out.Len())
		fmt.Fprintf(&out, "%d 0 obj\n%s\n", len(offsets), body)
		if stream != nil {
			out.WriteString("stream\n")
			out.Write(stream)
			out.WriteString("\nendstream\n")
		}
		out.WriteString("endobj\n")
	}

	out.WriteString("%PDF-1.4\n")
	object("<< /Type /Catalog /Pages 2 0 R >>", nil)
	var kids bytes.Buffer
	for i := range pages {
		fmt.Fprintf(&kids, "%d 0 R ", 3+3*i)
	}
	object(fmt.Sprintf("<< /Type /Pages /Kids [%s] /Count %d >>", kids.String(), len(pages)), nil)

	for i, img := range pages {
		var encoded bytes.Buffer
		if err := jpeg.Encode(&encoded, img, &jpeg.Options{Quality: 80}); err != nil {
			return nil, fmt.Errorf("encoding page %d: %w", i, err)
		}
		bounds := img.Bounds()
		width := float64(bounds.Dx()) * 72 / dpi
		height := float64(bounds.Dy()) * 72 / dpi
		pageId := 3 + 3*i
		content := []byte(fmt.Sprintf("q %.2f 0 0 %.2f 0 0 cm /Im0 Do Q", width, height))

		object(fmt.Sprintf(
			"<< /Type /Page /Parent 2 0 R /MediaBox [0 0 %.2f %.2f] /Contents %d 0 R /Resources << /XObject << /Im0 %d 0 R >> >> >>",
			width, height, pageId+1, pageId+2,
		), nil)
		object(fmt.Sprintf("<< /Length %d >>", len(content)), content)
		object(fmt.Sprintf(
			"<< /Type /XObject /Subtype /Image /Width %d /Height %d /ColorSpace /DeviceGray /BitsPerComponent 8 /Filter /DCTDecode /Length %d >>",
			bounds.Dx(), bounds.Dy(), encoded.Len(),
		), encoded.Bytes())
	}

	xref := out.Len()
	fmt.Fprintf(&out, "xref\n0 %d\n0000000000 65535 f \n", len(offsets)+1)
	for _, offset := range offsets {
		fmt.Fprintf(&out, "%010d 00000 n \n", offset)
	}
	fmt.Fprintf(&out, "trailer\n<< /Size %d /Root 1 0 R >>\nstartxref\n%d\n%%%%EOF\n", len(offsets)+1, xref)
	return out.Bytes(), nil
}
