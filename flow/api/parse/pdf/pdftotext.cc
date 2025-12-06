#include <cstring>
#include <string>
#include <vector>

#include "poppler/cpp/poppler-document.h"
#include "poppler/cpp/poppler-page.h"

using String = std::string;
template <typename T>
using Vector = std::vector<T>;
using Document = poppler::document;

extern "C" {
    [[nodiscard]]
    const char* pdfToText(const char* data, int dataSize) noexcept {
        static bool hasResetErrorFunction = false;
        if (!hasResetErrorFunction) {
            // Do not log errors from poppler to stderr
            poppler::set_debug_error_function(
                []([[maybe_unused]] const String& s, [[maybe_unused]] void* p) -> void {}, 
                nullptr
            );
            hasResetErrorFunction = true;
        }

        const Document* doc = Document::load_from_raw_data(data, dataSize);
        if (!doc) {
            return nullptr;
        }
        const int pageCount = doc->pages();

        String result;
        for (int i = 0; i < pageCount; ++i) {
            Vector<char> pageText = doc->create_page(i)->text().to_utf8();
            result.append(pageText.begin(), pageText.end());
        }

        char* buffer = (char*)std::malloc(result.length() + 1);
        std::memcpy(buffer, result.data(), result.length());
        buffer[result.length()] = '\0';

        return buffer;
    }
}
