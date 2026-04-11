'use client';
import { useEffect } from 'react';
import { useAppStore } from '@/store/useAppStore';
import SettingsView from '@/components/views/SettingsView';
export default function Page() {
  const { setView } = useAppStore();
  useEffect(() => { setView('settings' as any); }, []);
  return <SettingsView />;
}
