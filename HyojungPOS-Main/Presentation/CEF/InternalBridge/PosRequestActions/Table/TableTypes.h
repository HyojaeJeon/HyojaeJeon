#pragma once
/**
 * TableTypes — 테이블 요청/응답 DTO
 */

#include <string>

namespace TableTypes {

struct SelectTableParams {
    std::string table_id;
};

struct GetTablesParams {
    int floor_id = 0;  // 0 = 전체
};

}  // namespace TableTypes
