import {
  branchScopeWhere,
  brandScopeWhere,
  distributorScopeWhere,
  sanitizePolicyScopeChain,
} from './tenant-scope';
import { RoleCode } from '../../modules/auth/constants/roles.constant';

describe('tenant-scope helpers', () => {
  it('builds distributor-scoped brand filters for distributor admins', () => {
    expect(
      brandScopeWhere({
        sub: 'u1',
        loginId: 'dist-admin',
        roleCode: RoleCode.REGIONAL_DISTRIBUTOR_ADMIN,
        userType: 'ChannelUser',
        tenantContext: { distributorId: 'dist-1' },
      }),
    ).toEqual({ distributorId: 'dist-1' });
  });

  it('builds brand-scoped branch filters for brand admins', () => {
    expect(
      branchScopeWhere({
        sub: 'u2',
        loginId: 'brand-admin',
        roleCode: RoleCode.BRAND_HQ_ADMIN,
        userType: 'ChannelUser',
        tenantContext: { distributorId: 'dist-1', brandHQId: 'brand-1' },
      }),
    ).toEqual({ brandHQId: 'brand-1' });
  });

  it('limits distributor visibility to the caller distributor', () => {
    expect(
      distributorScopeWhere({
        sub: 'u3',
        loginId: 'dist-admin',
        roleCode: RoleCode.REGIONAL_DISTRIBUTOR_ADMIN,
        userType: 'ChannelUser',
        tenantContext: { distributorId: 'dist-1' },
      }),
    ).toEqual({ id: 'dist-1' });
  });

  it('sanitizes effective policy scope chains for tenant-scoped users', () => {
    expect(
      sanitizePolicyScopeChain(
        {
          sub: 'u4',
          loginId: 'branch-manager',
          roleCode: RoleCode.BRANCH_MANAGER,
          userType: 'ChannelUser',
          tenantContext: {
            distributorId: 'dist-1',
            brandHQId: 'brand-1',
            branchId: 'branch-1',
          },
        },
        'Branch',
        {
          RegionalDistributor: 'dist-999',
          BrandHQ: 'brand-999',
          Branch: 'branch-999',
          EdgePos: 'edge-1',
        },
      ),
    ).toEqual({
      RegionalDistributor: 'dist-1',
      BrandHQ: 'brand-999',
      Branch: 'branch-1',
      EdgePos: 'edge-1',
    });
  });
});
