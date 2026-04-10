'use client';
import { useEffect } from 'react';
import { useAppStore } from '@/store/useAppStore';
import LogView from '@/components/views/LogView';
export default function Page() {
  const { setView } = useAppStore();
  useEffect(() => { setView('log' as any); }, []);
  return <LogView />;
}
