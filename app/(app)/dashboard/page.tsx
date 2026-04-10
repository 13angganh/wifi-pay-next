'use client';
import { useEffect } from 'react';
import { useAppStore } from '@/store/useAppStore';
import DashboardView from '@/components/views/DashboardView';
export default function DashboardPage() {
  const { setView } = useAppStore();
  useEffect(()=>{ setView('dashboard'); },[]);
  return <DashboardView />;
}
