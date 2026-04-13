/**
 * [KO] Corporate(식권) 도메인 전용 caller context 어댑터 파일.
 *      이 파일은 "누가 API를 호출했는가"를 표현하는 CallerCtx를 Corporate 도메인에 맞게 감싸는 역할을 합니다.
 *
 *      핵심 개념:
 *        - CallerCtx: 모든 서비스에서 "호출자가 누구인지" 알려주는 공통 타입 (core/tenancy/callerCtx.ts에 정의)
 *        - MealCallerCtx: CallerCtx의 별칭(alias). 기존 코드 호환을 위해 유지합니다.
 *        - assertCorporateScope: 호출자가 해당 corporate(회사)에 접근할 권한이 있는지 검증합니다.
 *        - assertBrandScope: 호출자가 해당 brand(브랜드)에 접근할 권한이 있는지 검증합니다.
 *
 *      P1-4 통합 이후, 새 코드는 core의 CallerCtx를 직접 사용해도 됩니다.
 *      이 파일의 assertCorporateScope / assertBrandScope는 corporate 도메인 고유 정책을 담고 있어 여기 유지됩니다.
 *
 * [VI] File adapter caller context dành riêng cho domain Corporate (phiếu ăn).
 *      File này bọc (wrap) CallerCtx — kiểu dữ liệu chung mô tả "ai đang gọi API" — cho phù hợp với domain Corporate.
 *
 *      Khái niệm chính:
 *        - CallerCtx: Kiểu chung cho tất cả service để biết "ai đang gọi" (định nghĩa tại core/tenancy/callerCtx.ts)
 *        - MealCallerCtx: Bí danh (alias) của CallerCtx. Giữ lại để tương thích ngược với code cũ.
 *        - assertCorporateScope: Kiểm tra người gọi có quyền truy cập corporate (công ty) đó không.
 *        - assertBrandScope: Kiểm tra người gọi có quyền truy cập brand (thương hiệu) đó không.
 *
 *      Sau khi hợp nhất P1-4, code mới có thể dùng trực tiếp CallerCtx từ core.
 *      assertCorporateScope / assertBrandScope giữ lại ở đây vì chứa chính sách riêng của domain corporate.
 */

/**
 * [KO] JwtPayload: JWT 토큰에서 추출한 사용자 정보 (userId, userType, tenantContext 등).
 *      로그인 시 발급된 JWT를 파싱하면 이 타입의 객체가 나옵니다.
 * [VI] JwtPayload: Thông tin người dùng trích xuất từ JWT token (userId, userType, tenantContext, v.v.).
 *      Khi parse JWT được cấp lúc đăng nhập, ta nhận được đối tượng kiểu này.
 */
import { JwtPayload } from '@core/auth/decorators/CurrentUser.decorator';

/**
 * [KO] DomainError: 비즈니스 규칙 위반 시 던지는 표준 오류 클래스.
 *      code와 params만 전달하면, 별도의 필터(DomainExceptionFilter)가 i18n을 통해 사용자용 메시지를 만들어줍니다.
 * [VI] DomainError: Lớp lỗi chuẩn khi vi phạm quy tắc nghiệp vụ.
 *      Chỉ cần truyền code và params, bộ lọc riêng (DomainExceptionFilter) sẽ tạo thông báo cho người dùng qua i18n.
 */
import { DomainError } from '@core/errors/DomainError';

/**
 * [KO] core/tenancy/callerCtx에서 가져오는 공통 모듈들:
 *      - CallerCtx: 호출자 정보를 담는 인터페이스 (userType, userId, distributorId, brandHqId, branchId, corporateId)
 *      - callerCtxFromUser: JwtPayload -> CallerCtx 변환 함수
 *      - withTargetBrand: 특정 brandHqId로 ctx를 복사하여 재구성하는 헬퍼
 *      - withTargetCorporate: 특정 corporateId로 ctx를 복사하여 재구성하는 헬퍼
 * [VI] Các module chung import từ core/tenancy/callerCtx:
 *      - CallerCtx: Interface chứa thông tin người gọi (userType, userId, distributorId, brandHqId, branchId, corporateId)
 *      - callerCtxFromUser: Hàm chuyển đổi JwtPayload -> CallerCtx
 *      - withTargetBrand: Helper tạo bản sao ctx với brandHqId mới
 *      - withTargetCorporate: Helper tạo bản sao ctx với corporateId mới
 */
import {
  CallerCtx,
  callerCtxFromUser,
  withTargetBrand as coreWithTargetBrand,
  withTargetCorporate as coreWithTargetCorporate,
} from '@core/tenancy/callerCtx';

/**
 * [KO] MealCallerCtx: CallerCtx의 타입 별칭(alias).
 *      기존 corporate 도메인 코드에서 MealCallerCtx라는 이름을 사용하고 있었으므로,
 *      하위 호환성(backward compatibility)을 위해 이름만 유지합니다.
 *      실제로는 CallerCtx와 완전히 동일한 타입입니다.
 * [VI] MealCallerCtx: Bí danh kiểu (type alias) của CallerCtx.
 *      Code cũ trong domain corporate đã dùng tên MealCallerCtx,
 *      nên giữ lại tên này để tương thích ngược (backward compatibility).
 *      Thực tế nó hoàn toàn giống CallerCtx.
 */
// P1-4: 기존 이름 유지 — 타입 별칭만.
export type MealCallerCtx = CallerCtx;

/**
 * [KO] mealCtxFromUser: JwtPayload에서 MealCallerCtx(= CallerCtx)를 생성하는 팩토리 함수.
 *      resolver에서 @CurrentUser()로 받은 user 객체를 이 함수에 넘기면,
 *      서비스 레이어에서 사용할 caller context가 만들어집니다.
 *      내부적으로 core의 callerCtxFromUser()를 그대로 호출합니다.
 * [VI] mealCtxFromUser: Hàm factory tạo MealCallerCtx (= CallerCtx) từ JwtPayload.
 *      Khi resolver truyền đối tượng user nhận được qua @CurrentUser() vào hàm này,
 *      nó sẽ tạo ra caller context để dùng ở tầng service.
 *      Bên trong gọi trực tiếp callerCtxFromUser() từ core.
 *
 * @param user - [KO] JWT에서 파싱된 사용자 정보 / [VI] Thông tin người dùng parse từ JWT
 * @returns    - [KO] 호출자 컨텍스트 객체 / [VI] Đối tượng context của người gọi
 */
export function mealCtxFromUser(user: JwtPayload): MealCallerCtx {
  return callerCtxFromUser(user);
}

/**
 * [KO] assertCorporateScope: 대상 row의 corporateId가 호출자의 corporate 범위와 일치하는지 검증합니다.
 *
 *      동작 방식:
 *        - SUPER_ADMIN: 모든 corporate에 접근 가능 (검증 우회)
 *        - CORPORATE_ADMIN: 자기 corporateId와 대상 corporateId가 같아야 통과
 *        - 그 외 userType: corporate 축 접근 권한이 없으므로 거절
 *
 *      실패 시 DomainError를 던집니다:
 *        - ctx.corporateId가 없으면: CORPORATE_CONTEXT_MISSING (403)
 *        - corporateId가 다르면: CROSS_CORPORATE_ACCESS_DENIED (403)
 *
 * [VI] assertCorporateScope: Kiểm tra corporateId của bản ghi đích có khớp với phạm vi corporate của người gọi không.
 *
 *      Cách hoạt động:
 *        - SUPER_ADMIN: Truy cập được mọi corporate (bỏ qua kiểm tra)
 *        - CORPORATE_ADMIN: corporateId của mình phải trùng với corporateId đích
 *        - Các userType khác: Không có quyền trên trục corporate, bị từ chối
 *
 *      Khi thất bại sẽ ném DomainError:
 *        - Nếu ctx.corporateId không có: CORPORATE_CONTEXT_MISSING (403)
 *        - Nếu corporateId khác nhau: CROSS_CORPORATE_ACCESS_DENIED (403)
 *
 * @param ctx               - [KO] 호출자 컨텍스트 / [VI] Context của người gọi
 * @param targetCorporateId - [KO] 접근하려는 대상의 corporateId / [VI] corporateId của đối tượng muốn truy cập
 * @throws DomainError      - [KO] 권한이 없을 때 / [VI] Khi không có quyền
 */
export function assertCorporateScope(ctx: MealCallerCtx, targetCorporateId: string): void {
  if (ctx.userType === 'SUPER_ADMIN') return;
  if (!ctx.corporateId) {
    throw new DomainError({ code: 'CORPORATE_CONTEXT_MISSING', params: { userType: ctx.userType } });
  }
  if (ctx.corporateId !== targetCorporateId) {
    throw new DomainError({ code: 'CROSS_CORPORATE_ACCESS_DENIED', params: { callerCorporateId: ctx.corporateId,
      targetCorporateId } });
  }
}

/**
 * [KO] assertBrandScope: 대상 row의 brandHqId가 호출자의 brand 범위와 일치하는지 검증합니다.
 *
 *      동작 방식:
 *        - SUPER_ADMIN: 모든 brand에 접근 가능 (검증 우회)
 *        - CORPORATE_ADMIN: brand 축 검증 대상이 아님 (corporate 축만 관리하므로 통과)
 *        - BRAND_ADMIN: 자기 brandHqId와 대상 brandHqId가 같아야 통과
 *        - 그 외 userType: brand 축 접근 권한이 없으므로 거절
 *
 *      실패 시 DomainError를 던집니다:
 *        - ctx.brandHqId가 없으면: BRAND_CONTEXT_MISSING (403)
 *        - brandHqId가 다르면: CROSS_BRAND_ACCESS_DENIED (403)
 *
 * [VI] assertBrandScope: Kiểm tra brandHqId của bản ghi đích có khớp với phạm vi brand của người gọi không.
 *
 *      Cách hoạt động:
 *        - SUPER_ADMIN: Truy cập được mọi brand (bỏ qua kiểm tra)
 *        - CORPORATE_ADMIN: Không thuộc trục brand nên được phép đi qua (chỉ quản lý trục corporate)
 *        - BRAND_ADMIN: brandHqId của mình phải trùng với brandHqId đích
 *        - Các userType khác: Không có quyền trên trục brand, bị từ chối
 *
 *      Khi thất bại sẽ ném DomainError:
 *        - Nếu ctx.brandHqId không có: BRAND_CONTEXT_MISSING (403)
 *        - Nếu brandHqId khác nhau: CROSS_BRAND_ACCESS_DENIED (403)
 *
 * @param ctx            - [KO] 호출자 컨텍스트 / [VI] Context của người gọi
 * @param targetBrandHqId - [KO] 접근하려는 대상의 brandHqId / [VI] brandHqId của đối tượng muốn truy cập
 * @throws DomainError   - [KO] 권한이 없을 때 / [VI] Khi không có quyền
 */
export function assertBrandScope(ctx: MealCallerCtx, targetBrandHqId: string): void {
  if (ctx.userType === 'SUPER_ADMIN') return;
  if (ctx.userType === 'CORPORATE_ADMIN') return;
  if (!ctx.brandHqId) {
    throw new DomainError({ code: 'BRAND_CONTEXT_MISSING', params: { userType: ctx.userType } });
  }
  if (ctx.brandHqId !== targetBrandHqId) {
    throw new DomainError({ code: 'CROSS_BRAND_ACCESS_DENIED', params: { callerBrandHqId: ctx.brandHqId,
      targetBrandHqId } });
  }
}

/**
 * [KO] withTargetBrand: core의 withTargetBrand를 재내보내기(re-export)합니다.
 *      기존 corporate 도메인 코드에서 이 파일을 통해 import하던 것을 유지하기 위한 하위 호환 re-export입니다.
 *      기능: 기존 ctx를 복사한 뒤, brandHqId만 지정된 값으로 교체한 새 CallerCtx를 반환합니다.
 * [VI] withTargetBrand: Re-export withTargetBrand từ core.
 *      Giữ lại để tương thích ngược với code cũ import qua file này.
 *      Chức năng: Sao chép ctx hiện tại và thay thế brandHqId bằng giá trị mới, trả về CallerCtx mới.
 */
// P1-4: core 의 with* 헬퍼를 재export (backward compat).
export const withTargetBrand = coreWithTargetBrand;

/**
 * [KO] withTargetCorporate: core의 withTargetCorporate를 재내보내기(re-export)합니다.
 *      기존 corporate 도메인 코드에서 이 파일을 통해 import하던 것을 유지하기 위한 하위 호환 re-export입니다.
 *      기능: 기존 ctx를 복사한 뒤, corporateId만 지정된 값으로 교체한 새 CallerCtx를 반환합니다.
 * [VI] withTargetCorporate: Re-export withTargetCorporate từ core.
 *      Giữ lại để tương thích ngược với code cũ import qua file này.
 *      Chức năng: Sao chép ctx hiện tại và thay thế corporateId bằng giá trị mới, trả về CallerCtx mới.
 */
export const withTargetCorporate = coreWithTargetCorporate;
