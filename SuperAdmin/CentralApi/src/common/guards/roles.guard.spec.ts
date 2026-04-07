import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';
import { JwtPayload } from '../decorators/current-user.decorator';
import { RolesGuard } from './roles.guard';
import { RoleCode } from '../../modules/auth/constants/roles.constant';

describe('RolesGuard', () => {
  const reflector = {
    getAllAndOverride: jest.fn(),
  } as unknown as Reflector;

  const guard = new RolesGuard(reflector);

  function createContext(user?: JwtPayload): ExecutionContext {
    jest.spyOn(GqlExecutionContext, 'create').mockReturnValue({
      getContext: () => ({ req: { user } }),
    } as unknown as GqlExecutionContext);

    return {
      getHandler: jest.fn(),
      getClass: jest.fn(),
    } as unknown as ExecutionContext;
  }

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('allows requests when @Roles metadata is absent', () => {
    (reflector.getAllAndOverride as jest.Mock).mockReturnValue(undefined);

    const result = guard.canActivate(createContext());

    expect(result).toBe(true);
  });

  it('allows users whose role level satisfies the required minimum role', () => {
    (reflector.getAllAndOverride as jest.Mock).mockReturnValue([RoleCode.BRAND_HQ_ADMIN]);

    const result = guard.canActivate(
      createContext({
        sub: 'user-1',
        loginId: 'regional-admin',
        roleCode: RoleCode.REGIONAL_DISTRIBUTOR_ADMIN,
        userType: 'ChannelUser',
        tenantContext: { distributorId: 'dist-1' },
      }),
    );

    expect(result).toBe(true);
  });

  it('rejects users whose role level is below the required role', () => {
    (reflector.getAllAndOverride as jest.Mock).mockReturnValue([RoleCode.REGIONAL_DISTRIBUTOR_ADMIN]);

    const result = guard.canActivate(
      createContext({
        sub: 'user-2',
        loginId: 'branch-manager',
        roleCode: RoleCode.BRANCH_MANAGER,
        userType: 'ChannelUser',
        tenantContext: { branchId: 'branch-1' },
      }),
    );

    expect(result).toBe(false);
  });
});
