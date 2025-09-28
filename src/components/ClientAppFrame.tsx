"use client";
import { ReactNode } from 'react';
import SparqyAssistant from '@/components/SparqyAssistant';

export default function ClientAppFrame({ children }: { children: ReactNode }) {
  return (
    <>
      {children}
      <SparqyAssistant />
    </>
  );
}
