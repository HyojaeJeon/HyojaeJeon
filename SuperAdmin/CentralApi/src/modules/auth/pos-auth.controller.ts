/**
 * POS 인증 REST 컨트롤러
 *
 * Edge POS C++에서 호출하는 REST 엔드포인트.
 * 설계 기준: "REST는 SuperAdmin/CentralApi에서만 Fastify로 구현한다"
 *
 * POST /api/v1/pos/auth/login
 *   요청: { loginId, password }
 *   응답: { ok, data: { accessToken, employeeId, employeeName, role, storeCode, storeName, posNo, adjustNo } }
 *
 * C++ CentralApiClient가 이 엔드포인트를 호출한다.
 */
import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { IsNotEmpty, IsString } from 'class-validator';
import { AuthService } from './auth.service';

class PosLoginBody {
  @IsString()
  @IsNotEmpty()
  loginId!: string;

  @IsString()
  @IsNotEmpty()
  password!: string;
}

@Controller('pos/auth')
export class PosAuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() body: PosLoginBody) {
    try {
      const result = await this.authService.login(body.loginId, body.password);

      return {
        ok: true,
        data: {
          accessToken: result.accessToken,
          employeeId: result.user.loginId,
          employeeName: result.user.displayName,
          role: result.user.roleCode,
          storeCode: '09270',
          storeName: result.user.displayName + ' 매장',
          posNo: 'POS-001',
          adjustNo: '001',
        },
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : '인증 실패';
      return {
        ok: false,
        error: { message },
      };
    }
  }
}
