import { RealtimeRooms, roomsForTenantContext } from '../realtime-rooms';
import type { RealtimeAudience } from './realtime-audience.types';

export function resolveRoomsForAudience(audience: RealtimeAudience): string[] {
  switch (audience.kind) {
    case 'platform':
      return [RealtimeRooms.platform];
    case 'user':
      return [RealtimeRooms.user(audience.userType, audience.userId)];
    case 'tenant':
      return roomsForTenantContext(audience.tenant);
    case 'edgePos':
      return [RealtimeRooms.edgePos(audience.edgePosId)];
    case 'rooms':
      return Array.from(new Set(audience.rooms.filter(Boolean)));
    default:
      return [];
  }
}

