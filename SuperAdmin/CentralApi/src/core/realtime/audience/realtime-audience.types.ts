import type { RealtimeTenantScope } from '../realtime-rooms';

export type RealtimeAudience =
  | { kind: 'platform' }
  | { kind: 'user'; userType: string; userId: string }
  | { kind: 'tenant'; tenant: RealtimeTenantScope }
  | { kind: 'edgePos'; edgePosId: string }
  | { kind: 'rooms'; rooms: string[] };

