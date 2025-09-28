"use client";
import React, { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';

export interface UserSession {
  id: string;
  email: string;
  role: 'admin' | 'manager' | 'client';
  name?: string | null;
  company?: string | null;
  createdAt: string;
}

interface Ctx {
  user: UserSession | null | undefined; // undefined = loading
  refresh: () => Promise<void>;
  logout: () => Promise<void>;
  isLoading: boolean;
}

const SessionContext = createContext<Ctx | undefined>(undefined);

export function UserSessionProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserSession | null | undefined>(undefined);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/auth/me', { credentials: 'include' });
      const data = await res.json();
      setUser(data.user);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const logout = useCallback(async () => {
    try { await fetch('/api/auth/logout', { method: 'POST' }); } catch {}
    setUser(null);
  }, []);

  return (
    <SessionContext.Provider value={{ user, refresh: load, logout, isLoading: loading }}>
      {children}
    </SessionContext.Provider>
  );
}

export function useUserSession() {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error('useUserSession must be used within UserSessionProvider');
  return ctx;
}
