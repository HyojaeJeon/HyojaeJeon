/**
 * 한국어: EdgePos 단말 인증 REST 컨트롤러.
 *
 *   Edge POS C++ 클라이언트가 호출하는 REST 엔드포인트. 설계 기준상 REST 는
 *   CentralApi 에서만 예외적으로 허용되며, GraphQL-first 원칙의 예외 항목이다.
 *
 *   응답 contract:
 *     - 성공: `{ success: { code: 'OK', message, requestId, data: PosLoginResponseData }, error: null }`
 *     - 실패: DomainError → DomainExceptionFilter 가 자동으로
 *             `{ success: null, error: { code, message, requestId, details } }` 변환
 *
 *   POST /api/v1/pos/auth/login
 *     요청 body: PosLoginRequestDto (class-validator 검증)
 *     응답: 표준 REST response wrapper (위 contract 참조)
 *
 *   기존 ad-hoc `{ ok, data }` / `{ ok: false, error }` 형식은 제거되었다.
 *   기존 응답에 들어있던 hardcoded `role / storeCode / storeName / posNo / adjustNo` 도
 *   제거되었다 — 단말기 등록 정보는 클라이언트가 자체 보유하며, 권한은 별도 RBAC 호출로 평가한다.
 *
 * Tiếng Việt: Controller REST đăng nhập thiết bị EdgePos — sử dụng response wrapper chuẩn.
 */
import { Body, Controller, HttpCode, HttpStatus, Post, Req } from '@nestjs/common';
import type { FastifyRequest } from 'fastify';
import { AuthService } from '@platform/superadmin/auth/Auth.service';
import { buildRestSuccess, RestSuccessResponse } from '@core/response/restResponse';
import { PosLoginRequestDto, PosLoginResponseData } from './dto/PosLogin.dto';

@Controller('pos/auth')
export class EdgePosAuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * 한국어: EdgePos 단말 로그인. 인증 실패 시 AuthService 가 DomainError 를 던지면
   *   DomainExceptionFilter 가 표준 error wrapper 으로 변환하므로 try/catch 가 필요 없다.
   */
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() body: PosLoginRequestDto,
    @Req() req: FastifyRequest,
  ): Promise<RestSuccessResponse<PosLoginResponseData>> {
    const result = await this.authService.login(body.loginId, body.password);

    const data: PosLoginResponseData = {
      accessToken: result.accessToken,
      expiresIn: result.expiresIn,
      account: {
        id: result.user.id,
        loginId: result.user.loginId,
        displayName: result.user.displayName,
        userType: result.user.userType,
      },
    };

    return buildRestSuccess(req, data);
  }
}
