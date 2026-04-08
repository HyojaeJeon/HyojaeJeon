/**
 * 한국어: @SelfAction() — 로그인된 본인이 자기 자신에게만 수행하는 mutation 마커.
 *   PermissionGuard 가 fail-closed 모드일 때 @RequirePermission 대신 이 데코레이터가 있으면 허용한다.
 *   예) changePassword, updateMyProfile.
 *
 *   주의: 대상 리소스가 "자기 자신" 임을 service 가 검증할 책임이 있다 (user.sub === targetId).
 *   본 decorator 자체는 단지 "RBAC 권한 키를 요구하지 않는다" 는 의미만 갖는다.
 *
 * Tiếng Việt: Marker decorator cho mutation chỉ thao tác trên chính người dùng đăng nhập.
 */
import { SetMetadata } from '@nestjs/common';

export const SELF_ACTION_KEY = 'rbac:selfAction';
export const SelfAction = () => SetMetadata(SELF_ACTION_KEY, true);
