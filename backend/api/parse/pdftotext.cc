#include <cstring>
#include <string>

#include "poppler/cpp/poppler-document.h"
#include "poppler/cpp/poppler-page.h"

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

      std::string contents[N];
      int text_length = 0;
      for (int i = 0; i < N; ++i) {
        contents[i] = doc->create_page(i)->text().to_latin1();
        text_length += contents[i].length();
      }

      char *buffer = (char *)std::malloc(text_length + 1);
      for (int i = 0, offset = 0; i < N; offset += contents[i].length(), ++i) {
        std::memcpy(buffer + offset, contents[i].c_str(), contents[i].length());
      }
      buffer[text_length] = '\0';

      return buffer;
  }
}
