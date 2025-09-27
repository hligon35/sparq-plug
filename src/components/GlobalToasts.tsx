"use client";
import { ToastContainer, useToasts, ToastMessage } from '@/components/ui/Toast';
import { createContext, useContext, useMemo } from 'react';

interface ToastCtx {
  push: (msg: Omit<ToastMessage, 'id'>) => void;
}

const ToastContext = createContext<ToastCtx | undefined>(undefined);

export function GlobalToastProvider({ children }: { children: React.ReactNode }) {
  const { messages, push, remove } = useToasts();
  const value = useMemo(() => ({ push }), [push]);
  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastContainer messages={messages} onRemove={remove} />
    </ToastContext.Provider>
  );
}

export function useGlobalToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useGlobalToast must be used within GlobalToastProvider');
  return ctx;
}
