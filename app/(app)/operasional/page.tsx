'use client';
import { useEffect } from 'react';
import { useAppStore } from '@/store/useAppStore';
import OperasionalView from '@/components/views/OperasionalView';
export default function Page() {
  const { setView } = useAppStore();
  useEffect(() => { setView('operasional' as any); }, []);
  return <OperasionalView />;
}
