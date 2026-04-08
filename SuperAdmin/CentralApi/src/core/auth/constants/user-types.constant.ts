export const AUTH_USER_TYPES = [
  'SUPER_ADMIN',
  'DISTRIBUTOR_USER',
  'BRAND_ADMIN',
  'CORPORATE_ADMIN',
] as const;

export type AuthUserType = (typeof AUTH_USER_TYPES)[number];

export const DEFAULT_AUTH_USER_TYPE: AuthUserType = 'SUPER_ADMIN';

export function isAuthUserType(value: string): value is AuthUserType {
  return (AUTH_USER_TYPES as readonly string[]).includes(value);
}
