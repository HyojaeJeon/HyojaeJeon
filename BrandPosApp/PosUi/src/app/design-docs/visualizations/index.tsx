'use client';

import dynamic from 'next/dynamic';
import { ComponentType } from 'react';

const PlatformTierDiagram = dynamic(() => import('./PlatformTierDiagram'), { ssr: false });
const EdgePosLayerDiagram = dynamic(() => import('./EdgePosLayerDiagram'), { ssr: false });
const DataFlowDiagram = dynamic(() => import('./DataFlowDiagram'), { ssr: false });
const FeatureCoverageMatrix = dynamic(() => import('./FeatureCoverageMatrix'), { ssr: false });
const MultiTenancyDiagram = dynamic(() => import('./MultiTenancyDiagram'), { ssr: false });
const DbDomainDiagram = dynamic(() => import('./DbDomainDiagram'), { ssr: false });
const ImplementationTimeline = dynamic(() => import('./ImplementationTimeline'), { ssr: false });
const AiFeaturesPriorityChart = dynamic(() => import('./AiFeaturesPriorityChart'), { ssr: false });
const ChecklistProgress = dynamic(() => import('./ChecklistProgress'), { ssr: false });
const RevenueModelDiagram = dynamic(() => import('./RevenueModelDiagram'), { ssr: false });
const MarketEntryTimeline = dynamic(() => import('./MarketEntryTimeline'), { ssr: false });
const AzFlowCards = dynamic(() => import('./AzFlowCards'), { ssr: false });

/**
 * Registry: maps `docSlug.sectionKey` → visualization component.
 * The DocsPageClient renders these ABOVE the markdown content for matched sections.
 */
export const visualizationRegistry: Record<string, ComponentType> = {
  // Platform Architecture
  'platform-architecture.full_stack_overview': PlatformTierDiagram,
  'platform-architecture.standard_layers': MultiTenancyDiagram,

  // SuperAdmin
  'superadmin-design.multitenancy_model': MultiTenancyDiagram,
  'superadmin-design.platform_overview': PlatformTierDiagram,

  // Edge POS Architecture
  'edgepos-architecture.layer_summary': EdgePosLayerDiagram,
  'edgepos-architecture.communication_design': DataFlowDiagram,

  // Edge POS A-Z Guide
  'edgepos-az-guide.overall_flow': EdgePosLayerDiagram,
  'edgepos-az-guide.points_a_to_j': AzFlowCards,

  // Checklist
  'edgepos-checklist.p0_layer_boundaries': ChecklistProgress,

  // Innovation
  'innovation-framework.ai_13_features': AiFeaturesPriorityChart,
  'innovation-framework.implementation_order': ImplementationTimeline,

  // Feature Coverage
  'feature-coverage-matrix.coverage_table': FeatureCoverageMatrix,

  // DB Design
  'db-table-master.structure': DbDomainDiagram,
  'db-shared-reference.purpose': DbDomainDiagram,

  // Business Model
  'business-model.revenue_tiers': RevenueModelDiagram,

  // Target Market
  'target-market.entry_strategy': MarketEntryTimeline,
};
