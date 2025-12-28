package pdf

// #cgo CFLAGS: -O2 -Wall -I/usr/include/poppler/cpp
// #cgo LDFLAGS: -lpoppler-cpp
// #include <stdlib.h>
// const char* pdfToText(const char* data, size_t data_size);
import "C"
import (
	"errors"
	"runtime"
	"unsafe"
)

func ToText(data []byte) (string, error) {
	// Is this safe? Kind of: `data`, a []byte is a continguous array in Go,
	// so we can safely point a C-land (const char*) to it,
	// *provided* that C code does not attempt to find the end of the string,
	// as []byte need not be zero-terminated.
	// This is true for us, as C.pdfToText treats its first argument as bytes.
	if len(data) == 0 {
		return "", errors.New("empty PDF data")
	}

	cData := (*C.char)(unsafe.Pointer(&data[0]))
	result := C.pdfToText(cData, C.size_t(len(data)))
	runtime.KeepAlive(data)
	if result != nil {
		converted := C.GoString(result)
		C.free(unsafe.Pointer(result))
		return converted, nil
	} else {
		return "", errors.New("malformed PDF")
	}
}
