import { GraphQLOperation, SyncEventConnection } from '../types.js';
export interface SyncEventConnectionVariables {
    edgePosId?: string;
    eventType?: string;
    dateFrom?: string;
    dateTo?: string;
    after?: string;
    first?: number;
}
export interface SyncEventConnectionData {
    syncEventConnection: SyncEventConnection;
}
export declare const syncEventConnectionOperation: GraphQLOperation<SyncEventConnectionData, SyncEventConnectionVariables>;
