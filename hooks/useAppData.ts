// ══════════════════════════════════════════
// hooks/useAppData.ts — Firebase realtime listener
// ══════════════════════════════════════════
'use client';

import { useEffect, useRef } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { listenDB, saveDB, DEFAULT_APP_DATA } from '@/lib/db';
import { AppData, ActivityLog } from '@/types';

export function useAppData() {
  const { uid, userEmail, setAppData, setSyncStatus, setGlobalLocked, setLockedEntries } = useAppStore();
  const unsubRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (!uid) {
      // Cleanup listener jika logout
      if (unsubRef.current) { unsubRef.current(); unsubRef.current = null; }
      return;
    }

    setSyncStatus('loading');

    const unsub = listenDB(
      uid,
      (data) => {
        setAppData(data);
        setSyncStatus('ok');
        // Lock state dari Firebase
        if (data._globalLocked !== undefined) setGlobalLocked(data._globalLocked);
        if (data._lockedEntries)              setLockedEntries(data._lockedEntries);
      },
      () => setSyncStatus('err'),
      (globalLocked, lockedEntries) => {
        setGlobalLocked(globalLocked);
        setLockedEntries(lockedEntries);
      }
    );

    unsubRef.current = unsub;
    return () => { unsub(); unsubRef.current = null; };
  }, [uid]);
}

// ── Save helper yang bisa dipanggil dari komponen mana saja ──
export async function saveAppData(
  uid: string,
  data: AppData,
  logEntry?: Omit<ActivityLog, 'ts' | 'user'>,
  userEmail?: string,
  onStatus?: (s: 'loading' | 'ok' | 'err') => void
): Promise<void> {
  onStatus?.('loading');
  try {
    await saveDB(uid, data, logEntry, userEmail);
    onStatus?.('ok');
  } catch {
    onStatus?.('err');
  }
}
