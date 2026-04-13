import { DesignViewer } from '@screens/designVmeal/DesignViewer';

interface Props {
  params: Promise<{ screenId: string }>;
}

export default async function VmealScreenPage({ params }: Props) {
  const { screenId } = await params;
  return <DesignViewer screenId={screenId} />;
}
