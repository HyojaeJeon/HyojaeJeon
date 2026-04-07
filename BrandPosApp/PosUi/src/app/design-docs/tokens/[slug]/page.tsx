export const dynamicParams = false;

export function generateStaticParams() {
  return [
    { slug: 'colors' },
    { slug: 'spacing' },
    { slug: 'typography' },
    { slug: 'shadows' },
  ];
}

export default async function TokenPreview({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  return (
    <div className="w-full h-full bg-white flex flex-col overflow-hidden">
      <div className="px-10 pt-8 pb-0 shrink-0">
        <h1 className="text-xl font-bold text-gray-900 capitalize">{slug}</h1>
        <p className="text-sm text-gray-400 mt-1">Design Token — {slug}</p>
      </div>
      <div className="flex-1 flex items-center justify-center p-8">
        <p className="text-sm text-gray-400">준비 중인 토큰 페이지입니다.</p>
      </div>
    </div>
  );
}
