#pragma once
/**
 * PosRequestResponder — UI 요청 입구/응답 라우터
 *
 * cefQuery 콜백을 수신하여 JSON 파싱 → 버전 검증 → PosRequestActions 라우팅.
 * 응답은 표준 JSON 봉투로 포맷팅하여 반환한다.
 *
 * 요청 규격: { v, requestId, timestamp, cmd, params, idempotencyKey? }
 * 응답 규격: { v, requestId, timestamp, ok, code, data?, error? }
 */

#include "include/cef_browser.h"

#include <string>
#include <functional>

class PosRequestResponder {
public:
    /**
     * cefQuery 콜백에서 호출한다.
     * @param request_json  UI가 보낸 JSON 문자열
     * @param on_success    성공 콜백 (응답 JSON 문자열)
     * @param on_failure    실패 콜백 (에러코드, 에러메시지)
     */
    static void HandleRequest(
        const std::string& request_json,
        std::function<void(const std::string& response_json)> on_success,
        std::function<void(int error_code, const std::string& error_msg)> on_failure);

    /** 지원하는 프로토콜 버전 */
    static constexpr int PROTOCOL_VERSION = 1;

private:
    /**
     * cmd 문자열을 파싱하여 적절한 Actions에 라우팅
     * @param cmd     "TABLE:GET_ALL", "PAYMENT:EXECUTE" 등
     * @param params  요청 파라미터 JSON 객체
     * @param request_id    요청 추적 ID
     * @param idempotency_key  멱등성 키 (빈 문자열 가능)
     * @return 표준 응답 JSON 문자열
     */
    static std::string RouteCommand(
        const std::string& cmd,
        const std::string& params_json,
        const std::string& request_id,
        const std::string& idempotency_key);

    /** 표준 성공 응답 JSON 생성 */
    static std::string MakeSuccessResponse(
        const std::string& request_id,
        const std::string& data_json);

    /** 표준 에러 응답 JSON 생성 */
    static std::string MakeErrorResponse(
        const std::string& request_id,
        const std::string& code,
        const std::string& message);
};
