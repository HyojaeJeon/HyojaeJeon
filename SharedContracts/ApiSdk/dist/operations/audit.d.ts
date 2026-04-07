import { AuditLogConnection, GraphQLOperation } from '../types.js';
export interface AuditLogConnectionVariables {
    actorType?: string;
    actorId?: string;
    actionType?: string;
    targetType?: string;
    targetId?: string;
    dateFrom?: string;
    dateTo?: string;
    after?: string;
    first?: number;
}
export interface AuditLogConnectionData {
    auditLogConnection: AuditLogConnection;
}
export declare const auditLogConnectionOperation: GraphQLOperation<AuditLogConnectionData, AuditLogConnectionVariables>;
