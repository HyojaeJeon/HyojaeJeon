/**
 * parse-rc-screens.ts
 *
 * Parses MFC .rc (resource script) files from the legacy POS system and
 * generates per-dialog markdown documentation files.
 *
 * Usage:
 *   npx tsx scripts/parse-rc-screens.ts
 */

import * as fs from "fs";
import * as path from "path";

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

interface RcSource {
  rcPath: string;
  resourceHPath: string;
  label: string; // human-readable label for output
  prefix: string; // file-name prefix (empty for main, "set-" for RestaurantSet)
}

const SOURCES: RcSource[] = [
  {
    rcPath: "/Users/hyojae/projects/fooding/HJ-POS-TEST/Restaurant.rc",
    resourceHPath: "/Users/hyojae/projects/fooding/HJ-POS-TEST/resource.h",
    label: "Restaurant.rc",
    prefix: "",
  },
  {
    rcPath: "/Users/hyojae/projects/fooding/HJ-POS-TEST/RestaurantSet/RestaurantSet.rc",
    resourceHPath:
      "/Users/hyojae/projects/fooding/HJ-POS-TEST/RestaurantSet/resource.h",
    label: "RestaurantSet.rc",
    prefix: "set-",
  },
];

const OUTPUT_DIR =
  "/Users/hyojae/projects/Platform/1.Docs/기획 및 설계/프로젝트 통합설계/화면리스트/화면설계,구조,요소";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface Control {
  type: string; // Button, EDITTEXT, COMBOBOX, LISTBOX, LTEXT, RTEXT, CTEXT, GROUPBOX, ICON, etc.
  id: string; // symbolic ID (IDC_xxx) or numeric
  label: string; // first string param / label text
  x: number;
  y: number;
  w: number;
  h: number;
  styles: string;
  category: "button" | "text" | "edit" | "grid" | "other";
  hidden: boolean; // NOT WS_VISIBLE 또는 WS_DISABLED 포함 시 true
}

interface Dialog {
  id: string; // e.g. IDD_TABLE_DIALOG
  numericId: number | null;
  dialogType: string; // DIALOG or DIALOGEX
  width: number;
  height: number;
  styles: string;
  exstyle: string;
  caption: string;
  font: string;
  controls: Control[];
  sourceFile: string;
  prefix: string;
}

// ---------------------------------------------------------------------------
// Resource.h parser  – map symbolic name <-> numeric value
// ---------------------------------------------------------------------------

function parseResourceH(filePath: string): Map<string, number> {
  const map = new Map<string, number>();
  let content: string;
  try {
    content = fs.readFileSync(filePath, "utf-8");
  } catch {
    // Try reading as latin1 (binary-safe) for CP949 files
    content = fs.readFileSync(filePath, "latin1");
  }
  const re = /^#define\s+(IDD?_\w+|IDC_\w+|IDOK|IDCANCEL|IDCANCEL2)\s+(\d+)/gm;
  let m: RegExpExecArray | null;
  while ((m = re.exec(content)) !== null) {
    map.set(m[1], parseInt(m[2], 10));
  }
  return map;
}

function buildReverseMap(fwd: Map<string, number>): Map<number, string[]> {
  const rev = new Map<number, string[]>();
  for (const [name, val] of fwd) {
    if (!rev.has(val)) rev.set(val, []);
    rev.get(val)!.push(name);
  }
  return rev;
}

// ---------------------------------------------------------------------------
// .rc file parser
// ---------------------------------------------------------------------------

function readFileRobust(filePath: string): string {
  // Try utf-8 first, fallback to latin1 (preserves bytes for CP949)
  try {
    const buf = fs.readFileSync(filePath);
    // Quick heuristic: if the buffer has many 0x80-0xFF bytes it is likely CP949
    return buf.toString("utf-8");
  } catch {
    return fs.readFileSync(filePath, "latin1");
  }
}

/**
 * Parse all DIALOG / DIALOGEX blocks from an .rc file.
 */
function parseRcFile(
  source: RcSource,
  idMap: Map<string, number>
): Dialog[] {
  const content = readFileRobust(source.rcPath);
  const lines = content.split(/\r?\n/);
  const dialogs: Dialog[] = [];

  let i = 0;
  while (i < lines.length) {
    const line = lines[i].trim();

    // Match: IDD_xxx DIALOG[EX] x, y, w, h
    const dlgMatch = line.match(
      /^(IDD_\w+)\s+(DIALOGEX?)\s+\d+\s*,\s*\d+\s*,\s*(\d+)\s*,\s*(\d+)/
    );
    if (!dlgMatch) {
      i++;
      continue;
    }

    const dialogId = dlgMatch[1];
    const dialogType = dlgMatch[2];
    const width = parseInt(dlgMatch[3], 10);
    const height = parseInt(dlgMatch[4], 10);

    let styles = "";
    let exstyle = "";
    let caption = "";
    let font = "";

    // Read STYLE, EXSTYLE, CAPTION, FONT lines before BEGIN
    i++;
    while (i < lines.length) {
      const l = lines[i].trim();
      if (l === "BEGIN") break;
      if (l.startsWith("STYLE ")) {
        styles = l.replace(/^STYLE\s+/, "").trim();
      } else if (l.startsWith("EXSTYLE ")) {
        exstyle = l.replace(/^EXSTYLE\s+/, "").trim();
      } else if (l.startsWith("CAPTION ")) {
        caption = l.replace(/^CAPTION\s+/, "").replace(/^"|"$/g, "").trim();
      } else if (l.startsWith("FONT ")) {
        font = l.replace(/^FONT\s+/, "").trim();
      }
      i++;
    }

    if (i >= lines.length) break;
    // i is now on BEGIN
    i++;

    const controls: Control[] = [];

    // Read controls until END
    while (i < lines.length) {
      const cl = lines[i].trim();
      if (cl === "END") {
        i++;
        break;
      }

      const ctrl = parseControlLine(cl);
      if (ctrl) {
        controls.push(ctrl);
      }
      i++;
    }

    dialogs.push({
      id: dialogId,
      numericId: idMap.get(dialogId) ?? null,
      dialogType,
      width,
      height,
      styles,
      exstyle,
      caption,
      font,
      controls,
      sourceFile: source.label,
      prefix: source.prefix,
    });
  }

  return dialogs;
}

// ---------------------------------------------------------------------------
// Control line parser
// ---------------------------------------------------------------------------

function parseControlLine(line: string): Control | null {
  // Remove trailing comma if any
  line = line.replace(/,\s*$/, "").trim();
  if (!line || line.startsWith("//")) return null;

  // Try each known control type
  let ctrl: Control | null = null;

  ctrl = ctrl || tryParsePushbutton(line);
  ctrl = ctrl || tryParseDefPushbutton(line);
  ctrl = ctrl || tryParseEdittext(line);
  ctrl = ctrl || tryParseCombobox(line);
  ctrl = ctrl || tryParseListbox(line);
  ctrl = ctrl || tryParseLtext(line);
  ctrl = ctrl || tryParseRtext(line);
  ctrl = ctrl || tryParseCtext(line);
  ctrl = ctrl || tryParseGroupbox(line);
  ctrl = ctrl || tryParseIcon(line);
  ctrl = ctrl || tryParseControl(line);

  return ctrl;
}

function extractQuotedAndRest(s: string): { quoted: string; rest: string } | null {
  const m = s.match(/^"((?:[^"\\]|\\.)*)"\s*,?\s*(.*)/);
  if (m) return { quoted: m[1], rest: m[2] };
  return null;
}

function parseNumericParams(s: string): number[] {
  return s
    .split(",")
    .map((x) => x.trim())
    .filter((x) => /^-?\d+$/.test(x))
    .map(Number);
}

function splitParams(s: string): string[] {
  // Split by commas, but respect quoted strings
  const parts: string[] = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < s.length; i++) {
    const ch = s[i];
    if (ch === '"') {
      inQuotes = !inQuotes;
      current += ch;
    } else if (ch === "," && !inQuotes) {
      parts.push(current.trim());
      current = "";
    } else {
      current += ch;
    }
  }
  if (current.trim()) parts.push(current.trim());
  return parts;
}

// PUSHBUTTON "label", ID, x, y, w, h [, style]
function tryParsePushbutton(line: string): Control | null {
  const m = line.match(/^PUSHBUTTON\s+(.*)/i);
  if (!m) return null;
  return parseSimpleControl(m[1], "Button", "button");
}

// DEFPUSHBUTTON "label", ID, x, y, w, h [, style]
function tryParseDefPushbutton(line: string): Control | null {
  const m = line.match(/^DEFPUSHBUTTON\s+(.*)/i);
  if (!m) return null;
  return parseSimpleControl(m[1], "Button", "button");
}

// EDITTEXT ID, x, y, w, h [, style]
function tryParseEdittext(line: string): Control | null {
  const m = line.match(/^EDITTEXT\s+(.*)/i);
  if (!m) return null;
  const params = splitParams(m[1]);
  if (params.length < 5) return null;
  const id = params[0];
  const nums = params.slice(1, 5).map(Number);
  const styles = params.slice(5).join(" | ");
  return {
    type: "EditText",
    id,
    label: "",
    x: nums[0],
    y: nums[1],
    w: nums[2],
    h: nums[3],
    styles: styles || "",
    category: "edit",
    hidden: isHiddenControl(styles || ""),
  };
}

// COMBOBOX ID, x, y, w, h [, style]
function tryParseCombobox(line: string): Control | null {
  const m = line.match(/^COMBOBOX\s+(.*)/i);
  if (!m) return null;
  const params = splitParams(m[1]);
  if (params.length < 5) return null;
  const id = params[0];
  const nums = params.slice(1, 5).map(Number);
  const styles = params.slice(5).join(" | ");
  return {
    type: "ComboBox",
    id,
    label: "",
    x: nums[0],
    y: nums[1],
    w: nums[2],
    h: nums[3],
    styles: styles || "",
    category: "edit",
    hidden: isHiddenControl(styles || ""),
  };
}

// LISTBOX ID, x, y, w, h [, style]
function tryParseListbox(line: string): Control | null {
  const m = line.match(/^LISTBOX\s+(.*)/i);
  if (!m) return null;
  const params = splitParams(m[1]);
  if (params.length < 5) return null;
  const id = params[0];
  const nums = params.slice(1, 5).map(Number);
  const styles = params.slice(5).join(" | ");
  return {
    type: "ListBox",
    id,
    label: "",
    x: nums[0],
    y: nums[1],
    w: nums[2],
    h: nums[3],
    styles: styles || "",
    category: "grid",
    hidden: isHiddenControl(styles || ""),
  };
}

// LTEXT "text", ID, x, y, w, h [, style]
function tryParseLtext(line: string): Control | null {
  const m = line.match(/^LTEXT\s+(.*)/i);
  if (!m) return null;
  return parseSimpleControl(m[1], "LText", "text");
}

function tryParseRtext(line: string): Control | null {
  const m = line.match(/^RTEXT\s+(.*)/i);
  if (!m) return null;
  return parseSimpleControl(m[1], "RText", "text");
}

function tryParseCtext(line: string): Control | null {
  const m = line.match(/^CTEXT\s+(.*)/i);
  if (!m) return null;
  return parseSimpleControl(m[1], "CText", "text");
}

function tryParseGroupbox(line: string): Control | null {
  const m = line.match(/^GROUPBOX\s+(.*)/i);
  if (!m) return null;
  return parseSimpleControl(m[1], "GroupBox", "other");
}

function tryParseIcon(line: string): Control | null {
  const m = line.match(/^ICON\s+(.*)/i);
  if (!m) return null;
  const params = splitParams(m[1]);
  if (params.length < 5) return null;
  const iconId = params[0].replace(/^"|"$/g, "");
  const id = params[1];
  const nums = params.slice(2, 6).map(Number);
  return {
    type: "Icon",
    id,
    label: iconId,
    x: nums[0],
    y: nums[1],
    w: nums[2],
    h: nums[3],
    styles: "",
    category: "other",
    hidden: false,
  };
}

// Generic: "label", ID, x, y, w, h [, style]
function parseSimpleControl(
  rest: string,
  type: string,
  category: Control["category"]
): Control | null {
  const params = splitParams(rest);
  if (params.length < 6) return null;
  const label = params[0].replace(/^"|"$/g, "");
  const id = params[1];
  const nums = params.slice(2, 6).map(Number);
  const styles = params.slice(6).join(" | ");
  return { type, id, label, x: nums[0], y: nums[1], w: nums[2], h: nums[3], styles, category, hidden: isHiddenControl(styles) };
}

// CONTROL "text", ID, "ClassName", style, x, y, w, h [, exstyle]
function tryParseControl(line: string): Control | null {
  const m = line.match(/^CONTROL\s+(.*)/i);
  if (!m) return null;
  const params = splitParams(m[1]);
  // Minimum: "text", ID, "class", style, x, y, w, h
  if (params.length < 8) return null;

  const label = params[0].replace(/^"|"$/g, "");
  const id = params[1];
  const className = params[2].replace(/^"|"$/g, "");
  // styles can be multiple tokens joined; collect everything between className and x,y,w,h
  // In .rc CONTROL syntax: params 3..N-4 are styles, last 4 are x,y,w,h
  // But sometimes exstyle is appended as 9th param
  // We need to find the 4 numeric values at the end
  const allParts = params.slice(3);

  // Find the rightmost 4 consecutive numeric values
  let numStart = -1;
  for (let i = allParts.length - 4; i >= 0; i--) {
    if (
      /^-?\d+$/.test(allParts[i]) &&
      /^-?\d+$/.test(allParts[i + 1]) &&
      /^-?\d+$/.test(allParts[i + 2]) &&
      /^-?\d+$/.test(allParts[i + 3])
    ) {
      numStart = i;
      break;
    }
  }

  if (numStart < 0) return null;

  const styleTokens = allParts.slice(0, numStart).join(" | ").trim();
  const x = parseInt(allParts[numStart], 10);
  const y = parseInt(allParts[numStart + 1], 10);
  const w = parseInt(allParts[numStart + 2], 10);
  const h = parseInt(allParts[numStart + 3], 10);
  const exstyleTokens = allParts.slice(numStart + 4).join(" | ").trim();

  const allStyles = [styleTokens, exstyleTokens].filter(Boolean).join(" | ");

  // Determine category from className
  const cat = categorizeControl(className, id, allStyles);

  return {
    type: className || "CONTROL",
    id,
    label,
    x,
    y,
    w,
    h,
    styles: allStyles,
    category: cat,
    hidden: isHiddenControl(allStyles),
  };
}

function categorizeControl(
  className: string,
  id: string,
  styles: string
): Control["category"] {
  const cls = className.toLowerCase();
  if (cls === "button") {
    // Check if it's actually a checkbox or radio
    if (styles.includes("BS_AUTOCHECKBOX") || styles.includes("BS_AUTORADIOBUTTON")) {
      return "edit";
    }
    return "button";
  }
  if (cls === "edit" || cls === "richedit") return "edit";
  if (cls === "combobox") return "edit";
  if (cls === "listbox") return "grid";
  if (cls === "static") return "text";
  if (cls === "mfcgridctrl") return "grid";
  if (cls === "sysdatetimepick32") return "edit";
  if (cls === "syslistview32" || cls === "msflexgrid") return "grid";
  return "other";
}

// ---------------------------------------------------------------------------
// 숨김 여부 판단
// ---------------------------------------------------------------------------

function isHiddenControl(styles: string): boolean {
  return styles.includes("NOT WS_VISIBLE") || (styles.includes("WS_DISABLED") && styles.includes("NOT WS_VISIBLE"));
}

// ---------------------------------------------------------------------------
// 용도 추정 (purpose inference)
// ---------------------------------------------------------------------------

const PURPOSE_MAP: Record<string, string> = {
  // Common patterns
  IDOK: "확인/완료 버튼",
  IDCANCEL: "닫기/취소 버튼",
  IDCANCEL2: "보조 취소 버튼",

  // Table screen (T_ prefix)
  IDC_T_1F: "1층 선택 버튼",
  IDC_T_2F: "2층 선택 버튼",
  IDC_T_3F: "3층 선택 버튼",
  IDC_T_4F: "4층 선택 버튼",
  IDC_T_UP: "위층 이동 버튼",
  IDC_T_DOWN: "아래층 이동 버튼",
  IDC_T_NEXT: "다음 페이지 버튼",
  IDC_T_BACK: "이전 페이지 버튼",
  IDC_T_CASH: "현금 결제 버튼",
  IDC_T_CARD: "카드 결제 버튼",
  IDC_T_CASHBILL: "현금영수증 버튼",
  IDC_T_TEMPSIGN: "카드 결제 버튼",
  IDC_T_POINT: "포인트 버튼",
  IDC_T_BSELECT: "기능 선택 버튼",
  IDC_T_MIDDLECONNECT: "중간 연결 버튼",
  IDC_T_SERVERCONNECT: "서버 연결 버튼",
  IDC_T_MINIMIZE: "최소화 버튼",
  IDC_T_DILIGENCE: "근태 관리 버튼",
  IDC_T_CUSTDELI: "고객 배달 버튼",
  IDC_T_CUSTDELI2: "배달 관리 버튼",
  IDC_T_EMPSET: "직원 설정 버튼",
  IDC_T_DELISTART: "배달 시작 버튼",
  IDC_T_DELICOMP: "배달 완료 버튼",
  IDC_T_TESTBTN: "테스트 버튼",

  IDC_S_DATE: "날짜 표시",
  IDC_S_TIME: "시간 표시",
  IDC_S_PERSON: "담당자 표시",
  IDC_S_FLOOR: "층 표시",
  IDC_S_PAGE: "페이지 표시",
  IDC_S_COUNT: "건수 표시",
  IDC_S_ORCOUNT: "주문 건수 표시",
  IDC_S_SUMRECEIVE: "수납 합계 표시",
  IDC_S_SUMORDER: "주문 합계 표시",
  IDC_S_SUMCASH: "현금 합계 표시",
  IDC_S_SUMCARD: "카드 합계 표시",
  IDC_S_SUMETC: "기타 합계 표시",
  IDC_S_SUMSUM: "총 합계 표시",
  IDC_S_HIDE: "숨김 영역",
  IDC_S_EMP: "직원명 표시",
  IDC_S_POSNO: "POS 번호 표시",
  IDC_S_ADJUSTNO: "정산 번호 표시",

  // Order screen (O_ prefix)
  IDC_O_SELECT: "선택 버튼",
  IDC_O_ACCOUNT: "결제 버튼",
  IDC_O_DELIVERY: "배달 버튼",
  IDC_O_PACKING: "포장 버튼",
  IDC_O_SERVICE: "서비스 버튼",
  IDC_O_DISCOUNT: "할인 버튼",
  IDC_O_ONECALLBACK: "개별 취소 버튼",
  IDC_O_TOTALCALLBACK: "전체 취소 버튼",
  IDC_O_KITCHENMEMO: "주문 메모 버튼",
  IDC_O_ORDERPRINT: "주문 인쇄 버튼",
  IDC_O_BACK: "이전 메뉴 그룹 버튼",
  IDC_O_NEXT: "다음 메뉴 그룹 버튼",
  IDC_O_TABLENUM: "테이블 번호 표시",
  IDC_O_PERSON: "인원수 표시",
  IDC_O_CUSTNUM: "고객 번호 표시",
  IDC_O_ORDERMONEY: "주문 금액 표시",
  IDC_O_DISMONEY: "할인 금액 표시",
  IDC_O_TOTALMONEY: "총 금액 표시",
  IDC_O_SNUM: "수량 입력",
  IDC_O_LINECHANGE: "행 변경 버튼",
  IDC_O_NUMBERBACK: "수량 -1 버튼",
  IDC_O_TABLEEMP: "테이블 담당자 버튼",
  IDC_O_SALEMANAGE: "판매 관리 버튼",
  IDC_O_NUMINPUT: "수량 입력 버튼",
  IDC_O_CUSTSERCH: "회원 검색 버튼",
  IDC_O_NUMBERADD2: "수량 위 스크롤",
  IDC_O_NUMBER_BACK: "수량 아래 스크롤",
  IDC_O_UP: "주문 목록 위로",
  IDC_O_DOWN: "주문 목록 아래로",
  IDC_O_MINIMIZE: "최소화 버튼",
  IDC_O_DILIGENCE: "근태 버튼",
  IDC_O_TABLEMSG: "테이블 메시지 표시",
  IDC_O_CUSTIN: "고객 입장",
  IDC_O_CUSTPOINT: "고객 포인트",
  IDC_O_CUSTCARD: "고객 카드",

  // Account (A_ prefix)
  IDC_A_CASH: "현금 결제 버튼",
  IDC_A_CARD: "카드 결제 버튼",
  IDC_A_PHONE: "핸드폰 결제 버튼",
  IDC_A_POINT: "포인트 결제 버튼",
  IDC_A_COUPON: "쿠폰 결제 버튼",
  IDC_A_MEMBER: "회원 결제 버튼",
  IDC_A_MEMBERCALLBACK: "회원 취소 버튼",
  IDC_A_MONEYBOX: "시재함 버튼",
  IDC_A_TIP: "팁 버튼",
  IDC_A_ACCLEAR: "결제 초기화 버튼",
  IDC_A_BILLPRINT: "영수증 인쇄 버튼",
  IDC_A_BILLPRINT2: "영수증 인쇄2 버튼",
  IDC_A_ACCANCEL: "결제 취소 버튼",
  IDC_A_TABLEEMP: "테이블 담당자 버튼",
  IDC_A_TABLENUM: "테이블 번호 표시",
  IDC_A_DATE: "날짜 표시",
  IDC_A_PERSON: "인원수 표시",
  IDC_A_SERVICE: "서비스 버튼",
  IDC_A_DISCOUNT: "할인 버튼",
  IDC_A_DISCOUNT2: "할인2 버튼",
  IDC_A_DISCOUNT3: "할인3 버튼",
  IDC_A_NOCASH: "무현금 결제 버튼",
  IDC_A_CASHBACK: "캐시백 버튼",
  IDC_A_BEFOREACC: "이전 결제 버튼",
  IDC_A_MEMBEREG: "회원 등록 버튼",
  IDC_A_PRINTOUT: "출력 버튼",
  IDC_A_WORKAMT: "작업 금액 표시",

  // Main menu (M_ prefix)
  IDC_M_BUSINESS: "영업 시작 버튼",
  IDC_M_FINISH: "마감 버튼",
  IDC_M_ANALYSIS: "분석 버튼",
  IDC_M_COMMUTE: "출퇴근 버튼",
  IDC_M_SETUP: "설정 버튼",
  IDC_M_MEMBER: "회원 관리 버튼",
  IDC_M_VER: "버전 표시",
  IDC_M_STORE: "매장명 표시",
  IDC_M_POSNO: "POS 번호 표시",
  IDC_M_EMP: "직원명 표시",
  IDC_M_ADJUST: "정산 번호 표시",
  IDC_M_OPEN: "영업 시작 시간 표시",
  IDC_M_COMPANY: "설치 업체 표시",
  IDC_M_COMPANY2: "A/S 업체 표시",

  // Grid/list
  IDC_GRID: "데이터 그리드",
  IDC_GRID2: "데이터 그리드 2",
  IDC_GRID3: "데이터 그리드 3",
  IDC_GRID4: "데이터 그리드 4",
  IDC_GRID5: "데이터 그리드 5",
  IDC_GRIDCID: "CID 그리드",
  IDC_GRIDCID2: "테이블 그리드",

  // Numpad
  IDC_N_NUM0: "숫자 0",
  IDC_N_NUM1: "숫자 1",
  IDC_N_NUM2: "숫자 2",
  IDC_N_NUM3: "숫자 3",
  IDC_N_NUM4: "숫자 4",
  IDC_N_NUM5: "숫자 5",
  IDC_N_NUM6: "숫자 6",
  IDC_N_NUM7: "숫자 7",
  IDC_N_NUM8: "숫자 8",
  IDC_N_NUM9: "숫자 9",
  IDC_N_NUM000: "천 단위",
  IDC_N_NUM0000: "만 단위",
  IDC_N_NUM00: "확인",
  IDC_N_NUMBS: "백스페이스",
  IDC_N_NUMCLR: "클리어",

  // Settings (SET_ prefix)
  IDC_SET_ITEM: "상품 설정 버튼",
  IDC_SET_TABLE: "테이블(자리) 설정 버튼",
  IDC_SET_MENU: "화면상품설정 버튼",
  IDC_SET_STORE: "매장 설정 버튼",
  IDC_SET_DEVICE: "장비 설정 버튼",
  IDC_SET_EMP: "직원 설정 버튼",
  IDC_SET_CARD: "카드 설정 버튼",
  IDC_SET_CUST: "고객 설정 버튼",
  IDC_SET_EVENT: "행사 설정 버튼",
  IDC_SET_DISCOUNT: "할인매출설정 버튼",
  IDC_SET_PRINT: "인쇄 설정 버튼",
  IDC_SET_ORDERMSG: "주문 메시지 설정 버튼",
  IDC_SET_BASIC: "기초 설정 버튼",
  IDC_SET_KEYCLEAR: "Lock Clear 버튼",
  IDC_SET_INISET: "환경 설정 버튼",
  IDC_SET_COMPANY: "설치 회사 설정 버튼",
  IDC_SET_DATADEL: "데이터 삭제 버튼",
  IDC_SET_TABLE2: "테이블(좌석) 설정 버튼",
  IDC_SET_INOUT: "입출금 설정 버튼",
  IDC_SET_SUPPLY: "거래처 설정 버튼",
  IDC_SET_RESTORE: "데이터 복원 버튼",
  IDC_SET_TABLEMSG: "테이블 메모 설정 버튼",
  IDC_SET_RECEIPT: "간이영수증 설정 버튼",
  IDC_SET_CUSTINFO: "고객 정보 설정 버튼",
  IDC_SET_ASP: "ASP 설정 버튼",
  IDC_SET_CASHBACK: "PAY(캐시백) 설정 버튼",
  IDC_SET_ETCSET: "기타 설정 버튼",
  IDC_SET_FAVORITES: "메뉴 즐겨찾기 버튼",
  IDC_SET_BASICCODE: "기초코드 설정 버튼",
  IDC_SET_ITEMPLU: "PLU 상품 버튼",
  IDC_SET_DEVICEMART: "장비(마트) 설정 버튼",
  IDC_SET_PLUKEY: "PLU키 설정 버튼",
  IDC_SET_PRESET: "프리셋 설정 버튼",
  IDC_SET_KIOSK: "Table Order 설정 버튼",
  IDC_BTN_HDWWIZ: "하드웨어 설치마법사 버튼",

  // Language buttons
  IDC_BTN_KR: "한국어 선택 버튼",
  IDC_BTN_EN: "영어 선택 버튼",
  IDC_BTN_VN: "베트남어 선택 버튼",
};

function inferPurpose(ctrl: Control): string {
  // Direct match
  if (PURPOSE_MAP[ctrl.id]) return PURPOSE_MAP[ctrl.id];

  const id = ctrl.id.toUpperCase();
  const label = ctrl.label;

  // Pattern-based inference

  // Menu buttons (O_MENUxx)
  if (/^IDC_O_MENU\d+$/.test(id)) return "메뉴 버튼";
  if (/^IDC_O_TOPMENU\d+$/.test(id)) return "메뉴 그룹 탭 버튼";
  if (/^IDC_O_NUM\d+$/.test(id)) return `숫자 ${label} 버튼`;
  if (/^IDC_O_BTN\d+$/.test(id)) return "기능 버튼";
  if (/^IDC_OR_BTN\d+$/.test(id)) return "주문 기능 버튼";
  if (/^IDC_OA_BTN\d+$/.test(id)) return "주문/결제 기능 버튼";
  if (/^IDC_A_BTN\d+$/.test(id)) return "결제 기능 버튼";

  // Table buttons (T_BTNx)
  if (/^IDC_T_BTN\d+$/.test(id)) return "테이블 기능 버튼";
  if (/^IDC_BTN\d+$/.test(id)) return "기능 버튼";

  // Seltable
  if (id.startsWith("IDC_SELTABLE_")) return "테이블 선택 요소";

  // Grid navigation
  if (id.includes("_UP") || id.includes("GRIDUP")) return "위로 스크롤 버튼";
  if (id.includes("_DOWN") || id.includes("GRIDDOWN")) return "아래로 스크롤 버튼";
  if (id.includes("_BACK") || id.includes("_PREV")) return "이전 페이지 버튼";
  if (id.includes("_NEXT")) return "다음 페이지 버튼";

  // Grid controls
  if (id.includes("GRID") && ctrl.category === "grid") return "데이터 그리드";

  // Card buttons
  if (/^IDC_BTN_CARD\d+$/.test(id)) return "카드사 선택 버튼";

  // Number pad
  if (/^IDC_M_NUM\d+$/.test(id)) return `숫자 ${label} 버튼`;
  if (id.includes("NUMBS")) return "백스페이스 버튼";
  if (id.includes("NUMCLR")) return "클리어 버튼";

  // DateTimePicker
  if (ctrl.type === "SysDateTimePick32") return "날짜 선택 컨트롤";

  // Common patterns from label
  if (label && ctrl.category === "button") {
    return `${label} 버튼`;
  }
  if (label && ctrl.category === "text") {
    return `${label} 표시`;
  }

  // COM port combos
  if (/^IDC_COM\d+$/.test(id) && ctrl.category === "edit") return "COM 포트 선택";
  if (/^IDC_POSNO\d+$/.test(id)) return "POS 번호 선택";
  if (/^IDC_PRNCNT\d+$/.test(id)) return "인쇄 횟수 선택";

  // Fallback
  if (ctrl.category === "button") return "버튼";
  if (ctrl.category === "text") return "텍스트 표시";
  if (ctrl.category === "edit") return "입력 필드";
  if (ctrl.category === "grid") return "데이터 표시 영역";

  return "";
}

// ---------------------------------------------------------------------------
// Markdown generation
// ---------------------------------------------------------------------------

function dialogIdToFileName(dialogId: string, prefix: string): string {
  // IDD_TABLE_DIALOG -> table-dialog
  let name = dialogId
    .replace(/^IDD_/, "")
    .toLowerCase()
    .replace(/_/g, "-");
  return prefix + name + ".md";
}

function dialogIdToTitle(dialogId: string): string {
  // IDD_TABLE_DIALOG -> TABLE_DIALOG
  return dialogId.replace(/^IDD_/, "");
}

function escapeMarkdown(s: string): string {
  return s.replace(/\|/g, "\\|").replace(/\n/g, "\\n").replace(/\r/g, "");
}

function alignLabel(type: string): string {
  if (type === "LText") return "왼쪽";
  if (type === "RText") return "오른쪽";
  if (type === "CText") return "가운데";
  return "-";
}

function generateDialogMarkdown(dialog: Dialog): string {
  const buttons = dialog.controls.filter((c) => c.category === "button");
  const texts = dialog.controls.filter((c) => c.category === "text");
  const edits = dialog.controls.filter((c) => c.category === "edit");
  const grids = dialog.controls.filter((c) => c.category === "grid");
  const others = dialog.controls.filter((c) => c.category === "other");

  const totalCount = dialog.controls.length;

  let md = `# ${dialogIdToTitle(dialog.id)} 화면 구조\n\n`;
  md += `## 기본 정보\n\n`;
  md += `| 항목 | 값 |\n`;
  md += `|------|---|\n`;
  md += `| 다이얼로그 ID | ${dialog.id} |\n`;
  md += `| 리소스 값 | ${dialog.numericId ?? "N/A"} |\n`;
  md += `| 크기 (DLU) | ${dialog.width} x ${dialog.height} |\n`;
  md += `| 다이얼로그 타입 | ${dialog.dialogType} |\n`;
  md += `| 스타일 | ${escapeMarkdown(dialog.styles) || "-"} |\n`;
  if (dialog.exstyle) {
    md += `| 확장 스타일 | ${escapeMarkdown(dialog.exstyle)} |\n`;
  }
  if (dialog.caption) {
    md += `| 캡션 | ${escapeMarkdown(dialog.caption)} |\n`;
  }
  md += `| 폰트 | ${escapeMarkdown(dialog.font) || "-"} |\n`;
  md += `| 소스 파일 | ${dialog.sourceFile} |\n`;
  md += `| 총 UI 요소 수 | ${totalCount} |\n`;
  md += `\n`;

  // Buttons
  md += `## UI 요소 목록\n\n`;
  md += `### 버튼 (${buttons.length}개)\n\n`;
  if (buttons.length > 0) {
    md += `| ID | 라벨 | 위치 (x,y) | 크기 (w x h) | 숨김 | 스타일 | 용도 추정 |\n`;
    md += `|---|---|---|---|---|---|---|\n`;
    for (const c of buttons) {
      md += `| ${c.id} | ${escapeMarkdown(c.label)} | (${c.x},${c.y}) | ${c.w} x ${c.h} | ${c.hidden ? '**TRUE**' : 'FALSE'} | ${escapeMarkdown(c.styles)} | ${inferPurpose(c)} |\n`;
    }
  } else {
    md += `(없음)\n`;
  }
  md += `\n`;

  // Text/labels
  md += `### 텍스트/라벨 (${texts.length}개)\n\n`;
  if (texts.length > 0) {
    md += `| ID | 텍스트 | 위치 (x,y) | 크기 (w x h) | 숨김 | 정렬 | 용도 추정 |\n`;
    md += `|---|---|---|---|---|---|---|\n`;
    for (const c of texts) {
      md += `| ${c.id} | ${escapeMarkdown(c.label)} | (${c.x},${c.y}) | ${c.w} x ${c.h} | ${c.hidden ? '**TRUE**' : 'FALSE'} | ${alignLabel(c.type)} | ${inferPurpose(c)} |\n`;
    }
  } else {
    md += `(없음)\n`;
  }
  md += `\n`;

  // Edits
  md += `### 입력 필드 (${edits.length}개)\n\n`;
  if (edits.length > 0) {
    md += `| ID | 타입 | 위치 (x,y) | 크기 (w x h) | 숨김 | 스타일 | 용도 추정 |\n`;
    md += `|---|---|---|---|---|---|---|\n`;
    for (const c of edits) {
      md += `| ${c.id} | ${c.type} | (${c.x},${c.y}) | ${c.w} x ${c.h} | ${c.hidden ? '**TRUE**' : 'FALSE'} | ${escapeMarkdown(c.styles)} | ${inferPurpose(c)} |\n`;
    }
  } else {
    md += `(없음)\n`;
  }
  md += `\n`;

  // Grids/lists
  md += `### 그리드/리스트 (${grids.length}개)\n\n`;
  if (grids.length > 0) {
    md += `| ID | 타입 | 위치 (x,y) | 크기 (w x h) | 숨김 | 용도 추정 |\n`;
    md += `|---|---|---|---|---|---|\n`;
    for (const c of grids) {
      md += `| ${c.id} | ${c.type} | (${c.x},${c.y}) | ${c.w} x ${c.h} | ${c.hidden ? '**TRUE**' : 'FALSE'} | ${inferPurpose(c)} |\n`;
    }
  } else {
    md += `(없음)\n`;
  }
  md += `\n`;

  // Others
  md += `### 기타 컨트롤 (${others.length}개)\n\n`;
  if (others.length > 0) {
    md += `| ID | 타입 | 라벨 | 위치 (x,y) | 크기 (w x h) | 숨김 | 용도 추정 |\n`;
    md += `|---|---|---|---|---|---|---|\n`;
    for (const c of others) {
      md += `| ${c.id} | ${c.type} | ${escapeMarkdown(c.label)} | (${c.x},${c.y}) | ${c.w} x ${c.h} | ${c.hidden ? '**TRUE**' : 'FALSE'} | ${inferPurpose(c)} |\n`;
    }
  } else {
    md += `(없음)\n`;
  }
  md += `\n`;

  // Stats
  md += `## 요소 통계\n\n`;
  md += `| 유형 | 개수 |\n`;
  md += `|------|------|\n`;
  md += `| 버튼 | ${buttons.length} |\n`;
  md += `| 텍스트/라벨 | ${texts.length} |\n`;
  md += `| 입력 필드 | ${edits.length} |\n`;
  md += `| 그리드/리스트 | ${grids.length} |\n`;
  md += `| 기타 | ${others.length} |\n`;
  md += `| **합계** | **${totalCount}** |\n`;

  return md;
}

function generateIndexMarkdown(allDialogs: Dialog[]): string {
  const mainDialogs = allDialogs.filter((d) => d.sourceFile === "Restaurant.rc");
  const setDialogs = allDialogs.filter(
    (d) => d.sourceFile === "RestaurantSet.rc"
  );

  let md = `# MFC 화면 리소스 전체 인벤토리\n\n`;
  md += `> 자동 생성일: ${new Date().toISOString().split("T")[0]}\n`;
  md += `> 파싱 스크립트: \`BrandPosApp/PosUi/scripts/parse-rc-screens.ts\`\n\n`;

  md += `## 요약\n\n`;
  md += `| 항목 | 값 |\n`;
  md += `|------|---|\n`;
  md += `| 전체 다이얼로그 수 | ${allDialogs.length} |\n`;
  md += `| Restaurant.rc (메인 POS) | ${mainDialogs.length} |\n`;
  md += `| RestaurantSet.rc (설정 앱) | ${setDialogs.length} |\n`;
  md += `| 전체 UI 요소 수 | ${allDialogs.reduce((s, d) => s + d.controls.length, 0)} |\n`;
  md += `\n`;

  md += `## Restaurant.rc 화면 목록 (메인 POS)\n\n`;
  md += generateDialogTable(mainDialogs);
  md += `\n`;

  md += `## RestaurantSet.rc 화면 목록 (설정 앱)\n\n`;
  md += generateDialogTable(setDialogs);

  return md;
}

function generateDialogTable(dialogs: Dialog[]): string {
  let md = `| # | 다이얼로그 ID | 리소스 값 | 크기 (DLU) | 버튼 수 | 입력 수 | 그리드 수 | 총 요소 수 | 파일 |\n`;
  md += `|---|---|---|---|---|---|---|---|---|\n`;

  for (let i = 0; i < dialogs.length; i++) {
    const d = dialogs[i];
    const buttons = d.controls.filter((c) => c.category === "button").length;
    const edits = d.controls.filter((c) => c.category === "edit").length;
    const grids = d.controls.filter((c) => c.category === "grid").length;
    const total = d.controls.length;
    const fileName = dialogIdToFileName(d.id, d.prefix);

    md += `| ${i + 1} | [${d.id}](./${encodeURIComponent(fileName)}) | ${d.numericId ?? "N/A"} | ${d.width} x ${d.height} | ${buttons} | ${edits} | ${grids} | ${total} | ${d.sourceFile} |\n`;
  }

  return md;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

function main() {
  console.log("=== MFC RC Screen Parser ===\n");

  // Ensure output directory exists
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  const allDialogs: Dialog[] = [];

  for (const source of SOURCES) {
    console.log(`Parsing resource.h: ${source.resourceHPath}`);
    const idMap = parseResourceH(source.resourceHPath);
    console.log(`  Found ${idMap.size} ID definitions`);

    console.log(`Parsing .rc file: ${source.rcPath}`);
    const dialogs = parseRcFile(source, idMap);
    console.log(`  Found ${dialogs.length} dialogs`);

    // Resolve numeric IDs for controls too (for reference)
    for (const dlg of dialogs) {
      if (dlg.numericId === null) {
        // Try to find in the map
        const val = idMap.get(dlg.id);
        if (val !== undefined) dlg.numericId = val;
      }
    }

    allDialogs.push(...dialogs);
  }

  console.log(`\nTotal dialogs found: ${allDialogs.length}`);

  // Check for duplicate dialog IDs between files (same ID in both .rc files)
  const seenIds = new Map<string, Dialog>();
  const deduped: Dialog[] = [];
  for (const d of allDialogs) {
    const key = d.prefix + d.id;
    if (!seenIds.has(key)) {
      seenIds.set(key, d);
      deduped.push(d);
    } else {
      console.log(`  Warning: Duplicate dialog ${d.id} in ${d.sourceFile} (already from ${seenIds.get(key)!.sourceFile}), keeping both with prefix`);
      deduped.push(d);
    }
  }

  // Generate per-dialog markdown files
  let generated = 0;
  for (const dialog of allDialogs) {
    const fileName = dialogIdToFileName(dialog.id, dialog.prefix);
    const filePath = path.join(OUTPUT_DIR, fileName);
    const content = generateDialogMarkdown(dialog);
    fs.writeFileSync(filePath, content, "utf-8");
    generated++;
  }

  // Generate index file
  const indexPath = path.join(OUTPUT_DIR, "_index.md");
  const indexContent = generateIndexMarkdown(allDialogs);
  fs.writeFileSync(indexPath, indexContent, "utf-8");
  generated++;

  console.log(`\nGenerated ${generated} files in:\n  ${OUTPUT_DIR}`);
  console.log(`\nBreakdown:`);

  const mainCount = allDialogs.filter(
    (d) => d.sourceFile === "Restaurant.rc"
  ).length;
  const setCount = allDialogs.filter(
    (d) => d.sourceFile === "RestaurantSet.rc"
  ).length;
  console.log(`  Restaurant.rc dialogs:    ${mainCount}`);
  console.log(`  RestaurantSet.rc dialogs: ${setCount}`);
  console.log(`  _index.md:                1`);
  console.log(`  Total files:              ${generated}`);

  // Print summary table
  console.log(`\n--- Dialog Summary ---`);
  for (const d of allDialogs) {
    const total = d.controls.length;
    const btns = d.controls.filter((c) => c.category === "button").length;
    console.log(
      `  ${(d.prefix + d.id).padEnd(40)} ${d.sourceFile.padEnd(22)} controls=${total} buttons=${btns}`
    );
  }
}

main();
