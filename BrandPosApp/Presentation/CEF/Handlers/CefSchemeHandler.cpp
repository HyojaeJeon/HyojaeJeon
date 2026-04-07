#include "CefSchemeHandler.h"
#include "include/cef_parser.h"
#include "include/wrapper/cef_helpers.h"

#include <fstream>
#include <sstream>
#include <algorithm>

// ──── MIME 타입 추론 ────
static std::string GuessMimeType(const std::wstring& path) {
    auto dot = path.rfind(L'.');
    if (dot == std::wstring::npos) return "text/html";

    std::wstring ext = path.substr(dot);
    std::transform(ext.begin(), ext.end(), ext.begin(), ::towlower);

    if (ext == L".html") return "text/html";
    if (ext == L".js")   return "application/javascript";
    if (ext == L".css")  return "text/css";
    if (ext == L".json") return "application/json";
    if (ext == L".png")  return "image/png";
    if (ext == L".jpg" || ext == L".jpeg") return "image/jpeg";
    if (ext == L".svg")  return "image/svg+xml";
    if (ext == L".ico")  return "image/x-icon";
    if (ext == L".woff2") return "font/woff2";
    if (ext == L".woff") return "font/woff";
    if (ext == L".ttf")  return "font/ttf";
    return "application/octet-stream";
}

// ──── Factory ────
PosSchemeHandlerFactory::PosSchemeHandlerFactory(const std::wstring& base_path)
    : base_path_(base_path)
{
    // 끝에 구분자 보장
    if (!base_path_.empty() && base_path_.back() != L'\\' && base_path_.back() != L'/') {
        base_path_ += L'\\';
    }
}

CefRefPtr<CefResourceHandler> PosSchemeHandlerFactory::Create(
    CefRefPtr<CefBrowser> /*browser*/,
    CefRefPtr<CefFrame> /*frame*/,
    const CefString& /*scheme_name*/,
    CefRefPtr<CefRequest> request)
{
    std::string url = request->GetURL().ToString();

    // app://pos/  ->  ""
    // app://pos/design-system/  ->  "design-system/"
    const std::string prefix = "app://pos/";
    std::string relative;
    if (url.find(prefix) == 0) {
        relative = url.substr(prefix.size());
    }

    // query string 제거
    auto q = relative.find('?');
    if (q != std::string::npos) relative = relative.substr(0, q);

    // trailingSlash 규칙: 빈 문자열 또는 "/" 끝이면 index.html 추가
    if (relative.empty() || relative.back() == '/') {
        relative += "index.html";
    }

    // 역슬래시 변환
    std::wstring wide_relative(relative.begin(), relative.end());
    std::replace(wide_relative.begin(), wide_relative.end(), L'/', L'\\');

    std::wstring full_path = base_path_ + wide_relative;
    std::string mime = GuessMimeType(full_path);

    // Debug log — yêu cầu resource / 리소스 요청 로그
    {
        std::wstring log = L"[SchemeHandler] URL: " + std::wstring(url.begin(), url.end()) +
                           L" → Path: " + full_path + L" MIME: " + std::wstring(mime.begin(), mime.end()) + L"\n";
        ::OutputDebugStringW(log.c_str());
    }

    return new PosResourceHandler(full_path, mime);
}

// ──── ResourceHandler ────
PosResourceHandler::PosResourceHandler(const std::wstring& file_path, const std::string& mime_type)
    : file_path_(file_path), mime_type_(mime_type)
{
}

bool PosResourceHandler::Open(
    CefRefPtr<CefRequest> /*request*/,
    bool& handle_request,
    CefRefPtr<CefCallback> /*callback*/)
{
    handle_request = true;

    std::ifstream ifs(file_path_, std::ios::binary);
    if (ifs) {
        std::ostringstream ss;
        ss << ifs.rdbuf();
        file_data_ = ss.str();
    }

    // Debug log — kết quả đọc file / 파일 읽기 결과 로그
    {
        std::wstring log = L"[SchemeHandler] Open: " + file_path_ +
                           L" → " + (file_data_.empty() ? L"NOT FOUND (404)" : (L"OK (" + std::to_wstring(file_data_.size()) + L" bytes)")) + L"\n";
        ::OutputDebugStringW(log.c_str());
    }
    return true;
}

void PosResourceHandler::GetResponseHeaders(
    CefRefPtr<CefResponse> response,
    int64_t& response_length,
    CefString& /*redirect_url*/)
{
    if (file_data_.empty()) {
        response->SetStatus(404);
        response->SetStatusText("Not Found");
        response_length = 0;
    } else {
        response->SetStatus(200);
        response->SetMimeType(mime_type_);
        response_length = static_cast<int64_t>(file_data_.size());

        // CORS headers — cần cho font loading và fetch
        // CORS 헤더 — 폰트 로딩과 fetch에 필요
        CefResponse::HeaderMap headers;
        response->GetHeaderMap(headers);
        headers.insert(std::make_pair("Access-Control-Allow-Origin", "*"));
        headers.insert(std::make_pair("Access-Control-Allow-Methods", "GET"));
        response->SetHeaderMap(headers);
    }
}

bool PosResourceHandler::Read(
    void* data_out,
    int bytes_to_read,
    int& bytes_read,
    CefRefPtr<CefResourceReadCallback> /*callback*/)
{
    if (offset_ >= file_data_.size()) {
        bytes_read = 0;
        return false;
    }

    size_t remaining = file_data_.size() - offset_;
    size_t to_copy = std::min(static_cast<size_t>(bytes_to_read), remaining);
    memcpy(data_out, file_data_.data() + offset_, to_copy);
    offset_ += to_copy;
    bytes_read = static_cast<int>(to_copy);
    return true;
}

// ──── 등록 ────
void RegisterPosScheme(const std::wstring& pos_ui_out_path)
{
    CefRegisterSchemeHandlerFactory(
        "app", "pos",
        new PosSchemeHandlerFactory(pos_ui_out_path));
}
