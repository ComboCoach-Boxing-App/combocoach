import React, { createContext, useContext, useEffect, useState } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from '../utils/supabase';
import { useAppStore } from '../store/useAppStore';

type AuthContextType = {
  session: Session | null;
  user: User | null;
  isGuest: boolean;
  signInAsGuest: () => void;
  signOut: () => Promise<void>;
  loading: boolean;
};

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  isGuest: false,
  signInAsGuest: () => {},
  signOut: async () => {},
  loading: true,
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isGuest, setIsGuest] = useState<boolean>(() => {
    return localStorage.getItem('boxing_app_guest') === 'true';
  });
  const [loading, setLoading] = useState(true);
  const setSupabaseUser = useAppStore(state => state.setSupabaseUser);

  useEffect(() => {
    // Fetch active session on mount
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        setIsGuest(false);
        localStorage.removeItem('boxing_app_guest');
        setSupabaseUser(session.user.id);
      } else {
        setSupabaseUser(null);
      }
      setLoading(false);
    });

    // Listen to Auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        setIsGuest(false);
        localStorage.removeItem('boxing_app_guest');
        setSupabaseUser(session.user.id);
      } else {
        setSupabaseUser(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signInAsGuest = () => {
    setIsGuest(true);
    localStorage.setItem('boxing_app_guest', 'true');
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setIsGuest(false);
    localStorage.removeItem('boxing_app_guest');
  };

  const value = {
    session,
    user,
    isGuest,
    signInAsGuest,
    signOut,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
