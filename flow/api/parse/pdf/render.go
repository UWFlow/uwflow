package pdf

// #cgo CXXFLAGS: -O2 -Wall -std=c++17
// #include <stdlib.h>
// void* pdfOpen(const char* data, size_t data_size);
// void pdfClose(void* handle);
// int pdfPageCount(void* handle);
// const char* pdfPageWords(void* handle, int index, double* width, double* height);
// unsigned char* pdfRenderPage(void* handle, int index, double dpi, int* width, int* height);
import "C"
import (
	"errors"
	"fmt"
	"image"
	"runtime"
	"strconv"
	"strings"
	"unsafe"
)

// Word is a run of text without spaces and its bounding box,
// in points from the top left of its page.
type Word struct {
	Text       string
	X, Y, W, H float64
}

// Page is the size of a page in points and the words printed on it.
type Page struct {
	Width, Height float64
	Words         []Word
}

// Document is an open PDF. Call Close when done with it.
type Document struct {
	handle unsafe.Pointer
}

func Open(data []byte) (*Document, error) {
	if len(data) == 0 {
		return nil, errors.New("empty PDF data")
	}
	// As in ToText, C code reads exactly len(data) bytes and copies them.
	handle := C.pdfOpen((*C.char)(unsafe.Pointer(&data[0])), C.size_t(len(data)))
	runtime.KeepAlive(data)
	if handle == nil {
		return nil, errors.New("malformed or encrypted PDF")
	}
	return &Document{handle: handle}, nil
}

func (d *Document) Close() {
	C.pdfClose(d.handle)
}

func (d *Document) PageCount() int {
	return int(C.pdfPageCount(d.handle))
}

// Page returns the words on page i. Pages that are not upright portrait
// are an error, because their word boxes would not match the rendering.
func (d *Document) Page(i int) (*Page, error) {
	var width, height C.double
	result := C.pdfPageWords(d.handle, C.int(i), &width, &height)
	if result == nil {
		return nil, fmt.Errorf("page %d is unreadable or rotated", i)
	}
	text := C.GoString(result)
	C.free(unsafe.Pointer(result))

	page := &Page{Width: float64(width), Height: float64(height)}
	for _, line := range strings.Split(strings.TrimSuffix(text, "\n"), "\n") {
		if line == "" {
			continue
		}
		fields := strings.SplitN(line, "\t", 5)
		if len(fields) != 5 {
			return nil, fmt.Errorf("malformed word on page %d", i)
		}
		var box [4]float64
		for j := range box {
			value, err := strconv.ParseFloat(fields[j], 64)
			if err != nil {
				return nil, fmt.Errorf("malformed word on page %d: %w", i, err)
			}
			box[j] = value
		}
		page.Words = append(page.Words, Word{Text: fields[4], X: box[0], Y: box[1], W: box[2], H: box[3]})
	}
	return page, nil
}

// Render draws page i in grayscale at the given resolution.
func (d *Document) Render(i int, dpi float64) (*image.Gray, error) {
	var width, height C.int
	pixels := C.pdfRenderPage(d.handle, C.int(i), C.double(dpi), &width, &height)
	if pixels == nil {
		return nil, fmt.Errorf("rendering page %d", i)
	}
	defer C.free(unsafe.Pointer(pixels))

	img := image.NewGray(image.Rect(0, 0, int(width), int(height)))
	copy(img.Pix, unsafe.Slice((*byte)(unsafe.Pointer(pixels)), int(width)*int(height)))
	return img, nil
}
