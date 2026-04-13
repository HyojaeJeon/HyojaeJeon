#!/bin/bash

# ===============================================
# Platform 프로젝트 - 포트 종료 스크립트
# ===============================================
# 사용법: ./kill-ports.sh
# ===============================================

trap 'echo -e "\n${YELLOW}사용자가 종료를 요청했습니다.${NC}"; exit 0' INT

# 색상 정의
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m'

# 배너
echo -e "${CYAN}═══════════════════════════════════════════════════════${NC}"
echo -e "${CYAN}  Platform 프로젝트 - 포트 관리 도구${NC}"
echo -e "${CYAN}═══════════════════════════════════════════════════════${NC}"
echo ""

# 포트 배열 정의
declare -a PORTS=(       "4000"   "3001"              "3002"             "3003"              "6379")
declare -a PORT_DESCRIPTIONS=(
    "CentralApi — NestJS GraphQL 백엔드"
    "SuperAdmin/Portal — Next.js 프론트엔드"
    "BrandPosApp/PosUi — Next.js POS UI"
    "CorporatePortal — Next.js 기업 포털"
    "Redis — 캐시 / 세션 / 큐"
)

# 포트 상태 확인
check_port_usage() {
    local port=$1
    local pid=$(lsof -ti:$port 2>/dev/null)
    if [ -n "$pid" ]; then
        local process_name=$(ps -p $pid -o comm= 2>/dev/null || echo "Unknown")
        echo -e "${RED}● 사용 중${NC} (PID: $pid, $process_name)"
    else
        echo -e "${GREEN}○ 사용 안함${NC}"
    fi
}

# 포트 종료 (단계적: SIGTERM → SIGINT → SIGKILL)
kill_port() {
    local port=$1
    local description=$2

    echo -e "\n${YELLOW}포트 $port 종료 중... ($description)${NC}"

    local pids=$(lsof -ti:$port 2>/dev/null)
    if [ -z "$pids" ]; then
        echo -e "${GREEN}  포트 $port 는 사용 중이 아닙니다.${NC}"
        return 0
    fi

    # 프로세스 정보 출력
    for pid in $pids; do
        if [[ "$pid" =~ ^[0-9]+$ ]] && ps -p "$pid" > /dev/null 2>&1; then
            local cmd=$(ps -p $pid -o args= 2>/dev/null | head -c 80 || echo "")
            echo -e "  ${PURPLE}PID $pid${NC}: $cmd"
        fi
    done

    # 1단계: SIGTERM
    for pid in $pids; do
        [[ "$pid" =~ ^[0-9]+$ ]] && kill -TERM "$pid" 2>/dev/null || true
    done
    sleep 2

    # 2단계: SIGKILL (남은 프로세스)
    local remaining=$(lsof -ti:$port 2>/dev/null || true)
    if [ -n "$remaining" ]; then
        echo -e "  ${RED}강제 종료 (SIGKILL)...${NC}"
        for pid in $remaining; do
            [[ "$pid" =~ ^[0-9]+$ ]] && kill -9 "$pid" 2>/dev/null || true
        done
        sleep 1
    fi

    # 결과 확인
    local final=$(lsof -ti:$port 2>/dev/null || true)
    if [ -n "$final" ]; then
        echo -e "  ${RED}포트 $port 종료 실패 — sudo ./kill-ports.sh 로 재시도하세요${NC}"
    else
        echo -e "  ${GREEN}포트 $port 종료 완료${NC}"
    fi
}

# 전체 포트 종료
kill_all_ports() {
    echo -e "\n${RED}모든 개발 포트 종료 중...${NC}"
    for i in "${!PORTS[@]}"; do
        kill_port "${PORTS[$i]}" "${PORT_DESCRIPTIONS[$i]}"
    done
    echo -e "\n${GREEN}전체 종료 완료${NC}"
}

# 메인 루프
while true; do
    echo -e "\n${BLUE}현재 포트 상태:${NC}"
    echo -e "════════════════════════════════════════════════════"
    for i in "${!PORTS[@]}"; do
        printf "  %s. %-5s %-45s " "$((i+1))" "${PORTS[$i]}" "${PORT_DESCRIPTIONS[$i]}"
        check_port_usage "${PORTS[$i]}"
    done

    echo -e "\n${PURPLE}옵션:${NC}"
    for i in "${!PORTS[@]}"; do
        echo -e "  $((i+1)). 포트 ${PORTS[$i]} 종료"
    done
    echo -e "  $((${#PORTS[@]}+1)). ${RED}모든 포트 종료${NC}"
    echo -e "  $((${#PORTS[@]}+2)). ${BLUE}새로고침${NC}"
    echo -e "  $((${#PORTS[@]}+3)). ${PURPLE}커스텀 포트 종료${NC}"
    echo -e "  0. 종료"
    echo ""

    read -p "> " choice

    case $choice in
        0)
            echo -e "${YELLOW}종료합니다.${NC}"
            break
            ;;
        [1-5])
            index=$((choice-1))
            if [ $index -lt ${#PORTS[@]} ]; then
                kill_port "${PORTS[$index]}" "${PORT_DESCRIPTIONS[$index]}"
            fi
            ;;
        6)
            echo -e "${RED}모든 포트를 종료하시겠습니까? (y/N)${NC}"
            read -p "확인: " confirm
            [[ $confirm =~ ^[Yy]$ ]] && kill_all_ports
            ;;
        7)
            continue
            ;;
        8)
            read -p "포트 번호 입력: " custom_port
            if [[ "$custom_port" =~ ^[0-9]+$ ]] && [ "$custom_port" -ge 1 ] && [ "$custom_port" -le 65535 ]; then
                kill_port "$custom_port" "커스텀 포트"
            else
                echo -e "${RED}잘못된 포트 번호입니다.${NC}"
            fi
            ;;
        *)
            echo -e "${RED}잘못된 입력입니다.${NC}"
            ;;
    esac
done
