import { DeployPackage, DeployRelease, GraphQLOperation } from '../types.js';
export interface DeployPackagesQueryVariables {
    skip?: number;
    take?: number;
}
export interface DeployPackagesQueryData {
    deployPackages: DeployPackage[];
}
export declare const deployPackagesOperation: GraphQLOperation<DeployPackagesQueryData, DeployPackagesQueryVariables>;
export interface DeployReleasesQueryVariables {
    scopeType: string;
    scopeId: string;
    skip?: number;
    take?: number;
}
export interface DeployReleasesQueryData {
    deployReleases: DeployRelease[];
}
export declare const deployReleasesOperation: GraphQLOperation<DeployReleasesQueryData, DeployReleasesQueryVariables>;
export interface DeployReleaseQueryVariables {
    id: string;
}
export interface DeployReleaseQueryData {
    deployRelease?: DeployRelease | null;
}
export declare const deployReleaseOperation: GraphQLOperation<DeployReleaseQueryData, DeployReleaseQueryVariables>;
