import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isAdmin: boolean;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  isAdmin: false,
  loading: true,
});

export const useAuth = () => useContext(AuthContext);

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setLoading(false);
      return;
    }

    const checkAdminStatus = async (userId: string) => {
      try {
        const { data, error } = await supabase
          .from('admin_users')
          .select('*')
          .eq('user_id', userId)
          .single();
        
        if (error || !data) {
          setIsAdmin(false);
        } else {
          setIsAdmin(true);
        }
      } catch (err) {
        setIsAdmin(false);
      }
    };

    const initializeAuth = async () => {
      try {
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        
        if (currentSession?.user) {
          await checkAdminStatus(currentSession.user.id);
        } else {
          setIsAdmin(false);
        }
      } catch (err) {
        console.error('Error initializing auth:', err);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    let subscription: { unsubscribe: () => void } | null = null;
    try {
      const { data } = supabase.auth.onAuthStateChange(async (_event, newSession) => {
        setLoading(true);
        setSession(newSession);
        setUser(newSession?.user ?? null);
        
        if (newSession?.user) {
          await checkAdminStatus(newSession.user.id);
        } else {
          setIsAdmin(false);
        }
        setLoading(false);
      });
      subscription = data.subscription;
    } catch (err) {
      console.error('Error setting up auth state listener:', err);
    }

    return () => {
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, session, isAdmin, loading }}>
      {children}
    </AuthContext.Provider>
  );
}
