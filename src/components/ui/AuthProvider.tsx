'use client';

import { createClient } from '@/lib/supabase/client';
import { useRouter, usePathname } from 'next/navigation';
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import type { SupabaseClient, User as SupabaseUser } from '@supabase/supabase-js';

// Interfaz para nuestro usuario combinado (auth + perfil de la tabla 'users')
interface User extends SupabaseUser {
  full_name: string | null;
  avatar_url: string | null;
  role: 'student' | 'professor' | 'admin';
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
  supabase: SupabaseClient;
  refreshUser: () => Promise<void>; // ⬅️ Nueva función para refrescar el usuario
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();
  const supabase = createClient();

  // Función para cargar el perfil del usuario
  const loadUserProfile = async (authUser: SupabaseUser): Promise<User | null> => {
    try {
      const { data: profile, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', authUser.id)
        .single();

      if (error) {
        console.error('Error loading user profile:', error);
        return null;
      }

      return { ...authUser, ...profile } as User;
    } catch (error) {
      console.error('Exception loading user profile:', error);
      return null;
    }
  };

  // Función para refrescar el usuario
  const refreshUser = async () => {
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      
      if (authUser) {
        const fullUser = await loadUserProfile(authUser);
        setUser(fullUser);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('Error refreshing user:', error);
      setUser(null);
    }
  };

  // Cargar usuario inicial
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Primero intentamos obtener la sesión actual
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          const fullUser = await loadUserProfile(session.user);
          setUser(fullUser);
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    // Suscribirse a cambios de autenticación
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event);

        if (event === 'SIGNED_IN' && session?.user) {
          const fullUser = await loadUserProfile(session.user);
          setUser(fullUser);
          
          // Si estamos en login o register, redirigir al dashboard
          if (pathname === '/login' || pathname === '/register') {
            router.push('/dashboard');
            router.refresh();
          }
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          router.push('/login');
          router.refresh();
        } else if (event === 'TOKEN_REFRESHED' && session?.user) {
          // Refrescar el perfil cuando se refresca el token
          const fullUser = await loadUserProfile(session.user);
          setUser(fullUser);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase, router, pathname]);

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      router.push('/login');
      router.refresh();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const value = {
    user,
    loading,
    signOut,
    supabase,
    refreshUser,
  };

  // NO bloqueamos el renderizado con un loading screen global
  // Los componentes individuales manejarán su propio estado de carga
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}