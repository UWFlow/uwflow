package parse

// #cgo CFLAGS: -O2 -Wall -I/usr/include/poppler/cpp
// #cgo LDFLAGS: -lpoppler-cpp
// #include <stdlib.h>
// const char *pdftotext(const char *data, int data_size);
import "C"
import (
  "errors"
  "unsafe"
)

func PdfToText(data []byte) (string, error) {
  // Is this safe? Kind of: `data`, a []byte is a continguous array in Go,
  // so we can safely point a C-land (const char *) to it,
  // *provided* that C code does not attempt to find the end of the string,
  // as []byte need not be zero-terminated.
  // This is true for us, as C.pdftotext treats its first argument as bytes.
  cData := (*C.char)(unsafe.Pointer(&data[0]))
  result := C.pdftotext(cData, C.int(len(data)))
  if result != nil {
    converted := C.GoString(result)
    C.free(unsafe.Pointer(result))
    return converted, nil
  } else {
    return "", errors.New("malformed PDF")
  }
}
