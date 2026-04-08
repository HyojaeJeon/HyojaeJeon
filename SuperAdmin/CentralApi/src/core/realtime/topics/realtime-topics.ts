import type { RealtimeAudience } from '../audience/realtime-audience.types';
import type { RealtimeTopicDefinition } from './realtime-topic.types';

const topic = <TPayload>(
  name: string,
  audience: RealtimeAudience,
  description?: string,
): RealtimeTopicDefinition<TPayload> => ({
  name,
  audience,
  description,
});

export const RealtimeTopics = {
  platform: {
    superadmin: {
      auditCreated: <TPayload = unknown>() =>
        topic('platform.superadmin.audit.created', { kind: 'platform' }, 'SuperAdmin audit record created'),
      policyChanged: <TPayload = unknown>() =>
        topic('platform.superadmin.policy.changed', { kind: 'platform' }, 'SuperAdmin platform policy changed'),
      licenseChanged: <TPayload = unknown>() =>
        topic('platform.superadmin.license.changed', { kind: 'platform' }, 'SuperAdmin platform license changed'),
    },
  },
  brand: {
    profile: {
      changed: <TPayload = unknown>(brandHQId: string) =>
        topic('brand.profile.changed', { kind: 'tenant', tenant: { brandHQId } }, 'Brand profile changed'),
    },
    catalog: {
      changed: <TPayload = unknown>(brandHQId: string) =>
        topic('brand.catalog.changed', { kind: 'tenant', tenant: { brandHQId } }, 'Brand catalog changed'),
    },
    deploy: {
      released: <TPayload = unknown>(brandHQId: string) =>
        topic('brand.deploy.released', { kind: 'tenant', tenant: { brandHQId } }, 'Brand deploy released'),
    },
  },
  corporate: {
    profile: {
      changed: <TPayload = unknown>(corporateId: string) =>
        topic('corporate.profile.changed', { kind: 'tenant', tenant: { corporateId } }, 'Corporate profile changed'),
    },
    wallet: {
      changed: <TPayload = unknown>(corporateId: string) =>
        topic('corporate.wallet.changed', { kind: 'tenant', tenant: { corporateId } }, 'Corporate wallet changed'),
    },
    policy: {
      changed: <TPayload = unknown>(corporateId: string) =>
        topic('corporate.policy.changed', { kind: 'tenant', tenant: { corporateId } }, 'Corporate policy changed'),
    },
    transaction: {
      changed: <TPayload = unknown>(corporateId: string) =>
        topic('corporate.transaction.changed', { kind: 'tenant', tenant: { corporateId } }, 'Corporate transaction changed'),
    },
    settlement: {
      changed: <TPayload = unknown>(corporateId: string) =>
        topic('corporate.settlement.changed', { kind: 'tenant', tenant: { corporateId } }, 'Corporate settlement changed'),
    },
    merchant: {
      changed: <TPayload = unknown>(corporateId: string) =>
        topic('corporate.merchant.changed', { kind: 'tenant', tenant: { corporateId } }, 'Corporate merchant changed'),
    },
    einvoice: {
      changed: <TPayload = unknown>(corporateId: string) =>
        topic('corporate.einvoice.changed', { kind: 'tenant', tenant: { corporateId } }, 'Corporate e-invoice changed'),
    },
  },
  edgePos: {
    terminal: {
      changed: <TPayload = unknown>(edgePosId: string) =>
        topic('edgepos.terminal.changed', { kind: 'edgePos', edgePosId }, 'Edge POS terminal changed'),
    },
    runtime: {
      heartbeat: <TPayload = unknown>(edgePosId: string) =>
        topic('edgepos.runtime.heartbeat', { kind: 'edgePos', edgePosId }, 'Edge POS runtime heartbeat'),
      changed: <TPayload = unknown>(edgePosId: string) =>
        topic('edgepos.runtime.changed', { kind: 'edgePos', edgePosId }, 'Edge POS runtime changed'),
    },
  },
  sync: {
    upstream: {
      accepted: <TPayload = unknown>(edgePosId: string) =>
        topic('sync.upstream.accepted', { kind: 'edgePos', edgePosId }, 'Upstream sync accepted'),
      duplicate: <TPayload = unknown>(edgePosId: string) =>
        topic('sync.upstream.duplicate', { kind: 'edgePos', edgePosId }, 'Upstream sync duplicate detected'),
    },
  },
  cache: {
    invalidated: <TPayload = unknown>(audience: RealtimeAudience = { kind: 'platform' }) =>
      topic('cache.invalidated', audience, 'Cache invalidated'),
  },
} as const;
