import DocsPageClient from './DocsPageClient';

export const dynamicParams = false;

export function generateStaticParams() {
  return [
    // 사업기획서
    { slug: 'business-overview' },
    { slug: 'business-model' },
    { slug: 'target-market' },
    { slug: 'roadmap' },
    // 차별화, 혁신
    { slug: 'innovation-framework' },
    // 프로젝트 통합설계
    { slug: 'platform-architecture' },
    { slug: 'superadmin-design' },
    { slug: 'distributor-design' },
    { slug: 'brandhq-design' },
    { slug: 'edgepos-architecture' },
    { slug: 'edgepos-az-guide' },
    { slug: 'edgepos-checklist' },
    { slug: 'mealticket-overview' },
    { slug: 'mealticket-corporate' },
    { slug: 'mealticket-merchant' },
    // 플랫폼 별 화면/기능리스트
    { slug: 'feature-coverage-matrix' },
    { slug: 'superadmin-features' },
    { slug: 'distributor-features' },
    { slug: 'brandhq-features' },
    { slug: 'edgepos-features' },
    { slug: 'screen-inventory' },
    // DB 설계
    { slug: 'db-table-master' },
    { slug: 'db-shared-reference' },
    { slug: 'db-superadmin-governance' },
    { slug: 'db-distributor-channel' },
    { slug: 'db-brandhq-master' },
    { slug: 'db-edgepos-core' },
  ];
}

export default async function DocsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <DocsPageClient slug={slug} />;
}
