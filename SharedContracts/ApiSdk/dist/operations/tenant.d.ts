import { BrandProfile, Branch, DistributorProfile, EdgePosTerminal, GraphQLOperation } from '../types.js';
export interface DistributorsQueryVariables {
    skip?: number;
    take?: number;
}
export type DistributorsQueryData = DistributorProfile[];
export declare const distributorsOperation: GraphQLOperation<DistributorsQueryData, DistributorsQueryVariables>;
export interface BrandsQueryVariables {
    distributorId?: string;
    skip?: number;
    take?: number;
}
export type BrandsQueryData = BrandProfile[];
export declare const brandsOperation: GraphQLOperation<BrandsQueryData, BrandsQueryVariables>;
export interface BranchesQueryVariables {
    brandHQId: string;
    skip?: number;
    take?: number;
}
export type BranchesQueryData = Branch[];
export declare const branchesOperation: GraphQLOperation<BranchesQueryData, BranchesQueryVariables>;
export interface BranchQueryVariables {
    id: string;
}
export type BranchQueryData = Branch | null;
export declare const branchOperation: GraphQLOperation<BranchQueryData, BranchQueryVariables>;
export interface EdgePosTerminalsQueryVariables {
    branchId: string;
    skip?: number;
    take?: number;
}
export type EdgePosTerminalsQueryData = EdgePosTerminal[];
export declare const edgePosTerminalsOperation: GraphQLOperation<EdgePosTerminalsQueryData, EdgePosTerminalsQueryVariables>;
export interface EdgePosTerminalQueryVariables {
    id: string;
}
export type EdgePosTerminalQueryData = EdgePosTerminal | null;
export declare const edgePosTerminalOperation: GraphQLOperation<EdgePosTerminalQueryData, EdgePosTerminalQueryVariables>;
