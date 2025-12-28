#include <cstring>
#include <string>
#include <memory>
#include <mutex>

#include <poppler/cpp/poppler-document.h>
#include <poppler/cpp/poppler-page.h>

using std::size_t;
using OnceFlag = std::once_flag;
using String = std::string;
template <typename T, typename Del = std::default_delete<T>>
using UniquePtr = std::unique_ptr<T, Del>;

using ByteArray = poppler::byte_array;
using Document = poppler::document;
using Page = poppler::page;

namespace {
    OnceFlag errorFnFlag;

    void initErrorFunction() {
        // Do not log errors from poppler to stderr
        poppler::set_debug_error_function(
            []([[maybe_unused]] const String& s, [[maybe_unused]] void* p) -> void {}, 
            nullptr
        );
    }
}

extern "C" {
    [[nodiscard]]
    const char* pdfToText(const char* data, size_t dataSize) noexcept {
        std::call_once(errorFnFlag, initErrorFunction);

        UniquePtr<Document> doc(Document::load_from_raw_data(data, dataSize));
        if (!doc) {
            return nullptr;
        }

        const int pageCount = doc->pages();
        String result;

        for (int i = 0; i < pageCount; ++i) {
            UniquePtr<Page> page(doc->create_page(i));
            if (!page) {
                continue; // skip invalid pages
            }
            ByteArray pageText = page->text().to_utf8();
            result.append(pageText.begin(), pageText.end());
        }

        char* buffer = static_cast<char*>(std::malloc(result.length() + 1));
        if (!buffer) {
            return nullptr;
        }
        std::memcpy(buffer, result.data(), result.length());
        buffer[result.length()] = '\0';

        return buffer;
    }
}
