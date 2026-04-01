#pragma once
/**
 * RequestContext — 요청 컨텍스트
 *
 * 모든 UseCase에 전달되는 요청 메타데이터.
 * requestId 체인을 통해 PosRequestResponder → UseCases → Manager → PosRealTimeSender 전 구간을 추적한다.
 */

#include <string>
#include <chrono>

struct RequestContext {
    /** 요청 추적용 고유 ID (UI에서 생성) */
    std::string request_id;

    /** 중복 처리 방지 키 (결제/주문 시 필수) */
    std::string idempotency_key;

    /** 요청 발생 시각 */
    std::string timestamp;

    /** 요청 발생 소스 */
    enum class Source {
        INTERNAL_BRIDGE,    // UI → C++ (PosRequest)
        EXTERNAL_BRIDGE,    // 외부 시스템 (배달앱, MQTT)
        SYSTEM,             // 시스템 내부 (부트스트랩, 스케줄러)
    };
    Source source = Source::INTERNAL_BRIDGE;

    /** 현재 운영자 ID */
    std::string operator_id;

    /** 현재 POS 기기 ID */
    std::string device_id;

    /** 요청 수신 시점 (성능 추적용) */
    std::chrono::steady_clock::time_point received_at =
        std::chrono::steady_clock::now();

    /** 경과 시간(ms) 계산 */
    int64_t ElapsedMs() const {
        auto now = std::chrono::steady_clock::now();
        return std::chrono::duration_cast<std::chrono::milliseconds>(
            now - received_at).count();
    }
};
