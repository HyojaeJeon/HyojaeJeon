#pragma once
/**
 * ClientConfigCrud.h — Row + Columns + Mapper + CRUD helper cho bảng ClientConfig
 * ClientConfigCrud.h — ClientConfig 테이블용 Row + Columns + Mapper + CRUD helper
 *
 * Vai trò / 역할:
 *   Cấu hình client POS (phiên bản DB, phiên bản CT, hạn sử dụng...).
 *   POS 클라이언트 설정 (DB 버전, CT 버전, 사용 기한...).
 *     - ClientConfigRecord: cấu trúc dữ liệu hàng / 행 데이터 구조체
 *     - ClientConfigColumns: tên bảng + hằng số cột / 테이블명 + 컬럼 상수
 *     - ClientConfigCrud: CRUD helper / CRUD helper
 *     - ClientConfigMapper: chuyển đổi RecordSet → Row / RecordSet → Row 변환
 */

#include <string>

class CADORecordset;

// ══════════════════════════════════════════
// ClientConfigRecord — Cấu trúc hàng cấu hình client / 클라이언트 설정 행 구조체
// ══════════════════════════════════════════
struct ClientConfigRecord {
    std::string PosNo;       // Số POS / POS 번호
    std::string DBVersion;   // Phiên bản DB / DB 버전
    std::string CtVersion;   // Phiên bản CT (client) / CT(클라이언트) 버전
    std::string LastExcute;  // Thời gian thực thi cuối / 마지막 실행 시간
    std::string LkStart;     // Ngày bắt đầu khóa / 잠금 시작일
    std::string LimiteEnd;   // Ngày hết hạn / 사용 기한 종료일
    int         SinceDays{}; // Số ngày còn lại / 남은 일수
    std::string LimiteType;  // Loại hạn sử dụng / 기한 유형
};

// ══════════════════════════════════════════
// ClientConfigColumns — Hằng số tên bảng + cột / 테이블명 + 컬럼 상수
// ══════════════════════════════════════════
namespace ClientConfigColumns {
    constexpr const char* TABLE      = "ClientConfig";

    constexpr const char* PosNo      = "PosNo";
    constexpr const char* DBVersion  = "DBVersion";
    constexpr const char* CtVersion  = "CtVersion";
    constexpr const char* LastExcute = "LastExcute";
    constexpr const char* LkStart    = "LkStart";
    constexpr const char* LimiteEnd  = "LimiteEnd";
    constexpr const char* SinceDays  = "SinceDays";
    constexpr const char* LimiteType = "LimiteType";
}

// ══════════════════════════════════════════
// ClientConfigCrud — CRUD helper / CRUD 헬퍼
//
// Quy ước / 규칙:
//   Mỗi hàm trả về chuỗi SQL thuần túy.
//   각 함수는 순수 SQL 문자열을 반환한다.
//   Không thực thi DB — chỉ sinh SQL.
//   DB 실행 없음 — SQL 생성만 담당.
// ══════════════════════════════════════════
namespace ClientConfigCrud {
    // Tìm cấu hình theo số POS / POS 번호로 설정 조회
    std::string SelectByPosNo(const std::string& pos_no);
    // Lấy 1 hàng đầu tiên (dùng khi POS chỉ có 1 bản ghi)
    // 첫 번째 행 1건 조회 (POS에 레코드가 1건만 있을 때 사용)
    std::string SelectTop1();
}

// ══════════════════════════════════════════
// ClientConfigMapper — RecordSet → ClientConfigRecord 변환
// ══════════════════════════════════════════
namespace ClientConfigMapper {
    // Đọc 1 hàng hiện tại từ RecordSet / RecordSet 현재 행 1건 읽기
    ClientConfigRecord FromRecordset(CADORecordset& rs);
}
