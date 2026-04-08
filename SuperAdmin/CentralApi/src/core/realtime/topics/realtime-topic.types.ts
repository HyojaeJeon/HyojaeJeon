import type { RealtimeAudience } from '../audience/realtime-audience.types';

export interface RealtimeTopicDefinition<TPayload = unknown> {
  name: string;
  audience: RealtimeAudience;
  description?: string;
}
