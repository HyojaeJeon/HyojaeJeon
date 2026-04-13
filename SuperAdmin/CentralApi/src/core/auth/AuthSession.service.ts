/**
 * 한국어:
 *   AuthSessionService — JWT payload 검증 + rotating refresh session 관리.
 *
 *   역할:
 *   - access token 의 sessionId 를 서버 권위로 검증
 *   - refresh session 발급 / 회전(rotation) / 폐기(revoke) / 전체 폐기(revoke-all)
 *   - tenantContext 재계산
 *
 *   초보자를 위한 배경 설명:
 *   Access Token 은 짧은 수명(예: 24시간)을 가지고, Refresh Token 은 긴 수명(예: 30일)을 가집니다.
 *   Access Token 이 만료되면, 클라이언트가 Refresh Token 을 보내서 새 Access Token 을 받습니다.
 *   이때 Refresh Token 도 함께 새로 발급하는 것을 "토큰 회전(rotation)"이라고 합니다.
 *   회전을 하면 이전 토큰은 못 쓰게 되어 보안이 강화됩니다.
 *
 * Tiếng Việt:
 *   AuthSessionService — Xác thực JWT payload + quản lý session refresh quay vòng.
 *
 *   Vai trò:
 *   - Xác thực sessionId trong access token theo quyền hạn server
 *   - Phát hành / quay vòng (rotation) / thu hồi (revoke) / thu hồi tất cả refresh session
 *   - Tính toán lại tenantContext
 *
 *   Giải thích cho người mới:
 *   Access Token có thời gian sống ngắn (vd: 24 giờ), Refresh Token có thời gian sống dài (vd: 30 ngày).
 *   Khi Access Token hết hạn, client gửi Refresh Token để nhận Access Token mới.
 *   Khi đó Refresh Token cũng được phát hành mới — gọi là "token rotation".
 *   Sau khi quay vòng, token cũ không dùng được nữa → tăng cường bảo mật.
 */
import { createHmac, randomBytes, randomUUID, timingSafeEqual } from 'node:crypto';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '@core/prisma/Prisma.service';
import { TenantContextService } from '@core/tenancy/TenantContext.service';
import { AuthUserType, isAuthUserType } from '@core/auth/constants/UserTypes.constant';
import { JwtPayload } from './decorators/CurrentUser.decorator';
import { DomainError } from '@core/errors/DomainError';
import { decryptCredentials, encryptCredentials } from '@core/crypto/credentialCipher';
import { isAccountActive } from './accountStatus';

interface SessionMetadata {
  ipAddress?: string | null;
  userAgent?: string | null;
}

interface ParsedRefreshToken {
  sessionId: string;
  secret: string;
}

interface RefreshSessionRecord {
  id: string;
  userType: string;
  userId: string;
  currentTokenHash: string;
  currentTokenCiphertext: string;
  previousTokenHash: string | null;
  previousTokenGraceUntil: Date | null;
  absoluteExpiresAt: Date;
  idleExpiresAt: Date;
  lastUsedAt: Date;
  ipAddress: string | null;
  userAgent: string | null;
  revokedAt: Date | null;
  revokeReason: string | null;
}

interface IssuedRefreshSession {
  refreshToken: string;
  sessionId: string;
  sessionExpiresAt: Date;
}

interface RotatedRefreshSession extends IssuedRefreshSession {
  userType: AuthUserType;
  userId: string;
}

@Injectable()
export class AuthSessionService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tenantContext: TenantContextService,
    private readonly configService: ConfigService,
  ) {}

  async resolveJwtPayload(payload: JwtPayload): Promise<JwtPayload> {
    if (!isAuthUserType(payload.userType)) {
      throw new DomainError({ code: 'VALIDATION_ERROR', details: { reason: 'Invalid token user type' } });
    }

    if (payload.sessionId) {
      await this.assertSessionActive(payload.sessionId, payload.userType, payload.sub);
    }

    const active = await this.isAccountActive(payload.userType, payload.sub);
    if (!active) {
      throw new DomainError({ code: 'ACCOUNT_INACTIVE' });
    }

    const tenantContext = await this.tenantContext.resolve(payload.userType, payload.sub);
    return { ...payload, tenantContext };
  }

  /**
   * 새로운 refresh session 을 발급합니다 (로그인 성공 시 호출).
   * Phát hành refresh session mới (được gọi khi đăng nhập thành công).
   *
   * 흐름 / Luồng:
   * 1. 고유 세션 ID 생성 / Tạo session ID duy nhất
   * 2. refresh token 생성 (세션ID.랜덤비밀값) / Tạo refresh token (sessionID.randomSecret)
   * 3. 해시된 토큰 + 암호화된 토큰을 DB 에 저장 / Lưu token đã hash + mã hóa vào DB
   * 4. 만료 시간 설정 (절대 만료 + 유휴 만료) / Thiết lập thời gian hết hạn (tuyệt đối + nhàn rỗi)
   */
  async issueRefreshSession(
    userType: AuthUserType,
    userId: string,
    metadata: SessionMetadata,
  ): Promise<IssuedRefreshSession> {
    const sessionId = randomUUID(); // 고유 세션 식별자 / Định danh phiên duy nhất
    const refreshToken = this.buildRefreshToken(sessionId); // "세션ID.랜덤값" 형태 / dạng "sessionID.random"
    const now = new Date();
    const record = await this.prisma.authRefreshSession.create({
      data: {
        id: sessionId,
        userType,
        userId,
        currentTokenHash: this.hashRefreshToken(refreshToken),
        currentTokenCiphertext: encryptCredentials({ refreshToken }),
        previousTokenHash: null,
        previousTokenGraceUntil: null,
        absoluteExpiresAt: this.plusSeconds(now, this.absoluteTtlSeconds()),
        idleExpiresAt: this.plusSeconds(now, this.idleTtlSeconds()),
        lastUsedAt: now,
        ipAddress: metadata.ipAddress ?? null,
        userAgent: metadata.userAgent ?? null,
      },
      select: { absoluteExpiresAt: true },
    });

    return {
      refreshToken,
      sessionId,
      sessionExpiresAt: record.absoluteExpiresAt,
    };
  }

  /**
   * Refresh Token 회전(rotation): 기존 토큰을 새 토큰으로 교체합니다.
   * Quay vòng Refresh Token: thay token cũ bằng token mới.
   *
   * 왜 회전하나요? / Tại sao quay vòng?
   * → 같은 토큰을 계속 쓰면 탈취 시 위험합니다.
   *   매번 새 토큰을 발급하면, 이전 토큰은 무효가 되어 피해를 줄입니다.
   * → Nếu dùng cùng token mãi, khi bị đánh cắp sẽ nguy hiểm.
   *   Phát hành token mới mỗi lần, token cũ bị vô hiệu → giảm thiệt hại.
   *
   * Grace Period(유예 기간) / Thời gian ân hạn:
   * → 네트워크 지연으로 클라이언트가 이전 토큰을 다시 보낼 수 있습니다.
   *   짧은 유예 기간(기본 30초) 동안은 이전 토큰도 허용합니다.
   * → Do độ trễ mạng, client có thể gửi lại token cũ.
   *   Trong thời gian ân hạn ngắn (mặc định 30 giây), token cũ vẫn được chấp nhận.
   *
   * 토큰 재사용 감지 / Phát hiện tái sử dụng token:
   * → 유예 기간이 지난 후 이전 토큰이 사용되면 탈취로 간주하고 세션을 강제 폐기합니다.
   * → Nếu token cũ được dùng sau thời gian ân hạn, coi như bị đánh cắp → thu hồi phiên.
   */
  async rotateRefreshSession(
    rawRefreshToken: string,
    metadata: SessionMetadata,
  ): Promise<RotatedRefreshSession> {
    const { sessionId } = this.parseRefreshToken(rawRefreshToken);
    const session = await this.findSessionOrThrow(sessionId);
    this.assertSessionWindow(session); // 세션이 만료/폐기되지 않았는지 확인 / Kiểm tra phiên chưa hết hạn/thu hồi

    const presentedHash = this.hashRefreshToken(rawRefreshToken);
    const now = new Date();

    // Case 1: 현재 유효한 토큰과 일치 → 정상 회전 / Token khớp với token hiện tại → quay vòng bình thường
    if (this.matchesHash(session.currentTokenHash, presentedHash)) {
      const nextRefreshToken = this.buildRefreshToken(session.id);
      const nextHash = this.hashRefreshToken(nextRefreshToken);
      // 유예 기간: 이전 토큰도 잠시 허용 (네트워크 지연 대비)
      // Thời gian ân hạn: token cũ vẫn được chấp nhận tạm thời (phòng độ trễ mạng)
      const graceUntil = this.plusSeconds(now, this.rotationGraceSeconds());

      const updated = await this.prisma.authRefreshSession.update({
        where: { id: session.id },
        data: {
          previousTokenHash: session.currentTokenHash,
          previousTokenGraceUntil: graceUntil,
          currentTokenHash: nextHash,
          currentTokenCiphertext: encryptCredentials({ refreshToken: nextRefreshToken }),
          idleExpiresAt: this.plusSeconds(now, this.idleTtlSeconds()),
          lastUsedAt: now,
          ipAddress: metadata.ipAddress ?? null,
          userAgent: metadata.userAgent ?? null,
        },
        select: {
          userType: true,
          userId: true,
          absoluteExpiresAt: true,
        },
      });

      return {
        refreshToken: nextRefreshToken,
        sessionId: session.id,
        sessionExpiresAt: updated.absoluteExpiresAt,
        userType: this.assertAuthUserType(updated.userType),
        userId: updated.userId,
      };
    }

    // Case 2: 이전 토큰과 일치 + 유예 기간 내 → 현재 토큰을 다시 돌려줍니다 (네트워크 재시도 허용)
    // Case 2: Khớp token cũ + trong thời gian ân hạn → trả lại token hiện tại (cho phép retry mạng)
    if (
      session.previousTokenHash &&
      this.matchesHash(session.previousTokenHash, presentedHash) &&
      session.previousTokenGraceUntil &&
      session.previousTokenGraceUntil.getTime() > now.getTime()
    ) {
      const current = this.readCurrentRefreshToken(session.currentTokenCiphertext);
      return {
        refreshToken: current,
        sessionId: session.id,
        sessionExpiresAt: session.absoluteExpiresAt,
        userType: this.assertAuthUserType(session.userType),
        userId: session.userId,
      };
    }

    // Case 3: 어떤 토큰과도 일치하지 않음 → 토큰 재사용(탈취) 감지 → 세션 즉시 폐기
    // Case 3: Không khớp bất kỳ token nào → phát hiện tái sử dụng (đánh cắp) → thu hồi phiên ngay
    await this.prisma.authRefreshSession.update({
      where: { id: session.id },
      data: {
        revokedAt: now,
        revokeReason: 'REFRESH_TOKEN_REUSED',
      },
    });
    throw new DomainError({ code: 'REFRESH_SESSION_REUSED' });
  }

  /**
   * 단일 refresh session 을 폐기합니다 (로그아웃 시 호출).
   * Thu hồi một refresh session (được gọi khi đăng xuất).
   *
   * 실제로 DB 레코드를 삭제하지 않고 revokedAt 타임스탬프를 기록합니다.
   * → 나중에 감사(audit) 추적이 가능하도록 하기 위함입니다.
   *
   * Không xóa bản ghi DB mà ghi timestamp revokedAt.
   * → Để có thể theo dõi kiểm toán (audit) sau này.
   */
  async revokeRefreshSession(rawRefreshToken: string | null, reason: string): Promise<void> {
    if (!rawRefreshToken) return; // 토큰이 없으면 아무것도 하지 않음 / Không có token thì không làm gì
    const parsed = this.tryParseRefreshToken(rawRefreshToken);
    if (!parsed) return; // 파싱 실패 시 무시 / Bỏ qua nếu parse thất bại

    await this.prisma.authRefreshSession.updateMany({
      where: {
        id: parsed.sessionId,
        revokedAt: null,
      },
      data: {
        revokedAt: new Date(),
        revokeReason: reason,
      },
    });
  }

  /**
   * 특정 사용자의 모든 활성 세션을 폐기합니다 (비밀번호 변경, 보안 사고 시 사용).
   * keepSessionId 를 지정하면 해당 세션만 유지하고 나머지를 폐기합니다.
   *
   * Thu hồi tất cả phiên hoạt động của một người dùng (dùng khi đổi mật khẩu, sự cố bảo mật).
   * Nếu chỉ định keepSessionId, chỉ giữ phiên đó và thu hồi phần còn lại.
   */
  async revokeAllUserSessions(
    userType: AuthUserType,
    userId: string,
    reason: string,
    keepSessionId?: string,
  ): Promise<void> {
    await this.prisma.authRefreshSession.updateMany({
      where: {
        userType,
        userId,
        revokedAt: null,
        ...(keepSessionId ? { NOT: { id: keepSessionId } } : {}),
      },
      data: {
        revokedAt: new Date(),
        revokeReason: reason,
      },
    });
  }

  /** 세션이 유효한지 검증: 존재 여부 + 소유자 일치 + 폐기/만료 확인
   *  Xác minh phiên hợp lệ: tồn tại + chủ sở hữu khớp + kiểm tra thu hồi/hết hạn */
  private async assertSessionActive(
    sessionId: string,
    userType: AuthUserType,
    userId: string,
  ): Promise<void> {
    const session = await this.prisma.authRefreshSession.findUnique({
      where: { id: sessionId },
      select: {
        id: true,
        userType: true,
        userId: true,
        absoluteExpiresAt: true,
        idleExpiresAt: true,
        revokedAt: true,
      },
    });

    if (!session) {
      throw new DomainError({ code: 'INVALID_REFRESH_SESSION' });
    }
    if (session.userType !== userType || session.userId !== userId) {
      throw new DomainError({ code: 'INVALID_REFRESH_SESSION' });
    }
    if (session.revokedAt) {
      throw new DomainError({ code: 'SESSION_REVOKED' });
    }
    const now = Date.now();
    if (session.absoluteExpiresAt.getTime() <= now || session.idleExpiresAt.getTime() <= now) {
      throw new DomainError({ code: 'REFRESH_SESSION_EXPIRED' });
    }
  }

  /** 사용자 계정이 활성(ACTIVE) 상태인지 DB 에서 확인합니다.
   *  공용 함수 isAccountActive() 에 위임합니다.
   *
   *  Kiểm tra tài khoản có trạng thái ACTIVE trong DB.
   *  Ủy quyền cho hàm dùng chung isAccountActive(). */
  private isAccountActive(userType: AuthUserType, id: string): Promise<boolean> {
    return isAccountActive(this.prisma, userType, id);
  }

  /** DB 에서 세션을 찾고, 없으면 에러를 던집니다 / Tìm phiên trong DB, ném lỗi nếu không tìm thấy */
  private async findSessionOrThrow(sessionId: string): Promise<RefreshSessionRecord> {
    const session = await this.prisma.authRefreshSession.findUnique({
      where: { id: sessionId },
    });
    if (!session) {
      throw new DomainError({ code: 'INVALID_REFRESH_SESSION' });
    }
    return session;
  }

  /** 세션의 시간 윈도우(절대 만료 + 유휴 만료)와 폐기 여부를 검사합니다
   *  Kiểm tra cửa sổ thời gian phiên (hết hạn tuyệt đối + nhàn rỗi) và trạng thái thu hồi */
  private assertSessionWindow(session: RefreshSessionRecord): void {
    if (session.revokedAt) {
      throw new DomainError({ code: 'SESSION_REVOKED' });
    }
    const now = Date.now();
    if (session.absoluteExpiresAt.getTime() <= now || session.idleExpiresAt.getTime() <= now) {
      throw new DomainError({ code: 'REFRESH_SESSION_EXPIRED' });
    }
  }

  /** 암호화된 현재 refresh token 을 복호화합니다 / Giải mã refresh token hiện tại đã mã hóa */
  private readCurrentRefreshToken(ciphertext: string): string {
    const decoded = decryptCredentials(ciphertext) as { refreshToken?: unknown };
    if (typeof decoded.refreshToken !== 'string' || decoded.refreshToken.length === 0) {
      throw new DomainError({ code: 'INVALID_REFRESH_SESSION' });
    }
    return decoded.refreshToken;
  }

  /** "세션ID.랜덤32바이트" 형태의 refresh token 을 생성합니다
   *  Tạo refresh token dạng "sessionID.random32bytes" */
  private buildRefreshToken(sessionId: string): string {
    return `${sessionId}.${randomBytes(32).toString('base64url')}`;
  }

  /** parseRefreshToken 의 안전한 버전: 실패 시 에러 대신 null 반환
   *  Phiên bản an toàn của parseRefreshToken: trả về null thay vì ném lỗi */
  private tryParseRefreshToken(raw: string): ParsedRefreshToken | null {
    try {
      return this.parseRefreshToken(raw);
    } catch {
      return null;
    }
  }

  /** refresh token 문자열을 "세션ID"와 "비밀값"으로 분리합니다
   *  Tách chuỗi refresh token thành "sessionID" và "secret" */
  private parseRefreshToken(raw: string): ParsedRefreshToken {
    const [sessionId, secret, ...rest] = raw.split('.');
    if (!sessionId || !secret || rest.length > 0) {
      throw new DomainError({ code: 'INVALID_REFRESH_SESSION' });
    }
    return { sessionId, secret };
  }

  /** refresh token 을 HMAC-SHA256 으로 해시합니다. DB 에는 해시값만 저장하여 원본 노출을 방지합니다.
   *  Hash refresh token bằng HMAC-SHA256. Chỉ lưu hash trong DB để tránh lộ token gốc. */
  private hashRefreshToken(raw: string): string {
    return createHmac('sha256', this.refreshHashSecret()).update(raw).digest('hex');
  }

  /** 두 해시값이 같은지 비교합니다 / So sánh hai giá trị hash có giống nhau không */
  private matchesHash(expected: string, actual: string): boolean {
    const a = Buffer.from(expected, 'utf8');
    const b = Buffer.from(actual, 'utf8');
    if (a.length !== b.length) return false;
    return timingSafeEqual(a, b);
  }

  /** HMAC 해싱에 사용할 비밀 키를 환경 변수에서 읽습니다
   *  Đọc khóa bí mật dùng cho HMAC hashing từ biến môi trường */
  private refreshHashSecret(): string {
    const secret =
      this.configService.get<string>('JWT_REFRESH_SECRET') ||
      this.configService.get<string>('JWT_SECRET');
    if (!secret) {
      throw new Error('JWT_REFRESH_SECRET or JWT_SECRET must be configured');
    }
    return secret;
  }

  /** 유휴 만료 시간(초): 마지막 사용 후 이 시간이 지나면 만료 (기본 14일)
   *  Thời gian hết hạn nhàn rỗi (giây): hết hạn sau khoảng thời gian này kể từ lần dùng cuối (mặc định 14 ngày) */
  private idleTtlSeconds(): number {
    return this.readPositiveInt('REFRESH_SESSION_IDLE_TTL_DAYS', 14) * 24 * 60 * 60;
  }

  /** 절대 만료 시간(초): 세션 생성 후 이 시간이 지나면 무조건 만료 (기본 30일)
   *  Thời gian hết hạn tuyệt đối (giây): hết hạn vô điều kiện sau khoảng thời gian này kể từ khi tạo (mặc định 30 ngày) */
  private absoluteTtlSeconds(): number {
    return this.readPositiveInt('REFRESH_SESSION_ABSOLUTE_TTL_DAYS', 30) * 24 * 60 * 60;
  }

  /** 토큰 회전 유예 시간(초): 이전 토큰이 아직 유효한 기간 (기본 30초)
   *  Thời gian ân hạn quay vòng token (giây): khoảng thời gian token cũ vẫn hợp lệ (mặc định 30 giây) */
  private rotationGraceSeconds(): number {
    return this.readPositiveInt('REFRESH_SESSION_ROTATION_GRACE_SECONDS', 30);
  }

  /** 환경 변수에서 양의 정수를 읽고, 유효하지 않으면 기본값 사용
   *  Đọc số nguyên dương từ biến môi trường, dùng giá trị mặc định nếu không hợp lệ */
  private readPositiveInt(name: string, fallback: number): number {
    const raw = Number(this.configService.get<string>(name) ?? fallback);
    return Number.isFinite(raw) && raw > 0 ? raw : fallback;
  }

  /** 기준 시각에 초를 더한 새 Date 를 반환합니다 / Trả về Date mới = thời điểm gốc + số giây */
  private plusSeconds(base: Date, seconds: number): Date {
    return new Date(base.getTime() + seconds * 1000);
  }

  /** 문자열이 유효한 AuthUserType 인지 확인하고, 아니면 에러를 던집니다
   *  Xác nhận chuỗi là AuthUserType hợp lệ, ném lỗi nếu không phải */
  private assertAuthUserType(userType: string): AuthUserType {
    if (!isAuthUserType(userType)) {
      throw new DomainError({ code: 'INVALID_USER_TYPE', params: { userType } });
    }
    return userType;
  }
}
