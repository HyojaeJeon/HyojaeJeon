import { resolveRoomsForAudience } from './realtime-audience.policy';
import { RealtimeRooms } from '../realtime-rooms';

describe('resolveRoomsForAudience', () => {
  it('resolves platform audience to platform room', () => {
    expect(resolveRoomsForAudience({ kind: 'platform' })).toEqual([RealtimeRooms.platform]);
  });

  it('resolves tenant audience to unique tenant rooms', () => {
    expect(
      resolveRoomsForAudience({
        kind: 'tenant',
        tenant: {
          distributorId: 'dist-1',
          brandHQId: 'brand-1',
          branchId: 'branch-1',
          corporateId: 'corp-1',
        },
      }),
    ).toEqual([
      RealtimeRooms.distributor('dist-1'),
      RealtimeRooms.brand('brand-1'),
      RealtimeRooms.branch('branch-1'),
      RealtimeRooms.corporate('corp-1'),
    ]);
  });

  it('deduplicates explicit rooms audiences', () => {
    expect(resolveRoomsForAudience({ kind: 'rooms', rooms: ['a', 'a', 'b'] })).toEqual([
      'a',
      'b',
    ]);
  });
});
