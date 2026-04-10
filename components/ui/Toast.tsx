// components/ui/Toast.tsx — Global toast notification
'use client';
import { useEffect, useState } from 'react';

type ToastType = 'ok' | 'err' | 'info';
interface ToastMsg { msg: string; type: ToastType; id: number; }

let _showToast: ((msg: string, type?: ToastType) => void) | null = null;
export function showToast(msg: string, type: ToastType = 'ok') { _showToast?.(msg, type); }

export default function Toast() {
  const [toasts, setToasts] = useState<ToastMsg[]>([]);
  useEffect(() => {
    _showToast = (msg, type = 'ok') => {
      const id = Date.now();
      setToasts(prev => [...prev.slice(-2), { msg, type, id }]);
      setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 2800);
    };
    return () => { _showToast = null; };
  }, []);
  return (
    <>
      {toasts.map(t => (
        <div key={t.id} className={`toast t${t.type}`}>{t.msg}</div>
      ))}
    </>
  );
}
