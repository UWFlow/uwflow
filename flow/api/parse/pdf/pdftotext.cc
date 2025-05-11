#include <cstring>
#include <string>

// #cgo pkg-config: poppler-cpp
// #cgo CXXFLAGS: -std=c++11
// #include <stdlib.h>
// const char *pdftotext(const char *data, int data_size);
#include "poppler-document.h"
#include "poppler-page.h"


void donothing(const std::string &, void *) {}

extern "C" {
  const char *pdftotext(const char *data, int data_size)
  {
      static bool has_reset_error_function = false;
      if (!has_reset_error_function) {
        // Do not log errors from poppler to stderr
        poppler::set_debug_error_function(donothing, nullptr);
        has_reset_error_function = true;
      }

      const auto *doc = poppler::document::load_from_raw_data(data, data_size);
      if (doc == nullptr) {
        return nullptr;
      }
      const int N = doc->pages();

      std::vector<char> contents[N];
      int text_length = 0;
      for (int i = 0; i < N; ++i) {
        contents[i] = doc->create_page(i)->text().to_utf8();
        text_length += contents[i].size();
      }

      char *buffer = (char *)std::malloc(text_length + 1);
      for (int i = 0, offset = 0; i < N; offset += contents[i].size(), ++i) {
        std::memcpy(buffer + offset, contents[i].data(), contents[i].size());
      }
      buffer[text_length] = '\0';

      return buffer;
  }
}
