'use client';
import { useEffect } from 'react';
import { useAppStore } from '@/store/useAppStore';
import GrafikView from '@/components/views/GrafikView';
export default function Page() {
  const { setView } = useAppStore();
  useEffect(() => { setView('grafik' as any); }, []);
  return <GrafikView />;
}
