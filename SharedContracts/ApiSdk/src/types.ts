/**
 * 한국어: 표준 success / error 응답 shape — public contract.
 *   서버 내부 i18n metadata (msgKey / params / locale) 는 절대 노출하지 않는다.
 *   모든 GraphQL Query / Mutation 은 OperationResponse<T> 형태로 반환되며,
 *   정확히 success 또는 error 중 하나만 set 된다.
 *
 * Tiếng Việt: Public contract chuẩn — không lộ msgKey / params / locale của server.
 */
export interface SuccessPayload<TData> {
  code: string;
  message: string;
  requestId?: string | null;
  data: TData;
}

export interface ErrorPayload {
  code: string;
  message: string;
  requestId?: string | null;
  details?: Record<string, unknown> | null;
}

export interface OperationResponse<TData> {
  success?: SuccessPayload<TData> | null;
  error?: ErrorPayload | null;
}

/**
 * 한국어: GraphQL transport-level fault (parsing / auth / system) 만 errors 배열에 들어간다.
 *   business success / failure 는 OperationResponse 로만 통신한다.
 */
export interface GraphQLTransportError {
  message: string;
  path?: Array<string | number>;
  extensions?: { code?: string };
}

export interface GraphQLOperation<TData, TVariables> {
  operationName: string;
  document: string;
}

export type AuthUserType =
  | 'SUPER_ADMIN'
  | 'DISTRIBUTOR_USER'
  | 'BRAND_ADMIN'
  | 'CORPORATE_ADMIN';

export type Maybe<T> = T | null;

export interface PageInfo {
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  startCursor?: string | null;
  endCursor?: string | null;
}

export interface AuditLog {
  id: string;
  actorType: string;
  actorId?: string | null;
  actionType: string;
  targetType: string;
  targetId?: string | null;
  requestId?: string | null;
  beforeDataJson?: unknown | null;
  afterDataJson?: unknown | null;
  ipAddress?: string | null;
  userAgent?: string | null;
  createdAt: string;
}

export interface AuditLogEdge {
  cursor: string;
  node: AuditLog;
}

export interface AuditLogConnection {
  edges: AuditLogEdge[];
  nodes: AuditLog[];
  pageInfo: PageInfo;
  totalCount: number;
}

export interface SyncEvent {
  id: string;
  edgePosId: string;
  eventType: string;
  requestId?: string | null;
  payloadJson?: unknown | null;
  createdAt: string;
}

export interface SyncEventEdge {
  cursor: string;
  node: SyncEvent;
}

export interface SyncEventConnection {
  edges: SyncEventEdge[];
  nodes: SyncEvent[];
  pageInfo: PageInfo;
  totalCount: number;
}

export interface AuthAccount {
  id: string;
  loginId: string;
  displayName: string;
  email?: string | null;
  phone?: string | null;
  userType: AuthUserType;
  distributorId?: string | null;
  brandHQId?: string | null;
  corporateId?: string | null;
  status: string;
  lastLoginAt?: string | null;
  passwordChangedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AuthPayload {
  accessToken: string;
  expiresIn: string;
  accessTokenExpiresAt: string;
  sessionExpiresAt: string;
  user: AuthAccount;
}

export type SuperAdminUser = AuthAccount;

export interface Language {
  id: string;
  languageCode: string;
  nativeName: string;
  displayName: string;
  direction: string;
  isDefault: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface DistributorProfile {
  id: string;
  distributorCode: string;
  companyName: string;
  legalName?: string | null;
  businessNumber?: string | null;
  countryCode: string;
  territoryName: string;
  defaultLanguageCode: string;
  status: string;
  contactName?: string | null;
  contactEmail?: string | null;
  contactPhone?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface BrandProfile {
  id: string;
  distributorId: string;
  brandCode: string;
  brandName: string;
  countryCode: string;
  defaultLanguageCode: string;
  businessNumber?: string | null;
  contactName?: string | null;
  contactEmail?: string | null;
  contactPhone?: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface Branch {
  id: string;
  brandHQId: string;
  distributorId: string;
  branchCode: string;
  branchName: string;
  branchType: string;
  countryCode: string;
  regionCode?: string | null;
  addressLine1?: string | null;
  addressLine2?: string | null;
  postalCode?: string | null;
  timeZoneCode: string;
  defaultLanguageCode: string;
  status: string;
  openingDate?: string | null;
  closingDate?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface EdgePosTerminal {
  id: string;
  branchId: string;
  terminalCode: string;
  terminalName: string;
  terminalRole: string;
  appVersion: string;
  dbVersion: string;
  status: string;
  lastSyncAt?: string | null;
  lastHeartbeatAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PlatformPolicy {
  id: string;
  policyKey: string;
  scopeType: string;
  scopeId?: string | null;
  policyValueJson: unknown;
  version: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface DeployPackage {
  id: string;
  packageCode: string;
  version: string;
  platformTarget: string;
  artifactUrl: string;
  checksum: string;
  releasedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface DeployRelease {
  id: string;
  packageId: string;
  scopeType: string;
  scopeId: string;
  releaseStatus: string;
  scheduledAt?: string | null;
  deployedAt?: string | null;
  rollbackPackageId?: string | null;
  releaseNote?: string | null;
  createdAt: string;
  updatedAt: string;
}
