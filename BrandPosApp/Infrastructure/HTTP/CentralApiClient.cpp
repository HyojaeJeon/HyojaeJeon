#include "CentralApiClient.h"

#include <windows.h>
#include <winhttp.h>
#pragma comment(lib, "winhttp.lib")

#include <string>
#include <sstream>
#include <vector>

#include "nlohmann/json.hpp"
using json = nlohmann::json;

// ──── UTF-8 ↔ Wide 변환 ────

static std::wstring Utf8ToWide(const std::string& s) {
    if (s.empty()) return {};
    int len = MultiByteToWideChar(CP_UTF8, 0, s.data(), (int)s.size(), NULL, 0);
    std::wstring w(len, L'\0');
    MultiByteToWideChar(CP_UTF8, 0, s.data(), (int)s.size(), &w[0], len);
    return w;
}

static std::string WideToUtf8(const std::wstring& w) {
    if (w.empty()) return {};
    int len = WideCharToMultiByte(CP_UTF8, 0, w.data(), (int)w.size(), NULL, 0, NULL, NULL);
    std::string s(len, '\0');
    WideCharToMultiByte(CP_UTF8, 0, w.data(), (int)w.size(), &s[0], len, NULL, NULL);
    return s;
}

// ──── URL 파싱 ────

struct ParsedUrl {
    std::wstring host;
    INTERNET_PORT port;
    std::wstring path;
    bool isHttps;
};

static bool ParseUrl(const std::string& url, ParsedUrl& out) {
    URL_COMPONENTS uc = {};
    uc.dwStructSize = sizeof(uc);
    uc.dwHostNameLength = 1;
    uc.dwUrlPathLength = 1;

    std::wstring wUrl = Utf8ToWide(url);
    if (!WinHttpCrackUrl(wUrl.c_str(), (DWORD)wUrl.size(), 0, &uc)) {
        return false;
    }

    out.host = std::wstring(uc.lpszHostName, uc.dwHostNameLength);
    out.port = uc.nPort;
    out.path = std::wstring(uc.lpszUrlPath, uc.dwUrlPathLength);
    out.isHttps = (uc.nScheme == INTERNET_SCHEME_HTTPS);
    return true;
}

// ──── 공개 API ────

bool CentralApiClient::Login(
    const std::string& employeeId,
    const std::string& password,
    AuthSession& outSession)
{
    // REST 엔드포인트: POST /api/v1/pos/auth/login
    std::string url = GetBaseUrl() + "/api/v1/pos/auth/login";

    json body;
    body["loginId"] = employeeId;
    body["password"] = password;

    std::string responseJson;
    bool ok = PostJson(url, body.dump(), responseJson);

    if (!ok) {
        return false;
    }

    try {
        auto resp = json::parse(responseJson);
        if (!resp.value("ok", false)) {
            return false;
        }

        auto data = resp["data"];
        outSession.employeeId = data.value("employeeId", "");
        outSession.employeeName = data.value("employeeName", "");
        outSession.role = data.value("role", "");
        outSession.storeCode = data.value("storeCode", "");
        outSession.storeName = data.value("storeName", "");
        outSession.posNo = data.value("posNo", "");
        outSession.adjustNo = data.value("adjustNo", "");
        return true;
    } catch (...) {
        return false;
    }
}

bool CentralApiClient::IsOnline()
{
    std::string url = GetBaseUrl() + "/health";
    std::string response;
    return PostJson(url, "{}", response);
}

std::string CentralApiClient::GetBaseUrl()
{
    // INI 설정에서 로드. 없으면 개발 서버 기본값.
    // [Central]
    // ApiUrl=http://localhost:4000
    //
    // 운영: https://api.hyojungst.vn
    // 개발: http://localhost:4000 또는 http://192.168.1.2:4000
    return "http://localhost:4000";
}

bool CentralApiClient::PostJson(
    const std::string& url,
    const std::string& bodyJson,
    std::string& outResponseJson)
{
    // URL 파싱
    ParsedUrl parsed;
    if (!ParseUrl(url, parsed)) {
        return false;
    }

    // 세션 열기
    HINTERNET hSession = WinHttpOpen(
        L"BrandPosApp/1.0",
        WINHTTP_ACCESS_TYPE_DEFAULT_PROXY,
        WINHTTP_NO_PROXY_NAME,
        WINHTTP_NO_PROXY_BYPASS, 0);

    if (!hSession) return false;

    // 타임아웃 설정 (20초)
    DWORD timeout = 20000;
    WinHttpSetTimeouts(hSession, (int)timeout, (int)timeout, (int)timeout, (int)timeout);

    // 서버 연결
    HINTERNET hConnect = WinHttpConnect(hSession, parsed.host.c_str(), parsed.port, 0);
    if (!hConnect) {
        WinHttpCloseHandle(hSession);
        return false;
    }

    // 요청 생성
    DWORD flags = parsed.isHttps ? WINHTTP_FLAG_SECURE : 0;
    HINTERNET hRequest = WinHttpOpenRequest(
        hConnect, L"POST", parsed.path.c_str(),
        NULL, WINHTTP_NO_REFERER,
        WINHTTP_DEFAULT_ACCEPT_TYPES, flags);

    if (!hRequest) {
        WinHttpCloseHandle(hConnect);
        WinHttpCloseHandle(hSession);
        return false;
    }

    // TLS: 자체 서명 인증서 허용 (개발/사내 환경)
    if (parsed.isHttps) {
        DWORD secFlags = SECURITY_FLAG_IGNORE_UNKNOWN_CA
                       | SECURITY_FLAG_IGNORE_CERT_DATE_INVALID
                       | SECURITY_FLAG_IGNORE_CERT_CN_INVALID;
        WinHttpSetOption(hRequest, WINHTTP_OPTION_SECURITY_FLAGS, &secFlags, sizeof(secFlags));
    }

    // 헤더 설정
    LPCWSTR headers = L"Content-Type: application/json\r\nAccept: application/json\r\n";

    // 본문 UTF-8 인코딩
    DWORD bodyBytes = (DWORD)bodyJson.size();

    // 요청 전송
    BOOL bSend = WinHttpSendRequest(
        hRequest,
        headers, -1L,
        bodyJson.empty() ? WINHTTP_NO_REQUEST_DATA : (LPVOID)bodyJson.data(),
        bodyBytes, bodyBytes, 0);

    if (!bSend) {
        WinHttpCloseHandle(hRequest);
        WinHttpCloseHandle(hConnect);
        WinHttpCloseHandle(hSession);
        return false;
    }

    // 응답 수신
    if (!WinHttpReceiveResponse(hRequest, NULL)) {
        WinHttpCloseHandle(hRequest);
        WinHttpCloseHandle(hConnect);
        WinHttpCloseHandle(hSession);
        return false;
    }

    // HTTP 상태 코드 확인
    DWORD statusCode = 0;
    DWORD dwSize = sizeof(statusCode);
    WinHttpQueryHeaders(hRequest,
        WINHTTP_QUERY_STATUS_CODE | WINHTTP_QUERY_FLAG_NUMBER,
        WINHTTP_HEADER_NAME_BY_INDEX,
        &statusCode, &dwSize, WINHTTP_NO_HEADER_INDEX);

    // 응답 본문 읽기
    std::string buffer;
    for (;;) {
        DWORD avail = 0;
        if (!WinHttpQueryDataAvailable(hRequest, &avail)) break;
        if (avail == 0) break;

        size_t oldSize = buffer.size();
        buffer.resize(oldSize + avail);

        DWORD read = 0;
        if (!WinHttpReadData(hRequest, &buffer[oldSize], avail, &read)) break;
        buffer.resize(oldSize + read);
        if (read == 0) break;
    }

    WinHttpCloseHandle(hRequest);
    WinHttpCloseHandle(hConnect);
    WinHttpCloseHandle(hSession);

    if (statusCode < 200 || statusCode >= 300) {
        return false;
    }

    outResponseJson = buffer;
    return true;
}
