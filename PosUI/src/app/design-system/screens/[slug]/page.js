import ScreenPreviewClient from '../ScreenPreviewClient';

export const dynamicParams = false;

export function generateStaticParams() {
  return [
    { slug: 'table' },
    { slug: 'order' },
    { slug: 'payment' },
  ];
}

export default async function ScreenPreview({ params }) {
  const { slug } = await params;
  return <ScreenPreviewClient slug={slug} />;
}
