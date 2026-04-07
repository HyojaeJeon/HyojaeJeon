#pragma once
/**
 * CentralApiClient — 중앙서버 REST API 클라이언트
 *
 * 인증, 상품 동기화, 설정 다운로드 등 중앙서버 통신을 담당한다.
 * WinHTTP 또는 libcurl 기반.
 *
 * 금지:
 *   - 직접 DB 접근 (Infrastructure/Persistence 담당)
 *   - UI 이벤트 발송 (UseCases 담당)
 */

#include "Presentation/CEF/InternalBridge/PosRequestActions/Auth/AuthTypes.h"
#include <string>

class CentralApiClient {
public:
    /**
     * 중앙서버 로그인 인증
     * @param employeeId  사원번호
     * @param password    비밀번호
     * @param outSession  성공 시 세션 데이터 반환
     * @return true: 인증 성공, false: 실패 또는 네트워크 오류
     */
    static bool Login(
        const std::string& employeeId,
        const std::string& password,
        AuthSession& outSession);

    /** 서버 연결 상태 확인 */
    static bool IsOnline();

private:
    /** API 기본 URL (INI 설정에서 로드) */
    static std::string GetBaseUrl();

    /** HTTP POST 요청 */
    static bool PostJson(
        const std::string& url,
        const std::string& bodyJson,
        std::string& outResponseJson);
};
