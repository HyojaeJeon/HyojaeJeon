/**
 * 한국어: SuperAdmin 인증 서비스.
 *   사용자 자격 증명 검증, JWT 토큰 발급, 사용자 CRUD, 비밀번호 변경 등
 *   SuperAdmin 플랫폼의 핵심 인증 로직을 담당한다.
 *   Prisma ORM을 통해 PostgreSQL의 SuperAdminUser 테이블에 접근한다.
 *
 * Tiếng Việt: Service xác thực SuperAdmin.
 *   Chịu trách nhiệm cho các logic xác thực cốt lõi của nền tảng SuperAdmin
 *   bao gồm xác minh thông tin đăng nhập, phát hành JWT token, CRUD người dùng,
 *   và thay đổi mật khẩu. Truy cập bảng SuperAdminUser trong PostgreSQL thông qua Prisma ORM.
 */
import { HttpException, HttpStatus, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../prisma/prisma.service';
import { RedisService } from '../../common/redis/redis.service';
import { JwtPayload } from '../../common/decorators/current-user.decorator';
import { CreateSuperAdminUserInput } from './dto/create-user.input';
import { UpdateSuperAdminUserInput } from './dto/update-user.input';

@Injectable()
export class AuthService {
  // 한국어: 로그인 시도 횟수 제한 (15분 내 최대 10회)
  // Tiếng Việt: Giới hạn số lần đăng nhập (tối đa 10 lần trong 15 phút)
  private readonly loginAttemptLimit = 10;
  private readonly loginAttemptWindowSeconds = 15 * 60;

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly redis: RedisService,
  ) {}

  /**
   * 한국어: 로그인 ID와 비밀번호로 사용자를 검증한다.
   *   1) loginId + 소프트삭제 미적용 조건으로 사용자를 조회한다.
   *   2) 사용자가 없거나 상태가 Active가 아니면 UnauthorizedException을 던진다.
   *   3) bcrypt로 비밀번호를 비교하고, 불일치 시 UnauthorizedException을 던진다.
   *   4) 검증 성공 시 lastLoginAt을 현재 시각으로 갱신하고 사용자 객체를 반환한다.
   *
   * Tiếng Việt: Xác minh người dùng bằng ID đăng nhập và mật khẩu.
   *   1) Truy vấn người dùng theo loginId và điều kiện chưa bị xóa mềm.
   *   2) Ném UnauthorizedException nếu không tìm thấy hoặc trạng thái không phải Active.
   *   3) So sánh mật khẩu bằng bcrypt, ném UnauthorizedException nếu không khớp.
   *   4) Khi xác minh thành công, cập nhật lastLoginAt và trả về đối tượng người dùng.
   */
  async validateUser(loginId: string, password: string) {
    const user = await this.prisma.superAdminUser.findFirst({
      where: { loginId, deletedAt: null },
    });

    // 한국어: 사용자 미존재 또는 비활성 상태인 경우 접근 거부
    // Tiếng Việt: Từ chối truy cập nếu không tìm thấy người dùng hoặc tài khoản bị vô hiệu
    if (!user || user.status !== 'Active') {
      throw new UnauthorizedException('Invalid credentials or account disabled');
    }

    // 한국어: bcrypt를 사용하여 입력된 비밀번호와 저장된 해시를 비교
    // Tiếng Việt: So sánh mật khẩu đầu vào với hash đã lưu bằng bcrypt
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // 한국어: 마지막 로그인 시각을 현재 시각으로 업데이트
    // Tiếng Việt: Cập nhật thời gian đăng nhập cuối cùng thành thời gian hiện tại
    await this.prisma.superAdminUser.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    return user;
  }

  /**
   * 한국어: 사용자 정보를 기반으로 JWT 액세스 토큰을 생성한다.
   *   JWT 페이로드에는 사용자 ID(sub), loginId, roleCode, userType이 포함된다.
   *   토큰 만료 시간은 환경 변수 JWT_EXPIRES_IN에서 가져오며, 기본값은 '1d'이다.
   *
   * Tiếng Việt: Tạo JWT access token dựa trên thông tin người dùng.
   *   JWT payload bao gồm user ID (sub), loginId, roleCode, userType.
   *   Thời gian hết hạn token được lấy từ biến môi trường JWT_EXPIRES_IN, mặc định là '1d'.
   */
  generateToken(user: { id: string; loginId: string; roleCode: string }) {
    const payload: JwtPayload = {
      sub: user.id,
      loginId: user.loginId,
      roleCode: user.roleCode,
      userType: 'SuperAdmin',
    };

    const expiresIn = this.configService.get<string>('JWT_EXPIRES_IN', '1d');
    const accessToken = this.jwtService.sign(payload);

    return { accessToken, expiresIn };
  }

  /**
   * 한국어: 로그인 전체 흐름을 수행한다.
   *   사용자 검증 후 JWT 토큰을 발급하고, accessToken + expiresIn + user를 반환한다.
   *
   * Tiếng Việt: Thực hiện toàn bộ luồng đăng nhập.
   *   Sau khi xác minh người dùng, phát hành JWT token và trả về accessToken + expiresIn + user.
   */
  async login(loginId: string, password: string) {
    // 한국어: Redis에 loginId별 로그인 시도 횟수를 추적하는 키
    // Tiếng Việt: Key theo dõi số lần đăng nhập theo loginId trong Redis
    const rateLimitKey = `auth:login:${loginId}:attempts`;

    try {
      const user = await this.validateUser(loginId, password);
      // 한국어: 로그인 성공 시 실패 카운터 초기화
      // Tiếng Việt: Reset bộ đếm thất bại khi đăng nhập thành công
      await this.redis.del(rateLimitKey);
      const { accessToken, expiresIn } = this.generateToken(user);
      return { accessToken, expiresIn, user };
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        // 한국어: 인증 실패 시 Redis rate limit 카운터를 증가시키고, 한도 초과 시 429 에러 반환
        // Tiếng Việt: Khi xác thực thất bại, tăng bộ đếm rate limit trong Redis, trả lỗi 429 nếu vượt giới hạn
        const rateLimit = await this.redis.consumeRateLimit(
          rateLimitKey,
          this.loginAttemptLimit,
          this.loginAttemptWindowSeconds,
        );

        if (!rateLimit.allowed) {
          throw new HttpException('Too many login attempts. Please try again later.', HttpStatus.TOO_MANY_REQUESTS);
        }
      }
      throw error;
    }
  }

  /**
   * 한국어: ID로 사용자를 조회한다. 소프트삭제된 사용자는 제외한다.
   * Tiếng Việt: Truy vấn người dùng theo ID. Loại trừ người dùng đã bị xóa mềm.
   */
  async findById(id: string) {
    return this.prisma.superAdminUser.findFirst({
      where: { id, deletedAt: null },
    });
  }

  /**
   * 한국어: 전체 사용자 목록을 페이지네이션으로 조회한다.
   *   생성일 기준 내림차순으로 정렬된다.
   *
   * Tiếng Việt: Truy vấn danh sách tất cả người dùng với phân trang.
   *   Sắp xếp theo ngày tạo giảm dần.
   */
  async findAll(skip: number, take: number) {
    return this.prisma.superAdminUser.findMany({
      skip,
      take,
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * 한국어: 새로운 SuperAdmin 사용자를 생성한다.
   *   비밀번호는 bcrypt salt rounds 12로 해싱하여 저장한다.
   *
   * Tiếng Việt: Tạo người dùng SuperAdmin mới.
   *   Mật khẩu được hash bằng bcrypt với salt rounds 12 trước khi lưu.
   */
  async create(input: CreateSuperAdminUserInput) {
    // 한국어: 비밀번호를 bcrypt로 해싱 (salt rounds: 12)
    // Tiếng Việt: Hash mật khẩu bằng bcrypt (salt rounds: 12)
    const passwordHash = await bcrypt.hash(input.password, 12);
    return this.prisma.superAdminUser.create({
      data: {
        loginId: input.loginId,
        passwordHash,
        displayName: input.displayName,
        email: input.email,
        phone: input.phone,
        roleCode: input.roleCode,
      },
    });
  }

  /**
   * 한국어: 기존 SuperAdmin 사용자의 정보를 부분 업데이트한다.
   *   undefined가 아닌 필드만 실제로 업데이트 대상에 포함된다 (부분 수정 패턴).
   *
   * Tiếng Việt: Cập nhật một phần thông tin người dùng SuperAdmin hiện tại.
   *   Chỉ các trường không phải undefined mới được đưa vào đối tượng cập nhật (pattern cập nhật một phần).
   */
  async update(id: string, input: UpdateSuperAdminUserInput) {
    return this.prisma.superAdminUser.update({
      where: { id },
      data: {
        ...(input.displayName !== undefined && { displayName: input.displayName }),
        ...(input.email !== undefined && { email: input.email }),
        ...(input.phone !== undefined && { phone: input.phone }),
        ...(input.roleCode !== undefined && { roleCode: input.roleCode }),
        ...(input.status !== undefined && { status: input.status }),
      },
    });
  }

  /**
   * 한국어: 사용자를 소프트 삭제한다.
   *   실제 데이터를 삭제하지 않고 deletedAt 필드를 현재 시각으로 설정한다.
   *
   * Tiếng Việt: Xóa mềm người dùng.
   *   Không xóa dữ liệu thực tế mà đặt trường deletedAt thành thời gian hiện tại.
   */
  async softDelete(id: string) {
    await this.prisma.superAdminUser.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
    return true;
  }

  /**
   * 한국어: 비밀번호를 변경한다.
   *   1) 사용자 존재 여부를 확인한다.
   *   2) 현재 비밀번호가 올바른지 bcrypt로 검증한다.
   *   3) 새 비밀번호를 bcrypt로 해싱하여 저장하고, passwordChangedAt을 갱신한다.
   *
   * Tiếng Việt: Thay đổi mật khẩu.
   *   1) Kiểm tra sự tồn tại của người dùng.
   *   2) Xác minh mật khẩu hiện tại bằng bcrypt.
   *   3) Hash mật khẩu mới bằng bcrypt, lưu và cập nhật passwordChangedAt.
   */
  async changePassword(userId: string, currentPassword: string, newPassword: string) {
    const user = await this.prisma.superAdminUser.findFirst({
      where: { id: userId, deletedAt: null },
    });
    if (!user) throw new UnauthorizedException('User not found');

    // 한국어: 현재 비밀번호 일치 여부 확인
    // Tiếng Việt: Kiểm tra mật khẩu hiện tại có khớp không
    const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isMatch) throw new UnauthorizedException('Current password is incorrect');

    // 한국어: 새 비밀번호를 해싱하고 변경 시각을 기록
    // Tiếng Việt: Hash mật khẩu mới và ghi lại thời gian thay đổi
    const passwordHash = await bcrypt.hash(newPassword, 12);
    await this.prisma.superAdminUser.update({
      where: { id: userId },
      data: { passwordHash, passwordChangedAt: new Date() },
    });
    return true;
  }
}
