import type { CSSProperties } from 'react';
export interface SkeletonProps {
    width?: number | string;
    height?: number | string;
    radius?: number | string;
    style?: CSSProperties;
}
export declare function Skeleton({ width, height, radius, style }: SkeletonProps): import("react/jsx-runtime").JSX.Element;
