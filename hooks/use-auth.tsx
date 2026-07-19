"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type { User } from "firebase/auth";
import { ensureSignedIn, isFirebaseConfigured } from "@/lib/firebase";

interface AuthState {
  user: User | null;
  uid: string | null;
  /** True once we know the auth status (signed in or config missing). */
  ready: boolean;
  /** False when Firebase env vars are missing (app runs in preview mode). */
  configured: boolean;
}

const AuthContext = createContext<AuthState>({
  user: null,
  uid: null,
  ready: false,
  configured: false,
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    uid: null,
    ready: false,
    configured: isFirebaseConfigured(),
  });

  useEffect(() => {
    if (!isFirebaseConfigured()) {
      setState({ user: null, uid: null, ready: true, configured: false });
      return;
    }
    const unsub = ensureSignedIn((user) => {
      setState({
        user,
        uid: user?.uid ?? null,
        ready: true,
        configured: true,
      });
    });
    return () => unsub();
  }, []);

  return <AuthContext.Provider value={state}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthState {
  return useContext(AuthContext);
}
