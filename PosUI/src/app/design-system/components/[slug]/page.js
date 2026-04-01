import ComponentPreviewClient from '../ComponentPreviewClient';

export const dynamicParams = false;

export function generateStaticParams() {
  return [
    { slug: 'button' },
    { slug: 'input' },
    { slug: 'badge' },
    { slug: 'table-card' },
    { slug: 'menu-card' },
    { slug: 'order-sidebar' },
    { slug: 'takeout-bar' },
  ];
}

export default async function ComponentPreview({ params }) {
  const { slug } = await params;
  return <ComponentPreviewClient slug={slug} />;
}
