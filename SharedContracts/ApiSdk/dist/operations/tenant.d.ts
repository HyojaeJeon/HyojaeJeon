import { BrandProfile, Branch, DistributorProfile, EdgePosTerminal, GraphQLOperation } from '../types.js';
export interface DistributorsQueryVariables {
    skip?: number;
    take?: number;
}
export interface DistributorsQueryData {
    distributors: DistributorProfile[];
}
export declare const distributorsOperation: GraphQLOperation<DistributorsQueryData, DistributorsQueryVariables>;
export interface BrandsQueryVariables {
    distributorId?: string;
    skip?: number;
    take?: number;
}
export interface BrandsQueryData {
    brands: BrandProfile[];
}
export declare const brandsOperation: GraphQLOperation<BrandsQueryData, BrandsQueryVariables>;
export interface BranchesQueryVariables {
    brandHQId: string;
    skip?: number;
    take?: number;
}
export interface BranchesQueryData {
    branches: Branch[];
}
export declare const branchesOperation: GraphQLOperation<BranchesQueryData, BranchesQueryVariables>;
export interface BranchQueryVariables {
    id: string;
}
export interface BranchQueryData {
    branch?: Branch | null;
}
export declare const branchOperation: GraphQLOperation<BranchQueryData, BranchQueryVariables>;
export interface EdgePosTerminalsQueryVariables {
    branchId: string;
    skip?: number;
    take?: number;
}
export interface EdgePosTerminalsQueryData {
    edgePosTerminals: EdgePosTerminal[];
}
export declare const edgePosTerminalsOperation: GraphQLOperation<EdgePosTerminalsQueryData, EdgePosTerminalsQueryVariables>;
export interface EdgePosTerminalQueryVariables {
    id: string;
}
export interface EdgePosTerminalQueryData {
    edgePosTerminal?: EdgePosTerminal | null;
}
export declare const edgePosTerminalOperation: GraphQLOperation<EdgePosTerminalQueryData, EdgePosTerminalQueryVariables>;
