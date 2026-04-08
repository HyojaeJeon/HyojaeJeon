import type { JwtPayload } from '@core/auth/decorators/current-user.decorator';

export interface RealtimeTenantScope {
  distributorId?: string | null;
  brandHQId?: string | null;
  branchId?: string | null;
  corporateId?: string | null;
}

export const RealtimeRooms = {
  platform: 'platform:superadmin',
  user: (userType: string, userId: string) => `user:${userType}:${userId}`,
  distributor: (distributorId: string) => `tenant:distributor:${distributorId}`,
  brand: (brandHqId: string) => `tenant:brand:${brandHqId}`,
  branch: (branchId: string) => `tenant:branch:${branchId}`,
  corporate: (corporateId: string) => `tenant:corporate:${corporateId}`,
  edgePos: (edgePosId: string) => `edgepos:${edgePosId}`,
} as const;

export function roomsForTenantContext(context?: RealtimeTenantScope | null): string[] {
  const rooms: string[] = [];
  if (!context) return rooms;
  if (context.distributorId) rooms.push(RealtimeRooms.distributor(context.distributorId));
  if (context.brandHQId) rooms.push(RealtimeRooms.brand(context.brandHQId));
  if (context.branchId) rooms.push(RealtimeRooms.branch(context.branchId));
  if (context.corporateId) rooms.push(RealtimeRooms.corporate(context.corporateId));
  return Array.from(new Set(rooms));
}

export function roomsForUser(user: JwtPayload): string[] {
  const rooms = [RealtimeRooms.user(user.userType, user.sub)];

  if (user.userType === 'SUPER_ADMIN') {
    rooms.push(RealtimeRooms.platform);
    return rooms;
  }

  return Array.from(new Set([...rooms, ...roomsForTenantContext(user.tenantContext)]));
}
