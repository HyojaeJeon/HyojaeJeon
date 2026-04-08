import {
  branchScopeWhere,
  brandScopeWhere,
  distributorScopeWhere,
  sanitizePolicyScopeChain,
} from './tenant-scope';

describe('tenant-scope helpers', () => {
  it('builds distributor-scoped brand filters when only distributorId is in tenant context', () => {
    expect(
      brandScopeWhere({
        sub: 'u1',
        loginId: 'dist-admin',
        userType: 'DISTRIBUTOR_USER',
        tenantContext: { distributorId: 'dist-1' },
      }),
    ).toEqual({ distributorId: 'dist-1' });
  });

  it('builds brand-scoped branch filters when brandHQId is in tenant context', () => {
    expect(
      branchScopeWhere({
        sub: 'u2',
        loginId: 'brand-admin',
        userType: 'BRAND_ADMIN',
        tenantContext: { distributorId: 'dist-1', brandHQId: 'brand-1' },
      }),
    ).toEqual({ brandHQId: 'brand-1' });
  });

  it('limits distributor visibility to the caller distributor', () => {
    expect(
      distributorScopeWhere({
        sub: 'u3',
        loginId: 'dist-admin',
        userType: 'DISTRIBUTOR_USER',
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
          userType: 'BRAND_ADMIN',
          tenantContext: {
            distributorId: 'dist-1',
            brandHQId: 'brand-1',
            branchId: 'branch-1',
          },
        },
        'BRANCH',
        {
          REGIONAL_DISTRIBUTOR: 'dist-999',
          BRAND_HQ: 'brand-999',
          BRANCH: 'branch-999',
          EDGE_POS: 'edge-1',
        },
      ),
    ).toEqual({
      REGIONAL_DISTRIBUTOR: 'dist-1',
      BRAND_HQ: 'brand-1',
      BRANCH: 'branch-1',
      EDGE_POS: 'edge-1',
    });
  });
});
