/**
 * 한국어:
 *   자격 증명 암복호화 모듈 — 비밀번호, API 키 등 민감한 데이터를 DB에 저장하기 전에
 *   암호화하고, 필요할 때 복호화합니다.
 *
 *   사용하는 알고리즘: AES-256-GCM
 *   - AES-256: 256비트(32바이트) 키를 사용하는 대칭 암호화 (같은 키로 암호화/복호화)
 *   - GCM: 암호화된 데이터가 변조되지 않았는지 검증하는 인증 모드
 *     (누군가 암호문을 몰래 바꾸면 복호화 시 오류 발생)
 *
 *   암호화 키는 환경변수 CREDENTIAL_ENCRYPTION_KEY에서 읽습니다.
 *   64자리 16진수 문자열 (= 32바이트)이어야 합니다.
 *
 * Tiếng Việt:
 *   Module mã hóa/giải mã thông tin xác thực — mã hóa dữ liệu nhạy cảm (mật khẩu, API key, v.v.)
 *   trước khi lưu vào DB, và giải mã khi cần sử dụng.
 *
 *   Thuật toán: AES-256-GCM
 *   - AES-256: mã hóa đối xứng dùng khóa 256-bit (32 byte) (cùng khóa để mã hóa/giải mã)
 *   - GCM: chế độ xác thực đảm bảo dữ liệu mã hóa không bị giả mạo
 *     (nếu ai đó sửa bản mã, giải mã sẽ báo lỗi)
 *
 *   Khóa mã hóa được đọc từ biến môi trường CREDENTIAL_ENCRYPTION_KEY.
 *   Phải là chuỗi hex 64 ký tự (= 32 byte).
 */
import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';

const ALGORITHM = 'aes-256-gcm';   // 한국어: 암호화 알고리즘 / Tiếng Việt: Thuật toán mã hóa
const IV_LENGTH = 12;               // 한국어: 초기화 벡터 길이 (12바이트) / Tiếng Việt: Độ dài vector khởi tạo (12 byte)
const AUTH_TAG_LENGTH = 16;         // 한국어: 인증 태그 길이 (16바이트) / Tiếng Việt: Độ dài tag xác thực (16 byte)

/**
 * 한국어: 환경변수에서 암호화 키를 읽어 Buffer로 반환합니다.
 *   키가 없거나 길이가 맞지 않으면 즉시 오류를 발생시켜 서버 부팅을 막습니다.
 *   이렇게 하면 키 설정 누락을 운영 환경에서 바로 발견할 수 있습니다.
 *
 * Tiếng Việt: Đọc khóa mã hóa từ biến môi trường và trả về dạng Buffer.
 *   Nếu không có khóa hoặc độ dài sai, ném lỗi ngay để chặn server khởi động.
 *   Giúp phát hiện ngay khi thiếu cấu hình khóa trong môi trường production.
 */
function getKey(): Buffer {
  const hex = process.env.CREDENTIAL_ENCRYPTION_KEY;
  if (!hex || hex.length !== 64) {
    throw new Error(
      'CREDENTIAL_ENCRYPTION_KEY must be a 64-char hex string (32 bytes). ' +
      'Generate with: node -e "console.log(require(\'crypto\').randomBytes(32).toString(\'hex\'))"',
    );
  }
  return Buffer.from(hex, 'hex');
}

/**
 * 한국어: 평문 객체를 암호화하여 base64 문자열로 반환합니다.
 *   처리 순서:
 *   1. 랜덤 IV(초기화 벡터) 12바이트 생성 — 같은 데이터를 암호화해도 매번 다른 결과가 나오게 함
 *   2. AES-256-GCM으로 JSON 문자열을 암호화
 *   3. 인증 태그(authTag) 추출 — 데이터 변조 여부를 검증하는 16바이트 서명
 *   4. IV + 인증 태그 + 암호문을 하나로 합쳐 base64로 인코딩
 *
 * Tiếng Việt: Mã hóa object plaintext thành chuỗi base64.
 *   Quy trình:
 *   1. Tạo IV (vector khởi tạo) ngẫu nhiên 12 byte — cùng dữ liệu sẽ cho kết quả khác nhau mỗi lần
 *   2. Mã hóa chuỗi JSON bằng AES-256-GCM
 *   3. Lấy authentication tag — chữ ký 16 byte để xác minh dữ liệu không bị giả mạo
 *   4. Ghép IV + auth tag + bản mã, rồi encode thành base64
 */
export function encryptCredentials(plain: Record<string, unknown>): string {
  const key = getKey();
  const iv = randomBytes(IV_LENGTH);                // 1. 랜덤 IV 생성 / Tạo IV ngẫu nhiên
  const cipher = createCipheriv(ALGORITHM, key, iv, { authTagLength: AUTH_TAG_LENGTH });

  const plainText = JSON.stringify(plain);           // 객체를 JSON 문자열로 변환 / Chuyển object thành chuỗi JSON
  const encrypted = Buffer.concat([cipher.update(plainText, 'utf8'), cipher.final()]); // 2. 암호화 / Mã hóa
  const authTag = cipher.getAuthTag();               // 3. 인증 태그 추출 / Lấy auth tag

  // 4. IV(12) + authTag(16) + ciphertext 를 합쳐서 base64 인코딩
  // 4. Ghép IV(12) + authTag(16) + ciphertext rồi encode base64
  return Buffer.concat([iv, authTag, encrypted]).toString('base64');
}

/**
 * 한국어: 암호화된 base64 문자열을 복호화하여 원래 객체로 복원합니다.
 *   처리 순서 (암호화의 역순):
 *   1. base64 디코딩
 *   2. 앞부분에서 IV(12바이트)와 인증 태그(16바이트)를 분리
 *   3. 나머지가 실제 암호문
 *   4. 인증 태그를 검증하며 복호화 — 변조되었으면 여기서 오류 발생
 *   5. JSON 파싱하여 원래 객체 반환
 *
 * Tiếng Việt: Giải mã chuỗi base64 đã mã hóa, khôi phục object gốc.
 *   Quy trình (ngược lại mã hóa):
 *   1. Decode base64
 *   2. Tách IV (12 byte) và auth tag (16 byte) từ phần đầu
 *   3. Phần còn lại là bản mã thực
 *   4. Xác minh auth tag và giải mã — nếu bị giả mạo, ném lỗi tại đây
 *   5. Parse JSON để trả về object gốc
 */
export function decryptCredentials(cipherText: string): Record<string, unknown> {
  const key = getKey();
  const buf = Buffer.from(cipherText, 'base64');     // 1. base64 디코딩 / Decode base64

  // 2. IV, 인증 태그, 암호문 분리 / Tách IV, auth tag, bản mã
  const iv = buf.subarray(0, IV_LENGTH);
  const authTag = buf.subarray(IV_LENGTH, IV_LENGTH + AUTH_TAG_LENGTH);
  const encrypted = buf.subarray(IV_LENGTH + AUTH_TAG_LENGTH);

  // 3-4. 인증 태그 설정 후 복호화 / Đặt auth tag rồi giải mã
  const decipher = createDecipheriv(ALGORITHM, key, iv, { authTagLength: AUTH_TAG_LENGTH });
  decipher.setAuthTag(authTag);

  const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);
  return JSON.parse(decrypted.toString('utf8'));      // 5. JSON 파싱 / Parse JSON
}
