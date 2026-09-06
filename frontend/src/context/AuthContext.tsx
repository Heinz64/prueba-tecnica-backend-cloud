import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';

interface Session {
  token: string;
  role: 'admin' | 'user';
  rut?: string;
}

interface AuthContextValue {
  session: Session | null;
  setSession: (session: Session | null) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const STORAGE_KEY = 'riesgo-financiero:session';

function loadStoredSession(): Session | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Session) : null;
  } catch {
    return null;
  }
}

function persistSession(session: Session | null): void {
  try {
    if (session) localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    else localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* localStorage no disponible: la sesion no persiste entre recargas, pero la app sigue funcionando */
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSessionState] = useState<Session | null>(() => loadStoredSession());

  const setSession = (next: Session | null) => {
    setSessionState(next);
    persistSession(next);
  };

  const value = useMemo<AuthContextValue>(
    () => ({ session, setSession, logout: () => setSession(null) }),
    [session],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de <AuthProvider>');
  return ctx;
}
