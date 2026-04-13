/**
 * 한국어: EdgePos 단말 로그인 REST DTO.
 *
 *   요청: { loginId, password } — class-validator 로 검증.
 *   응답 데이터: { accessToken, expiresIn, account } — typed 응답.
 *
 *   응답은 표준 REST response wrapper (`{ success: { code, message, requestId, data }, error: null }`) 으로
 *   buildRestSuccess() 를 거쳐 감싼다. 에러는 DomainError 를 던져 DomainExceptionFilter 가
 *   동일 wrapper 의 error 변형으로 자동 변환한다.
 *
 *   기존 응답에 있던 `role / storeCode / storeName / posNo / adjustNo` 필드는 모두 제거되었다.
 *   - role: PermissionService 가 권한 평가의 단일 진실. EdgePos 가 RBAC 에 의존해야 하는 경우
 *           별도 GraphQL `me { permissions }` 호출로 가져온다.
 *   - storeCode/storeName/posNo/adjustNo: EdgePos 단말기가 자기 등록 정보로 이미 알고 있다.
 *           서버 응답에 dummy 값을 박아둘 이유가 없다.
 *
 * Tiếng Việt: DTO REST đăng nhập thiết bị EdgePos — typed yêu cầu / phản hồi.
 */
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

/**
 * 한국어: EdgePos 단말이 보내는 로그인 요청.
 */
export class PosLoginRequestDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  loginId!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  password!: string;
}

/**
 * 한국어: 서버가 응답하는 typed payload (response wrapper 안의 data).
 */
export interface PosLoginResponseData {
  accessToken: string;
  expiresIn: string;
  account: {
    id: string;
    loginId: string;
    displayName: string;
    userType: string;
  };
}
