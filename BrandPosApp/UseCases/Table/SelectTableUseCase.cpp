#include "SelectTableUseCase.h"

// Domain — Quy tắc nghiệp vụ bàn / 테이블 업무 규칙
#include "../../Domain/Table/TableManager.h"

// UseCases Shared — Các dịch vụ dùng chung / 공통 서비스
#include "../SharedAssets/TransactionRunner.h"
#include "../SharedAssets/IdempotencyService.h"
#include "../SharedAssets/OperationLockService.h"

// Presentation — Gửi sự kiện đến UI / UI 이벤트 전송
#include "../../Presentation/CEF/InternalBridge/PosRealTimeSender.h"

// ══════════════════════════════════════════
// Constructor
// ══════════════════════════════════════════

SelectTableUseCase::SelectTableUseCase(
    TableManager*           tableMgr,
    TransactionRunner*  txRunner,
    IdempotencyService* idempotency,
    PosRealTimeSender*  realtimeSender)
    : tableMgr_(tableMgr)
    , txRunner_(txRunner)
    , idempotency_(idempotency)
    , realtimeSender_(realtimeSender)
{
    // ──────────────────────────────────────────
    // Tất cả dependency được inject từ AppCompositionRoot.
    // 모든 의존성은 AppCompositionRoot에서 주입된다.
    //
    // UseCase không tự tạo bất kỳ dependency nào.
    // UseCase는 어떤 의존성도 직접 생성하지 않는다.
    // ──────────────────────────────────────────
}

// ══════════════════════════════════════════
// Execute — Thực thi use case chọn bàn
// Execute — 테이블 선택 유스케이스 실행
// ══════════════════════════════════════════

UseCaseResult SelectTableUseCase::Execute(const RequestContext& ctx, int tableCode) {

    // ──────────────────────────────────────────
    // ① Kiểm tra idempotency
    // ① 멱등성 검사
    //
    // Nếu idempotency_key được cung cấp, kiểm tra xem yêu cầu này
    // đã được xử lý trước đó hay chưa.
    // idempotency_key가 제공되면, 이 요청이 이전에 처리되었는지 확인한다.
    //
    // ※ Chọn bàn là tác vụ nhẹ nên idempotency_key thường trống.
    //    Nhưng UseCase vẫn kiểm tra theo quy tắc nhất quán.
    //    테이블 선택은 가벼운 작업이라 idempotency_key가 보통 비어있다.
    //    하지만 UseCase는 일관된 규칙에 따라 검사한다.
    // ──────────────────────────────────────────
    if (!ctx.idempotencyKey.empty()) {
        auto check = idempotency_->Check(ctx.idempotencyKey, ctx.requestId);

        switch (check) {
            case IdempotencyService::CheckResult::DUPLICATE_SUCCESS: {
                // Đã xử lý thành công trước đó → trả lại kết quả cũ
                // 이전에 성공 처리됨 → 기존 결과 재반환
                auto prev = idempotency_->GetPreviousResult(ctx.idempotencyKey);
                return UseCaseResult::Replay(prev.value_or("{}"));
            }
            case IdempotencyService::CheckResult::IN_PROGRESS:
                // Đang xử lý bởi yêu cầu khác → từ chối
                // 다른 요청이 처리 중 → 거절
                return UseCaseResult::Busy("Table selection in progress");

            case IdempotencyService::CheckResult::DUPLICATE_FAILED:
                // Thất bại trước đó → cho phép thử lại (fall through)
                // 이전에 실패 → 재시도 허용 (fall through)
                break;

            case IdempotencyService::CheckResult::NEW_REQUEST:
                // Yêu cầu mới → tiếp tục xử lý bình thường
                // 새 요청 → 정상 처리 계속
                break;
        }

        // Đánh dấu bắt đầu xử lý (RECEIVED → PROCESSING)
        // 처리 시작 기록 (RECEIVED → PROCESSING)
        idempotency_->MarkProcessing(ctx.idempotencyKey, ctx.requestId);
    }

    // ──────────────────────────────────────────
    // ② Khóa tác vụ — Chống xử lý đồng thời cùng bàn
    // ② 작업 단위 락 — 같은 테이블 동시 처리 방지
    //
    // Ví dụ: 2 nhân viên nhấn cùng bàn cùng lúc → chỉ 1 người thành công
    // 예: 2명이 같은 테이블을 동시에 클릭 → 1명만 성공
    //
    // Guard tự giải phóng lock khi ra khỏi scope (RAII)
    // Guard는 scope를 벗어나면 자동으로 락 해제 (RAII)
    // ──────────────────────────────────────────
    OperationLockService::Guard lock(
        OperationLockService::Get(),
        "TABLE",                                    // domain
        std::to_string(tableCode)                  // entity_id
    );

    if (!lock.Acquired()) {
        // Bàn này đang được xử lý bởi tác vụ khác
        // 이 테이블은 다른 작업이 처리 중
        return UseCaseResult::Busy(
            "Table " + std::to_string(tableCode) + " is being processed"
        );
    }

    // ──────────────────────────────────────────
    // ③ Transaction bắt đầu
    // ③ 트랜잭션 시작
    //
    // TransactionRunner.Run() sẽ:
    //   - BEGIN TRANSACTION
    //   - Gọi lambda bên trong
    //   - COMMIT nếu ok=true, ROLLBACK nếu ok=false hoặc exception
    //
    // TransactionRunner.Run()은:
    //   - BEGIN TRANSACTION
    //   - 내부 lambda 실행
    //   - ok=true면 COMMIT, ok=false 또는 예외 시 ROLLBACK
    // ──────────────────────────────────────────
    auto result = txRunner_->Run([&]() -> UseCaseResult {

        // ──────────────────────────────────────
        // ④ Manager 호출 — Quy tắc nghiệp vụ bàn
        // ④ Manager 호출 — 테이블 업무 규칙
        //
        // UseCase chỉ "chỉ đạo" — logic tính toán thực tế nằm trong Manager
        // UseCase는 "지휘"만 함 — 실제 계산 로직은 Manager 내부에 있음
        // ──────────────────────────────────────
        auto tableResult = tableMgr_->OccupyTable(tableCode);

        if (!tableResult.success) {
            // Manager trả về thất bại → UseCase chuyển thành UseCaseResult
            // Manager가 실패 반환 → UseCase가 UseCaseResult로 변환
            return UseCaseResult::Fail(
                tableResult.errorCode,
                tableResult.errorDetail
            );
        }

        // ──────────────────────────────────────
        // ⑤ Tạo dữ liệu phản hồi
        // ⑤ 응답 데이터 생성
        //
        // JSON thủ công vì không dùng thư viện JSON ngoài
        // 외부 JSON 라이브러리 미사용으로 수동 JSON 생성
        // ──────────────────────────────────────
        std::string dataJson =
            "{\"tableCode\":" + std::to_string(tableCode) +
            ",\"status\":\"" + tableResult.status + "\"}";

        return UseCaseResult::Success(dataJson);
    });

    // ──────────────────────────────────────────
    // ⑥ Cập nhật Ledger dựa trên kết quả
    // ⑥ 결과에 따라 Ledger 업데이트
    // ──────────────────────────────────────────
    if (!ctx.idempotencyKey.empty()) {
        if (result.ok) {
            idempotency_->MarkSucceeded(ctx.idempotencyKey, result.dataJson);
        } else {
            idempotency_->MarkFailed(ctx.idempotencyKey, result.code);
        }
    }

    // ══════════════════════════════════════════
    // ═══ Ranh giới commit / 커밋 경계 ═══
    // Từ đây trở xuống: DB đã commit thành công
    // 여기서부터: DB 커밋 완료됨
    // Nếu hậu xử lý thất bại, nghiệp vụ vẫn đã xong
    // 후처리가 실패해도 업무는 이미 완료됨
    // ══════════════════════════════════════════

    // ──────────────────────────────────────────
    // ⑦ Gửi sự kiện UI — CHỈ UseCase có quyền
    // ⑦ UI 이벤트 전송 — UseCase만 권한 보유
    //
    // Manager KHÔNG ĐƯỢC gọi PosRealTimeSender (quy tắc thiết kế)
    // Manager는 PosRealTimeSender를 호출할 수 없음 (설계 규칙)
    //
    // PosRealTimeSender sẽ:
    //   → Tạo JSON event
    //   → Gọi ExecuteJavaScript trên CEF browser
    //   → UI (PosRealTimeReceiver) nhận → invalidate RTK Query cache
    //
    // PosRealTimeSender는:
    //   → JSON 이벤트 생성
    //   → CEF 브라우저에서 ExecuteJavaScript 호출
    //   → UI(PosRealTimeReceiver)가 수신 → RTK Query 캐시 무효화
    // ──────────────────────────────────────────
    if (result.ok) {
        realtimeSender_->NotifyTableChanged();
    }

    return result;
}
