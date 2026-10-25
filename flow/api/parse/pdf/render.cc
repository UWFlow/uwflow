#include <cstring>
#include <memory>
#include <mutex>
#include <string>
#include <vector>

#include <poppler/cpp/poppler-document.h>
#include <poppler/cpp/poppler-image.h>
#include <poppler/cpp/poppler-page.h>
#include <poppler/cpp/poppler-page-renderer.h>

using std::size_t;

// test this file with `make test`
namespace {
    std::once_flag errorFnFlag;

    void initErrorFunction() {
        // Do not log errors from poppler to stderr
        poppler::set_debug_error_function(
            []([[maybe_unused]] const std::string& s, [[maybe_unused]] void* p) -> void {},
            nullptr
        );
    }

    // A document copies the PDF bytes, so the Go caller may free them.
    struct Handle {
        std::unique_ptr<poppler::document> doc;
    };

    char* copyToC(const std::string& s) {
        char* buffer = static_cast<char*>(std::malloc(s.length() + 1));
        if (!buffer) {
            return nullptr;
        }
        std::memcpy(buffer, s.data(), s.length());
        buffer[s.length()] = '\0';
        return buffer;
    }
}

extern "C" {
    // pdfOpen returns a handle to pass to the other functions,
    // or null if the PDF is malformed or encrypted.
    [[nodiscard]]
    void* pdfOpen(const char* data, size_t dataSize) noexcept {
        std::call_once(errorFnFlag, initErrorFunction);
        poppler::byte_array bytes(data, data + dataSize);
        std::unique_ptr<poppler::document> doc(poppler::document::load_from_data(&bytes));
        if (!doc || doc->is_locked()) {
            return nullptr;
        }
        return new Handle{std::move(doc)};
    }

    void pdfClose(void* handle) noexcept {
        delete static_cast<Handle*>(handle);
    }

    int pdfPageCount(void* handle) noexcept {
        return static_cast<Handle*>(handle)->doc->pages();
    }

    // pdfPageWords returns one line per word on the page, "x\ty\tw\th\ttext\n",
    // in points from the top left of the page, and sets the page size in points.
    // It returns null if the page cannot be read or is not upright portrait.
    [[nodiscard]]
    const char* pdfPageWords(void* handle, int index, double* width, double* height) noexcept {
        std::unique_ptr<poppler::page> page(static_cast<Handle*>(handle)->doc->create_page(index));
        if (!page || page->orientation() != poppler::page::portrait) {
            return nullptr;
        }
        poppler::rectf rect = page->page_rect();
        *width = rect.width();
        *height = rect.height();

        std::string result;
        for (const poppler::text_box& box : page->text_list()) {
            if (box.rotation() != 0) {
                return nullptr;
            }
            poppler::rectf b = box.bbox();
            poppler::byte_array text = box.text().to_utf8();
            result += std::to_string(b.x()) + '\t' + std::to_string(b.y()) + '\t' +
                      std::to_string(b.width()) + '\t' + std::to_string(b.height()) + '\t';
            result.append(text.begin(), text.end());
            result += '\n';
        }
        return copyToC(result);
    }

    // pdfRenderPage renders the page as 8-bit grayscale rows of *width bytes.
    // It returns null on failure.
    [[nodiscard]]
    unsigned char* pdfRenderPage(void* handle, int index, double dpi, int* width, int* height) noexcept {
        std::unique_ptr<poppler::page> page(static_cast<Handle*>(handle)->doc->create_page(index));
        if (!page) {
            return nullptr;
        }
        poppler::page_renderer renderer;
        renderer.set_image_format(poppler::image::format_gray8);
        renderer.set_render_hints(poppler::page_renderer::antialiasing | poppler::page_renderer::text_antialiasing);
        poppler::image img = renderer.render_page(page.get(), dpi, dpi);
        if (!img.is_valid() || img.format() != poppler::image::format_gray8) {
            return nullptr;
        }

        const int w = img.width(), h = img.height(), stride = img.bytes_per_row();
        unsigned char* buffer = static_cast<unsigned char*>(std::malloc(size_t(w) * size_t(h)));
        if (!buffer) {
            return nullptr;
        }
        for (int y = 0; y < h; ++y) {
            std::memcpy(buffer + size_t(y) * w, img.const_data() + size_t(y) * stride, w);
        }
        *width = w;
        *height = h;
        return buffer;
    }
}
