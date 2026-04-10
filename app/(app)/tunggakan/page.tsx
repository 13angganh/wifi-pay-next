'use client';
import { useEffect } from 'react';
import { useAppStore } from '@/store/useAppStore';
import TunggakanView from '@/components/views/TunggakanView';
export default function Page() {
  const { setView } = useAppStore();
  useEffect(() => { setView('tunggakan' as any); }, []);
  return <TunggakanView />;
}
